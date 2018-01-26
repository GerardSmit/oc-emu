-------------------------------------------------------------------------------
-- Utility

local function checkArg(n, have, ...)
    have = type(have)

    local function check(want, ...)
        if not want then
            return false
        else
            return have == want or check(...)
        end
    end

    if not check(...) then
        local msg = string.format("bad argument #%d (%s expected, got %s)", n, table.concat({...}, " or "), have)
        error(msg, 3)
    end
end

local function spcall(...)
    local result = table.pack(pcall(...))

    if not result[1] then
        error(tostring(result[2]), 0)
    else
        return table.unpack(result, 2, result.n)
    end
end

-------------------------------------------------------------------------------
-- Sandbox

local sandbox = {
    assert = assert,
    dofile = nil, -- in boot/*_base.lua
    error = error,
    _G = nil, -- see below
    getmetatable = function(t)
        if type(t) == "string" then -- don't allow messing with the string mt
            return nil
        end
        local result = getmetatable(t)
        -- check if we have a wrapped __gc using mt
        if type(result) == "table" and system.allowGC() and rawget(result, "__gc") == sgc then
            result = rawget(result, "mt")
        end
        return result
    end,
    ipairs = ipairs,
    load = function(ld, source, mode, env)
        if not system.allowBytecode() then
            mode = "t"
        end
        return load(ld, source, mode, env or sandbox)
    end,
    loadfile = nil, -- in boot/*_base.lua
    next = next,
    pairs = pairs,
    pcall = function(...)
        local result = table.pack(pcall(...))
        -- TODO checkDeadline()
        return table.unpack(result, 1, result.n)
    end,
    print = nil, -- in boot/*_base.lua
    rawequal = rawequal,
    rawget = rawget,
    rawlen = rawlen,
    rawset = rawset,
    select = select,
    setmetatable = function(t, mt)
        if type(mt) ~= "table" then
            return setmetatable(t, mt)
        end

        if rawget(mt, "__gc") ~= nil then -- If __gc is set to ANYTHING not `nil`, we're gonna have issues
            -- Garbage collector callbacks apparently can't be sandboxed after
            -- all, because hooks are disabled while they're running. So we just
            -- disable them altogether by default.
            if system.allowGC() then
                -- For all user __gc functions we enforce a much tighter deadline.
                -- This is because these functions may be called from the main
                -- thread under certain circumstanced (such as when saving the world),
                -- which can lead to noticeable lag if the __gc function behaves badly.
                local sbmt = {} -- sandboxed metatable. only for __gc stuff, so it's
                    -- kinda ok to have a shallow copy instead... meh.
                for k, v in next, mt do
                    sbmt[k] = v
                end
                sbmt.__gc = sgc
                sbmt.mt = mt
                mt = sbmt
        else
            -- Don't allow marking for finalization, but use the raw metatable.
            local gc = rawget(mt, "__gc")
            rawset(mt, "__gc", nil) -- remove __gc
            local ret = table.pack(pcall(setmetatable, t, mt))
            rawset(mt, "__gc", gc) -- restore __gc

            if not ret[1] then error(ret[2], 0) end
                return table.unpack(ret, 2, ret.n)
            end
        end
        return setmetatable(t, mt)
    end,
    tonumber = tonumber,
    tostring = tostring,
    type = type,
    _VERSION = _VERSION:match("5.3") and "Lua 5.3" or "Lua 5.2",
    xpcall = function(f, msgh, ...)
        local handled = false
        local result = table.pack(xpcall(f, function(...)
            if handled then
                return ...
            else
                handled = true
                return msgh(...)
            end
        end, ...))
        -- TODO checkDeadline()
        return table.unpack(result, 1, result.n)
    end,

    coroutine = {
        create = coroutine.create,
        resume = function(co, ...) -- custom resume part for bubbling sysyields
            checkArg(1, co, "thread")
            local args = table.pack(...)
            while true do -- for consecutive sysyields
                debug.sethook(co, checkDeadline, "", hookInterval)
                local result = table.pack(
                coroutine.resume(co, table.unpack(args, 1, args.n)))
                debug.sethook(co) -- avoid gc issues
                checkDeadline()
                if result[1] then -- success: (true, sysval?, ...?)
                    if coroutine.status(co) == "dead" then -- return: (true, ...)
                        return true, table.unpack(result, 2, result.n)
                    elseif result[2] ~= nil then -- yield: (true, sysval)
                        args = table.pack(coroutine.yield(result[2]))
                    else -- yield: (true, nil, ...)
                        return true, table.unpack(result, 3, result.n)
                    end
                else -- error: result = (false, string)
                    return false, result[2]
                end
            end
        end,
        running = coroutine.running,
        status = coroutine.status,
        wrap = function(f) -- for bubbling coroutine.resume
            local co = coroutine.create(f)
            return function(...)
                local result = table.pack(sandbox.coroutine.resume(co, ...))
                if result[1] then
                    return table.unpack(result, 2, result.n)
                else
                    error(result[2], 0)
                end
            end
        end,
        yield = function(...) -- custom yield part for bubbling sysyields
            return coroutine.yield(nil, ...)
        end,
        -- Lua 5.3.
        isyieldable = coroutine.isyieldable
    },

    string = {
        byte = string.byte,
        char = string.char,
        dump = string.dump,
        find = string.find,
        format = string.format,
        gmatch = string.gmatch,
        gsub = string.gsub,
        len = string.len,
        lower = string.lower,
        match = string.match,
        rep = string.rep,
        reverse = string.reverse,
        sub = string.sub,
        upper = string.upper,
        -- Lua 5.3.
        pack = string.pack,
        unpack = string.unpack,
        packsize = string.packsize
    },

    table = {
        concat = table.concat,
        insert = table.insert,
        pack = table.pack,
        remove = table.remove,
        sort = table.sort,
        unpack = table.unpack,
        -- Lua 5.3.
        move = table.move
    },

    math = {
        abs = math.abs,
        acos = math.acos,
        asin = math.asin,
        atan = math.atan,
        atan2 = math.atan2,
        ceil = math.ceil,
        cos = math.cos,
        cosh = math.cosh,
        deg = math.deg,
        exp = math.exp,
        floor = math.floor,
        fmod = math.fmod,
        frexp = math.frexp,
        huge = math.huge,
        ldexp = math.ldexp,
        log = math.log,
        max = math.max,
        min = math.min,
        modf = math.modf,
        pi = math.pi,
        pow = math.pow or function(a, b) -- Deprecated in Lua 5.3
            return a^b
        end,
        rad = math.rad,
        random = function(...)
            return spcall(math.random, ...)
        end,
        randomseed = function(seed)
            spcall(math.randomseed, seed)
        end,
        sin = math.sin,
        sinh = math.sinh,
        sqrt = math.sqrt,
        tan = math.tan,
        tanh = math.tanh,
        -- Lua 5.3.
        maxinteger = math.maxinteger,
        mininteger = math.mininteger,
        tointeger = math.tointeger,
        type = math.type,
        ult = math.ult
    },

    -- Deprecated in Lua 5.3.
    bit32 = bit32 and {
        arshift = bit32.arshift,
        band = bit32.band,
        bnot = bit32.bnot,
        bor = bit32.bor,
        btest = bit32.btest,
        bxor = bit32.bxor,
        extract = bit32.extract,
        replace = bit32.replace,
        lrotate = bit32.lrotate,
        lshift = bit32.lshift,
        rrotate = bit32.rrotate,
        rshift = bit32.rshift
    },

    io = nil, -- in lib/io.lua

    os = {
        clock = os.clock,
        date = function(format, time)
            return spcall(os.date, format, time)
        end,
        difftime = function(t2, t1)
            return t2 - t1
        end,
        execute = nil, -- in boot/*_os.lua
        exit = nil, -- in boot/*_os.lua
        remove = nil, -- in boot/*_os.lua
        rename = nil, -- in boot/*_os.lua
        time = function(table)
            checkArg(1, table, "table", "nil")
            return os.time(table)
        end,
        tmpname = nil, -- in boot/*_os.lua
    },

    debug = {
        getinfo = function(...)
            local result = debug.getinfo(...)
            if result then
                -- Only make primitive information available in the sandbox.
                return {
                    source = result.source,
                    short_src = result.short_src,
                    linedefined = result.linedefined,
                    lastlinedefined = result.lastlinedefined,
                    what = result.what,
                    currentline = result.currentline,
                    nups = result.nups,
                    nparams = result.nparams,
                    isvararg = result.isvararg,
                    name = result.name,
                    namewhat = result.namewhat,
                    istailcall = result.istailcall
                }
            end
        end,
        traceback = debug.traceback
    },

    -- Lua 5.3.
    utf8 = utf8 and {
        char = utf8.char,
        charpattern = utf8.charpattern,
        codes = utf8.codes,
        codepoint = utf8.codepoint,
        len = utf8.len,
        offset = utf8.offset
    },

    checkArg = checkArg
}
sandbox._G = sandbox


-------------------------------------------------------------------------------
-- Component

local libcomponent
local proxyCache = {}
local directCache = {}

local componentCallback = {
    __call = function(self, ...)
        return component.invoke(self.address, self.name, ...)
    end,
    __tostring = function(self)
        return component.doc(self.address, self.name) or "function"
    end
}

libcomponent = {
    doc = function(address, method)
        checkArg(1, address, "string")
        checkArg(2, method, "string")
        local result, reason = spcall(component.doc, address, method)
        if not result and reason then
            error(reason, 2)
        end
        return result
    end,
    invoke = function(address, method, ...)
        checkArg(1, address, "string")
        checkArg(2, method, "string")
        return component.invoke(address, method, ...)
    end,
    list = function(filter, exact)
        checkArg(1, filter, "string", "nil")

        local list = spcall(component.list, filter, not not exact)
        local key = nil

        return setmetatable(list, {
            __call = function()
                key = next(list, key)
                if key then
                    return key, list[key]
                end
            end
        })
    end,
    methods = function(address)
        local result, reason = spcall(component.methods, address)

        -- Transform to pre 1.4 format to avoid breaking scripts.
        if type(result) == "table" then
            for k, v in pairs(result) do
                if not v.getter and not v.setter then
                    result[k] = v.direct
                else
                    result[k] = nil
                end
            end
            return result
        end

        return result, reason
    end,
    fields = function(address)
        local result, reason = spcall(component.methods, address)
        if type(result) == "table" then
            for k, v in pairs(result) do
                if not v.getter and not v.setter then
                    result[k] = nil
                end
            end
            return result
        end
        return result, reason
    end,
    proxy = function(address)
        local type, reason = spcall(component.type, address)

        if not type then
            return nil, reason
        end

        local slot, reason = spcall(component.slot, address)
        if not slot then
            return nil, reason
        end
        
        if proxyCache[address] then
            return proxyCache[address]
        end

        local proxy = {address = address, type = type, slot = slot, fields = {}}
        local methods, reason = spcall(component.methods, address)
        if not methods then
            return nil, reason
        end

        for method, info in pairs(methods) do
            if not info.getter and not info.setter then
                proxy[method] = setmetatable({address=address,name=method}, componentCallback)
            else
                proxy.fields[method] = info
            end
        end

        setmetatable(proxy, componentProxy)
        proxyCache[address] = proxy
        return proxy
    end,
    type = function(address)
        return spcall(component.type, address)
    end,
    slot = function(address)
        return spcall(component.slot, address)
    end
}
sandbox.component = libcomponent

-------------------------------------------------------------------------------
-- Bootstrap

local function bootstrap()
    local eeprom = libcomponent.list("eeprom")()
    if not eeprom then
        error("no bios found; install a configured EEPROM", 0)
    end

    local code = libcomponent.invoke(eeprom, "get")
    if not code or #code == 0 then
        return
    end

    local bios, reason = load(code, "=bios", "t", sandbox)
    if not bios then
        error("failed loading bios: " .. reason, 0)
    end

    bios()
end

-------------------------------------------------------------------------------
-- Main

local function main()
    local ok, reason = pcall(bootstrap);
    if not ok then
        computer.beep(1000, 100)
        print(reason)
    end
end

return pcall(main)
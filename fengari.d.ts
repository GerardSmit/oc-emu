declare module "fengari" {
    interface LuaState {
        
    }

    interface Lua {
        LUA_YIELD: number
        LUA_VERSION: string
        LUA_REGISTRYINDEX: number
        LUA_MASKLINE: number

        lua_close(L: LuaState): void
        lua_pushjsfunction(L: LuaState, func: (L: LuaState) => number): void
        lua_pushjsclosure(L: LuaState, func: (L: LuaState) => number, index: number): void
        lua_pushliteral(L: LuaState, s: string): void
        lua_pushnumber(L: LuaState, n: number): void
        lua_pushboolean(L: LuaState, b: boolean): void
        lua_pushnil(L: LuaState): void
        lua_pushstring(L: LuaState, s: Uint8Array): void
        lua_pop(L: LuaState, i: number): void
        lua_remove(L: LuaState, i: number): void
        lua_newtable(L: LuaState): void
        lua_createtable(L: LuaState, index: number, size: number): void
        lua_settable(L: LuaState, index: number): void
        lua_gettop(L: LuaState): number
        to_luastring(str: string): Uint8Array
        to_luastring(str: string, cache: boolean): Uint8Array
        to_jsstring(i: Uint8Array): string
        lua_toboolean(L: LuaState, index: number): boolean
        lua_tostring(L: LuaState, index: number): Uint8Array
        lua_pushglobaltable(L: LuaState): void
        lua_newtable(L: LuaState): void
        lua_setglobal(L: LuaState, name: Uint8Array): void
        lua_gettop(L: LuaState): number
        lua_isstring(L: LuaState, index: number): boolean
        lua_isnumber(L: LuaState, index: number): boolean
        lua_istable(L: LuaState, index: number): boolean
        lua_isnil(L: LuaState, index: number): boolean
        lua_isfunction(L: LuaState, index: number): boolean
        lua_isthread(L: LuaState, index: number): boolean
        lua_isboolean(L: LuaState, index: number): boolean
        lua_tonumber(L: LuaState, index: number): number
        lua_type(L: LuaState, index: number): string
        luaL_typerror(L: LuaState, index: number, error: string): void
        lua_resume(co: LuaState, L: LuaState, n: number): number
        lua_yield(L: LuaState, n: number): void
        lua_pushvalue(L: LuaState, n: number): void
        lua_newthread(L: LuaState): LuaState
        lua_pcall(L: LuaState, nargs: number, nresults: number, errfunc: number): number
        lua_call(L: LuaState, nargs: number, nresults: number): number
        lua_toproxy(L: LuaState, n: number): any
        lua_rawgeti(L: LuaState, register: number, n: number): void
        lua_tothread(L: LuaState, n: number): LuaState;
        lua_sethook(L: LuaState, func: (L: LuaState) => void, mask: number, n: number): void
        lua_status(L: LuaState): number
    }

    interface LuaLib {
        luaL_openlibs(L: LuaState): void
    }

    interface Lauxlib {
        luastring_from(a: number[]): Uint8Array
        luaL_newstate(): LuaState
        luaL_requiref(L: LuaState): void
        luaL_newlib(L: LuaState, lib: Object): void
        luaL_loadbuffer(L: LuaState, code: string): void
        luaL_dostring(L: LuaState, code: Uint8Array): void
        luaL_checkstring(L: LuaState, stack: number): Uint8Array
        luaL_checknumber(L: LuaState, stack: number): number
        luaL_checkboolean(L: LuaState, stack: number): boolean
        luaL_tojsstring(L: LuaState, stack: number): string
        luaL_setfuncs(L: LuaState, funcs: {[name: string]: (L: LuaState) => number}, stack: number): void
        luaL_argerror(L: LuaState, index: number, extramsg: string): number;
        luaL_loadbuffer(L: LuaState, input: Uint8Array, len: number, source: Uint8Array): void
        luaL_error(L: LuaState, str: Uint8Array): void

        luaL_ref(L: LuaState, register: number): number
        luaL_unref(L: LuaState, register: number, n: number): void

        /**
         * @param glb True if the the modname should be registered in the global table.
         */
        luaL_requiref(L: LuaState, modname: Uint8Array, openf: () => number, glb: boolean): void
    }

    export var lua: Lua
    export var lauxlib: Lauxlib
    export var lualib: LuaLib
}
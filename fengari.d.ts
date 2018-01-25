interface LuaState {
    
}

interface Lua {
    LUA_VERSION: string

    lua_pushliteral(L: LuaState, s: string): void
    lua_pop(L: LuaState, i: number): void
    to_luastring(str: string): Uint8Array
    to_luastring(str: string, cache: boolean): Uint8Array
    to_jsstring(i: Uint8Array): string
    lua_pushglobaltable(L: LuaState): void
    lua_newtable(L: LuaState): void
    lua_setglobal(L: LuaState, name: Uint8Array): void
    lua_gettop(L: LuaState): number
    lua_isstring(L: LuaState, index: number): boolean
    lua_isnumber(L: LuaState, index: number): boolean
    lua_istable(L: LuaState, index: number): boolean
    lua_tonumber(L: LuaState, index: number): number
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
    luaL_tojsstring(L: LuaState, stack: number): string
    luaL_setfuncs(L: LuaState, funcs: {[name: string]: (L: LuaState) => void|any}, stack: number): void
    luaL_argerror(L: LuaState, index: number, extramsg: string): number;

    /**
     * @param glb True if the the modname should be registered in the global table.
     */
    luaL_requiref(L: LuaState, modname: Uint8Array, openf: () => number, glb: boolean): void
}

interface Fengari {
    lua: Lua
    lauxlib: Lauxlib
    lualib: LuaLib
}

declare var fengari: Fengari;
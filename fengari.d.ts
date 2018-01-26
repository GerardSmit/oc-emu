declare module "fengari" {
    interface LuaState {
        
    }

    interface Lua {
        LUA_VERSION: string

        lua_pushjsfunction(L: LuaState, func: (L: LuaState) => number): void
        lua_pushjsclosure(L: LuaState, func: (L: LuaState) => number, index: number): void
        lua_pushliteral(L: LuaState, s: string): void
        lua_pushnumber(L: LuaState, n: number): void
        lua_pushboolean(L: LuaState, b: boolean): void
        lua_pushnil(L: LuaState): void
        lua_pop(L: LuaState, i: number): void
        lua_remove(L: LuaState, i: number): void
        lua_newtable(L: LuaState): void
        lua_settable(L: LuaState, index: number): void
        lua_gettop(L: LuaState): number
        to_luastring(str: string): Uint8Array
        to_luastring(str: string, cache: boolean): Uint8Array
        to_jsstring(i: Uint8Array): string
        lua_toboolean(L: LuaState, index: number): boolean
        lua_pushglobaltable(L: LuaState): void
        lua_newtable(L: LuaState): void
        lua_setglobal(L: LuaState, name: Uint8Array): void
        lua_gettop(L: LuaState): number
        lua_isstring(L: LuaState, index: number): boolean
        lua_isnumber(L: LuaState, index: number): boolean
        lua_istable(L: LuaState, index: number): boolean
        lua_isnil(L: LuaState, index: number): boolean
        lua_isboolean(L: LuaState, index: number): boolean
        lua_tonumber(L: LuaState, index: number): number
        lua_type(L: LuaState, index: number): string
        luaL_typerror(L: LuaState, index: number, error: string): void
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

        /**
         * @param glb True if the the modname should be registered in the global table.
         */
        luaL_requiref(L: LuaState, modname: Uint8Array, openf: () => number, glb: boolean): void
    }

    export var lua: Lua
    export var lauxlib: Lauxlib
    export var lualib: LuaLib
}
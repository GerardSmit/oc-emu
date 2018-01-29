import { LuaState, lua, lauxlib, lualib } from "fengari";
import { lua_pushjsobject, lua_checkboolean, lua_pushjs } from "../utils";
import { Computer } from "../computer";

export function componentApi(computer: Computer) {
    return {
        invoke(L: LuaState) {
            // Get the arguments.
            const address = lua.to_jsstring(lauxlib.luaL_checkstring(L, 1));
            lua.lua_remove(L, 1);

            const method = lua.to_jsstring(lauxlib.luaL_checkstring(L, 1));
            lua.lua_remove(L, 1);

            // Get the component and invoke the method.
            const component = computer.getCompontent(address);

            if (!component.isDirect(method)) {
                if (!lua.lua_isthread(L, 1)) {
                    // TODO Throw an error.
                    return 0;
                }

                // First arg is the lua thread.
                lua.lua_pushvalue(L, 1);
                const r = lauxlib.luaL_ref(L, lua.LUA_REGISTRYINDEX);
                lua.lua_remove(L, 1);

                // Invoke the component and resume the thread with the results.
                const result = component.invoke(method, L) as Promise<any[]>
                result.then((results) => {
                    for (const item of results) {
                        lua_pushjs(L, item);
                    }

                    lua.lua_rawgeti(L, lua.LUA_REGISTRYINDEX, r);
                    const n = lua.lua_gettop(L);
                    const co = lua.lua_tothread(L, n);
                    lua.lua_remove(L, n);
                    lua.lua_resume(co, L, results.length);
                    lauxlib.luaL_unref(L, lua.LUA_REGISTRYINDEX, r);
                });

                return 0;
            }

            const results = component.invoke(method, L) as any[];

            for (const item of results) {
                lua_pushjs(L, item);
            }

            return results.length;
        },
        list(L: LuaState) {
            const filter = lua.lua_isnil(L, 1) ? null : lua.to_jsstring(lauxlib.luaL_checkstring(L, 1));
            const exact = lua.lua_isnil(L, 2) ? false : lua_checkboolean(L, 2);

            lua_pushjsobject(L, computer.getCompontents(filter, exact));

            return 1;
        },
        type(L: LuaState) {
            const address = lua.to_jsstring(lauxlib.luaL_checkstring(L, 1));

            lua.lua_pushliteral(L, computer.getCompontent(address).getType());

            return 1;
        },
        methods(L: LuaState) {
            const address = lua.to_jsstring(lauxlib.luaL_checkstring(L, 1));
            const methods: {[name: string]: any} = {};
            const component = computer.getCompontent(address);

            for (let name of component.getMethods()) {
                methods[name] = {
                    direct: component.isDirect(name)
                };
            }

            lua_pushjsobject(L, methods);

            return 1;
        },
        slot(L: LuaState) {
            lua.lua_pushnumber(L, -1);

            return 1;
        }
    };
}
import { LuaState, lua, lauxlib } from "fengari";
import { lua_table, lua_checkboolean } from "../utils";
import { Computer } from "../computer";

export function componentApi(computer: Computer) {
    return {
        invoke(L: LuaState) {
            // Get the arguments.
            const address = lua.to_jsstring(lauxlib.luaL_checkstring(L, 1));
            const method = lua.to_jsstring(lauxlib.luaL_checkstring(L, 2));

            lua.lua_remove(L, 1);
            lua.lua_remove(L, 1);

            // Get the component and invoke the method.
            const compontent = computer.getCompontent(address);
            const result = compontent.invoke(method, L);

            console.log(method, 'result', result)

            if (result instanceof Promise) {
                result.then(num => {
                    console.log("RESUME", num)
                    lua.lua_resume(L, num);
                })
                return 0;
            }

            return result as number;
        },
        list(L: LuaState) {
            const filter = lua.lua_isnil(L, 1) ? null : lua.to_jsstring(lauxlib.luaL_checkstring(L, 1));
            const exact = lua.lua_isnil(L, 2) ? false : lua_checkboolean(L, 2);

            lua_table(L, computer.getCompontents(filter, exact));

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

            lua_table(L, methods);

            return 1;
        },
        slot(L: LuaState) {
            lua.lua_pushnumber(L, -1);

            return 1;
        }
    };
}
import { LuaState, lua, lauxlib, lualib } from "fengari";
import { lua_pushjsobject, lua_checkboolean, lua_pushjsvalue, lua_resumepromise, lua_pushjsvalues } from "../utils";
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
                return lua_resumepromise(L, 1, () => component.invoke(method, L, computer) as Promise<any[]>);
            }

            return lua_pushjsvalues(L, component.invoke(method, L, computer) as any[]);
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
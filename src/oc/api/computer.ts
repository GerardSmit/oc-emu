import { LuaState, lua, lauxlib } from "fengari";
import { Computer } from "../computer";

export function computerApi(computer: Computer) {
    return {
        address(L: LuaState) {
            lua.lua_pushliteral(L, computer.address);

            return 1;
        },
        pullSignal(L: LuaState) {
            return computer.pullSignal(L, 1);
        },
        sleep(L: LuaState) {
            const argCount = lua.lua_gettop(L);
            const duration = lauxlib.luaL_checknumber(L, 2);
            return computer.sleep(L, 1, duration);
        }
    }
}
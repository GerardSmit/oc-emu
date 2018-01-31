import { LuaState, lua, lauxlib } from "fengari";
import { Computer } from "../computer";

export function computerApi(computer: Computer) {
    return {
        address(L: LuaState) {
            lua.lua_pushliteral(L, computer.address);

            return 1;
        },
        beep(L: LuaState) {
            const argCount = lua.lua_gettop(L);

            computer.beep(
                argCount > 0 ? lauxlib.luaL_checknumber(L, 1) : 1000, 
                argCount > 1 ? lauxlib.luaL_checknumber(L, 2) : 1000
            );

            return 0;
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
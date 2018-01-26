import { FontRenderer } from './font';
import { Computer } from './computer';
import { lua_table, lua_checkboolean } from './utils';

const { lauxlib, lualib, lua } = fengari;

declare const window: any;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

async function init() {
    const fontRenderer = new FontRenderer();
    await fontRenderer.load();

    const computer = new Computer(canvas, fontRenderer);

    computer.register("component", {
        invoke(L: LuaState) {
            // Get the arguments.
            const address = lua.to_jsstring(lauxlib.luaL_checkstring(L, 1));
            const method = lua.to_jsstring(lauxlib.luaL_checkstring(L, 2));

            lua.lua_remove(L, 1);
            lua.lua_remove(L, 1);

            // Get the component and invoke the method.
            const compontent = computer.getCompontent(address);

            return compontent.invoke(method, L);
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

            for (let name of computer.getCompontent(address).getMethods()) {
                methods[name] = {direct: true};
            }

            lua_table(L, methods);

            return 1;
        },
        slot(L: LuaState) {
            lua.lua_pushnumber(L, -1);

            return 1;
        }
    });
    
    computer.register("computer", {
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

            return 1;
        }
    });

    computer.run(require('./lua/boot.lua'))
}

init();
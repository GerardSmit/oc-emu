import {FontRenderer} from './font';
import {System} from './system';

const { lauxlib, lualib, lua } = fengari;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

async function init() {
    const fontRenderer = new FontRenderer();
    const system = new System(ctx, fontRenderer);

    await fontRenderer.load();

    system.register("component", {
        invoke(L: LuaState) {
            // Get the arguments.
            const address = lua.to_jsstring(lauxlib.luaL_checkstring(L, 1));
            const method = lua.to_jsstring(lauxlib.luaL_checkstring(L, 2));
            const argCount = lua.lua_gettop(L);
            const args = [];

            for (let i = 3; i <= argCount; i++) {
                if (lua.lua_isnumber(L, i)) {
                    args.push(lua.lua_tonumber(L, i));
                } else if (lua.lua_isstring(L, i)) {
                    args.push(lua.to_jsstring(lauxlib.luaL_checkstring(L, i)));
                    // TODO Tables
                } else {
                    lauxlib.luaL_argerror(L, i, "Unsupported type");
                    return;
                }
            }

            // Get the component and invoke the method.
            const compontent = system.getCompontent(address) as any;
            compontent[method].apply(compontent, args);

            // TODO Return result
            return 0;
        }
    });

    system.run("component.invoke('screen', 'set', 0, 0, 'Hello world!')")
}

init();
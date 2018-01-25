import {Component, GpuComponent} from "./components";
import {createUUID} from "./utils";
import { FontRenderer } from "./font";

const { lauxlib, lualib, lua } = fengari;

export class System {
    private state: LuaState;

    private compontents: {[guuid: string]: Component} = {};

    public constructor(ctx: CanvasRenderingContext2D, fontRenderer: FontRenderer) {
        this.state = lauxlib.luaL_newstate();
        lualib.luaL_openlibs(this.state);

        this.compontents['screen'] = new GpuComponent(ctx, fontRenderer);
    }

    public getCompontent(uuid: string) {
        return this.compontents[uuid];
    }

    public register(name: string, funcs: {[name: string]: (L: LuaState) => number}) {
        lua.lua_newtable(this.state);
        lauxlib.luaL_setfuncs(this.state, funcs, 0);
        lua.lua_setglobal(this.state, lua.to_luastring(name));
    }

    public run(input: string) {
        return lauxlib.luaL_dostring(this.state, lua.to_luastring(input));
    }
}
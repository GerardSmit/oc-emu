import { createUUID } from "./utils";
import { FontRenderer } from "./font";
import { Component, ComputerComponent, GpuComponent } from "./components";
import { EepromComponent } from "./components/eeprom";

const { lauxlib, lualib, lua } = fengari;

export class Computer {
    public readonly address: string;

    private readonly state: LuaState;

    private readonly compontents: {[guuid: string]: Component} = {};

    public constructor(canvas: HTMLCanvasElement, fontRenderer: FontRenderer) {
        this.address = createUUID();
        this.state = lauxlib.luaL_newstate();
        lualib.luaL_openlibs(this.state);

        this.compontents[this.address] = new ComputerComponent(this);
        this.compontents[createUUID()] = new GpuComponent(canvas, fontRenderer);
        this.compontents[createUUID()] = new EepromComponent();
    }
    
    getCompontents(filter: string, exact: boolean) {
        var compontents: {[address: string]: string} = {};

        for (let key of Object.keys(this.compontents)) {
            const type = this.compontents[key].getType();

            if (filter !== null) {
                if (exact) {
                    if (type !== filter) {
                        continue;
                    }
                } else {
                    if (!type.includes(filter)) {
                        continue;
                    }
                }
            }

            compontents[key] = type;
        }

        return compontents;
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
        console.log(lauxlib.luaL_dostring(this.state, lua.to_luastring(input)))
    }

    public beep(frequency: number, duration: number) {
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
    
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
    
        gainNode.gain.setTargetAtTime(0.05, audioCtx.currentTime, 0);
        oscillator.frequency.setTargetAtTime(frequency, audioCtx.currentTime, 0);
        oscillator.type = 'triangle';
    
        oscillator.start();
    
        setTimeout(() => oscillator.stop(), duration);
    }
}
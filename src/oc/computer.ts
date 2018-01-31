import { createUUID, lua_pushjsobject, lua_checkboolean, lua_pushjsvalue, lua_resumepromise } from "./utils";
import { FontRenderer } from "./font";
import { IComponent, ComputerComponent, GpuComponent } from "./components";
import { EepromComponent } from "./components/eeprom";
import { lauxlib, lualib, lua, LuaState } from 'fengari';
import { setTimeout } from "timers";

export class Computer {
    public static audioContext: AudioContext = new AudioContext();

    public readonly address: string;

    private state: LuaState = null;

    private readonly compontents: {[guuid: string]: IComponent} = {};

    private signals: any[][] = [];

    public onstart: (computer: Computer) => void;

    private waitThread: {L: LuaState, r: number|null} = null;

    private runId: number = 0;

    public constructor() {
        this.address = createUUID();

        this.compontents[this.address] = new ComputerComponent(this);
    }

    pushSignal(name: string, args: any[]) {
        const results = [name, ...args];

        if (this.waitThread !== null) {
            const waitThread = this.waitThread;
            this.waitThread = null;
            
            const {L, r} = waitThread;

            for (let i = 0; i < results.length; i++) {
                lua_pushjsvalue(L, results[i]);
            }
    
            lua.lua_rawgeti(L, lua.LUA_REGISTRYINDEX, r);
            const n = lua.lua_gettop(L);
            const co = lua.lua_tothread(L, n);
            lua.lua_remove(L, n);
            lua.lua_resume(co, L, results.length);
            lauxlib.luaL_unref(L, lua.LUA_REGISTRYINDEX, r);
        } else {
            this.signals.push(results);
        }
    }

    pullSignal(L: LuaState, index: number) {
        if (this.signals.length > 0) {
            const results = this.signals.shift();

            lua.lua_pushboolean(L, true);

            for (let i = 0; i < results.length; i++) {
                lua_pushjsvalue(L, results[i]);
            }
    
            return results.length + 1;
        } 
        
        lua.lua_pushboolean(L, false);

        lua.lua_pushvalue(L, index);
        const r = lauxlib.luaL_ref(L, lua.LUA_REGISTRYINDEX);
        this.waitThread = {L, r};
        return 1;
    }

    sleep(L: LuaState, index: number, duration: number) {
        lua_resumepromise(L, index, () => new Promise(resolve => setTimeout(() => resolve([]), duration)));
        return 0;
    }

    registerCompontent(component: IComponent) {
        this.compontents[createUUID()] = component
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

    public async start() {
        this.stop();
        await Promise.all(Object.keys(this.compontents).map(address => this.compontents[address].initialize()));

        this.signals = [];
        this.waitThread = null;
        this.state = lauxlib.luaL_newstate();

        lualib.luaL_openlibs(this.state);

        // Initialize the state.
        if (this.onstart) {
            this.onstart(this);
        }

        // Stop old state if a new one is started.
        const runId = ++this.runId;
        lua.lua_sethook(this.state, L => {
            if (this.runId !== runId) {
                lauxlib.luaL_error(L, lua.to_luastring("terminated"))
            }
        }, lua.LUA_MASKLINE, 0);

        // Run boot.lua
        const source = lua.to_luastring(require('../lua/boot.lua'));
        lauxlib.luaL_loadbuffer(this.state, source, source.byteLength, lua.to_luastring("=boot"));
        lua.lua_pcall(this.state, 0, 0, 0)
    }

    public stop() {
    }

    public beep(frequency: number, duration: number) {
        const oscillator = Computer.audioContext.createOscillator();
        const gainNode = Computer.audioContext.createGain();
    
        oscillator.connect(gainNode);
        gainNode.connect(Computer.audioContext.destination);
    
        gainNode.gain.setTargetAtTime(0.2, Computer.audioContext.currentTime, 0);
        oscillator.frequency.setTargetAtTime(frequency, Computer.audioContext.currentTime, 0);
        oscillator.type = 'triangle';
    
        oscillator.start();
    
        setTimeout(() => oscillator.stop(), duration);
    }
}

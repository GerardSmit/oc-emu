import { createUUID, lua_table, lua_checkboolean } from "./utils";
import { FontRenderer } from "./font";
import { IComponent, ComputerComponent, GpuComponent } from "./components";
import { EepromComponent } from "./components/eeprom";
import { lauxlib, lualib, lua, LuaState } from 'fengari';

export class Computer {
    public static audioContext: AudioContext = new AudioContext();

    public readonly address: string;

    private readonly state: LuaState;

    private readonly compontents: {[guuid: string]: IComponent} = {};

    public constructor() {
        this.address = createUUID();
        this.state = lauxlib.luaL_newstate();
        lualib.luaL_openlibs(this.state);

        this.compontents[this.address] = new ComputerComponent(this);
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
        

        await Object.keys(this.compontents).map(address => this.compontents[address].initialize());

        const thread = lua.lua_newthread(this.state);
        const source = lua.to_luastring(require('../lua/boot.lua'));

        
        console.log('Load', lauxlib.luaL_loadbuffer(thread, source, source.length, lua.to_luastring("=bios", true)));
console.log('AAAAAAA', lua.lua_resume(thread, 0));


        // while (lua.lua_resume(thread, 0) !== ThreadStatus.LUA_YIELD) {
        //     console.log('YIELD');
        // }
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

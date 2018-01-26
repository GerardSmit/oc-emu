import { createUUID, lua_table, lua_checkboolean } from "./utils";
import { FontRenderer } from "./font";
import { Component, ComputerComponent, GpuComponent } from "./components";
import { EepromComponent } from "./components/eeprom";
import { lauxlib, lualib, lua, LuaState } from 'fengari';

export class Computer {
    private audioCtx: AudioContext;

    public readonly address: string;

    private readonly state: LuaState;

    private readonly compontents: {[guuid: string]: Component} = {};

    public constructor(canvas: HTMLCanvasElement, fontRenderer: FontRenderer) {
        this.audioCtx = new AudioContext();
        this.address = createUUID();
        this.state = lauxlib.luaL_newstate();
        lualib.luaL_openlibs(this.state);

        this.compontents[this.address] = new ComputerComponent(this);
        this.compontents[createUUID()] = new GpuComponent(canvas, fontRenderer);
    }

    registerCompontent(component: Component) {
        this.compontents[createUUID()] = component
    }
    
    static registerGlobals(computer: Computer) {
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

    public start() {
        console.log(lauxlib.luaL_dostring(this.state, lua.to_luastring(require('../lua/boot.lua'))))
    }

    public beep(frequency: number, duration: number) {
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
    
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
    
        gainNode.gain.setTargetAtTime(0.2, this.audioCtx.currentTime, 0);
        oscillator.frequency.setTargetAtTime(frequency, this.audioCtx.currentTime, 0);
        oscillator.type = 'triangle';
    
        oscillator.start();
    
        setTimeout(() => oscillator.stop(), duration);
    }
}
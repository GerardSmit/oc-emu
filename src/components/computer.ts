import { Component } from "./_component";
import { Computer } from "../computer";

const { lauxlib, lualib, lua } = fengari;

export class ComputerComponent implements Component {
    computer: Computer;

    public constructor(computer: Computer) {
        this.computer = computer;
    }

    getType(): string {
        return 'computer';
    }

    getMethods(): string[] {
        return [
            'beep'
        ];
    }

    invoke(name: string, L: LuaState): number {
        const argCount = lua.lua_gettop(L);

        switch(name) {
            case 'beep':
                this.computer.beep(
                    argCount > 0 ? lauxlib.luaL_checknumber(L, 1) : 1000, 
                    argCount > 1 ? lauxlib.luaL_checknumber(L, 2) : 1000
                );
                return 0;
        }
    }
}
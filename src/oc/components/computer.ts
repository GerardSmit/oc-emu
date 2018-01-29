import { IComponent } from "./_component";
import { Computer } from "../computer";
import { lauxlib, lualib, lua, LuaState } from 'fengari';

export class ComputerComponent implements IComponent {
    computer: Computer;

    public constructor(computer: Computer) {
        this.computer = computer;
    }

    initialize(): Promise<void> {
        return Promise.resolve();
    }

    getType(): string {
        return 'computer';
    }

    getMethods(): string[] {
        return [
            'beep'
        ];
    }
    
    isDirect(name: string): boolean {
        return true;
    }

    invoke(name: string, L: LuaState): any[]|Promise<any[]> {
        const argCount = lua.lua_gettop(L);

        switch(name) {
            case 'beep':
                this.computer.beep(
                    argCount > 0 ? lauxlib.luaL_checknumber(L, 1) : 1000, 
                    argCount > 1 ? lauxlib.luaL_checknumber(L, 2) : 1000
                );
                return [];
        }
    }
}
import { IComponent } from "./_component";
import { lauxlib, lualib, lua, LuaState } from 'fengari';

export class EepromComponent implements IComponent {
    private loader: () => string;

    constructor(loader: () => string) {
        this.loader = loader;
    }

    initialize(): Promise<void> {
        return Promise.resolve();
    }

    getType(): string {
        return 'eeprom';
    }

    getMethods(): string[] {
        return [
            'get'
        ];
    }
    
    isDirect(name: string): boolean {
        return true;
    }

    invoke(name: string, L: LuaState): number|Promise<number> {
        const argCount = lua.lua_gettop(L);

        switch(name) {
            case 'get':
                lua.lua_pushliteral(L, this.loader())
                return 1;
        }
    }
}
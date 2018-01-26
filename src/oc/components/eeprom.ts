import { Component } from "./_component";
import { lauxlib, lualib, lua, LuaState } from 'fengari';

export class EepromComponent implements Component {
    private loader: () => string;

    constructor(loader: () => string) {
        this.loader = loader;
    }

    getType(): string {
        return 'eeprom';
    }

    getMethods(): string[] {
        return [
            'get'
        ];
    }

    invoke(name: string, L: LuaState): number {
        const argCount = lua.lua_gettop(L);

        switch(name) {
            case 'get':
                lua.lua_pushliteral(L, this.loader())
                return 1;
        }
    }
}
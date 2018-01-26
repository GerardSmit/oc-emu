import { Component } from "./_component";

const { lauxlib, lualib, lua } = fengari;

export class EepromComponent implements Component {
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
                lua.lua_pushliteral(L, require('../lua/bios.lua'))
                return 1;
        }
    }
}
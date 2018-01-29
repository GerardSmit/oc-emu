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

    invoke(name: string, L: LuaState): any[]|Promise<any[]> {
        switch(name) {
            case 'get':
                return [this.loader()];
        }
    }
}
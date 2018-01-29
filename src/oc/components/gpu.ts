import { IComponent } from "./_component";
import { FontRenderer } from "../font";
import { lauxlib, lualib, lua, LuaState } from 'fengari';
import { Screen } from '../../ui/components/screen';

export class GpuComponent implements IComponent {
    private screen: Screen;

    public constructor(screen: Screen) {
        this.screen = screen;
    }

    initialize(): Promise<void> {
        return Promise.resolve();
    }
    
    getType(): string {
        return 'gpu';
    }

    getMethods(): string[] {
        return [
            'setResolution',
            'setForeground',
            'setBackground',
            'set',
            'fill'
        ];
    }
    
    isDirect(name: string): boolean {
        return true;
    }

    invoke(name: string, L: LuaState): any[]|Promise<any[]> {
        switch(name) {
            case 'setResolution':
                return [
                    this.screen.setResolution(lauxlib.luaL_checknumber(L, 1), lauxlib.luaL_checknumber(L, 2))
                ];
            case 'setForeground':
                this.screen.setForeground(lauxlib.luaL_checknumber(L, 1));
                return [];
            case 'setBackground':
                this.screen.setBackground(lauxlib.luaL_checknumber(L, 1));
                return [];
            case 'set':
                this.screen.set(
                    lauxlib.luaL_checknumber(L, 1), 
                    lauxlib.luaL_checknumber(L, 2), 
                    lua.to_jsstring(lauxlib.luaL_checkstring(L, 3))
                );
                return [];
            case 'fill':
                // TODO Vertical
                this.screen.fill(
                    lauxlib.luaL_checknumber(L, 1), 
                    lauxlib.luaL_checknumber(L, 2), 
                    lauxlib.luaL_checknumber(L, 3), 
                    lauxlib.luaL_checknumber(L, 4), 
                    lua.to_jsstring(lauxlib.luaL_checkstring(L, 5))
                );
                return [];
        }
    }
}
import { IComponent } from "./index";
import { IFileSystem } from "../filesystem/_filesystem";
import { lauxlib, lualib, lua, LuaState } from 'fengari';

export class FileSystemComponent implements IComponent {
    /**
     * The file system.
     */
    private fs: IFileSystem;

    /**
     * FileSystemComponent constructor.
     * 
     * @param fs The file system.
     */
    public constructor(fs: IFileSystem) {
        this.fs = fs;
    }

    initialize(): Promise<void> {
        return this.fs.initialize();
    }

    /**
     * @inheritDoc
     */
    getType(): string {
        return 'filesystem';
    }

    /**
     * @inheritDoc
     */
    getMethods(): string[] {
        return [
            'spaceUsed',
            'spaceTotal'
        ];
    }
    
    isDirect(name: string): boolean {
        return false;
    }

    /**
     * @inheritDoc
     */
    invoke(name: string, L: LuaState): number|Promise<number> {
        switch(name) {
            case 'spaceUsed':
                return this.fs.getSpaceUsed()
                    .then(size => {
                        lua.lua_pushnumber(L, size)
                        return 1;
                    })
                    .catch(() => {
                        lua.lua_pushnumber(L, 0)
                        return 1;
                    });
            case 'spaceTotal':
                return this.fs.getTotalSize()
                    .then(size => {
                        lua.lua_pushnumber(L, size)
                        return 1;
                    })
                    .catch(() => {
                        lua.lua_pushnumber(L, 0)
                        return 1;
                    });
        }
    }
}
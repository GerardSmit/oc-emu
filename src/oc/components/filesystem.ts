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
    async invoke(name: string, L: LuaState): Promise<any[]> {
        switch(name) {
            case 'spaceUsed': {
                const size = await this.fs.getSpaceUsed()
                lua.lua_pushnumber(L, size)
                return [await this.fs.getTotalSize()];
            }
            case 'spaceTotal': {
                return [await this.fs.getTotalSize()];
            }
        }
    }
}
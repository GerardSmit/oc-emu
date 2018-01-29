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
            'spaceTotal',
            'open',
            'write',
            'read'
        ];
    }
    
    isDirect(name: string): boolean {
        return false;
    }

    /**
     * @inheritDoc
     */
    async invoke(name: string, L: LuaState): Promise<any[]> {
        const argCount = lua.lua_gettop(L);

        switch(name) {
            case 'spaceUsed': {
                return [await this.fs.getSpaceUsed()];
            }
            case 'spaceTotal': {
                return [await this.fs.getTotalSize()];
            }
            case 'open': {
                return [await this.fs.open(
                    lua.to_jsstring(lauxlib.luaL_checkstring(L, 1)),
                    argCount > 1 ? lua.to_jsstring(lauxlib.luaL_checkstring(L, 2)) : "r",
                )];
            }
            case 'write': {
                await this.fs.write(
                    lauxlib.luaL_checknumber(L, 1),
                    lauxlib.luaL_checkstring(L, 2)
                )
                return [];
            }
            case 'read': {
                return [
                    await this.fs.read(
                        lauxlib.luaL_checknumber(L, 1),
                        lauxlib.luaL_checknumber(L, 2)
                    )
                ];
            }
        }
    }
}
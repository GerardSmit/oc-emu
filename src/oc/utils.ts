import { lauxlib, lualib, lua, LuaState } from 'fengari';

export function createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

export function lua_checkboolean(L: LuaState, index: number) {
    if (lua.lua_isboolean(L, index))
    {
        return lua.lua_toboolean(L, index);
    }

    lua.luaL_typerror(L, index, "boolean");
    return false;
}

export function lua_table(L: LuaState, items: any) {
    const keys = Object.keys(items);

    lua.lua_newtable(L);

    for (let key of keys) {
        const current = items[key];

        lua.lua_pushliteral(L, key);

        if (current === null || current === undefined) {
            lua.lua_pushnil(L);
        } else {
            switch (typeof(current)) {
                case 'string':
                    lua.lua_pushliteral(L, current);
                    break;
                case 'number':
                    lua.lua_pushnumber(L, current);
                    break;
                case 'boolean':
                    lua.lua_pushboolean(L, current);
                    break;
                case 'object':
                    lua_table(L, current);
                    break;
                default:
                    console.error('Unknown type', typeof(current))
                    throw new Error('Unknown type')
            }
        }

        lua.lua_settable(L, -3);
    }
}
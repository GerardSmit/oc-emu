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

export function lua_pushjs(L: LuaState, item: any) {
    switch (typeof(item)) {
        case 'string':
            lua.lua_pushliteral(L, item);
            break;
        case 'number':
            lua.lua_pushnumber(L, item);
            break;
        case 'boolean':
            lua.lua_pushboolean(L, item);
            break;
        case 'object':
            lua_pushjsobject(L, item);
            break;
        default:
            console.error('Unknown type', typeof(item))
            throw new Error('Unknown type')
    }
}

export function lua_pushjsobject(L: LuaState, items: any) {
    const keys = Object.keys(items);

    lua.lua_createtable(L, 0, keys.length);

    for (let key of keys) {
        const current = items[key];

        lua.lua_pushliteral(L, key);

        if (current === null || current === undefined) {
            lua.lua_pushnil(L);
        } else {
            lua_pushjs(L, current);
        }

        lua.lua_settable(L, -3);
    }
}
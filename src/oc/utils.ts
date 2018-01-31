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

export function lua_pushjsvalue(L: LuaState, item: any) {
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
            if (item === null || item === undefined) {
                lua.lua_pushnil(L);
            } else if (item instanceof Uint8Array) {
                lua.lua_pushstring(L, item);
            } else {
                lua_pushjsobject(L, item);
            }
            break;
        default:
            console.error('Unknown type', typeof(item))
            throw new Error('Unknown type')
    }
}

export function lua_pushjsvalues(L: LuaState, items: any[]) {
    for (let i = 0; i < items.length; i++) {
        lua_pushjsvalue(L, items[i]);
    }

    return items.length;
}

export function lua_pushjsobject(L: LuaState, items: any) {
    const keys = Object.keys(items);

    lua.lua_createtable(L, 0, keys.length);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const current = items[key];

        lua.lua_pushliteral(L, key);
        lua_pushjsvalue(L, current);

        lua.lua_settable(L, -3);
    }
}

export function lua_getjsobject(L: LuaState, n: number) {
    switch(lua.lua_type(L, n)) {
		case lua.LUA_TNONE:
		case lua.LUA_TNIL:
			return null;
		case lua.LUA_TBOOLEAN:
			return lua.lua_toboolean(L, n);
		case lua.LUA_TNUMBER:
			return lua.lua_tonumber(L, n);
		case lua.LUA_TSTRING:
			return lua.lua_tojsstring(L, n);
		default:
			throw 'Not supported'
	}
}

/**
 * Waits for the promise to finish, pushes the results into the stack and resumes the thread at the given index.
 * 
 * @param L The state
 * @param index The index of the thread.
 * @param promise The promise with the result.
 */
export function lua_resumepromise(L: LuaState, index: number, promise: () => Promise<any[]>) {
    if (!lua.lua_isthread(L, index)) {
        throw new Error('Expected the index to be a thread.')
    }

    // First arg is the lua thread.
    lua.lua_pushvalue(L, index);
    const r = lauxlib.luaL_ref(L, lua.LUA_REGISTRYINDEX);
    lua.lua_remove(L, index);

    // Invoke the component and resume the thread with the results.
    promise().then((results) => {
        for (const item of results) {
            lua_pushjsvalue(L, item);
        }

        lua.lua_rawgeti(L, lua.LUA_REGISTRYINDEX, r);
        const n = lua.lua_gettop(L);
        const co = lua.lua_tothread(L, n);
        lua.lua_remove(L, n);
        const status = lua.lua_resume(co, L, results.length);
        lauxlib.luaL_unref(L, lua.LUA_REGISTRYINDEX, r);
    }, console.error);

    return 0;
}
import { Computer } from "../computer";
import { lauxlib, lualib, lua, LuaState } from 'fengari';
import { lua_getjsobject } from "../utils";

export interface IComponent {
    initialize(): Promise<void>;

    isDirect(name: string): boolean;

    getType(): string;

    getMethods(): string[]

    invoke(name: string, L: LuaState, computer: Computer): any[]|Promise<any[]>;
}

export function componentMethod(type: MethodType, args: string[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.value.isDirect = type === MethodType.Direct;
        descriptor.value.isComponentMethod = true;
        descriptor.value.methodArguments = args.map(x => x.split('|'))
    }
}

function getAllFuncs(obj: any) {
    var props: string[] = [];

    do {
        props = props.concat(Object.getOwnPropertyNames(obj));
    } while (obj = Object.getPrototypeOf(obj));

    return props;
}

export enum MethodType {
    Direct = 1,
    Async = 2
}

export abstract class BaseComponent implements IComponent {
    private methods: string[];
    private type: string;

    constructor(type: string) {
        this.type = type;
        this.methods = this.findMethods();
    }

    initialize() {
        return Promise.resolve();
    }

    getType() {
        return this.type;
    }

    isDirect(name: string): boolean {
        return this.getFromThis(name).isDirect;
    }

    findMethods() {
        const methods = [];
        
        for (let k in this) {
            if (this.getFromThis(k).isComponentMethod) {
                methods.push(k);
            }
        }

        return methods;
    }

    getMethods(): string[] {
        return this.methods;
    }

    invoke(name: string, L: LuaState, computer: Computer): any[] | Promise<any[]> {
        const method = this.getFromThis(name);
        const args: any[] = [];

        // Parse arguments.
        for (let i = 0; i < method.methodArguments.length; i++) {
            const argTypes = method.methodArguments[i];
            const n = i + 1;
            let found = false;

            for (let argType of argTypes) {
                switch(argType) {
                    case 'boolean':
                        if (lua.lua_isboolean(L, n)) {
                            args.push(lua.lua_toboolean(L, n));
                            found = true;
                        }
                        break;
                    case 'number':
                        if (lua.lua_isnumber(L, n)) {
                            args.push(lua.lua_tonumber(L, n));
                            found = true;
                        }
                        break;
                    case 'null':
                        if (lua.lua_isnil(L, n) || n < lua.lua_gettop(L)) {
                            args.push(null);
                            found = true;
                        }
                        break;
                    case 'string':
                        if (lua.lua_isstring(L, n)) {
                            args.push(lua.to_jsstring(lua.lua_tostring(L, n)));
                            found = true;
                        }
                        break;
                    case 'params':
                        let params = [];

                        while (i < method.methodArguments.length) {
                            lua_getjsobject(L, i);
                            i++;
                        }

                        found = true;
                        break;
                    case '@computer':
                        args.push(computer);
                        found = true;
                        break;
                    case '@state':
                        args.push(L);
                        found = true;
                        break;
                    default:
                        if (argType[0] === '~') {
                            args.push(JSON.parse(argType.substr(1)));
                            found = true;
                            break;
                        }
                        throw new Error('Invalid argument')
                }

                if (found) {
                    break;
                }
            }

            if (!found) {
                lua.luaL_typerror(L, n, "Invalid argument, expected " + argTypes.join(", "))
            }
        }

        let result = method.apply(this, args);

        // Transform result.
        if (method.isDirect) {
            if (!Array.isArray(result)) {
                result = result !== undefined ? [result] : [];
            }
        } else {
            result = result.then((r: any) => {
                if (!Array.isArray(r)) {
                    r = r !== undefined ? [r] : [];
                }

                return r;
            })
        }

        return result;
    }

    private getFromThis(name: string) {
        return (this as any)[name] as any
    }
}
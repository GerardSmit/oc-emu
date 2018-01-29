import { LuaState } from "fengari";

export interface IComponent {
    initialize(): Promise<void>;

    isDirect(name: string): boolean;

    getType(): string;

    getMethods(): string[]

    invoke(name: string, L: LuaState): any[]|Promise<any[]>;
}
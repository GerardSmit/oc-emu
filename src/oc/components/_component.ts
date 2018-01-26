import { LuaState } from "fengari";

export interface Component {
    getType(): string;

    getMethods(): string[]

    invoke(name: string, L: LuaState): number;
}
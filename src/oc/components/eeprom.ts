import { lauxlib, lualib, lua, LuaState } from 'fengari';
import { Computer } from "../computer";
import { BaseComponent, componentMethod, MethodType } from "./index";

export class EepromComponent extends BaseComponent {
    private getter: () => string;
    private setter: (data: string) => void;

    constructor(getter: () => string, setter: (data: string) => void) {
        super('eeprom')
        this.getter = getter;
        this.setter = setter;
    }

    @componentMethod(MethodType.Direct, [])
    get() {
        return this.getter();
    }

    @componentMethod(MethodType.Direct, ['string'])
    set(data: string) {
        return this.setter(data);
    }
}
import { IComponent, componentMethod } from "./_component";
import { Computer } from "../computer";
import { lauxlib, lualib, lua, LuaState } from 'fengari';
import { BaseComponent, MethodType } from "./index";
import { setTimeout } from "timers";

export class ComputerComponent extends BaseComponent {
    private computer: Computer;

    public constructor(computer: Computer) {
        super('computer');
        this.computer = computer;
    }

    @componentMethod(MethodType.Async, ['number|~1000', 'number|~100'])
    beep(freq: number, duration: number) {
        return new Promise(resolve => {
            this.computer.beep(freq, duration);
            setTimeout(resolve, duration);
        })
    }
}
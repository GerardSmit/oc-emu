import { IComponent } from "./_component";
import { FontRenderer } from "../font";
import { lauxlib, lualib, lua, LuaState } from 'fengari';
import { Screen } from '../../ui/components/screen';
import { lua_checkboolean } from '../utils';
import { Computer } from "../computer";
import { BaseComponent, MethodType, componentMethod } from "./index";

export class GpuComponent extends BaseComponent {
    private screen: Screen;

    public constructor(screen: Screen) {
        super('gpu');
        this.screen = screen;
    }

    @componentMethod(MethodType.Direct, ['boolean'])
    setPrecise(precise: boolean) {
        this.screen.setPrecise(precise)
    }

    @componentMethod(MethodType.Direct, ['number', 'number'])
    setResolution(width: number, height: number) {
        this.screen.setResolution(width, height);
    }

    @componentMethod(MethodType.Direct, [])
    getResolution(width: number, height: number) {
        return [this.screen.getWidth(), this.screen.getHeight()]
    }

    @componentMethod(MethodType.Direct, ['number'])
    setForeground(color: number) {
        this.screen.setForeground(color);
    }

    @componentMethod(MethodType.Direct, ['number'])
    setBackground(color: number) {
        this.screen.setBackground(color);
    }

    @componentMethod(MethodType.Direct, ['number'])
    setBackgroundAlpha(color: number) {
        this.screen.setBackgroundAlpha(color);
    }

    @componentMethod(MethodType.Direct, ['number'])
    setForegroundAlpha(color: number) {
        this.screen.setForegroundAlpha(color);
    }

    @componentMethod(MethodType.Direct, ['number', 'number', 'string'])
    set(x: number, y: number, str: string) {
        this.screen.set(x, y, str);
    }

    @componentMethod(MethodType.Direct, ['number', 'number', 'number', 'number', 'string'])
    fill(x: number, y: number, w: number, h: number, str: string) {
        this.screen.fill(x, y, w, h, str);
    }
}
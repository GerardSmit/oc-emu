import { Component } from "./_component";
import { FontRenderer } from "../font";

const { lauxlib, lualib, lua } = fengari;

export class GpuComponent implements Component {
    private canvas: HTMLCanvasElement;
    private fontRenderer: FontRenderer;
    private ctx: CanvasRenderingContext2D;

    private width: number;
    private height: number;

    public constructor(canvas: HTMLCanvasElement, fontRenderer: FontRenderer) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.fontRenderer = fontRenderer;
        this.setResolution(80, 20);
    }
    
    getType(): string {
        return 'gpu';
    }

    getMethods(): string[] {
        return [
            'setResolution',
            'setForeground',
            'setBackground',
            'set',
            'fill'
        ];
    }

    invoke(name: string, L: LuaState): number {
        switch(name) {
            case 'setResolution':
                this.setResolution(lauxlib.luaL_checknumber(L, 1), lauxlib.luaL_checknumber(L, 2));
                return 0;
            case 'setForeground':
                this.setForeground(lauxlib.luaL_checknumber(L, 1));
                return 0;
            case 'setBackground':
                this.setBackground(lauxlib.luaL_checknumber(L, 1));
                return 0;
            case 'set':
                this.set(
                    lauxlib.luaL_checknumber(L, 1), 
                    lauxlib.luaL_checknumber(L, 2), 
                    lua.to_jsstring(lauxlib.luaL_checkstring(L, 3))
                );
                return 0;
            case 'fill':
                // TODO Vertical
                this.fill(
                    lauxlib.luaL_checknumber(L, 1), 
                    lauxlib.luaL_checknumber(L, 2), 
                    lauxlib.luaL_checknumber(L, 3), 
                    lauxlib.luaL_checknumber(L, 4), 
                    lua.to_jsstring(lauxlib.luaL_checkstring(L, 5))
                );
                return 0;
        }
    }

    public setResolution(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.canvas.width = width * 8;
        this.canvas.height = height * 16;
        this.fill(1, 1, width, height, " ");
    }

    public setForeground(color: number) {
        this.fontRenderer.setForeground(color >> 16 & 0xFF, color >> 8 & 0xFF, color & 0xFF);
    }

    public setBackground(color: number) {
        this.fontRenderer.setBackground(color >> 16 & 0xFF, color >> 8 & 0xFF, color & 0xFF);
    }

    public set(x: number, y: number, value: string, vertical: boolean = false) {
        this.fontRenderer.render(this.ctx, x - 1, y - 1, value, vertical);
    }

    public fill(x: number, y: number, width: number, height: number, value: string) {
        let line = value.repeat(Math.floor(width / value.length))

        if (line.length !== width) {
            line = line + value.substr(0, width - line.length);
        }
        
        for (let cy = y; cy < y + height; cy++) {
            this.fontRenderer.render(this.ctx, x - 1, cy - 1, line);
        }
    }
}
import { FontRenderer } from "./font";

export interface Component {
    
}

export class GpuComponent {
    private fontRenderer: FontRenderer;
    private ctx: CanvasRenderingContext2D;

    public constructor(ctx: CanvasRenderingContext2D, fontRenderer: FontRenderer) {
        this.ctx = ctx;
        this.fontRenderer = fontRenderer;
    }

    public set(x: number, y: number, value: string, vertical: boolean = false) {
        this.fontRenderer.render(this.ctx, x, y, value, vertical);
    }
}
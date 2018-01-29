import * as React from "react";
import { Computer } from "../../oc/computer";
import { FontRenderer } from "../../oc/font";

export interface ComputerProps { fontRenderer: FontRenderer }

export class Screen extends React.Component<ComputerProps, {}> {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;

    public componentDidMount() {
        this.ctx = this.canvas.getContext('2d');

        // Reset size
        this.setResolution(80, 25);
        this.fill(1, 1, 80, 25, " ");
    }

    public setResolution(width: number, height: number) {
        if (width > 160 || height > 50) {
            return false;
        }

        this.width = width;
        this.height = height;
        this.canvas.width = width * 8;
        this.canvas.height = height * 16;
        return true;
    }

    public setForeground(color: number) {
        this.props.fontRenderer.setForeground(color >> 16 & 0xFF, color >> 8 & 0xFF, color & 0xFF);
    }

    public setBackground(color: number) {
        this.props.fontRenderer.setBackground(color >> 16 & 0xFF, color >> 8 & 0xFF, color & 0xFF);
    }

    public set(x: number, y: number, value: string, vertical: boolean = false) {
        this.props.fontRenderer.render(this.ctx, x - 1, y - 1, value, vertical);
    }

    public fill(x: number, y: number, width: number, height: number, value: string) {
        let line = value.repeat(Math.floor(width / value.length))

        if (line.length !== width) {
            line = line + value.substr(0, width - line.length);
        }
        
        for (let cy = y; cy < y + height; cy++) {
            this.props.fontRenderer.render(this.ctx, x - 1, cy - 1, line);
        }
    }

    render() {
        return <canvas ref={(canvas) => this.canvas = canvas} />;
    }
}
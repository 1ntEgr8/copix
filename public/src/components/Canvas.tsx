import * as React from "react";
import { AppState } from "../appState";
import { ToolBox } from "./ToolBox";
import { normalizeZoom } from "../zoom";

export class Canvas extends React.Component<AppState> {
    canvas: HTMLCanvasElement | null = null;
    temp: number[][] = [
        [window.innerWidth / 2 - 50, window.innerHeight / 2 - 50, 100, 100],
        [50, 50, 200, 200]
    ];
    zoom: number = 1;
    scrollX: number = 0;
    scrollY: number = 0;

    constructor(props: AppState) {
        super(props);
    }

    public render() {
        return (
            <div>
                <main>
                    <canvas
                        id="canvas"
                        className="canvas"
                        ref={this.handleCanvasRef}
                        width={window.innerWidth}
                        height={window.innerHeight}
                    />
                </main>
                <ToolBox onZoom={this.onZoom} />
            </div>
        );
    }

    private handleCanvasRef = (canvas: HTMLCanvasElement) => {
        this.canvas = canvas;

        const ctx = canvas.getContext("2d");
        for (let shape of this.temp) {
            ctx.fillRect(
                shape[0],
                shape[1],
                shape[2],
                shape[3]
            );
        }

        this.canvas.addEventListener("wheel", e => {
            e.preventDefault();
            if (e.ctrlKey) {
                this.onZoom(-e.deltaY * 0.05);
            } else {
                this.onScroll(e.deltaX, e.deltaY);
            }
        });
    };

    private onScroll = (dx: number, dy: number) => {
        const ctx = this.canvas.getContext("2d");
        // clear screen
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        const nwidth = window.innerWidth;
        const nheight = window.innerHeight;
        const x = (-nwidth * (this.zoom - 1)) / 2;
        const y = (-nheight * (this.zoom - 1)) / 2;
        ctx.translate(x-dx, y-dy);
        ctx.scale(this.zoom, this.zoom);

        for (let shape of this.temp) {
            ctx.strokeRect(
                shape[0],
                shape[1],
                shape[2],
                shape[3],
            );
        }

        ctx.scale(1 / this.zoom, 1 / this.zoom);
        ctx.translate(-x, -y);
    }

    private onZoom = (dz: number) => {
        const ctx = this.canvas.getContext("2d");
        
        // clear screen
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        this.zoom = normalizeZoom(this.zoom + dz);

        const nwidth = window.innerWidth;
        const nheight = window.innerHeight;
        
        const dx = (-nwidth * (this.zoom - 1)) / 2;
        const dy = (-nheight * (this.zoom - 1)) / 2;
        ctx.translate(dx, dy);
        ctx.scale(this.zoom, this.zoom);
        
        for (let shape of this.temp) {
            ctx.strokeRect(
                shape[0],
                shape[1],
                shape[2],
                shape[3],
            );
        }

        ctx.scale(1 / this.zoom, 1 / this.zoom);
        ctx.translate(-dx, -dy);
    };
}

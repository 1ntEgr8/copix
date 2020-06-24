import * as React from "react";
import { AppState } from "../appState";
import { ToolBox } from "./ToolBox";

export class Canvas extends React.Component<AppState> {
    canvas: HTMLCanvasElement | null = null;
    temp: number[][] = [[100, 100]];
    zoom: number = 1;

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
                window.innerWidth / 2 - 50,
                window.innerHeight / 2 - 50,
                shape[0],
                shape[1]
            );
        }
    };

    private onZoom = (dz: number) => {
        const ctx = this.canvas.getContext("2d");
        ctx.scale(1, 1);
        ctx.translate(0, 0);
        
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        this.zoom += dz;
        this.zoom = parseFloat(this.zoom.toFixed(2))
        
        console.log(this.zoom);

        const nwidth = window.innerWidth;
        const nheight = window.innerHeight;
        
        const dx = (-nwidth * (this.zoom - 1)) / 2;
        const dy = (-nheight * (this.zoom - 1)) / 2;
        ctx.translate(dx, dy);
        ctx.scale(this.zoom, this.zoom);
        
        for (let shape of this.temp) {
            ctx.fillRect(
                window.innerWidth / 2 - 50,
                window.innerHeight / 2 - 50,
                shape[0],
                shape[1]
            );
        }

        ctx.scale(1 / this.zoom, 1 / this.zoom);
        ctx.translate(-dx, -dy);
    };
}

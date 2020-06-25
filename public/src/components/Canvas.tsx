import * as React from "react";
import { ToolBox } from "./ToolBox";
import { normalizeZoom } from "../zoom";
import { Pixel } from "../pixel";
import { AppState } from "../appState";

export interface CanvasState {
    pixels: Pixel[];
    zoom: number;
    scrollX: number;
    scrollY: number;
    width: number;
    height: number;
}

export class Canvas extends React.Component<AppState, CanvasState> {
    canvas: HTMLCanvasElement | null = null;
    temp: number[][] = [
        [window.innerWidth / 2 - 50, window.innerHeight / 2 - 50, 100, 100],
        [50, 50, 200, 200]
    ];

    constructor(props: AppState) {
        super(props);
        const { canvasState } = this.props;
        this.state = canvasState;
    }

    public render() {
        const { width, height } = this.state;
        return (
            <div>
                <main>
                    <canvas
                        id="canvas"
                        className="canvas"
                        ref={this.handleCanvasRef}
                        width={width}
                        height={height}
                    />
                    <ToolBox onZoom={this.zoom} />
                </main>
            </div>
        );
    }

    public componentDidUpdate() {
        // TODO insert call to renderScene
        const { width, height, zoom, scrollX, scrollY } = this.state;

        const ctx = this.canvas.getContext("2d");
        // clear screen
        ctx.clearRect(0, 0, width, height);
        
        
        // apply zoom
        const dx = (-width * (zoom - 1)) / 2;
        const dy = (-height * (zoom - 1)) / 2;
        ctx.translate(dx, dy);
        ctx.scale(zoom, zoom);

        // draw shapes
        for (let shape of this.temp) {
            // apply scroll
            ctx.translate(scrollX, scrollY);

            // draw shape 
            ctx.fillRect(shape[0], shape[1], shape[2], shape[3]);

            // reset scroll
            ctx.translate(-scrollX, -scrollY);

        }

        // reset zoom
        ctx.scale(1 / zoom, 1 / zoom);
        ctx.translate(-dx, -dy);

    }

    private handleCanvasRef = (canvas: HTMLCanvasElement) => {
        this.canvas = canvas;

        // for testing purposes
        const ctx = canvas.getContext("2d");
        for (let shape of this.temp) {
            ctx.fillRect(shape[0], shape[1], shape[2], shape[3]);
        }

        this.addEventListeners();
    };

    private addEventListeners() {
        this.canvas.addEventListener("wheel", this.handleWheel);
    }

    private handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        if (e.ctrlKey) {
            this.zoom(-e.deltaY * 0.05);
        } else {
            this.scroll(-e.deltaX, -e.deltaY);
        }
    };

    public zoom = (dz: number) => {
        const { zoom } = this.state;
        this.setState({
            zoom: normalizeZoom(zoom + dz)
        });
    };

    public scroll = (dx: number, dy: number) => {
        const { scrollX, scrollY } = this.state;
        this.setState({
            scrollX: scrollX + dx,
            scrollY: scrollY + dy
        });
    };

    // private onScroll = (dx: number, dy: number) => {
    //     const ctx = this.canvas.getContext("2d");
    //     // clear screen
    //     ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    //
    //     const nwidth = window.innerWidth;
    //     const nheight = window.innerHeight;
    //     const x = (-nwidth * (this.zoom - 1)) / 2;
    //     const y = (-nheight * (this.zoom - 1)) / 2;
    //     ctx.translate(x-dx, y-dy);
    //     ctx.scale(this.zoom, this.zoom);

    //     for (let shape of this.temp) {
    //         ctx.strokeRect(
    //             shape[0],
    //             shape[1],
    //             shape[2],
    //             shape[3],
    //         );
    //     }

    //     ctx.scale(1 / this.zoom, 1 / this.zoom);
    //     ctx.translate(-x, -y);
    // }
}

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
        const { width, height, zoom } = this.state;
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
                    <ToolBox zoom={zoom} onZoom={this.zoom} />
                </main>
            </div>
        );
    }

    public componentDidUpdate() {
        // TODO insert call to renderScene
        const { width, height, zoom, scrollX, scrollY, pixels } = this.state;

        const ctx = this.canvas.getContext("2d");
        // clear screen
        ctx.clearRect(0, 0, width, height);

        // apply zoom
        const dx = (-width * (zoom - 1)) / 2;
        const dy = (-height * (zoom - 1)) / 2;
        ctx.translate(dx, dy);
        ctx.scale(zoom, zoom);

        // draw shapes
        for (let pixel of pixels) {
            // apply scroll
            ctx.translate(scrollX, scrollY);

            // draw pixel
            this.paintPixel(ctx, pixel);

            // reset scroll
            ctx.translate(-scrollX, -scrollY);
        }

        // reset zoom
        ctx.scale(1 / zoom, 1 / zoom);
        ctx.translate(-dx, -dy);
    }

    public zoom = (dz: number) => {
        const { zoom } = this.state;
        this.setState({
            zoom: normalizeZoom(zoom + dz)
        });
    };

    public scroll = (dx: number, dy: number) => {
        const { scrollX, scrollY } = this.state;
        this.setState({
            scrollX: (scrollX + dx),
            scrollY: (scrollY + dy),
        });
    };

    private handleCanvasRef = (canvas: HTMLCanvasElement) => {
        this.canvas = canvas;
        this.addEventListeners();
    };

    private addEventListeners() {
        this.canvas.addEventListener("wheel", this.handleWheel);
        this.canvas.addEventListener("click", this.handleClick);
    }

    private handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        if (e.ctrlKey) {
            this.zoom(-e.deltaY * 0.05);
        } else {
            this.scroll(-e.deltaX, -e.deltaY);
        }
    };

    private handleClick = (e: MouseEvent) => {
        const { pixels } = this.state;
        const { x, y } = this.normalizeClick(e.clientX, e.clientY);

        pixels.push(new Pixel(x, y, 20, "black"));
        this.setState({
            pixels
        });
    };

    private paintPixel = (ctx: CanvasRenderingContext2D, pixel: Pixel) => {
        const { size, color, coords } = pixel;
        const { x, y } = coords;
        const normalizedX = Math.floor(x / size) * size;
        const normalizedY = Math.floor(y / size) * size;
        
        ctx.fillStyle = color;
        ctx.fillRect(normalizedX, normalizedY, size, size);
    };

    private normalizeClick = (x: number, y: number) => {
        const { zoom, scrollX, scrollY, width, height } = this.state;
        const dx = (-width * (zoom - 1)) / 2;
        const dy = (-height * (zoom - 1)) / 2;
        return {
            x: (x - dx) / zoom - scrollX,
            y: (y - dy) / zoom - scrollY, 
        }
    };
}

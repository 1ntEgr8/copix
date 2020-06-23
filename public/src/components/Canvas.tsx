import * as React from "react";
import { AppState } from "../appState";
import { ToolBox } from "./ToolBox";

export class Canvas extends React.Component<AppState> {
    canvas: HTMLCanvasElement | null = null;

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
                        ref={canvas => (this.canvas = canvas)}
                        width={window.innerWidth}
                        height={window.innerHeight}
                    />
                </main>
                <ToolBox />
            </div>
        );
    }
}

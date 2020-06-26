import * as React from "react";
import { Zoom } from "./Zoom";
import { Palette } from "./Palette";

export class ToolBox extends React.Component<any> {
    constructor(props: any) {
        super(props);
    }

    public render() {
        const { zoom, onZoom } = this.props;
        return (
            <div className="toolbox">
                <Palette/>
                <Zoom
                    zoom={zoom}
                    onZoom={onZoom}
                />
            </div>
        );
    }
}

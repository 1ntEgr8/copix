import * as React from "react";
import { Zoom } from "./Zoom";
import { Palette } from "./Palette";

export class ToolBox extends React.Component {
    constructor(props: any) {
        super(props);
    }

    public render() {
        return (
            <div className="toolbox">
                <Palette/>
                <Zoom/>
            </div>
        );
    }
}

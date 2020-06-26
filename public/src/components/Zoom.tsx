import * as React from "react";

export function Zoom(props: any) {
    const { zoom, onZoom } = props;
    return (
        <div className="copix-zoom">
            <div>{Math.round(zoom * 100)}%</div>
            <button onClick={() => onZoom(0.1)}>&#43;</button>
            <button onClick={() => onZoom(-0.1)}>&#8722;</button>
        </div>
    );
}

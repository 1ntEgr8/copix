import * as React from "react";

export function Zoom(props: any) {
    return (
        <div className="copix-zoom">
            <button onClick={() => props.onZoom(1)}>&#43;</button>
            <button onClick={() => props.onZoom(-1)}>&#8722;</button>
        </div>
    );
}

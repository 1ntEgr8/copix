import { CanvasState } from "./components/Canvas";
// other things to include in AppState
//
// number of users
// name of the art piece
// frames
// which frame is being rendered
// socket connection if public

export function defaultAppState(): AppState {
    return {
        canvasState: {
            width: window.innerWidth,
            height: window.innerHeight,
            pixels: [],
            zoom: 1,
            scrollX: 0,
            scrollY: 0,
        }
    }
}

export interface AppState {
    canvasState: CanvasState,
}

import { Pixel } from './pixel';

export function defaultAppState(): AppState {
    return {
        pixels: [],
        zoom: 1,
        scrollX: 0,
        scrollY: 0,
    }
}

export interface AppState {
    pixels: Pixel[],
    zoom: number,
    scrollX: number,
    scrollY: number
}

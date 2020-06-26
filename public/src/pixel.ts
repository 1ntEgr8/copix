import { Point } from './point';
import { Color } from './color';

export class Pixel {
    size: number;
    color: Color;
    coords: Point;

    constructor(x: number, y: number, size: number, color: string) {
        this.coords = new Point(x, y);
        this.size = size;
        this.color = color;
    }
}

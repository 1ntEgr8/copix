export function normalizeZoom(zoom: number) {
    zoom = parseFloat(zoom.toFixed(2));

    return Math.max(0.1, Math.min(zoom, 4));
}

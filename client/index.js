const PIXEL_SIZE = 20;
const CANVAS_HEIGHT = 600;
const CANVAS_WIDTH = 1000;
const paletteColors = [
    'red',
    'green',
    'blue',
    'yellow',
    'black',
    'white'
];

const coords = document.getElementById('coords');
const palette = document.getElementById('palette');
const canvas = document.querySelector('#the-board');
const ctx = canvas.getContext('2d');

const socket = new WebSocket("ws://localhost:9001");
socket.addEventListener('open', function () {
    // socket.send('nickname:tommy');
});
socket.addEventListener('message', function (e) {
    let pixels = e.data.split("/");
    for (let pixel of pixels) {
        let [coords, color] = pixel.split(";");
        let [x, y] = coords.split(",");
        ctx.fillStyle = color;
        ctx.fillRect(parseInt(x), parseInt(y), PIXEL_SIZE, PIXEL_SIZE);
    }
});

canvas.height = CANVAS_HEIGHT;
canvas.width = CANVAS_WIDTH;

generatePalette();

canvas.addEventListener('mousemove', (e) => {
    coords.innerHTML = `(${e.offsetX}, ${e.offsetY})`;
});

const paintCellCallback = e => paintCell(e.offsetX, e.offsetY);
canvas.addEventListener('mousedown', (e) => {
    paintCell(e.offsetX, e.offsetY); 
    canvas.addEventListener('mousemove', paintCellCallback);
});
canvas.addEventListener('mouseup', () => {
    canvas.removeEventListener('mousemove', paintCellCallback);
});

function paintCell(offsetX, offsetY) {
    let x = Math.floor(offsetX / PIXEL_SIZE) * PIXEL_SIZE;
    let y = Math.floor(offsetY / PIXEL_SIZE) * PIXEL_SIZE;

    ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
    socket.send(`${x},${y};${ctx.fillStyle}`);
}

function generatePalette() {
    for (let color of paletteColors) {
        const opt = document.createElement('div');
        opt.classList.add('palette__option');
        opt.style.background = color;
        opt.addEventListener('click', () => {
            ctx.fillStyle = color;
        });
        palette.appendChild(opt);
    }
}

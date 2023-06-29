import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";
import { Cell, Universe } from "wasm-game-of-life";

const universe = Universe.new();
const width = universe.width();
const height = universe.height();
const canvas = document.querySelector('canvas');
canvas.width = (width + 1) + CELL_SIZE + 1;
canvas.height = (height + 1) + CELL_SIZE + 1;

const renderLoop = () => {
  pre.textContent = universe.render();
  universe.tick();

  drawGrid();
};

const CELL_SIZE = 5;
const GRID_COLOR = "#808080";
const ALIVE_COLOR = "#FFFFFF";
const ctx = canvas.getContext('2d');
const DEAD_COLOR = "#000000";

const drawGrid = () => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;

    for (let i = 0; i <= width; i++) {
        ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
        ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
    }

    for (let j = 0; j <= height; j++) {
        ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
        ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
    }

    ctx.stroke();
};

const getIndex = (row, col) => {
    return row * width + col;
};

const drawCells = () => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

    ctx.beginPath();

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);
            ctx.fillStyle = cells[idx] === Cell.Dead
                ? DEAD_COLOR
                : ALIVE_COLOR;

            ctx.fillRect(
                col * (CELL_SIZE + 1) + 1,
                row * (CELL_SIZE + 1) + 1,
                CELL_SIZE,
                CELL_SIZE
            );
        }
    }

    ctx.stroke();
};

drawGrid();
drawCells();
requestAnimationFrame(renderLoop);

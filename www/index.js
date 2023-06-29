import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";
import { Cell, Universe } from "wasm-game-of-life";

const universe = Universe.new();
const width = universe.width();
const height = universe.height();
const canvas = document.querySelector('canvas');
canvas.width = (width + 1) + CELL_SIZE + 1;
canvas.height = (height + 1) + CELL_SIZE + 1;
let animationId = null;

class fps {
    constructor() {
        this.timings = [];
        this.lastTime = window.performance.now();
    }

    render() {
        const currentTime = window.performance.now();
        const timeDifference = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.timings.push(timeDifference);
        if (this.timings.length > 100) {
            this.timings.shift();
        }

        // TODO: The demo includes a max of infinity and a min of negative infinity.
        const average = this.timings.reduce((a, b) => a + b) / this.timings.length;
        const min = Math.min(...this.timings);
        const max = Math.max(...this.timings);

        const fpsElement = document.getElementById('fps');
        fpsElement.textContent = `Frames per second: Latest = ${timeDifference.toFixed(2)}, Average = ${average.toFixed(2)}, Min = ${min.toFixed(2)}, Max = ${max.toFixed(2)}`;
    }
}

const fpsInstance = new fps();

const renderLoop = () => {
  fpsInstance.render();

  universe.tick();

  drawGrid();
  drawCells();

  animationId = requestAnimationFrame(renderLoop);
};

const isPaused = () => {
    return animationId === null;
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

    // Draw alive cells
    ctx.fillStyle = ALIVE_COLOR;
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);
            if (cells[idx] !== Cell.Dead) {
                ctx.fillRect(
                    col * (CELL_SIZE + 1) + 1,
                    row * (CELL_SIZE + 1) + 1,
                    CELL_SIZE,
                    CELL_SIZE
                );
            }
        }
    }

    // Draw dead cells
    ctx.fillStyle = DEAD_COLOR;
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);
            if (cells[idx] === Cell.Dead) {
                ctx.fillRect(
                    col * (CELL_SIZE + 1) + 1,
                    row * (CELL_SIZE + 1) + 1,
                    CELL_SIZE,
                    CELL_SIZE
                );
            }
        }
    }

    ctx.stroke();
};

drawGrid();
drawCells();
play();

const playPauseButton = document.getElementById('play-pause');

const play = () => {
    playPauseButton.textContent = "||";
    renderLoop();
};

const pause = () => {
    playPauseButton.textContent = ">";
    cancelAnimationFrame(animationId);
    animationId = null;
};

playPauseButton.addEventListener('click', () => {
    if (isPaused()) {
        play();
    } else {
        pause();
    }
});

canvas.addEventListener('click', event => {
    const boundingRect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / boundingRect.width;
    const scaleY = canvas.height / boundingRect.height;

    const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
    const canvasTop = (event.clientY - boundingRect.top) * scaleY;

    const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
    const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

    universe.toggle_cell(row, col);
    drawGrid();
    drawCells();
});

const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
const nextCanvas = document.getElementById("next");
const nextContext = nextCanvas.getContext("2d");
const scoreDisplay = document.getElementById("score");

// 画布缩放
context.scale(30, 30);
nextContext.scale(20, 20);

// 游戏区域
const ROWS = 20;
const COLS = 10;
const EMPTY = 0;

// 方块形状
const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1], [1, 1]], // O
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1, 0], [0, 1, 1]], // Z
    [[1, 0, 0], [1, 1, 1]], // L
    [[0, 0, 1], [1, 1, 1]]  // J
];

// 颜色
const COLORS = [
    "#000000", // 背景色
    "#FF0D72", // I
    "#0DC2FF", // T
    "#0DFF72", // O
    "#F538FF", // S
    "#FF8E0D", // Z
    "#FFE138", // L
    "#3877FF"  // J
];

// 初始化游戏区域
let board = [];
for (let row = 0; row < ROWS; row++) {
    board.push(new Array(COLS).fill(EMPTY));
}

// 当前方块和下一个方块
let currentPiece;
let nextPiece;

// 得分
let score = 0;

// 游戏状态
let isPaused = false;

// 初始化游戏
function init() {
    currentPiece = createPiece();
    nextPiece = createPiece();
    drawNextPiece();
    updateScore(0);
    drawBoard();
    drawPiece();
}

// 创建随机方块
function createPiece() {
    const randomIndex = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[randomIndex];
    return {
        shape,
        color: randomIndex + 1,
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0
    };
}

// 绘制游戏区域
function drawBoard() {
    context.fillStyle = COLORS[0];
    context.fillRect(0, 0, COLS, ROWS);

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] !== EMPTY) {
                context.fillStyle = COLORS[board[row][col]];
                context.fillRect(col, row, 1, 1);
            }
        }
    }
}

// 绘制当前方块
function drawPiece() {
    currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                context.fillStyle = COLORS[currentPiece.color];
                context.fillRect(currentPiece.x + dx, currentPiece.y + dy, 1, 1);
            }
        });
    });
}

// 绘制下落位置辅助线
function drawGhostPiece() {
    const ghostY = calculateGhostY();
    context.strokeStyle = "#FFFFFF";
    context.lineWidth = 0.1;
    currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                context.strokeRect(currentPiece.x + dx, ghostY + dy, 1, 1);
            }
        });
    });
}

// 计算下落位置
function calculateGhostY() {
    let ghostY = currentPiece.y;
    while (!collide(currentPiece.shape, currentPiece.x, ghostY + 1)) {
        ghostY++;
    }
    return ghostY;
}

// 绘制下一个方块
function drawNextPiece() {
    nextContext.fillStyle = COLORS[0];
    nextContext.fillRect(0, 0, 6, 6);

    nextPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                nextContext.fillStyle = COLORS[nextPiece.color];
                nextContext.fillRect(dx, dy, 1, 1);
            }
        });
    });
}

// 更新得分
function updateScore(points) {
    score += points;
    scoreDisplay.textContent = score;
}

// 检查碰撞
function collide(shape, x, y) {
    for (let dy = 0; dy < shape.length; dy++) {
        for (let dx = 0; dx < shape[dy].length; dx++) {
            if (shape[dy][dx] && (board[y + dy] && board[y + dy][x + dx]) !== EMPTY) {
                return true;
            }
        }
    }
    return false;
}

// 固定方块
function freeze() {
    const { shape, x, y, color } = currentPiece;
    shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                board[y + dy][x + dx] = color;
            }
        });
    });
    clearLines();
    currentPiece = nextPiece;
    nextPiece = createPiece();
    drawNextPiece();
    if (collide(currentPiece.shape, currentPiece.x, currentPiece.y)) {
        alert("游戏结束！得分: " + score);
        board = board.map(row => row.fill(EMPTY));
        score = 0;
        updateScore(0);
    }
}

// 清除满行
function clearLines() {
    let linesCleared = 0;
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== EMPTY)) {
            board.splice(row, 1);
            board.unshift(new Array(COLS).fill(EMPTY));
            linesCleared++;
        }
    }
    if (linesCleared > 0) {
        updateScore(linesCleared * 100);
    }
}

// 移动方块
function movePiece(dx, dy) {
    currentPiece.x += dx;
    currentPiece.y += dy;
    if (collide(currentPiece.shape, currentPiece.x, currentPiece.y)) {
        currentPiece.x -= dx;
        currentPiece.y -= dy;
        if (dy === 1) {
            freeze();
        }
    }
    drawBoard();
    drawGhostPiece();
    drawPiece();
}

// 快速下落
function dropPiece() {
    while (!collide(currentPiece.shape, currentPiece.x, currentPiece.y + 1)) {
        currentPiece.y++;
    }
    freeze();
}

// 旋转方块
function rotatePiece() {
    const { shape } = currentPiece;
    const rotated = shape[0].map((_, i) => shape.map(row => row[i]).reverse());
    const prevShape = currentPiece.shape;
    currentPiece.shape = rotated;
    if (collide(currentPiece.shape, currentPiece.x, currentPiece.y)) {
        currentPiece.shape = prevShape;
    }
    drawBoard();
    drawGhostPiece();
    drawPiece();
}

// 暂停/恢复游戏
function togglePause() {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? "恢复" : "暂停";
    if (!isPaused) {
        gameLoop(); // 恢复游戏循环
    }
}

// 获取控制按钮
const leftButton = document.getElementById("left");
const rightButton = document.getElementById("right");
const downButton = document.getElementById("down");
const rotateButton = document.getElementById("rotate");
const dropButton = document.getElementById("drop");
const pauseButton = document.getElementById("pause");

// 为按钮添加事件监听器
leftButton.addEventListener("click", () => movePiece(-1, 0));
rightButton.addEventListener("click", () => movePiece(1, 0));
downButton.addEventListener("click", () => movePiece(0, 1));
rotateButton.addEventListener("click", rotatePiece);
dropButton.addEventListener("click", dropPiece);
pauseButton.addEventListener("click", togglePause);

// 键盘事件监听器
document.addEventListener("keydown", event => {
    if (event.key === "Shift") {
        togglePause();
    }
    if (!isPaused) {
        if (event.key === "ArrowLeft") {
            movePiece(-1, 0);
        } else if (event.key === "ArrowRight") {
            movePiece(1, 0);
        } else if (event.key === "ArrowDown") {
            movePiece(0, 1);
        } else if (event.key === "ArrowUp") {
            rotatePiece();
        } else if (event.key === " ") {
            dropPiece();
        }
    }
});

let fallInterval = 1000; // 初始下落间隔时间

// 游戏循环
function gameLoop() {
    if (!isPaused) {
        movePiece(0, 1);
        drawBoard();
        drawGhostPiece();
        drawPiece();
        setTimeout(gameLoop, fallInterval); // 使用变量控制下落速度
    }
}

// 根据得分调整下落速度
function updateScore(points) {
    score += points;
    scoreDisplay.textContent = score;

    // 每得 100 分，加快下落速度
    if (score % 100 === 0 && fallInterval > 200) {
        fallInterval -= 100; // 每次减少 100 毫秒
    }
}
// 启动游戏
init();
gameLoop();

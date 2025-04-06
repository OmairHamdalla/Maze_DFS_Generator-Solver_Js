const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const startGameButton = document.getElementById('startGameButton');
const testAlgorithmButton = document.getElementById('testAlgorithmButton');
const solveButton = document.getElementById('solveButton');
const resetButton = document.getElementById('resetButton');
const controls = document.getElementById('controls');

// Maze dimensions and cell size (aka how chunky the maze looks)
const rows = 20, cols = 20, cellSize = 20;
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

// core game state variables
let maze = [],             // The actual maze grid
    stack = [],            // Stack for maze generation (DFS-style)
    player,                // Player position
    solving = false,       // Are we solving the maze right now?
    solvingStack = [],     // Stack for solving 
    mazeGenerated = false; // Flag to know if the maze is ready

solveButton.disabled = true; 

// structure maze state
function setup(animate = false) {
    mazeGenerated = false;

    // Initialize 2D maze grid
    maze = Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => ({
            r, c,
            walls: [true, true, true, true], // Top, Right, Bottom, Left
            visited: false,
            inPath: false // This is for the "solving" animation
        }))
    );

    // place player at top left
    player = { r: 0, c: 0 };

    // Start with the very first cell in the stack
    stack = [maze[0][0]];
    stack[0].visited = true;

    drawMaze();             // draw the empty maze frame first
    generateMaze(animate);  // let the madness begin
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    maze.flat().forEach(({ r, c, walls, visited, inPath }) => {
        const x = c * cellSize, y = r * cellSize;

        // Draw walls
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        if (walls[0]) ctx.strokeRect(x, y, cellSize, 0);           // Top
        if (walls[1]) ctx.strokeRect(x + cellSize, y, 0, cellSize); // Right
        if (walls[2]) ctx.strokeRect(x, y + cellSize, cellSize, 0); // Bottom
        if (walls[3]) ctx.strokeRect(x, y, 0, cellSize);            // Left

        if (inPath) { // solving path
            ctx.fillStyle = 'rgba(0, 0, 255, 0.4)'; 
            ctx.fillRect(x, y, cellSize, cellSize);
        } else if (visited) { // visited cells (not correct)
            ctx.fillStyle = 'rgba(255, 105, 180, 0.3)'; 
            ctx.fillRect(x, y, cellSize, cellSize);
        }
    });

    ctx.fillStyle = 'orange'; // Player
    ctx.fillRect(player.c * cellSize, player.r * cellSize, cellSize, cellSize);
    ctx.fillStyle = 'purple'; // End point
    ctx.fillRect((cols - 1) * cellSize, (rows - 1) * cellSize, cellSize, cellSize);
}

// removes walls between two adjacent cells
function removeWalls(cell1, cell2) {
    const dx = cell1.c - cell2.c, dy = cell1.r - cell2.r;

    if (dx === 1) [cell1.walls[3], cell2.walls[1]] = [false, false]; // cell2 is left
    else if (dx === -1) [cell1.walls[1], cell2.walls[3]] = [false, false]; // right

    if (dy === 1) [cell1.walls[0], cell2.walls[2]] = [false, false]; // above
    else if (dy === -1) [cell1.walls[2], cell2.walls[0]] = [false, false]; // below
}

// Recursive depth-first generation of the maze
function generateMaze(animate) {
    if (stack.length) {
        const cell = stack.at(-1); // peek the last cell
        const neighbors = getUnvisitedNeighbors(cell);

        if (neighbors.length) {
            // pick a random unvisited neighbor
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            next.visited = true;
            stack.push(next);
            removeWalls(cell, next);
        } else {
            stack.pop(); // dead end and backtracking
        }

        if (animate) {
            drawMaze(); 
            requestAnimationFrame(() => generateMaze(true));
        } else {
            generateMaze(false); // pure speed run
        }

    } else {
        // maze is done, prep it for solving
        maze.flat().forEach(cell => cell.visited = false); // resetting cells
        mazeGenerated = true;
        solveButton.disabled = false;
        drawMaze();
    }
}

// Get all unvisited neighbors of cell
function getUnvisitedNeighbors({ r, c }) {
    return [
        [r - 1, c, 0, 2], // Top
        [r + 1, c, 2, 0], // Bottom
        [r, c - 1, 3, 1], // Left
        [r, c + 1, 1, 3]  // Right
    ]
    .filter(([nr, nc]) => maze[nr]?.[nc] && !maze[nr][nc].visited)
    .map(([nr, nc]) => maze[nr][nc]);
}

// Solving maze, DFS to the rescue again
function solveMaze() {
    if (!mazeGenerated || solving) return;

    solving = true;
    solvingStack = [maze[0][0]];

    maze.flat().forEach(cell => { cell.visited = false; cell.inPath = false;});

    maze[0][0].visited = true;
    maze[0][0].inPath = true;

    requestAnimationFrame(findPath); // let the drama unfold frame-by-frame
}

// path finder
function findPath() {
    if (!solvingStack.length || !solving) {
        solving = false;
        return;
    }
    const cell = solvingStack.at(-1);

    // end cell reached
    if (cell.r === rows - 1 && cell.c === cols - 1) {
        solving = false;
        return;
    }
    const next = getUnvisitedSolvingNeighbors(cell);

    if (next.length) {
        const chosen = next[0];
        chosen.visited = true;
        chosen.inPath = true;
        solvingStack.push(chosen);
    } else {
        const popped = solvingStack.pop();
        popped.inPath = false; // not part of final path.
    }

    drawMaze();
    requestAnimationFrame(findPath);
}

// neighbors to be visited
function getUnvisitedSolvingNeighbors({ r, c, walls }) {
    return [
        [r - 1, c, 0], // Top
        [r + 1, c, 2], // Bottom
        [r, c - 1, 3], // Left
        [r, c + 1, 1]  // Right
    ]
    .filter(([nr, nc, w]) => maze[nr]?.[nc] && !maze[nr][nc].visited && !walls[w]) // check for blocks
    .map(([nr, nc]) => maze[nr][nc]);
}

// keyboard controls to move the player around manually like a peasant
function movePlayer({ key }) {
    const moves = {
        ArrowUp: [0, -1, 0],
        ArrowDown: [0, 1, 2],
        ArrowLeft: [-1, 0, 3],
        ArrowRight: [1, 0, 1]
    };

    if (!moves[key]) return;
    const [dx, dy, w] = moves[key];
    const { r, c } = player;

    if (!maze[r][c].walls[w]) {
        player.r += dy;
        player.c += dx;
    }

    drawMaze();

    if (player.r === rows - 1 && player.c === cols - 1) alert('You won!');
}

// --- BUTTON LOGIC ---

startGameButton.addEventListener('click', () => {
    controls.style.display = 'none'; solveButton.disabled = true; setup(false); // No animation, instant maze
});

testAlgorithmButton.addEventListener('click', () => {
    controls.style.display = 'block';
    solveButton.disabled = true;
    setup(true); // animated generation
});

solveButton.addEventListener('click', solveMaze);

resetButton.addEventListener('click', () => { solveButton.disabled = true; setup(true); // reset with animation
});

// get keys
document.addEventListener('keydown', movePlayer);

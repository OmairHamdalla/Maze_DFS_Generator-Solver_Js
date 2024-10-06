const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const solveButton = document.getElementById('solveButton');
const resetButton = document.getElementById('resetButton');


// Parameters
const rows = 20;
const cols = 20;
const cellSize = 20;

canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let maze = [];
let stack = [];
let currentCell;
let player;
let solving = false;
let solvingStack = [];

// Initializer
function setup() {
    maze = [];
    stack = [];
    solving = false;
    solvingStack = [];
    // setting rows and columns
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            row.push({
                r,
                c,
                walls: [true,true,true,true],
                visited: false
            });
        }
        maze.push(row);
    }
    currentCell = maze[0][0];
    currentCell.visited = true;
    stack.push(currentCell);
    player = {r: 0 , c:0 };
    drawMaze();
    generateMaze();
}



function drawMaze() {
    ctx.clearRect(0 , 0 , canvas.width , canvas.height);

    maze.forEach(
        row => {
            row.forEach(cell => {
                const { r, c, walls } = cell;
                const x = c *cellSize;
                const y = r *cellSize;

                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;

                if (walls[0]) ctx.strokeRect(x, y, cellSize, 0); // top one
                if (walls[1]) ctx.strokeRect(x + cellSize, y, 0, cellSize); // right
                if (walls[2]) ctx.strokeRect(x, y + cellSize, cellSize, 0); // bottommmm
                if (walls[3]) ctx.strokeRect(x, y, 0, cellSize); // left

                if (cell.visited){
                    ctx.fillStyle = 'rgba(255, 126, 95, 0.3)';
                    ctx.fillRect(x,y, cellSize,cellSize);
                }

            });
        }
    );

    // Player square
    ctx.fillStyle = 'orange';
    ctx.fillRect(player.c * cellSize, player.r * cellSize, cellSize, cellSize);

    // The goal to reach
    ctx.fillStyle = 'purple';
    ctx.fillRect((cols-1) * cellSize, (rows-1) * cellSize, cellSize, cellSize);
}

function removeWalls(cell1, cell2) {

    // removing walls based on cells and directions

    const x = cell1.c - cell2.c;
    if (x === 1){
        cell1.walls[3] = false;
        cell2.walls[1] = false;
    } 
    else if (x === -1){
        cell1.walls[1] = false;
        cell2.walls[3] = false;
    }

    const y = cell1.r - cell2.r;
    if (y === 1){
        cell1.walls[0] = false;
        cell2.walls[2] = false;
    } 
    else if (y === -1){
        cell1.walls[2] = false;
        cell2.walls[0] = false;
    }

}

function getUnvisitedNeighbors(cell) {
    const neighbors = [];
    const { r, c } = cell;

    if (r > 0 && !maze[r - 1][c].visited)           neighbors.push(maze[r-1][c]);
    if (r < rows-1 && !maze[r + 1][c].visited)      neighbors.push(maze[r+1][c]);
    if (c > 0 && !maze[r][c - 1].visited)           neighbors.push(maze[r][c-1]);
    if (c < cols-1 && !maze[r][c + 1].visited)      neighbors.push(maze[r][c+1]);

    return neighbors;
}

// function to generate the maze with depth first and backtracking.
function generateMaze() {
    if (stack.length > 0) {
        const neighbors = getUnvisitedNeighbors(currentCell);
        // get a neighbor mark and it as visited, and remove walls between the current cell and the chosen neighbor.
        if (neighbors.length > 0) {
            const nextCell = neighbors[ Math.floor( Math.random() * neighbors.length ) ];
            nextCell.visited = true;
            stack.push(nextCell);
            removeWalls(currentCell,nextCell);
            currentCell = nextCell;
        } else {
            // Stacks to backtrack if no unvisited neighbors are left.
            currentCell = stack.pop();
        }

        // Redraw the maze
        drawMaze();
        requestAnimationFrame(generateMaze);

    } else {
        drawMaze();
    }
}

function solveMaze() {
    if (solving) return; // error handled so user only clicks once
    solving = true;
    solvingStack = [maze[0][0]]; // top left
    maze.forEach(row => row.forEach(cell => cell.visited = false));
    maze[0][0].visited = true;
    findPath();
}

function getUnvisitedSolvingNeighbors(cell) {
    const neighbors = [];
    const { r, c } = cell;
    //  Add required neighbors based on walls and visited status to the array
    if (r > 0 && !maze[r - 1][c].visited && !cell.walls[0]) neighbors.push(maze[r - 1][c]);
    if (r < rows - 1 && !maze[r + 1][c].visited && !cell.walls[2]) neighbors.push(maze[r + 1][c]);
    if (c > 0 && !maze[r][c - 1].visited && !cell.walls[3]) neighbors.push(maze[r][c - 1]);
    if (c < cols - 1 && !maze[r][c + 1].visited && !cell.walls[1]) neighbors.push(maze[r][c + 1]);

    return neighbors;
}

function findPath() {
    if (solvingStack.length > 0){
        const currentCell = solvingStack[solvingStack.length - 1];

        // If the player reaches the bottom-right corner which is the goal, stop solving.
        
        if (currentCell.r === rows - 1 && currentCell.c === cols - 1){
            solving = false;
            return;
        }
        const neighbors = getUnvisitedSolvingNeighbors(currentCell);

        // if we have neighours check the way
        if (neighbors.length > 0){
            const nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
            nextCell.visited = true;
            solvingStack.push(nextCell); // add to stack to backtrack when no solution is found
        } else {
            solvingStack.pop();  // backtrack when no neighbors are left
        }

        drawMaze();
        solvingStack.forEach(cell => {
            ctx.fillStyle = 'rgba(95, 126, 255, 0.5)';
            ctx.fillRect(cell.c * cellSize, cell.r * cellSize, cellSize, cellSize);
        });
        requestAnimationFrame(findPath);

    } else {
        solving = false;
    }
}


// setting buttons and coordinates of moving
// r is along row , c is along column
function movePlayer(event) {
    const {r , c} = player;
    switch (event.key){
        case 'ArrowUp':
            if (r > 0 && !maze[r][c].walls[0]) player.r--;
            break;
        case 'ArrowDown':
            if (r < rows - 1 && !maze[r][c].walls[2]) player.r++;
            break;
        case 'ArrowLeft':
            if (c > 0 && !maze[r][c].walls[3]) player.c--;
            break;
        case 'ArrowRight':
            if (c < cols - 1 && !maze[r][c].walls[1]) player.c++;
            break;
    }
    drawMaze();
    if (player.r === rows - 1 && player.c === cols - 1) {
        alert('Eyyoo , You won !!!');
    }
}

document.addEventListener('keydown' , movePlayer);
solveButton.addEventListener('click' , solveMaze);
resetButton.addEventListener('click' , setup);

setup();

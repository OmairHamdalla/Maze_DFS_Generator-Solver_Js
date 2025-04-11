
# 🧩 Maze Game Generator & Solver using JS

This project is an interactive maze generator and solver built using **HTML5 Canvas** and **JavaScript**. It features animated maze generation, a manual play mode, and an auto-solving visualization using **Depth-First Search (DFS)**.

---

## Features

- ✅ Maze Generation using Recursive Backtracking (DFS)
- 🎮 Keyboard Movement (Arrow Keys) to manually play the maze
- 🤖 Auto Solve option with animations
- 🎨 Animated maze creation 
- 🔄 Maze reset and regeneration
- 📦 Lightweight and dependency-free (Vanilla JS)

---

## How It Works

### Maze Setup

- A 2D grid of rows x cols cells is created.
- Each cell has 4 walls: Top, Right, Bottom, Left (represented as [true, true, true, true]).
- Start from cell (0, 0) and perform **Depth-First Search** recursively.
- At each step:
  - Pick a random unvisited neighbor.
  - Remove the wall between the current and next cell.
  - Recurse to the neighbor.
  - Continue until all cells are visited.
- Backtracking is used when a dead end is reached.

### Maze Solving

- Also uses **Depth-First Search** from the start cell (0, 0).
- Checks unvisited neighbors that are not blocked by walls.
- Recursively try all paths until the goal is reached and a path is drawn from start to finish.
  - Highlights every cell in current solution path with blue until it reaches the goal.
  - Highlights visited cells with pink color if the current path led to a deadend, it backtracks and colors the cell.

### Player Control ( Play mode )

- The player starts at the top-left cell (0, 0).
- You can move the player by using the arrow keys.
- If the player reaches the bottom-right cell (rows-1, cols-1), a victory message appears.


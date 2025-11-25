
import { Room, RoomType, NPC, Gender } from '../types';

export const MAZE_SIZE = 5;

const NPC_ROSTER: { role: string; gender: Gender }[] = [
  { role: 'Court Jester', gender: 'male' },
  { role: 'Old Librarian', gender: 'female' },
  { role: 'Castle Guard', gender: 'male' },
  { role: 'Lost Spirit', gender: 'female' },
  { role: 'Royal Alchemist', gender: 'male' },
  { role: 'Wandering Bard', gender: 'male' },
  { role: 'Crypt Keeper', gender: 'male' },
  { role: 'High Priestess', gender: 'female' }
];

export const generateMaze = (): Room[][] => {
  // Initialize grid
  const grid: Room[][] = [];
  for (let y = 0; y < MAZE_SIZE; y++) {
    const row: Room[] = [];
    for (let x = 0; x < MAZE_SIZE; x++) {
      row.push({
        x,
        y,
        type: getRandomRoomType(),
        visited: false,
        cleared: false,
        npc: Math.random() > 0.7 ? generateNPC() : undefined,
        walls: { north: true, south: true, east: true, west: true }
      });
    }
    grid.push(row);
  }

  // Recursive Backtracker for maze generation
  const stack: { x: number; y: number }[] = [];
  const visited = new Set<string>();
  
  let currentX = 0;
  let currentY = 0;
  visited.add(`${currentX},${currentY}`);
  stack.push({ x: currentX, y: currentY });

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current.x, current.y, visited);

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      removeWalls(grid, current.x, current.y, next.x, next.y);
      visited.add(`${next.x},${next.y}`);
      stack.push(next);
    } else {
      stack.pop();
    }
  }

  // Open start room
  grid[0][0].visited = true;
  grid[0][0].cleared = true;
  // Ensure no NPC in start room to avoid clutter
  grid[0][0].npc = undefined;

  // Set Goal Room (Bottom Right)
  const goalRoom = grid[MAZE_SIZE - 1][MAZE_SIZE - 1];
  goalRoom.type = RoomType.THRONE_ROOM;
  goalRoom.npc = { role: 'King', name: 'The King', gender: 'male' };

  return grid;
};

function generateNPC(): NPC {
  const selection = NPC_ROSTER[Math.floor(Math.random() * NPC_ROSTER.length)];
  return {
    role: selection.role,
    name: selection.role,
    gender: selection.gender,
    avatarUrl: '' // Will remain empty as we bake into room image
  };
}

function getRandomRoomType(): RoomType {
  const types = Object.values(RoomType);
  // Exclude Throne Room from random generation to keep it unique as the goal
  const nonThroneTypes = types.filter(t => t !== RoomType.THRONE_ROOM);
  return nonThroneTypes[Math.floor(Math.random() * nonThroneTypes.length)];
}

function getUnvisitedNeighbors(x: number, y: number, visited: Set<string>) {
  const neighbors = [];
  if (y > 0 && !visited.has(`${x},${y - 1}`)) neighbors.push({ x, y: y - 1, dir: 'N' });
  if (y < MAZE_SIZE - 1 && !visited.has(`${x},${y + 1}`)) neighbors.push({ x, y: y + 1, dir: 'S' });
  if (x > 0 && !visited.has(`${x - 1},${y}`)) neighbors.push({ x: x - 1, y, dir: 'W' });
  if (x < MAZE_SIZE - 1 && !visited.has(`${x + 1},${y}`)) neighbors.push({ x: x + 1, y, dir: 'E' });
  return neighbors;
}

function removeWalls(grid: Room[][], x1: number, y1: number, x2: number, y2: number) {
  if (x1 === x2) {
    if (y1 < y2) { // Moving South
      grid[y1][x1].walls.south = false;
      grid[y2][x2].walls.north = false;
    } else { // Moving North
      grid[y1][x1].walls.north = false;
      grid[y2][x2].walls.south = false;
    }
  } else {
    if (x1 < x2) { // Moving East
      grid[y1][x1].walls.east = false;
      grid[y2][x2].walls.west = false;
    } else { // Moving West
      grid[y1][x1].walls.west = false;
      grid[y2][x2].walls.east = false;
    }
  }
}

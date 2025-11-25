export interface Question {
  question: string;
  answer: string;
  distractors: string[]; // Incorrect answers
}

export enum RoomType {
  HALLWAY = 'Hallway',
  LIBRARY = 'Library',
  DUNGEON = 'Dungeon',
  KITCHEN = 'Kitchen',
  THRONE_ROOM = 'Throne Room',
  COURTYARD = 'Courtyard',
  BEDROOM = 'Bedroom',
  LABORATORY = 'Alchemist Laboratory'
}

export type Gender = 'male' | 'female';

export interface NPC {
  role: string;
  name: string;
  gender: Gender;
  avatarUrl?: string; 
}

export interface Room {
  x: number;
  y: number;
  type: RoomType;
  visited: boolean;
  cleared: boolean; // Has the question been answered?
  imageUrl?: string; // Cached generated image
  npc?: NPC; // Optional NPC in the room
  walls: {
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
  };
}

export enum Direction {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  WEST = 'WEST'
}

export interface QuestionResult {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export type GameMode = 'classic' | 'timed' | 'turns';

export interface GameState {
  score: number;
  level: number;
  isGameOver: boolean;
  hasWon: boolean;
  history: QuestionResult[];
  mode: GameMode;
  remainingTime: number | null; // in seconds
  remainingTurns: number | null;
  failReason?: 'time' | 'turns';
}
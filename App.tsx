import React, { useState, useEffect } from 'react';
import { generateMaze, MAZE_SIZE } from './services/mazeService';
import { generateRoomImage, generateLore, generateSpeech } from './services/genai';
import { audioService } from './services/audioService';
import { Room, Direction, GameState, Question, NPC, GameMode } from './types';
import { Minimap } from './components/Minimap';
import { Controls } from './components/Controls';
import { QuestionModal } from './components/QuestionModal';
import { GameOverScreen } from './components/GameOverScreen';
import { StartScreen } from './components/StartScreen';
import { getRandomQuestion } from './data';

const TIME_LIMIT_SECONDS = 300; // 5 minutes
const TURN_LIMIT = 40;

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [maze, setMaze] = useState<Room[][]>([]);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [gameState, setGameState] = useState<GameState>({ 
    score: 0, 
    level: 1, 
    isGameOver: false,
    hasWon: false,
    history: [],
    mode: 'classic',
    remainingTime: null,
    remainingTurns: null
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isInteractingWithNPC, setIsInteractingWithNPC] = useState(false);

  // Timer Logic
  useEffect(() => {
    if (!gameStarted || gameState.isGameOver || gameState.mode !== 'timed') return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.remainingTime !== null && prev.remainingTime <= 0) {
          clearInterval(timer);
          return { ...prev, isGameOver: true, hasWon: false, failReason: 'time' };
        }
        return { ...prev, remainingTime: (prev.remainingTime || 0) - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameState.isGameOver, gameState.mode]);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => audioService.cleanup();
  }, []);

  const startNewGame = (mode: GameMode) => {
    const newMaze = generateMaze();
    setMaze(newMaze);
    setPos({ x: 0, y: 0 });
    setGameState({ 
      score: 0, 
      level: 1, 
      isGameOver: false, 
      hasWon: false, 
      history: [],
      mode,
      remainingTime: mode === 'timed' ? TIME_LIMIT_SECONDS : null,
      remainingTurns: mode === 'turns' ? TURN_LIMIT : null
    });
    setGameStarted(true);
    setMessage("Welcome to MindMaze. The path to the Throne Room awaits...");
    loadImage(newMaze[0][0]);
    setActiveQuestion(null);
    setTargetPos(null);
  };

  const resetGame = () => {
    setGameStarted(false);
  };

  // Enable audio on first user interaction
  const handleInteraction = () => {
    if (!isAudioEnabled) {
      audioService.init().then(() => {
        setIsAudioEnabled(true);
      });
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioService.toggleMute(newMuted);
  };

  const loadImage = async (room: Room) => {
    setIsLoadingImage(true);
    
    if (room.imageUrl) {
      setCurrentImage(room.imageUrl);
      setIsLoadingImage(false);
    } else {
      generateRoomImage(room.type, room.npc).then(url => {
        room.imageUrl = url;
        setCurrentImage(url);
        setIsLoadingImage(false);
      });
    }
  };

  const handleMove = (dir: Direction) => {
    handleInteraction(); 
    if (activeQuestion || isInteractingWithNPC || gameState.isGameOver) return;

    let nextX = pos.x;
    let nextY = pos.y;

    if (dir === Direction.NORTH) nextY--;
    if (dir === Direction.SOUTH) nextY++;
    if (dir === Direction.EAST) nextX++;
    if (dir === Direction.WEST) nextX--;

    // Validate bounds and walls
    const currentRoom = maze[pos.y][pos.x];
    let canMove = false;
    if (dir === Direction.NORTH && !currentRoom.walls.north) canMove = true;
    if (dir === Direction.SOUTH && !currentRoom.walls.south) canMove = true;
    if (dir === Direction.EAST && !currentRoom.walls.east) canMove = true;
    if (dir === Direction.WEST && !currentRoom.walls.west) canMove = true;

    if (canMove) {
      // Decrement turns immediately on attempt
      if (gameState.mode === 'turns') {
        const newTurns = (gameState.remainingTurns || 0) - 1;
        setGameState(prev => ({ ...prev, remainingTurns: newTurns }));
        
        if (newTurns < 0) {
           setGameState(prev => ({ ...prev, isGameOver: true, hasWon: false, failReason: 'turns' }));
           return;
        }
      }

      audioService.playFootstep();
      const targetRoom = maze[nextY][nextX];
      if (!targetRoom.visited) {
        setTargetPos({ x: nextX, y: nextY });
        setActiveQuestion(getRandomQuestion());
      } else {
        performMove(nextX, nextY);
      }
    }
  };

  const performMove = (x: number, y: number) => {
    setPos({ x, y });
    const newMaze = [...maze];
    newMaze[y][x].visited = true;
    newMaze[y][x].cleared = true;
    setMaze(newMaze);
    loadImage(newMaze[y][x]);
    setMessage(`You enter the ${newMaze[y][x].type}.`);

    if (x === MAZE_SIZE - 1 && y === MAZE_SIZE - 1) {
       handleWin();
    }
  };

  const handleWin = () => {
    setGameState(prev => ({ ...prev, isGameOver: true, hasWon: true }));
    audioService.playSpeech("Victory is yours, traveler.");
  };

  const handleAnswer = (selectedAnswer: string) => {
    if (!activeQuestion) return;

    const isCorrect = selectedAnswer === activeQuestion.answer;
    
    setGameState(prev => ({
      ...prev,
      history: [
        ...prev.history,
        {
          question: activeQuestion.question,
          selectedAnswer,
          correctAnswer: activeQuestion.answer,
          isCorrect
        }
      ]
    }));

    if (isCorrect) {
      setGameState(prev => ({ ...prev, score: prev.score + 100 }));
      if (targetPos) {
        performMove(targetPos.x, targetPos.y);
      }
      setActiveQuestion(null);
      setTargetPos(null);
    } else {
      setGameState(prev => ({ ...prev, score: Math.max(0, prev.score - 50) }));
      setMessage("Incorrect! The door remains barred.");
      setActiveQuestion(null);
      setTargetPos(null);
    }
  };

  const handleNPCClick = async (e: React.MouseEvent, npc: NPC) => {
    e.stopPropagation(); 
    handleInteraction();
    
    if (isInteractingWithNPC) return;
    setIsInteractingWithNPC(true);
    setMessage(`${npc.role} is speaking...`);

    const lore = await generateLore(npc.role);
    const speechBase64 = await generateSpeech(lore, npc.gender);

    if (speechBase64) {
      audioService.playSpeech(speechBase64);
    }
    setMessage(`"${lore}"`);
    setIsInteractingWithNPC(false);
  };

  // Helpers for display
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!gameStarted) {
    return <StartScreen onStart={startNewGame} />;
  }

  const currentRoom = maze.length ? maze[pos.y][pos.x] : null;
  const availableMoves = {
    [Direction.NORTH]: !currentRoom?.walls.north,
    [Direction.SOUTH]: !currentRoom?.walls.south,
    [Direction.EAST]: !currentRoom?.walls.east,
    [Direction.WEST]: !currentRoom?.walls.west,
  };

  if (!currentRoom) return <div className="text-white text-center mt-20 font-medieval text-2xl">Loading Castle...</div>;

  return (
    <div 
      className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden"
      onClick={handleInteraction}
    >
      <div className="relative w-full max-w-4xl aspect-[4/3] bg-[#1a1a1a] border-[12px] border-[#5c4033] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col">
        
        {/* Top Bar */}
        <div className="h-12 bg-[#3e2723] flex items-center justify-between px-4 border-b-4 border-[#8b4513] text-[#d4af37]">
          <span className="font-medieval text-xl tracking-widest hidden sm:block">MINDMAZE</span>
          
          {/* Stats Display */}
          <div className="flex items-center gap-4 md:gap-8 flex-1 justify-end sm:justify-end">
            {gameState.mode === 'timed' && (
              <div className={`font-mono font-bold ${gameState.remainingTime! < 30 ? 'text-red-500 animate-pulse' : ''}`}>
                ⏳ {formatTime(gameState.remainingTime || 0)}
              </div>
            )}
            {gameState.mode === 'turns' && (
              <div className={`font-mono font-bold ${gameState.remainingTurns! < 5 ? 'text-red-500 animate-pulse' : ''}`}>
                👣 Moves: {gameState.remainingTurns}
              </div>
            )}
            
            <div className="font-serif font-bold">SCORE: {gameState.score}</div>
            
            <div className="w-px h-6 bg-[#8b4513] mx-1"></div>

            {isAudioEnabled && (
              <button 
                onClick={toggleMute}
                className="hover:text-white transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? "🔇" : "🔊"}
              </button>
            )}
          </div>
        </div>

        {/* Main Viewport */}
        <div className="flex-1 relative bg-black overflow-hidden group">
          {isLoadingImage ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
              <div className="text-[#d4af37] font-medieval animate-pulse text-2xl">Conjuring Surroundings...</div>
            </div>
          ) : (
            <img 
              src={currentImage || ''} 
              alt="Room" 
              className="w-full h-full object-cover transition-opacity duration-500"
            />
          )}
          
          {/* Interaction Overlay for Baked-in NPC */}
          {currentRoom.npc && !isLoadingImage && !activeQuestion && !gameState.isGameOver && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
                <button 
                    onClick={(e) => handleNPCClick(e, currentRoom.npc!)}
                    disabled={isInteractingWithNPC}
                    className="bg-black/60 hover:bg-black/80 border-2 border-[#d4af37] text-[#d4af37] px-6 py-2 rounded-full font-medieval text-lg transition-all shadow-lg backdrop-blur-sm flex items-center gap-2"
                >
                    <span>🗣</span>
                    <span>Speak to {currentRoom.npc.role}</span>
                </button>
            </div>
          )}

          {/* Question Modal */}
          {activeQuestion && (
            <QuestionModal question={activeQuestion} onAnswer={handleAnswer} />
          )}

          {/* Game Over / Win Screen */}
          {gameState.isGameOver && (
            <GameOverScreen gameState={gameState} onRestart={resetGame} />
          )}
        </div>

        {/* Bottom Control Panel */}
        <div className="h-48 bg-[#2b1d16] border-t-4 border-[#8b4513] p-4 flex gap-4 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-30 pointer-events-none"></div>

          <div className="flex-1 bg-[#e6d2a0] border-4 border-[#5c4033] p-3 rounded shadow-inner overflow-y-auto relative z-10">
            <p className="font-serif text-[#3e2723] text-lg font-semibold">{message}</p>
            <p className="text-sm text-[#5d4037] mt-2 italic">Current Location: {currentRoom.type}</p>
          </div>

          <div className="w-48 flex-shrink-0 z-10 flex items-center justify-center">
            <Controls onMove={handleMove} availableMoves={availableMoves} />
          </div>

          <div className="w-48 flex-shrink-0 z-10 flex items-center justify-center">
            <Minimap grid={maze} currentX={pos.x} currentY={pos.y} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
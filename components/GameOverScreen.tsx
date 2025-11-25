import React from 'react';
import { GameState } from '../types';

interface GameOverScreenProps {
  gameState: GameState;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ gameState, onRestart }) => {
  const correctCount = gameState.history.filter(h => h.isCorrect).length;
  const totalCount = gameState.history.length;

  const getTitle = () => {
    if (gameState.hasWon) return "Victory Achieved!";
    if (gameState.failReason === 'time') return "Time Has Run Out";
    if (gameState.failReason === 'turns') return "Exhaustion Takes You";
    return "Journey's End";
  };

  const getDescription = () => {
    if (gameState.hasWon) return "You have reached the Throne Room and claimed your rightful place.";
    if (gameState.failReason === 'time') return "The castle fades into darkness as your time expires.";
    if (gameState.failReason === 'turns') return "You have no strength left to continue your quest.";
    return "Your quest has come to an end.";
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="max-w-3xl w-full max-h-[90vh] bg-[#f3e5ab] border-[8px] border-[#5c4033] rounded-lg shadow-2xl flex flex-col relative overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/parchment.png')] opacity-50 pointer-events-none"></div>
        
        {/* Header */}
        <div className="p-6 text-center border-b-4 border-[#8b4513] relative z-10 bg-[#e6d2a0]/50">
          <h1 className="text-4xl md:text-5xl font-medieval text-[#3e2723] mb-2">
            {getTitle()}
          </h1>
          <p className="font-serif text-xl text-[#5d4037] mb-4">
            {getDescription()}
          </p>
          
          <div className="flex justify-center gap-12 mt-2">
            <div className="text-center">
              <div className="text-xs font-bold text-[#5c4033] uppercase tracking-wider">Final Score</div>
              <div className="text-3xl font-bold text-[#8b4513]">{gameState.score}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-[#5c4033] uppercase tracking-wider">Wisdom</div>
              <div className="text-3xl font-bold text-[#8b4513]">{correctCount}/{totalCount}</div>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-6 relative z-10 scrollbar-thin">
          <h2 className="text-2xl font-medieval text-[#5c4033] mb-4 text-center sticky top-0 bg-[#f3e5ab] py-2 border-b-2 border-[#8b4513]/20 shadow-sm">
            Chronicles of Wisdom
          </h2>
          
          {gameState.history.length === 0 ? (
            <p className="text-center italic text-gray-600 mt-10">No questions were answered on this journey.</p>
          ) : (
            <div className="space-y-4">
              {gameState.history.map((item, idx) => (
                <div key={idx} className={`border-2 p-4 rounded-lg bg-white/40 shadow-sm ${item.isCorrect ? 'border-green-600/40 bg-green-50/30' : 'border-red-600/40 bg-red-50/30'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <p className="font-serif font-bold text-[#2c1810] text-lg mb-2 flex-1">
                      <span className="inline-block w-6 text-[#8b4513] opacity-60">{idx + 1}.</span> 
                      {item.question}
                    </p>
                    <div className={`text-2xl ${item.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {item.isCorrect ? '✓' : '✗'}
                    </div>
                  </div>
                  
                  <div className="pl-6 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-base">
                    <div className={`${item.isCorrect ? 'text-green-800' : 'text-red-800'} font-medium`}>
                      Your Answer: <span className="font-bold">{item.selectedAnswer}</span>
                    </div>
                    {!item.isCorrect && (
                      <div className="text-green-800 font-medium">
                        Correct Answer: <span className="font-bold">{item.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t-4 border-[#8b4513] bg-[#e6d2a0]/50 text-center relative z-10">
          <button 
            onClick={onRestart}
            className="bg-[#5c4033] text-[#d4af37] font-medieval text-xl px-10 py-3 rounded border-2 border-[#3e2723] hover:bg-[#3e2723] hover:scale-105 transition-all shadow-lg active:translate-y-1"
          >
            Return to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
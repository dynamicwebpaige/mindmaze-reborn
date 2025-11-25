
import React from 'react';
import { Direction } from '../types';

interface ControlsProps {
  onMove: (dir: Direction) => void;
  availableMoves: { [key in Direction]: boolean };
}

export const Controls: React.FC<ControlsProps> = ({ onMove, availableMoves }) => {
  // Reduced size to w-9 h-9 (36px) to fit in h-48 container with padding
  const btnClass = "w-9 h-9 bg-[#4a3c31] border-2 border-[#8b4513] text-[#d4af37] hover:bg-[#5c4b3e] active:bg-[#3a2f26] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-base rounded shadow-inner font-bold transition-all";

  return (
    <div className="grid grid-cols-3 gap-1 bg-[#2a2a2a] p-2 rounded-lg border-4 border-[#8b4513] shadow-2xl">
      <div></div>
      <button 
        onClick={() => onMove(Direction.NORTH)} 
        disabled={!availableMoves[Direction.NORTH]}
        className={btnClass}
      >
        ▲
      </button>
      <div></div>
      
      <button 
        onClick={() => onMove(Direction.WEST)} 
        disabled={!availableMoves[Direction.WEST]}
        className={btnClass}
      >
        ◀
      </button>
      <div className="w-9 h-9 flex items-center justify-center">
        <div className="w-2.5 h-2.5 bg-[#d4af37] rounded-full shadow-[0_0_6px_#d4af37]"></div>
      </div>
      <button 
        onClick={() => onMove(Direction.EAST)} 
        disabled={!availableMoves[Direction.EAST]}
        className={btnClass}
      >
        ▶
      </button>

      <div></div>
      <button 
        onClick={() => onMove(Direction.SOUTH)} 
        disabled={!availableMoves[Direction.SOUTH]}
        className={btnClass}
      >
        ▼
      </button>
      <div></div>
    </div>
  );
};

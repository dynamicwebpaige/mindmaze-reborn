import React from 'react';
import { GameMode } from '../types';

interface StartScreenProps {
  onStart: (mode: GameMode) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="max-w-lg w-full bg-[#f3e5ab] border-[8px] border-[#5c4033] rounded-lg shadow-2xl flex flex-col relative overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/parchment.png')] opacity-50 pointer-events-none"></div>
        
        <div className="p-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-medieval text-[#3e2723] mb-2 tracking-widest">
            MindMaze Reborn
          </h1>
          <div className="w-2/3 mx-auto h-1 bg-[#8b4513] mb-6 opacity-50"></div>
          
          <p className="font-serif text-lg text-[#5d4037] mb-8 italic">
            Choose your destiny, traveler...
          </p>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => onStart('classic')}
              className="group relative bg-[#e6d2a0] border-2 border-[#8b4513] p-4 rounded hover:bg-[#d4af37] transition-all text-left shadow-md"
            >
              <div className="font-medieval text-xl text-[#3e2723] group-hover:text-white">Classic Mode</div>
              <div className="font-serif text-sm text-[#5d4037] group-hover:text-white/90">Explore at your own pace. No limits.</div>
            </button>

            <button 
              onClick={() => onStart('timed')}
              className="group relative bg-[#e6d2a0] border-2 border-[#8b4513] p-4 rounded hover:bg-[#d4af37] transition-all text-left shadow-md"
            >
              <div className="font-medieval text-xl text-[#3e2723] group-hover:text-white">Timed Challenge</div>
              <div className="font-serif text-sm text-[#5d4037] group-hover:text-white/90">Reach the Throne Room in 5 minutes.</div>
            </button>

            <button 
              onClick={() => onStart('turns')}
              className="group relative bg-[#e6d2a0] border-2 border-[#8b4513] p-4 rounded hover:bg-[#d4af37] transition-all text-left shadow-md"
            >
              <div className="font-medieval text-xl text-[#3e2723] group-hover:text-white">Tactical Mode</div>
              <div className="font-serif text-sm text-[#5d4037] group-hover:text-white/90">You have 40 moves. Make them count.</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
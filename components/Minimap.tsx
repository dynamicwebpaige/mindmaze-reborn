
import React from 'react';
import { Room } from '../types';

interface MinimapProps {
  grid: Room[][];
  currentX: number;
  currentY: number;
}

export const Minimap: React.FC<MinimapProps> = ({ grid, currentX, currentY }) => {
  const MAZE_SIZE = grid.length;

  return (
    <div className="bg-[#2a2a2a] border-4 border-[#8b4513] p-2 rounded shadow-lg flex flex-col items-center justify-center">
      <div className="grid grid-cols-5 gap-1">
        {grid.map((row, y) => (
          <React.Fragment key={y}>
            {row.map((room, x) => {
              const isCurrent = x === currentX && y === currentY;
              const isVisited = room.visited;
              const isGoal = x === MAZE_SIZE - 1 && y === MAZE_SIZE - 1;
              
              let bgColor = 'bg-[#1a1a1a]';
              let textColor = '';

              // Determine styles
              if (isCurrent) {
                bgColor = 'bg-red-600 animate-pulse';
              } else if (isGoal) {
                // Make the goal very distinct
                bgColor = 'bg-[#d4af37]';
                textColor = 'text-[#3e2723]';
              } else if (isVisited) {
                bgColor = 'bg-[#5a5a5a]';
              }

              // Walls - used thinner borders for smaller map
              const borderClass = `
                ${room.walls.north ? 'border-t border-gray-500' : 'border-t border-transparent'}
                ${room.walls.south ? 'border-b border-gray-500' : 'border-b border-transparent'}
                ${room.walls.east ? 'border-r border-gray-500' : 'border-r border-transparent'}
                ${room.walls.west ? 'border-l border-gray-500' : 'border-l border-transparent'}
              `;

              return (
                <div
                  key={`${x}-${y}`}
                  // Reduced to w-4 h-4 (16px) to fit better
                  className={`w-4 h-4 ${bgColor} ${borderClass} relative transition-colors duration-300`}
                  title={isGoal ? "The Throne Room (Goal)" : ""}
                >
                   {/* Goal Marker */}
                   {isGoal && !isCurrent && (
                    <div className={`absolute inset-0 flex items-center justify-center text-[8px] font-bold ${textColor}`}>
                       ★
                    </div>
                  )}

                  {isVisited && room.cleared && !isCurrent && !isGoal && (
                    <div className="absolute inset-0 m-auto w-1 h-1 bg-green-500 rounded-full shadow-[0_0_2px_#00ff00]"></div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="text-center text-[#d4af37] text-[10px] mt-1 font-medieval leading-none">
        MAP <span className="text-[8px] text-gray-400 inline">(★=Goal)</span>
      </div>
    </div>
  );
};


import React, { useMemo } from 'react';
import { Question } from '../types';

interface QuestionModalProps {
  question: Question;
  onAnswer: (answer: string) => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({ question, onAnswer }) => {
  
  const shuffledOptions = useMemo(() => {
    const all = [...question.distractors, question.answer];
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }, [question]);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-[2px]">
      <div className="w-[90%] max-w-md bg-[#f3e5ab] border-[6px] border-[#5c4033] rounded-lg shadow-2xl relative overflow-hidden">
        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#8b4513]"></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#8b4513]"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#8b4513]"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#8b4513]"></div>

        <div className="p-5 text-center relative z-10">
          <h2 className="text-2xl font-medieval text-[#5c4033] mb-1">Halt, Traveler!</h2>
          <div className="w-3/4 mx-auto h-0.5 bg-[#8b4513] mb-4 opacity-50"></div>
          
          <p className="text-lg font-serif text-gray-900 mb-5 font-semibold leading-snug">
            {question.question}
          </p>

          <div className="flex flex-col gap-2">
            {shuffledOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => onAnswer(option)}
                className="bg-[#e6d2a0] border-2 border-[#8b4513] text-[#3e2723] py-2 px-3 rounded hover:bg-[#d4af37] hover:text-white transition-colors font-serif text-base text-left shadow-sm active:scale-[0.98]"
              >
                <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span> {option}
              </button>
            ))}
          </div>
        </div>
        
        {/* Background Texture overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/parchment.png')] opacity-50 pointer-events-none"></div>
      </div>
    </div>
  );
};

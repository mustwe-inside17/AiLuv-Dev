import React, { useState } from 'react';
import { DAILY_QUESTS } from '../constants';
import { CheckCircle2, Circle, Trophy, Calendar, Coins, Zap } from 'lucide-react';
import { GameState } from '../types';

interface DailyQuestsProps {
  gameState?: GameState;
  onClaim?: (id: string) => void;
}

export const DailyQuests: React.FC<DailyQuestsProps> = ({ gameState, onClaim }) => {
  const [confetti, setConfetti] = useState<{id: number, left: string, delay: string}[]>([]);

  if (!gameState) return null;

  const handleClaim = (id: string) => {
    onClaim?.(id);
    // Trigger confetti
    const newConfetti = Array.from({ length: 20 }).map((_, i) => ({
      id: Date.now() + i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`
    }));
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 2000);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full pb-24 relative overflow-x-hidden">
      
      {/* Confetti Overlay */}
      {confetti.map((c) => (
        <div 
          key={c.id} 
          className="confetti-piece" 
          style={{ left: c.left, animationDelay: c.delay, backgroundColor: ['#ff0', '#f0f', '#0ff', '#0f0'][Math.floor(Math.random()*4)] }} 
        />
      ))}

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
           <span className="bg-yellow-100 p-2 rounded-xl text-yellow-500 shadow-sm"><Trophy size={24} /></span>
           Daily Goals
        </h2>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-600 px-5 py-4 rounded-2xl text-sm font-bold flex items-center justify-between shadow-sm border border-blue-100">
        <span className="flex items-center gap-2"><Calendar size={18} /> Resets at Midnight</span>
        <span className="text-xs opacity-70 bg-white px-2 py-1 rounded-md">Today</span>
      </div>

      <div className="space-y-4">
        {DAILY_QUESTS.map((quest) => {
          const progress = gameState.questProgress[quest.id] || { current: 0, claimed: false };
          const isCompleted = progress.current >= quest.target;
          const isClaimed = progress.claimed;
          const percent = Math.min(100, (progress.current / quest.target) * 100);

          return (
            <div 
              key={quest.id} 
              className={`
                relative p-5 rounded-[2rem] border-2 transition-all duration-300
                ${isClaimed 
                  ? 'bg-gray-50 border-gray-100 opacity-60 grayscale-[0.5]' 
                  : isCompleted 
                    ? 'bg-gradient-to-br from-white to-yellow-50 border-yellow-200 shadow-lg transform scale-[1.02]' 
                    : 'bg-white border-gray-100 shadow-sm'}
              `}
            >
              <div className="flex items-start gap-5">
                <div className="mt-1 flex-shrink-0">
                  {isClaimed ? (
                    <CheckCircle2 size={32} className="text-green-500 fill-green-100" /> 
                  ) : isCompleted ? (
                    <div className="animate-bounce bg-yellow-100 rounded-full p-1"><Trophy size={28} className="text-yellow-500 fill-yellow-200" /></div>
                  ) : (
                     <div className="relative">
                       <Circle size={32} className="text-gray-200" strokeWidth={3} />
                       <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                         {Math.floor(percent)}%
                       </span>
                     </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold text-lg truncate ${isClaimed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {quest.title}
                    </h3>
                    {!isClaimed && (
                       <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
                         {progress.current}/{quest.target}
                       </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{quest.description}</p>
                  
                  {/* Rewards */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="bg-yellow-50 text-yellow-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-yellow-100">
                      <Coins size={14} fill="currentColor" className="text-yellow-400" /> +{quest.rewardGold}
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-indigo-100">
                      <Zap size={14} fill="currentColor" className="text-indigo-400" /> +{quest.rewardExp} XP
                    </span>
                  </div>

                  {/* Progress Bar (if not claimed) */}
                  {!isClaimed && (
                    <div className="mt-4 h-2.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ease-out ${isCompleted ? 'bg-yellow-400' : 'bg-pink-400'}`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  )}

                  {/* Claim Button */}
                  {isCompleted && !isClaimed && (
                    <button 
                      onClick={() => handleClaim(quest.id)}
                      className="mt-4 w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-yellow-200 transition-all active:scale-95 animate-pulse flex items-center justify-center gap-2"
                    >
                      <Trophy size={18} /> Claim Rewards
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
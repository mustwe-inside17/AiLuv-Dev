import React from 'react';
import { Zap, Star } from 'lucide-react';

interface StatusBarProps {
  energy: number;
  maxEnergy: number;
  level: number;
  currentExp: number;
  requiredExp: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ energy, maxEnergy, level, currentExp, requiredExp }) => {
  // Calculate percentages for width
  const energyPercent = Math.max(0, Math.min((energy / maxEnergy) * 100, 100));
  const expPercent = Math.max(0, Math.min((currentExp / requiredExp) * 100, 100));

  return (
    <div className="w-full bg-white/80 backdrop-blur-xl border-b border-pink-100 p-4 sticky top-0 z-20 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
      <div className="max-w-4xl mx-auto flex justify-between gap-4 md:gap-8 items-end">
        
        {/* Energy Bar */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold tracking-wider text-orange-400 uppercase">
            <span className="flex items-center gap-1"><Zap size={12} className="fill-orange-400" /> Energy</span>
            <span className="text-gray-500 bg-white px-1.5 py-0.5 rounded-md shadow-sm border border-gray-100">{Math.floor(energy)}/{maxEnergy}</span>
          </div>
          <div className="h-3 w-full bg-orange-50 rounded-full overflow-hidden border border-orange-100 relative shadow-inner group">
            <div 
              className="h-full bg-gradient-to-r from-orange-300 to-yellow-400 transition-all duration-500 ease-out rounded-full group-hover:brightness-110"
              style={{ width: `${energyPercent}%` }}
            />
            <div className="absolute top-0 left-0 w-full h-[50%] bg-white/30 pointer-events-none rounded-full"></div>
          </div>
        </div>

        {/* Level Badge (Center) */}
        <div className="relative -mb-1 flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl rotate-45 flex items-center justify-center shadow-lg shadow-indigo-200 border-2 border-white z-10 relative animate-level-pulse">
            <div className="-rotate-45 flex flex-col items-center justify-center text-white leading-none">
              <span className="text-[8px] font-bold uppercase opacity-80">LVL</span>
              <span className="text-xl font-extrabold">{level}</span>
            </div>
          </div>
        </div>

        {/* EXP Bar */}
        <div className="flex-1 flex flex-col gap-1.5 text-right">
          <div className="flex justify-between items-center text-[10px] font-bold tracking-wider text-indigo-500 uppercase flex-row-reverse">
            <span className="flex items-center gap-1">EXP <Star size={12} className="fill-indigo-500" /></span>
            <span className="text-gray-500 bg-white px-1.5 py-0.5 rounded-md shadow-sm border border-gray-100">{Math.floor(currentExp)}/{requiredExp}</span>
          </div>
          <div className="h-3 w-full bg-indigo-50 rounded-full overflow-hidden border border-indigo-100 relative shadow-inner group">
            <div 
              className="h-full bg-gradient-to-r from-indigo-300 to-purple-400 transition-all duration-500 ease-out rounded-full group-hover:brightness-110"
              style={{ width: `${expPercent}%` }}
            />
             <div className="absolute top-0 left-0 w-full h-[50%] bg-white/30 pointer-events-none rounded-full"></div>
          </div>
        </div>

      </div>
    </div>
  );
};
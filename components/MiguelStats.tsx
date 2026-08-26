
import React from 'react';
import { GameState } from '../types';
import { MIGUEL_MOODS, MIGUEL_IMG_BASE } from '../constants';
import { Heart, Brain, Thermometer, Lock, Sparkles, User, Briefcase } from 'lucide-react';

interface MiguelStatsProps {
  gameState: GameState;
}

export const MiguelStats: React.FC<MiguelStatsProps> = ({ gameState }) => {
  const getRelationshipStatus = (love: number) => {
    if (love < 30) return "Just Met";
    if (love < 60) return "Thinking of you";
    if (love < 90) return "Crushing";
    return "Soulmates";
  };

  const miguelLove = gameState.loveScores.miguel;
  const miguelMood = gameState.currentMoods.miguel;

  const lovePercent = Math.max(0, Math.min(100, miguelLove));

  const getMoodIcon = (mood: string) => {
    switch(mood) {
      case 'happy': return <Sparkles size={16} />;
      case 'shy': return <Heart size={16} />;
      case 'angry': return <span className="text-lg">💢</span>;
      case 'working': return <Briefcase size={16} />;
      default: return <User size={16} />;
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full pb-6">
       <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        <span className="bg-pink-100 p-2 rounded-xl text-pink-500 shadow-sm"><Heart size={24} fill="currentColor" /></span>
        Miguel's Profile
      </h2>

      {/* Hero Section */}
      <div className="relative h-72 rounded-[2rem] overflow-hidden shadow-2xl shadow-pink-100 border-4 border-white">
        {/* Safe lookup for mood image */}
        <img 
          src={(MIGUEL_MOODS[miguelMood] && MIGUEL_MOODS[miguelMood]![0]) || MIGUEL_IMG_BASE} 
          alt="Miguel Header" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-3">
          <div>
             <h3 className="text-3xl font-extrabold mb-1 drop-shadow-md">Miguel, 24</h3>
             <p className="text-white/80 text-sm font-medium">Freelance Graphic Designer</p>
          </div>

          {/* Large Love Bar */}
          <div className="space-y-1">
             <div className="flex justify-between text-xs font-bold text-pink-200 uppercase tracking-widest">
               <span>Affection Level</span>
               <span>{Math.floor(miguelLove)}%</span>
             </div>
             <div className="h-5 w-full bg-black/30 backdrop-blur-sm rounded-full overflow-hidden border border-white/20 relative shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 via-rose-400 to-pink-300 transition-all duration-1000 ease-out rounded-full relative"
                  style={{ width: `${lovePercent}%` }}
                >
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMTBMMTAgME0tNSA1TDUgLTE1TTE1IDI1TDI1IDE1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwKSIvPjwvc3ZnPg==')] opacity-30 animate-pulse"></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-purple-50 shadow-sm flex flex-col gap-2">
           <div className="text-xs text-gray-400 font-bold uppercase tracking-wide">Current Mood</div>
           <div className="flex items-center gap-2">
              <span className={`p-2 rounded-full ${miguelMood === 'angry' ? 'bg-red-100 text-red-500' : 'bg-purple-100 text-purple-500'}`}>
                {getMoodIcon(miguelMood)}
              </span>
              <span className="font-bold text-gray-700 capitalize">{miguelMood}</span>
           </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-orange-50 shadow-sm flex flex-col gap-2">
           <div className="text-xs text-gray-400 font-bold uppercase tracking-wide">Personality</div>
           <div className="flex items-center gap-2">
              <span className="p-2 rounded-full bg-orange-100 text-orange-500">
                <Thermometer size={16} />
              </span>
              <span className="font-bold text-gray-700">Sweet & Shy</span>
           </div>
        </div>
      </div>

      {/* Relationship Tier Card */}
      <div className="bg-gradient-to-r from-pink-50 to-white rounded-2xl p-5 border border-pink-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-pink-500 shadow-sm border border-pink-50">
           <Heart size={24} fill={miguelLove > 80 ? "currentColor" : "none"} />
        </div>
        <div>
           <div className="text-xs text-pink-400 font-bold uppercase tracking-wide">Relationship Status</div>
           <div className="text-xl font-extrabold text-gray-800">{getRelationshipStatus(miguelLove)}</div>
        </div>
      </div>

      {/* Locked Memories */}
      <div className="mt-4">
        <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2 ml-1">
          <Lock size={12} /> Unlockable Memories
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${gameState.level >= i*10 ? 'bg-pink-100 border-pink-200 text-pink-500' : 'bg-gray-50 border-dashed border-gray-200 text-gray-300'}`}>
              {gameState.level >= i*10 ? <Sparkles size={20} /> : <Lock size={20} />}
              <span className="text-[10px] font-bold">Lvl {i * 10}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

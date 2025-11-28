
import React, { useState, useEffect } from 'react';
import { GameState, CharacterId, Mood, RelationshipTier } from '../types';
import { CHARACTER_DATA, MOOD_COLORS, TIER_THRESHOLDS } from '../constants';
import { Heart, Lock, Sparkles, X, ChevronRight, Brain, Thermometer, ShieldCheck } from 'lucide-react';
import { getCharacterImageUrl } from '../services/firebase';

interface RelationshipStatsProps {
  gameState: GameState;
}

export const RelationshipStats: React.FC<RelationshipStatsProps> = ({ gameState }) => {
  const [selectedChar, setSelectedChar] = useState<CharacterId | null>(null);

  // Helper to get next goal
  const getNextGoal = (tier: RelationshipTier, score: number) => {
    let nextTier: RelationshipTier | null = null;
    if (tier === RelationshipTier.FRIEND) nextTier = RelationshipTier.FLIRTING;
    if (tier === RelationshipTier.FLIRTING) nextTier = RelationshipTier.PARTNER;
    
    if (nextTier) {
      const cap = TIER_THRESHOLDS[nextTier];
      if (score >= cap - 1) return `LOCKED. Buy a special gift to unlock ${nextTier.toUpperCase()}.`;
      return `Next: ${nextTier.toUpperCase()} at ${cap} points.`;
    }
    return "Max Level Reached.";
  };

  const getTierColor = (tier: RelationshipTier) => {
    switch (tier) {
      case RelationshipTier.STRANGER: return 'text-gray-400';
      case RelationshipTier.ACQUAINTANCE: return 'text-blue-400';
      case RelationshipTier.FRIEND: return 'text-green-500';
      case RelationshipTier.FLIRTING: return 'text-pink-400';
      case RelationshipTier.PARTNER: return 'text-red-500 font-extrabold';
      case RelationshipTier.SOULMATE: return 'text-purple-600 font-black';
      default: return 'text-gray-500';
    }
  };

  const CharacterDetail = ({ id, onClose }: { id: CharacterId, onClose: () => void }) => {
    const data = CHARACTER_DATA[id];
    const loveScore = gameState.loveScores[id] || 0;
    const tier = gameState.relationshipTiers[id] || RelationshipTier.STRANGER;
    const mood = gameState.currentMoods[id];
    
    // Calculate progress to next tier
    let max = 5000;
    let min = 0;
    
    // Simple linear visual for now, relative to max
    const lovePercent = Math.min(100, (loveScore / 2000) * 100); 

    const [imgUrl, setImgUrl] = useState<string>('');

    useEffect(() => {
        const load = async () => {
             const moodPaths = data.moods[mood] || data.moods[Mood.NEUTRAL];
             const path = Array.isArray(moodPaths) ? moodPaths[0] : moodPaths; 
             if (path) {
                 const url = path.startsWith('http') ? path : await getCharacterImageUrl(path);
                 if (url) setImgUrl(url);
             }
        };
        load();
    }, [id, mood]);

    return (
      <div className="absolute inset-0 z-20 bg-white flex flex-col animate-in slide-in-from-bottom-5 duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 z-30 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white p-2 rounded-full transition-all">
          <X size={24} />
        </button>

        <div className="h-[45%] relative bg-gray-100 flex-shrink-0">
          {imgUrl ? <img src={imgUrl} alt={data.name} className="w-full h-full object-cover object-top" /> : <div className="w-full h-full bg-gray-200 animate-pulse" />}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 pt-12">
             <h2 className={`text-4xl font-extrabold ${data.color} drop-shadow-sm`}>{data.name}</h2>
             <p className="text-gray-500 font-bold">{data.description}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            <div className="bg-gradient-to-br from-pink-50 to-white p-5 rounded-2xl border border-pink-100 shadow-sm flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md ${loveScore >= 2000 ? 'bg-red-500' : 'bg-gray-400'}`}>
                 <Heart size={28} fill="currentColor" />
              </div>
              <div>
                 <div className="text-xs text-gray-400 font-bold uppercase tracking-wide">Status</div>
                 <div className={`text-2xl font-extrabold uppercase ${getTierColor(tier)}`}>{tier}</div>
              </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-gray-500">
                    <span>Affection Score</span>
                    <span className={data.color}>{Math.floor(loveScore)}</span>
                </div>
                <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner relative">
                    <div className={`h-full transition-all duration-1000 ease-out rounded-full relative ${id === 'miguel' ? 'bg-gradient-to-r from-pink-400 to-rose-400' : 'bg-gradient-to-r from-orange-400 to-red-400'}`} style={{ width: `${lovePercent}%` }}>
                         <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>
                <div className="text-xs text-gray-400 font-bold text-center mt-1">
                   {getNextGoal(tier, loveScore)}
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                 <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                   <ShieldCheck size={14} /> Golden Rule
                 </div>
                 <p className="text-gray-700 font-medium italic text-sm">
                   {tier === RelationshipTier.STRANGER || tier === RelationshipTier.ACQUAINTANCE ? "She acts professionally. No flirting allowed." : 
                    tier === RelationshipTier.FRIEND ? "She sees you as a friend. Jokes are fine, but don't cross the line." :
                    tier === RelationshipTier.FLIRTING ? "She is interested. Make a move!" :
                    "She is fully committed to you."}
                 </p>
            </div>
        </div>
      </div>
    );
  };

  const SummaryCard = ({ id }: { id: CharacterId }) => {
    const data = CHARACTER_DATA[id];
    const loveScore = gameState.loveScores[id] || 0;
    const tier = gameState.relationshipTiers[id] || RelationshipTier.STRANGER;
    const [avatarUrl, setAvatarUrl] = useState<string>('');

    useEffect(() => {
        const load = async () => {
             const path = data.baseImg; 
             if (path) {
                 const url = path.startsWith('http') ? path : await getCharacterImageUrl(path);
                 if (url) setAvatarUrl(url);
             }
        };
        load();
    }, [id]);

    return (
      <button onClick={() => setSelectedChar(id)} className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-pink-200 transition-all group">
        <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                {avatarUrl ? <img src={avatarUrl} alt={data.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 animate-pulse"></div>}
            </div>
        </div>
        <div className="flex-1 text-left">
             <div className="flex justify-between items-center">
                 <h3 className={`font-bold text-lg ${data.color}`}>{data.name}</h3>
                 <ChevronRight size={20} className="text-gray-300 group-hover:text-pink-400 transition-colors" />
             </div>
             <div className={`text-xs font-extrabold uppercase mb-1 ${getTierColor(tier)}`}>{tier}</div>
             <div className="text-[10px] text-gray-400 font-medium">Score: {Math.floor(loveScore)}</div>
        </div>
      </button>
    );
  };

  return (
    <div className="relative h-full overflow-hidden bg-gray-50/50">
      <div className="p-6 space-y-6 overflow-y-auto h-full pb-24">
        <div className="mb-2">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="bg-rose-100 p-2 rounded-xl text-rose-500 shadow-sm"><Heart size={24} fill="currentColor" /></span>
                Relationships 2.0
            </h2>
            <p className="text-gray-500 text-sm mt-1">Unlock tiers to deepen your bond.</p>
        </div>
        <div className="space-y-3">
           <SummaryCard id="miguel" />
           <SummaryCard id="fia" />
        </div>
      </div>
      {selectedChar && <CharacterDetail id={selectedChar} onClose={() => setSelectedChar(null)} />}
    </div>
  );
};

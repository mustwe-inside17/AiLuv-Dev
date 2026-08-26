
import React, { useEffect, useState } from 'react';
import { Trophy, Crown, Heart, Coins, Zap, Star, Filter, ArrowUp, ChevronLeft, ChevronDown } from 'lucide-react';
import { UserProfile, CharacterId } from '../types';
import { fetchLeaderboardData, LeaderboardEntry } from '../services/firebase';

interface RankingScreenProps {
  currentUser: UserProfile | null;
  onBack?: () => void;
}

type RankingCategory = 'love' | 'wealth' | 'power';
type LoveFilter = 'all' | CharacterId;

export const RankingScreen: React.FC<RankingScreenProps> = ({ currentUser, onBack }) => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<RankingCategory>('love');
  const [loveFilter, setLoveFilter] = useState<LoveFilter>('all');

  useEffect(() => {
    const load = async () => {
      const res = await fetchLeaderboardData();
      setData(res);
      setLoading(false);
    };
    load();
  }, []);

  const getSortedData = () => {
    let sorted = [...data];
    if (category === 'love') {
       sorted.sort((a, b) => {
          // Robust score calculation with fallbacks
          const aScores = (a.loveScores || {}) as Partial<Record<CharacterId, number>>;
          const bScores = (b.loveScores || {}) as Partial<Record<CharacterId, number>>;

          const scoreA = loveFilter === 'all' 
             ? ((aScores.miguel||0) + (aScores.fia||0) + (aScores.peat||0) + (aScores.erin||0) + (aScores.marcus||0) + (aScores.lucas||0) + (aScores.bam||0) + (aScores.jellie||0) + (aScores.soul||0) + (aScores.mia||0)) 
             : (aScores[loveFilter]||0);
          const scoreB = loveFilter === 'all' 
             ? ((bScores.miguel||0) + (bScores.fia||0) + (bScores.peat||0) + (bScores.erin||0) + (bScores.marcus||0) + (bScores.lucas||0) + (bScores.bam||0) + (bScores.jellie||0) + (bScores.soul||0) + (bScores.mia||0)) 
             : (bScores[loveFilter]||0);
          return scoreB - scoreA;
       });
    } else if (category === 'wealth') {
       sorted.sort((a, b) => (b.totalGoldEarned || 0) - (a.totalGoldEarned || 0));
    } else if (category === 'power') {
       sorted.sort((a, b) => {
          // Score = (Level * 100) + Total Stats
          const scoreA = ((a.level||1) * 100) + (a.statsTotal||0);
          const scoreB = ((b.level||1) * 100) + (b.statsTotal||0);
          return scoreB - scoreA;
       });
    }
    return sorted;
  };

  const sortedData = getSortedData();
  const top3 = sortedData.slice(0, 3);
  const rest = sortedData.slice(3);

  // Find user rank
  const userRankIndex = sortedData.findIndex(u => u.name === currentUser?.name); // Simple name match for prototype
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : '-';

  const getScoreDisplay = (entry: LeaderboardEntry) => {
     if (!entry) return null;

     if (category === 'love') {
         const scores = (entry.loveScores || {}) as Partial<Record<CharacterId, number>>;
         const val = loveFilter === 'all' 
             ? ((scores.miguel||0) + (scores.fia||0) + (scores.peat||0) + (scores.erin||0) + (scores.marcus||0) + (scores.lucas||0) + (scores.bam||0) + (scores.jellie||0) + (scores.soul||0) + (scores.mia||0))
             : (scores[loveFilter]||0);
         return <div className="flex items-center gap-1 text-pink-500 font-bold"><Heart size={12} fill="currentColor"/> {Math.floor(val).toLocaleString()}</div>;
     }
     if (category === 'wealth') {
         const wealth = entry.totalGoldEarned || 0;
         return <div className="flex items-center gap-1 text-yellow-500 font-bold"><Coins size={12} fill="currentColor"/> {Math.floor(wealth).toLocaleString()}</div>;
     }
     // Power
     return <div className="flex items-center gap-1 text-indigo-500 font-bold"><Star size={12} fill="currentColor"/> Lv.{entry.level || 1}</div>;
  };

  const PodiumItem = ({ entry, place }: { entry: LeaderboardEntry, place: 1 | 2 | 3 }) => {
      if (!entry) return <div className="w-1/3"></div>; // Placeholder
      
      let height = 'h-32';
      let color = 'bg-yellow-400 border-yellow-200';
      let icon = <Crown size={24} className="text-yellow-600 fill-yellow-100" />;
      let scale = 'scale-110 z-10';

      if (place === 2) { height = 'h-24'; color = 'bg-gray-300 border-gray-200'; icon = <span className="text-xl font-bold text-gray-500">2</span>; scale = 'z-0 mt-8'; }
      if (place === 3) { height = 'h-20'; color = 'bg-orange-300 border-orange-200'; icon = <span className="text-xl font-bold text-orange-700">3</span>; scale = 'z-0 mt-12'; }

      return (
          <div className={`flex flex-col items-center w-1/3 ${scale} transition-all`}>
              <div className="relative mb-2">
                 <img 
                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${entry.name}&backgroundColor=b6e3f4`} 
                    alt={entry.name}
                    className={`rounded-full border-4 shadow-lg bg-white ${place === 1 ? 'w-20 h-20 border-yellow-400' : 'w-16 h-16 border-white'}`}
                 />
                 {place === 1 && <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">{icon}</div>}
              </div>
              <div className="text-center mb-1">
                  <div className="font-bold text-sm truncate w-24 text-gray-800 dark:text-white">{entry.name}</div>
                  <div className="text-xs">{getScoreDisplay(entry)}</div>
              </div>
              <div className={`w-full ${height} ${color} rounded-t-2xl shadow-lg flex items-end justify-center pb-2 opacity-90`}>
                 <div className="text-white/50 font-black text-4xl">{place}</div>
              </div>
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-900 overflow-hidden relative">
      
      {/* Header Banner */}
      <div className="relative h-40 bg-slate-900 shrink-0 overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 dark:to-slate-900"></div>
         <div className="relative z-10 p-6 text-center">
            {onBack && (
                <button onClick={onBack} className="absolute top-4 left-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2 rounded-full transition-all border border-white/30">
                    <ChevronLeft size={20} />
                </button>
            )}
            <div className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-full text-[10px] font-bold tracking-widest uppercase mb-2 animate-pulse">
                Ends in 14 Days
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter drop-shadow-lg">
                SEASON 0
            </h1>
            <p className="text-pink-400 font-bold uppercase tracking-widest text-xs">Beta Rising</p>
         </div>
      </div>

      {/* Content Container - Pull up over banner */}
      <div className="flex-1 flex flex-col -mt-6 z-20 rounded-t-[2rem] bg-gray-50 dark:bg-slate-900 overflow-hidden shadow-2xl border-t border-white/10">
        
        {/* Category Tabs */}
        <div className="flex justify-center p-4 pb-0">
            <div className="bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex gap-1 w-full max-w-sm">
                <button onClick={() => setCategory('love')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${category === 'love' ? 'bg-pink-500 text-white shadow-md' : 'text-gray-400 hover:text-pink-400'}`}>
                    <Heart size={14} /> Casanova
                </button>
                <button onClick={() => setCategory('wealth')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${category === 'wealth' ? 'bg-yellow-500 text-white shadow-md' : 'text-gray-400 hover:text-yellow-400'}`}>
                    <Coins size={14} /> Tycoon
                </button>
                <button onClick={() => setCategory('power')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${category === 'power' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-400 hover:text-indigo-400'}`}>
                    <Zap size={14} /> Prodigy
                </button>
            </div>
        </div>

        {/* Dropdown Sub-Filter for Love */}
        {category === 'love' && (
            <div className="flex justify-center mt-3 px-4">
                <div className="relative w-full max-w-xs">
                    <select 
                        value={loveFilter}
                        onChange={(e) => setLoveFilter(e.target.value as LoveFilter)}
                        className="w-full appearance-none bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 py-2 px-4 pr-8 rounded-xl text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm transition-all cursor-pointer"
                    >
                        <option value="all">All Characters (Aggregate)</option>
                        <option value="miguel">Miguel</option>
                        <option value="fia">Coach Fia</option>
                        <option value="peat">Peat</option>
                        <option value="erin">Erin</option>
                        <option value="marcus">Marcus</option>
                        <option value="lucas">Lucas</option>
                        <option value="bam">Bam</option>
                        <option value="jellie">Jellie</option>
                        <option value="soul">Doctor Soul</option>
                        <option value="mia">Mia / Ikura</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
            </div>
        )}

        {/* Loading State */}
        {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-xs font-bold gap-2 animate-pulse">
                 <Trophy size={32} /> Loading Rankings...
             </div>
        ) : (
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
                
                {/* Podium */}
                <div className="flex justify-center items-end px-4 pt-4 pb-8 w-full max-w-md mx-auto">
                    <PodiumItem entry={top3[1]} place={2} />
                    <PodiumItem entry={top3[0]} place={1} />
                    <PodiumItem entry={top3[2]} place={3} />
                </div>

                {/* The List */}
                <div className="bg-white dark:bg-slate-800 rounded-t-[2rem] shadow-up-lg min-h-full p-4 pb-24">
                    {rest.map((entry, idx) => (
                        <div key={entry.userId} className="flex items-center gap-4 p-3 border-b border-gray-100 dark:border-slate-700 last:border-0">
                            <div className="font-bold text-gray-400 w-6 text-center">{idx + 4}</div>
                            <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${entry.name}&backgroundColor=b6e3f4`} className="w-10 h-10 rounded-full bg-gray-100" />
                            <div className="flex-1">
                                <div className="font-bold text-sm text-gray-800 dark:text-white">{entry.name}</div>
                                {category === 'power' && <div className="text-[10px] text-gray-400">Total Stats: {entry.statsTotal}</div>}
                            </div>
                            <div className="text-right">
                                {getScoreDisplay(entry)}
                            </div>
                        </div>
                    ))}
                    {rest.length === 0 && <div className="text-center text-gray-400 text-xs py-10">No other players found yet.</div>}
                </div>
            </div>
        )}

        {/* Sticky User Rank */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-t border-gray-200 dark:border-slate-700 p-3 pb-6 shadow-lg z-30">
            <div className="flex items-center gap-4 max-w-md mx-auto">
                <div className="bg-gray-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-md">
                    {userRank}
                </div>
                <div className="flex-1">
                     <div className="text-[10px] font-bold text-gray-400 uppercase">Your Rank</div>
                     <div className="text-sm font-extrabold text-gray-800 dark:text-white">{currentUser?.name || "You"}</div>
                </div>
                <div className="text-right">
                    {/* Display current user's score based on category manually or find in data */}
                     {userRankIndex !== -1 ? getScoreDisplay(sortedData[userRankIndex]) : <span className="text-xs text-gray-400">Not Ranked</span>}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

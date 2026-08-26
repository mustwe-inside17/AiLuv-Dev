
import React, { useState } from 'react';
import { QUEST_DATABASE } from '../constants';
import { CheckCircle2, Circle, Trophy, Calendar, Coins, Zap, Clock, ShoppingBag, Crown, RefreshCw } from 'lucide-react';
import { GameState } from '../types';

interface DailyQuestsProps {
  gameState?: GameState;
  onClaim?: (id: string) => void;
  onOpenRanking?: () => void;
  onRefresh?: () => void;
}

export const DailyQuests: React.FC<DailyQuestsProps> = ({ gameState, onClaim, onOpenRanking, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [confetti, setConfetti] = useState<{id: number, left: string, delay: string}[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    // Artificial delay for visual feedback
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getDaysLeft = () => {
    if (!gameState.nextWeeklyReset) return 0;
    const diff = gameState.nextWeeklyReset - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Filter Active Quests based on IDs stored in GameState
  const activeQuestIds = activeTab === 'daily' ? gameState.activeDailyQuests : gameState.activeWeeklyQuests;
  const activeQuests = activeQuestIds.map(id => QUEST_DATABASE[id]).filter(Boolean); // Filter out undefined if ID not found

  const isTutorialClaim = gameState.tutorialStep === 'goals_claim';
  const isTutorialRank = gameState.tutorialStep === 'goals_rank';

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full pb-6 relative overflow-x-hidden bg-transparent">
      
      {/* [MARCUS FIX]: Local Backdrop for Tutorial Focus */}
      {/* This ensures the backdrop is inside the same stacking context as the highlighted items */}
      {(isTutorialClaim || isTutorialRank) && (
          <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-[2px] animate-in fade-in duration-500 pointer-events-auto"></div>
      )}

      {/* Confetti Overlay */}
      {confetti.map((c) => (
        <div 
          key={c.id} 
          className="confetti-piece" 
          style={{ left: c.left, animationDelay: c.delay, backgroundColor: ['#ff0', '#f0f', '#0ff', '#0f0'][Math.floor(Math.random()*4)] }} 
        />
      ))}

      <div className="flex items-center justify-between mb-4 relative z-[101]">
        <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight drop-shadow-sm">
            <span className="bg-gradient-to-tr from-yellow-100 to-amber-50 dark:from-yellow-900/40 dark:to-yellow-800/20 p-2 rounded-xl text-yellow-500 dark:text-yellow-400 shadow-[0_2px_10px_rgba(234,179,8,0.15)] ring-1 ring-yellow-200/50 dark:ring-0"><Trophy size={20} /></span>
            Quest Board
            </h2>
        </div>
        
        {/* Floating Ranking Button */}
        <button 
          onClick={onOpenRanking}
          className={`
            bg-white/95 dark:bg-slate-800/90 backdrop-blur-xl border border-yellow-200 dark:border-yellow-900/50 shadow-[0_4px_15px_rgba(0,0,0,0.05)_] rounded-xl px-3 py-2 flex items-center gap-2 hover:bg-yellow-50/80 dark:hover:bg-slate-700 transition-all active:scale-95 group relative
            ${isTutorialRank ? 'z-[220] ring-4 ring-pink-400 border-pink-500 scale-110 bg-white dark:bg-slate-800' : ''}
          `}
        >
           {isTutorialRank && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>}
           <div className="w-7 h-7 bg-gradient-to-tr from-yellow-400 via-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform">
              <Crown size={14} fill="currentColor" />
           </div>
           <div className="text-left">
              <div className="text-[9px] font-extrabold text-amber-500/80 dark:text-gray-400 uppercase tracking-widest leading-none mb-0.5">Season 1</div>
              <div className="text-[13px] font-black text-slate-800 dark:text-white leading-none">Ranking</div>
           </div>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-slate-200/60 dark:bg-slate-800/80 p-1.5 rounded-2xl flex gap-1 mb-4 relative z-[50] shadow-inner backdrop-blur-sm">
        <button 
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-2.5 rounded-[12px] text-xs font-black transition-all ${activeTab === 'daily' ? 'bg-white dark:bg-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-slate-800 dark:text-white' : 'text-slate-500 dark:text-gray-500 hover:text-slate-700'}`}
        >
            ภารกิจประจำวัน
        </button>
        <button 
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 py-2.5 rounded-[12px] text-xs font-black transition-all flex items-center justify-center gap-1.5 ${activeTab === 'weekly' ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_2px_10px_rgba(99,102,241,0.3)] text-white' : 'text-slate-500 dark:text-gray-500 hover:text-slate-700'}`}
        >
            ภารกิจรายสัปดาห์
        </button>
      </div>

      <div className="space-y-4">
        {activeQuests.map((quest) => {
          const progress = gameState.questProgress[quest.id] || { current: 0, claimed: false };
          const isCompleted = progress.current >= quest.target;
          const isClaimed = progress.claimed;
          const percent = Math.min(100, (progress.current / quest.target) * 100);
          
          const isWeekly = activeTab === 'weekly';
          
          // Tutorial Logic: Highlight 'daily_login' claim button
          const isTargetQuest = isTutorialClaim && quest.id === 'daily_login';

          return (
            <div 
              key={quest.id} 
              className={`
                relative p-5 rounded-[2rem] border-2 transition-all duration-300 animate-in slide-in-from-bottom-2 backdrop-blur-xl
                ${isTargetQuest ? 'z-[220] ring-4 ring-pink-400 border-pink-500 scale-105 bg-white shadow-2xl' : ''}
                ${isClaimed 
                  ? 'bg-slate-50/60 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800 opacity-70 grayscale-[0.3]' 
                  : isCompleted 
                    ? isWeekly 
                        ? 'bg-gradient-to-br from-indigo-50/90 to-purple-50/90 dark:from-slate-800 dark:to-slate-900 border-purple-200 shadow-[0_8px_30px_rgba(168,85,247,0.15)] dark:border-purple-900/50 dark:shadow-none transform scale-[1.02]'
                        : 'bg-gradient-to-br from-white/95 to-yellow-50/95 dark:from-slate-800 dark:to-slate-800 border-yellow-200 shadow-[0_8px_30px_rgba(234,179,8,0.15)] dark:shadow-yellow-900/10 transform scale-[1.02]' 
                    : 'bg-white/80 dark:bg-slate-800/90 border-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:border-slate-700 hover:bg-white transition-colors'}
              `}
            >
              <div className="flex items-start gap-5">
                <div className="mt-1 flex-shrink-0">
                  {isClaimed ? (
                    <CheckCircle2 size={32} className="text-green-500 fill-green-100 dark:fill-green-900/30" /> 
                  ) : isCompleted ? (
                    <div className={`animate-bounce rounded-full p-1 ${isWeekly ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                        <Trophy size={28} className={isWeekly ? "text-purple-500 dark:text-purple-400 fill-purple-200" : "text-yellow-500 dark:text-yellow-400 fill-yellow-200"} />
                    </div>
                  ) : (
                     <div className="relative">
                       <Circle size={32} className="text-gray-200 dark:text-slate-600" strokeWidth={3} />
                       <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 dark:text-slate-500">
                         {Math.floor(percent)}%
                       </span>
                     </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold text-lg truncate ${isClaimed ? 'text-gray-400 dark:text-slate-600 line-through' : 'text-gray-800 dark:text-white'}`}>
                      {quest.title}
                    </h3>
                    {!isClaimed && (
                       <span className="text-xs font-bold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg border border-gray-200 dark:border-slate-600">
                         {progress.current}/{quest.target}
                       </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{quest.description}</p>
                  
                  {/* Rewards */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-yellow-100 dark:border-yellow-900/30">
                      <Coins size={14} fill="currentColor" className="text-yellow-400" /> +{quest.rewardGold}
                    </span>
                    <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-900/30">
                      <Zap size={14} fill="currentColor" className="text-indigo-400" /> +{quest.rewardExp} XP
                    </span>
                    {quest.rewardItem && (
                        <span className="bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-pink-100 dark:border-pink-900/30">
                            <ShoppingBag size={14} className="text-pink-400" /> +Item
                        </span>
                    )}
                  </div>

                  {/* Progress Bar (if not claimed) */}
                  {!isClaimed && (
                    <div className="mt-4 h-2.5 w-full bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ease-out ${isCompleted ? (isWeekly ? 'bg-purple-500' : 'bg-yellow-400') : (isWeekly ? 'bg-indigo-400' : 'bg-pink-400')}`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  )}

                  {/* Claim Button */}
                  {isCompleted && !isClaimed && (
                    <button 
                      onClick={() => handleClaim(quest.id)}
                      className={`
                        mt-4 w-full text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 animate-pulse flex items-center justify-center gap-2 relative z-50
                        ${isWeekly 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-indigo-200 dark:shadow-none' 
                            : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-yellow-200 dark:shadow-none'}
                      `}
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

      {/* Reset Text Mark */}
      <div className="flex justify-center mt-6 mb-2 relative z-[50]">
        {activeTab === 'daily' ? (
            <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500 italic">
                *รีเซ็ตเวลาเที่ยงคืน
            </span>
        ) : (
            <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500 italic">
                *รีเซ็ตทุกวันจันทร์ ({getDaysLeft()} วัน)
            </span>
        )}
      </div>
    </div>
  );
};

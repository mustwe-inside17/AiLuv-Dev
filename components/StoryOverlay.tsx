
import React, { useState, useEffect } from 'react';
import { GameState, StoryChapter, StoryTask, RelationshipTier } from '../types';
import { STORY_CHAPTERS, SHOP_ITEMS, LOCATION_IMAGES } from '../constants';
import { FASHION_ITEMS } from '../constants/fashion';
import { X, CheckCircle2, Lock, Star, ChevronDown, ChevronUp, Gift, ArrowRight, Gem, BookOpen, Crown, Sparkles, MapPin } from 'lucide-react';
import { getCharacterImageUrl } from '../services/firebase';
import { useGameStore } from '../store/gameStore';

interface StoryOverlayProps {
    gameState?: GameState; // Optional to not break existing callers immediately
    onClose: () => void;
    onClaimChapter: (chapterId: number) => void;
}

export const StoryOverlay: React.FC<StoryOverlayProps> = ({ onClose, onClaimChapter }) => {
    const gameState = useGameStore();
    const [isVisible, setIsVisible] = useState(false);
    const [headerUrl, setHeaderUrl] = useState('');
    
    // Reward Popup State
    const [rewardPopup, setRewardPopup] = useState<StoryChapter | null>(null);
    const [confetti, setConfetti] = useState<{id: number, left: string, delay: string}[]>([]);

    useEffect(() => {
        requestAnimationFrame(() => setIsVisible(true));
        
        const loadHeader = async () => {
            const url = await getCharacterImageUrl(LOCATION_IMAGES.story_header);
            if (url) setHeaderUrl(url);
            else setHeaderUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1974&auto=format&fit=crop");
        };
        loadHeader();
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    // --- REWARD CLAIM FLOW ---
    const handleClaimClick = (chapter: StoryChapter) => {
        // 1. Trigger Visual Popup First
        setRewardPopup(chapter);
        
        // 2. Generate Confetti
        const newConfetti = Array.from({ length: 40 }).map((_, i) => ({
            id: Date.now() + i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 0.5}s`
        }));
        setConfetti(newConfetti);
    };

    const handleConfirmClaim = () => {
        if (rewardPopup) {
            // 3. Actual Data Claim & Close
            onClaimChapter(rewardPopup.id);
            setRewardPopup(null);
            handleClose();
        }
    };

    const getTaskProgress = (task: StoryTask): { current: number, target: number, completed: boolean } => {
        const target = Number(task.target);
        let current = 0;

        switch (task.type) {
            case 'level': current = gameState.level || 1; break;
            case 'met_count': current = (gameState.metCharacters || []).length; break;
            case 'earn_gold': current = gameState.totalGoldEarned || 0; break;
            case 'work_count': current = gameState.totalWorkCount || (gameState.level >= 5 ? target : 0); break;
            case 'gym_count': current = gameState.totalGymCount || ((gameState.stats?.vit || 0) > 2 ? target : 0); break;
            case 'friend_count': current = (Object.values(gameState.relationshipTiers || {}) as RelationshipTier[]).filter(t => [RelationshipTier.FRIEND, RelationshipTier.FLIRTING, RelationshipTier.PARTNER, RelationshipTier.SOULMATE].includes(t)).length; break;
            case 'flirting_count': current = (Object.values(gameState.relationshipTiers || {}) as RelationshipTier[]).filter(t => [RelationshipTier.FLIRTING, RelationshipTier.PARTNER, RelationshipTier.SOULMATE].includes(t)).length; break;
            case 'partner_count': current = (Object.values(gameState.relationshipTiers || {}) as RelationshipTier[]).filter(t => [RelationshipTier.PARTNER, RelationshipTier.SOULMATE].includes(t)).length; break;
            case 'soulmate_count': current = (Object.values(gameState.relationshipTiers || {}) as RelationshipTier[]).filter(t => t === RelationshipTier.SOULMATE).length; break;
            case 'skill_count': current = (gameState.unlockedSkills || []).length; break;
            case 'style_count': current = (gameState.ownedStyles || []).length; break;
            case 'secret_count': current = (gameState.unlockedSecrets || []).length; break;
            case 'track_count': current = Math.max(0, (gameState.unlockedTracks || []).length - 1); break;
            case 'current_gold': current = gameState.gold || 0; break;
            case 'stats_min': current = gameState.stats ? Math.min(gameState.stats.vit, gameState.stats.int, gameState.stats.cha, gameState.stats.luck) : 0; break;
            
            // [FIXED]: Use Cumulative Counters for Robustness
            case 'invite_party_count': 
                // Check Lifetime invites OR current active party member
                current = Math.max((gameState.totalPartyInvites || 0), (gameState.partyMember ? 1 : 0)); 
                break;
            case 'spend_gold': 
                current = gameState.totalGoldSpent || 0; 
                break;

            case 'own_item':
                if (task.targetId) {
                    const hasInInventory = (gameState.inventory?.[task.targetId] || 0) > 0;
                    const hasInStyles = (gameState.ownedStyles || []).includes(task.targetId);
                    current = (hasInInventory || hasInStyles) ? 1 : 0;
                }
                break;
            default: current = 0;
        }
        return { current, target, completed: current >= target };
    };

    const currentChapterId = gameState.currentChapter || 1;

    return (
        <div className={`fixed inset-0 z-[600] flex justify-end pointer-events-auto transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>

            <div className={`bg-slate-50 dark:bg-slate-900 w-full max-w-md h-full shadow-2xl relative flex flex-col overflow-hidden transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header (More Curved & Friendly) */}
                <div className="relative h-56 shrink-0 rounded-b-[2.5rem] overflow-hidden shadow-lg z-10 bg-slate-900">
                    <img src={headerUrl} alt="Story Header" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-slate-900/90"></div>
                    
                    <button onClick={handleClose} className="absolute top-6 right-6 text-white/90 hover:text-white transition-colors bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-2.5 shadow-md active:scale-95 border border-white/10">
                        <X size={20} />
                    </button>

                    <div className="absolute bottom-8 left-8 right-8">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg border border-white/20">
                                Main Story
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-lg leading-none mb-2">
                            My Journey
                        </h2>
                        <p className="text-slate-300 text-xs font-medium bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg w-fit border border-white/10">
                            Chapter {currentChapterId} : เขียนเรื่องราวของคุณเอง
                        </p>
                    </div>
                </div>

                {/* Timeline Content */}
                <div className="flex-1 overflow-y-auto p-0 pt-6 pb-32 custom-scrollbar relative">
                    
                    {/* Continuous Line (Behind everything) */}
                    <div className="absolute left-[34px] top-0 bottom-0 w-1 bg-slate-200 dark:bg-slate-800 z-0"></div>

                    <div className="space-y-6 px-4">
                    {STORY_CHAPTERS.map((chapter, index) => {
                        const isUnlocked = currentChapterId >= chapter.id;
                        const isCurrent = currentChapterId === chapter.id;
                        const isCompleted = currentChapterId > chapter.id;
                        const tasksData = chapter.tasks.map(t => getTaskProgress(t));
                        const allDone = tasksData.every(t => t.completed);
                        
                        let rewardItemName = null;
                        if (chapter.rewards.item) {
                            const shopItem = SHOP_ITEMS.find(i => i.id === chapter.rewards.item);
                            const fashionItem = FASHION_ITEMS.find(i => i.id === chapter.rewards.item);
                            rewardItemName = shopItem?.name || fashionItem?.name || "Mystery Item";
                        }

                        // --- 1. COMPLETED CHAPTER (COLLAPSED & CUTE) ---
                        if (isCompleted) {
                            return (
                                <div key={chapter.id} className="relative pl-12 transition-all duration-500">
                                    {/* Node */}
                                    <div className="absolute left-[10px] top-4 w-5 h-5 rounded-full bg-green-500 border-4 border-white dark:border-slate-900 shadow-md z-10 flex items-center justify-center text-white">
                                        <CheckCircle2 size={12} strokeWidth={4} />
                                    </div>

                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm opacity-60 hover:opacity-100 transition-opacity flex items-center justify-between group">
                                        <div>
                                            <div className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-0.5">Chapter {chapter.id} Completed</div>
                                            <div className="font-bold text-slate-700 dark:text-slate-300 text-sm line-through decoration-slate-400">{chapter.title}</div>
                                        </div>
                                        <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-1.5 rounded-full">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // --- 2. CURRENT CHAPTER (EXPANDED & HERO) ---
                        if (isCurrent) {
                            return (
                                <div key={chapter.id} className="relative pl-12 animate-in slide-in-from-bottom-4 duration-500">
                                    {/* Pulsing Node */}
                                    <div className="absolute left-[6px] top-0">
                                        <div className="w-7 h-7 rounded-full bg-orange-500 border-4 border-white dark:border-slate-900 shadow-lg z-20 flex items-center justify-center relative">
                                            <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-75"></div>
                                            <MapPin size={14} className="text-white relative z-10" fill="currentColor" />
                                        </div>
                                    </div>

                                    {/* Hero Card */}
                                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border-2 border-orange-100 dark:border-orange-500/20 overflow-hidden relative">
                                        {/* Background Pattern */}
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none">
                                            <BookOpen size={140} fill="currentColor" />
                                        </div>

                                        <div className="p-5 relative z-10">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg">
                                                    Current Goal
                                                </span>
                                                <span className="text-xs font-bold text-slate-400">Chapter {chapter.id}</span>
                                            </div>
                                            
                                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{chapter.title}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">{chapter.subtitle}</p>
                                            
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl mb-5 text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed border border-slate-100 dark:border-slate-700">
                                                "{chapter.description}"
                                            </div>

                                            {/* Tasks */}
                                            <div className="space-y-3 mb-6">
                                                {chapter.tasks.map((task, i) => {
                                                    const progress = tasksData[i];
                                                    const percent = Math.min(100, (progress.current / progress.target) * 100);
                                                    return (
                                                        <div key={i} className="flex flex-col gap-1.5">
                                                            <div className="flex justify-between items-center text-xs font-bold">
                                                                <span className={`flex items-center gap-1.5 ${progress.completed ? 'text-slate-400 line-through decoration-2' : 'text-slate-700 dark:text-slate-200'}`}>
                                                                    {progress.completed ? <CheckCircle2 size={14} className="text-green-500" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>}
                                                                    {task.text}
                                                                </span>
                                                                <span className={progress.completed ? 'text-green-500' : 'text-orange-500'}>
                                                                    {Math.floor(progress.current)}/{progress.target}
                                                                </span>
                                                            </div>
                                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                <div 
                                                                    className={`h-full rounded-full transition-all duration-700 ease-out ${progress.completed ? 'bg-green-500' : 'bg-gradient-to-r from-orange-400 to-amber-400'}`} 
                                                                    style={{ width: `${percent}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Rewards */}
                                            <div className="flex flex-wrap gap-2 mb-6 justify-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                                {chapter.rewards.title && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                                        <Crown size={12} /> {chapter.rewards.title}
                                                    </span>
                                                )}
                                                {chapter.rewards.diamonds && chapter.rewards.diamonds > 0 && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold bg-cyan-50 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 px-3 py-1.5 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                                                        <Gem size={12} /> {chapter.rewards.diamonds}
                                                    </span>
                                                )}
                                                {chapter.rewards.gold > 0 && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold bg-yellow-50 dark:bg-slate-800 text-yellow-600 dark:text-yellow-400 px-3 py-1.5 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                                                        G +{chapter.rewards.gold}
                                                    </span>
                                                )}
                                                {rewardItemName && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold bg-pink-50 dark:bg-slate-800 text-pink-600 dark:text-pink-400 px-3 py-1.5 rounded-xl border border-pink-100 dark:border-pink-900/30">
                                                        <Gift size={12} /> {rewardItemName}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            {allDone ? (
                                                <button 
                                                    onClick={() => handleClaimClick(chapter)}
                                                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-4 rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 animate-bounce-soft active:scale-95 transition-all text-sm uppercase tracking-wide"
                                                >
                                                    <Sparkles size={18} className="animate-spin-slow" /> Complete & Claim Rewards
                                                </button>
                                            ) : (
                                                <div className="w-full bg-slate-100 dark:bg-slate-700/50 text-slate-400 font-bold py-3 rounded-xl text-center text-xs border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2">
                                                    <Lock size={14} /> Complete tasks to unlock rewards
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // --- 3. LOCKED CHAPTER (DIMMED) ---
                        return (
                            <div key={chapter.id} className="relative pl-12 opacity-50">
                                <div className="absolute left-[11px] top-4 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-white dark:border-slate-900 z-10"></div>
                                <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-full text-slate-400">
                                        <Lock size={16} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chapter {chapter.id}</div>
                                        <div className="font-bold text-slate-500 dark:text-slate-400 text-sm">{chapter.title}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    </div>
                </div>
            </div>

            {/* REWARD POPUP OVERLAY */}
            {rewardPopup && (
                <div className="absolute inset-0 z-[700] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    
                    {/* Confetti Container */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {confetti.map((c) => (
                            <div 
                                key={c.id} 
                                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-fall" 
                                style={{ 
                                    left: c.left, 
                                    top: '-20px', 
                                    animationDuration: '2s',
                                    animationDelay: c.delay,
                                    backgroundColor: ['#fbbf24', '#f472b6', '#3b82f6', '#34d399'][Math.floor(Math.random()*4)] 
                                }}
                            />
                        ))}
                    </div>

                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-orange-400 relative animate-in zoom-in-95 duration-500">
                        {/* Popup Header */}
                        <div className="h-32 bg-gradient-to-br from-orange-400 to-yellow-500 flex flex-col items-center justify-center text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                            <h2 className="text-3xl font-black italic tracking-tighter drop-shadow-md animate-bounce-soft">CHAPTER COMPLETE!</h2>
                            <p className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full mt-1 backdrop-blur">
                                Chapter {rewardPopup.id}: {rewardPopup.title}
                            </p>
                        </div>

                        {/* Rewards Content */}
                        <div className="p-6 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm italic mb-6">
                                "{rewardPopup.description}"
                            </p>

                            {/* MAIN REWARD: TITLE BADGE */}
                            <div className="mb-6 animate-pulse">
                                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest block mb-2">New Title Unlocked</span>
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/40 dark:to-yellow-900/40 border-2 border-orange-400 text-orange-700 dark:text-orange-300 px-6 py-3 rounded-2xl shadow-lg transform scale-110">
                                    <Crown size={24} fill="currentColor" />
                                    <span className="text-xl font-black uppercase tracking-tight">{rewardPopup.rewards.title || "Citizen"}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {rewardPopup.rewards.diamonds && (
                                    <div className="bg-cyan-50 dark:bg-slate-800 p-2 rounded-xl flex items-center justify-center gap-2 border border-cyan-200 dark:border-slate-700">
                                        <Gem size={16} className="text-cyan-500" />
                                        <span className="font-bold text-sm text-gray-700 dark:text-white">+{rewardPopup.rewards.diamonds}</span>
                                    </div>
                                )}
                                {rewardPopup.rewards.gold > 0 && (
                                    <div className="bg-yellow-50 dark:bg-slate-800 p-2 rounded-xl flex items-center justify-center gap-2 border border-yellow-200 dark:border-slate-700">
                                        <div className="text-yellow-500 font-bold">G</div>
                                        <span className="font-bold text-sm text-gray-700 dark:text-white">+{rewardPopup.rewards.gold}</span>
                                    </div>
                                )}
                                {rewardPopup.rewards.exp > 0 && (
                                    <div className="bg-indigo-50 dark:bg-slate-800 p-2 rounded-xl flex items-center justify-center gap-2 border border-indigo-200 dark:border-slate-700">
                                        <div className="text-indigo-500 font-bold text-xs">XP</div>
                                        <span className="font-bold text-sm text-gray-700 dark:text-white">+{rewardPopup.rewards.exp}</span>
                                    </div>
                                )}
                                {rewardPopup.rewards.item && (
                                    <div className="bg-pink-50 dark:bg-slate-800 p-2 rounded-xl flex items-center justify-center gap-2 border border-pink-200 dark:border-slate-700">
                                        <Gift size={16} className="text-pink-500" />
                                        <span className="font-bold text-xs text-gray-700 dark:text-white truncate">Item Gift</span>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleConfirmClaim}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-xl active:scale-95 transition-all"
                            >
                                Awesome!
                            </button>
                        </div>
                    </div>
                    
                    <style>{`
                        @keyframes fall {
                            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                        }
                        .animate-fall {
                            animation: fall linear forwards;
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};
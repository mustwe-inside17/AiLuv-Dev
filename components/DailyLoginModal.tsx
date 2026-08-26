
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Gem, CheckCircle2, Lock, X, Gift, Calendar, Sparkles } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../store/gameStore';
import { DAILY_LOGIN_REWARDS, LOCATION_IMAGES } from '../constants';
import { SHOP_ITEMS } from '../constants';
import { getCharacterImageUrl } from '../services/firebase';
import { playSfx } from '../utils/audioUtils';
import { EmojiIcon } from './ui/EmojiIcon';

interface DailyLoginModalProps {
    onClose: () => void;
}

export const DailyLoginModal: React.FC<DailyLoginModalProps> = ({ onClose }) => {
    const { dailyLogin, claimDailyLogin } = useGameStore(useShallow(state => ({
        dailyLogin: state.dailyLogin,
        claimDailyLogin: state.claimDailyLogin
    })));
    const [renderState, setRenderState] = useState<'hidden' | 'open' | 'closing'>('hidden');
    const [confetti, setConfetti] = useState<{id: number, left: string, delay: string}[]>([]);
    const [headerUrl, setHeaderUrl] = useState('');
    
    // Check if claimable (Not claimed today)
    const todayStr = new Date().toDateString();
    const isClaimable = dailyLogin.lastClaimDate !== todayStr;

    useEffect(() => {
        requestAnimationFrame(() => setRenderState('open'));
        
        // Load Header Image
        const load = async () => {
            const url = await getCharacterImageUrl(LOCATION_IMAGES.daily_login_bg);
            if (url) setHeaderUrl(url);
        };
        load();
    }, []);

    const handleClose = () => {
        setRenderState('closing');
        setTimeout(onClose, 300);
    };

    const handleClaim = () => {
        if (!isClaimable) return;
        
        const success = claimDailyLogin();
        if (success) {
            playSfx('task_complete'); // SFX Feedback
            
            // Trigger Confetti
            const newConfetti = Array.from({ length: 40 }).map((_, i) => ({
                id: Date.now() + i,
                left: `${Math.random() * 100}%`,
                delay: `${Math.random() * 0.5}s`
            }));
            setConfetti(newConfetti);
            
            // Auto close after delay
            setTimeout(handleClose, 2500);
        }
    };

    const resolveItemIcon = (id: string) => {
        const item = SHOP_ITEMS.find(i => i.id === id);
        return item ? item.emoji : '🎁';
    };

    if (renderState === 'hidden') return null;

    return createPortal(
        <div className={`fixed inset-0 z-[3000] flex items-center justify-center p-4 transition-all duration-300 ${renderState === 'open' ? 'bg-slate-950/80 backdrop-blur-sm opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`}>
            
            {/* Confetti */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {confetti.map((c) => (
                    <div 
                        key={c.id} 
                        className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-fall z-[810]" 
                        style={{ 
                            left: c.left, 
                            top: '-20px', 
                            animationDuration: '2.5s',
                            animationDelay: c.delay,
                            backgroundColor: ['#fbbf24', '#f472b6', '#3b82f6', '#34d399'][Math.floor(Math.random()*4)] 
                        }}
                    />
                ))}
            </div>

            <div 
                className={`
                    relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-indigo-400/30 
                    transform transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) flex flex-col max-h-[85vh]
                    ${renderState === 'open' ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}
                `}
            >
                {/* Header */}
                <div className="relative h-40 bg-indigo-900 shrink-0 overflow-hidden">
                    {headerUrl ? (
                        <img src={headerUrl} className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-700" alt="Daily Login" />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                    )}
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>

                    <button onClick={handleClose} className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors backdrop-blur-md z-20">
                        <X size={20} />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center z-10">
                        <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest mb-2 border border-white/20 shadow-sm">
                            7-Day Challenge
                        </div>
                        <h2 className="text-3xl font-black text-white italic tracking-tight drop-shadow-md flex items-center justify-center gap-2">
                            <Calendar size={28} /> DAILY LOGIN
                        </h2>
                        <p className="text-white/90 text-xs font-medium mt-1">Log in everyday to claim premium rewards!</p>
                    </div>
                </div>

                {/* Grid */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        {DAILY_LOGIN_REWARDS.slice(0, 6).map((reward) => {
                            const isCurrent = reward.day === dailyLogin.currentDay;
                            // Logic: Only past days are claimed. Current day is Active (if claimable) or Locked.
                            const isClaimed = reward.day < dailyLogin.currentDay || (dailyLogin.currentDay === 1 && dailyLogin.lastClaimDate === todayStr && !isClaimable);
                            const isActive = isCurrent && isClaimable;

                            return (
                                <div 
                                    key={reward.day}
                                    className={`
                                        relative p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all
                                        ${isClaimed 
                                            ? 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 opacity-60 grayscale-[0.5]' 
                                            : isActive 
                                                ? 'bg-white dark:bg-slate-800 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)] scale-105 z-10' 
                                                : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 opacity-80'}
                                    `}
                                >
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider absolute top-2 left-3">Day {reward.day}</span>
                                    
                                    {isClaimed && (
                                        <div className="absolute top-2 right-2 text-green-500">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    )}
                                    {!isClaimed && !isActive && (
                                        <div className="absolute top-2 right-2 text-gray-300 dark:text-slate-600">
                                            <Lock size={14} />
                                        </div>
                                    )}

                                    <div className={`text-3xl mt-4 mb-1 filter drop-shadow-sm transition-transform ${isActive ? 'animate-bounce-soft' : ''}`}>
                                        <EmojiIcon emoji={reward.type === 'diamond' ? '💎' : resolveItemIcon(reward.id!)} />
                                    </div>
                                    <div className={`text-xs font-black ${reward.type === 'diamond' ? 'text-cyan-500' : 'text-gray-700 dark:text-white'}`}>
                                        {reward.type === 'diamond' ? `x${reward.value}` : reward.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Day 7 Big Box - Updated Theme */}
                    {(() => {
                        const reward = DAILY_LOGIN_REWARDS[6];
                        const isCurrent = reward.day === dailyLogin.currentDay;
                        const isClaimed = reward.day < dailyLogin.currentDay || (dailyLogin.currentDay === 1 && dailyLogin.lastClaimDate === todayStr && !isClaimable);
                        const isActive = isCurrent && isClaimable;

                        return (
                            <div className={`
                                w-full p-4 rounded-[2rem] border-4 relative overflow-hidden flex items-center justify-between shadow-lg transition-all group
                                ${isClaimed 
                                    ? 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 opacity-60' 
                                    : isActive 
                                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-pulse' 
                                        : 'bg-white dark:bg-slate-800 border-dashed border-gray-300 dark:border-slate-700'}
                            `}>
                                <div className="z-10 pl-2">
                                    <div className={`text-xs font-black uppercase tracking-widest mb-1 flex items-center gap-1 ${isActive ? 'text-amber-500' : 'text-gray-400'}`}>
                                        <Gift size={12} /> GRAND PRIZE
                                    </div>
                                    <div className="text-2xl font-black text-cyan-500 flex items-center gap-1">
                                        💎 900
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-bold mt-0.5">Day 7 Reward</div>
                                </div>
                                
                                <div className={`text-6xl pr-4 filter drop-shadow-lg z-10 transition-transform ${isActive ? 'scale-125 rotate-12' : 'grayscale opacity-50'}`}>
                                    💎
                                </div>

                                {/* Background FX */}
                                {isActive && (
                                    <>
                                        <div className="absolute inset-0 bg-amber-400/10 animate-pulse z-0"></div>
                                        <Sparkles className="absolute top-2 right-2 text-amber-400 animate-spin-slow" size={20} />
                                    </>
                                )}
                            </div>
                        );
                    })()}
                </div>

                {/* Footer Action */}
                <div className="p-5 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shrink-0">
                    <button 
                        onClick={handleClaim}
                        disabled={!isClaimable}
                        className={`
                            w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-2
                            ${isClaimable 
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white active:scale-95 animate-bounce-soft' 
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed'}
                        `}
                    >
                        {isClaimable ? <><CheckCircle2 size={22} /> Claim Reward</> : 'Come back tomorrow'}
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
        </div>,
        document.body
    );
};

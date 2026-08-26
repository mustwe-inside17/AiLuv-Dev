
import React, { useEffect, useState } from 'react';
import { PendingQuestReward } from '../types';
import { Heart, CheckCircle2, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { playSfx } from '../utils/audioUtils';

interface QuestRedemptionModalProps {
    reward: PendingQuestReward;
    onCollect: () => void;
}

export const QuestRedemptionModal: React.FC<QuestRedemptionModalProps> = ({ reward, onCollect }) => {
    const [renderState, setRenderState] = useState<'hidden' | 'open' | 'closing'>('hidden');
    const [currentScore, setCurrentScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [confetti, setConfetti] = useState<{id: number, x: number, y: number, color: string, delay: string}[]>([]);

    useEffect(() => {
        requestAnimationFrame(() => setRenderState('open'));
        playSfx('gacha_roll');

        // Number Rolling Animation
        let start = 0;
        const duration = 2000; // 2 seconds roll
        const stepTime = 20; // Update every 20ms
        const steps = duration / stepTime;
        const increment = reward.calculatedLove / steps;

        const timer = setInterval(() => {
            start += increment;
            if (start >= reward.calculatedLove) {
                setCurrentScore(reward.calculatedLove);
                setIsFinished(true);
                clearInterval(timer);
                playSfx('level_up');
                
                // Explode Confetti
                const colors = ['#F472B6', '#FBBF24', '#60A5FA', '#34D399', '#A78BFA'];
                const newConfetti = Array.from({ length: 50 }).map((_, i) => ({
                    id: i,
                    x: (Math.random() - 0.5) * 500,
                    y: (Math.random() - 0.5) * 500,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    delay: `${Math.random() * 0.3}s`
                }));
                setConfetti(newConfetti);

            } else {
                setCurrentScore(Math.floor(start));
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [reward]);

    const handleCollect = () => {
        setRenderState('closing');
        setTimeout(onCollect, 300);
    };

    if (renderState === 'hidden') return null;

    return (
        <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-6 transition-all duration-300 ${renderState === 'open' ? 'bg-black/80 backdrop-blur-md opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`}>
            
            {/* Confetti */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                {confetti.map((c) => (
                    <div 
                        key={c.id}
                        className="absolute w-3 h-3 rounded-full animate-confetti-explode opacity-0"
                        style={{
                            backgroundColor: c.color,
                            '--tw-translate-x': `${c.x}px`,
                            '--tw-translate-y': `${c.y}px`,
                            animationDelay: c.delay
                        } as React.CSSProperties}
                    />
                ))}
            </div>

            <div 
                className={`
                    relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border-[6px] border-pink-200 dark:border-pink-900 flex flex-col items-center overflow-hidden
                    transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                    ${renderState === 'open' ? 'scale-100 translate-y-0 opacity-100' : 'scale-50 translate-y-20 opacity-0'}
                `}
            >
                {/* Background Pulse */}
                <div className={`absolute inset-0 bg-pink-500/5 rounded-[2.5rem] ${!isFinished ? 'animate-pulse' : ''}`}></div>

                {/* Big Heart Animation */}
                <div className="relative mb-6">
                    <div className={`w-32 h-32 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-xl shadow-pink-500/30 ${!isFinished ? 'animate-heartbeat' : 'scale-110'}`}>
                        <Heart size={64} className="text-white fill-white" />
                    </div>
                    {isFinished && <Sparkles className="absolute -top-4 -right-4 text-yellow-400 w-12 h-12 animate-spin-slow" fill="currentColor" />}
                </div>

                <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2 text-center uppercase tracking-tight">
                    {isFinished ? "Love Received!" : "Rolling Score..."}
                </h2>

                <div className={`text-6xl font-black mb-4 tabular-nums tracking-tighter ${isFinished ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 scale-110 transition-transform' : 'text-gray-400'}`}>
                    +{currentScore}
                </div>

                {reward.isCritical && isFinished && (
                    <div className="bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest mb-6 animate-bounce shadow-lg">
                        Critical Hit!
                    </div>
                )}

                <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 mb-6 relative z-10">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Quest</span>
                        <span className="text-xs font-bold text-indigo-500">{reward.quest.title}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase">Cost</span>
                        <div className="flex items-center gap-1 text-xs font-bold text-orange-500">
                            <Zap size={12} fill="currentColor" /> -{reward.energyCost} Energy
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleCollect}
                    disabled={!isFinished}
                    className={`
                        w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-xl transition-all relative z-20
                        ${isFinished 
                            ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:scale-105 active:scale-95 cursor-pointer animate-in slide-in-from-bottom-4 fade-in duration-500' 
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'}
                    `}
                >
                    {isFinished ? <><CheckCircle2 size={20} /> Collect Love</> : 'Rolling...'}
                </button>

            </div>
            
            <style>{`
                @keyframes confetti-explode {
                    0% { transform: translate(0, 0) scale(0.5); opacity: 1; }
                    50% { opacity: 1; }
                    100% { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(0); opacity: 0; }
                }
                .animate-confetti-explode {
                    animation: confetti-explode 0.8s ease-out forwards;
                }
                @keyframes heartbeat {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .animate-heartbeat {
                    animation: heartbeat 0.6s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};


import React, { useEffect, useState } from 'react';
import { Trophy, Star, CheckCircle2, Crown, Sparkles, ArrowUp } from 'lucide-react';
import { playSfx } from '../utils/audioUtils';

interface LevelUpModalProps {
    newLevel: number;
    onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ newLevel, onClose }) => {
    const [renderState, setRenderState] = useState<'hidden' | 'open' | 'closing'>('hidden');
    const [confetti, setConfetti] = useState<{id: number, left: string, delay: string, color: string}[]>([]);

    useEffect(() => {
        requestAnimationFrame(() => setRenderState('open'));
        
        // Play SFX
        playSfx('level_up');
        
        // Generate Confetti
        const colors = ['#ec4899', '#8b5cf6', '#eab308', '#06b6d4', '#ffffff'];
        const newConfetti = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 1.5}s`,
            color: colors[Math.floor(Math.random() * colors.length)]
        }));
        setConfetti(newConfetti);

    }, []);

    const handleClose = () => {
        setRenderState('closing');
        setTimeout(onClose, 300);
    };

    if (renderState === 'hidden') return null;

    return (
        <div className={`fixed inset-0 z-[999] flex items-center justify-center p-6 transition-all duration-500 ${renderState === 'open' ? 'bg-slate-950/90 backdrop-blur-xl opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`}>
            
            {/* Confetti Layer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {confetti.map((c) => (
                    <div 
                        key={c.id} 
                        className="absolute w-3 h-3 rounded-sm animate-fall" 
                        style={{ 
                            left: c.left, 
                            top: '-20px', 
                            backgroundColor: c.color,
                            animationDuration: '3s',
                            animationDelay: c.delay
                        }}
                    />
                ))}
            </div>

            {/* Radiant Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-pink-500/20 to-orange-500/20 animate-pulse pointer-events-none transition-opacity duration-1000 ${renderState === 'open' ? 'opacity-100' : 'opacity-0'}`}></div>

            <div 
                className={`
                    relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[3rem] p-8 text-center shadow-[0_0_60px_rgba(236,72,153,0.4)] border-[6px] border-white/20 dark:border-white/10
                    transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) flex flex-col items-center
                    ${renderState === 'open' ? 'scale-100 translate-y-0 opacity-100' : 'scale-50 translate-y-20 opacity-0'}
                `}
            >
                {/* Floating Crown */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce-soft">
                    <div className="w-20 h-20 bg-gradient-to-tr from-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800">
                        <Crown size={40} className="text-white drop-shadow-md" fill="currentColor" />
                    </div>
                </div>

                <div className="mt-10 mb-2">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 uppercase tracking-tighter drop-shadow-sm animate-in zoom-in duration-300 delay-100">
                        Level Up!
                    </h2>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em] animate-in fade-in slide-in-from-bottom-2 delay-200">
                        คุณแข็งแกร่งขึ้นแล้ว!
                    </p>
                </div>

                {/* Level Number */}
                <div className="relative my-6 group">
                    <div className="absolute inset-0 bg-pink-500/20 blur-3xl rounded-full animate-pulse"></div>
                    <div className="text-9xl font-black text-slate-800 dark:text-white drop-shadow-2xl animate-in zoom-in-50 duration-500 delay-300 relative z-10 flex items-center justify-center">
                        {newLevel}
                    </div>
                    {/* Decor Stars */}
                    <Sparkles className="absolute top-0 right-0 text-yellow-400 w-12 h-12 animate-spin-slow" fill="currentColor" />
                    <Star className="absolute bottom-4 left-0 text-pink-400 w-8 h-8 animate-bounce" fill="currentColor" />
                </div>

                {/* Rewards Box */}
                <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border-2 border-slate-100 dark:border-slate-700 animate-in slide-in-from-bottom-4 duration-500 delay-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">รางวัลที่ได้รับ</span>
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded text-[10px] font-black uppercase border border-yellow-200 dark:border-yellow-900/50">ทันที</div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg text-white shadow-md">
                            <ArrowUp size={20} strokeWidth={3} />
                        </div>
                        <div className="text-left flex-1">
                            <div className="font-bold text-slate-800 dark:text-white text-sm">แต้มสถานะ +1</div>
                            <div className="text-[10px] text-gray-500">ใช้อัพเกรดค่าพลังของคุณ</div>
                        </div>
                        <CheckCircle2 size={20} className="text-green-500" />
                    </div>
                </div>

                <button 
                    onClick={handleClose}
                    className="w-full mt-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all animate-in slide-in-from-bottom-8 duration-500 delay-700 flex items-center justify-center gap-2"
                >
                    เยี่ยมไปเลย! <Trophy size={20} />
                </button>

            </div>
            
            <style>{`
                @keyframes fall {
                    0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
                .animate-fall {
                    animation: fall linear forwards;
                }
            `}</style>
        </div>
    );
};

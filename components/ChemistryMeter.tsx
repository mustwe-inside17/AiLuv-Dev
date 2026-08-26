
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Heart, Smile, Meh, Laugh, FlaskConical } from 'lucide-react';

interface ChemistryMeterProps {
    score: number;
}

export const ChemistryMeter: React.FC<ChemistryMeterProps> = ({ score }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [tooltipPos, setTooltipPos] = useState<{ top: number, left: number } | null>(null);
    
    // Animation Logic
    const prevScoreRef = useRef(score);
    const [changeAnim, setChangeAnim] = useState<'increase' | 'decrease' | null>(null);
    const [floatingEvents, setFloatingEvents] = useState<{id: number, val: number}[]>([]);

    useEffect(() => {
        if (score !== prevScoreRef.current) {
            if (score > prevScoreRef.current) {
                setChangeAnim('increase');
                const diff = score - prevScoreRef.current;
                const newEvent = { id: Date.now() + Math.random(), val: diff };
                setFloatingEvents(prev => [...prev, newEvent]);
                setTimeout(() => {
                    setFloatingEvents(prev => prev.filter(e => e.id !== newEvent.id));
                }, 2000);
            } else if (score < prevScoreRef.current) {
                setChangeAnim('decrease');
            }
            prevScoreRef.current = score;
            const timer = setTimeout(() => setChangeAnim(null), 600); // Faster animation duration
            return () => clearTimeout(timer);
        }
    }, [score]);

    // Dynamic Visual Logic based on Score Ranges
    let barGradient = 'bg-gray-400';
    let icon = <Meh size={12} className="text-gray-400" />;
    let liquidClass = 'opacity-60';
    let containerBorderClass = 'border-white/30';

    // Apply animation overrides for feedback (Tube only)
    if (changeAnim === 'increase') {
        containerBorderClass = 'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.8)] ring-2 ring-green-400/30 transition-all duration-300 animate-chem-shake';
    }
    // [MARCUS FIX]: Removed 'decrease' animation (red border/shake) as per user request for silent decrease

    if (score > 0 && score < 30) {
        barGradient = 'bg-gradient-to-t from-gray-300 to-gray-400';
        icon = <Smile size={12} className="text-gray-500" />;
        liquidClass = 'opacity-80';
    } else if (score >= 30 && score < 60) {
        barGradient = 'bg-gradient-to-t from-emerald-400 to-emerald-300';
        icon = <Smile size={12} className="text-emerald-600 animate-bounce-soft" />;
        liquidClass = 'opacity-90';
    } else if (score >= 60 && score < 90) {
        // The Golden Hour (Date Unlock)
        barGradient = 'bg-gradient-to-t from-pink-500 via-rose-400 to-pink-300';
        icon = <Laugh size={12} className="text-white fill-pink-500 animate-spin-slow" />;
        liquidClass = 'opacity-100 animate-pulse';
    } else if (score >= 90) {
        // Soul Connection
        barGradient = 'bg-gradient-to-t from-red-600 via-fuchsia-600 to-purple-600 animate-gradient-move bg-[length:200%_200%]';
        icon = <Heart size={12} className="text-red-500 fill-red-500 animate-heartbeat" />;
        liquidClass = 'opacity-100';
    }

    const handleToggleTooltip = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!showTooltip && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setTooltipPos({
                top: rect.top, 
                left: rect.right + 12 
            });
        }
        setShowTooltip(!showTooltip);
    };

    return (
        // Adjusted position to left-[18px] to align visually with Tip icon (accounting for padding)
        <div className="absolute left-[18px] top-24 md:left-6 md:top-32 z-10 flex flex-col items-center gap-2 pointer-events-auto animate-in fade-in slide-in-from-left-4 duration-700">
            
            <style>{`
                @keyframes chem-shake {
                    0%, 100% { transform: rotate(0deg) scale(1.05); }
                    25% { transform: rotate(-8deg) scale(1.05); }
                    50% { transform: rotate(8deg) scale(1.05); }
                    75% { transform: rotate(-8deg) scale(1.05); }
                }
                @keyframes chem-float-cute {
                    0% { transform: translateY(0) scale(0.5) rotate(-10deg); opacity: 0; }
                    20% { transform: translateY(-10px) scale(1.2) rotate(5deg); opacity: 1; }
                    50% { transform: translateY(-20px) scale(1) rotate(-5deg); opacity: 1; }
                    80% { transform: translateY(-30px) scale(1) rotate(5deg); opacity: 0.8; }
                    100% { transform: translateY(-40px) scale(0.8) rotate(0deg); opacity: 0; }
                }
                .animate-chem-shake {
                    animation: chem-shake 0.4s ease-in-out infinite;
                }
                .animate-chem-float {
                    animation: chem-float-cute 1.5s ease-out forwards;
                }
            `}</style>

            {/* Floating Chemistry Events */}
            {floatingEvents.map(ev => (
                <div key={ev.id} className="absolute left-6 top-4 z-50 pointer-events-none flex flex-col items-center animate-chem-float">
                    <div className="text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm border flex items-center gap-0.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/80 dark:to-emerald-900/80 text-green-600 dark:text-green-300 border-green-400 dark:border-green-500">
                        +{Math.floor(ev.val)}
                        <FlaskConical className="w-2.5 h-2.5 text-green-500 fill-green-500" />
                    </div>
                </div>
            ))}

            {/* The Glass Tube - Compact Size */}
            <div className={`relative h-24 w-2.5 md:h-32 md:w-3.5 bg-slate-900/40 backdrop-blur-sm rounded-full border shadow-xl overflow-hidden group transition-all duration-300 ${containerBorderClass}`}>
                
                {/* Glass Reflection (Left Highlight) */}
                <div className="absolute top-0 left-[15%] w-[30%] h-full bg-gradient-to-b from-white/30 to-transparent z-20 pointer-events-none rounded-full"></div>

                {/* The Liquid */}
                <div 
                    className={`absolute bottom-0 left-0 right-0 w-full transition-all duration-1000 ease-out ${barGradient} ${liquidClass} ${changeAnim === 'increase' ? 'brightness-125' : ''}`}
                    style={{ height: `${score}%` }}
                >
                    {/* Liquid Meniscus (Top Surface) */}
                    <div className="absolute top-0 left-0 right-0 h-[4px] bg-white/50 rounded-[50%] -translate-y-1/2 scale-x-125 blur-[0.5px]"></div>
                    
                    {/* Bubbles / Fizz Effect */}
                    {score >= 30 && (
                        <>
                            <div className="absolute bottom-2 left-1/2 w-0.5 h-0.5 bg-white/70 rounded-full animate-float-up" style={{ animationDuration: '2s' }}></div>
                            <div className="absolute bottom-6 left-[30%] w-0.5 h-0.5 bg-white/60 rounded-full animate-float-up" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
                            <div className="absolute bottom-10 left-[70%] w-0.5 h-0.5 bg-white/50 rounded-full animate-float-up" style={{ animationDuration: '2.5s', animationDelay: '1s' }}></div>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Indicator / Button - Compact Size */}
            <div className="relative">
                {showTooltip && tooltipPos && createPortal(
                    <>
                        <div className="fixed inset-0 z-[9998]" onClick={() => setShowTooltip(false)} />
                        <div 
                            className="fixed z-[9999] w-max max-w-[220px] bg-slate-900/95 text-white backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200 origin-left"
                            style={{ top: tooltipPos.top, left: tooltipPos.left }}
                        >
                            <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
                                <FlaskConical size={16} className={score >= 60 ? "text-pink-400" : "text-gray-400"} />
                                <span className={`font-black text-xs uppercase tracking-widest ${score >= 60 ? "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400" : "text-gray-400"}`}>
                                    Chemistry: {Math.floor(score)}%
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="text-[10px] text-gray-300 font-medium leading-relaxed">
                                    "บรรยากาศ" ระหว่างคุณกับเขา ค่านี้จะลดลงตามเวลา ต้องหมั่นเติมให้เต็ม!
                                </div>
                                <div className="grid grid-cols-1 gap-1 text-[9px]">
                                    <div className={`flex justify-between px-2 py-1 rounded ${score < 30 ? 'bg-white/10 text-white' : 'text-gray-500'}`}>
                                        <span>0-29%</span> <span>เฉยๆ (Neutral)</span>
                                    </div>
                                    <div className={`flex justify-between px-2 py-1 rounded ${score >= 30 && score < 60 ? 'bg-green-500/20 text-green-300 font-bold' : 'text-gray-500'}`}>
                                        <span>30-59%</span> <span>เริ่มคลิก (Vibing)</span>
                                    </div>
                                    <div className={`flex justify-between px-2 py-1 rounded ${score >= 60 && score < 90 ? 'bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30' : 'text-gray-500'}`}>
                                        <span>60-89%</span> <span>ชวนเดทได้ (Date Ready) 🍷</span>
                                    </div>
                                    <div className={`flex justify-between px-2 py-1 rounded ${score >= 90 ? 'bg-gradient-to-r from-red-500/20 to-purple-500/20 text-white font-black border border-red-500/50' : 'text-gray-500'}`}>
                                        <span>90%+</span> <span>คลั่งรัก (Deep Bond) ❤️</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-4 -left-1.5 w-3 h-3 bg-slate-900 border-l border-b border-white/10 rotate-45"></div>
                        </div>
                    </>,
                    document.body
                )}

                <button 
                    ref={buttonRef}
                    onClick={handleToggleTooltip}
                    className={`w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center border transition-all duration-300 active:scale-95 hover:scale-110 z-20 relative ${containerBorderClass.includes('border-green') ? 'border-green-400' : containerBorderClass.includes('border-red') ? 'border-red-400' : 'border-gray-200 dark:border-slate-700'}`}
                >
                    {icon}
                    {/* Tiny Score Badge */}
                    <div className="absolute -top-1 -right-1 bg-black text-white text-[7px] font-bold px-1 rounded-full border border-white shadow-sm min-w-[14px] text-center">
                        {Math.floor(score)}
                    </div>
                </button>
            </div>
        </div>
    );
};

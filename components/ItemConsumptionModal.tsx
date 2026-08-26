
import React, { useEffect, useState } from 'react';
import { ShopItem, BuffType, StyleItem } from '../types';
import { Zap, Sparkles, ArrowUp, Brain, Star, Clover, Heart, X, Utensils, Shirt, CheckCircle2 } from 'lucide-react';
import { getBuffConfig } from '../services/buffMechanics';
import { ItemIcon } from './ui/ItemIcon';

interface ConsumptionResult {
    item: ShopItem;
    energyGained: number;
    buffsGained?: { type: BuffType, value: number, duration: number };
    statGained?: { type: string, value: number }; // For Omakase
    styleItem?: StyleItem; // NEW: For Fashion Unlocks
}

interface ItemConsumptionModalProps {
    result: ConsumptionResult | null;
    onClose: () => void;
}

export const ItemConsumptionModal: React.FC<ItemConsumptionModalProps> = ({ result, onClose }) => {
    const [renderState, setRenderState] = useState<'hidden' | 'open' | 'closing'>('hidden');
    const [confetti, setConfetti] = useState<{id: number, x: number, y: number, color: string, delay: string}[]>([]);

    useEffect(() => {
        if (result) {
            setRenderState('open');
            // Trigger Confetti Explosion
            const colors = ['#F472B6', '#FBBF24', '#60A5FA', '#34D399', '#A78BFA'];
            const newConfetti = Array.from({ length: 40 }).map((_, i) => ({
                id: i,
                x: (Math.random() - 0.5) * 400, // Spread X
                y: (Math.random() - 1) * 400,   // Spread Y (Upwards)
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: `${Math.random() * 0.2}s`
            }));
            setConfetti(newConfetti);
        } else {
            setRenderState('hidden');
            setConfetti([]);
        }
    }, [result]);

    const handleClose = () => {
        setRenderState('closing');
        setTimeout(() => {
            onClose();
            setRenderState('hidden'); // Reset after animation
        }, 300); // Match animation duration
    };

    if (renderState === 'hidden' || !result) return null;

    const { item, energyGained, buffsGained, statGained, styleItem } = result;

    // Generate Flavor Text
    const getFlavorText = () => {
        // Special Fashion Case
        if (styleItem) return "ชุดใหม่สุดปัง! ใส่แล้วราศีจับแน่นอน ✨";

        // Night Market Special Flavor
        if (item.source === 'market') return "อร่อยแสงออกปาก! 🤩✨ (Taste of Heaven)";

        if (item.id === 'omakase') return "รสชาติแห่งความสำเร็จ! เชฟปั้นมาด้วยจิตวิญญาณ...";
        if (item.id === 'food_full_meal') return "อิ่มจนจุก! พลังงานล้นเหลือสุดๆ";
        if (item.id.includes('coffee') || item.id.includes('espresso')) return "ตาตื่นเลย! คาเฟอีนวิ่งพล่านในเส้นเลือด";
        if (item.id.includes('sweet') || item.id.includes('cake') || item.id.includes('cookie')) return "หวานละมุน... ฟินจนแก้มออก";
        if (item.id.includes('spicy') || item.id.includes('noodle')) return "ซี๊ดดด! เผ็ดร้อนสะใจโล่งคอสุดๆ";
        return "อร่อยจนต้องขอเบิ้ล! 😋";
    };

    const getStatIcon = (type: string) => {
        switch(type) {
            case 'vit': return <Zap className="text-red-500" size={24} />;
            case 'int': return <Brain className="text-blue-500" size={24} />;
            case 'cha': return <Heart className="text-pink-500" size={24} />;
            case 'luck': return <Clover className="text-yellow-500" size={24} />;
            default: return <Star className="text-purple-500" size={24} />;
        }
    };

    return (
        <div className={`fixed inset-0 z-[900] flex items-center justify-center p-4 transition-all duration-300 ${renderState === 'open' ? 'bg-slate-950/80 backdrop-blur-sm opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`}>
            
            {/* Confetti Container */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                {renderState === 'open' && confetti.map((c) => (
                    <div 
                        key={c.id}
                        className="absolute w-3 h-3 rounded-full animate-confetti-explode opacity-0"
                        style={{
                            backgroundColor: c.color,
                            transform: `translate(${c.x}px, ${c.y}px)`,
                            '--tw-translate-x': `${c.x}px`,
                            '--tw-translate-y': `${c.y}px`,
                            animationDelay: c.delay
                        } as React.CSSProperties}
                    />
                ))}
            </div>

            <div 
                className={`
                    relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-white/20 
                    transform transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)
                    ${renderState === 'open' ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-10 opacity-0'}
                `}
            >
                {/* Background FX */}
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-50/50 to-transparent dark:from-yellow-900/10 pointer-events-none"></div>
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/80 to-transparent dark:from-white/10 z-0"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center p-8 text-center">
                    
                    {/* Item Icon with Bounce Animation */}
                    <div className="mb-6 relative group">
                        <div className="text-8xl animate-bounce-soft filter drop-shadow-xl transform transition-transform hover:scale-110 duration-300 cursor-pointer">
                            <ItemIcon itemId={item.id} fallbackEmoji={item.emoji} className="w-32 h-32" />
                        </div>
                        {/* Stamp Effect */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 ${styleItem ? 'border-fuchsia-500 text-fuchsia-500' : 'border-green-500 text-green-500'} font-black text-xs uppercase tracking-widest px-2 py-1 rounded rotate-[-15deg] opacity-0 animate-stamp-in bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm whitespace-nowrap shadow-lg`}>
                            {styleItem ? 'UNLOCKED' : statGained ? `${statGained.type.toUpperCase()} +1` : 'CONSUMED'}
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2 leading-tight">
                        {item.name}
                    </h2>
                    
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 italic mb-8 bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-slate-700 w-full">
                        "{getFlavorText()}"
                    </p>

                    {/* Rewards Grid */}
                    <div className="w-full space-y-3 mb-8">
                        {/* 1. Energy Gain */}
                        {energyGained > 0 && (
                            <div className="flex items-center justify-between bg-orange-50 dark:bg-slate-800 p-3 rounded-2xl border border-orange-100 dark:border-slate-700 shadow-sm animate-in slide-in-from-left duration-500">
                                <div className="flex items-center gap-3">
                                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl text-orange-500">
                                        <Zap size={20} fill="currentColor" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Energy</div>
                                        <div className="text-sm font-extrabold text-orange-600 dark:text-orange-400">Restored</div>
                                    </div>
                                </div>
                                <div className="text-xl font-black text-orange-500">+{energyGained}</div>
                            </div>
                        )}

                        {/* 2. Buff Gained */}
                        {buffsGained && (
                            <div className="flex items-center justify-between bg-indigo-50 dark:bg-slate-800 p-3 rounded-2xl border border-indigo-100 dark:border-slate-700 shadow-sm animate-in slide-in-from-right duration-500 delay-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-xl text-indigo-500 text-xl">
                                        {getBuffConfig(buffsGained.type).icon}
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Buff Active</div>
                                        <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{getBuffConfig(buffsGained.type).label}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-indigo-500">{buffsGained.duration}m</div>
                                </div>
                            </div>
                        )}

                        {/* 3. Stat Gained (Omakase) */}
                        {statGained && (
                            <div className="flex items-center justify-between bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-slate-800 dark:to-slate-800 p-3 rounded-2xl border border-yellow-200 dark:border-yellow-900/50 shadow-md animate-in zoom-in duration-500 delay-200 ring-2 ring-yellow-400/20">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white dark:bg-slate-700 p-2 rounded-xl shadow-sm">
                                        {getStatIcon(statGained.type)}
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">Permanent Boost</div>
                                        <div className="text-sm font-extrabold text-gray-800 dark:text-white uppercase">{statGained.type} Up!</div>
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-amber-500 flex items-center">
                                    <ArrowUp size={20} strokeWidth={4} /> {statGained.value}
                                </div>
                            </div>
                        )}

                        {/* 4. Style Gained (Fashion) */}
                        {styleItem && styleItem.stats && (
                            <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-bottom duration-500">
                                {Object.entries(styleItem.stats).map(([stat, val]) => (
                                    <div key={stat} className="flex items-center justify-between bg-fuchsia-50 dark:bg-slate-800 p-3 rounded-2xl border border-fuchsia-100 dark:border-slate-700 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            {getStatIcon(stat)}
                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">{stat}</span>
                                        </div>
                                        <span className="text-sm font-black text-fuchsia-500">+{val}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleClose}
                        className={`w-full font-bold text-lg py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 ${styleItem ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white' : 'bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-gray-900'}`}
                    >
                        {styleItem ? <><CheckCircle2 size={20} /> Equip Later</> : <><Utensils size={20} /> Yum! All gone.</>}
                    </button>

                </div>
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
                @keyframes stamp-in {
                    0% { opacity: 0; transform: scale(3) rotate(-15deg); }
                    100% { opacity: 1; transform: scale(1) rotate(-15deg); }
                }
                .animate-stamp-in {
                    animation: stamp-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s; /* Delay for effect */
                }
            `}</style>
        </div>
    );
};

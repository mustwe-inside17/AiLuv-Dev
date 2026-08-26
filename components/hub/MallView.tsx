import React, { useState } from 'react';
import { GameState, StyleItem, FashionCollection } from '../../types';
import { FASHION_ITEMS } from '../../constants/fashion';
import { LOCATION_IMAGES } from '../../constants/assets';
import { getCharacterImageUrl } from '../../services/firebase';
import { ShoppingBag, Lock, ChevronRight, Check } from 'lucide-react';

interface MallViewProps {
    gameState: GameState;
    onBuyStyle: (style: StyleItem) => void;
    onBack?: () => void;
}

export const MallView: React.FC<MallViewProps> = ({ gameState, onBuyStyle, onBack }) => {
    const [headerUrl, setHeaderUrl] = useState('');
    const [category, setCategory] = useState<FashionCollection>('basics');

    React.useEffect(() => {
        const load = async () => {
            const url = await getCharacterImageUrl(LOCATION_IMAGES.mall_night); // Always glam
            if (url) setHeaderUrl(url);
        };
        load();
    }, []);

    const filteredItems = FASHION_ITEMS.filter(i => i.collection === category);

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-4">
            {/* Header */}
            <div className="relative h-48 rounded-[2rem] border-4 border-white dark:border-slate-800 mb-4 overflow-hidden shadow-lg group">
                {headerUrl ? <img src={headerUrl} alt="Mall" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="w-full h-full bg-cyan-900"></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="font-black text-2xl mb-1 drop-shadow-md tracking-tight italic">FASHION MALL</h3>
                    <p className="text-xs font-bold text-cyan-300 bg-black/40 w-fit px-2 py-1 rounded backdrop-blur">VANDAL Concept Store</p>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
                <button 
                    onClick={() => setCategory('basics')} 
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${category === 'basics' ? 'bg-fuchsia-600 border-fuchsia-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400'}`}
                >
                    Night Market
                </button>
                <button 
                    onClick={() => setCategory('professional')} 
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${category === 'professional' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400'}`}
                >
                    Professional
                </button>
                <button 
                    onClick={() => setCategory('vandal')} 
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 flex items-center gap-1 ${category === 'vandal' ? 'bg-black border-yellow-500 text-yellow-400 shadow-xl' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400'}`}
                >
                    VANDAL X
                </button>
            </div>

            {/* Item List */}
            <div className="grid grid-cols-1 gap-3">
                {filteredItems.map(item => {
                    const isOwned = gameState.ownedStyles.includes(item.id);
                    const canAfford = gameState.gold >= item.cost;
                    const isVandal = item.collection === 'vandal';

                    return (
                        <div 
                            key={item.id} 
                            className={`
                                relative p-4 rounded-[2rem] border-2 shadow-md transition-all group overflow-hidden
                                ${isVandal ? 'bg-slate-900 border-yellow-500/30' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'}
                            `}
                        >
                            {isVandal && <div className="absolute top-0 right-0 p-8 bg-yellow-500/10 rounded-bl-[100%] z-0"></div>}
                            
                            <div className="relative z-10 flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${isVandal ? 'bg-black border border-yellow-500/50' : 'bg-gray-100 dark:bg-slate-700'}`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-lg leading-tight ${isVandal ? 'text-yellow-400' : 'text-gray-800 dark:text-white'}`}>{item.name}</h4>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 max-w-[150px]">{item.description}</p>
                                        
                                        {/* Stats Badge */}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {Object.entries(item.stats).map(([stat, val]) => (
                                                <span key={stat} className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                                                    {stat} +{val}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    {isOwned ? (
                                        <div className="px-3 py-1.5 bg-green-100 text-green-600 text-xs font-bold rounded-lg flex items-center gap-1">
                                            <Check size={12} strokeWidth={3} /> Owned
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => canAfford && onBuyStyle(item)}
                                            disabled={!canAfford}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all ${canAfford ? (isVandal ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-black text-white dark:bg-white dark:text-black') : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                        >
                                            Buy {item.cost} G
                                        </button>
                                    )}
                                    {item.socialBias.length > 0 && (
                                        <span className="text-[8px] text-pink-400 font-bold bg-pink-50 dark:bg-pink-900/20 px-1.5 py-0.5 rounded">
                                            Liked by {item.socialBias[0].charAt(0).toUpperCase() + item.socialBias[0].slice(1)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {onBack && (
                <button onClick={onBack} className="w-full py-3 text-gray-400 font-bold flex items-center justify-center gap-2 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <ChevronRight className="rotate-180" size={16}/> Leave Mall
                </button>
            )}
        </div>
    );
};
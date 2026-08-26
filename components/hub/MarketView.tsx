
import React, { useState } from 'react';
import { ShopItem, GameState } from '../../types';
import { SHOP_ITEMS, LOCATION_IMAGES } from '../../constants';
import { getBuffConfig } from '../../services/buffMechanics';
import { getCharacterImageUrl } from '../../services/firebase';
import { Lock, Zap, ArrowUp, ChevronRight, Gem } from 'lucide-react';
import { ItemIcon } from '../ui/ItemIcon';

interface MarketViewProps {
    gameState: GameState;
    onBuyItem: (item: ShopItem) => void;
    onBack?: () => void;
}

export const MarketView: React.FC<MarketViewProps> = ({ gameState, onBuyItem, onBack }) => {
    const [headerUrl, setHeaderUrl] = useState('');
    const [shopCategory, setShopCategory] = useState<'all' | 'food' | 'gift' | 'gadget'>('all');

    React.useEffect(() => {
        const load = async () => {
            const url = await getCharacterImageUrl(LOCATION_IMAGES.market_night);
            if (url) setHeaderUrl(url);
        };
        load();
    }, []);

    // Filter items specifically for 'market' source
    const marketItems = SHOP_ITEMS.filter(item => item.source === 'market');

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-4">
            {/* Header */}
            <div className="relative h-48 rounded-[2rem] border-4 border-white dark:border-slate-800 mb-4 overflow-hidden shadow-lg group">
                {headerUrl ? <img src={headerUrl} alt="Market" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="w-full h-full bg-purple-900"></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="font-extrabold text-2xl mb-1 drop-shadow-md tracking-tight italic text-fuchsia-200">Night Sky Market</h3>
                    <p className="text-xs font-bold text-fuchsia-300 bg-black/40 w-fit px-2 py-1 rounded backdrop-blur">Street Food & Rare Gadgets</p>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
                {['all', 'food', 'gift', 'gadget'].map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setShopCategory(cat as any)} 
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors border ${shopCategory === cat ? 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-[0_0_15px_rgba(192,38,211,0.5)]' : 'bg-gray-900/50 text-gray-400 border-gray-700 hover:text-white'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
                {marketItems.filter(i => shopCategory === 'all' || i.category === shopCategory).sort((a, b) => a.cost - b.cost).map(item => {
                    const isSkillItem = !!item.unlocksSkill;
                    const isOwned = isSkillItem && gameState.unlockedSkills.includes(item.unlocksSkill!);
                    
                    // Dark/Neon Theme Styles
                    let borderColor = 'border-purple-800';
                    let bgColor = 'bg-slate-900';
                    let textColor = 'text-white';
                    
                    if (isSkillItem) {
                        borderColor = 'border-cyan-700';
                        bgColor = 'bg-gradient-to-br from-slate-900 to-cyan-900/40';
                    } else if (item.buffType) {
                        borderColor = 'border-fuchsia-700';
                        bgColor = 'bg-gradient-to-br from-slate-900 to-fuchsia-900/40';
                    } else if (item.category === 'gift') {
                        borderColor = 'border-pink-800';
                        bgColor = 'bg-gradient-to-br from-slate-900 to-pink-900/40';
                    } else if (item.currency === 'diamond') { // NEW: Diamond Item Style
                        borderColor = 'border-yellow-500';
                        bgColor = 'bg-gradient-to-br from-slate-900 to-yellow-900/30';
                    }

                    const buffConfig = item.buffType ? getBuffConfig(item.buffType) : null;

                    return (
                        <button 
                            key={item.id} 
                            onClick={() => !isOwned && onBuyItem(item)} 
                            disabled={(item.currency === 'diamond' ? (gameState.diamonds || 0) < item.cost : gameState.gold < item.cost) || isOwned} 
                            className={`
                                p-4 rounded-[2rem] border shadow-lg text-left transition-all active:scale-[0.98] disabled:opacity-50 relative overflow-hidden group
                                ${bgColor} ${borderColor}
                            `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-3xl group-hover:scale-110 transition-transform filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
    <ItemIcon itemId={item.id} fallbackEmoji={item.emoji} className="w-10 h-10" />
</div>
                                {!isOwned && (
                                    <div className={`px-2 py-1 rounded-lg text-xs font-bold border ${item.currency === 'diamond' ? 'bg-cyan-900/50 text-cyan-400 border-cyan-500/50 flex items-center gap-1' : 'bg-black/40 text-yellow-400 border-yellow-500/30'}`}>
                                        {item.currency === 'diamond' && <Gem size={10} fill="currentColor" />}
                                        -{item.cost} {item.currency === 'diamond' ? '' : 'G'}
                                    </div>
                                )}
                                {isOwned && <div className="bg-green-900/50 text-green-400 px-2 py-1 rounded-lg text-xs font-bold border border-green-500/30">OWNED</div>}
                            </div>
                            
                            <h4 className={`font-bold leading-tight ${textColor}`}>{item.name}</h4>
                            <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                            
                            {item.energyRestore > 0 && item.category !== 'gift' && (
                                <div className="flex items-center gap-1 text-[10px] font-extrabold text-green-300 bg-green-900/30 px-2 py-1 rounded-full w-fit mt-2 border border-green-800 shadow-sm">
                                    <Zap size={10} fill="currentColor" /> +{item.energyRestore} Energy
                                </div>
                            )}
                            
                            {buffConfig && (
                                <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-fuchsia-300 bg-fuchsia-900/30 px-2 py-1 rounded-full w-fit border border-fuchsia-800">
                                    <span>{buffConfig.icon}</span>
                                    {item.buffDurationMinutes}m
                                </div>
                            )}
                            
                            {(gameState.inventory?.[item.id] || 0) > 0 && (
                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-[0_0_10px_rgba(6,182,212,0.6)] animate-in zoom-in">
                                    {gameState.inventory[item.id]}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {onBack && (
                <button onClick={onBack} className="w-full py-3 text-gray-500 font-bold flex items-center justify-center gap-2 hover:text-white transition-colors">
                    <ChevronRight className="rotate-180" size={16}/> Back
                </button>
            )}
        </div>
    );
};

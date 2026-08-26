
import React, { useState } from 'react';
import { ShopItem, GameState, TimeOfDay } from '../../types';
import { SHOP_ITEMS, LOCATION_IMAGES } from '../../constants';
import { getBuffConfig } from '../../services/buffMechanics';
import { getCharacterImageUrl, checkUrlCache } from '../../services/firebase';
import { Lock, Zap, ArrowUp, ChevronRight, ArrowDown, Gem } from 'lucide-react';
import { ItemIcon } from '../ui/ItemIcon';

interface ShopViewProps {
    gameState: GameState;
    onBuyItem: (item: ShopItem) => void;
    hasSmartHome: boolean;
    isCafe: boolean;
    timeOfDay: TimeOfDay;
    onBack: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ gameState, onBuyItem, hasSmartHome, isCafe, timeOfDay, onBack }) => {
    const isNight = timeOfDay === 'night';
    const targetPath = isNight ? LOCATION_IMAGES.shop_night : LOCATION_IMAGES.shop_day;
    const [headerUrl, setHeaderUrl] = useState(checkUrlCache(targetPath) || '');
    const [shopCategory, setShopCategory] = useState<'all' | 'food' | 'gift' | 'gadget'>('all');

    const isTutorialCookie = gameState.tutorialStep === 'shop_buy_cookie';

    React.useEffect(() => {
        if (!headerUrl) {
            const load = async () => {
                const url = await getCharacterImageUrl(targetPath);
                if (url) setHeaderUrl(url);
            };
            load();
        }
    }, [isNight, targetPath]);

    // Force category to food during tutorial
    React.useEffect(() => {
        if (isTutorialCookie) {
            setShopCategory('food');
        }
    }, [isTutorialCookie]);

    // Filter items to ensure only Cafe items are shown (Exclude Market items)
    const cafeItems = SHOP_ITEMS.filter(item => item.source === 'cafe');

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-4">
            {/* Header */}
            <div className="relative h-48 rounded-[2rem] border-4 border-white dark:border-slate-800 mb-4 overflow-hidden shadow-lg group">
                {headerUrl ? <img src={headerUrl} alt="Shop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600"></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="font-extrabold text-2xl mb-1 drop-shadow-md tracking-tight">Cat & Cup Shop</h3>
                    <p className="text-xs font-medium text-white/80">Restore energy, buy gifts & gadgets.</p>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'food', 'gift', 'gadget'].map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setShopCategory(cat as any)} 
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors ${shopCategory === cat ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-800' : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400'}`}
                        disabled={isTutorialCookie && cat !== 'food'}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
                {cafeItems.filter(i => shopCategory === 'all' || i.category === shopCategory).sort((a, b) => a.cost - b.cost).map(item => {
                    const isUnlockItem = !!item.unlocksTier;
                    const isSkillItem = !!item.unlocksSkill;
                    const isOwned = isSkillItem && gameState.unlockedSkills.includes(item.unlocksSkill!);
                    const isLevelLocked = item.unlockLevel && gameState.level < item.unlockLevel;
                    const isDiamond = item.currency === 'diamond';

                    let borderColor = 'border-green-50 dark:border-slate-700';
                    let bgColor = 'bg-white dark:bg-slate-800';
                    
                    if (isSkillItem) {
                        borderColor = 'border-indigo-200';
                        bgColor = 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-700';
                    } else if (isUnlockItem) {
                        borderColor = 'border-pink-100';
                        bgColor = 'bg-gradient-to-br from-pink-50 to-purple-50 dark:from-slate-800 dark:to-slate-700';
                    } else if (item.buffType) {
                        borderColor = 'border-yellow-200 dark:border-yellow-900/50';
                        bgColor = 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-slate-800 dark:to-slate-700';
                    } else if (isDiamond) {
                        borderColor = 'border-cyan-200 dark:border-cyan-900/50';
                        bgColor = 'bg-gradient-to-br from-cyan-50 to-white dark:from-slate-800 dark:to-slate-700';
                    }

                    const buffConfig = item.buffType ? getBuffConfig(item.buffType) : null;

                    // Tutorial Highlight Logic
                    const isTargetItem = isTutorialCookie && item.id === 'food_cookie';
                    const isDimmed = isTutorialCookie && !isTargetItem;

                    // Affordability Check
                    const canAfford = isDiamond 
                        ? (gameState.diamonds || 0) >= item.cost 
                        : gameState.gold >= item.cost;

                    return (
                        <button 
                            key={item.id} 
                            onClick={() => !isOwned && !isLevelLocked && onBuyItem(item)} 
                            disabled={!canAfford || isOwned || isLevelLocked || isDimmed} 
                            className={`
                                p-4 rounded-[2rem] border shadow-sm text-left transition-all active:scale-[0.98] disabled:opacity-50 relative overflow-hidden group
                                ${bgColor} ${borderColor}
                                ${isLevelLocked ? 'opacity-80' : ''}
                                ${isTargetItem ? 'z-[220] ring-4 ring-pink-500 scale-105 shadow-xl' : isDimmed ? 'opacity-30 grayscale pointer-events-none' : ''}
                            `}
                        >
                            {isTargetItem && (
                                <div className="absolute -top-1 -right-1 z-[230] animate-bounce">
                                    <div className="bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl rounded-tr-xl shadow-md">
                                        BUY ME!
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-2">
                                <div className={`text-3xl group-hover:scale-110 transition-transform ${isLevelLocked ? 'grayscale opacity-50' : ''}`}>
    <ItemIcon itemId={item.id} fallbackEmoji={item.emoji} className="w-10 h-10" />
</div>
                                {!isOwned && !isLevelLocked && (
                                    <div className={`px-2 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 ${isDiamond ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-800' : 'bg-yellow-50 dark:bg-slate-700 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-slate-600'}`}>
                                        {isDiamond && <Gem size={10} fill="currentColor" />}
                                        -{item.cost} {isDiamond ? '' : 'G'}
                                    </div>
                                )}
                                {isOwned && <div className="bg-green-100 text-green-600 px-2 py-1 rounded-lg text-xs font-bold">OWNED</div>}
                                {isLevelLocked && <div className="bg-gray-200 text-gray-500 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><Lock size={10} /> Lv {item.unlockLevel}</div>}
                            </div>
                            
                            <h4 className={`font-bold leading-tight ${isLevelLocked ? 'text-gray-400' : isSkillItem ? 'text-indigo-600 dark:text-indigo-400' : isUnlockItem ? 'text-purple-600 dark:text-purple-400' : isDiamond ? 'text-cyan-600 dark:text-cyan-300' : 'text-gray-800 dark:text-white'}`}>{item.name}</h4>
                            <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                            
                            {item.energyRestore > 0 && !isLevelLocked && item.category !== 'gift' && (
                                <div className="flex items-center gap-1 text-[10px] font-extrabold text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded-full w-fit mt-2 border border-green-200 dark:border-green-800 shadow-sm">
                                    <Zap size={10} fill="currentColor" /> +{item.energyRestore} Energy
                                </div>
                            )}
                            
                            {buffConfig && !isLevelLocked && (
                                <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full w-fit border border-orange-100 dark:border-orange-900/30">
                                    <span>{buffConfig.icon}</span>
                                    {item.buffDurationMinutes}m
                                </div>
                            )}
                            
                            {item.id === 'food_full_meal' && !isLevelLocked && (
                                <div className="absolute top-2 left-2 animate-pulse text-[8px] font-extrabold text-red-400 flex items-center">
                                    <ArrowUp size={8}/> OVERCHARGE
                                </div>
                            )}

                            {isLevelLocked && (
                                <div className="absolute inset-0 bg-gray-50/50 dark:bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center text-gray-500 font-bold z-10 pointer-events-none">
                                    <Lock size={24} className="mb-1 opacity-50" />
                                </div>
                            )}

                            {(gameState.inventory?.[item.id] || 0) > 0 && (
                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md animate-in zoom-in">
                                    {gameState.inventory[item.id]}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {hasSmartHome && !isCafe && (
                <button onClick={onBack} className="w-full py-3 text-gray-400 font-bold flex items-center justify-center gap-2 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <ChevronRight className="rotate-180" size={16}/> Back to Profile
                </button>
            )}
        </div>
    );
};

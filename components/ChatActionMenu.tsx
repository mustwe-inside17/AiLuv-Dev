
import React from 'react';
import { ActionType, CharacterId, RelationshipTier } from '../types';
import { ACTION_CONFIG, CHARACTER_SIGNATURES, TIER_LEVELS, SHOP_ITEMS, ACTION_ITEM_MAP } from '../constants';
import { Lock, Heart, Gift, Users, XCircle, Star, Shirt, Sparkles, Zap, ShoppingBag, Backpack } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

interface ChatActionMenuProps {
    characterId: CharacterId;
    currentTier: RelationshipTier;
    energy: number;
    disabled: boolean;
    inventory: Record<string, number>;
    onAction: (type: ActionType) => void;
    onClose: () => void;
    loveScore: number;
    onBuyAction?: (type: ActionType) => void; 
    chemistryScore?: number; 
}

export const ChatActionMenu: React.FC<ChatActionMenuProps> = ({ 
    characterId, 
    currentTier, 
    energy, 
    disabled, 
    inventory, 
    onAction, 
    onClose,
    loveScore,
    onBuyAction,
    chemistryScore = 0 
}) => {
    
    // Helper to get Item count
    const getItemCount = (itemId: string) => inventory[itemId] || 0;

    const isFriend = TIER_LEVELS[currentTier] >= TIER_LEVELS[RelationshipTier.FRIEND];

    // --- KEY ITEM LOCK LOGIC ---
    const canEvolveFromFriend = currentTier === RelationshipTier.FRIEND && loveScore >= 1999;
    const isRomancePath = [RelationshipTier.FLIRTING, RelationshipTier.PARTNER, RelationshipTier.SOULMATE, RelationshipTier.ETERNAL].includes(currentTier);
    const isPlatonicPath = [RelationshipTier.BEST_FRIEND, RelationshipTier.SOUL_SIBLING, RelationshipTier.ETERNAL].includes(currentTier);
    
    const canGiveBouquet = canEvolveFromFriend || isRomancePath;
    const canGiveBracelet = canEvolveFromFriend || isPlatonicPath;
    
    const canGiveRing = (currentTier === RelationshipTier.FLIRTING && loveScore >= 4999) || [RelationshipTier.PARTNER, RelationshipTier.SOULMATE, RelationshipTier.ETERNAL].includes(currentTier);
    const canGiveJacket = (currentTier === RelationshipTier.BEST_FRIEND && loveScore >= 4999) || [RelationshipTier.SOUL_SIBLING, RelationshipTier.ETERNAL].includes(currentTier);
    
    const canGiveKey = (
        currentTier === RelationshipTier.PARTNER || 
        currentTier === RelationshipTier.SOUL_SIBLING || 
        currentTier === RelationshipTier.SOULMATE || 
        currentTier === RelationshipTier.ETERNAL
    ) && loveScore >= 9999;
    const canGivePendant = (currentTier === RelationshipTier.SOULMATE || currentTier === RelationshipTier.SOUL_SIBLING) && loveScore >= 49999;

    const sigs = CHARACTER_SIGNATURES[characterId];

    const handleActionClick = (type: ActionType) => {
        // [MARCUS NEW]: Check if item needs purchasing
        const itemId = ACTION_ITEM_MAP[type];
        if (itemId) {
            const count = getItemCount(itemId);
            // If count is 0 and onBuyAction is provided, trigger Instant Buy
            if (count === 0 && onBuyAction) {
                onBuyAction(type); // Trigger Instant Buy Flow
                onClose();
                return;
            }
        }

        onAction(type);
        onClose();
    };

    const ActionButton = ({ type }: { type: ActionType }) => {
        const config = ACTION_CONFIG[type];
        if (!config) return null;

        let unlocked = TIER_LEVELS[currentTier] >= TIER_LEVELS[config.tier];
        const affordable = energy >= config.cost;
        
        // [MARCUS NEW]: Check Inventory Status & Price for Gift Actions
        const itemId = ACTION_ITEM_MAP[type];
        let itemStatus = null; // null = standard action, object = item status
        
        if (itemId) {
            const count = getItemCount(itemId);
            const shopItem = SHOP_ITEMS.find(i => i.id === itemId);
            if (shopItem) {
                const baseCost = shopItem.cost;
                // Express Fee Calculation (30%)
                const totalCost = Math.ceil(baseCost * 1.3);
                const currency = shopItem.currency || 'gold';
                
                itemStatus = {
                    count,
                    cost: totalCost,
                    currency,
                    isExpress: count === 0
                };
            }
        }

        return (
            <button 
                onClick={() => handleActionClick(type)}
                disabled={!unlocked || !affordable || disabled}
                aria-label={unlocked ? config.label : `${config.label || 'Action'} Locked`}
                className={`
                    flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative overflow-hidden group min-h-[80px] focus:outline-none focus:ring-2 focus:ring-pink-400
                    ${unlocked 
                        ? 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-500 hover:shadow-md' 
                        : 'bg-gray-100 dark:bg-slate-900 border-transparent opacity-70'}
                `}
            >
                <div className={`text-2xl mb-1 transition-transform group-hover:scale-110 ${!unlocked ? 'blur-sm grayscale' : ''}`}>
                    {unlocked ? config.emoji : <Lock size={20} className="text-gray-400 mx-auto" />}
                </div>
                
                <span className={`text-[11px] font-bold uppercase text-center leading-tight ${unlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}`}>
                    {unlocked ? config.label : "LOCKED"}
                </span>
                
                {unlocked && (
                    <>
                        <span className={`absolute top-1 right-1 text-[11px] font-extrabold ${affordable ? 'text-orange-400' : 'text-red-400'}`}>
                            -{config.cost}⚡
                        </span>
                        
                        {/* [MARCUS NEW]: ITEM STATUS INDICATOR */}
                        {itemStatus && (
                            <div className="mt-1 w-full flex justify-center">
                                {itemStatus.count > 0 ? (
                                    <span className="text-[11px] font-black text-green-500 bg-green-50 dark:bg-green-900/30 px-1.5 rounded border border-green-100 dark:border-green-800">x{itemStatus.count}</span>
                                ) : (
                                    <span className={`text-[11px] font-black px-1.5 rounded flex items-center gap-0.5 border ${itemStatus.currency === 'diamond' ? 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 border-cyan-100' : 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-100'}`}>
                                       {itemStatus.cost} {itemStatus.currency === 'diamond' ? '💎' : 'G'}
                                    </span>
                                )}
                            </div>
                        )}
                    </>
                )}
            </button>
        );
    };

    return (
        // [MARCUS FIX]: Decreased max-height from 420px to 300px
        <div className="absolute bottom-full left-0 right-0 mx-3 mb-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border border-pink-100 dark:border-slate-700 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.2)] p-4 animate-in slide-in-from-bottom-2 fade-in duration-200 z-[100] max-h-[300px] overflow-y-auto custom-scrollbar">
             
             {/* Section 1: Signatures */}
             <div className="mb-4">
                 <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Signature Interactions</h4>
                 <div className="grid grid-cols-3 gap-2">
                     <ActionButton type="poke" /> 
                     {sigs && <ActionButton type={sigs.actionA} />}
                     {sigs && <ActionButton type={sigs.actionB} />}
                 </div>
             </div>

             {/* Section 2: Interactions (Romance) - Only if NOT in Platonic Path */}
             {currentTier !== RelationshipTier.BEST_FRIEND && currentTier !== RelationshipTier.SOUL_SIBLING && (
                 <div className="mb-4">
                     <div className="flex justify-between items-end mb-2 ml-1 pr-1">
                        <h4 className="text-[11px] font-bold text-pink-400 uppercase tracking-widest flex items-center gap-1"><Heart size={12} fill="currentColor"/> Romance</h4>
                        {chemistryScore > 0 && <span className="text-[11px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded border border-green-100">Chem: {chemistryScore}%</span>}
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                         {/* [MARCUS FIX] REMOVED invite_date from grid. It is now in the Header. */}
                         <ActionButton type="hold_hands" />
                         <ActionButton type="hug" />
                         <ActionButton type="kiss_cheek" />
                         <ActionButton type="kiss" />
                         <ActionButton type="deep_kiss" />
                     </div>
                 </div>
             )}

             {/* Section 3: Gifts & Evolution */}
             <div className="mb-4">
                 <div className="flex justify-between items-center mb-2 ml-1 pr-1">
                    <h4 className="text-[11px] font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-1"><Gift size={12} /> Gifts & Evolution</h4>
                    
                    <div className="flex items-center gap-1.5">
                        <button 
                            aria-label="เปิดกระเป๋าเก็บของ"
                            onClick={() => { onClose(); useUIStore.getState().setShowInventory(true); }}
                            className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-700 flex items-center gap-1 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            <Backpack size={12} /> เปิดกระเป๋า
                        </button>
                        <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1 bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-md border border-gray-100 dark:border-white/10">
                            <ShoppingBag size={10} /> Express: +30% Fee
                        </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-2">
                     {!['gift_flowers', 'gift_beer', 'gift_noodle', 'gift_teddy', 'gift_console', 'gift_ice_cream', 'gift_dead_branch'].some(id => (inventory[id] || 0) > 0) && (
                         <div className="col-span-3 mb-1">
                             <button 
                                 aria-label="เปิดกระเป๋าเพื่อซื้อของขวัญ"
                                 onClick={() => { onClose(); useUIStore.getState().setShowInventory(true); }}
                                 className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-98 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
                             >
                                 <Backpack size={14} />
                                 <span>ไม่มีของขวัญในกระเป๋า — กดเปิดกระเป๋า / ซื้อของ</span>
                             </button>
                         </div>
                     )}
                     <ActionButton type="gift" />
                     <ActionButton type="give_noodle" />
                     <ActionButton type="give_beer" />
                     <ActionButton type="give_teddy" />
                     <ActionButton type="give_console" />
                     <ActionButton type="give_magic_ice_cream" /> 
                     
                     {/* --- DEAD BRANCH (RARE) --- */}
                    <button 
                        aria-label="มอบของขวัญ Summon Vibe"
                        onClick={() => handleActionClick('gift_dead_branch')} 
                        disabled={disabled} 
                        className="flex flex-col items-center justify-center p-2 rounded-xl border bg-black dark:bg-slate-900 border-yellow-500/50 hover:border-yellow-400 transition-all relative overflow-hidden group shadow-lg min-h-[80px] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                        <span className="text-2xl mb-1 animate-bounce-soft">🍂</span>
                        <span className="text-[11px] font-bold text-yellow-400">Summon Vibe</span>
                        <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>
                        {getItemCount('gift_dead_branch') > 0 ? (
                             <div className="mt-1 text-[11px] font-black text-green-500 bg-green-900/30 px-1.5 rounded border border-green-800">x{getItemCount('gift_dead_branch')}</div>
                        ) : (
                             <div className="mt-1 text-[11px] font-black text-cyan-400 bg-cyan-900/30 px-1.5 rounded border border-cyan-800">195 💎</div>
                        )}
                    </button>

                     {/* OPTION A: BOUQUET (ROMANCE) */}
                    <button 
                        aria-label="มอบช่อดอกไม้ Romance"
                        onClick={() => handleActionClick('gift_bouquet')} 
                        disabled={disabled || !canGiveBouquet} 
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative overflow-hidden min-h-[80px] focus:outline-none focus:ring-2 focus:ring-pink-400 ${canGiveBouquet ? 'bg-pink-50 border-pink-200 hover:bg-pink-100 ring-2 ring-pink-300' : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'}`}
                    >
                        <span className={`text-2xl mb-1 ${!canGiveBouquet ? 'grayscale blur-[1px]' : ''}`}>💐</span>
                        <span className="text-[11px] font-bold text-pink-600">{isRomancePath ? "Give Bouquet" : "Start Romance"}</span>
                        {!canGiveBouquet ? (
                            <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                <Lock size={16} className="text-gray-500 mb-1" />
                                <span className="text-[11px] font-black text-gray-500 bg-white/80 px-1 rounded">REQ: FRIEND 1999</span>
                            </div>
                        ) : (
                            <div className="mt-1 w-full flex justify-center">
                                {getItemCount('gift_flowers') > 0 ? (
                                    <span className="text-[11px] font-black text-green-600">x{getItemCount('gift_flowers')}</span>
                                ) : (
                                    <span className="text-[11px] font-black text-cyan-500 bg-cyan-100 px-1 rounded">325 💎</span>
                                )}
                            </div>
                        )}
                    </button>

                     {/* OPTION B: BRACELET (PLATONIC) */}
                    <button 
                        aria-label="มอบสายสิญจน์ Best Friend"
                        onClick={() => handleActionClick('gift_bracelet')} 
                        disabled={disabled || !canGiveBracelet} 
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative overflow-hidden min-h-[80px] focus:outline-none focus:ring-2 focus:ring-cyan-400 ${canGiveBracelet ? 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100 ring-2 ring-cyan-300' : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'}`}
                    >
                        <span className={`text-2xl mb-1 ${!canGiveBracelet ? 'grayscale blur-[1px]' : ''}`}>🧵</span>
                        <span className="text-[11px] font-bold text-cyan-600">Best Friend</span>
                        {!canGiveBracelet ? (
                            <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                <Lock size={16} className="text-gray-500 mb-1" />
                                <span className="text-[11px] font-black text-gray-500 bg-white/80 px-1 rounded">REQ: FRIEND 1999</span>
                            </div>
                        ) : (
                             <div className="mt-1 w-full flex justify-center">
                                {getItemCount('gift_bracelet') > 0 ? (
                                    <span className="text-[11px] font-black text-green-600">x{getItemCount('gift_bracelet')}</span>
                                ) : (
                                    <span className="text-[11px] font-black text-cyan-500 bg-cyan-100 px-1 rounded">260 💎</span>
                                )}
                            </div>
                        )}
                    </button>

                     {/* --- EVOLUTION: ROMANCE --- */}
                    <button 
                        aria-label="มอบแหวนหมั้น Be Partner"
                        onClick={() => handleActionClick('gift_ring')} 
                        disabled={disabled || !canGiveRing} 
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative overflow-hidden min-h-[80px] focus:outline-none focus:ring-2 focus:ring-purple-400 ${canGiveRing ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'}`}
                    >
                        <span className={`text-2xl mb-1 ${!canGiveRing ? 'grayscale blur-[1px]' : ''}`}>💍</span>
                        <span className="text-[11px] font-bold text-purple-600">Be Partner</span>
                        {!canGiveRing ? (
                            <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                <Lock size={16} className="text-gray-500 mb-1" />
                                <span className="text-[11px] font-black text-gray-500 bg-white/80 px-1 rounded">REQ: FLIRT 4999</span>
                            </div>
                        ) : (
                             <div className="mt-1 w-full flex justify-center">
                                {getItemCount('gift_ring') > 0 ? (
                                    <span className="text-[11px] font-black text-green-600">x{getItemCount('gift_ring')}</span>
                                ) : (
                                    <span className="text-[11px] font-black text-cyan-500 bg-cyan-100 px-1 rounded">1300 💎</span>
                                )}
                            </div>
                        )}
                    </button>

                     {/* --- EVOLUTION: PLATONIC --- */}
                    <button 
                        aria-label="มอบเสื้อแจ็คเก็ต Soul Sibling"
                        onClick={() => handleActionClick('gift_jacket')} 
                        disabled={disabled || !canGiveJacket} 
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative overflow-hidden min-h-[80px] focus:outline-none focus:ring-2 focus:ring-teal-400 ${canGiveJacket ? 'bg-teal-50 border-teal-200 hover:bg-teal-100' : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'}`}
                    >
                        <span className={`text-2xl mb-1 ${!canGiveJacket ? 'grayscale blur-[1px]' : ''}`}>🧥</span>
                        <span className="text-[11px] font-bold text-teal-600">Soul Sibling</span>
                        {!canGiveJacket ? (
                            <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                <Lock size={16} className="text-gray-500 mb-1" />
                                <span className="text-[11px] font-black text-gray-500 bg-white/80 px-1 rounded">REQ: BFF 4999</span>
                            </div>
                        ) : (
                             <div className="mt-1 w-full flex justify-center">
                                {getItemCount('gift_jacket') > 0 ? (
                                    <span className="text-[11px] font-black text-green-600">x{getItemCount('gift_jacket')}</span>
                                ) : (
                                    <span className="text-[11px] font-black text-cyan-500 bg-cyan-100 px-1 rounded">1170 💎</span>
                                )}
                            </div>
                        )}
                    </button>

                     {/* KEY (Universal Endgame) */}
                    <button 
                        aria-label="มอบกุญแจห้อง Give Key"
                        onClick={() => handleActionClick('gift_keycard')} 
                        disabled={disabled || !canGiveKey} 
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative overflow-hidden min-h-[80px] focus:outline-none focus:ring-2 focus:ring-orange-400 ${canGiveKey ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'}`}
                    >
                        <span className={`text-2xl mb-1 ${!canGiveKey ? 'grayscale blur-[1px]' : ''}`}>🔑</span>
                        <span className="text-[11px] font-bold text-orange-600">Give Key</span>
                        {!canGiveKey ? (
                            <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                <Lock size={16} className="text-gray-500 mb-1" />
                                <span className="text-[11px] font-black text-gray-500 bg-white/80 px-1 rounded">REQ: 9999</span>
                            </div>
                        ) : (
                             <div className="mt-1 w-full flex justify-center">
                                {getItemCount('spare_key') > 0 ? (
                                    <span className="text-[11px] font-black text-green-600">x{getItemCount('spare_key')}</span>
                                ) : (
                                    <span className="text-[11px] font-black text-yellow-600 bg-yellow-100 px-1 rounded">45500 G</span>
                                )}
                            </div>
                        )}
                    </button>

                     {/* GOD TIER PENDANT */}
                    <button 
                        aria-label="มอบสร้อยคอ Eternal Bond"
                        onClick={() => handleActionClick('gift_eternity_pendant')} 
                        disabled={disabled || !canGivePendant} 
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative overflow-hidden min-h-[80px] focus:outline-none focus:ring-2 focus:ring-indigo-400 ${canGivePendant ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 ring-2 ring-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'}`}
                    >
                        <span className={`text-2xl mb-1 ${!canGivePendant ? 'grayscale blur-[1px]' : 'animate-pulse'}`}>🌌</span>
                        <span className="text-[11px] font-bold text-indigo-600">Eternal Bond</span>
                        {!canGivePendant ? (
                            <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                <Lock size={16} className="text-gray-500 mb-1" />
                                <span className="text-[11px] font-black text-gray-500 bg-white/80 px-1 rounded">REQ: 49,999</span>
                            </div>
                        ) : (
                             <div className="mt-1 w-full flex justify-center">
                                {getItemCount('gift_eternity_pendant') > 0 ? (
                                    <span className="text-[11px] font-black text-green-600">x{getItemCount('gift_eternity_pendant')}</span>
                                ) : (
                                    <span className="text-[11px] font-black text-yellow-600 bg-yellow-100 px-1 rounded">195000 G</span>
                                )}
                            </div>
                        )}
                    </button>
                 </div>
             </div>

             {/* Section 4: Party System */}
             <div>
                 <h4 className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1"><Users size={12} fill="currentColor"/> Social Link</h4>
                 <div className="grid grid-cols-2 gap-2">
                     {isFriend ? (
                         <button aria-label="ชวนเข้าปาร์ตี้" onClick={() => handleActionClick('invite_party')} disabled={disabled} className="flex items-center justify-center gap-2 p-3 rounded-xl border bg-indigo-50 border-indigo-200 hover:bg-indigo-100 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">
                             <Users size={16} className="text-indigo-600" />
                             <span className="text-[11px] font-bold text-indigo-600">Invite to Party</span>
                         </button>
                     ) : (
                         <div className="flex items-center justify-center gap-2 p-3 rounded-xl border bg-gray-50 border-gray-200 opacity-60">
                             <Lock size={14} className="text-gray-400" />
                             <span className="text-[11px] font-bold text-gray-400">Unlock at Friend Tier</span>
                         </div>
                     )}
                     
                     <button aria-label="เลิกปาร์ตี้" onClick={() => handleActionClick('leave_party')} disabled={disabled} className="flex items-center justify-center gap-2 p-3 rounded-xl border bg-gray-50 border-gray-200 hover:bg-red-50 hover:border-red-200 transition-all focus:outline-none focus:ring-2 focus:ring-red-400">
                         <XCircle size={16} className="text-gray-500 hover:text-red-500" />
                         <span className="text-[11px] font-bold text-gray-500 hover:text-red-500">Dismiss</span>
                     </button>
                 </div>
             </div>
        </div>
    );
};

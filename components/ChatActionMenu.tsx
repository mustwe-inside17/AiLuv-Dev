
import React from 'react';
import { ActionType, CharacterId, RelationshipTier } from '../types';
import { ACTION_CONFIG, CHARACTER_DATA, CHARACTER_SIGNATURES, TIER_LEVELS, SHOP_ITEMS, ACTION_ITEM_MAP } from '../constants';
import { ArrowLeft, Backpack, Gift, Heart, Lock, ShoppingBag, Sparkles, Users, Wine, X } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { PartyQuickActionState } from '../domain/chat/quickActions';
import { GiftIntent, canAffordGiftPurchase, getExpressGiftCost } from '../domain/chat/giftFlow';
import { ItemArtwork } from './ui/ItemArtwork';

export type ActionMenuView = 'hub' | 'special' | 'gifts';

interface ChatActionMenuProps {
    characterId: CharacterId;
    currentTier: RelationshipTier;
    energy: number;
    gold: number;
    diamonds: number;
    disabled: boolean;
    inventory: Record<string, number>;
    onAction: (type: ActionType) => void;
    onClose: () => void;
    loveScore: number;
    onGiftSelected: (intent: GiftIntent) => void;
    chemistryScore?: number; 
    canInviteDate: boolean;
    isDateMode: boolean;
    isFriend: boolean;
    partyState: PartyQuickActionState;
    partyMemberName?: string;
    onRequestDate: () => void;
    onPartyAction: () => void;
    view: ActionMenuView;
    onViewChange: (view: ActionMenuView) => void;
}

export const ChatActionMenu: React.FC<ChatActionMenuProps> = ({ 
    characterId, 
    currentTier, 
    energy, 
    gold,
    diamonds,
    disabled, 
    inventory, 
    onAction, 
    onClose,
    loveScore,
    onGiftSelected,
    chemistryScore = 0,
    canInviteDate,
    isDateMode,
    isFriend,
    partyState,
    partyMemberName,
    onRequestDate,
    onPartyAction,
    view,
    onViewChange
}) => {
    
    // Helper to get Item count
    const getItemCount = (itemId: string) => inventory[itemId] || 0;

    const getGiftPurchaseState = (type: ActionType) => {
        const itemId = ACTION_ITEM_MAP[type];
        if (!itemId) return null;
        const shopItem = SHOP_ITEMS.find(item => item.id === itemId);
        if (!shopItem) return null;
        const count = getItemCount(itemId);
        const currency = shopItem.currency || 'gold';
        const cost = getExpressGiftCost(shopItem.cost);
        return {
            itemId,
            shopItem,
            count,
            currency,
            cost,
            canAfford: count > 0 || canAffordGiftPurchase(currency, cost, gold, diamonds)
        };
    };

    const canSelectGift = (type: ActionType) => getGiftPurchaseState(type)?.canAfford ?? true;

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
        const purchaseState = getGiftPurchaseState(type);
        if (purchaseState) {
            if (!purchaseState.canAfford) return;
            const { itemId, shopItem, count, cost, currency } = purchaseState;
                onGiftSelected({
                    actionType: type,
                    itemId,
                    itemName: shopItem.name,
                    emoji: shopItem.emoji,
                    source: count > 0 ? 'inventory' : 'express',
                    cost: count > 0 ? 0 : cost,
                    currency
                });
                return;
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
                const totalCost = getExpressGiftCost(baseCost);
                const currency = shopItem.currency || 'gold';
                
                itemStatus = {
                    count,
                    cost: totalCost,
                    currency,
                    isExpress: count === 0,
                    canAfford: count > 0 || canAffordGiftPurchase(currency, totalCost, gold, diamonds)
                };
            }
        }

        const selectable = itemStatus?.canAfford ?? true;

        return (
            <button 
                onClick={() => handleActionClick(type)}
                disabled={!unlocked || !affordable || !selectable || disabled}
                aria-label={unlocked ? config.label : `${config.label || 'Action'} Locked`}
                className={`
                    flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative overflow-hidden group min-h-[80px] focus:outline-none focus:ring-2 focus:ring-pink-400
                    ${unlocked 
                        ? 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-500 hover:shadow-md' 
                        : 'bg-gray-100 dark:bg-slate-900 border-transparent opacity-70'}
                    ${!selectable ? 'cursor-not-allowed opacity-50 hover:border-gray-100 hover:shadow-none' : ''}
                `}
            >
                <div className={`mb-1 grid h-12 w-12 place-items-center transition-transform group-hover:scale-105 ${!unlocked ? 'blur-sm grayscale' : ''}`}>
                    {unlocked ? (itemId ? <ItemArtwork itemId={itemId} name={config.label} className="h-12 w-12" /> : <span className="text-2xl">{config.emoji}</span>) : <Lock size={20} className="text-gray-400 mx-auto" />}
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
                                ) : itemStatus.canAfford ? (
                                    <span className={`text-[11px] font-black px-1.5 rounded flex items-center gap-0.5 border ${itemStatus.currency === 'diamond' ? 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 border-cyan-100' : 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-100'}`}>
                                       {itemStatus.cost} {itemStatus.currency === 'diamond' ? '💎' : 'G'}
                                    </span>
                                ) : (
                                    <span className="rounded border border-red-200 bg-red-50 px-1.5 text-[10px] font-black text-red-500 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">ยอดไม่พอ</span>
                                )}
                            </div>
                        )}
                    </>
                )}
            </button>
        );
    };

    const partyDisabled = disabled || partyState === 'occupied' || (!isFriend && partyState !== 'current');
    const dateDisabled = disabled || isDateMode || !canInviteDate;
    const partyLabel = partyState === 'current' ? 'ออกจากปาร์ตี้' : 'ชวนเข้าปาร์ตี้';
    const partyHint = partyState === 'current'
        ? 'แยกย้ายจากทีมปัจจุบัน'
        : partyState === 'occupied'
            ? `มี ${partyMemberName || 'เพื่อนคนอื่น'} อยู่ในปาร์ตี้แล้ว`
            : isFriend ? 'ร่วมเดินทางและทำกิจกรรม' : 'ปลดล็อกเมื่อเป็นเพื่อน';
    const dateHint = isDateMode
        ? 'กำลังออกเดตอยู่'
        : canInviteDate ? 'เลือกสถานที่ออกเดต' : `ต้องเป็นเพื่อน · Chemistry 60+ (${chemistryScore}%)`;

    const CategoryButton = ({
        label,
        hint,
        icon,
        tone,
        onClick,
        isDisabled = false
    }: {
        label: string;
        hint: string;
        icon: React.ReactNode;
        tone: 'rose' | 'amber' | 'pink' | 'sky';
        onClick: () => void;
        isDisabled?: boolean;
    }) => {
        const tones = {
            rose: 'bg-rose-50 dark:bg-[#202238] border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300',
            amber: 'bg-amber-50 dark:bg-[#29251f] border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-300',
            pink: 'bg-pink-50 dark:bg-[#2a2033] border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-300',
            sky: 'bg-sky-50 dark:bg-[#192938] border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-300'
        };

        return (
            <button
                type="button"
                onClick={onClick}
                disabled={isDisabled}
                className={`min-h-[72px] rounded-2xl border px-3 py-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-pink-400 ${tones[tone]} ${isDisabled ? 'cursor-not-allowed opacity-45 grayscale-[25%]' : 'hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]'}`}
            >
                <span className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/80 dark:bg-slate-900/65 shadow-sm">{icon}</span>
                    <span className="min-w-0">
                        <span className="block text-sm font-extrabold leading-tight text-slate-800 dark:text-white">{label}</span>
                        <span className="mt-1 block text-[10px] font-medium leading-snug text-slate-500 dark:text-slate-400">{hint}</span>
                    </span>
                </span>
            </button>
        );
    };

    const GiftAvailability = ({ type }: { type: ActionType }) => {
        const state = getGiftPurchaseState(type);
        if (!state) return null;
        if (state.count > 0) return <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">x{state.count}</span>;
        if (!state.canAfford) return <span className="rounded border border-red-200 bg-red-50 px-1.5 text-[10px] font-black text-red-500 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">ยอดไม่พอ</span>;
        return <span className={`rounded px-1 text-[11px] font-black ${state.currency === 'diamond' ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'}`}>{state.cost} {state.currency === 'diamond' ? '💎' : 'G'}</span>;
    };

    return (
        <>
        <button type="button" aria-label="ปิดเมนูแอคชั่น" onClick={onClose} className="fixed inset-0 z-[90] cursor-default bg-slate-950/40 backdrop-blur-[1px]" />
        <div className="isolate absolute bottom-full left-0 right-0 z-[100] mx-3 mb-2 max-h-[min(58dvh,430px)] overflow-y-auto rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_22px_70px_rgba(15,23,42,0.38)] custom-scrollbar animate-in slide-in-from-bottom-2 fade-in duration-200 dark:border-slate-700 dark:bg-[#111a2e]">
             <div className="sticky -top-3 z-20 -mx-3 -mt-3 mb-3 flex items-center justify-between border-b border-slate-100 bg-white px-3 py-3 dark:border-slate-700 dark:bg-[#111a2e]">
                 <div className="flex min-w-0 items-center gap-2">
                     {view !== 'hub' && (
                         <button type="button" onClick={() => onViewChange('hub')} aria-label="กลับไปเมนูแอคชั่น" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-slate-300 dark:hover:bg-white/10">
                             <ArrowLeft size={18} />
                         </button>
                     )}
                     <div className="min-w-0">
                         <h3 className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
                             {view === 'hub' ? `ทำกิจกรรมกับ ${CHARACTER_DATA[characterId]?.name || 'ตัวละคร'}` : view === 'special' ? 'แอคชั่นพิเศษ' : 'ให้ของขวัญ'}
                         </h3>
                         {view === 'hub' && <p className="mt-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">เลือกสิ่งที่อยากทำต่อ</p>}
                     </div>
                 </div>
                 <button type="button" onClick={onClose} aria-label="ปิดเมนูแอคชั่น" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:hover:bg-white/10 dark:hover:text-white">
                     <X size={18} />
                 </button>
             </div>

             {view === 'hub' && (
                 <div className="grid grid-cols-2 gap-2.5">
                     <CategoryButton label="แอคชั่นพิเศษ" hint="ท่าประจำตัวและความใกล้ชิด" icon={<Sparkles size={19} />} tone="rose" onClick={() => onViewChange('special')} isDisabled={disabled} />
                     <CategoryButton label="ให้ของขวัญ" hint="เลือกของจากกระเป๋าหรือซื้อด่วน" icon={<Gift size={19} />} tone="amber" onClick={() => onViewChange('gifts')} isDisabled={disabled} />
                     <CategoryButton label="ชวนเดต" hint={dateHint} icon={<Wine size={19} />} tone="pink" onClick={onRequestDate} isDisabled={dateDisabled} />
                     <CategoryButton label={partyLabel} hint={partyHint} icon={<Users size={19} />} tone="sky" onClick={() => { onPartyAction(); onClose(); }} isDisabled={partyDisabled} />
                 </div>
             )}

             {/* Section 1: Signatures */}
             {view === 'special' && <div className="mb-4">
                 <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Signature Interactions</h4>
                 <div className="grid grid-cols-3 gap-2">
                     <ActionButton type="poke" /> 
                     {sigs && <ActionButton type={sigs.actionA} />}
                     {sigs && <ActionButton type={sigs.actionB} />}
                 </div>
             </div>}

             {/* Section 2: Interactions (Romance) - Only if NOT in Platonic Path */}
             {view === 'special' && currentTier !== RelationshipTier.BEST_FRIEND && currentTier !== RelationshipTier.SOUL_SIBLING && (
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
             {view === 'gifts' && <div className="mb-1">
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
                        disabled={disabled || !canSelectGift('gift_dead_branch')} 
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border bg-black dark:bg-slate-900 border-yellow-500/50 hover:border-yellow-400 transition-all relative overflow-hidden group shadow-lg min-h-[80px] focus:outline-none focus:ring-2 focus:ring-yellow-400 ${!canSelectGift('gift_dead_branch') ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        <ItemArtwork itemId="gift_dead_branch" name="Dead Branch" className="mb-1 h-12 w-12" />
                        <span className="text-[11px] font-bold text-yellow-400">Summon Vibe</span>
                        <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>
                        <div className="relative z-10 mt-1"><GiftAvailability type="gift_dead_branch" /></div>
                    </button>

                     {/* OPTION A: BOUQUET (ROMANCE) */}
                    <button 
                        aria-label="มอบช่อดอกไม้ Romance"
                        onClick={() => handleActionClick('gift_bouquet')} 
                        disabled={disabled || !canGiveBouquet || !canSelectGift('gift_bouquet')} 
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative overflow-hidden min-h-[80px] focus:outline-none focus:ring-2 focus:ring-pink-400 ${canGiveBouquet ? 'bg-pink-50 border-pink-200 hover:bg-pink-100 ring-2 ring-pink-300' : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'} ${!canSelectGift('gift_bouquet') ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        <ItemArtwork itemId="gift_flowers" name="Bouquet" className={`mb-1 h-12 w-12 ${!canGiveBouquet ? 'grayscale blur-[1px]' : ''}`} />
                        <span className="text-[11px] font-bold text-pink-600">{isRomancePath ? "Give Bouquet" : "Start Romance"}</span>
                        {!canGiveBouquet ? (
                            <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                <Lock size={16} className="text-gray-500 mb-1" />
                                <span className="text-[11px] font-black text-gray-500 bg-white/80 px-1 rounded">REQ: FRIEND 1999</span>
                            </div>
                        ) : (
                            <div className="mt-1 w-full flex justify-center"><GiftAvailability type="gift_bouquet" /></div>
                        )}
                    </button>

                     {/* OPTION B: BRACELET (PLATONIC) */}
                    <button 
                        aria-label="มอบสายสิญจน์ Best Friend"
                        onClick={() => handleActionClick('gift_bracelet')} 
                        disabled={disabled || !canGiveBracelet || !canSelectGift('gift_bracelet')} 
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative overflow-hidden min-h-[80px] focus:outline-none focus:ring-2 focus:ring-cyan-400 ${canGiveBracelet ? 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100 ring-2 ring-cyan-300' : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'} ${!canSelectGift('gift_bracelet') ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        <ItemArtwork itemId="gift_bracelet" name="Friendship Bracelet" className={`mb-1 h-12 w-12 ${!canGiveBracelet ? 'grayscale blur-[1px]' : ''}`} />
                        <span className="text-[11px] font-bold text-cyan-600">Best Friend</span>
                        {!canGiveBracelet ? (
                            <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                <Lock size={16} className="text-gray-500 mb-1" />
                                <span className="text-[11px] font-black text-gray-500 bg-white/80 px-1 rounded">REQ: FRIEND 1999</span>
                            </div>
                        ) : (
                             <div className="mt-1 w-full flex justify-center"><GiftAvailability type="gift_bracelet" /></div>
                        )}
                    </button>

                     {/* --- EVOLUTION: ROMANCE --- */}
                    <button 
                        aria-label="มอบแหวนหมั้น Be Partner"
                        onClick={() => handleActionClick('gift_ring')} 
                        disabled={disabled || !canGiveRing || !canSelectGift('gift_ring')} 
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative overflow-hidden min-h-[80px] focus:outline-none focus:ring-2 focus:ring-purple-400 ${canGiveRing ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'} ${!canSelectGift('gift_ring') ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        <ItemArtwork itemId="gift_ring" name="Promise Ring" className={`mb-1 h-12 w-12 ${!canGiveRing ? 'grayscale blur-[1px]' : ''}`} />
                        <span className="text-[11px] font-bold text-purple-600">Be Partner</span>
                        {!canGiveRing ? (
                            <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                <Lock size={16} className="text-gray-500 mb-1" />
                                <span className="text-[11px] font-black text-gray-500 bg-white/80 px-1 rounded">REQ: FLIRT 4999</span>
                            </div>
                        ) : (
                             <div className="mt-1 w-full flex justify-center"><GiftAvailability type="gift_ring" /></div>
                        )}
                    </button>

                     {/* --- EVOLUTION: PLATONIC --- */}
                    <button 
                        aria-label="มอบเสื้อแจ็คเก็ต Soul Sibling"
                        onClick={() => handleActionClick('gift_jacket')} 
                        disabled={disabled || !canGiveJacket || !canSelectGift('gift_jacket')} 
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative overflow-hidden min-h-[80px] focus:outline-none focus:ring-2 focus:ring-teal-400 ${canGiveJacket ? 'bg-teal-50 border-teal-200 hover:bg-teal-100' : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'} ${!canSelectGift('gift_jacket') ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        <ItemArtwork itemId="gift_jacket" name="Matching Jacket" className={`mb-1 h-12 w-12 ${!canGiveJacket ? 'grayscale blur-[1px]' : ''}`} />
                        <span className="text-[11px] font-bold text-teal-600">Soul Sibling</span>
                        {!canGiveJacket ? (
                            <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                <Lock size={16} className="text-gray-500 mb-1" />
                                <span className="text-[11px] font-black text-gray-500 bg-white/80 px-1 rounded">REQ: BFF 4999</span>
                            </div>
                        ) : (
                             <div className="mt-1 w-full flex justify-center"><GiftAvailability type="gift_jacket" /></div>
                        )}
                    </button>

                     {/* KEY (Universal Endgame) */}
                    <button 
                        aria-label="มอบกุญแจห้อง Give Key"
                        onClick={() => handleActionClick('gift_keycard')} 
                        disabled={disabled || !canGiveKey || !canSelectGift('gift_keycard')} 
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative overflow-hidden min-h-[80px] focus:outline-none focus:ring-2 focus:ring-orange-400 ${canGiveKey ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'} ${!canSelectGift('gift_keycard') ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        <ItemArtwork itemId="spare_key" name="Spare Key" className={`mb-1 h-12 w-12 ${!canGiveKey ? 'grayscale blur-[1px]' : ''}`} />
                        <span className="text-[11px] font-bold text-orange-600">Give Key</span>
                        {!canGiveKey ? (
                            <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                <Lock size={16} className="text-gray-500 mb-1" />
                                <span className="text-[11px] font-black text-gray-500 bg-white/80 px-1 rounded">REQ: 9999</span>
                            </div>
                        ) : (
                             <div className="mt-1 w-full flex justify-center"><GiftAvailability type="gift_keycard" /></div>
                        )}
                    </button>

                     {/* GOD TIER PENDANT */}
                    <button 
                        aria-label="มอบสร้อยคอ Eternal Bond"
                        onClick={() => handleActionClick('gift_eternity_pendant')} 
                        disabled={disabled || !canGivePendant || !canSelectGift('gift_eternity_pendant')} 
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative overflow-hidden min-h-[80px] focus:outline-none focus:ring-2 focus:ring-indigo-400 ${canGivePendant ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 ring-2 ring-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'} ${!canSelectGift('gift_eternity_pendant') ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        <ItemArtwork itemId="gift_eternity_pendant" name="Eternity Pendant" className={`mb-1 h-12 w-12 ${!canGivePendant ? 'grayscale blur-[1px]' : 'animate-pulse'}`} />
                        <span className="text-[11px] font-bold text-indigo-600">Eternal Bond</span>
                        {!canGivePendant ? (
                            <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                <Lock size={16} className="text-gray-500 mb-1" />
                                <span className="text-[11px] font-black text-gray-500 bg-white/80 px-1 rounded">REQ: 49,999</span>
                            </div>
                        ) : (
                             <div className="mt-1 w-full flex justify-center"><GiftAvailability type="gift_eternity_pendant" /></div>
                        )}
                    </button>
                 </div>
             </div>}

        </div>
        </>
    );
};

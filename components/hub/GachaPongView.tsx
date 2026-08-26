
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GameState, PlayerAttributes } from '../../types';
import { GACHA_POOL, GACHA_RATE, GachaItem, GachaTier } from '../../constants/gacha';
import { SHOP_ITEMS, SKILL_TREE } from '../../constants';
import { FASHION_ITEMS } from '../../constants/fashion';
import { LOCATION_IMAGES } from '../../constants/assets';
import { getCharacterImageUrl } from '../../services/firebase';
import { getBuffConfig, calculateEffectiveMaxEnergy } from '../../services/buffMechanics';
import { Gem, X, HelpCircle, RefreshCw, Sparkles, Check, ChevronRight, Info, Zap, Crown, ArrowUp } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { playSfx } from '../../utils/audioUtils';
import { EmojiIcon } from '../ui/EmojiIcon';

interface GachaPongViewProps {
    gameState: GameState;
    onBack: () => void;
}

export const GachaPongView: React.FC<GachaPongViewProps> = ({ gameState, onBack }) => {
    const { 
        diamonds, spendDiamonds, addGold, addDiamonds, addItem, addStyle, 
        ownedStyles, addBuff, setGameState 
    } = useGameStore();

    // Store UI Assets URLs
    const [assets, setAssets] = useState({ header: '', bg: '', machine: '' });
    
    const [isRolling, setIsRolling] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState<GachaItem[]>([]);
    const [showHint, setShowHint] = useState(false);
    
    // Animation Refs
    const [displayedItem, setDisplayedItem] = useState<GachaItem | null>(null); // For single spin center
    // Showcase State (Attract Mode)
    const [showcaseItem, setShowcaseItem] = useState<GachaItem>(GACHA_POOL[0]);
    const rollIntervalRef = useRef<number | null>(null);

    // Affordability Checks
    const COST_1 = 100;
    const COST_10 = 900;
    const canAfford1 = (diamonds || 0) >= COST_1;
    const canAfford10 = (diamonds || 0) >= COST_10;

    useEffect(() => {
        const load = async () => {
            const [header, bg, machine] = await Promise.all([
                getCharacterImageUrl(LOCATION_IMAGES.gacha_header),
                getCharacterImageUrl(LOCATION_IMAGES.gacha_bg),
                getCharacterImageUrl(LOCATION_IMAGES.gacha_machine)
            ]);
            setAssets({ 
                header: header || '', 
                bg: bg || '', 
                machine: machine || '' 
            });
        };
        load();
    }, []);

    // Showcase Loop (Attract Mode)
    useEffect(() => {
        if (isRolling) return;
        
        const interval = setInterval(() => {
            setShowcaseItem(prev => {
                const currentIndex = GACHA_POOL.indexOf(prev);
                const nextIndex = (currentIndex + 1) % GACHA_POOL.length;
                return GACHA_POOL[nextIndex];
            });
        }, 1200); // Cycle every 1.2s

        return () => clearInterval(interval);
    }, [isRolling]);

    // Helper to get Real Icons
    const resolveItemVisuals = (gachaItem: GachaItem) => {
        if (gachaItem.type === 'gold') return { emoji: '💰', color: 'text-yellow-500', name: `${gachaItem.amount} Gold` };
        if (gachaItem.type === 'diamond') return { emoji: '💎', color: 'text-cyan-400', name: `${gachaItem.amount} Diamonds` };
        
        // Lookup Shop Items
        const shopItem = SHOP_ITEMS.find(i => i.id === gachaItem.id);
        if (shopItem) return { emoji: shopItem.emoji, color: 'text-gray-800 dark:text-white', name: shopItem.name };
        
        // Lookup Fashion Items
        const styleItem = FASHION_ITEMS.find(i => i.id === gachaItem.id);
        if (styleItem) return { emoji: styleItem.icon || '👕', color: 'text-fuchsia-400', name: styleItem.name };
        
        return { emoji: '🎁', color: 'text-pink-400', name: 'Mystery Item' };
    };

    // Helper to get Detailed Info (Description, Type, Stats)
    const getItemInfo = (item: GachaItem) => {
        let typeStr = "RESOURCE";
        let descStr = "";
        let perks: { label: string, type: 'buff' | 'skill' | 'stat' | 'info' }[] = [];

        if (item.type === 'gold') {
            typeStr = "CURRENCY";
            descStr = "Essential currency for life in AiLuv City.";
        } else if (item.type === 'diamond') {
            typeStr = "PREMIUM";
            descStr = "Rare gems for special items.";
        } else if (item.type === 'item') {
            const shopItem = SHOP_ITEMS.find(i => i.id === item.id);
            if (shopItem) {
                typeStr = shopItem.category?.toUpperCase() || "ITEM";
                descStr = shopItem.description || "";
                if (shopItem.energyRestore > 0) perks.push({ label: `+${shopItem.energyRestore} Energy`, type: 'stat' });
                
                if (shopItem.buffType) {
                    const config = getBuffConfig(shopItem.buffType);
                    perks.push({ label: `${config.label} (${shopItem.buffDurationMinutes}m)`, type: 'buff' });
                }
                
                if (shopItem.unlocksSkill) {
                    const skill = SKILL_TREE.find(s => s.id === shopItem.unlocksSkill);
                    perks.push({ label: `UNLOCK: ${skill ? skill.name : 'SKILL'}`, type: 'skill' });
                }
                
                if (shopItem.unlocksTier) perks.push({ label: "Key Item", type: 'info' });
            }
        } else if (item.type === 'style') {
            const styleItem = FASHION_ITEMS.find(i => i.id === item.id);
            if (styleItem) {
                typeStr = "OUTFIT";
                descStr = styleItem.description || "";
                if (styleItem.stats) {
                    Object.entries(styleItem.stats).forEach(([k, v]) => perks.push({ label: `${k.toUpperCase()} +${v}`, type: 'stat' }));
                }
            }
        }
        return { typeStr, descStr, perks };
    };

    // --- GACHA LOGIC ---
    const rollGacha = (count: number) => {
        const cost = count === 10 ? 900 : 100 * count;
        if ((diamonds || 0) < cost) {
            // Should be blocked by disabled button, but double check
            return;
        }

        spendDiamonds(cost);
        playSfx('gacha_roll'); // [MARCUS FIX] Play sound
        setIsRolling(true);
        setResults([]);
        setShowResults(false);

        // Determine Results
        const newResults: GachaItem[] = [];
        for (let i = 0; i < count; i++) {
            const rand = Math.random();
            let tier: GachaTier = 'NORMAL';
            
            if (rand < GACHA_RATE.LEGENDARY) tier = 'LEGENDARY';
            else if (rand < GACHA_RATE.LEGENDARY + GACHA_RATE.EPIC) tier = 'EPIC';
            else if (rand < GACHA_RATE.LEGENDARY + GACHA_RATE.EPIC + GACHA_RATE.RARE) tier = 'RARE';
            else if (rand < GACHA_RATE.LEGENDARY + GACHA_RATE.EPIC + GACHA_RATE.RARE + GACHA_RATE.MAGIC) tier = 'MAGIC';
            
            const pool = GACHA_POOL.filter(item => item.tier === tier);
            const selected = pool[Math.floor(Math.random() * pool.length)];
            newResults.push(selected);
        }

        // --- ANIMATION SEQUENCE ---
        let ticks = 0;
        const totalTicks = 20; 
        
        rollIntervalRef.current = window.setInterval(() => {
            ticks++;
            // Shuffle random single item for the central display
            const randomItem = GACHA_POOL[Math.floor(Math.random() * GACHA_POOL.length)];
            setDisplayedItem(randomItem);

            if (ticks >= totalTicks) {
                if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
                finishRoll(newResults);
            }
        }, 100);
    };

    const finishRoll = (finalResults: GachaItem[]) => {
        setIsRolling(false);
        playSfx('gacha_reveal'); // [MARCUS FIX] Play sound
        setResults(finalResults);
        setShowResults(true);

        // --- DISTRIBUTE REWARDS (CRITICAL LOGIC FIX) ---
        // We use useGameStore.getState() to ensure we manipulate fresh state inside this loop
        const currentState = useGameStore.getState();

        finalResults.forEach(gachaItem => {
            // 1. GOLD
            if (gachaItem.type === 'gold' && gachaItem.amount) {
                addGold(gachaItem.amount);
            } 
            // 2. DIAMOND
            else if (gachaItem.type === 'diamond' && gachaItem.amount) {
                addDiamonds(gachaItem.amount);
            } 
            // 3. SHOP ITEMS (Food, Gadgets, Gifts)
            else if (gachaItem.type === 'item') {
                const shopItem = SHOP_ITEMS.find(i => i.id === gachaItem.id);
                
                if (shopItem) {
                    // CASE A: FOOD (Consume Immediately)
                    if (shopItem.category === 'food' || shopItem.id === 'omakase') {
                        // Apply Buff
                        if (shopItem.buffType && shopItem.buffDurationMinutes) {
                            addBuff({
                                id: Date.now().toString() + Math.random(),
                                type: shopItem.buffType,
                                value: shopItem.buffValue || 1,
                                expiresAt: Date.now() + shopItem.buffDurationMinutes * 60 * 1000,
                                sourceName: shopItem.name
                            });
                        }

                        // Apply Energy (Calculate fresh cap)
                        if (shopItem.energyRestore > 0) {
                            const freshState = useGameStore.getState(); // Fresh state again
                            const effectiveMax = calculateEffectiveMaxEnergy(freshState.maxEnergy, freshState.activeBuffs, freshState.equippedStyle);
                            const newEnergy = shopItem.id === 'food_full_meal' 
                                ? freshState.energy + shopItem.energyRestore 
                                : Math.min(effectiveMax, freshState.energy + shopItem.energyRestore);
                            
                            setGameState({ energy: Math.floor(newEnergy) });
                        }

                        // Apply Omakase Stat Boost
                        if (shopItem.id === 'omakase') {
                            const statsKeys: (keyof PlayerAttributes)[] = ['vit', 'int', 'cha', 'luck'];
                            const randomStat = statsKeys[Math.floor(Math.random() * statsKeys.length)];
                            const freshState = useGameStore.getState();
                            const newStats = { ...freshState.stats };
                            newStats[randomStat]++;
                            
                            let maxEnergyUpdate = freshState.maxEnergy;
                            if (randomStat === 'vit') maxEnergyUpdate += 5;

                            setGameState({ stats: newStats, maxEnergy: maxEnergyUpdate });
                        }
                        // NOTE: We do NOT addItem to inventory for food, it's consumed!
                    } 
                    // CASE B: NON-FOOD (Gadgets, Gifts, Keys)
                    else {
                        // Add to Inventory
                        addItem(gachaItem.id);

                        // **FIX**: Apply Skill Unlock for Gadgets
                        if (shopItem.unlocksSkill) {
                            const freshState = useGameStore.getState();
                            if (!freshState.unlockedSkills.includes(shopItem.unlocksSkill)) {
                                setGameState({ unlockedSkills: [...freshState.unlockedSkills, shopItem.unlocksSkill] });
                            }
                        }
                    }
                }
            } 
            // 4. FASHION ITEMS
            else if (gachaItem.type === 'style') {
                if (ownedStyles.includes(gachaItem.id)) {
                    addGold(500); // Duplicate compensation
                } else {
                    addStyle(gachaItem.id);
                }
            }
        });
    };

    // --- RENDER HELPERS (RESULTS) ---
    const getTierStyle = (tier: GachaTier) => {
        switch (tier) {
            case 'LEGENDARY': return 'bg-gradient-to-br from-amber-900/80 to-black border border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.4)]';
            case 'EPIC': return 'bg-gradient-to-br from-purple-900/80 to-black border border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.4)]';
            case 'RARE': return 'bg-gradient-to-br from-blue-900/60 to-black border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]';
            case 'MAGIC': return 'bg-gradient-to-br from-emerald-900/60 to-black border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
            default: return 'bg-slate-900/80 border border-slate-700 shadow-lg';
        }
    };

    // --- RENDER HELPERS (HINT PANEL) ---
    const getHintTierStyle = (tier: GachaTier) => {
        switch (tier) {
            case 'LEGENDARY': return 'bg-amber-950/30 border-amber-500/50 text-amber-400';
            case 'EPIC': return 'bg-purple-950/30 border-purple-500/50 text-purple-400';
            case 'RARE': return 'bg-blue-950/30 border-blue-500/50 text-blue-400';
            case 'MAGIC': return 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400';
            default: return 'bg-slate-800/50 border-slate-600 text-slate-300';
        }
    };

    const getTierText = (tier: GachaTier) => {
        switch (tier) {
            case 'LEGENDARY': return 'text-amber-400';
            case 'EPIC': return 'text-purple-400';
            case 'RARE': return 'text-blue-400';
            case 'MAGIC': return 'text-emerald-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="h-full flex flex-col relative bg-[#0a0a0c] overflow-hidden font-sans">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                {assets.bg ? (
                    <>
                        <img src={assets.bg} className="w-full h-full object-cover opacity-40 mix-blend-luminosity" alt="Background" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.15),transparent_50%)]"></div>
                    </>
                ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,31,118,0.4)_0%,rgba(10,10,12,1)_100%)]"></div>
                )}
            </div>

            {/* Sleek Header (AAA Style) */}
            <div className="absolute top-0 left-0 right-0 p-5 z-20 flex justify-between items-start pointer-events-none">
                <div className="flex flex-col gap-0.5 pointer-events-auto max-w-[80%]">
                    <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 tracking-widest uppercase italic drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] whitespace-nowrap">
                        AiLuv <span className="text-white">Lucky Gacha</span>
                    </h1>
                    <p className="text-[10px] md:text-xs text-amber-200/80 font-medium tracking-wide leading-tight">
                        โอกาสที่จะได้รับไอเทมพิเศษมากมาย อย่าลืมภาวนาก่อนเล่นนะคะ !
                    </p>
                </div>
                
                <div className="flex flex-col items-end gap-3 pointer-events-auto">
                    <button onClick={() => setShowHint(true)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all">
                        <Info size={18} />
                    </button>
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 relative z-10 flex flex-col items-center justify-center mt-10">
                {/* Holographic Pedestal / Machine */}
                <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
                    {/* Glowing Aura */}
                    <div className={`absolute inset-10 rounded-full bg-fuchsia-600/20 blur-[60px] transition-opacity duration-500 ${isRolling ? 'opacity-100 animate-pulse' : 'opacity-50'}`}></div>
                    
                    {assets.machine ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img src={assets.machine} className={`w-[80%] h-[80%] object-contain drop-shadow-[0_0_30px_rgba(192,38,211,0.3)] z-10 ${isRolling ? 'animate-bounce-soft' : 'animate-float'}`} alt="Terminal" />
                            {/* Overlay Hologram */}
                            <div className="absolute inset-0 flex items-center justify-center z-20 -mt-10">
                                {isRolling && displayedItem ? (
                                    <div className="flex flex-col items-center animate-bounce-soft">
                                        <div className="text-7xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] transform scale-125 transition-all flex items-center justify-center w-24 h-24">
                                            <EmojiIcon emoji={resolveItemVisuals(displayedItem).emoji} />
                                        </div>
                                        <div className="mt-2 text-white font-bold text-sm tracking-wide drop-shadow-md bg-black/50 px-3 py-1 rounded-full border border-white/10">
                                            {resolveItemVisuals(displayedItem).name}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={showcaseItem.id + Math.random()} className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
                                        <div className="text-6xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transform transition-all hover:scale-110 flex items-center justify-center w-20 h-20">
                                            <EmojiIcon emoji={resolveItemVisuals(showcaseItem).emoji} />
                                        </div>
                                        <div className="mt-2 text-white/90 font-bold text-xs tracking-wide drop-shadow-md bg-black/50 px-3 py-1 rounded-full border border-white/10">
                                            {resolveItemVisuals(showcaseItem).name}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Fallback Holographic Ring
                        <div className="relative w-64 h-64 flex items-center justify-center">
                            {/* Outer Ring */}
                            <div className={`absolute inset-0 rounded-full border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm shadow-[inset_0_0_40px_rgba(192,38,211,0.2)] ${isRolling ? 'animate-[spin_2s_linear_infinite]' : 'animate-[spin_10s_linear_infinite]'}`}></div>
                            {/* Inner Ring */}
                            <div className={`absolute inset-4 rounded-full border border-fuchsia-500/30 border-t-fuchsia-400 shadow-[0_0_20px_rgba(192,38,211,0.4)] ${isRolling ? 'animate-[spin_1s_linear_infinite_reverse]' : 'animate-[spin_15s_linear_infinite_reverse]'}`}></div>
                            
                            {/* Item Display */}
                            <div className="relative z-10 flex flex-col items-center justify-center">
                                {isRolling && displayedItem ? (
                                    <div className="flex flex-col items-center animate-bounce-soft">
                                        <div className="text-7xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] transform scale-125 transition-all flex items-center justify-center w-24 h-24">
                                            <EmojiIcon emoji={resolveItemVisuals(displayedItem).emoji} />
                                        </div>
                                        <div className="mt-2 text-white font-bold text-sm tracking-wide drop-shadow-md bg-black/50 px-3 py-1 rounded-full border border-white/10">
                                            {resolveItemVisuals(displayedItem).name}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={showcaseItem.id + Math.random()} className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
                                        <div className="text-6xl mb-2 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transform transition-all hover:scale-110 flex items-center justify-center w-20 h-20">
                                            <EmojiIcon emoji={resolveItemVisuals(showcaseItem).emoji} />
                                        </div>
                                        <div className="mb-2 text-white/90 font-bold text-xs tracking-wide drop-shadow-md bg-black/50 px-3 py-1 rounded-full border border-white/10">
                                            {resolveItemVisuals(showcaseItem).name}
                                        </div>
                                        <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/60 backdrop-blur-md border border-white/10 ${getTierText(showcaseItem.tier)}`}>
                                            {showcaseItem.tier}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Action Buttons */}
            <div className="relative z-20 px-6 pb-8 pt-4 w-full max-w-md mx-auto flex flex-col gap-3">
                <p className="text-center text-[10px] text-white/50 italic">
                    *หากได้รับไอเทมประเภทอาหารระบบจะใช้งานทันที
                </p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => rollGacha(1)}
                        disabled={isRolling || !canAfford1}
                        className={`
                            flex-1 relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 h-16
                            ${!canAfford1 ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-[1.02] active:scale-95'}
                        `}
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50"></div>
                        <div className="absolute inset-0 bg-slate-800"></div>
                        <div className="relative h-full w-full bg-slate-900/90 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center border border-white/10">
                            <span className="font-bold text-xs text-white/80 tracking-wider uppercase mb-0.5">1 Pull</span>
                            <div className="flex items-center gap-1.5 font-black text-sm text-cyan-400">
                                <Gem size={12} fill="currentColor" /> 100
                            </div>
                        </div>
                    </button>
                    
                    <div className="relative flex-[1.5]">
                        {/* Discount Badge */}
                        <div className="absolute -top-3 -right-2 bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-bl-lg rounded-tr-xl shadow-lg z-30 transform rotate-12 transition-transform border border-red-400/50 pointer-events-none">
                            10% OFF
                        </div>
                        <button 
                            onClick={() => rollGacha(10)}
                            disabled={isRolling || !canAfford10}
                            className={`
                                w-full relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 h-16 shadow-[0_0_30px_rgba(192,38,211,0.3)] group
                                ${!canAfford10 ? 'opacity-50 cursor-not-allowed grayscale shadow-none' : 'hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(192,38,211,0.5)] active:scale-95'}
                            `}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 animate-gradient-x"></div>
                            <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-magical-shine pointer-events-none"></div>

                            <div className="relative h-full w-full bg-black/20 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center border border-white/20">
                                <span className="font-black text-sm text-white tracking-widest uppercase italic mb-0.5 drop-shadow-md">10 Pulls</span>
                                <div className="flex items-center gap-1.5 font-bold text-xs text-white bg-black/30 px-3 py-0.5 rounded-full border border-white/10">
                                    <span className="line-through text-white/50 text-[10px] mr-1">1000</span>
                                    <Gem size={10} className="text-cyan-300" fill="currentColor" /> <span className="text-amber-300">900</span>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* RESULTS MODAL (AAA Style) */}
            {showResults && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="w-full max-w-2xl flex flex-col items-center relative max-h-full">
                        
                        <div className="mb-8 text-center animate-in slide-in-from-bottom-4 duration-700">
                            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-200 tracking-widest uppercase italic drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                                Acquired
                            </h2>
                            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2 opacity-50"></div>
                        </div>
                        
                        {/* Scrollable Results Area */}
                        <div className="w-full overflow-y-auto max-h-[65vh] custom-scrollbar px-2 pb-6">
                            <div className={`grid ${results.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-2 md:grid-cols-5'} gap-4 w-full`}>
                                {results.map((item, idx) => {
                                    const visual = resolveItemVisuals(item);
                                    const { typeStr, descStr, perks } = getItemInfo(item);
                                    const isSingle = results.length === 1;
                                    const isFood = typeStr === "FOOD" || item.id === 'omakase';
                                    
                                    return (
                                        <div 
                                            key={idx} 
                                            className={`
                                                relative rounded-2xl flex flex-col items-center text-center overflow-hidden animate-in zoom-in duration-500
                                                ${isSingle ? 'p-8 aspect-square justify-center' : 'p-4 min-h-[160px] justify-between'}
                                                ${getTierStyle(item.tier)}
                                                backdrop-blur-md
                                            `}
                                            style={{ animationDelay: `${idx * 100}ms` }}
                                        >
                                            {/* Rarity Glow */}
                                            {['LEGENDARY', 'EPIC'].includes(item.tier) && (
                                                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none"></div>
                                            )}

                                            {/* Tier Badge */}
                                            <div className={`absolute top-0 inset-x-0 h-1 ${
                                                item.tier === 'LEGENDARY' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' :
                                                item.tier === 'EPIC' ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]' :
                                                item.tier === 'RARE' ? 'bg-blue-500' :
                                                item.tier === 'MAGIC' ? 'bg-emerald-500' : 'bg-slate-600'
                                            }`}></div>

                                            {/* Auto-Consume Badge */}
                                            {isFood && (
                                                <div className="absolute top-2 left-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                    <Zap size={8} fill="currentColor" /> USED
                                                </div>
                                            )}
                                            
                                            {/* Icon */}
                                            <div className={`${isSingle ? 'text-8xl mb-6 w-32 h-32' : 'text-4xl mt-2 mb-3 w-12 h-12'} filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transform transition-transform hover:scale-110 duration-300 relative z-10 flex items-center justify-center mx-auto`}>
                                                <EmojiIcon emoji={visual.emoji} />
                                            </div>
                                            
                                            {/* Name & Type */}
                                            <div className="w-full relative z-10 flex flex-col items-center">
                                                <h4 className={`font-bold text-white leading-tight tracking-wide ${isSingle ? 'text-2xl mb-2' : 'text-xs line-clamp-1 mb-1'}`}>
                                                    {item.name}
                                                </h4>
                                                
                                                <div className={`text-[8px] font-bold uppercase tracking-widest mb-2 ${getTierText(item.tier)}`}>
                                                    {item.tier}
                                                </div>

                                                {/* Description (Only on Single) */}
                                                {isSingle && (
                                                    <p className="text-white/60 text-sm mb-4 px-4 leading-relaxed">
                                                        {descStr}
                                                    </p>
                                                )}

                                                {/* DUP indicator */}
                                                {item.type === 'style' && ownedStyles.includes(item.id) && (
                                                    <div className="mt-auto bg-amber-500/20 text-amber-300 text-[9px] font-bold px-2 py-1 rounded border border-amber-500/30 w-full">
                                                        CONVERTED +500G
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="w-full px-6 pt-4 max-w-xs mx-auto animate-in slide-in-from-bottom-4 duration-700 delay-300">
                            <button 
                                onClick={() => setShowResults(false)}
                                className="w-full bg-white text-black font-black py-4 rounded-xl text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 transition-all hover:bg-gray-200 flex items-center justify-center gap-2"
                            >
                                Confirm <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            , document.body)}

            {/* HINT MODAL (AAA Style) */}
            {showHint && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
                    <div className="bg-slate-900/90 w-full max-w-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative max-h-[85vh] flex flex-col border border-white/10 shadow-2xl backdrop-blur-xl">
                        <div className="flex justify-between items-center mb-4 sm:mb-6 shrink-0">
                            <h3 className="font-black text-lg sm:text-xl text-white tracking-widest uppercase italic flex items-center gap-2">
                                <HelpCircle size={20} className="text-fuchsia-500" /> Drop Rates
                            </h3>
                            <button onClick={() => setShowHint(false)} className="w-8 h-8 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2 min-h-0">
                            {Object.entries(GACHA_RATE).map(([tier, rate]) => (
                                <div key={tier} className={`p-4 rounded-2xl border ${getHintTierStyle(tier as GachaTier)} backdrop-blur-sm`}>
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black uppercase tracking-widest">{tier}</span>
                                            {tier === 'LEGENDARY' && <Sparkles size={14} className="animate-spin-slow" />}
                                        </div>
                                        <span className="font-bold text-sm bg-black/30 px-2 py-0.5 rounded-md">{(rate * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {GACHA_POOL.filter(i => i.tier === tier).map(i => {
                                            const vis = resolveItemVisuals(i);
                                            return (
                                                <span key={i.id + i.name} className="text-[10px] bg-black/40 border border-white/5 px-2 py-1 rounded-md flex items-center gap-1.5 font-medium text-white/80">
                                                    <EmojiIcon emoji={vis.emoji} /> {i.name}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            , document.body)}
        </div>
    );
};

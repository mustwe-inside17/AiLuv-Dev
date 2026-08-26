
import { ActiveBuff, PlayerAttributes, BuffType, CharacterId } from '../types';
import { FASHION_ITEMS } from '../constants/fashion';
import { useGameStore } from '../store/gameStore'; // Import Store

// --- VISUAL CONFIGURATION ---
export const getBuffConfig = (type: string) => {
    switch (type) {
        case 'love_bonus': return { icon: '💖', label: 'Love potion' };
        case 'gold_bonus': return { icon: '💰', label: 'Wealth' };
        case 'exp_bonus': return { icon: '🧠', label: 'Knowledge' };
        case 'fast_hand': return { icon: '⚡', label: 'Fast Hand' };
        case 'money_magnet': return { icon: '🧲', label: 'Money Magnet' };
        case 'lucky_day': return { icon: '🍀', label: 'Lucky Day' };
        case 'chatterbox': return { icon: '🗣️', label: 'Chatterbox' };
        case 'sweet_words': return { icon: '🥰', label: 'Sweet Words' };
        case 'charisma_aura': return { icon: '💘', label: 'Charisma' };
        case 'gym_junkie': return { icon: '🏋️‍♀️', label: 'Gym Junkie' };
        case 'overlimit': return { icon: '🦾', label: 'Overlimit' };
        case 'chill_vibes': return { icon: '❄️', label: 'Chill Vibes' };
        case 'focus_boost': return { icon: '🎯', label: 'Focus Boost' };
        case 'bass_boost': return { icon: '🔊', label: 'Bass Boost' };
        case 'motivation': return { icon: '🔥', label: 'Motivation' };
        case 'drunk': return { icon: '🍺', label: 'Tipsy' };
        // STAT BUFFS
        case 'buff_vit': return { icon: '❤️', label: 'Vitality' };
        case 'buff_int': return { icon: '🧠', label: 'Intellect' };
        case 'buff_cha': return { icon: '✨', label: 'Charisma' };
        case 'buff_luck': return { icon: '🎲', label: 'Fortune' };
        default: return { icon: '✨', label: 'Buff' };
    }
};

// --- DESCRIPTION GENERATOR ---
export const getBuffDescription = (type: BuffType, value: number): string => {
    const pct = Math.round((value - 1) * 100);
    switch (type) {
        case 'love_bonus': return `Love Gain x${value}`;
        case 'gold_bonus': return `Gold Reward +${pct}%`;
        case 'exp_bonus': return `EXP Gain +${pct}%`;
        case 'fast_hand': return `Work Duration -5s`; // Flat value usually
        case 'money_magnet': return `Gold from Work +${pct}%`;
        case 'lucky_day': return `Critical Chance +${Math.round(value * 100)}%`;
        case 'chatterbox': return `Chat Energy Cost -1`;
        case 'sweet_words': return `Love per Chat +${value}`;
        case 'charisma_aura': return `Love Multiplier x${value}`;
        case 'gym_junkie': return `Gym EXP x${value}`;
        case 'overlimit': return `Max Energy +${value}`;
        case 'chill_vibes': return `Energy Regen Speed (40s Ticks)`; 
        case 'focus_boost': return `Gold from Work +${pct}%`;
        case 'bass_boost': return `Max Energy +${value}`;
        case 'motivation': return `Work Energy Cost -10%`;
        case 'drunk': return `Unlock Drunk Interactions`;
        // STATS
        case 'buff_vit': return `Temporary Vitality +${value}`;
        case 'buff_int': return `Temporary Intellect +${value}`;
        case 'buff_cha': return `Temporary Charisma +${value}`;
        case 'buff_luck': return `Temporary Luck +${value}`;
        default: return `Effectiveness: ${value}`;
    }
};

// --- HELPER: CALCULATE EFFECTIVE STAT (BASE + BUFF + STYLE) ---
export const getEffectiveStat = (
    baseValue: number, 
    statType: 'vit' | 'int' | 'cha' | 'luck', 
    buffs: ActiveBuff[],
    equippedStyleId: string | null = null
): number => {
    let bonus = 0;

    // 1. Buffs
    const buffType = `buff_${statType}`;
    const relevantBuff = buffs.find(b => b.type === buffType);
    if (relevantBuff) bonus += relevantBuff.value;

    // 2. Style (Passive)
    if (equippedStyleId) {
        const style = FASHION_ITEMS.find(s => s.id === equippedStyleId);
        if (style && style.stats && style.stats[statType]) {
            bonus += (style.stats[statType] || 0);
        }
    }

    return baseValue + bonus;
};

// --- HELPER: CALCULATE EFFECTIVE MAX ENERGY (BASE + BUFFS + STYLE VIT) ---
// This ensures UI and Logic use the exact same formula
export const calculateEffectiveMaxEnergy = (
    baseMaxEnergy: number, 
    buffs: ActiveBuff[],
    equippedStyleId: string | null = null
): number => {
    const overlimitBuff = buffs.find(b => b.type === 'overlimit');
    const hasBassBoost = buffs.some(b => b.type === 'bass_boost');
    const vitBuff = buffs.find(b => b.type === 'buff_vit');
    
    let bonusCap = 0;
    
    // 1. Direct Max Energy Buffs
    if (overlimitBuff) bonusCap += (overlimitBuff.value || 0);
    if (hasBassBoost) bonusCap += 10;
    
    // 2. Vitality Buffs (1 Vit = +5 Energy)
    // Note: We only add the *bonus* vitality here, as base vitality is already baked into baseMaxEnergy
    if (vitBuff) {
        bonusCap += (vitBuff.value * 5); 
    }

    // 3. Style Vitality (1 Vit = +5 Energy)
    if (equippedStyleId) {
        const style = FASHION_ITEMS.find(s => s.id === equippedStyleId);
        if (style && style.stats && style.stats.vit) {
            bonusCap += (style.stats.vit * 5);
        }
    }

    return Math.floor(baseMaxEnergy + bonusCap);
};

// --- LOVE SCORE MECHANICS (STRICT MODE + FORTUNE CRIT + FASHION BIAS) ---
export const calculateLoveScore = (
    aiBase: number,
    comboStreak: number,
    buffs: ActiveBuff[],
    stats: PlayerAttributes,
    equippedStyleId: string | null = null,
    targetCharId: CharacterId | null = null,
    isDateMode: boolean = false, // [MARCUS NEW]: Date Mode Multiplier
    repetitionCount: number = 0 // [MARCUS NEW]: Spam Penalty
) => {
    const breakdown: string[] = [`AI Base: ${aiBase > 0 ? '+' : ''}${aiBase}`];
    
    // [MARCUS VIP]: Check VIP Status directly from store to avoid prop drill hell
    const isVip = useGameStore.getState().isVip;

    // 1. MULTIPLIER STAGE (Applied to AI Base ONLY)
    let currentScore = aiBase;

    // VIP Multiplier (+10%)
    if (isVip) {
        currentScore = Math.floor(currentScore * 1.1);
        breakdown.push("VIP Bonus (+10%)");
    }

    // A. Combo Multiplier
    let comboMultiplier = 1;
    if (comboStreak >= 3) {
        comboMultiplier = 2.5; 
        breakdown.push("Combo Bonus (x2.5)");
    }
    
    // B. Charisma Multiplier (Stat + Buff + Style)
    const effectiveCha = getEffectiveStat(stats.cha || 1, 'cha', buffs, equippedStyleId);
    const chaMultiplier = 1 + ((effectiveCha - 1) * 0.01); 

    // C. Aura Buff Multiplier
    const auraBuff = buffs.find(b => b.type === 'charisma_aura');
    const auraMultiplier = auraBuff ? auraBuff.value : 1;

    // D. FASHION SOCIAL BIAS (NEW)
    let fashionMultiplier = 1;
    if (equippedStyleId && targetCharId) {
        const style = FASHION_ITEMS.find(s => s.id === equippedStyleId);
        if (style && style.socialBias.includes(targetCharId)) {
            fashionMultiplier = 1.2; // 20% Bonus if character likes the outfit
            breakdown.push(`Fashion Bonus (${style.name})`);
        }
    }
    
    // E. [MARCUS NEW]: DATE MODE BONUS
    let dateMultiplier = 1;
    if (isDateMode) {
        dateMultiplier = 1.5;
        breakdown.push("Date Night Bonus (x1.5)");
    }

    // F. [MARCUS NEW]: REPETITION PENALTY
    let repetitionMultiplier = 1;
    if (repetitionCount > 0) {
        if (repetitionCount === 1) repetitionMultiplier = 0.7; // 70% efficiency
        else if (repetitionCount === 2) repetitionMultiplier = 0.4; // 40% efficiency
        else repetitionMultiplier = 0.1; // 10% efficiency (Spam)
        
        breakdown.push(`Repetition Penalty (x${repetitionMultiplier})`);
    }

    // Apply Multipliers if positive
    if (currentScore > 0) {
        const totalMultiplier = comboMultiplier * chaMultiplier * auraMultiplier * fashionMultiplier * dateMultiplier * repetitionMultiplier;
        currentScore = Math.floor(currentScore * totalMultiplier);
    }

    // 2. FLAT BONUS STAGE (Applied AFTER multipliers)
    const constantBonus = 2; 
    const sweetWordsBuff = buffs.find(b => b.type === 'sweet_words');
    const flatBuffBonus = sweetWordsBuff ? sweetWordsBuff.value : 0;

    let total = currentScore + constantBonus + flatBuffBonus;

    // --- [MARCUS BALANCE ADJUSTMENT] ---
    // Make progression 25% harder (Multiply by 0.75)
    // This slows down the rapid filling of the love bar.
    if (total > 0) {
        const DIFFICULTY_DAMPENER = 0.75; 
        total = Math.floor(total * DIFFICULTY_DAMPENER);
        // Ensure at least 1 point if it was positive originally (don't stall completely)
        if (total === 0) total = 1;
    }

    // 3. FORTUNE CRITICAL HIT (NEW)
    // Only applies if the gain is positive
    let isCritical = false;
    if (total > 0) {
        const effectiveLuck = getEffectiveStat(stats.luck || 1, 'luck', buffs, equippedStyleId);
        const hasLuckyDay = buffs.some(b => b.type === 'lucky_day');
        // Base 2% per Luck level + 20% if buff active
        const critChance = ((effectiveLuck - 1) * 0.02) + (hasLuckyDay ? 0.2 : 0);
        
        // Roll the dice
        if (Math.random() < critChance) {
            isCritical = true;
            total = Math.floor(total * 2); // Double the final score
            breakdown.push("FORTUNE CRITICAL (x2)!");
        }
    }

    return { 
        total: Math.floor(total), 
        isCritical, // Return this flag for UI
        breakdown 
    };
};

// ... (Keep existing work/gym calculations) ...
export const calculateWorkOutcome = (
    baseGold: number, 
    baseExp: number, 
    buffs: ActiveBuff[], 
    stats: PlayerAttributes,
    performanceScore: number = 0,
    equippedStyleId: string | null = null
) => {
    let gold = baseGold;
    let exp = baseExp;
    let messages: string[] = [];
    let isCritical = false;

    // 1. Buff Multipliers
    const moneyMagnet = buffs.find(b => b.type === 'money_magnet');
    const focusBoost = buffs.find(b => b.type === 'focus_boost');
    const goldBonus = buffs.find(b => b.type === 'gold_bonus');

    let multiplier = 1;
    if (moneyMagnet) {
        multiplier += (moneyMagnet.value - 1);
        messages.push("Money Magnet Bonus!");
    } else if (focusBoost) {
        multiplier += (focusBoost.value - 1);
        messages.push("Neon Focus Bonus!");
    } else if (goldBonus) {
        multiplier += (goldBonus.value - 1);
    }
    
    gold = Math.floor(gold * multiplier);

    // 2. Stat Bonuses (Intellect + Buff + Style)
    const effectiveInt = getEffectiveStat(stats.int || 1, 'int', buffs, equippedStyleId);
    const INT_BONUS_PCT = (effectiveInt - 1) * 0.02; // 2% per INT level
    const intBonus = Math.floor(gold * INT_BONUS_PCT);
    gold += intBonus;
    if (intBonus > 0) messages.push(`Smart Work (+${intBonus}G)`);

    // 3. Performance Bonus (Mini-Game)
    const safeScore = Math.min(performanceScore, 2000); // Cap at 2000 (Updated)
    const perfBonus = Math.floor(safeScore * 0.25);
    gold += perfBonus;
    if (perfBonus > 0) messages.push(`Perf. Bonus (+${perfBonus}G)`);

    // 4. Critical Hit (Luck + Buff + Style)
    const effectiveLuck = getEffectiveStat(stats.luck || 1, 'luck', buffs, equippedStyleId);
    const hasLuckyDay = buffs.some(b => b.type === 'lucky_day');
    const LUCK_CHANCE = Math.max(0, (effectiveLuck - 1) * 0.02);
    const totalCritChance = LUCK_CHANCE + (hasLuckyDay ? 0.2 : 0);

    if (Math.random() < totalCritChance) {
        gold *= 2;
        isCritical = true;
        messages.push("CRITICAL HIT! Double Earnings!");
    }

    return {
        gold: Math.floor(gold),
        exp: Math.floor(exp),
        messages,
        isCritical
    };
};

export const calculateGymOutcome = (
    baseMaxEnergy: number,
    baseExp: number,
    buffs: ActiveBuff[],
    stats: PlayerAttributes,
    performanceScore: number = 0,
    equippedStyleId: string | null = null
) => {
    let maxEnergyGain = baseMaxEnergy;
    let exp = baseExp;
    let messages: string[] = [];
    let isCritical = false;
    let consumedBuffs: string[] = [];

    // 1. Buffs
    const gymJunkie = buffs.find(b => b.type === 'gym_junkie');
    if (gymJunkie) {
        exp *= gymJunkie.value; // Usually x2
        messages.push("Gym Junkie: Double XP!");
        consumedBuffs.push('gym_junkie');
    }

    // 2. Performance
    const safeScore = Math.min(performanceScore, 2000); // Cap at 2000 (Updated)
    const perfBonus = Math.floor(safeScore * 0.25);
    exp += perfBonus;
    if (perfBonus > 0) messages.push(`Good Form (+${perfBonus} XP)`);

    // 3. Critical Hit (Luck + Buff + Style)
    const effectiveLuck = getEffectiveStat(stats.luck || 1, 'luck', buffs, equippedStyleId);
    const hasLuckyDay = buffs.some(b => b.type === 'lucky_day');
    const LUCK_CHANCE = Math.max(0, (effectiveLuck - 1) * 0.02);
    const totalCritChance = LUCK_CHANCE + (hasLuckyDay ? 0.2 : 0);

    if (Math.random() < totalCritChance) {
        isCritical = true;
        // Random Crit Effect
        if (Math.random() > 0.5) {
            exp *= 2;
            messages.push("IN THE ZONE! Double Experience!");
        } else {
            maxEnergyGain += 2;
            messages.push("IN THE ZONE! Extra Stamina Gains!");
        }
    }

    return {
        maxEnergyGain: Math.floor(maxEnergyGain),
        exp: Math.floor(exp),
        messages,
        isCritical,
        consumedBuffs
    };
};

export const getEnergyRegenConfig = (
    currentMaxEnergy: number,
    unlockedSkills: string[],
    buffs: ActiveBuff[],
    isSleeping: boolean,
    equippedStyleId: string | null = null
) => {
    // 1. Tick Rate
    const hasHardSleep = unlockedSkills.includes('hard_sleep');
    const hasBasicSleep = unlockedSkills.includes('basic_sleep');
    const hasChillBuff = buffs.some(b => b.type === 'chill_vibes');
    
    let sleepTickRate = 60000; // Default 1 min (1x)
    if (hasHardSleep) sleepTickRate = 5000; // 12x
    else if (hasBasicSleep) sleepTickRate = 10000; // 6x
    
    let baseTickRate = 60000; // 1 min
    if (hasChillBuff) baseTickRate = 40000; // 40s (Updated for Rooftop)
    
    const tickRate = isSleeping ? sleepTickRate : baseTickRate;

    // 2. Cap Limit (Now uses the shared calculator)
    const regenCap = calculateEffectiveMaxEnergy(currentMaxEnergy, buffs, equippedStyleId);

    return {
        tickRate,
        regenCap
    };
};

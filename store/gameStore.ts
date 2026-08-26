
import { create } from 'zustand';
import { GameState, LocationId, CharacterId, ShopItem, PlayerAttributes, Mood, RelationshipTier, ActiveTask, ActiveEvent, DateScene, SecretUnlockData, PendingQuestReward, ActiveQuestChoiceSession, MailItem, MailAction } from '../types';
import { INITIAL_GAME_STATE, TRAVEL_COST, LOCATIONS, TIER_THRESHOLDS, DAILY_LOGIN_REWARDS } from '../constants';
import { getCharacterMoodOnArrival } from '../constants/characters';
import { calculateEffectiveMaxEnergy } from '../services/buffMechanics';

import { getRandomStockNews } from '../constants/stockNews';

// --- ACTIONS INTERFACE ---
interface GameActions {
    // Core setters
    setGameState: (state: Partial<GameState>) => void;
    replaceGameState: (state: GameState) => void;
    
    // Mechanics
    travelTo: (locationId: LocationId, hasTravelSkill: boolean) => void;
    deductEnergy: (amount: number) => void;
    addEnergy: (amount: number) => void;
    addGold: (amount: number) => void;
    spendGold: (amount: number) => boolean; // Returns success/fail
    
    // NEW: DIAMOND ACTIONS
    addDiamonds: (amount: number) => void;
    spendDiamonds: (amount: number) => boolean;

    // NEW: VIP ACTIONS
    subscribeVip: () => void;
    claimVipDaily: () => boolean;

    // Inventory & Stats
    addItem: (itemId: string, amount?: number) => void;
    removeItem: (itemId: string, amount?: number) => boolean;
    upgradeStat: (stat: keyof PlayerAttributes) => void;
    
    // Fashion
    buyStyle: (styleId: string, cost: number) => void;
    addStyle: (styleId: string) => void; 
    equipStyle: (styleId: string | null) => void;

    // Task & Events
    startTask: (task: ActiveTask) => void;
    completeTask: (resultState: Partial<GameState>) => void;
    setActiveEvent: (event: ActiveEvent | null) => void;
    
    // Relationships
    updateMood: (charId: CharacterId, mood: Mood) => void;
    
    // System
    unlockAchievement: (id: string) => void;
    addBuff: (buff: any) => void;
    cleanExpiredBuffs: () => void;

    // NEW: DATE SCENE
    setDateScene: (scene: DateScene | null) => void;

    // NEW: AUDIO SETTINGS & STATE
    toggleMute: () => void;
    setBgmVolume: (volume: number) => void;
    setSfxVolume: (volume: number) => void;
    setMusicActive: (active: boolean) => void; 
    
    // NEW: ECO MODE
    toggleEcoMode: () => void;
    
    // NEW: AI THINKING CONFIG
    setAiThinkingLevel: (level: 'fast' | 'normal' | 'deep') => void;

    // NEW: CLAIM DAILY LOGIN
    claimDailyLogin: () => boolean;

    // NEW: SECRET UNLOCK MODAL CONTROL
    setSecretUnlockData: (data: SecretUnlockData | null) => void;

    // NEW: PENDING QUEST REWARD
    setPendingQuestReward: (reward: PendingQuestReward | null) => void;

    // NEW: SET ACTIVE QUEST CHOICE
    setActiveQuestChoice: (session: ActiveQuestChoiceSession | null) => void;

    // NEW: PHONE SYSTEM STATE
    isPhoneOpen: boolean;
    activePhoneApp?: 'home' | 'aigram' | 'mail' | 'wallet' | null;
    togglePhone: () => void;
    openPhone: (app?: 'home' | 'aigram' | 'mail' | 'wallet') => void;

    // NEW: MAIL SYSTEM ACTIONS
    addMail: (mail: MailItem) => void;
    deleteMail: (mailId: string) => void;
    readMail: (mailId: string) => void;
    claimMailReward: (mailId: string) => boolean;

    // NEW: VOICE CHAT ACTIONS
    setVoiceChatActive: (active: boolean, charId?: CharacterId) => void;
    addVoiceTokenUsage: (amount: number) => void;
    toggleMic: () => void;
    addMemory: (charId: CharacterId, memory: any) => void;

    // WALLET / INVESTMENT ACTIONS
    investGold: (amount: number, durationHours: number, interestRate: number) => boolean;
    claimStake: (stakeId: string) => boolean;
    buyStock: (symbol: string, amount: number) => boolean;
    sellStock: (symbol: string, amount: number) => boolean;
    updateStockMarket: () => void;
}

// --- STORE DEFINITION ---
export const useGameStore = create<GameState & GameActions>((set, get) => ({
    ...INITIAL_GAME_STATE,
    // Ensure settings exist even if initial state doesn't have them yet (migration)
    settings: INITIAL_GAME_STATE.settings || { bgmVolume: 0.2, sfxVolume: 0.8, isMuted: false, isEcoMode: false },
    isMusicActive: false, // Default false
    // Ensure dailyLogin exists (migration)
    dailyLogin: INITIAL_GAME_STATE.dailyLogin || { currentDay: 1, lastClaimDate: '' },
    secretUnlockData: null,
    // Init Rare Vibes map
    activeRareVibes: {}, 
    pendingQuestReward: null,
    activeQuestChoiceSession: null,
    isVip: false,
    vipDailyClaimed: '',
    isPhoneOpen: false, // Default Closed
    unreadSocialPosts: 4, // Default
    mails: INITIAL_GAME_STATE.mails || [], // Ensure mails exist

    // --- BASIC SETTERS ---
    setGameState: (updates) => {
        // [MARCUS FIX]: Force rename "Citizen" to "คุณ" if found during update
        if (updates.playerName === 'Citizen') {
            updates.playerName = 'คุณ';
        }
        set((state) => ({ ...state, ...updates }));
    },
    replaceGameState: (newState) => {
        // [MARCUS FIX]: Force rename "Citizen" to "คุณ" during load/replace
        if (newState.playerName === 'Citizen') {
            newState.playerName = 'คุณ';
        }
        set((state) => ({
            ...newState,
            // Safety check for settings migration
            settings: newState.settings || { bgmVolume: 0.2, sfxVolume: 0.8, isMuted: false, isEcoMode: false },
            dailyLogin: newState.dailyLogin || { currentDay: 1, lastClaimDate: '' },
            isVip: newState.isVip || false,
            vipDailyClaimed: newState.vipDailyClaimed || '',
            secretUnlockData: null, 
            activeRareVibes: newState.activeRareVibes || {}, 
            pendingQuestReward: null, 
            activeQuestChoiceSession: null,
            yesterdayMemoryTags: newState.yesterdayMemoryTags || ({} as Record<CharacterId, string>),
            // [MARCUS FIX]: Safety initialization for lastThemeUpdate to allow immediate first run
            lastThemeUpdate: newState.lastThemeUpdate || Date.now(),
            isPhoneOpen: false, // Reset phone on load
            unreadSocialPosts: newState.unreadSocialPosts !== undefined ? newState.unreadSocialPosts : 4, // Default if missing
            mails: newState.mails || [], // Default empty mail
            voiceChat: newState.voiceChat || { isActive: false, characterId: null as any, tokenUsage: 0, isMicMuted: false }
        }));
    },

    // --- GAMEPLAY MECHANICS ---
    travelTo: (targetId, hasTravelSkill) => {
        const cost = targetId === 'home' ? 0 : Math.max(0, TRAVEL_COST - (hasTravelSkill ? 2 : 0));
        const currentEnergy = get().energy;
        
        if (currentEnergy < cost) return;

        const targetCharId = LOCATIONS[targetId]?.characterId;
        
        const currentChemistry = targetCharId ? (get().chemistryScores?.[targetCharId] || 0) : 0;
        const currentHour = new Date().getHours();

        const moodUpdates = targetCharId 
            ? { [targetCharId]: getCharacterMoodOnArrival(targetCharId, currentChemistry, currentHour) } 
            : {};

        set((state) => ({
            energy: Math.max(0, state.energy - cost),
            currentLocation: targetId,
            currentMoods: { ...state.currentMoods, ...moodUpdates },
            currentDateScene: null 
        }));
    },

    deductEnergy: (amount) => set((state) => ({ energy: Math.max(0, state.energy - amount) })),
    
    addEnergy: (amount) => set((state) => {
        const effectiveMax = calculateEffectiveMaxEnergy(state.maxEnergy, state.activeBuffs, state.equippedStyle);
        return { energy: Math.min(effectiveMax, state.energy + amount) };
    }),

    addGold: (amount) => set((state) => ({ 
        gold: state.gold + amount,
        totalGoldEarned: (state.totalGoldEarned || 0) + amount 
    })),

    spendGold: (amount) => {
        const { gold } = get();
        if (gold >= amount) {
            set({ gold: gold - amount });
            return true;
        }
        return false;
    },

    // --- DIAMOND LOGIC ---
    addDiamonds: (amount) => set((state) => ({
        diamonds: (state.diamonds || 0) + amount
    })),

    spendDiamonds: (amount) => {
        const { diamonds } = get();
        if ((diamonds || 0) >= amount) {
            set({ diamonds: (diamonds || 0) - amount });
            return true;
        }
        return false;
    },

    // --- VIP ACTIONS ---
    subscribeVip: () => {
        const expiry = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 Days
        set({ isVip: true, vipExpiry: expiry });
    },

    claimVipDaily: () => {
        const { isVip, vipDailyClaimed, diamonds } = get();
        const todayStr = new Date().toDateString();
        
        if (!isVip) return false;
        if (vipDailyClaimed === todayStr) return false;

        set({
            diamonds: (diamonds || 0) + 50,
            vipDailyClaimed: todayStr
        });
        return true;
    },

    addItem: (itemId, amount = 1) => set((state) => ({
        inventory: {
            ...state.inventory,
            [itemId]: (state.inventory[itemId] || 0) + amount
        }
    })),

    removeItem: (itemId, amount = 1) => {
        const current = get().inventory[itemId] || 0;
        if (current >= amount) {
            set((state) => ({
                inventory: {
                    ...state.inventory,
                    [itemId]: current - amount
                }
            }));
            return true;
        }
        return false;
    },

    upgradeStat: (stat) => set((state) => {
        if (state.stats.points <= 0) return state;
        const newStats = { ...state.stats };
        newStats[stat]++;
        newStats.points--;
        
        let maxEnergyUpdate = state.maxEnergy;
        if (stat === 'vit') maxEnergyUpdate += 5;

        return { stats: newStats, maxEnergy: maxEnergyUpdate };
    }),

    buyStyle: (styleId, cost) => set((state) => {
        if (state.gold < cost) return state;
        if (state.ownedStyles.includes(styleId)) return state;
        
        return {
            gold: state.gold - cost,
            ownedStyles: [...state.ownedStyles, styleId]
        };
    }),

    addStyle: (styleId) => set((state) => {
        if (state.ownedStyles.includes(styleId)) return state;
        return {
            ownedStyles: [...state.ownedStyles, styleId]
        };
    }),

    equipStyle: (styleId) => set((state) => ({
        equippedStyle: styleId
    })),

    startTask: (task) => set({ activeTask: task }),
    
    completeTask: (resultState) => set((state) => ({ ...state, ...resultState })),

    setActiveEvent: (event) => set({ activeEvent: event }),

    updateMood: (charId, mood) => set((state) => ({
        currentMoods: { ...state.currentMoods, [charId]: mood }
    })),

    unlockAchievement: (id) => set((state) => {
        if (state.achievements.includes(id)) return state;
        return { achievements: [...state.achievements, id] };
    }),

    addBuff: (buff) => set((state) => {
        const filtered = state.activeBuffs.filter(b => b.type !== buff.type);
        return { activeBuffs: [...filtered, buff] };
    }),

    cleanExpiredBuffs: () => set((state) => {
        if (state.activeBuffs.length === 0) return state;
        const now = Date.now();
        const valid = state.activeBuffs.filter(b => b.expiresAt > now);
        
        if (valid.length !== state.activeBuffs.length) {
            // [MARCUS FIX]: If buffs expired, recalculate effective max and cap existing energy
            const newMax = calculateEffectiveMaxEnergy(state.maxEnergy, valid, state.equippedStyle);
            return { 
                activeBuffs: valid,
                energy: Math.min(newMax, state.energy)
            };
        }
        return state;
    }),

    setDateScene: (scene) => set({ currentDateScene: scene }),

    // --- AUDIO SETTINGS ---
    toggleMute: () => set((state) => ({
        settings: { ...state.settings, isMuted: !state.settings.isMuted }
    })),

    setBgmVolume: (volume) => set((state) => ({
        settings: { ...state.settings, bgmVolume: volume }
    })),

    setSfxVolume: (volume) => set((state) => ({
        settings: { ...state.settings, sfxVolume: volume }
    })),

    setMusicActive: (active) => set({ isMusicActive: active }),
    
    // --- ECO MODE ---
    toggleEcoMode: () => set((state) => ({
        settings: { ...state.settings, isEcoMode: !state.settings.isEcoMode }
    })),

    // --- AI SETTINGS ---
    setAiThinkingLevel: (level) => set((state) => ({
        settings: { ...state.settings, aiThinkingLevel: level }
    })),

    // --- DAILY LOGIN ---
    claimDailyLogin: () => {
        const { dailyLogin, diamonds, inventory } = get();
        const todayStr = new Date().toDateString();

        if (dailyLogin.lastClaimDate === todayStr) return false; 

        const reward = DAILY_LOGIN_REWARDS.find(r => r.day === dailyLogin.currentDay);
        if (!reward) return false;

        const newState: Partial<GameState> = {
            dailyLogin: {
                currentDay: dailyLogin.currentDay >= 7 ? 1 : dailyLogin.currentDay + 1, 
                lastClaimDate: todayStr
            }
        };

        if (reward.type === 'diamond') {
            newState.diamonds = (diamonds || 0) + (reward.value || 0);
        } else if (reward.type === 'item' && reward.id) {
            const newInventory = { ...inventory };
            newInventory[reward.id] = (newInventory[reward.id] || 0) + 1;
            newState.inventory = newInventory;
        }

        set(newState);
        return true;
    },

    setSecretUnlockData: (data) => set({ secretUnlockData: data }),

    setPendingQuestReward: (reward) => set({ pendingQuestReward: reward }),

    setActiveQuestChoice: (session) => set({ activeQuestChoiceSession: session }),

    // --- PHONE SYSTEM ---
    activePhoneApp: null,
    togglePhone: () => set((state) => ({ isPhoneOpen: !state.isPhoneOpen })),
    openPhone: (app) => set({ isPhoneOpen: true, activePhoneApp: app || 'home' }),

    // --- MAIL SYSTEM ---
    addMail: (mail) => set((state) => {
        const currentMails = state.mails || [];
        if (currentMails.some(m => m.id === mail.id)) return state;
        return { mails: [mail, ...currentMails] };
    }),

    deleteMail: (mailId) => set((state) => ({
        mails: state.mails.filter(m => m.id !== mailId)
    })),

    readMail: (mailId) => set((state) => ({
        mails: state.mails.map(m => m.id === mailId ? { ...m, isRead: true } : m)
    })),

    claimMailReward: (mailId) => {
        const { mails, gold, diamonds, inventory } = get();
        const mail = mails.find(m => m.id === mailId);
        
        if (!mail || mail.isClaimed || !mail.rewards) return false;

        let newState: Partial<GameState> = {
            mails: mails.map(m => m.id === mailId ? { ...m, isClaimed: true, isRead: true } : m)
        };

        if (mail.rewards.gold) {
            newState.gold = gold + mail.rewards.gold;
            newState.totalGoldEarned = (get().totalGoldEarned || 0) + mail.rewards.gold;
        }
        if (mail.rewards.diamonds) {
            newState.diamonds = (diamonds || 0) + mail.rewards.diamonds;
        }
        if (mail.rewards.item) {
            const newInv = { ...inventory };
            newInv[mail.rewards.item] = (newInv[mail.rewards.item] || 0) + 1;
            newState.inventory = newInv;
        }

        set(newState);
        return true;
    },

    // --- VOICE CHAT ACTIONS ---
    setVoiceChatActive: (active, charId) => set((state) => ({
        voiceChat: {
            ...state.voiceChat,
            isActive: active,
            characterId: active ? (charId || state.voiceChat.characterId) : null
        }
    })),

    addVoiceTokenUsage: (amount) => set((state) => ({
        voiceChat: {
            ...state.voiceChat,
            tokenUsage: state.voiceChat.tokenUsage + amount
        }
    })),

    toggleMic: () => set((state) => ({
        voiceChat: {
            ...state.voiceChat,
            isMicMuted: !state.voiceChat.isMicMuted
        }
    })),

    addMemory: (charId, memory) => set((state) => ({
        memories: {
            ...state.memories,
            [charId]: [memory, ...(state.memories[charId] || [])]
        }
    })),

    // --- WALLET / INVESTMENT ACTIONS ---
    investGold: (amount, durationHours, interestRate) => {
        const { gold, activeStakes } = get();
        if (gold >= amount && amount > 0) {
            const newStake = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                amount,
                startTime: Date.now(),
                durationHours,
                interestRate,
                claimed: false
            };
            set({
                gold: gold - amount,
                activeStakes: [...(activeStakes || []), newStake]
            });
            return true;
        }
        return false;
    },

    claimStake: (stakeId) => {
        const { activeStakes, gold, totalGoldEarned } = get();
        const stakes = activeStakes || [];
        const index = stakes.findIndex(s => s.id === stakeId && !s.claimed);
        if (index > -1) {
            const stake = stakes[index];
            const endtime = stake.startTime + (stake.durationHours * 60 * 60 * 1000);
            if (Date.now() >= endtime - 1000) {
                const profit = Math.floor(stake.amount * stake.interestRate);
                const returnAmount = stake.amount + profit;
                
                const newStakes = stakes.filter(s => s.id !== stakeId);
                
                set({
                    gold: gold + returnAmount,
                    totalGoldEarned: (totalGoldEarned || 0) + profit,
                    activeStakes: newStakes
                });
                return true;
            }
        }
        return false;
    },

    buyStock: (symbol, amountToBuy) => {
        const { gold, stockMarket, portfolio } = get();
        const sm = stockMarket || {};
        const pf = portfolio || {};
        
        const stockData = sm[symbol];
        if (!stockData) return false;
        
        const totalCost = stockData.currentPrice * amountToBuy;
        if (gold >= totalCost) {
            const currentOwned = pf[symbol]?.amount || 0;
            const currentAvgPrice = pf[symbol]?.averagePrice || 0;
            
            const newAvgPrice = ((currentOwned * currentAvgPrice) + totalCost) / (currentOwned + amountToBuy);
            
            set({
                gold: gold - totalCost,
                portfolio: {
                    ...pf,
                    [symbol]: {
                        symbol,
                        amount: currentOwned + amountToBuy,
                        averagePrice: newAvgPrice
                    }
                }
            });
            return true;
        }
        return false;
    },

    sellStock: (symbol, amountToSell) => {
        const { gold, stockMarket, portfolio } = get();
        const sm = stockMarket || {};
        const pf = portfolio || {};
        
        const stockData = sm[symbol];
        const ownedData = pf[symbol];
        
        if (!stockData || !ownedData || ownedData.amount < amountToSell) return false;
        
        const totalRevenue = stockData.currentPrice * amountToSell;
        
        set({
            gold: gold + totalRevenue,
            portfolio: {
                ...pf,
                [symbol]: {
                    ...ownedData,
                    amount: ownedData.amount - amountToSell
                }
            }
        });
        return true;
    },

    updateStockMarket: () => set((state) => {
        const currentMarket = state.stockMarket || {};
        const updatedMarket = { ...currentMarket };
        
        Object.keys(updatedMarket).forEach(symbol => {
            const stock = updatedMarket[symbol];
            // Assign or refresh news (50% chance to assign new news on update if not existing or on market tick)
            let activeNews = stock.activeNews;
            if (!activeNews || Math.random() < 0.4) {
                const freshNews = getRandomStockNews(symbol);
                if (freshNews) activeNews = freshNews;
            }

            // Calculate change percent driven by news impact + small market noise (+/- 2%)
            const newsBias = activeNews ? (activeNews.priceBiasPercent / 100) : 0;
            const noise = (Math.random() * 0.04) - 0.02; 
            const changePercent = newsBias + noise;
            
            let newPrice = stock.currentPrice * (1 + changePercent);
            if (newPrice < 1.0) newPrice = 1.0;
            newPrice = Math.round(newPrice * 100) / 100;
            
            updatedMarket[symbol] = {
                ...stock,
                currentPrice: newPrice,
                activeNews: activeNews,
                lastUpdated: Date.now(),
                history: [...(stock.history || []).slice(-20), stock.currentPrice] // Keep last 20
            };
        });
        
        return { stockMarket: updatedMarket };
    })
}));

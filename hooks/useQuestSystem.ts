import React, { useCallback } from 'react';
import { GameState, QuestType, ShopItem } from '../types';
import { 
    QUEST_DATABASE, DAILY_QUEST_POOL_IDS, WEEKLY_QUEST_POOL_IDS, 
    ACHIEVEMENTS_LIST, SHOP_ITEMS 
} from '../constants';
import { useGameStore } from '../store/gameStore';

type NotificationCallback = (title: string, message: string, rewards?: string[], type?: any, icon?: any) => void;

const getRandomQuests = (pool: string[], count: number): string[] => {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const getNextMonday = () => {
    const d = new Date();
    d.setHours(24, 0, 0, 0); 
    while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
    return d.getTime();
};

export const useQuestSystem = (
    _ignoredGameState: GameState, // kept for signature compatibility
    _ignoredSetGameState: any,
    triggerNotification: NotificationCallback,
    onLevelUp?: (newLevel: number) => void // NEW PROP
) => {
    
    // Access Store
    const setGameState = useGameStore(state => state.setGameState);
    const unlockAchievementStore = useGameStore(state => state.unlockAchievement);

    const refreshQuests = useCallback((force = false) => {
        const today = new Date().toDateString();
        // Get fresh state manually
        const prev = useGameStore.getState();
        
        let newState: Partial<GameState> = {};
        let updated = false;

        // Daily Reset
        const lastQuestReset = prev.lastQuestResetDate || prev.lastResetDate;
        if (lastQuestReset !== today || force) {
            console.log("⚔️ [Quest System] Shuffling Daily Quests...");
            const newDailyIds = ['daily_login', ...getRandomQuests(DAILY_QUEST_POOL_IDS, 4)];
            newState.activeDailyQuests = newDailyIds;
            
            const newProgress = { ...prev.questProgress };
            prev.activeDailyQuests.forEach(qid => delete newProgress[qid]); 
            
            newDailyIds.forEach(qid => {
                if (qid === 'daily_login') {
                    newProgress[qid] = { current: 1, claimed: false };
                } else {
                    newProgress[qid] = { current: 0, claimed: false };
                }
            });
            
            newState.lastQuestResetDate = today;
            newState.lastResetDate = today;
            newState.questProgress = newProgress;
            updated = true;
        }

        // Weekly Reset
        if (Date.now() > prev.nextWeeklyReset || force) {
            console.log("📅 [Quest System] Weekly Reset Triggered!");
            const newWeeklyIds = getRandomQuests(WEEKLY_QUEST_POOL_IDS, 3);
            newState.activeWeeklyQuests = newWeeklyIds;
            newState.nextWeeklyReset = getNextMonday();
            
            const progressRef = updated ? (newState.questProgress || {}) : { ...prev.questProgress };
            prev.activeWeeklyQuests.forEach(qid => delete progressRef[qid]);
            newWeeklyIds.forEach(qid => {
                progressRef[qid] = { current: 0, claimed: false };
            });

            newState.questProgress = progressRef;
            updated = true;
        }

        if (updated) setGameState(newState);
    }, [setGameState]);

    const trackQuestProgress = useCallback((type: QuestType, amount: number) => {
        const prev = useGameStore.getState();
        const newProgress = { ...prev.questProgress };
        const allActiveQuests = [...prev.activeDailyQuests, ...prev.activeWeeklyQuests];
        let hasUpdate = false;

        allActiveQuests.forEach(questId => {
            const quest = QUEST_DATABASE[questId];
            if (quest && quest.type === type) {
                const currentData = newProgress[questId] || { current: 0, claimed: false };
                if (!currentData.claimed && currentData.current < quest.target) {
                    const newCurrent = Math.min(quest.target, currentData.current + amount);
                    if (newCurrent !== currentData.current) {
                        newProgress[questId] = { current: newCurrent, claimed: false };
                        hasUpdate = true;
                    }
                }
            }
        });

        if (hasUpdate) setGameState({ questProgress: newProgress });
    }, [setGameState]);

    const updateQuestProgress = useCallback((type: QuestType, amount: number) => {
        setTimeout(() => trackQuestProgress(type, amount), 50);
    }, [trackQuestProgress]);

    const unlockAchievement = useCallback((id: string) => {
        const prev = useGameStore.getState();
        if (prev.achievements.includes(id)) return;
        
        const achievement = ACHIEVEMENTS_LIST.find(a => a.id === id);
        if (achievement) {
            triggerNotification('Achievement Unlocked!', achievement.title, [], 'achievement');
        }
        unlockAchievementStore(id);
    }, [unlockAchievementStore, triggerNotification]);

    const claimQuest = useCallback((questId: string) => {
        const quest = QUEST_DATABASE[questId];
        if (!quest) return;

        const prev = useGameStore.getState();
        const currentProgress = prev.questProgress[questId];
        if (!currentProgress || currentProgress.current < quest.target || currentProgress.claimed) {
            return;
        }

        let newGold = prev.gold + quest.rewardGold;
        let newExp = prev.currentExp + quest.rewardExp;
        let newLevel = prev.level;
        let newReqExp = prev.requiredExp;
        let newStatPoints = prev.stats.points;
        let newInventory = { ...prev.inventory };
        let newTotalGold = (prev.totalGoldEarned || prev.gold) + quest.rewardGold;

        if (quest.rewardItem) {
            newInventory[quest.rewardItem] = (newInventory[quest.rewardItem] || 0) + 1;
            const itemName = SHOP_ITEMS.find(i => i.id === quest.rewardItem)?.name || "Item";
            triggerNotification('Item Reward', `Received ${itemName}!`, [], 'success');
        }

        if (newExp >= newReqExp) {
            newLevel++; 
            newExp -= newReqExp; 
            newReqExp = Math.floor(newReqExp * 1.2);
            newStatPoints++; 
            
            // [MARCUS UPDATE]: Trigger Full Screen Modal if handler exists
            if (onLevelUp) {
                onLevelUp(newLevel);
            } else {
                triggerNotification('Level Up!', `Reached Level ${newLevel}! +1 Stat Point`, ['+Max Stats'], 'level-up');
            }
        }

        const newProgress = { ...prev.questProgress };
        newProgress[questId] = { ...currentProgress, claimed: true };

        triggerNotification('Quest Completed!', quest.title, [`+${quest.rewardGold} G`, `+${quest.rewardExp} XP`], 'success');

        setGameState({ 
            gold: Math.floor(newGold),
            totalGoldEarned: Math.floor(newTotalGold), 
            currentExp: Math.floor(newExp), 
            level: newLevel, 
            requiredExp: newReqExp, 
            questProgress: newProgress, 
            stats: { ...prev.stats, points: newStatPoints },
            inventory: newInventory
        });
    }, [setGameState, triggerNotification, onLevelUp]);

    return {
        refreshQuests,
        trackQuestProgress,
        updateQuestProgress,
        unlockAchievement,
        claimQuest
    };
};
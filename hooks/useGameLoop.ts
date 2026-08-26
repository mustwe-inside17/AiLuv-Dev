
import React, { useState, useEffect, useRef } from 'react';
import { GameState, TimeOfDay, ActiveEvent, CharacterId, LocationId, EventTemplate, Mood, UserProfile, MailItem } from '../types';
import { LOCATIONS, DAILY_QUEST_POOL_IDS, WEEKLY_QUEST_POOL_IDS, SECRET_MAIL_SCENARIOS, DAILY_NEWS_POOL } from '../constants'; // [MARCUS FIX] Added DAILY_NEWS_POOL
import { calculateEnergyRegen } from '../services/secureEconomy';
import { calculateDecayedChemistry } from '../utils/relationshipLogic';
import { generateDynamicEvent } from '../services/eventGenerator';
import { runDailyDirector } from '../services/directorSystem'; 
import { getRandomTheme } from '../constants/themes'; 
import { useGameStore } from '../store/gameStore';
import { checkAndDeliverDailyNews, checkAndDeliverSecretMail } from '../services/mailSystem';

export const useGameLoop = (
    _ignoredGameState: GameState, 
    _ignoredSetGameState: any,
    user: any,
    isDataLoaded: boolean,
    userProfile: UserProfile | null
) => {
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('night');
    const isGeneratingEventRef = useRef(false);
    
    const lastChemistryCheckRef = useRef<number>(Date.now());
    
    const setGameState = useGameStore(state => state.setGameState);
    const cleanExpiredBuffs = useGameStore(state => state.cleanExpiredBuffs);
    const addMail = useGameStore(state => state.addMail); 

    // --- 1. TIME OF DAY CLOCK & CHEMISTRY DECAY ---
    useEffect(() => {
        const updateLoop = () => {
            const now = Date.now();

            const hours = new Date().getHours();
            let time: TimeOfDay = 'day';
            if (hours >= 6 && hours < 11) time = 'morning';
            else if (hours >= 11 && hours < 16) time = 'day';
            else if (hours >= 16 && hours < 18) time = 'evening'; 
            else time = 'night'; 
            
            setTimeOfDay(time);

            if (time === 'night') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            const timeSinceLastDecay = now - lastChemistryCheckRef.current;
            
            // [MARCUS FIX]: Decay chemistry slowly (every 1 hour) and freeze decay during active Date
            if (timeSinceLastDecay >= 3600000) { 
                const hoursPassed = Math.floor(timeSinceLastDecay / 3600000);
                
                const currentState = useGameStore.getState();
                if (currentState.chemistryScores) {
                    const newChem = { ...currentState.chemistryScores };
                    let hasChanges = false;
                    
                    const currentLoc = LOCATIONS[currentState.currentLocation];
                    const activeDateCharId = currentState.currentDateScene && currentLoc ? currentLoc.characterId : null;

                    Object.keys(newChem).forEach(key => {
                        const charId = key as CharacterId;
                        // [MARCUS FIX]: Do NOT decay chemistry if player is currently on a Date with this character!
                        if (charId === activeDateCharId) return;

                        if (newChem[charId] > 0) {
                            const oldVal = newChem[charId];
                            newChem[charId] = calculateDecayedChemistry(oldVal, hoursPassed);
                            if (newChem[charId] !== oldVal) hasChanges = true;
                        }
                    });

                    if (hasChanges) {
                        setGameState({ chemistryScores: newChem });
                    }
                }
                
                lastChemistryCheckRef.current += (hoursPassed * 3600000);
            }
        };

        const timer = setInterval(updateLoop, 1000); 
        return () => clearInterval(timer);
    }, [setGameState]);

    // --- 2. ENERGY REGEN LOOP & DAILY/THEME RESET ---
    useEffect(() => {
        const updateEnergyAndDaily = () => {
            const current = useGameStore.getState();
            const now = new Date();
            const todayStr = now.toDateString();
            const currentHour = now.getHours();
            
            const updates = calculateEnergyRegen(current);
            let stateUpdates: Partial<GameState> = updates || {};

            // --- THEME ROTATION LOGIC (2x PER DAY: 06:00 & 18:00) ---
            const lastThemeUpdate = current.lastThemeUpdate || 0;
            
            const todayMorning = new Date(now);
            todayMorning.setHours(6, 0, 0, 0);
            
            const todayEvening = new Date(now);
            todayEvening.setHours(18, 0, 0, 0);

            let shouldUpdateThemes = false;

            if (now.getTime() >= todayMorning.getTime() && lastThemeUpdate < todayMorning.getTime()) {
                shouldUpdateThemes = true;
                console.log("🌅 [Theme System] Triggering Morning Theme Rotation...");
            }
            else if (now.getTime() >= todayEvening.getTime() && lastThemeUpdate < todayEvening.getTime()) {
                shouldUpdateThemes = true;
                console.log("🌙 [Theme System] Triggering Evening Theme Rotation...");
            }

            if (shouldUpdateThemes) {
                stateUpdates.dailyThemes = {
                    miguel: getRandomTheme('miguel', current.dailyThemes?.miguel),
                    fia: getRandomTheme('fia', current.dailyThemes?.fia),
                    peat: getRandomTheme('peat', current.dailyThemes?.peat),
                    erin: getRandomTheme('erin', current.dailyThemes?.erin),
                    marcus: getRandomTheme('marcus', current.dailyThemes?.marcus),
                    lucas: getRandomTheme('lucas', current.dailyThemes?.lucas),
                    bam: getRandomTheme('bam', current.dailyThemes?.bam),
                    jellie: getRandomTheme('jellie', current.dailyThemes?.jellie),
                    soul: getRandomTheme('soul', current.dailyThemes?.soul),
                    mia: getRandomTheme('mia', current.dailyThemes?.mia),
                };
                
                stateUpdates.activeRareVibes = {}; 
                stateUpdates.lastThemeUpdate = now.getTime();
            }

            // --- DAILY RESET LOGIC (QUESTS & DIRECTOR) - TRIGGERS AT 6 AM ONLY ---
            const lastWorldReset = current.lastWorldResetDate || current.lastResetDate;
            if (currentHour >= 6 && lastWorldReset !== todayStr) {
                console.log("📅 [Daily Reset] Triggering New Day Sequence...");

                // 1. THE DIRECTOR EXECUTION
                console.log("🎬 [The Director] Running Daily Script...");
                const directorUpdates = runDailyDirector(current.memories);
                if (directorUpdates) {
                    stateUpdates.memories = directorUpdates;
                }
                
                stateUpdates.unreadSocialPosts = 4;

                // Deliver fresh daily newspaper with notification
                setTimeout(() => {
                    checkAndDeliverDailyNews();
                    // 25% Chance for Secret Mail on daily reset
                    if (Math.random() < 0.25) {
                        checkAndDeliverSecretMail();
                    }
                }, 500);

                stateUpdates.lastWorldResetDate = todayStr;
                stateUpdates.lastResetDate = todayStr;
            }

            if (Object.keys(stateUpdates).length > 0) {
                setGameState(stateUpdates);
            }
        };
        
        const interval = setInterval(updateEnergyAndDaily, 1000);

        // Periodic check for Daily News & Story Mails every 60 minutes of gameplay
        const mailDispatcherInterval = setInterval(() => {
            checkAndDeliverDailyNews();
            // 20% chance to roll an intriguing secret story mail during exploration
            if (Math.random() < 0.20) {
                checkAndDeliverSecretMail();
            }
        }, 3600000);
        
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                updateEnergyAndDaily();
                checkAndDeliverDailyNews();
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        
        return () => {
            clearInterval(interval);
            clearInterval(mailDispatcherInterval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [setGameState, addMail]);

    // --- 3. BUFF, DRUNK & VIP EXPIRATION LOOP ---
    useEffect(() => {
        const interval = setInterval(() => {
            cleanExpiredBuffs();
            
            const currentState = useGameStore.getState();
            const now = Date.now();
            
            let stateUpdates: Partial<GameState> = {};
            let hasChange = false;

            // VIP Expiration
            if (currentState.isVip && currentState.vipExpiry && now > currentState.vipExpiry) {
                console.log("👑 [VIP] Status expired.");
                stateUpdates.isVip = false;
                stateUpdates.vipExpiry = undefined;
                hasChange = true;
            }

            if (currentState.drunkTimers) {
                const newDrunkTimers = { ...currentState.drunkTimers };
                const newMoods = { ...currentState.currentMoods };
                let drunkChanged = false;

                Object.keys(newDrunkTimers).forEach(key => {
                    const charId = key as CharacterId;
                    const expiresAt = newDrunkTimers[charId];
                    if (expiresAt > 0 && now > expiresAt) {
                        console.log(`🍺 [Effect] Drunk mode expired for ${charId}`);
                        newDrunkTimers[charId] = 0;
                        if (newMoods[charId] === Mood.DRUNK) {
                            newMoods[charId] = Mood.NEUTRAL;
                        }
                        drunkChanged = true;
                    }
                });

                if (drunkChanged) {
                    stateUpdates.drunkTimers = newDrunkTimers;
                    stateUpdates.currentMoods = newMoods;
                    hasChange = true;
                }
            }

            if (hasChange) {
                setGameState(stateUpdates);
            }

        }, 1000);
        return () => clearInterval(interval);
    }, [cleanExpiredBuffs, setGameState]);

    // --- 4. ACTIVE EVENT DIRECTOR (DYNAMIC ONLY) ---
    useEffect(() => {
        if (!user || !isDataLoaded) return;
        
        const triggerInterval = setInterval(async () => {
            const currentState = useGameStore.getState();
            const now = Date.now();
            
            if (currentState.activeEvent && now > currentState.activeEvent.expiresAt) {
                console.log("🎬 [Director] Event expired. Clearing.");
                setGameState({ activeEvent: null });
                return;
            }

            if (currentState.activeEvent) {
                return; 
            }
            if (isGeneratingEventRef.current) return;
            
            const shouldTrigger = Math.random() < 0.30; 
            if (!shouldTrigger) return;

            console.log("🎬 [Director] Attempting Dynamic Event Trigger...");

            const existingTemplates = currentState.customEventTemplates || [];
            const currentLoc = LOCATIONS[currentState.currentLocation] || LOCATIONS['home'];
            const hour = new Date().getHours();

            const potentialChars = currentState.metCharacters.filter(id => {
                if (currentLoc.characterId === id) return false;
                
                if (currentState.metCharacters.length > 2) {
                    if (id === currentState.lastEventCharacterId) return false;
                }
                
                const lastRun = currentState.characterEventCooldowns?.[id] || 0;
                if (now < lastRun) {
                    return false;
                }

                if (id === 'erin' && (hour >= 4 && hour < 21)) return false; 
                if (id === 'lucas' && (hour >= 6 && hour < 18)) return false; 
                return true;
            });

            if (potentialChars.length === 0) {
                return;
            }

            if (potentialChars.length > 0) {
                const targetCharId = potentialChars[Math.floor(Math.random() * potentialChars.length)] as CharacterId;
                const targetTier = currentState.relationshipTiers[targetCharId];
                
                console.log(`🎬 [Director] Selected candidate: ${targetCharId}`);
                isGeneratingEventRef.current = true;
                
                try {
                    const newTemplate = await generateDynamicEvent(
                        targetCharId, 
                        hour, 
                        targetTier, 
                        existingTemplates, 
                        userProfile?.name || 'User',
                        userProfile?.gender || 'other',
                        currentState.unlockedSecrets, 
                        currentState.currentChapter 
                    );
                    
                    if (newTemplate) {
                        setGameState({
                            customEventTemplates: [...(currentState.customEventTemplates || []), newTemplate], 
                            activeEvent: {
                                id: Date.now().toString(),
                                templateId: newTemplate.templateId,
                                characterId: newTemplate.characterId as CharacterId,
                                locationId: newTemplate.locationId as LocationId,
                                title: newTemplate.title,
                                message: newTemplate.message,
                                aiContext: newTemplate.aiContext,
                                expiresAt: Date.now() + 15 * 60 * 1000,
                                rewards: newTemplate.rewards 
                            },
                            lastEventCharacterId: newTemplate.characterId as CharacterId,
                            templateCooldowns: { ...currentState.templateCooldowns, [newTemplate.templateId]: now },
                            characterEventCooldowns: { 
                                ...currentState.characterEventCooldowns, 
                                [targetCharId]: now + (2 * 60 * 60 * 1000) 
                            }
                        });
                        console.log(`🎬 [Director] Event Created: ${newTemplate.title}`);
                    }
                } catch (e) {
                    console.error("🎬 [Director] AI Director Failed (Skip)", e);
                } finally {
                    isGeneratingEventRef.current = false;
                }
            }

        }, 60000); 
        return () => clearInterval(triggerInterval);
    }, [user, isDataLoaded, setGameState, userProfile]);

    return { timeOfDay };
};


import { useState, useEffect, useRef, useCallback } from 'react';
import { 
    auth, onAuthStateChanged, loadGameDataWithRetry, saveGameData, loadMessages, 
    saveMessages, registerSession, monitorUserSession, signOut, User 
} from '../services/firebase';
import { UserProfile, Message, CharacterId, RelationshipTier } from '../types';
import { 
    INITIAL_GAME_STATE, DAILY_QUEST_POOL_IDS, WEEKLY_QUEST_POOL_IDS, 
    INITIAL_STATS, LOCATIONS, getRandomTheme 
} from '../constants';
import { getCharacterMoodOnArrival } from '../constants/characters';
import { calculateDecayedChemistry } from '../utils/relationshipLogic';
import { useGameStore } from '../store/gameStore';
import { checkAndDeliverStarterMails, checkAndDeliverDailyNews } from '../services/mailSystem';
import { migrateQuestMessages } from '../domain/quests/questState';

export const useCloudSync = () => {
    // --- AUTH & USER STATE ---
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // --- GAME STATE (VIA STORE) ---
    const replaceGameState = useGameStore(state => state.replaceGameState);

    const [messagesMap, setMessagesMap] = useState<Record<CharacterId, Message[]>>({ miguel: [], fia: [], peat: [], erin: [], marcus: [], lucas: [], bam: [], jellie: [], soul: [], mia: [] });

    // --- SECURITY & SYNC STATE ---
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isCloudSyncing, setIsCloudSyncing] = useState(false);
    
    // ERROR STATES
    const [connectionError, setConnectionError] = useState<string | null>(null); 
    const [showNoSaveModal, setShowNoSaveModal] = useState(false); 
    const [isDuplicateLogin, setIsDuplicateLogin] = useState(false);
    
    // Refs
    const initLockRef = useRef(false);
    const localSessionId = useRef<string>("");
    const sessionUnsubscribeRef = useRef<(() => void) | null>(null); 
    
    // [MARCUS FIX]: Dirty Flag for Interval Saving
    const isDirtyRef = useRef(false);

    // --- HELPER: START NEW GAME ---
    const startNewGame = async () => {
        if (!user) return;
        
        console.log("✨ Starting New Game Sequence...");

        const getRandomQuests = (pool: string[], count: number) => {
            return [...pool].sort(() => 0.5 - Math.random()).slice(0, count);
        };

        const getNextMonday = () => {
            const d = new Date();
            d.setHours(24, 0, 0, 0);
            while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
            return d.getTime();
        };

        const initialQuestProgress = { 'daily_login': { current: 1, claimed: false } };
        const currentHour = new Date().getHours();

        const newState = {
            ...INITIAL_GAME_STATE,
            activeDailyQuests: ['daily_login', ...getRandomQuests(DAILY_QUEST_POOL_IDS, 4)],
            activeWeeklyQuests: getRandomQuests(WEEKLY_QUEST_POOL_IDS, 3),
            nextWeeklyReset: getNextMonday(),
            metCharacters: ['miguel'] as CharacterId[],
            currentMoods: { 
                miguel: getCharacterMoodOnArrival('miguel', 0, currentHour),
                fia: getCharacterMoodOnArrival('fia', 0, currentHour),
                peat: getCharacterMoodOnArrival('peat', 0, currentHour),
                erin: getCharacterMoodOnArrival('erin', 0, currentHour),
                marcus: getCharacterMoodOnArrival('marcus', 0, currentHour),
                lucas: getCharacterMoodOnArrival('lucas', 0, currentHour),
                bam: getCharacterMoodOnArrival('bam', 0, currentHour),
                jellie: getCharacterMoodOnArrival('jellie', 0, currentHour),
                soul: getCharacterMoodOnArrival('soul', 0, currentHour),
                mia: getCharacterMoodOnArrival('mia', 0, currentHour)
            },
            questProgress: initialQuestProgress,
            lastEnergyUpdate: Date.now()
        };

        replaceGameState(newState);
        setMessagesMap({ miguel: [], fia: [], peat: [], erin: [], marcus: [], lucas: [], bam: [], jellie: [], soul: [], mia: [] });

        // Session Setup: Register Only (Monitor handled by useEffect)
        const newSessionId = Date.now().toString() + Math.random().toString().slice(2, 6);
        localSessionId.current = newSessionId;
        
        registerSession(user.uid, newSessionId).catch(console.warn);
        
        // [MARCUS FIX]: Deliver Starter Mails & Today's Daily News
        setTimeout(() => {
            checkAndDeliverStarterMails();
            checkAndDeliverDailyNews();
        }, 600);

        setConnectionError(null);
        setShowNoSaveModal(false);
        setIsDataLoaded(true);
        setIsLoadingProfile(false);
        setIsCloudSyncing(false);
    };

    // --- CORE: DATA LOADING LOGIC ---
    const initCloudData = useCallback(async () => {
        if (!user) return;
        
        console.log("🚀 Initializing Cloud Data...");
        setIsCloudSyncing(true);
        setConnectionError(null); 
        
        const newSessionId = Date.now().toString() + Math.random().toString().slice(2, 6);
        localSessionId.current = newSessionId;

        loadMessages(user.uid).then(msgs => {
            if (msgs) {
                const migrated = Object.fromEntries(Object.entries(msgs).map(([charId, messages]) => [charId, migrateQuestMessages(messages as Message[])])) as Record<CharacterId, Message[]>;
                setMessagesMap(prev => ({ ...prev, ...migrated }));
            }
        });

        const result = await loadGameDataWithRetry(user.uid);

        if (result.status === 'SUCCESS') {
            const { gameState: gs, userProfile: up } = result.data;
            
            // Sanitization & Migration Logic
            if (!gs.relationshipTiers) gs.relationshipTiers = INITIAL_GAME_STATE.relationshipTiers;
            if (!gs.loveScores) gs.loveScores = INITIAL_GAME_STATE.loveScores;
            if (!gs.currentMoods) gs.currentMoods = INITIAL_GAME_STATE.currentMoods;
            if (!gs.comboStreaks) gs.comboStreaks = INITIAL_GAME_STATE.comboStreaks;
            if (!gs.memories) gs.memories = INITIAL_GAME_STATE.memories;
            if (!gs.roomKeys) gs.roomKeys = [];
            if (!gs.inventory) gs.inventory = {};
            if (!gs.achievements) gs.achievements = [];
            if (!gs.unlockedSecrets) gs.unlockedSecrets = [];
            if (!gs.unlockedTracks) gs.unlockedTracks = ['track_1'];
            if (!gs.metCharacters) gs.metCharacters = [];
            if (!gs.stats) gs.stats = INITIAL_STATS;
            if (!gs.unlockedSkills) gs.unlockedSkills = [];
            if (!gs.activeBuffs) gs.activeBuffs = [];
            gs.activeEvent = null; 

            // [MARCUS FIX]: Theme Migration
            if (!gs.dailyThemes) gs.dailyThemes = { ...INITIAL_GAME_STATE.dailyThemes };

            if (gs.tutorialStep === 'intro' || gs.tutorialStep === 'chat_guide') {
                console.log("↺ Resetting stuck tutorial to Intro...");
                gs.tutorialStep = 'intro';
                setMessagesMap(prev => ({ ...prev, miguel: [] }));
            }

            const defaultChars: CharacterId[] = ['miguel', 'fia', 'peat', 'erin', 'marcus', 'lucas', 'bam', 'jellie', 'soul', 'mia'];
            const currentHour = new Date().getHours(); 

            defaultChars.forEach(char => {
                if (gs.loveScores[char] === undefined) gs.loveScores[char] = 0;
                if (!gs.relationshipTiers[char]) gs.relationshipTiers[char] = RelationshipTier.STRANGER;
                if (gs.comboStreaks[char] === undefined) gs.comboStreaks[char] = 0;
                
                // [MARCUS FIX]: Patch missing daily themes if they are undefined or empty string
                if (!gs.dailyThemes[char]) {
                    gs.dailyThemes[char] = getRandomTheme(char);
                }

                if (gs.memories[char]) {
                    if (gs.memories[char].length > 0 && typeof gs.memories[char][0] === 'string') {
                        gs.memories[char] = (gs.memories[char] as any as string[]).map(txt => ({
                            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                            text: txt,
                            tier: 'core',
                            timestamp: Date.now(),
                            lastAccess: Date.now(),
                            importance: 10
                        }));
                    }
                } else {
                    gs.memories[char] = [];
                }
                
                const chem = gs.chemistryScores?.[char] || 0;
                gs.currentMoods[char] = getCharacterMoodOnArrival(char, chem, currentHour);
            });

            if (!gs.activeDailyQuests || gs.activeDailyQuests.length === 0) {
                gs.activeDailyQuests = ['daily_login']; 
            }

            const lastActiveTime = gs.lastEnergyUpdate || Date.now();
            const currentTime = Date.now();
            const hoursOffline = Math.floor((currentTime - lastActiveTime) / 3600000);

            if (hoursOffline > 0 && gs.chemistryScores) {
                const decayedChemistry = { ...gs.chemistryScores };
                const loc = LOCATIONS[gs.currentLocation];
                const activeDateCharId = gs.currentDateScene && loc ? loc.characterId : null;

                Object.keys(decayedChemistry).forEach(k => {
                    const key = k as CharacterId;
                    if (key === activeDateCharId) return; // Do not decay active date partner

                    if (decayedChemistry[key] > 0) {
                        decayedChemistry[key] = calculateDecayedChemistry(decayedChemistry[key], hoursOffline);
                    }
                });
                gs.chemistryScores = decayedChemistry;
            }
            
            replaceGameState({ ...INITIAL_GAME_STATE, ...gs });
            setUserProfile(up);

            registerSession(user.uid, newSessionId).catch(e => console.warn("Session Reg Warning:", e));

            // [MARCUS FIX]: Deliver Starter Mails & Today's Daily News
            setTimeout(() => {
                checkAndDeliverStarterMails();
                checkAndDeliverDailyNews();
            }, 600);

            setIsCloudSyncing(false);
            setIsLoadingProfile(false);
            setIsDataLoaded(true);

        } else if (result.status === 'NOT_FOUND') {
            const creationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : 0;
            const now = Date.now();
            if ((now - creationTime) < 5 * 60 * 1000) {
                await startNewGame();
            } else {
                setConnectionError("CRITICAL_DATA_MISSING");
                setIsLoadingProfile(false);
                setIsCloudSyncing(false);
            }
        } else {
            setConnectionError("CONNECTION_FAILED");
            setIsLoadingProfile(false);
            setIsCloudSyncing(false);
        }
    }, [user, replaceGameState]);

    // --- AUTH LISTENER ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setIsLoadingProfile(true);
            } else {
                if (sessionUnsubscribeRef.current) {
                    sessionUnsubscribeRef.current();
                    sessionUnsubscribeRef.current = null;
                }
                setUserProfile(null);
                replaceGameState(INITIAL_GAME_STATE); 
                setMessagesMap({ miguel: [], fia: [], peat: [], erin: [], marcus: [], lucas: [], bam: [], jellie: [], soul: [], mia: [] });
                setIsLoadingProfile(false);
                setIsDataLoaded(false);
                setConnectionError(null);
                setShowNoSaveModal(false);
                setIsDuplicateLogin(false);
                localSessionId.current = "";
                initLockRef.current = false;
            }
            setAuthLoading(false);
        });
        return () => {
            unsubscribe();
            if (sessionUnsubscribeRef.current) sessionUnsubscribeRef.current();
        };
    }, [replaceGameState]);

    useEffect(() => {
        if (!user) return;
        if (initLockRef.current) return;
        initLockRef.current = true; 
        initCloudData();
    }, [user, initCloudData]);

    // --- SESSION MONITOR ---
    useEffect(() => {
        if (!user || !isDataLoaded) return;

        if (sessionUnsubscribeRef.current) {
            sessionUnsubscribeRef.current();
        }

        sessionUnsubscribeRef.current = monitorUserSession(user.uid, (remoteSessionId) => {
            if (remoteSessionId && remoteSessionId !== localSessionId.current) {
                console.warn(`🚨 [Session] Duplicate Login! Remote: ${remoteSessionId} vs Local: ${localSessionId.current}`);
                setIsDuplicateLogin(true);
            }
        });

        return () => {
            if (sessionUnsubscribeRef.current) {
                sessionUnsubscribeRef.current();
                sessionUnsubscribeRef.current = null;
            }
        };
    }, [user, isDataLoaded]);

    // --- [MARCUS FIX]: ROBUST SAVING SYSTEM ---
    
    // 1. Mark Dirty on Change
    useEffect(() => {
        if (!isDataLoaded) return;
        isDirtyRef.current = true;
        const unsubscribe = useGameStore.subscribe(() => {
            isDirtyRef.current = true;
        });
        return unsubscribe;
    }, [isDataLoaded]);

    useEffect(() => {
        if (isDataLoaded) isDirtyRef.current = true;
    }, [userProfile, isDataLoaded]);

    // Core Save Function
    const triggerSave = useCallback(async () => {
        if (!user || !isDataLoaded) return;
        
        setIsCloudSyncing(true);
        // Reset dirty flag optimistically. 
        isDirtyRef.current = false; 
        
        try {
            const currentData = useGameStore.getState(); // Get fresh state
            await saveGameData(user.uid, currentData, userProfile);
            // console.log("💾 [CloudSync] Save successful");
        } catch(e) {
            console.error("❌ [CloudSync] Save Failed", e);
            isDirtyRef.current = true; // Retry later
        } finally {
            setIsCloudSyncing(false);
        }
    }, [user, isDataLoaded, userProfile]);

    // 2. Periodic Save Loop (Background Heartbeat)
    // [MARCUS OPTIMIZATION]: Increased interval from 5s to 30s to reduce Firestore writes (Cost Saving)
    useEffect(() => {
        if (!user || !isDataLoaded) return;
        
        const saveInterval = setInterval(async () => {
            if (isDirtyRef.current && !isCloudSyncing) {
                await triggerSave();
            }
        }, 30000); // Check every 30 seconds (previously 5s)

        return () => clearInterval(saveInterval);
    }, [triggerSave, isCloudSyncing, user, isDataLoaded]);

    // 3. [MARCUS CRITICAL FIX]: AGGRESSIVE SAVE ON EXIT / BACKGROUND
    useEffect(() => {
        const handleVisibilityChange = () => {
            // FORCE SAVE when hidden (switching apps, closing tab, turning off screen)
            // We ignore 'isDirty' here to be absolutely safe.
            if (document.visibilityState === 'hidden' && user && isDataLoaded) {
                console.log("🙈 [CloudSync] App hidden. FORCING EMERGENCY SAVE...");
                const currentData = useGameStore.getState();
                saveGameData(user.uid, currentData, userProfile).catch(console.warn);
                isDirtyRef.current = false;
            }
        };

        const handlePageHide = () => {
            if (user && isDataLoaded) {
                console.log("🛑 [CloudSync] Page Hide. FORCING EMERGENCY SAVE...");
                const currentData = useGameStore.getState();
                // Async save in pagehide is best-effort but critical for mobile Safari
                saveGameData(user.uid, currentData, userProfile).catch(console.warn);
                isDirtyRef.current = false;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pagehide', handlePageHide); 

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pagehide', handlePageHide);
        };
    }, [user, userProfile, isDataLoaded]);

    // 4. Message Save (Separate Debounce)
    useEffect(() => {
        if (!user || !isDataLoaded) return;
        const timer = setTimeout(() => {
            setIsCloudSyncing(true);
            saveMessages(user.uid, messagesMap)
                .then(() => setIsCloudSyncing(false))
                .catch(err => console.error("Autosave Messages Failed:", err));
        }, 2000);
        return () => clearTimeout(timer);
    }, [messagesMap, user, isDataLoaded]);

    const handleLogout = async () => {
        if (user && isDataLoaded) {
            console.log("💾 [Logout] Forcing final save...");
            const currentData = useGameStore.getState();
            try {
                await saveGameData(user.uid, currentData, userProfile);
            } catch (e) {
                console.error("Logout Save Failed:", e);
            }
        }
        await signOut(auth);
    };

    const handleUpdateProfile = (newProfile: UserProfile) => {
        setUserProfile(newProfile);
    };

    const manualRetry = () => {
        setIsLoadingProfile(true); 
        initCloudData(); 
    };

    return {
        user,
        authLoading,
        isLoadingProfile,
        userProfile,
        setUserProfile, 
        handleUpdateProfile, 
        setGameState: useGameStore.getState().setGameState, 
        messagesMap,
        setMessagesMap,
        isDataLoaded,
        isCloudSyncing,
        showNoSaveModal: connectionError !== null,
        connectionErrorType: connectionError,
        isDuplicateLogin,
        handleLogout,
        manualRetry
    };
};

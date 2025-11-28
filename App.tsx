
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from './components/StatusBar';
import { CharacterView } from './components/CharacterView';
import { ChatInterface } from './components/ChatInterface';
import { Navigation } from './components/Navigation';
import { PlayerStats } from './components/PlayerStats';
import { DailyQuests } from './components/DailyQuests';
import { RelationshipStats } from './components/RelationshipStats';
import { Onboarding } from './components/Onboarding';
import { NotificationToast } from './components/NotificationToast';
import { MapGrid } from './components/MapGrid';
import { generateResponse } from './services/mockAi';
import { saveGameData, loadGameData, saveMessages, loadMessages } from './services/firebase';
import { AppView, GameState, Message, Mood, UserProfile, ActionType, ActionEvent, ActiveTask, Job, ShopItem, Workout, QuestType, AppNotification, LocationId, CharacterId, RelationshipTier } from './types';
import { INITIAL_ENERGY, INITIAL_LOVE, MAX_LOVE, STORAGE_KEY_GAME_STATE, STORAGE_KEY_MESSAGES, STORAGE_KEY_LAST_SAVE, STORAGE_KEY_USER_PROFILE, INITIAL_GOLD, INITIAL_MAX_ENERGY, DAILY_QUESTS, INITIAL_REQUIRED_EXP, EXP_PER_MESSAGE, TRAVEL_COST, LOCATIONS, TIER_THRESHOLDS } from './constants';
import { Briefcase, Dumbbell, Cookie, MessageCircle, Cloud, CloudOff, MapPin, Zap, Heart, Lock } from 'lucide-react';

const App: React.FC = () => {
  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>('map');
  const [locationMode, setLocationMode] = useState<'chat' | 'action'>('chat');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [isTraveling, setIsTraveling] = useState(false);
  const [travelTarget, setTravelTarget] = useState<LocationId | null>(null);

  // Game State
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_GAME_STATE);
    const parsed = saved ? JSON.parse(saved) : null;
    
    if (parsed) {
      // Data Migration
      let loveScores = parsed.loveScores || { miguel: parsed.loveScore || INITIAL_LOVE, fia: 0 };
      if (loveScores.ploy !== undefined) { loveScores.fia = loveScores.ploy; delete loveScores.ploy; }
      
      let currentMoods = parsed.currentMoods || { miguel: parsed.currentMood || Mood.NEUTRAL, fia: Mood.NEUTRAL };
      if (currentMoods.ploy !== undefined) { currentMoods.fia = currentMoods.ploy; delete currentMoods.ploy; }

      // New: Relationship Tiers Migration
      let tiers = parsed.relationshipTiers || { miguel: RelationshipTier.ACQUAINTANCE, fia: RelationshipTier.ACQUAINTANCE };

      return {
        ...parsed,
        gold: parsed.gold ?? INITIAL_GOLD,
        maxEnergy: parsed.maxEnergy ?? INITIAL_MAX_ENERGY,
        activeTask: parsed.activeTask ?? null,
        currentExp: parsed.currentExp ?? 0,
        requiredExp: parsed.requiredExp ?? INITIAL_REQUIRED_EXP,
        lastResetDate: parsed.lastResetDate ?? new Date().toDateString(),
        questProgress: parsed.questProgress ?? {},
        loveScores: loveScores,
        currentMoods: currentMoods,
        relationshipTiers: tiers, // Ensure this exists
        currentLocation: parsed.currentLocation ?? 'condo',
        hasTrainedVisit: parsed.hasTrainedVisit ?? false
      };
    } else {
      return {
        energy: INITIAL_ENERGY,
        loveScores: { miguel: INITIAL_LOVE, fia: 0 },
        relationshipTiers: { miguel: RelationshipTier.ACQUAINTANCE, fia: RelationshipTier.ACQUAINTANCE },
        currentMoods: { miguel: Mood.NEUTRAL, fia: Mood.NEUTRAL },
        currentLocation: 'condo',
        isGameOver: false,
        level: 1,
        messagesSent: 0,
        gold: INITIAL_GOLD,
        maxEnergy: INITIAL_MAX_ENERGY,
        activeTask: null,
        currentExp: 0,
        requiredExp: INITIAL_REQUIRED_EXP,
        lastResetDate: new Date().toDateString(),
        questProgress: {},
        hasTrainedVisit: false
      };
    }
  });

  const [messagesMap, setMessagesMap] = useState<Record<CharacterId, Message[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
    const parsed = saved ? JSON.parse(saved) : {};
    if (parsed.ploy) { parsed.fia = parsed.ploy; delete parsed.ploy; }
    if (Array.isArray(parsed)) { return { miguel: parsed, fia: [] }; }
    return { miguel: parsed.miguel || [], fia: parsed.fia || [] };
  });
  
  const [isTyping, setIsTyping] = useState(false);
  const [lastAction, setLastAction] = useState<ActionEvent | null>(null);

  // --- SYNC LOGIC ---
  useEffect(() => {
    const initCloudData = async () => {
      setIsCloudSyncing(true);
      const cloudData = await loadGameData();
      if (cloudData) {
        if (cloudData.gameState) {
           // Ensure migration for loaded cloud data too
           const gs = cloudData.gameState;
           if (!gs.relationshipTiers) {
             gs.relationshipTiers = { miguel: RelationshipTier.ACQUAINTANCE, fia: RelationshipTier.ACQUAINTANCE };
           }
           setGameState(prev => ({ ...prev, ...gs }));
        }
        if (cloudData.userProfile) {
           setUserProfile(cloudData.userProfile);
        }
        triggerNotification('Cloud Sync', 'Game loaded from server.', [], 'info', <Cloud size={20} />);
      }
      const cloudMessages = await loadMessages();
      if (cloudMessages) { setMessagesMap(cloudMessages); }
      setIsCloudSyncing(false);
    };
    initCloudData();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GAME_STATE, JSON.stringify(gameState));
    localStorage.setItem(STORAGE_KEY_LAST_SAVE, Date.now().toString());
    const timer = setTimeout(() => {
      if (userProfile) {
        setIsCloudSyncing(true);
        saveGameData(gameState, userProfile).then(() => setIsCloudSyncing(false));
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [gameState, userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messagesMap));
    const timer = setTimeout(() => {
       setIsCloudSyncing(true);
       saveMessages(messagesMap).then(() => setIsCloudSyncing(false));
    }, 2000);
    return () => clearTimeout(timer);
  }, [messagesMap]);

  // --- GENERAL GAME LOGIC ---
  useEffect(() => {
    const today = new Date().toDateString();
    if (gameState.lastResetDate !== today) {
      setGameState(prev => ({ ...prev, lastResetDate: today, questProgress: {} }));
    } else {
      trackQuestProgress('login', 1);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.energy < prev.maxEnergy) {
          return { ...prev, energy: prev.energy + 1 };
        }
        return prev;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!gameState.activeTask) return;
    const interval = setInterval(() => {
      if (Date.now() >= gameState.activeTask!.endTime) {
        completeTask();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState.activeTask]);

  const triggerNotification = (title: string, message: string, rewards?: string[], type: 'success' | 'level-up' | 'info' | 'error' = 'success', icon?: React.ReactNode) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, title, message, rewards, type, icon }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const trackQuestProgress = (type: QuestType, amount: number) => {
    setGameState(prev => {
      const newProgress = { ...prev.questProgress };
      DAILY_QUESTS.filter(q => q.type === type).forEach(quest => {
        const current = newProgress[quest.id]?.current || 0;
        if (!newProgress[quest.id]?.claimed) {
           newProgress[quest.id] = { current: Math.min(quest.target, current + amount), claimed: false };
        }
      });
      return { ...prev, questProgress: newProgress };
    });
  };

  const handleClaimQuest = (questId: string) => {
    const quest = DAILY_QUESTS.find(q => q.id === questId);
    if (!quest) return;
    setGameState(prev => {
      let newGold = prev.gold + quest.rewardGold;
      let newExp = prev.currentExp + quest.rewardExp;
      let newLevel = prev.level;
      let newReqExp = prev.requiredExp;
      if (newExp >= newReqExp) {
        newLevel++; newExp -= newReqExp; newReqExp = Math.floor(newReqExp * 1.2);
        triggerNotification('Level Up!', `You reached Level ${newLevel}!`, ['+Max Stats'], 'level-up');
      }
      const newProgress = { ...prev.questProgress };
      if (newProgress[questId]) newProgress[questId] = { ...newProgress[questId], claimed: true };
      triggerNotification('Quest Completed!', quest.title, [`+${quest.rewardGold} G`, `+${quest.rewardExp} XP`], 'success');
      return { ...prev, gold: newGold, currentExp: newExp, level: newLevel, requiredExp: newReqExp, questProgress: newProgress };
    });
  };

  const completeTask = () => {
    setGameState(prev => {
      if (!prev.activeTask) return prev;
      let newGold = prev.gold;
      let newMaxEnergy = prev.maxEnergy;
      let isTrained = prev.hasTrainedVisit;
      if (prev.activeTask.type === 'work') {
        newGold += prev.activeTask.rewardValue;
        triggerNotification('Work Complete!', 'Great hustle!', [`+${prev.activeTask.rewardValue} Gold`], 'success', <Briefcase size={20} />);
      } else if (prev.activeTask.type === 'gym') {
        newMaxEnergy += prev.activeTask.rewardValue;
        isTrained = true;
        triggerNotification('Workout Finished!', 'You feel stronger!', [`+${prev.activeTask.rewardValue} Max Energy`], 'success', <Dumbbell size={20} />);
      }
      const newProgress = { ...prev.questProgress };
      const qType: QuestType = prev.activeTask.type === 'work' ? 'work' : 'gym';
      DAILY_QUESTS.filter(q => q.type === qType).forEach(quest => {
        const current = newProgress[quest.id]?.current || 0;
         if (!newProgress[quest.id]?.claimed) {
            newProgress[quest.id] = { current: Math.min(quest.target, current + 1), claimed: false };
         }
      });
      return { ...prev, gold: newGold, maxEnergy: newMaxEnergy, activeTask: null, questProgress: newProgress, hasTrainedVisit: isTrained };
    });
  };

  const handleStartTask = (taskType: 'work' | 'gym', item: Job | Workout) => {
    if (gameState.activeTask) return;
    if (gameState.energy < item.energyCost) return;
    const newTask: ActiveTask = {
      type: taskType, id: item.id, name: item.name, startTime: Date.now(), endTime: Date.now() + item.durationSeconds * 1000, rewardValue: taskType === 'work' ? (item as Job).goldReward : (item as Workout).maxEnergyGain
    };
    setGameState(prev => ({ ...prev, energy: prev.energy - item.energyCost, activeTask: newTask }));
  };

  const handleBuyItem = (item: ShopItem) => {
    if (gameState.gold < item.cost) return;
    
    // Check if it's an UNLOCK Item
    if (item.unlocksTier) {
      // Find which character to unlock (assume we are "thinking" about a specific char, 
      // but for simplicity, let's say these items unlock for BOTH or the one you are viewing contextually?
      // Better: In the Shop view, maybe we select who to gift? 
      // For now: Global Unlock check. Let's assume it applies to the character we are 'closest' to capping or just apply to both if applicable? 
      // User Logic: Usually you buy a gift FOR someone.
      // Let's implement a simple modal later, but for now, let's assume we are buying it for Miguel (default) or Fia if we are at Gym?
      // Actually, let's make it smarter: Unlock for the character whose location we are at OR if at Cafe, maybe ask?
      // SIMPLIFICATION: buying the item puts it in inventory? No, instant effect for this prototype.
      // Let's apply it to the character whose relationship is stuck at that cap.
      
      setGameState(prev => {
        let newGold = prev.gold - item.cost;
        let newTiers = { ...prev.relationshipTiers };
        let upgraded = false;
        
        // Check Miguel
        if (item.unlocksTier === RelationshipTier.FLIRTING && prev.relationshipTiers.miguel === RelationshipTier.FRIEND && prev.loveScores.miguel >= TIER_THRESHOLDS[RelationshipTier.FRIEND]) {
             newTiers.miguel = RelationshipTier.FLIRTING;
             upgraded = true;
             triggerNotification("Level Up!", "Miguel is now Flirting with you!", [], 'success', <Heart size={20} />);
        } else if (item.unlocksTier === RelationshipTier.PARTNER && prev.relationshipTiers.miguel === RelationshipTier.FLIRTING && prev.loveScores.miguel >= TIER_THRESHOLDS[RelationshipTier.FLIRTING]) {
             newTiers.miguel = RelationshipTier.PARTNER;
             upgraded = true;
             triggerNotification("Congratulations!", "Miguel is now your Partner!", [], 'success', <Heart size={20} />);
        }
        
        // Check Fia (Duplicate logic for now)
        if (item.unlocksTier === RelationshipTier.FLIRTING && prev.relationshipTiers.fia === RelationshipTier.FRIEND && prev.loveScores.fia >= TIER_THRESHOLDS[RelationshipTier.FRIEND]) {
             newTiers.fia = RelationshipTier.FLIRTING;
             upgraded = true;
             triggerNotification("Level Up!", "Fia is interested in you!", [], 'success', <Heart size={20} />);
        } else if (item.unlocksTier === RelationshipTier.PARTNER && prev.relationshipTiers.fia === RelationshipTier.FLIRTING && prev.loveScores.fia >= TIER_THRESHOLDS[RelationshipTier.FLIRTING]) {
             newTiers.fia = RelationshipTier.PARTNER;
             upgraded = true;
             triggerNotification("Congratulations!", "Fia is now your Partner!", [], 'success', <Heart size={20} />);
        }

        if (!upgraded) {
           triggerNotification("Cannot Use Yet", "You need to max out your current relationship first!", [], 'error', <Lock size={20}/>);
           return prev; // Don't spend gold
        }
        
        return { ...prev, gold: newGold, relationshipTiers: newTiers };
      });
      return;
    }

    setGameState(prev => ({ ...prev, gold: prev.gold - item.cost, energy: Math.min(prev.maxEnergy, prev.energy + item.energyRestore) }));
    triggerNotification('Delicious!', `You ate ${item.name}.`, [`+${item.energyRestore} Energy`, `-${item.cost} Gold`], 'success', <Cookie size={20}/>);
  };

  // --- AI CHAT ---
  const processAIResponse = async (userText: string) => {
    const loc = LOCATIONS[gameState.currentLocation];
    if (!loc.characterId) return;
    const charId = loc.characterId;
    const currentTier = gameState.relationshipTiers[charId];

    setIsTyping(true);
    try {
      const response = await generateResponse(
        userText, charId, gameState.loveScores[charId], currentTier, messagesMap[charId], userProfile, gameState.hasTrainedVisit, gameState.activeTask ? gameState.activeTask.type : null
      );

      // Handle Image
      let aiImageUrl: string | undefined = undefined;
      if (response.special_event_image) {
         import('./services/firebase').then(async ({ getCharacterImageUrl }) => {
            const url = await getCharacterImageUrl(response.special_event_image!);
            if (url) {
               setMessagesMap(prev => {
                  const msgs = [...prev[charId]];
                  const lastMsg = msgs[msgs.length - 1];
                  if (lastMsg) { return { ...prev, [charId]: [...msgs.slice(0, -1), { ...lastMsg, imageUrl: url }] }; }
                  return prev;
               });
            }
         });
      }

      setGameState(prev => {
        const newEnergy = Math.max(0, prev.energy - response.energy_cost);
        let rawNewLove = prev.loveScores[charId] + response.love_change;
        
        // --- SOFT CAP LOGIC ---
        // Check current Tier Cap
        const currentCap = TIER_THRESHOLDS[currentTier];
        const nextTier = getNextTier(currentTier);
        
        // If nextTier exists (not soulmate), cap the score
        if (nextTier) {
            const capLimit = TIER_THRESHOLDS[nextTier]; // e.g., if Friend(200), cap is Flirting(500) start? 
            // Wait, TIER_THRESHOLDS defines the requirement to ENTER that tier.
            // So if I am Friend (starts at 200), I can go up to 499. If I hit 500, I am capped until I unlock Flirting.
            
            // Actually, let's simplify:
            // TIER_THRESHOLDS: Acquaintance=200, Friend=500.
            // If I am Acquaintance, I can reach 200. Once at 200, I stop.
            // Wait, no. Acquaintance starts at 200? No, let's say Stranger=0-199. Acquaintance=200-499.
            // Let's look at constants.ts again.
            // STRANGER: 0. ACQUAINTANCE: 200. FRIEND: 500.
            
            // Current Tier: STRANGER (Lv0). Cap is 199.
            // If score >= 200, check if unlocked ACQUAINTANCE? No, Stranger->Acquaintance usually auto?
            // User wanted "Key Items" for big upgrades.
            // Let's say: 
            // Stranger -> Acquaintance (Auto at 200)
            // Acquaintance -> Friend (Auto at 500)
            // Friend -> Flirting (LOCKED at 1000. Needs Bouquet).
            // Flirting -> Partner (LOCKED at 2000. Needs Ring).
            
            // Re-evaluating constants for this logic:
            // Let's cap strictly at the thresholds of 'Locked' tiers.
            
            let cap = MAX_LOVE;
            if (currentTier === RelationshipTier.FRIEND) cap = TIER_THRESHOLDS[RelationshipTier.FLIRTING] - 1; // Cap at 999
            if (currentTier === RelationshipTier.FLIRTING) cap = TIER_THRESHOLDS[RelationshipTier.PARTNER] - 1; // Cap at 1999
            
            // If we hit the cap
            if (rawNewLove > cap) {
               rawNewLove = cap;
               // Trigger a hint?
               if (rawNewLove === cap && prev.loveScores[charId] < cap) {
                  triggerNotification("Max Relationship Reached", "You need a special gift to get closer!", [], 'info', <Lock size={20}/>);
               }
            }
        }
        
        // Auto-upgrade for lower tiers (Stranger -> Friend)
        let newTier = currentTier;
        if (rawNewLove >= TIER_THRESHOLDS[RelationshipTier.ACQUAINTANCE] && currentTier === RelationshipTier.STRANGER) newTier = RelationshipTier.ACQUAINTANCE;
        if (rawNewLove >= TIER_THRESHOLDS[RelationshipTier.FRIEND] && currentTier === RelationshipTier.ACQUAINTANCE) newTier = RelationshipTier.FRIEND;

        let newExp = prev.currentExp + EXP_PER_MESSAGE;
        let newLevel = prev.level;
        let newReqExp = prev.requiredExp;
        if (newExp >= newReqExp) {
           newLevel++; newExp -= newReqExp; newReqExp = Math.floor(newReqExp * 1.2);
           triggerNotification('Level Up!', `You are more charming now!`, [], 'level-up');
        }

        return {
          ...prev, energy: newEnergy, loveScores: { ...prev.loveScores, [charId]: rawNewLove },
          currentMoods: { ...prev.currentMoods, [charId]: response.mood },
          relationshipTiers: { ...prev.relationshipTiers, [charId]: newTier },
          messagesSent: prev.messagesSent + 1, currentExp: newExp, level: newLevel, requiredExp: newReqExp
        };
      });

      const aiMsgId = (Date.now() + 1).toString();
      const aiMsg: Message = { id: aiMsgId, sender: charId, text: response.reply, timestamp: Date.now(), isImageLoading: !!response.generate_image_prompt };
      setMessagesMap(prev => ({ ...prev, [charId]: [...prev[charId], aiMsg] }));
    } catch (error) { console.error("Failed to generate response", error); } finally { setIsTyping(false); }
  };

  const handleSendMessage = async (text: string) => {
    if (gameState.energy <= 0 || isTyping || gameState.activeTask) return; 
    const loc = LOCATIONS[gameState.currentLocation];
    if (!loc.characterId) return;
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text, timestamp: Date.now() };
    setMessagesMap(prev => ({ ...prev, [loc.characterId!]: [...prev[loc.characterId!], userMsg] }));
    trackQuestProgress('chat', 1);
    await processAIResponse(text);
  };

  const handleAction = (type: ActionType) => {
    if (gameState.energy <= 0 || isTyping || gameState.activeTask) return;
    const loc = LOCATIONS[gameState.currentLocation];
    if (!loc.characterId) return;
    let cost = 0; let actionText = ''; let forcedMood: Mood | undefined = undefined;
    switch (type) {
      case 'headpat': cost = 5; actionText = `*${userProfile?.name} ลูบหัวเบาๆ*`; break;
      case 'poke': cost = 2; actionText = `*${userProfile?.name} จิ้มแก้มเล่น*`; break;
      case 'gift': cost = 15; actionText = `*${userProfile?.name} ซื้อชานมไข่มุกมาฝาก*`; trackQuestProgress('gift', 1); if (loc.characterId === 'miguel') forcedMood = Mood.DRINKING; break;
    }
    if (gameState.energy < cost) return;
    setGameState(prev => ({ ...prev, energy: Math.max(0, prev.energy - cost), currentMoods: forcedMood ? { ...prev.currentMoods, [loc.characterId!]: forcedMood } : prev.currentMoods }));
    setLastAction({ type, timestamp: Date.now() });
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: actionText.replace(/\*/g, ''), timestamp: Date.now() };
    setMessagesMap(prev => ({ ...prev, [loc.characterId!]: [...prev[loc.characterId!], userMsg] }));
    processAIResponse(actionText);
  };

  const handleTravel = (targetLocId: LocationId) => {
    if (targetLocId === gameState.currentLocation) { setCurrentView('location'); return; }
    if (gameState.energy < TRAVEL_COST) { triggerNotification('Too Tired', `Need ${TRAVEL_COST} energy to travel.`, [], 'error'); return; }
    setIsTraveling(true); setTravelTarget(targetLocId);
    setTimeout(() => {
      let newMoods = { ...gameState.currentMoods };
      if (targetLocId === 'condo') { newMoods.miguel = Mood.WORKING; } else if (targetLocId === 'gym') { newMoods.fia = Mood.WORKING; }
      setGameState(prev => ({ ...prev, energy: prev.energy - TRAVEL_COST, currentLocation: targetLocId, currentMoods: newMoods, hasTrainedVisit: false }));
      setLocationMode('chat'); setCurrentView('location'); setIsTraveling(false); setTravelTarget(null);
    }, 3000);
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(profile));
    setUserProfile(profile); saveGameData(gameState, profile);
  };

  if (!userProfile) return <Onboarding onComplete={handleOnboardingComplete} />;
  const currentLoc = LOCATIONS[gameState.currentLocation];
  const hasCharacter = !!currentLoc.characterId;
  const isGym = gameState.currentLocation === 'gym';
  const showChat = (hasCharacter && !isGym) || (isGym && locationMode === 'chat');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans text-gray-800 p-0 md:p-6">
      <div className="w-full h-[100dvh] md:w-[414px] md:h-[90vh] md:max-h-[896px] bg-white flex flex-col relative md:rounded-[3rem] md:shadow-2xl md:border-[8px] md:border-white overflow-hidden ring-1 ring-black/5 transition-all duration-300">
        <NotificationToast notifications={notifications} onDismiss={removeNotification} />
        {isTraveling && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
             <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6 animate-bounce border-4 border-pink-100 shadow-xl"><MapPin className="text-pink-500 animate-pulse" size={48} fill="currentColor" /></div>
             <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Traveling...</h2>
             {travelTarget && (<p className="text-gray-500 font-medium">To {LOCATIONS[travelTarget].name}</p>)}
             <div className="mt-4 flex items-center gap-2 text-orange-500 font-bold bg-orange-50 px-4 py-2 rounded-full border border-orange-100"><Zap size={16} fill="currentColor" /> -{TRAVEL_COST} Energy</div>
          </div>
        )}
        <div className="absolute top-2 right-2 z-50 pointer-events-none opacity-50">{isCloudSyncing ? <Cloud className="text-pink-400 animate-pulse" size={12} /> : null}</div>
        <StatusBar energy={gameState.energy} maxEnergy={gameState.maxEnergy} level={gameState.level} currentExp={gameState.currentExp} requiredExp={gameState.requiredExp} />
        <main className={`flex-1 overflow-hidden flex flex-col relative min-h-0`}>
          {currentView === 'map' ? ( <MapGrid currentLocation={gameState.currentLocation} onTravel={handleTravel} energy={gameState.energy} disabled={isTraveling} />
          ) : currentView === 'player' ? ( <PlayerStats gameState={gameState} onStartTask={handleStartTask} onBuyItem={handleBuyItem} userProfile={userProfile} viewMode="full" />
          ) : currentView === 'quests' ? ( <DailyQuests gameState={gameState} onClaim={handleClaimQuest} />
          ) : currentView === 'relationships' ? ( <RelationshipStats gameState={gameState} />
          ) : (
            <>
               <div className="absolute top-4 left-0 right-0 z-20 px-4 flex justify-between items-start pointer-events-none">
                  <div className={`bg-white/80 backdrop-blur px-3 py-1.5 rounded-2xl shadow-sm border border-white/50 text-xs font-bold text-gray-600 flex items-center gap-1`}>{currentLoc.icon} {currentLoc.name}</div>
                  {isGym && (
                    <div className="bg-white/90 backdrop-blur p-1 rounded-2xl shadow-md border border-gray-100 flex gap-1 pointer-events-auto">
                      <button onClick={() => setLocationMode('chat')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${locationMode === 'chat' ? 'bg-[#FF5F1F] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}><MessageCircle size={14} /> Talk</button>
                      <button onClick={() => setLocationMode('action')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${locationMode === 'action' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}><Dumbbell size={14} /> Train</button>
                    </div>
                  )}
               </div>
              {showChat ? (
                <div className="flex-1 relative overflow-hidden flex flex-col h-full">
                  <div className="flex-1 min-h-0 relative flex items-end justify-center overflow-hidden"><CharacterView characterId={currentLoc.characterId!} mood={gameState.currentMoods[currentLoc.characterId!]} isLoading={isTyping} lastAction={lastAction} disabled={gameState.isGameOver || isTyping || !!gameState.activeTask} /></div>
                  <div className="h-[320px] max-h-[45%] flex-none z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.03)] bg-transparent"><ChatInterface characterId={currentLoc.characterId!} messages={messagesMap[currentLoc.characterId!]} onSendMessage={handleSendMessage} onAction={handleAction} isTyping={isTyping} disabled={gameState.isGameOver || isTyping || !!gameState.activeTask} currentMood={gameState.currentMoods[currentLoc.characterId!]} loveScore={gameState.loveScores[currentLoc.characterId!]} /></div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 pt-16">
                   {gameState.currentLocation === 'office' && ( <PlayerStats gameState={gameState} userProfile={userProfile} onStartTask={handleStartTask} viewMode="location_context" /> )}
                   {gameState.currentLocation === 'cafe' && ( <PlayerStats gameState={gameState} userProfile={userProfile} onBuyItem={handleBuyItem} viewMode="location_context" /> )}
                   {isGym && locationMode === 'action' && ( <PlayerStats gameState={gameState} userProfile={userProfile} onStartTask={handleStartTask} viewMode="location_context" /> )}
                </div>
              )}
            </>
          )}
        </main>
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
      </div>
    </div>
  );
};

// Helper for tier logic
function getNextTier(current: RelationshipTier): RelationshipTier | null {
  if (current === RelationshipTier.STRANGER) return RelationshipTier.ACQUAINTANCE;
  if (current === RelationshipTier.ACQUAINTANCE) return RelationshipTier.FRIEND;
  if (current === RelationshipTier.FRIEND) return RelationshipTier.FLIRTING;
  if (current === RelationshipTier.FLIRTING) return RelationshipTier.PARTNER;
  if (current === RelationshipTier.PARTNER) return RelationshipTier.SOULMATE;
  return null;
}

export default App;

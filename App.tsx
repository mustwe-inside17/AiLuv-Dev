
import React, { useState, useEffect, useRef } from 'react';
// Hooks
import { useCloudSync } from './hooks/useCloudSync';
import { useGameLoop } from './hooks/useGameLoop';
import { useQuestSystem } from './hooks/useQuestSystem';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './store/gameStore';
import { useUIStore } from './store/uiStore';
import { useGameInteractions } from './hooks/useGameInteractions';

// Components
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
import { MyRoom } from './components/MyRoom';
import { TheBasement } from './components/TheBasement'; 
import { AuthScreen } from './components/AuthScreen';
import { RankingScreen } from './components/RankingScreen';
import { TutorialOverlay } from './components/TutorialOverlay'; 
import { InstallPrompt } from './components/InstallPrompt';
import { RoleplayTip } from './components/RoleplayTip'; 
import { AudioManager } from './components/AudioManager';
import { GlobalModals } from './components/layout/GlobalModals';
import { LoadingScreen } from './components/LoadingScreen';
import { ChemistryMeter } from './components/ChemistryMeter'; 
import { PhoneOverlay } from './components/phone/PhoneOverlay'; // NEW
import { InventoryModal } from './components/InventoryModal';
import { ErrorBoundary } from './components/ErrorBoundary';

// Services
import { getCharacterImageUrl, saveMessages } from './services/firebase'; 
import { playSfx } from './utils/audioUtils';
import { createMemory, pruneMemories } from './services/memorySystem';
import { calculateEffectiveMaxEnergy } from './services/buffMechanics';

// Constants & Types
import { AppView, Message, Mood, UserProfile, ActionEvent, AppNotification, LocationId, CharacterId, RelationshipTier, MusicTrack, BuffType, ActionType, GameState, DailyChatLog } from './types';
import { QUEST_DATABASE, BASEMENT_TRACKS, TRAVEL_COST, STORY_CHAPTERS, LOCATIONS, CHARACTER_DATA } from './constants';
import { FASHION_ITEMS } from './constants/fashion'; 
import { Sparkles, Sun, RefreshCw, XCircle, MessageCircle, LogOut, MapPin, Trash2, Lock, User, ArrowUp, X, Heart } from 'lucide-react';

// --- FULL SCREEN VIEWER COMPONENT (Zoom & Pan) ---
const FullScreenViewer: React.FC<{ src: string, onClose: () => void }> = ({ src, onClose }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    
    // [MARCUS FIX]: Refs to track drag distance vs click
    const dragStart = useRef({ x: 0, y: 0 });
    const pointerStart = useRef({ x: 0, y: 0 });
    const hasDragged = useRef(false);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (scale === 1) return;
        e.preventDefault();
        e.stopPropagation();
        
        setIsDragging(true);
        hasDragged.current = false; // Reset drag status
        
        // Lock pointer to allow smooth dragging even if cursor leaves element
        (e.target as Element).setPointerCapture(e.pointerId);
        
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        pointerStart.current = { x: e.clientX, y: e.clientY }; // Store initial pos
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        e.stopPropagation();

        // Check if moved enough to consider it a drag
        const dx = Math.abs(e.clientX - pointerStart.current.x);
        const dy = Math.abs(e.clientY - pointerStart.current.y);
        if (dx > 5 || dy > 5) {
            hasDragged.current = true;
        }

        setPosition({
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        (e.target as Element).releasePointerCapture(e.pointerId);
    };

    const toggleZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        // [MARCUS FIX]: If user dragged, DO NOT toggle zoom (it was a pan action)
        if (hasDragged.current) {
            hasDragged.current = false;
            return;
        }

        if (scale > 1) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        } else {
            setScale(3); // Increased to 3x for better detail
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center animate-in fade-in duration-300 touch-none" onClick={onClose}>
             <button 
                onClick={onClose} 
                className="absolute top-6 right-6 z-[1000] text-white/70 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-md transition-colors"
            >
                <X size={32} />
            </button>
            
            <div 
                className="w-full h-full flex items-center justify-center overflow-hidden"
            >
                 <img 
                    src={src} 
                    alt="Fullscreen" 
                    className={`max-w-full max-h-full object-contain ${isDragging ? '' : 'transition-transform duration-300'} ${scale === 1 ? 'cursor-zoom-in' : 'cursor-grab active:cursor-grabbing'}`}
                    style={{ 
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        touchAction: 'none'
                    }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onClick={toggleZoom}
                    draggable={false} // Prevent browser native drag
                 />
            </div>

            <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
                 <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest bg-black/40 px-4 py-2 rounded-full inline-block backdrop-blur-sm border border-white/10">
                    {scale === 1 ? "Tap to Zoom" : "Drag to Pan • Tap to Fit"}
                 </p>
            </div>
        </div>
    );
};

export const App: React.FC = () => {
  // --- ZUSTAND STORE ---
  const gameState = useGameStore(useShallow(state => {
      const { 
          setGameState, replaceGameState, travelTo, deductEnergy, addEnergy, 
          addGold, spendGold, addDiamonds, spendDiamonds, subscribeVip, 
          claimVipDaily, addItem, removeItem, upgradeStat, buyStyle, 
          addStyle, equipStyle, startTask, completeTask, setActiveEvent, 
          updateMood, unlockAchievement, addBuff, cleanExpiredBuffs, 
          setDateScene, toggleMute, setBgmVolume, setSfxVolume, 
          setMusicActive, toggleEcoMode, claimDailyLogin, setSecretUnlockData, 
          setPendingQuestReward, setActiveQuestChoice, togglePhone, 
          addMail, deleteMail, readMail, claimMailReward, setVoiceChatActive, 
          addVoiceTokenUsage, toggleMic, addMemory, investGold, claimStake, 
          buyStock, sellStock, updateStockMarket,
          ...data 
      } = state;
      return data as GameState;
  }));

  const { 
      travelTo, addGold, spendGold, addItem, upgradeStat, 
      setGameState, unlockAchievement: storeUnlockAchievement, addBuff, addStyle,
      setDateScene, setMusicActive, addDiamonds
  } = useGameStore();

  const {
      user, authLoading, isLoadingProfile, 
      userProfile, setUserProfile, handleUpdateProfile: syncProfile,
      messagesMap, setMessagesMap, 
      isDataLoaded, 
      showNoSaveModal, connectionErrorType, manualRetry,
      isDuplicateLogin, 
      handleLogout: cloudLogout
  } = useCloudSync();

  // [MARCUS UPDATE]: Pass full userProfile to loop so Event Generator knows Gender
  const { timeOfDay } = useGameLoop(gameState, setGameState, user, isDataLoaded, userProfile);

  // UI Store State
  const {
      currentView, setCurrentView,
      locationMode, setLocationMode,
      activeSocialChat, setActiveSocialChat,
      roomGuestId, setRoomGuestId,
      notifications, removeNotification,
      showWelcomeModal, setShowWelcomeModal,
      showDiamondShop, setShowDiamondShop,
      showStory, setShowStory,
      showDailyLogin, setShowDailyLogin,
      showInventory, setShowInventory,
      setFullScreenImage, fullScreenImage,
      levelUpData, setLevelUpData,
      isTraveling, setIsTraveling,
      travelTarget, setTravelTarget
  } = useUIStore();
  
  // [MARCUS NEW]: ASSET PRELOAD STATE
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);

  // Chat Drag Logic (Mobile Only)
  const [chatHeight, setChatHeight] = useState(45); 
  const [isDraggingChat, setIsDraggingChat] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(45);

  // Input Focus
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleInputFocus = () => setIsInputFocused(true);
  const handleInputBlur = () => setIsInputFocused(false);

  // --- NOTIFICATION SYSTEM ---
  // [MARCUS FIX]: Added 'onAction' parameter to triggerNotification
  const triggerNotification = async (title: string, message: string, rewards?: string[], type: 'success' | 'level-up' | 'info' | 'error' | 'achievement' | 'message' | 'event' | 'memory' | 'critical' = 'success', icon?: React.ReactNode, avatarPath?: string, action?: () => void) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    let avatarUrl = undefined;
    if (avatarPath) {
        avatarUrl = await getCharacterImageUrl(avatarPath) || undefined;
    }
    useUIStore.getState().addNotification({ id, title, message, rewards, type, icon, avatar: avatarUrl, onAction: action });
  };

  // --- QUEST SYSTEM ---
  const { refreshQuests, trackQuestProgress, updateQuestProgress, claimQuest, unlockAchievement } = useQuestSystem(
      gameState, 
      setGameState, 
      triggerNotification,
      (newLvl) => setLevelUpData(newLvl) // Pass Level Up Handler
  );

  // --- GAME INTERACTIONS HOOK (The "Brain") ---
  const {
      isTyping,
      lastAction,
      consumptionResult,
      setConsumptionResult,
      handleStartTask,
      handleBuyItem,
      handleChatTransaction,
      handleSendMessage,
      handleAction,
      processAIResponse,
      handleTaskComplete,
      handleAcceptQuest, // NEW
      handleCloseQuestChoice, // NEW
      handleSelectQuestOption, // NEW CHOICE HANDLER
      handleCollectQuestReward, // NEW: Modal Completion
      handleConsumeItem, // NEW: For inventory
      handleRecycleItem, // NEW: For Recycle
      handleInstantBuyAction // NEW: Instant Buy Handler
  } = useGameInteractions({
      userProfile,
      messagesMap,
      setMessagesMap,
      triggerNotification,
      trackQuestProgress,
      updateQuestProgress,
      unlockAchievement,
      onLevelUp: (newLvl) => setLevelUpData(newLvl) // Pass Level Up Handler
  });

  // --- EVENT & TUTORIAL LOGIC ---
  const prevEventIdRef = useRef<string | null>(null);
  
  useEffect(() => {
      const currentEvent = gameState.activeEvent;
      if (currentEvent && currentEvent.id !== prevEventIdRef.current) {
          // [MARCUS FIX]: Bind the travel action to the event notification
          triggerNotification(
              currentEvent.title, 
              currentEvent.message, 
              ['Tap to help!'], 
              'event', 
              undefined, 
              CHARACTER_DATA[currentEvent.characterId].baseImg,
              () => handleTravel(currentEvent.locationId) // Click Action
          );
          playSfx('event_alert');
          prevEventIdRef.current = currentEvent.id;
      } else if (!currentEvent) {
          prevEventIdRef.current = null;
      }
  }, [gameState.activeEvent]);

  // --- [MARCUS FIX]: QUEST INITIALIZATION & REFRESH ---
  useEffect(() => {
    if (isDataLoaded) {
      refreshQuests();
    }
  }, [isDataLoaded, refreshQuests]);

  // --- DAILY RESET & SLEEP LOGIC ---
  const isResettingRef = useRef(false);

  useEffect(() => {
      if (!user || !isDataLoaded) return;
      const checkDailyReset = async () => {
          const now = new Date();
          const currentHour = now.getHours();
          const todayStr = now.toDateString();
          
          if (currentHour >= 6) {
              // [MARCUS FIX]: Trigger Quest Refresh
              refreshQuests();

              // [MARCUS FIX]: Use current store state directly to avoid closure stale data
              const currentStore = useGameStore.getState();
              
              if (currentStore.lastChatResetDate !== todayStr && !isResettingRef.current) {
                  isResettingRef.current = true;
                  console.log("🧹 [Daily Reset] Clearing Chat History & Pruning Memories...");
                  
                  const targetChars: CharacterId[] = ['miguel', 'fia', 'peat', 'erin', 'marcus', 'lucas', 'bam', 'jellie', 'soul', 'mia'];
                  const emptyMessages: Record<string, Message[]> = {};
                  targetChars.forEach(c => emptyMessages[c] = []);

                  // 1. Snapshot current messages for archiving and summarization
                  const messagesSnapshot = { ...messagesMap };

                  // 2. CLEAR LOCAL MESSAGES & STAMP RESET DATE IMMEDIATELY (Eliminates Race Conditions)
                  setMessagesMap(emptyMessages);
                  setGameState({ 
                      lastChatResetDate: todayStr,
                      currentDateScene: null // Auto-end any active date mode when new day starts at 06:00
                  });

                  // 3. SYNC TO FIREBASE IMMEDIATELY
                  saveMessages(user.uid, emptyMessages as any).catch(e => {
                      console.error("❌ Daily Reset: Failed to save cleared messages.", e);
                  });

                  // 4. BACKGROUND SUMMARIZATION & ARCHIVING
                  (async () => {
                      const newYesterdayTags: Record<string, string> = {};
                      try {
                          const { summarizeYesterdayTags } = await import('./services/mockAi');
                          const charsToSummarize = targetChars.filter(c => messagesSnapshot[c] && messagesSnapshot[c].length > 0);
                          
                          if (charsToSummarize.length > 0) {
                              console.log(`[Daily Reset] Summarizing yesterday's events for ${charsToSummarize.length} characters...`);
                              for (const charId of charsToSummarize) {
                                  const summary = await summarizeYesterdayTags(charId, messagesSnapshot[charId]);
                                  if (summary && summary !== "ไม่มีเหตุการณ์พิเศษ") {
                                      newYesterdayTags[charId] = summary;
                                  }
                              }
                              console.log("[Daily Reset] Summaries created:", newYesterdayTags);
                          }
                      } catch (e) {
                          console.error("Failed to generate yesterday summaries:", e);
                      }

                      // SAVE DAILY CHAT ARCHIVES (30 DAYS HISTORY)
                      const storeNow = useGameStore.getState();
                      const currentArchives = storeNow.dailyChatArchives || {};
                      const updatedArchives: Record<string, DailyChatLog[]> = { ...currentArchives };
                      const archiveDateStr = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

                      targetChars.forEach(charId => {
                          const activeMsgs = messagesSnapshot[charId];
                          if (activeMsgs && activeMsgs.length > 0) {
                              const charArchive = updatedArchives[charId] ? [...updatedArchives[charId]] : [];
                              const newLog: DailyChatLog = {
                                  id: `log_${charId}_${Date.now()}`,
                                  date: archiveDateStr,
                                  messages: [...activeMsgs],
                                  summary: newYesterdayTags[charId] || undefined,
                                  totalMessages: activeMsgs.length
                              };
                              charArchive.unshift(newLog);
                              updatedArchives[charId] = charArchive.slice(0, 30); // Keep max 30 days
                          }
                      });

                      // PRUNE MEMORIES
                      const currentMemories = storeNow.memories;
                      const cleanedMemories = { ...currentMemories };
                      targetChars.forEach(charId => {
                          if (cleanedMemories[charId]) {
                              cleanedMemories[charId] = pruneMemories(cleanedMemories[charId]);
                          }
                      });

                      setGameState({ 
                          memories: cleanedMemories,
                          yesterdayMemoryTags: newYesterdayTags,
                          dailyChatArchives: updatedArchives
                      });

                      isResettingRef.current = false;
                  })().catch(err => {
                      console.warn("Background daily reset tasks warning:", err);
                      isResettingRef.current = false;
                  });

                  triggerNotification('New Day Started', 'Chat history cleared & Memories optimized! ☀️', [], 'info', <RefreshCw size={20} className="text-blue-400" />);
              }
          }
      };
      
      checkDailyReset();
      const interval = setInterval(checkDailyReset, 30000); // Check every 30s
      return () => clearInterval(interval);
  }, [user, isDataLoaded, setGameState, setMessagesMap, messagesMap]);

  useEffect(() => {
      if (currentView !== 'social_chat') setActiveSocialChat(null);
      if (gameState.isSleeping) {
          const isAtHome = gameState.currentLocation === 'home';
          const isViewingHome = currentView === 'location';
          if (!isAtHome || !isViewingHome) {
              setGameState({ isSleeping: false });
              triggerNotification('Up and at \'em!', 'You left your bed. Sleep mode ended.', [], 'info', <Sun size={20} className="text-orange-400" />);
          }
      }
  }, [currentView, gameState.currentLocation, gameState.isSleeping, setGameState]);

  // --- TUTORIAL HANDLERS ---
  const startTutorial = () => {
      setGameState({ tutorialStep: 'intro' });
      setShowWelcomeModal(false);
  };
  
  const handleTutorialNext = () => {
      const step = gameState.tutorialStep;
      if (step === 'intro') {
          setGameState({ tutorialStep: 'chat_guide', currentLocation: 'condo', currentMoods: { ...gameState.currentMoods, miguel: Mood.NEUTRAL } });
          const introMsg: Message = { id: 'tut_intro', sender: 'miguel', text: `สวัสดีค่ะคุณ ${userProfile?.name || 'เพื่อนบ้าน'}! 👋 มิเกลเองนะคะ ยินดีที่ได้รู้จักค่ะ...`, timestamp: Date.now() };
          setMessagesMap(prev => {
              const miguelMsgs = prev?.miguel || [];
              if (miguelMsgs.length > 0) return prev;
              return { ...prev, miguel: [introMsg] };
          });
          setCurrentView('location');
          setLocationMode('chat');
      } else if (step === 'goals_intro') setGameState({ tutorialStep: 'goals_claim' });
      else if (step === 'relationships_intro_1') setGameState({ tutorialStep: 'relationships_intro_2' });
      else if (step === 'relationships_intro_2') setGameState({ tutorialStep: 'relationships_tap' });
      else if (step === 'map_intro') setGameState({ tutorialStep: 'map_pin_cafe' });
      else if (step === 'me_intro') setGameState({ tutorialStep: 'me_exp' });
      else if (step === 'me_exp') setGameState({ tutorialStep: 'me_level' });
      else if (step === 'me_level') setGameState({ tutorialStep: 'me_stats' });
      else if (step === 'me_stats') setGameState({ tutorialStep: 'me_skills' });
  };

  const handleTutorialComplete = () => {
      const step = gameState.tutorialStep;
      if (step === 'energy_guide') {
          setGameState({ tutorialStep: 'completed', gold: gameState.gold + 50, currentExp: gameState.currentExp + 20 });
          triggerNotification('Tutorial Completed', 'You are ready to live your life!', ['+50 G', '+20 XP'], 'success');
      } else if (step?.startsWith('goals_')) {
          setGameState({ tutorialStep: 'completed', gold: gameState.gold + 20, energy: Math.min(gameState.maxEnergy, gameState.energy + 10), currentExp: gameState.currentExp + 10 });
      } else if (step?.startsWith('relationships_')) {
          setGameState({ tutorialStep: 'completed', currentExp: gameState.currentExp + 10 });
      } else if (step === 'story_intro') {
          setGameState({ tutorialStep: 'completed' });
      } else if (step === 'buff_explanation') {
          setGameState({ tutorialStep: 'completed', gold: gameState.gold + 50 });
      } else if (step?.startsWith('me_')) {
          setGameState({ tutorialStep: 'completed', currentExp: gameState.currentExp + 30 });
      }
  };

  const handleViewChange = (view: AppView) => {
      setCurrentView(view);
      if (view === 'map' && (!gameState.tutorialsSeen || !gameState.tutorialsSeen.includes('map'))) {
          setGameState({ tutorialsSeen: [...(gameState.tutorialsSeen || []), 'map'], tutorialStep: 'map_intro' });
      }
      if (view === 'quests' && (!gameState.tutorialsSeen || !gameState.tutorialsSeen.includes('goals'))) {
          setGameState({ tutorialsSeen: [...(gameState.tutorialsSeen || []), 'goals'], tutorialStep: 'goals_intro' });
      }
      if (view === 'relationships' && (!gameState.tutorialsSeen || !gameState.tutorialsSeen.includes('relationships'))) {
          setGameState({ tutorialsSeen: [...(gameState.tutorialsSeen || []), 'relationships'], tutorialStep: 'relationships_intro_1' });
      }
      if (view === 'player' && (!gameState.tutorialsSeen || !gameState.tutorialsSeen.includes('me'))) {
          setGameState({ tutorialsSeen: [...(gameState.tutorialsSeen || []), 'me'], tutorialStep: 'me_intro' });
      }
  };

  const handleRelationshipCardClick = (id: CharacterId) => {
      if (gameState.tutorialStep === 'relationships_tap' && id === 'miguel') { handleTutorialComplete(); }
  };

  const handleClaimWrapper = (id: string) => {
      claimQuest(id);
      if (gameState.tutorialStep === 'goals_claim') {
          setTimeout(() => { setGameState({ tutorialStep: 'goals_rank' }); }, 800);
      }
  };

  // --- NAVIGATION & TRAVEL ---
  const handleTravel = (targetId: LocationId, forceChatMode: boolean = false) => {
      if (gameState.tutorialStep === 'map_pin_cafe' && targetId !== 'cafe') return;
      
      if (gameState.tutorialStep === 'map_pin_cafe' && targetId === 'cafe') {
          setGameState({ tutorialStep: 'map_drawer' });
          return;
      }

      if (targetId === gameState.currentLocation && !forceChatMode) { setCurrentView('location'); return; }
      
      if (gameState.tutorialStep === 'map_drawer') {
          setIsTraveling(true); 
          setTravelTarget(targetId);
          setTimeout(() => {
              const hasTravelSkill = (gameState.unlockedSkills || []).includes('huh_again_pls');
              travelTo(targetId, hasTravelSkill);
              setCurrentView('location'); 
              setIsTraveling(false); 
              setTravelTarget(null);
              setLocationMode('chat');
              setGameState({ tutorialStep: 'location_action_toggle' });
          }, 600);
          return;
      }

      setIsTraveling(true); 
      setTravelTarget(targetId);
      setChatHeight(45);

      setTimeout(() => {
          const hasTravelSkill = (gameState.unlockedSkills || []).includes('huh_again_pls');
          travelTo(targetId, hasTravelSkill);
          setCurrentView('location'); 
          setIsTraveling(false); 
          setTravelTarget(null);
          
          if (forceChatMode) setLocationMode('chat');
          else if (targetId === 'office') setLocationMode('action');
          else setLocationMode('chat');
          
          const targetCharId = LOCATIONS[targetId]?.characterId;
          if (targetCharId) {
              const currentEvent = gameState.activeEvent;
              if (currentEvent && (currentEvent.locationId === targetId || currentEvent.characterId === targetCharId)) {
                  const eventMsg: Message = {
                      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                      sender: currentEvent.characterId,
                      text: currentEvent.message, 
                      timestamp: Date.now(),
                      isEventMessage: true
                  };
                  setMessagesMap(prev => {
                      const charMsgs = prev[targetCharId] || [];
                      if (charMsgs.length > 0 && charMsgs.some(m => m.isEventMessage && m.text === eventMsg.text)) return prev;
                      return { ...prev, [targetCharId]: [...charMsgs, eventMsg] };
                  });
              }
          }
          if (targetId !== 'home') trackQuestProgress('travel', 1);
      }, 600);
  };

  const handleUpdateTaskScore = (score: number) => {
      setGameState({ activeTask: { ...gameState.activeTask!, performanceScore: score } });
  };

  const handleToggleSleep = () => {
      setGameState({ isSleeping: !gameState.isSleeping });
  };

  const handleUpdateProfile = (newProfile: UserProfile) => { setUserProfile(newProfile); syncProfile(newProfile); triggerNotification('Profile Updated', 'Your identity has been saved.', [], 'success', <User size={20}/>); };

  const handleStoryClaim = (chapterId: number) => {
      const chapter = STORY_CHAPTERS.find(c => c.id === chapterId);
      if (!chapter) return;

      const newGold = gameState.gold + chapter.rewards.gold;
      const newExp = gameState.currentExp + chapter.rewards.exp;
      if (chapter.rewards.diamonds) addDiamonds(chapter.rewards.diamonds);

      if (chapter.rewards.item) {
          const isStyle = FASHION_ITEMS.some(f => f.id === chapter.rewards.item);
          if (isStyle) addStyle(chapter.rewards.item);
          else addItem(chapter.rewards.item);
      }

      setGameState({
          gold: newGold,
          totalGoldEarned: (gameState.totalGoldEarned || 0) + chapter.rewards.gold,
          currentExp: newExp,
          currentChapter: chapterId + 1, 
      });
      setShowStory(false);
  };

  // --- AUDIO LOGIC ---
  const [globalMusic, setGlobalMusic] = useState({ isPlaying: false, trackIndex: 0, volume: 0.5 });
  const globalAudioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
      setMusicActive(globalMusic.isPlaying);
  }, [globalMusic.isPlaying, setMusicActive]);

  const playNextGlobalTrack = () => {
      setGlobalMusic(prev => {
          let nextIndex = (prev.trackIndex + 1) % BASEMENT_TRACKS.length;
          let attempts = 0;
          while (attempts < BASEMENT_TRACKS.length && BASEMENT_TRACKS[nextIndex].cost > 0 && !(gameState.unlockedTracks || []).includes(BASEMENT_TRACKS[nextIndex].id)) {
              nextIndex = (nextIndex + 1) % BASEMENT_TRACKS.length;
              attempts++;
          }
          return { ...prev, trackIndex: nextIndex, isPlaying: true };
      });
  };

  useEffect(() => {
      if (!globalAudioRef.current && BASEMENT_TRACKS.length > 0) {
          globalAudioRef.current = new Audio(BASEMENT_TRACKS[0].src);
          globalAudioRef.current.loop = false;
          globalAudioRef.current.onended = playNextGlobalTrack;
      }
      if (globalAudioRef.current) {
          globalAudioRef.current.onended = playNextGlobalTrack;
          const track = BASEMENT_TRACKS[globalMusic.trackIndex];
          if (!globalAudioRef.current.src.includes(track.src)) {
              const wasPlaying = globalMusic.isPlaying;
              globalAudioRef.current.src = track.src;
              globalAudioRef.current.load();
              if (wasPlaying) globalAudioRef.current.play().catch(e => console.log("Global Audio Play Error:", e));
          } else {
              if (globalMusic.isPlaying) globalAudioRef.current.play().catch(e => console.log("Global Audio Play Error:", e));
              else globalAudioRef.current.pause();
          }
          globalAudioRef.current.volume = globalMusic.volume;
      }
  }, [globalMusic]);

  const handleBuyTrack = (track: MusicTrack) => {
      if (gameState.gold < track.cost) { triggerNotification('Not enough gold', `You need ${track.cost} G.`, [], 'error'); return; }
      spendGold(track.cost);
      setGameState({ unlockedTracks: [...gameState.unlockedTracks, track.id], totalGoldSpent: (gameState.totalGoldSpent || 0) + track.cost });
      triggerNotification('Track Unlocked!', `Added "${track.title}" to collection.`, [`-${track.cost} G`], 'success');
  };

  const handleFinishTrack = (track: MusicTrack) => {
      const currentEnergy = useGameStore.getState().energy;
      let energyUpdate = currentEnergy;
      if (track.id === 'track_1') {
          energyUpdate = currentEnergy + 70;
          setGameState({ energy: energyUpdate });
      } else if (track.id === 'track_2') {
          const statBuffs: BuffType[] = ['buff_vit', 'buff_int', 'buff_cha', 'buff_luck'];
          statBuffs.forEach(t => addBuff({ id: `basement_${t}_${Date.now()}`, type: t, value: 2, expiresAt: Date.now() + 60 * 60 * 1000, sourceName: track.title }));
      } else {
          addBuff({ id: Date.now().toString(), type: track.buffType, value: track.buffValue, expiresAt: Date.now() + track.buffDurationMinutes * 60 * 1000, sourceName: track.title }); 
      }
      triggerNotification('Vibe Check Passed', `Track "${track.title}" complete!`, [track.description], 'success');
      processAIResponse(`[SYSTEM: User finished listening to your track "${track.title}".]`, undefined, true, 'lucas');
  };

  // Chat Drag Logic (Mobile only effectively)
  const handleChatDragStart = (e: React.MouseEvent | React.TouchEvent) => {
      if (window.innerWidth >= 768) return; 

      e.preventDefault(); e.stopPropagation();
      setIsDraggingChat(true);
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      dragStartY.current = clientY;
      dragStartHeight.current = chatHeight;
      if ('touches' in e) { window.addEventListener('touchmove', handleChatDragMove, { passive: false }); window.addEventListener('touchend', handleChatDragEnd); } 
      else { window.addEventListener('mousemove', handleChatDragMove); window.addEventListener('mouseup', handleChatDragEnd); }
  };
  const handleChatDragMove = (e: MouseEvent | TouchEvent) => {
      if (!dragStartY.current) return;
      if (e.cancelable) e.preventDefault(); 
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaY = dragStartY.current - clientY; 
      const screenHeight = window.innerHeight;
      const deltaPercent = (deltaY / screenHeight) * 100;
      setChatHeight(Math.max(45, Math.min(85, dragStartHeight.current + deltaPercent)));
  };
  const handleChatDragEnd = () => {
      setIsDraggingChat(false);
      window.removeEventListener('touchmove', handleChatDragMove); window.removeEventListener('touchend', handleChatDragEnd); window.removeEventListener('mousemove', handleChatDragMove); window.removeEventListener('mouseup', handleChatDragEnd);
  };

  // --- RENDER LOGIC ---
  
  if (authLoading) {
      // 1. Initial Auth Check (Minimal Spinner)
      return (
          <div className="fixed inset-0 bg-white flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-pink-600 text-xs font-bold animate-pulse uppercase tracking-widest">Connecting...</div>
              </div>
          </div>
      );
  }

  if (!user) {
      // 2. Not Logged In -> Auth Screen
      return <AuthScreen onSuccess={() => {}} />;
  }

  // 3. Logged In -> Check Profile & Assets (Show Loading Screen)
  if (isLoadingProfile || !isAssetsLoaded) {
      return (
          <LoadingScreen 
              onComplete={() => setIsAssetsLoaded(true)} 
          />
      );
  }

  if (!userProfile) return <Onboarding onComplete={(p) => { setUserProfile(p); syncProfile(p); setShowWelcomeModal(true); }} />;

  const currentLoc = LOCATIONS[gameState.currentLocation] || LOCATIONS['home'];
  const hasCharacter = !!currentLoc.characterId;
  const isActionLoc = ['gym', 'cafe', 'market', 'office', 'mall'].includes(gameState.currentLocation); 
  const showChat = hasCharacter && (!isActionLoc || locationMode === 'chat');
  
  const hour = new Date().getHours();
  
  const isFia = currentLoc.characterId === 'fia';
  const isFiaOffDuty = isFia && (hour >= 18 || hour < 6);
  const isMiguel = currentLoc.characterId === 'miguel';
  const isMiguelOffDuty = isMiguel && (hour >= 18 || hour < 6);
  const isBam = currentLoc.characterId === 'bam';
  const isBamOffDuty = isBam && (hour >= 20 || hour < 8);
  const isMia = currentLoc.characterId === 'mia';
  const isMiaNight = isMia && (hour >= 18 || hour < 6);
  
  const currentWorkCount = gameState.totalWorkCount || 0;
  const isTalkLocked = gameState.currentLocation === 'office' && currentWorkCount < 10;

  const effectiveMaxEnergy = calculateEffectiveMaxEnergy(gameState.maxEnergy, gameState.activeBuffs, gameState.equippedStyle);

  const commonChatProps = { 
      characterId: currentLoc.characterId!, 
      messages: messagesMap[currentLoc.characterId!] || [], 
      onSendMessage: (txt: string) => {
          handleSendMessage(txt, activeSocialChat, roomGuestId);
          // [MARCUS FIX]: Tutorial Bridge - Advance if in Chat Guide
          if (gameState.tutorialStep === 'chat_guide') {
              setTimeout(() => {
                  setGameState({ tutorialStep: 'energy_guide' });
              }, 500);
          }
      }, 
      onAction: (t: any, dateTarget?: any) => handleAction(t, activeSocialChat, roomGuestId, dateTarget), 
      onIdleTrigger: () => processAIResponse("[SYSTEM: User is silent.]", undefined, true), 
      onClearChat: () => setMessagesMap(prev => ({ ...prev, [currentLoc.characterId!]: [] })), 
      isTyping, 
      disabled: gameState.isGameOver || isTyping || !!gameState.activeTask || isTraveling, 
      currentMood: gameState.currentMoods[currentLoc.characterId!] || Mood.NEUTRAL, 
      loveScore: gameState.loveScores[currentLoc.characterId!] || 0, 
      inventory: gameState.inventory, 
      onImageClick: (url: string) => setFullScreenImage(url), 
      energy: gameState.energy, 
      comboStreak: gameState.comboStreaks[currentLoc.characterId!] || 0, 
      currentTier: gameState.relationshipTiers[currentLoc.characterId!] || RelationshipTier.STRANGER, 
      activeEvent: gameState.activeEvent, 
      tutorialStep: gameState.tutorialStep, 
      lastLoveUpdate: gameState.lastLoveUpdate, 
      onDragStart: handleChatDragStart, 
      partyMemberId: gameState.partyMember, 
      unlockedSkills: gameState.unlockedSkills, 
      gold: gameState.gold, 
      onBuyItem: (id, mid) => handleChatTransaction(id, mid, activeSocialChat, roomGuestId), 
      onInputFocus: handleInputFocus, 
      onInputBlur: handleInputBlur, 
      chemistryScore: gameState.chemistryScores?.[currentLoc.characterId!] || 0,
      onBuyAction: (t) => handleInstantBuyAction(t, activeSocialChat, roomGuestId), // [MARCUS FIX]: Added Handler
      onAcceptQuest: handleAcceptQuest, // PASS QUEST HANDLER
      onAddSystemMessage: (text: string) => {
          const charId = currentLoc.characterId;
          if (!charId) return;
          const systemMsg: Message = {
              id: `sys_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              sender: 'system',
              text,
              timestamp: Date.now(),
              isEventMessage: true
          };
          setMessagesMap(prev => ({
              ...prev,
              [charId]: [...(prev[charId] || []), systemMsg]
          }));
      }
  };

  const hasStatPoints = (gameState.stats?.points || 0) > 0;
  const hasClaimableQuests = [...(gameState.activeDailyQuests || []), ...(gameState.activeWeeklyQuests || [])].some(id => { const progress = gameState.questProgress?.[id]; const quest = QUEST_DATABASE[id]; if (!progress || !quest) return false; return progress.current >= quest.target && !progress.claimed; });

  return (
    // [MARCUS FIX]: GLOBAL WRAPPER TRANSPARENT with Entry Animation
    // Apply 'animate-app-enter' to mimic the "zoom in" effect when splash is gone
    <div className={`fixed inset-0 font-sans text-gray-200 ${gameState.settings.isEcoMode ? 'eco-mode' : ''} ${isAssetsLoaded ? 'animate-app-enter' : 'opacity-0'}`}>
      {/* Background Decor for Desktop (Stardust) */}
      <div className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none hidden md:block" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }}></div>

      <InstallPrompt />
      <AudioManager currentLocation={gameState.currentLocation} timeOfDay={timeOfDay} /> 
      
      <GlobalModals 
          playerName={userProfile.name} onStartTutorial={startTutorial}
          consumptionResult={consumptionResult} setConsumptionResult={setConsumptionResult}
          handleStoryClaim={handleStoryClaim} gameState={gameState}
          isLoadingProfile={isLoadingProfile} authLoading={authLoading}
          onCollectQuestReward={handleCollectQuestReward} // NEW
          onSelectQuestOption={handleSelectQuestOption} // NEW
          onCloseQuestChoice={handleCloseQuestChoice}
      />

      {showInventory && (
          <InventoryModal 
              onClose={() => setShowInventory(false)} 
              onConsume={handleConsumeItem} 
              onRecycle={handleRecycleItem} 
          />
      )}

      {/* --- NEW: PHONE OVERLAY SYSTEM --- */}
      <PhoneOverlay onStoryTravel={id => { if (isTraveling || gameState.activeTask || gameState.isSleeping || gameState.voiceChat?.isActive) return; useGameStore.getState().togglePhone(); setActiveSocialChat(null); setRoomGuestId(null); if (id === gameState.currentLocation) { setCurrentView('location'); setLocationMode('chat'); } else handleTravel(id, true); }} 
          globalMusic={globalMusic} 
          onPlayGlobalMusic={() => setGlobalMusic(prev => ({...prev, isPlaying: true}))} 
          onPauseGlobalMusic={() => setGlobalMusic(prev => ({...prev, isPlaying: false}))} 
          onNextGlobalTrack={playNextGlobalTrack} 
          userProfile={userProfile}
      />

      {fullScreenImage && <FullScreenViewer src={fullScreenImage} onClose={() => setFullScreenImage(null)} />}
      
      {isDuplicateLogin && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in zoom-in-95 duration-500">
            <div className="w-full max-w-sm bg-slate-900 rounded-[2.5rem] shadow-[0_0_60px_-15px_rgba(239,68,68,0.5)] border border-red-500/30 overflow-hidden relative flex flex-col">
                <div className="h-40 bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 relative flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center shadow-lg animate-bounce-soft relative z-10"><Lock size={40} className="text-white drop-shadow-md" /></div>
                </div>
                <div className="px-8 pb-10 pt-2 text-center relative z-10">
                    <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Session Expired</h2>
                    <p className="text-slate-300 text-sm font-medium leading-relaxed mb-8">มีการเข้าใช้งานบัญชีนี้จากอุปกรณ์อื่น<br/><span className="text-red-400 text-xs">(Connection Severed)</span></p>
                    <button onClick={cloudLogout} className="w-full bg-white text-red-600 font-extrabold text-lg py-4 rounded-2xl shadow-xl shadow-red-900/20 hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2 group"><LogOut size={22} className="group-hover:-translate-x-1 transition-transform text-red-500" /> LOGOUT</button>
                </div>
            </div>
        </div>
      )}

      {/* --- MAIN LAYOUT CONTAINER --- */}
      <div className="flex flex-col md:grid md:grid-cols-[1fr_96px] md:h-screen w-full h-full relative overflow-hidden">
        
        {/* MAIN CONTENT AREA */}
        <main className="relative flex-1 min-h-0 overflow-hidden flex flex-col md:h-full md:p-6">
            
            {/* MOBILE STATUS (Visible only on mobile) */}
            <div className="md:hidden">
                <StatusBar energy={gameState.energy} maxEnergy={effectiveMaxEnergy} level={gameState.level} currentExp={gameState.currentExp} requiredExp={gameState.requiredExp} gold={gameState.gold} diamonds={gameState.diamonds} timeOfDay={timeOfDay} activeBuffs={gameState.activeBuffs} onOpenDiamondShop={() => setShowDiamondShop(true)} userProfile={userProfile} onOpenInventory={() => setShowInventory(true)} onTogglePhone={() => useGameStore.getState().togglePhone()} />
            </div>

            {/* [MARCUS FIX]: MAIN GLASS CONTAINER (DYNAMIC) */}
            <div className={`
                w-full h-full flex flex-col relative 
                bg-white/60 dark:bg-dark-glass 
                backdrop-blur-xl transition-all duration-700
                md:rounded-[2.5rem] md:shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:md:shadow-[0_0_50px_rgba(0,0,0,0.5)] 
                md:border-[1px] md:border-white/40 dark:md:border-white/10 
                overflow-hidden
            `}>
                
                {/* DESKTOP STATUS BAR (Moved inside, relative flow to prevent overlap) */}
                <div className="hidden md:block z-[60] w-full shrink-0 md:mb-4">
                     <StatusBar energy={gameState.energy} maxEnergy={effectiveMaxEnergy} level={gameState.level} currentExp={gameState.currentExp} requiredExp={gameState.requiredExp} gold={gameState.gold} diamonds={gameState.diamonds} timeOfDay={timeOfDay} activeBuffs={gameState.activeBuffs} onOpenDiamondShop={() => setShowDiamondShop(true)} userProfile={userProfile} onOpenInventory={() => setShowInventory(true)} onTogglePhone={() => useGameStore.getState().togglePhone()} />
                </div>

                <NotificationToast notifications={notifications} onDismiss={removeNotification} />
                
                {isTraveling && (
                    <div className="absolute inset-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center animate-in fade-in duration-300 text-slate-800 dark:text-white">
                        <div className="w-24 h-24 bg-pink-500/10 rounded-full flex items-center justify-center mb-6 animate-bounce border-4 border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.3)] overflow-hidden relative">
                            {travelTarget && <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-pulse">{LOCATIONS[travelTarget]?.icon || '🚀'}</span>}
                        </div>
                        <h2 className="text-2xl font-black mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Traveling...</h2>
                        {travelTarget && (<p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Destination: {LOCATIONS[travelTarget].name}</p>)}
                    </div>
                )}

                {/* ADDED: relative class to this container */}
                <div key={currentView} className="flex-1 w-full h-full flex flex-col overflow-hidden relative animate-in fade-in zoom-in-[0.99] duration-500 ease-out">
                    <ErrorBoundary 
                      fallback={
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">⚠️</span>
                          </div>
                          <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">มีบางอย่างผิดพลาดในหน้านี้</h2>
                          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm max-w-sm">
                            กรุณาลองเปลี่ยนไปยังเมนูอื่น แล้วกลับมาหน้านี้อีกครั้ง หรือกดยืนยันเพื่อรีเฟรชเฉพาะส่วนนี้
                          </p>
                          <button 
                            onClick={() => window.location.reload()} 
                            className="px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl shadow-lg transition-all"
                          >
                            รีเฟรชหน้าต่าง
                          </button>
                        </div>
                      }
                    >
                    {currentView === 'map' ? (
                        <MapGrid currentLocation={gameState.currentLocation} onTravel={(id) => handleTravel(id)} energy={gameState.energy} disabled={isTraveling} timeOfDay={timeOfDay} activeEvent={gameState.activeEvent} unlockedSkills={gameState.unlockedSkills} partyMember={gameState.partyMember} onOpenInventory={() => setShowInventory(true)} />
                    ) : currentView === 'player' ? (
                        <PlayerStats gameState={gameState} userProfile={userProfile} viewMode="full" timeOfDay={timeOfDay} onStartTask={handleStartTask} onBuyItem={handleBuyItem} onStatUpgrade={upgradeStat} onChat={() => {}} onStartEventTravel={(id) => handleTravel(id, true)} onDismissEvent={() => setGameState({ activeEvent: null })} onUpdateTaskScore={handleUpdateTaskScore} onUpdateProfile={handleUpdateProfile} onTaskComplete={handleTaskComplete} globalMusic={globalMusic} onPlayGlobalMusic={() => setGlobalMusic(prev => ({...prev, isPlaying: true}))} onPauseGlobalMusic={() => setGlobalMusic(prev => ({...prev, isPlaying: false}))} onNextGlobalTrack={playNextGlobalTrack} onOpenDiamondShop={() => setShowDiamondShop(true)} />
                    ) : currentView === 'quests' ? (
                        <DailyQuests gameState={gameState} onClaim={handleClaimWrapper} onOpenRanking={() => setCurrentView('ranking')} onRefresh={refreshQuests} />
                    ) : currentView === 'relationships' ? (
                        <RelationshipStats gameState={gameState} onImageClick={(url) => setFullScreenImage(url)} onSocialChat={(id) => { setActiveSocialChat(id); setCurrentView('social_chat'); }} onTutorialClick={handleRelationshipCardClick} />
                    ) : currentView === 'ranking' ? (
                        <RankingScreen currentUser={userProfile} onBack={() => setCurrentView('quests')} />
                    ) : currentView === 'social_chat' ? (
                        // SOCIAL CHAT LAYOUT
                        <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row h-full bg-gray-50/50 dark:bg-slate-900/50">
                            {/* Desktop: Left Panel (Character Image) */}
                            <div className="hidden md:flex w-[40%] bg-white/50 dark:bg-black/20 relative items-center justify-center border-r border-gray-200 dark:border-white/5">
                                <CharacterView 
                                    characterId={activeSocialChat!} 
                                    mood={gameState.currentMoods[activeSocialChat!] || Mood.NEUTRAL} 
                                    isLoading={isTyping} 
                                    lastAction={lastAction} 
                                    disabled={true} // Disabled interactions on image in chat mode for now
                                    isCasualMode={true} // Force nice look
                                    dateScene={gameState.currentDateScene}
                                />
                            </div>

                            {/* Right Panel (Chat) */}
                            <div className="flex-1 flex flex-col relative h-full">
                                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 flex items-center justify-between shadow-lg border-b border-gray-200 dark:border-white/10 z-20">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setCurrentView('relationships')} className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-slate-600 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all border border-gray-200 dark:border-white/5"><ArrowUp className="-rotate-90" size={20}/></button>
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white text-lg tracking-tight">{CHARACTER_DATA[activeSocialChat!].name}</h3>
                                            <div className="flex items-center gap-1.5 text-[10px] text-green-500 dark:text-green-400 font-bold uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]"></span> Online</div>
                                        </div>
                                    </div>
                                </div>
                                <ChatInterface 
                                    characterId={activeSocialChat!} messages={messagesMap[activeSocialChat!]} 
                                    onSendMessage={(txt) => handleSendMessage(txt, activeSocialChat, null)} onAction={(t, dateTarget) => handleAction(t, activeSocialChat, null, dateTarget)} 
                                    onIdleTrigger={() => processAIResponse("[SYSTEM: User is silent.]", undefined, true)} onClearChat={() => setMessagesMap(prev => ({...prev, [activeSocialChat!]: []}))} 
                                    isTyping={isTyping} disabled={gameState.isGameOver || isTyping} currentMood={gameState.currentMoods[activeSocialChat!] || Mood.NEUTRAL} 
                                    loveScore={gameState.loveScores[activeSocialChat!] || 0} inventory={gameState.inventory} onImageClick={(url) => setFullScreenImage(url)} 
                                    energy={gameState.energy} comboStreak={gameState.comboStreaks[activeSocialChat!] || 0} currentTier={gameState.relationshipTiers[activeSocialChat!] || RelationshipTier.STRANGER} 
                                    activeEvent={gameState.activeEvent} tutorialStep={gameState.tutorialStep} lastLoveUpdate={gameState.lastLoveUpdate} unlockedSkills={gameState.unlockedSkills} gold={gameState.gold}
                                    onBuyItem={(id, mid) => handleChatTransaction(id, mid, activeSocialChat, null)} onInputFocus={handleInputFocus} onInputBlur={handleInputBlur}
                                    chemistryScore={gameState.chemistryScores?.[activeSocialChat!] || 0} // PASS CHEMISTRY SCORE
                                    onBuyAction={(t) => handleInstantBuyAction(t, activeSocialChat, null)} // [MARCUS FIX]: Added Handler
                                    onAcceptQuest={handleAcceptQuest} // [MARCUS FIX]: Added Quest Handler for Social Chat
                                    onAddSystemMessage={(text) => {
                                        const systemMsg: Message = {
                                            id: `sys_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                                            sender: 'system',
                                            text,
                                            timestamp: Date.now(),
                                            isEventMessage: true
                                        };
                                        setMessagesMap(prev => ({
                                            ...prev,
                                            [activeSocialChat!]: [...(prev[activeSocialChat!] || []), systemMsg]
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        // MAIN LOCATION VIEW
                        <>
                            {gameState.currentLocation !== 'home' && gameState.currentLocation !== 'basement' && gameState.currentLocation !== 'gacha_shop' && (
                                <div className="absolute top-4 left-0 right-0 z-20 px-4 flex justify-between items-start pointer-events-none">
                                    <div className="flex flex-col items-start gap-2 pointer-events-auto">
                                        <div className={`px-3 py-1.5 rounded-full shadow-lg border text-xs font-bold flex items-center gap-1 transition-all duration-500 backdrop-blur-md ${gameState.currentDateScene ? 'bg-pink-500/80 text-white border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.5)]' : 'bg-white/80 dark:bg-slate-900/60 text-slate-700 dark:text-gray-300 border-white/40 dark:border-white/10'}`}>
                                        {gameState.currentDateScene ? <MapPin size={14} fill="currentColor" /> : currentLoc.icon} {gameState.currentDateScene ? gameState.currentDateScene.name : currentLoc.name}
                                        </div>
                                        <RoleplayTip />
                                    </div>
                                    {/* Action Toggle Button */}
                                    {isActionLoc && (
                                    <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-white/20 dark:border-white/10 flex gap-1 pointer-events-auto ml-auto relative md:absolute md:right-1/2 md:mr-4 md:top-0 ${gameState.tutorialStep === 'location_action_toggle' ? 'z-[220] ring-4 ring-pink-500 shadow-xl' : ''}`}>
                                        {gameState.tutorialStep === 'location_action_toggle' && (<div className="absolute -top-12 -right-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg animate-bounce">Switch Mode! 👇</div>)}
                                        
                                        <button 
                                            onClick={isTalkLocked ? undefined : () => setLocationMode('chat')} 
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${isTalkLocked ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-transparent' : locationMode === 'chat' ? 'bg-[#FF5F1F] text-white shadow-md shadow-orange-500/30' : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10'}`}
                                        >
                                            {isTalkLocked ? <Lock size={14} /> : <MessageCircle size={14} />} Talk
                                        </button>
                                        
                                        <button 
                                            onClick={() => {
                                                setLocationMode('action');
                                                if (gameState.tutorialStep === 'location_action_toggle') {
                                                    setGameState({ tutorialStep: 'shop_buy_cookie', gold: gameState.gold + 50 });
                                                }
                                            }} 
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${locationMode === 'action' ? 'bg-red-600 text-white shadow-md shadow-red-500/30' : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10'}`}
                                        >
                                            Action
                                        </button>
                                    </div>
                                    )}
                                </div>
                            )}
                            
                            {gameState.currentLocation === 'home' ? (
                                <MyRoom 
                                    gameState={gameState} 
                                    timeOfDay={timeOfDay} 
                                    onToggleSleep={handleToggleSleep} 
                                    onInviteGuest={(id) => { 
                                        setMessagesMap(prev => ({ ...prev, [id]: [] })); 
                                        setRoomGuestId(id); 
                                        processAIResponse("[SYSTEM: User invited you to room.]", undefined, true, id); 
                                    }} 
                                    onKickGuest={() => { 
                                        if (roomGuestId) { 
                                            setMessagesMap(prev => ({ ...prev, [roomGuestId]: [] })); 
                                        } 
                                        triggerNotification('Guest Left', 'Visit ended.', [], 'info'); 
                                        setRoomGuestId(null); 
                                    }} 
                                    // [MARCUS FIX]: Added onBuyAction and onAcceptQuest to Guest Chat Props
                                    guestChatProps={roomGuestId ? { 
                                        characterId: roomGuestId, 
                                        messages: messagesMap[roomGuestId], 
                                        onSendMessage: (txt) => handleSendMessage(txt, null, roomGuestId), 
                                        onAction: (t, dateTarget) => handleAction(t, null, roomGuestId, dateTarget), 
                                        onClearChat: () => setMessagesMap(prev => ({ ...prev, [roomGuestId!]: [] })), 
                                        onIdleTrigger: () => processAIResponse("[SYSTEM: User is silent.]", undefined, true, roomGuestId!), 
                                        isTyping, 
                                        disabled: isTyping, 
                                        currentMood: gameState.currentMoods[roomGuestId] || Mood.NEUTRAL, 
                                        loveScore: gameState.loveScores[roomGuestId] || 0, 
                                        inventory: gameState.inventory, 
                                        onImageClick: (url: string) => setFullScreenImage(url), 
                                        energy: gameState.energy, 
                                        comboStreak: gameState.comboStreaks[roomGuestId] || 0, 
                                        currentTier: gameState.relationshipTiers[roomGuestId] || RelationshipTier.STRANGER, 
                                        lastLoveUpdate: gameState.lastLoveUpdate, 
                                        unlockedSkills: gameState.unlockedSkills, 
                                        gold: gameState.gold, 
                                        onBuyItem: (id, mid) => handleChatTransaction(id, mid, null, roomGuestId), 
                                        onInputFocus: handleInputFocus, 
                                        onInputBlur: handleInputBlur, 
                                        chemistryScore: gameState.chemistryScores?.[roomGuestId] || 0, 
                                        onBuyAction: (t) => handleInstantBuyAction(t, null, roomGuestId),
                                        onAcceptQuest: handleAcceptQuest // [MARCUS FIX]
                                    } : null} 
                                    onConsumeItem={handleConsumeItem} 
                                    onRecycleItem={handleRecycleItem} 
                                />
                            ) : gameState.currentLocation === 'basement' ? (
                                <TheBasement 
                                    gameState={gameState} 
                                    onBuyTrack={handleBuyTrack} 
                                    onFinishTrack={handleFinishTrack} 
                                    initialTab={locationMode === 'chat' ? 'talk' : 'vibe'} 
                                    chatHeight={chatHeight} 
                                    onDragStart={handleChatDragStart} 
                                    // [MARCUS FIX]: Added onAcceptQuest to Basement Chat Props
                                    chatProps={{ 
                                        characterId: 'lucas', 
                                        messages: messagesMap['lucas'], 
                                        onSendMessage: (txt) => handleSendMessage(txt, null, null), 
                                        onAction: (t, dateTarget) => handleAction(t, null, null, dateTarget), 
                                        onClearChat: () => setMessagesMap(prev => ({ ...prev, lucas: [] })), 
                                        onIdleTrigger: () => processAIResponse("[SYSTEM: User is silent.]", undefined, true, 'lucas'), 
                                        isTyping, 
                                        disabled: isTyping, 
                                        currentMood: gameState.currentMoods.lucas || Mood.NEUTRAL, 
                                        loveScore: gameState.loveScores.lucas || 0, 
                                        inventory: gameState.inventory, 
                                        onImageClick: (url: string) => setFullScreenImage(url), 
                                        energy: gameState.energy, 
                                        comboStreak: gameState.comboStreaks.lucas || 0, 
                                        currentTier: gameState.relationshipTiers.lucas || RelationshipTier.STRANGER, 
                                        activeEvent: gameState.activeEvent, 
                                        lastLoveUpdate: gameState.lastLoveUpdate, 
                                        partyMemberId: gameState.partyMember, 
                                        unlockedSkills: gameState.unlockedSkills, 
                                        onDragStart: handleChatDragStart, 
                                        gold: gameState.gold, 
                                        onBuyItem: (id, mid) => handleChatTransaction(id, mid, null, null), 
                                        onInputFocus: handleInputFocus, 
                                        onInputBlur: handleInputBlur, 
                                        chemistryScore: gameState.chemistryScores?.lucas || 0, 
                                        onBuyAction: (t) => handleInstantBuyAction(t, null, null),
                                        onAcceptQuest: handleAcceptQuest // [MARCUS FIX]
                                    }} 
                                />
                            ) : showChat ? (
                                // SPLIT VIEW FOR NORMAL LOCATIONS
                                <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row h-full">
                                    
                                    {/* [MARCUS NEW]: CHEMISTRY METER FIXED OVERLAY */}
                                    {/* Positioned absolutely within the split container, so it floats over CharacterView but stays fixed */}
                                    {currentLoc.characterId && (
                                        <ChemistryMeter score={gameState.chemistryScores?.[currentLoc.characterId] || 0} />
                                    )}

                                    {gameState.currentDateScene && (
                                        <div className="absolute inset-0 z-0">
                                            <img src={gameState.currentDateScene.bgImage} className="w-full h-full object-cover animate-in fade-in duration-700" alt="Date Location" />
                                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
                                        </div>
                                    )}
                                    
                                    {/* Left: Character View */}
                                    <div className="flex-1 min-h-0 relative flex items-end justify-center overflow-hidden md:w-1/2 md:border-r md:border-white/10">
                                        <CharacterView 
                                            characterId={currentLoc.characterId!} 
                                            mood={gameState.currentMoods[currentLoc.characterId!] || Mood.NEUTRAL} 
                                            isLoading={isTyping} 
                                            lastAction={lastAction} 
                                            disabled={gameState.isGameOver || isTyping} 
                                            isCasualMode={isFiaOffDuty || isMiguelOffDuty || isBamOffDuty || isMiaNight} // [MARCUS FIX] Added isMiaNight logic
                                            dateScene={gameState.currentDateScene}
                                        />
                                    </div>

                                    {/* Right: Chat Interface */}
                                    <div 
                                        style={{ height: `${chatHeight}%` }} // Mobile Height
                                        // [MARCUS FIX]: Increased z-index from 10 to 20 to sit above ChemistryMeter (z-10)
                                        className={`flex-none z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] bg-transparent transition-[height] duration-75 ease-out md:!h-full md:w-1/2 md:static md:shadow-none`}
                                    >
                                        <ChatInterface {...commonChatProps} />
                                    </div>
                                </div>
                            ) : (
                                <div className={`flex-1 overflow-y-auto ${gameState.currentLocation === 'gacha_shop' ? 'p-0' : 'p-4 pt-16'}`}>
                                    <PlayerStats gameState={gameState} userProfile={userProfile} onStartTask={handleStartTask} onBuyItem={handleBuyItem} viewMode="location_context" timeOfDay={timeOfDay} onChat={() => setLocationMode('chat')} onUpdateTaskScore={handleUpdateTaskScore} onTaskComplete={handleTaskComplete} />
                                </div>
                            )}
                        </>
                    )}
                    </ErrorBoundary>
                </div>
            </div>
        </main>
        
        {/* RIGHT SIDEBAR NAVIGATION (DESKTOP) */}
        <nav className="hidden md:flex h-full bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-white/5 z-40 flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.05)] dark:shadow-[-10px_0_30px_rgba(0,0,0,0.3)]">
             <Navigation currentView={currentView} onViewChange={handleViewChange} hasStatPoints={hasStatPoints} hasClaimableQuests={hasClaimableQuests} hasActiveEvent={!!gameState.activeEvent} />
        </nav>

        {/* BOTTOM NAVIGATION (MOBILE) */}
        <div className={`md:hidden flex-none transition-all duration-300 ease-in-out ${isInputFocused ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-[72px] opacity-100 overflow-visible'}`}>
            {!['intro', 'chat_guide', 'energy_guide', 'goals_intro', 'goals_claim', 'goals_rank', 'relationships_intro_1', 'relationships_intro_2', 'relationships_tap', 'story_intro', 'map_intro', 'map_pin_cafe', 'map_drawer', 'me_intro', 'me_exp', 'me_level', 'me_stats', 'me_skills'].includes(gameState.tutorialStep || '') && (
            <Navigation currentView={currentView} onViewChange={handleViewChange} hasStatPoints={hasStatPoints} hasClaimableQuests={hasClaimableQuests} hasActiveEvent={!!gameState.activeEvent} />
            )}
        </div>

        {gameState.tutorialStep && (
          <TutorialOverlay 
            step={gameState.tutorialStep} 
            onNext={handleTutorialNext} 
            onComplete={handleTutorialComplete} 
            playerName={userProfile?.name || 'User'} 
          />
        )}
      </div> 
    </div>
    );
};

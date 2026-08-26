import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { GameState, ShopItem, Workout, Job, UserProfile, CharacterId, TimeOfDay, PlayerAttributes, LocationId, StyleItem } from '../types';
import { ActiveTaskOverlay } from './ActiveTaskOverlay';
import { signOut, auth } from '../services/firebase';
import { PartyPopper, Zap } from 'lucide-react';
import { LOCATION_IMAGES } from '../constants';
import { getCharacterImageUrl } from '../services/firebase';
import { useGameStore } from '../store/gameStore'; 

const WorkView = lazy(() => import('./hub/WorkView').then(module => ({ default: module.WorkView })));
const GymView = lazy(() => import('./hub/GymView').then(module => ({ default: module.GymView })));
const ShopView = lazy(() => import('./hub/ShopView').then(module => ({ default: module.ShopView })));
const MarketView = lazy(() => import('./hub/MarketView').then(module => ({ default: module.MarketView })));
const MallView = lazy(() => import('./hub/MallView').then(module => ({ default: module.MallView })));
const GachaPongView = lazy(() => import('./hub/GachaPongView').then(module => ({ default: module.GachaPongView })));
const ProfileView = lazy(() => import('./hub/ProfileView').then(module => ({ default: module.ProfileView })));

interface PlayerStatsProps {
  gameState: GameState;
  onStartTask?: (type: 'work' | 'gym' | 'party', item: any) => void;
  onBuyItem?: (item: ShopItem, targetCharId?: CharacterId) => void;
  onStatUpgrade?: (stat: keyof PlayerAttributes) => void;
  onChat?: () => void;
  onStartEventTravel?: (locId: LocationId) => void;
  onDismissEvent?: () => void;
  onUpdateTaskScore?: (score: number) => void;
  onUpdateProfile?: (profile: UserProfile) => void;
  onTaskComplete?: () => void; // NEW: Pass down completion handler
  userProfile: UserProfile | null;
  viewMode?: 'full' | 'location_context';
  timeOfDay?: TimeOfDay;
  // NEW GLOBAL MUSIC PROPS
  globalMusic?: { isPlaying: boolean, trackIndex: number, volume: number };
  onPlayGlobalMusic?: () => void;
  onPauseGlobalMusic?: () => void;
  onNextGlobalTrack?: () => void;
  onOpenDiamondShop?: () => void; // New Prop
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ 
    gameState, onStartTask, onBuyItem, onStatUpgrade, onChat, onStartEventTravel, onDismissEvent, onUpdateTaskScore, onUpdateProfile, onTaskComplete, userProfile, viewMode = 'full', timeOfDay = 'day',
    globalMusic, onPlayGlobalMusic, onPauseGlobalMusic, onNextGlobalTrack, onOpenDiamondShop
}) => {
  const isContextMode = viewMode === 'location_context';
  const isOffice = isContextMode && gameState.currentLocation === 'office';
  const isCafe = isContextMode && gameState.currentLocation === 'cafe';
  const isGym = isContextMode && gameState.currentLocation === 'gym';
  const isMarket = isContextMode && gameState.currentLocation === 'market';
  const isMall = isContextMode && gameState.currentLocation === 'mall'; 
  const isGacha = isContextMode && gameState.currentLocation === 'gacha_shop'; // Gacha logic

  const [activeTab, setActiveTab] = useState<'profile' | 'work' | 'shop' | 'gym' | 'market' | 'mall' | 'gacha'>(
    isOffice ? 'work' : isCafe ? 'shop' : isGym ? 'gym' : isMarket ? 'market' : isMall ? 'mall' : isGacha ? 'gacha' : 'profile'
  );
  
  // Floating Text State (Generic UI)
  const [floatingTexts, setFloatingTexts] = useState<{id: number, text: string, x: number, y: number, color: string}[]>([]);
  
  // Task Execution State
  const [startCountdown, setStartCountdown] = useState<number | null>(null);
  const [pendingTask, setPendingTask] = useState<{type: 'work'|'gym'|'party', item: any} | null>(null);
  const taskExecutionRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Store actions
  const buyStyle = useGameStore(state => state.buyStyle);
  const equipStyle = useGameStore(state => state.equipStyle);

  const hasSmartHome = (gameState.unlockedSkills || []).includes('work_from_home');

  // Countdown Logic
  useEffect(() => {
    if (!pendingTask) {
        setStartCountdown(null);
        taskExecutionRef.current = false;
        return;
    }
    setStartCountdown(3);
    const interval = setInterval(() => {
        setStartCountdown(prev => {
            if (prev === null || prev <= 1) {
                clearInterval(interval);
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [pendingTask]);

  // Trigger Task Execution
  useEffect(() => {
      if (startCountdown === 0 && pendingTask && !taskExecutionRef.current) {
          taskExecutionRef.current = true;
          if (onStartTask) {
              onStartTask(pendingTask.type, pendingTask.item);
          }
          setTimeout(() => {
              setPendingTask(null); 
              setStartCountdown(null);
          }, 500);
      }
  }, [startCountdown, pendingTask, onStartTask]);

  // TUTORIAL SCROLL LOGIC
  useEffect(() => {
      if (gameState.tutorialStep === 'me_skills' && scrollContainerRef.current) {
          // Scroll to reveal skills (bottom of profile)
          setTimeout(() => {
              if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollTo({ 
                      top: scrollContainerRef.current.scrollHeight, 
                      behavior: 'smooth' 
                  });
              }
          }, 500);
      }
  }, [gameState.tutorialStep]);

  // UI Helpers
  const addFloatingText = (e: React.MouseEvent, text: string, color: string) => {
    // If e is null/undefined (triggered programmatically), default to center
    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : window.innerHeight / 2;
    const newText = { id: Date.now(), text, x, y, color };
    setFloatingTexts(prev => [...prev, newText]);
    setTimeout(() => { setFloatingTexts(prev => prev.filter(t => t.id !== newText.id)); }, 1000);
  };

  // --- Handlers ---
  
  const handleStartWorkWrapper = (type: 'work', job: Job) => {
      if (gameState.energy < job.energyCost) return;
      setPendingTask({ type: 'work', item: job });
  };

  const handleStartGymWrapper = (type: 'gym', workout: Workout) => {
      if (gameState.energy < workout.energyCost) return;
      if (workout.goldCost && gameState.gold < workout.goldCost) return;
      setPendingTask({ type: 'gym', item: workout });
  };

  const handleBuyItemWrapper = (item: ShopItem) => {
      onBuyItem?.(item);
  };

  const handleBuyStyleWrapper = (style: StyleItem) => {
      if (gameState.gold >= style.cost) {
          buyStyle(style.id, style.cost);
          // Visual feedback can be added here
      }
  };

  const handlePartyWrapper = () => {
      if (gameState.energy < 20) return;
      onStartTask?.('party', {});
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch (error) { console.error("Logout failed", error); }
  };

  // --- Renderers ---

  const renderMarket = () => {
      return (
          <div className="space-y-4">
              <MarketView 
                  gameState={gameState} 
                  onBuyItem={handleBuyItemWrapper}
                  onBack={hasSmartHome && !isMarket ? () => setActiveTab('profile') : undefined}
              />
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Activities</h4>
                  <button 
                      onClick={handlePartyWrapper} 
                      disabled={gameState.energy < 20}
                      className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white p-6 rounded-[2rem] shadow-xl shadow-fuchsia-900/20 active:scale-95 transition-all group relative overflow-hidden"
                  >
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
                      <div className="flex flex-col items-center gap-2 relative z-10">
                          <div className="p-3 bg-white/20 rounded-full mb-1 group-hover:rotate-12 transition-transform">
                              <PartyPopper size={32} />
                          </div>
                          <h3 className="text-2xl font-black italic tracking-tight">PARTY HARD</h3>
                          <p className="text-white/80 text-sm font-medium">Dance all night with Erin</p>
                          <div className="mt-2 bg-black/30 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                              <Zap size={14} className="text-yellow-400 fill-yellow-400" /> -20 Energy
                          </div>
                      </div>
                  </button>
              </div>
          </div>
      );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'work': return <WorkView gameState={gameState} onStartTask={handleStartWorkWrapper} onChat={onChat} hasSmartHome={hasSmartHome} isOffice={isOffice} timeOfDay={timeOfDay} onBack={() => setActiveTab('profile')} />;
      case 'gym': return <GymView gameState={gameState} onStartTask={handleStartGymWrapper} hasSmartHome={hasSmartHome} isGym={isGym} timeOfDay={timeOfDay} onBack={() => setActiveTab('profile')} />;
      case 'shop': return <ShopView gameState={gameState} onBuyItem={handleBuyItemWrapper} hasSmartHome={hasSmartHome} isCafe={isCafe} timeOfDay={timeOfDay} onBack={() => setActiveTab('profile')} />;
      case 'market': return renderMarket();
      case 'mall': return <MallView gameState={gameState} onBuyStyle={handleBuyStyleWrapper} onBack={hasSmartHome && !isMall ? () => setActiveTab('profile') : undefined} />;
      case 'gacha': return <GachaPongView gameState={gameState} onBack={() => setActiveTab('profile')} />; // New Gacha View
      default: return <ProfileView 
                        gameState={gameState} 
                        userProfile={userProfile} 
                        onUpdateProfile={onUpdateProfile!} 
                        onStatUpgrade={onStatUpgrade!} 
                        onDismissEvent={onDismissEvent!} 
                        onStartEventTravel={onStartEventTravel!} 
                        onLogout={handleLogout} 
                        onChangeTab={setActiveTab}
                        onEquipStyle={equipStyle} // Pass store action
                        globalMusic={globalMusic}
                        onPlayGlobalMusic={onPlayGlobalMusic}
                        onPauseGlobalMusic={onPauseGlobalMusic}
                        onNextGlobalTrack={onNextGlobalTrack}
                        onOpenDiamondShop={onOpenDiamondShop}
                        timeOfDay={timeOfDay}
                      />;
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-gray-50/50 dark:bg-slate-900/50 overflow-x-hidden">
      {floatingTexts.map(ft => (
        <div key={ft.id} className={`fixed pointer-events-none text-lg font-bold animate-pop-text z-[100] ${ft.color}`} style={{ left: ft.x, top: ft.y }}>{ft.text}</div>
      ))}
      
      {/* Countdown Overlay */}
      {startCountdown !== null && startCountdown > 0 && (
          <div className="absolute inset-0 z-[60] bg-slate-100/90 dark:bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto animate-in fade-in duration-300">
              <div key={startCountdown} className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-500 to-purple-600 animate-in zoom-in-50 duration-300 drop-shadow-sm">
                  {startCountdown}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-bold mt-8 uppercase tracking-[0.5em] animate-pulse">Get Ready</p>
          </div>
      )}
      
      <ActiveTaskOverlay activeTask={gameState.activeTask} onUpdateScore={onUpdateTaskScore} onComplete={onTaskComplete} />
      
      <div 
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto relative z-0 ${activeTab === 'gacha' ? 'p-0' : 'p-4'}`}
      >
        <Suspense fallback={<div className="min-h-[240px] flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">กำลังเตรียมพื้นที่...</div>}>
          {renderContent()}
        </Suspense>
      </div>
    </div>
  );
};

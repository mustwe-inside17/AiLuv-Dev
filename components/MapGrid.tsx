
// ... existing imports ...
import React, { useState, useEffect, useRef, MouseEvent, TouchEvent } from 'react';
import { LocationId, TimeOfDay, ActiveEvent, CharacterId, StoryChapter, RelationshipTier } from '../types';
import { LOCATIONS, TRAVEL_COST, LOCATION_IMAGES, CHARACTER_DATA, STORY_CHAPTERS, SHOP_ITEMS } from '../constants';
import { FASHION_ITEMS } from '../constants/fashion'; 
import { MapPin, Zap, Dumbbell, Briefcase, PartyPopper, Lock, AlertCircle, X, Navigation, User, Clock, ShoppingBag, Music, Star, Users, Sparkles, BookOpen, Gem, ArrowDown, Calendar, Crown, Sun, Moon, CloudSun, Sunset, Backpack, MessageCircle } from 'lucide-react';
import { getCharacterImageUrl } from '../services/firebase';
import { StoryOverlay } from './StoryOverlay';
import { DailyLoginModal } from './DailyLoginModal'; 
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../store/gameStore';
import { TransitionImage } from './ui/TransitionImage'; 
import { VipPassModal } from './VipPassModal'; // NEW IMPORT

const CITY_RUMORS = [
    "ลองไปออกกำลังกายที่ Gym เพื่อเพิ่ม Max Energy ดูสิ!",
    "แวะไป AiMaid Cafe เติมพลังด้วยขนมอร่อยๆ ไหม?",
    "เขาว่ากันว่ามีเสียงเพลงแปลกๆ ออกมาจาก The Basement ทุกคืน...",
    "ลองไปเดิน Night Market สิ เขาว่ากันว่าดีเจที่นั่นน่ารักมาก!",
    "อย่าลืมเช็คโทรศัพท์เพื่อคุยแชทกับเพื่อนๆ ล่ะ!",
    "เควสต์ประจำวันจะรีเซ็ตตอนเที่ยงคืนนะ อย่าลืมเคลียร์ล่ะ!",
    "ถ้าเงิน (Coins) หมด ลองหางานพาร์ทไทม์ทำดูสิ!"
];

// ... (Keep existing interface & styles) ...
interface MapGridProps {
  currentLocation: LocationId;
  onTravel: (id: LocationId) => void;
  energy: number;
  disabled?: boolean;
  timeOfDay: TimeOfDay;
  activeEvent: ActiveEvent | null;
  unlockedSkills?: string[];
  partyMember?: CharacterId | null;
  onOpenInventory?: () => void;
}

// ... (Keep ANIMATION_STYLES) ...
const ANIMATION_STYLES = `
  @keyframes drawer-slide-up {
    0% { transform: translateY(100%); opacity: 0.8; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes drawer-slide-down {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(100%); opacity: 0; }
  }
  @keyframes desktop-drawer-pop {
    0% { transform: translate(-50%, 100%); opacity: 0; }
    100% { transform: translate(-50%, 0); opacity: 1; }
  }
  @keyframes desktop-drawer-exit {
    0% { transform: translate(-50%, 0); opacity: 1; }
    100% { transform: translate(-50%, 20px); opacity: 0; }
  }
  @keyframes pin-heartbeat {
    0% { transform: translate(-50%, -50%) scale(1); }
    14% { transform: translate(-50%, -50%) scale(1.08); }
    28% { transform: translate(-50%, -50%) scale(1); }
    42% { transform: translate(-50%, -50%) scale(1.08); }
    70% { transform: translate(-50%, -50%) scale(1); }
    100% { transform: translate(-50%, -50%) scale(1); }
  }
  .animate-drawer-enter { animation: drawer-slide-up 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
  .animate-drawer-exit { animation: drawer-slide-down 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
  
  /* Desktop Specific Animations */
  @media (min-width: 768px) {
    .animate-drawer-enter { animation: desktop-drawer-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    .animate-drawer-exit { animation: desktop-drawer-exit 0.3s ease-in forwards; }
  }

  .animate-pin-heartbeat { animation: pin-heartbeat 2s ease-in-out infinite; }
`;

export const MapGrid: React.FC<MapGridProps> = ({ currentLocation, onTravel, energy, disabled, timeOfDay, activeEvent, unlockedSkills = [], partyMember, onOpenInventory }) => {
  const [mapImg, setMapImg] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<LocationId | null>(null);
  
  // Rumor Ticker State
  const [rumorIndex, setRumorIndex] = useState(0);
  const [rumorVisible, setRumorVisible] = useState(true);

  useEffect(() => {
      const interval = setInterval(() => {
          setRumorVisible(false); // trigger fade out
          setTimeout(() => {
              setRumorIndex((prev) => (prev + 1) % CITY_RUMORS.length);
              setRumorVisible(true); // trigger fade in
          }, 500); // Wait for fade out to complete before changing text and fading in
      }, 7000); // Change rumor every 7 seconds

      return () => clearInterval(interval);
  }, []);
  
  // Realtime clock
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const update = () => setTimeStr(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    update();
    const i = setInterval(update, 1000); 
    return () => clearInterval(i);
  }, []);

  const getTimeIcon = () => {
      switch(timeOfDay) {
          case 'morning': return <CloudSun size={14} className="text-yellow-500" />;
          case 'day': return <Sun size={14} className="text-orange-500" />;
          case 'evening': return <Sunset size={14} className="text-rose-500" />;
          default: return <Moon size={14} className="text-indigo-300" />;
      }
  };

  const getTimeLabel = () => {
      switch(timeOfDay) {
          case 'morning': return { temp: '24°C', text: 'Morning' };
          case 'day': return { temp: '28°C', text: 'Sunny' };
          case 'evening': return { temp: '22°C', text: 'Sunset' };
          default: return { temp: '18°C', text: 'Clear' };
      }
  };

  const [isClosing, setIsClosing] = useState(false);
  const [assetsCache, setAssetsCache] = useState<Record<string, { cover: string, npc: string }>>({});
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false); 
  const [isMapReady, setIsMapReady] = useState(false); 
  
  // MODAL STATES
  const [showStory, setShowStory] = useState(false);
  const [showDailyLogin, setShowDailyLogin] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false); // NEW VIP MODAL
  
  const gameState = useGameStore(useShallow(state => ({
      tutorialStep: state.tutorialStep,
      gold: state.gold,
      currentExp: state.currentExp,
      totalGoldEarned: state.totalGoldEarned,
      tutorialsSeen: state.tutorialsSeen,
      currentChapter: state.currentChapter,
      dailyLogin: state.dailyLogin,
      vipDailyClaimed: state.vipDailyClaimed
  }))) as any;
  const { setGameState, addItem, unlockAchievement, addStyle, addDiamonds, isVip } = useGameStore(useShallow(state => ({
      setGameState: state.setGameState,
      addItem: state.addItem,
      unlockAchievement: state.unlockAchievement,
      addStyle: state.addStyle,
      addDiamonds: state.addDiamonds,
      isVip: state.isVip
  })));

  // ... (Keep existing refs and effects for map loading/centering) ...
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const lastOffsetRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const lastInteractionRef = useRef<number>(0); 

  const isTutorialCafePin = gameState.tutorialStep === 'map_pin_cafe';
  const isTutorialDrawer = gameState.tutorialStep === 'map_drawer';

  useEffect(() => {
      if (isTutorialDrawer) {
          setSelectedLocation('cafe');
      }
  }, [isTutorialDrawer]);

  useEffect(() => {
    const loadHeader = async () => {
        const path = timeOfDay === 'night' ? LOCATION_IMAGES.map_night : LOCATION_IMAGES.map_day;
        const url = await getCharacterImageUrl(path);
        if (url) setMapImg(url);
    };
    loadHeader();
  }, [timeOfDay]);

  // ... (Keep asset preloading effect) ...
  useEffect(() => {
      const preloadAllAssets = async () => {
          const newCache: Record<string, { cover: string, npc: string }> = {};
          const isNight = timeOfDay === 'night';

          const fetchAndCache = async (path: string): Promise<string> => {
              if (!path) return '';
              const url = await getCharacterImageUrl(path);
              if (url) {
                  const img = new Image();
                  img.src = url; 
                  return url;
              }
              return '';
          };

          const tasks = Object.keys(LOCATIONS).map(async (key) => {
              const locId = key as LocationId;
              const loc = LOCATIONS[locId];
              let coverPath = '';
              switch (locId) {
                  case 'home': coverPath = isNight ? LOCATION_IMAGES.room_night : LOCATION_IMAGES.room_day; break;
                  case 'condo': coverPath = isNight ? LOCATION_IMAGES.condo_night : LOCATION_IMAGES.condo_day; break;
                  case 'gym': coverPath = isNight ? LOCATION_IMAGES.gym_night : LOCATION_IMAGES.gym_day; break;
                  case 'cafe': coverPath = isNight ? LOCATION_IMAGES.shop_night : LOCATION_IMAGES.shop_day; break;
                  case 'office': coverPath = isNight ? LOCATION_IMAGES.office_night : LOCATION_IMAGES.office_day; break;
                  case 'market': coverPath = LOCATION_IMAGES.market_night; break;
                  case 'basement': coverPath = LOCATION_IMAGES.basement_bg; break;
                  case 'cafe_2f': coverPath = isNight ? LOCATION_IMAGES.cafe_2f_night : LOCATION_IMAGES.cafe_2f_day; break;
                  case 'mall': coverPath = isNight ? LOCATION_IMAGES.mall_night : LOCATION_IMAGES.mall_day; break;
                  case 'gacha_shop': coverPath = LOCATION_IMAGES.gacha_shop; break;
                  case 'vet': coverPath = isNight ? LOCATION_IMAGES.vet_night : LOCATION_IMAGES.vet_day; break;
                  case 'maid_cafe': coverPath = isNight ? LOCATION_IMAGES.maid_cafe_night : LOCATION_IMAGES.maid_cafe_day; break;
              }
              let npcPath = '';
              if (loc.characterId) {
                  const charData = CHARACTER_DATA[loc.characterId];
                  if (charData && charData.baseImg) npcPath = charData.baseImg;
              }
              const [cover, npc] = await Promise.all([fetchAndCache(coverPath), fetchAndCache(npcPath)]);
              newCache[locId] = { cover, npc };
          });
          await Promise.all(tasks);
          setAssetsCache(prev => ({ ...prev, ...newCache }));
      };
      preloadAllAssets();
  }, [timeOfDay]);

  // ... (Keep ResizeObserver and centerMap logic) ...
  useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      const observer = new ResizeObserver(() => { centerMap(); });
      observer.observe(container);
      centerMap();
      return () => observer.disconnect();
  }, []);

  const centerMap = () => {
      requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const containerW = containerRef.current.clientWidth;
          const containerH = containerRef.current.clientHeight;
          if (containerW === 0 || containerH === 0) return; 

          const MAP_WIDTH = 1152;
          const MAP_HEIGHT = 1152;

          const targetX = 0.50 * MAP_WIDTH;
          const targetY = 0.50 * MAP_HEIGHT;
          let initialX = (containerW / 2) - targetX;
          let initialY = (containerH / 2) - targetY;
          
          const minX = containerW - MAP_WIDTH;
          const maxX = 0;
          const minY = containerH - MAP_HEIGHT;
          const maxY = 0;

          if (MAP_WIDTH > containerW) initialX = Math.min(maxX, Math.max(minX, initialX));
          else initialX = (containerW - MAP_WIDTH) / 2;

          if (MAP_HEIGHT > containerH) initialY = Math.min(maxY, Math.max(minY, initialY));
          else initialY = (containerH - MAP_HEIGHT) / 2;
          
          setOffset({ x: initialX, y: initialY });
          lastOffsetRef.current = { x: initialX, y: initialY };
          if (!isMapReady) setIsMapReady(true);
      });
  };

  // ... (Keep drag handlers and pin click handlers) ...
  const handleDragStart = (clientX: number, clientY: number) => {
      if (isTutorialCafePin || isTutorialDrawer) return;
      setIsDragging(true);
      setHasMoved(false);
      dragStartRef.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
      if (!isDragging || !dragStartRef.current || !containerRef.current) return;
      const deltaX = clientX - dragStartRef.current.x;
      const deltaY = clientY - dragStartRef.current.y;
      if (Math.abs(deltaX) > 15 || Math.abs(deltaY) > 15) setHasMoved(true);

      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight;
      const MAP_WIDTH = 1152;
      const MAP_HEIGHT = 1152;
      const minX = containerW - MAP_WIDTH;
      const maxX = 0;
      const minY = containerH - MAP_HEIGHT;
      const maxY = 0;

      let newX = lastOffsetRef.current.x + deltaX;
      let newY = lastOffsetRef.current.y + deltaY;
      
      if (MAP_WIDTH > containerW) newX = Math.min(maxX, Math.max(minX, newX));
      else newX = (containerW - MAP_WIDTH) / 2;

      if (MAP_HEIGHT > containerH) newY = Math.min(maxY, Math.max(minY, newY));
      else newY = (containerH - MAP_HEIGHT) / 2;
      
      setOffset({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
      setIsDragging(false);
      lastOffsetRef.current = offset;
      dragStartRef.current = null;
  };

  const handlePinClick = (locId: LocationId) => {
      if (!hasMoved) {
          if (isTutorialCafePin && locId !== 'cafe') return;
          if (Date.now() - lastInteractionRef.current < 100) return;
          lastInteractionRef.current = Date.now();
          setIsClosing(false); 
          setSelectedLocation(locId);
          if (isTutorialCafePin && locId === 'cafe') onTravel(locId);
      }
  };

  const handleCloseDrawer = (e?: React.MouseEvent) => {
      if (isTutorialDrawer) return;
      if (Date.now() - lastInteractionRef.current < 600) return;
      e?.stopPropagation();
      setIsClosing(true);
      setTimeout(() => {
          setSelectedLocation(null);
          setIsClosing(false);
      }, 700); 
  };

  // ... (Keep handleStoryClaim) ...
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

  const onTouchStart = (e: TouchEvent) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchEnd = () => handleDragEnd();
  const onMouseDown = (e: MouseEvent) => handleDragStart(e.clientX, e.clientY);
  const onMouseMove = (e: MouseEvent) => { if(isDragging) handleDragMove(e.clientX, e.clientY); };
  const onMouseUp = () => handleDragEnd();
  const onMouseLeave = () => handleDragEnd();

  const isLocationClosed = (locId: LocationId) => {
      const hour = new Date().getHours();
      if (locId === 'market') return !(hour >= 21 || hour < 4);
      if (locId === 'basement') return !(hour >= 18 || hour < 6);
      return false;
  };

  const getOpeningHours = (locId: LocationId) => {
      if (locId === 'market') return "21:00 - 04:00";
      if (locId === 'basement') return "18:00 - 06:00";
      return "24/7";
  };

  // ... (Keep getFeatureInfo) ...
  const getFeatureInfo = (locId: LocationId) => {
      switch (locId) {
          case 'office': return { label: 'Work', icon: <Briefcase size={10} fill="currentColor" />, color: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' };
          case 'gym': return { label: 'Train', icon: <Dumbbell size={10} fill="currentColor" />, color: 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' };
          case 'cafe': return { label: 'Shop', icon: <ShoppingBag size={10} fill="currentColor" />, color: 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' };
          case 'market': return { label: 'Shop', icon: <ShoppingBag size={10} fill="currentColor" />, color: 'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-800' };
          case 'basement': return { label: 'Music', icon: <Music size={10} fill="currentColor" />, color: 'bg-violet-100 text-violet-600 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800' };
          case 'home': return { label: `Recovery`, icon: <Zap size={10} fill="currentColor" />, color: 'bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800' };
          case 'mall': return { label: 'Fashion', icon: <ShoppingBag size={10} fill="currentColor" />, color: 'bg-cyan-100 text-cyan-600 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800' }; 
          case 'gacha_shop': return { label: 'Gacha', icon: <Gem size={10} fill="currentColor" />, color: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' };
          case 'maid_cafe': return { label: 'Maid/Bar', icon: <Sparkles size={10} fill="currentColor" />, color: 'bg-pink-100 text-pink-600 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800' };
          default: return null; 
      }
  };

  const handleTravelConfirm = () => {
      if (selectedLocation) {
          onTravel(selectedLocation);
          if (!isTutorialDrawer) {
              setSelectedLocation(null);
          }
      }
  };

  // ... (Keep Story Click logic) ...
  const handleStoryClick = () => {
      const hasSeenStoryTut = gameState.tutorialsSeen?.includes('story');
      if (!hasSeenStoryTut) {
          setGameState({ 
              tutorialStep: 'story_intro',
              tutorialsSeen: [...(gameState.tutorialsSeen || []), 'story'] 
          });
      }
      setShowStory(true);
  };

  const isChapterClaimable = () => {
      const chapter = STORY_CHAPTERS.find(c => c.id === gameState.currentChapter);
      if (!chapter) return false;
      
      const fullState = useGameStore.getState();
      
      return chapter.tasks.every(task => {
          const target = Number(task.target);
          let current = 0;
          switch (task.type) {
              case 'level': current = fullState.level || 1; break;
              case 'met_count': current = (fullState.metCharacters || []).length; break;
              case 'earn_gold': current = fullState.totalGoldEarned || 0; break;
              case 'work_count': current = fullState.totalWorkCount || 0; break;
              case 'gym_count': current = fullState.totalGymCount || 0; break;
              case 'friend_count': {
                  const TIER_ORDER: Record<string, number> = { stranger: 0, acquaintance: 1, friend: 2, flirting: 3, best_friend: 3, partner: 4, soul_sibling: 4, soulmate: 5, eternal: 6 };
                  current = (Object.values(fullState.relationshipTiers || {})).filter(t => (TIER_ORDER[t] || 0) >= 2).length; 
                  break;
              }
              case 'flirting_count': {
                  const TIER_ORDER: Record<string, number> = { stranger: 0, acquaintance: 1, friend: 2, flirting: 3, best_friend: 3, partner: 4, soul_sibling: 4, soulmate: 5, eternal: 6 };
                  current = (Object.values(fullState.relationshipTiers || {})).filter(t => (TIER_ORDER[t] || 0) >= 3).length; 
                  break;
              }
              case 'partner_count': {
                  const TIER_ORDER: Record<string, number> = { stranger: 0, acquaintance: 1, friend: 2, flirting: 3, best_friend: 3, partner: 4, soul_sibling: 4, soulmate: 5, eternal: 6 };
                  current = (Object.values(fullState.relationshipTiers || {})).filter(t => (TIER_ORDER[t] || 0) >= 4).length; 
                  break;
              }
              case 'soulmate_count': {
                  const TIER_ORDER: Record<string, number> = { stranger: 0, acquaintance: 1, friend: 2, flirting: 3, best_friend: 3, partner: 4, soul_sibling: 4, soulmate: 5, eternal: 6 };
                  current = (Object.values(fullState.relationshipTiers || {})).filter(t => (TIER_ORDER[t] || 0) >= 5).length; 
                  break;
              }
              case 'skill_count': current = (fullState.unlockedSkills || []).length; break;
              case 'style_count': current = (fullState.ownedStyles || []).length; break;
              case 'secret_count': current = (fullState.unlockedSecrets || []).length; break;
              case 'track_count': current = Math.max(0, (fullState.unlockedTracks || []).length - 1); break;
              case 'current_gold': current = fullState.gold || 0; break;
              case 'stats_min': current = fullState.stats ? Math.min(fullState.stats.vit, fullState.stats.int, fullState.stats.cha, fullState.stats.luck) : 0; break;
              case 'invite_party_count': current = Math.max((fullState.totalPartyInvites || 0), (fullState.partyMember ? 1 : 0)); break;
              case 'spend_gold': current = fullState.totalGoldSpent || 0; break;
              case 'own_item':
                  if (task.targetId) {
                      const hasInInventory = (fullState.inventory?.[task.targetId] || 0) > 0;
                      const hasInStyles = (fullState.ownedStyles || []).includes(task.targetId);
                      current = (hasInInventory || hasInStyles) ? 1 : 0;
                  }
                  break;
          }
          return current >= target;
      });
  };

  const currentChapter = STORY_CHAPTERS.find(c => c.id === gameState.currentChapter) || STORY_CHAPTERS[0];
  const showRedDot = isChapterClaimable();

  const todayStr = new Date().toDateString();
  const hasDailyClaim = gameState.dailyLogin.lastClaimDate !== todayStr;
  const isVipDailyClaimable = isVip && gameState.vipDailyClaimed !== todayStr;

  // --- BUTTON HELPERS FOR MOBILE/DESKTOP SWITCHING ---
  const vipButton = (
      <button 
          onClick={() => setShowVipModal(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center pointer-events-auto transition-all shadow-md active:scale-95 bg-gradient-to-tr from-yellow-300 to-amber-500 text-white animate-bounce-soft border-2 border-white dark:border-slate-800 relative group"
      >
          {isVipDailyClaimable && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
          <Crown size={20} fill="currentColor" />
          {/* Glow */}
          <div className="absolute inset-0 bg-yellow-400/30 blur-lg rounded-full -z-10 group-hover:bg-yellow-400/50 transition-colors"></div>
      </button>
  );

  const dailyLoginButton = (
      <button 
          onClick={() => setShowDailyLogin(true)}
          className={`
              w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center pointer-events-auto transition-all shadow-md active:scale-95 relative
              ${hasDailyClaim 
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-2 border-white animate-pulse' 
                  : 'bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-500'}
          `}
      >
          {hasDailyClaim && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
          <Calendar size={16} fill="currentColor" />
      </button>
  );

  const inventoryButton = (
      <button 
          onClick={onOpenInventory}
          className="w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center pointer-events-auto transition-all shadow-md active:scale-95 relative bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-indigo-500 hover:border-indigo-300 dark:hover:text-indigo-400 dark:hover:border-indigo-600"
      >
          <Backpack size={16} />
      </button>
  );

  // ... (Render Drawer Logic remains same) ...
  const renderDrawer = () => {
      // ... (Existing Drawer Code) ...
      if (!selectedLocation) return null;
      const loc = LOCATIONS[selectedLocation];
      const isCurrent = selectedLocation === currentLocation;
      const isHome = selectedLocation === 'home';
      const isClosed = isLocationClosed(selectedLocation);
      
      const hasTravelSkill = unlockedSkills.includes('huh_again_pls');
      // VIP CHECK: Reduced travel cost? (Optional, skipping for now)
      const currentCost = hasTravelSkill ? Math.max(0, TRAVEL_COST - 2) : TRAVEL_COST;
      const actualCost = isHome ? 0 : currentCost;
      
      const canTravel = isCurrent || isHome || energy >= actualCost;
      const cachedAssets = assetsCache[selectedLocation] || { cover: '', npc: '' };
      const { cover: drawerImg, npc: npcImg } = cachedAssets;
      const animClass = isClosing ? 'animate-drawer-exit' : 'animate-drawer-enter';
      const feature = getFeatureInfo(selectedLocation);

      return (
          <div 
            className={`
                fixed bottom-0 left-0 right-0 z-50 overflow-hidden pb-safe bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-[0_-10px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_60px_-15px_rgba(0,0,0,0.5)] border-t border-gray-200 dark:border-white/20
                md:absolute md:bottom-6 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[420px] md:rounded-[2.5rem] md:shadow-2xl md:border-0
                ${animClass}
            `}
            onClick={(e) => e.stopPropagation()} 
          >
              <div className="h-44 w-full relative">
                  {drawerImg ? (
                      <TransitionImage src={drawerImg} alt={loc.name} className="w-full h-full object-cover" />
                  ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${loc.bgGradient}`}></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-slate-900 dark:via-transparent dark:to-black/30"></div>
                  <button onClick={handleCloseDrawer} className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white p-2 rounded-full transition-colors z-20"><X size={20} /></button>
                  {npcImg && (
                      <div className="absolute -bottom-8 right-6 w-20 h-20 rounded-full border-[4px] border-white dark:border-slate-900 shadow-xl overflow-hidden bg-gray-200 z-10">
                          <TransitionImage src={npcImg} alt="NPC" className="w-full h-full object-cover object-top" />
                      </div>
                  )}
              </div>
              <div className="px-6 pt-4 pb-6 bg-white dark:bg-slate-900 relative">
                  <div className="w-12 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-4 opacity-50 md:hidden"></div>
                  <div className="flex justify-between items-start mb-2 pr-20">
                      <div>
                          {feature && (
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border mb-1.5 ${feature.color}`}>
                                  {feature.icon}
                                  {feature.label}
                              </div>
                          )}
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{loc.name}</h3>
                          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm"><MapPin size={14} className="text-pink-500" /><span>{loc.description}</span></div>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 mb-6 mt-3">
                      {isClosed ? (
                          <span className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-100 dark:border-red-900/30"><Lock size={12} /> Closed ({getOpeningHours(selectedLocation)})</span>
                      ) : (
                          <span className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-100 dark:border-green-900/30"><Clock size={12} /> Open Now</span>
                      )}
                      {activeEvent && activeEvent.locationId === selectedLocation && (
                          <span className="flex items-center gap-1.5 bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse border border-fuchsia-200 dark:border-fuchsia-800"><Sparkles size={12} /> Event Active</span>
                      )}
                  </div>
                  <div className="relative">
                      <button 
                        onClick={handleTravelConfirm} 
                        disabled={disabled || !canTravel || (isClosed && !isCurrent)} 
                        className={`
                            w-full py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 relative
                            ${isCurrent ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-200 dark:shadow-none' : (isClosed ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600' : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:brightness-110 shadow-pink-200 dark:shadow-none')}
                            ${isTutorialDrawer ? 'z-[220] ring-4 ring-pink-400 animate-pulse' : ''}
                        `}
                      >
                        {isCurrent ? <><MapPin size={24} fill="currentColor" /> You are Here</> : isClosed ? <><Lock size={24} /> Currently Closed</> : <><Navigation size={24} fill="currentColor" /> Travel Here <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm flex items-center gap-1 ml-2 font-bold">{isHome ? 'FREE' : <><Zap size={12} fill="currentColor" /> {actualCost}</>}</span></>}
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="relative w-full h-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
      <style>{ANIMATION_STYLES}</style>
      
      {showStory && <StoryOverlay gameState={gameState} onClose={() => setShowStory(false)} onClaimChapter={handleStoryClaim} />}
      {showDailyLogin && <DailyLoginModal onClose={() => setShowDailyLogin(false)} />}
      {showVipModal && <VipPassModal onClose={() => setShowVipModal(false)} />}

      <div 
        ref={containerRef}
        className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
          {/* ... (Map Transformation Div - Unchanged) ... */}
          <div 
            className={`absolute transition-transform duration-300 ease-out will-change-transform ${isMapReady ? 'opacity-100' : 'opacity-0'}`}
            style={{ width: `1152px`, height: `1152px`, transform: `translate(${offset.x}px, ${offset.y}px)` }}
          >
              <div className="absolute inset-0 z-0">
                 {mapImg ? (
                     <TransitionImage src={mapImg} alt="City Map" className="w-full h-full object-cover pointer-events-none filter brightness-[1.05] dark:brightness-[0.8]" />
                 ) : (
                     <div className="w-full h-full bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-slate-800 dark:to-slate-950"></div>
                 )}
                 <div className="absolute inset-0 bg-white/20 dark:bg-black/30 pointer-events-none"></div>
              </div>
              <div className="absolute inset-0 z-10">
                  {Object.keys(LOCATIONS).sort((a, b) => LOCATIONS[a as LocationId].coordinates.y - LOCATIONS[b as LocationId].coordinates.y).map((key) => {
                      const locId = key as LocationId;
                      const loc = LOCATIONS[locId];
                      const isCurrent = locId === currentLocation;
                      const hasEvent = activeEvent && activeEvent.locationId === locId;
                      const isClosed = isLocationClosed(locId);
                      const isSelected = selectedLocation === locId;
                      
                      let pinColor = 'border-white bg-white text-gray-700'; // base style
                      if (isCurrent) pinColor = 'border-pink-500 z-30 scale-110 shadow-[0_0_20px_rgba(236,72,153,0.4)] ring-4 ring-pink-100 dark:ring-pink-900/30';
                      else if (hasEvent) pinColor = 'border-fuchsia-500 z-20 shadow-[0_0_20px_rgba(192,38,211,0.5)] ring-4 ring-fuchsia-100 dark:ring-fuchsia-900/30 animate-pulse'; 
                      else if (isClosed) pinColor = 'border-slate-300 dark:border-slate-600 opacity-60 grayscale';
                      else if (isSelected) pinColor = 'border-indigo-500 z-20 scale-110 shadow-[0_0_20px_rgba(99,102,241,0.4)] ring-4 ring-indigo-100 dark:ring-indigo-900/30';
                      
                      if (locId === 'gacha_shop') {
                          pinColor = 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] ring-4 ring-cyan-100 dark:ring-cyan-900/30 animate-bounce-soft';
                      }

                      const isTargetPin = isTutorialCafePin && locId === 'cafe';
                      if (isTutorialCafePin) {
                          if (isTargetPin) {
                              pinColor = 'border-pink-500 z-[220] scale-125 ring-4 ring-pink-200 animate-pulse';
                          } else {
                              pinColor = 'border-gray-300 opacity-40 grayscale'; 
                          }
                      }

                      let animClass = isCurrent ? 'animate-pin-heartbeat' : ''; 
                      const cachedAssets = assetsCache[locId] || { cover: '', npc: '' };
                      const hasImage = !!cachedAssets.cover;
                      const feature = getFeatureInfo(locId);
                      
                      return (
                          <div key={locId} className="absolute pointer-events-none" style={{ left: `${loc.coordinates.x}%`, top: `${loc.coordinates.y}%` }}>
                              <div
                                onMouseUp={(e) => { e.stopPropagation(); handlePinClick(locId); }}
                                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); handlePinClick(locId); }}
                                className={`pointer-events-auto cursor-pointer flex flex-col items-center gap-1.5 transition-all duration-300 group ${animClass}`}
                                style={{ animationPlayState: isDragging ? 'paused' : 'running' }}
                              >
                                  {hasEvent && <div className="absolute -top-8 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse whitespace-nowrap border border-white/20 z-40">EVENT!</div>}
                                  
                                  {isTargetPin && (
                                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-[220] pointer-events-none w-max">
                                          <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md mb-1 border border-white/20">กดที่นี่</span>
                                          <ArrowDown className="text-pink-500 drop-shadow-md w-6 h-6" strokeWidth={4} />
                                      </div>
                                  )}

                                  <div className={`relative ${isCurrent ? 'w-[3.25rem] h-[3.25rem]' : 'w-[2.5rem] h-[2.5rem]'} rounded-full border-[3px] shadow-[0_8px_15px_-3px_rgba(0,0,0,0.15)] flex items-center justify-center text-lg transition-all ${pinColor} z-10`}>
                                      {hasImage ? (
                                          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-100">
                                            <img src={cachedAssets.cover} alt={loc.name} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isClosed ? 'grayscale brightness-[0.4]' : ''}`} draggable={false} />
                                          </div>
                                      ) : (
                                          <div className={`w-full h-full rounded-full flex items-center justify-center ${isClosed ? 'bg-slate-200 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800'}`}>
                                            {isClosed ? <Lock size={isCurrent ? 18 : 14} className="text-slate-400" /> : <span className={`opacity-60 ${isCurrent ? 'text-2xl' : 'text-xl'}`}>{loc.icon}</span>}
                                          </div>
                                      )}
                                      
                                      {isClosed && hasImage && (
                                        <div className="absolute inset-0 flex items-center justify-center z-10 drop-shadow-lg">
                                            <Lock size={isCurrent ? 20 : 16} className="text-white/90" />
                                        </div>
                                      )}

                                      {/* Bottom Right Feature Badge */}
                                      <div className={`absolute -bottom-1 -right-1 ${isCurrent ? 'w-5 h-5' : 'w-4 h-4'} rounded-full border-[2px] border-white dark:border-slate-800 shadow-md flex items-center justify-center z-20 ${isClosed ? 'bg-slate-600 text-white' : 'bg-white text-slate-600 dark:bg-slate-700 dark:text-gray-300'}`}>
                                          {isClosed ? <Lock size={isCurrent ? 10 : 8} /> : (feature ? React.cloneElement(feature.icon as React.ReactElement, { size: isCurrent ? 10 : 8 } as any) : <span className={isCurrent ? "text-[10px]" : "text-[8px]"}>{loc.icon}</span>)}
                                      </div>
                                      
                                      {/* Has Event Star Badge */}
                                      {hasEvent && !isClosed && (
                                          <div className="absolute -top-1 -left-1 w-5 h-5 bg-fuchsia-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center animate-spin-slow z-20">
                                              <Star size={10} className="text-white fill-white" />
                                          </div>
                                      )}

                                      {/* Current User Location Badge */}
                                      {isCurrent && (
                                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-md z-30">
                                              <User size={10} className="text-white" />
                                          </div>
                                      )}
                                  </div>
                                  
                                  {/* Location Pill */}
                                  <div className={`flex items-center gap-1.5 min-w-max px-2 py-0.5 rounded-full shadow-[0_4px_10px_-2px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all border ${isSelected ? 'bg-indigo-600 text-white border-indigo-500' : isCurrent ? 'bg-pink-500 text-white border-pink-400' : 'bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border-white/50 dark:border-slate-700'} ${isClosed ? 'opacity-60' : ''}`}>
                                     {isClosed && <Lock size={10} className="opacity-70" />}
                                     {!isClosed && locId === 'home' && <MapPin size={10} className="opacity-70" />}
                                     <span className="text-[10px] font-extrabold tracking-tight drop-shadow-sm">{loc.name}</span>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      </div>

      {/* HEADER OVERLAY & GRADIENT */}
      <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-white/95 via-white/60 to-transparent dark:from-black/80 dark:via-[#0B0F19]/60 dark:to-transparent z-10 pointer-events-none"></div>
      
      <div className="absolute top-0 left-0 right-0 p-4 pt-6 lg:pt-8 z-20 pointer-events-none flex justify-between items-start h-auto">
          {/* Left Side: City Info */}
          <div className="flex flex-col items-start gap-1">
              <div>
                  <h2 className="text-[28px] font-black text-gray-800 dark:text-white drop-shadow-sm flex items-center gap-1.5 tracking-tight leading-none">AiLuv City <MapPin className="text-pink-500" size={24} fill="currentColor" /></h2>
                  <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 pl-1 uppercase tracking-widest mt-0.5 mb-1.5">Explore & Connect</p>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-2 shadow-sm border border-white/40 dark:border-white/10 pointer-events-auto ml-1">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200">{timeStr}</span>
                  <div className="w-[1px] h-3 bg-slate-300 dark:bg-slate-700"></div>
                  {getTimeIcon()}
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 flex flex-col leading-none">
                      <span className="text-[10px] leading-none mb-[1px]">{getTimeLabel().temp}</span>
                      <span className="text-[7px] uppercase font-black opacity-80 leading-none">{getTimeLabel().text}</span>
                  </span>
              </div>

              {/* Rumor Ticker / City Pulse */}
              <div 
                  onClick={() => {
                      if (hasDailyClaim) {
                          useGameStore.getState().togglePhone();
                      }
                  }}
                  className={`mt-2 ml-1 flex items-start gap-1.5 max-w-[260px] transition-all duration-500 overflow-hidden pointer-events-auto ${hasDailyClaim ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} ${rumorVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
              >
                  <div className={`flex items-start gap-2 p-1.5 pr-3 rounded-r-xl rounded-l-md border-l-2 backdrop-blur-sm ${
                      hasDailyClaim 
                      ? 'border-pink-500 bg-gradient-to-r from-pink-500/20 via-purple-500/10 to-transparent' 
                      : timeOfDay === 'night' 
                      ? 'bg-gradient-to-r from-slate-900/40 to-transparent border-indigo-500/50' 
                      : 'bg-gradient-to-r from-white/40 to-transparent border-indigo-500/50'
                  }`}>
                      {hasDailyClaim ? (
                          <span className="text-xs animate-bounce">🎁</span>
                      ) : (
                          <MessageCircle size={10} className="text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
                      )}
                      <p className={`text-[10px] leading-snug font-bold drop-shadow-sm ${hasDailyClaim ? 'text-pink-600 dark:text-pink-300 font-extrabold' : 'text-slate-700 dark:text-slate-200 italic'}`}>
                          {hasDailyClaim 
                              ? '🎁 มีรางวัล Daily Reward รออยู่! แตะเพื่อเปิด A-Phone รับของ' 
                              : CITY_RUMORS[rumorIndex]}
                      </p>
                  </div>
              </div>
          </div>
          
          {/* Right Side Header Items */}
          <div className="flex flex-col items-end gap-2.5">
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {partyMember && (
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-full shadow-lg border border-indigo-400/50 flex items-center gap-1.5 pointer-events-auto animate-in slide-in-from-right shrink-0">
                        <Users size={12} fill="currentColor" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">
                            With {CHARACTER_DATA[partyMember].name}
                        </span>
                    </div>
                )}
                
                {/* STORY BADGE */}
                <button 
                    onClick={handleStoryClick}
                    className={`
                        group bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1.5 rounded-full shadow-lg border border-orange-400/50 flex items-center gap-1.5 pointer-events-auto hover:scale-105 active:scale-95 transition-all relative overflow-hidden shrink-0
                    `}
                >
                    {/* Magical Shine Effect */}
                    <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-magical-shine pointer-events-none"></div>

                    <BookOpen size={12} fill="currentColor" className="group-hover:animate-bounce-soft relative z-10" />
                    <span className="text-[10px] font-black uppercase tracking-wide relative z-10">
                        Story {currentChapter ? currentChapter.id : 10}
                    </span>
                </button>
              </div>
          </div>
      </div>
      
      {selectedLocation && <div className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-45 transition-opacity duration-500 md:absolute ${isClosing ? 'opacity-0' : 'opacity-100'}`} onClick={handleCloseDrawer}></div>}
      {renderDrawer()}
    </div>
  );
};

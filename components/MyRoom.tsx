
import React, { useState, useEffect, useRef } from 'react';
import { GameState, TimeOfDay, CharacterId, RelationshipTier, Message, Mood, ActionType, ShopItem, CharacterQuest, SceneType } from '../types';
import { LOCATION_IMAGES, BASEMENT_TRACKS, CHARACTER_DATA, TIER_THRESHOLDS } from '../constants';
import { getCharacterImageUrl } from '../services/firebase';
import { Moon, Sun, Zap, Radio, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Bell, X, Heart, LogOut, MessageCircle, Coffee, Loader2, Backpack } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { CharacterView } from './CharacterView';
import { InventoryModal } from './InventoryModal'; // NEW IMPORT
import { useGameStore } from '../store/gameStore';

// Duplicate ChatProps interface locally or import it if extracted
interface ChatProps {
    characterId: CharacterId;
    messages: Message[];
    onSendMessage: (text: string) => void;
    onAction: (type: ActionType, dateTarget?: SceneType | 'freestyle') => void;
    onIdleTrigger?: () => void;
    onClearChat?: () => void;
    isTyping: boolean;
    disabled: boolean;
    currentMood: Mood;
    loveScore: number;
    inventory?: Record<string, number>;
    onImageClick?: (url: string) => void;
    energy: number;
    comboStreak?: number;
    currentTier: RelationshipTier;
    // Added missing prop definition
    lastLoveUpdate?: { charId: string, value: number, isCritical: boolean, timestamp: number };
    unlockedSkills?: string[];
    gold?: number;
    onBuyItem?: (itemId: string, messageId: string) => void;
    onInputFocus?: () => void; // NEW
    onInputBlur?: () => void;  // NEW
    chemistryScore?: number; // NEW
    onBuyAction?: (type: ActionType) => void; // [MARCUS FIX]: Added onBuyAction
    onAcceptQuest?: (quest: CharacterQuest, charId: CharacterId, msgId: string) => void; // [MARCUS FIX]: Added onAcceptQuest
}

interface MyRoomProps {
  gameState: GameState;
  timeOfDay: TimeOfDay;
  onToggleSleep: () => void;
  // New Props for Room Visit
  onInviteGuest?: (charId: CharacterId) => void;
  onKickGuest?: () => void;
  guestChatProps?: ChatProps | null;
  onConsumeItem?: (item: ShopItem) => void; 
  onRecycleItem?: (item: ShopItem) => void; // NEW
}

// Sub-component for Guest Avatar Loading
const GuestAvatar = ({ characterId }: { characterId: CharacterId }) => {
    const [imgUrl, setImgUrl] = useState<string>('');
    useEffect(() => {
        const load = async () => {
            const data = CHARACTER_DATA[characterId];
            if (data && data.baseImg) {
                const url = await getCharacterImageUrl(data.baseImg);
                if (url) setImgUrl(url);
            }
        };
        load();
    }, [characterId]);

    return (
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-md bg-gray-200">
            {imgUrl ? (
                <img src={imgUrl} alt={characterId} className="w-full h-full object-cover object-top" />
            ) : (
                <div className="w-full h-full bg-gray-300 animate-pulse"></div>
            )}
        </div>
    );
};

export const MyRoom: React.FC<MyRoomProps> = ({ gameState, timeOfDay, onToggleSleep, onInviteGuest, onKickGuest, guestChatProps, onConsumeItem, onRecycleItem }) => {
  const [bgUrl, setBgUrl] = useState<string>('');
  const [loaded, setLoaded] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInventory, setShowInventory] = useState(false); // NEW STATE
  const [viewMode, setViewMode] = useState<'chat' | 'relax'>('relax');
  const [isInviting, setIsInviting] = useState<CharacterId | null>(null); // New state for Loading Screen
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false); // Toggle player visibility
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // Access global store
  const setMusicActive = useGameStore(state => state.setMusicActive);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Dynamic Playlist based on Unlocked Tracks
  // Always include the first free track + any unlocked tracks
  const playlist = BASEMENT_TRACKS.filter(t => t.cost === 0 || gameState.unlockedTracks.includes(t.id));
  
  // [MARCUS FIX]: Sync with UI Dark Mode. Only 'night' uses night assets.
  const isNight = timeOfDay === 'night';
  const imgPath = isNight ? LOCATION_IMAGES.room_night : LOCATION_IMAGES.room_day;
  
  // Sleep Speed Logic
  const hasBasicSleep = gameState.unlockedSkills.includes('basic_sleep');
  const hasHardSleep = gameState.unlockedSkills.includes('hard_sleep');
  const canSleep = hasBasicSleep || hasHardSleep;
  const sleepMultiplier = hasHardSleep ? '12x' : (hasBasicSleep ? '6x' : '1x');

  // Get eligible guests: Must have received a Keycard (roomKeys list)
  const eligibleGuests = gameState.roomKeys || [];

  useEffect(() => {
    const loadBg = async () => {
       const url = await getCharacterImageUrl(imgPath);
       if (url) {
         setBgUrl(url);
         setLoaded(true);
       }
    };
    loadBg();
  }, [imgPath]);

  // Sync View Mode when Guest Arrives
  useEffect(() => {
      if (guestChatProps) {
          setViewMode('chat');
      } else {
          setViewMode('relax');
      }
  }, [guestChatProps?.characterId]);

  // --- AUDIO LOGIC ---

  // Helper: Next Track
  const nextTrack = () => {
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  const prevTrack = () => {
      setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  // 1. Initialize Audio
  useEffect(() => {
    if (playlist.length > 0 && !audioRef.current) {
        audioRef.current = new Audio(playlist[currentTrackIndex].src);
        audioRef.current.loop = false; // Changed: Don't loop single track
        audioRef.current.volume = volume;
        
        // Handle Auto-Next
        audioRef.current.onended = nextTrack;
        
        // Handle loading errors
        audioRef.current.onerror = (e) => {
            console.error(`Audio Error [${playlist[currentTrackIndex].title}]`, e);
            setIsPlaying(false);
        };
    }

    // Cleanup when leaving room
    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setMusicActive(false); // Ensure global state is reset on unmount
    };
  }, []); // Run once on mount

  // Sync isPlaying with Global State
  useEffect(() => {
      setMusicActive(isPlaying);
  }, [isPlaying, setMusicActive]);

  // 2. Handle Play/Pause & Track Change
  useEffect(() => {
      if (!audioRef.current || playlist.length === 0) return;

      const track = playlist[currentTrackIndex];
      // Check if source changed
      const currentSrc = audioRef.current.src;
      
      // Update listener just in case closure is stale (though nextTrack is stable)
      audioRef.current.onended = nextTrack;

      // If track changed, load new one
      if (!currentSrc.includes(track.src)) {
          const wasPlaying = isPlaying;
          audioRef.current.pause();
          audioRef.current.src = track.src;
          audioRef.current.load();
          if (wasPlaying) {
              const playPromise = audioRef.current.play();
              if (playPromise !== undefined) {
                  playPromise.catch(error => {
                      console.log("Audio playback failed (user interaction needed):", error);
                      setIsPlaying(false);
                  });
              }
          }
      } else {
          // Handle Play/Pause state for same track
          if (isPlaying) {
              const playPromise = audioRef.current.play();
              if (playPromise !== undefined) {
                  playPromise.catch(error => {
                      console.log("Autoplay blocked:", error);
                      setIsPlaying(false);
                  });
              }
          } else {
              audioRef.current.pause();
          }
      }
  }, [isPlaying, currentTrackIndex, playlist]); // removed nextTrack from deps to avoid cycle

  // 3. Handle Volume
  useEffect(() => {
      if (audioRef.current) {
          audioRef.current.volume = isMuted ? 0 : volume;
      }
  }, [volume, isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const currentTrack = playlist[currentTrackIndex];

  // --- ROOM VISIT HANDLERS ---
  const handleSelectGuest = (charId: CharacterId) => {
      setShowInviteModal(false);
      setIsInviting(charId); // Trigger Loading State
      
      // Delay for effect
      setTimeout(() => {
          onInviteGuest?.(charId);
          setIsInviting(null); // Clear Loading
      }, 3000); // 3 Seconds wait
  };

  const isGuestActive = !!guestChatProps;
  const isChatMode = isGuestActive && viewMode === 'chat';
  const isRelaxModeWithGuest = isGuestActive && viewMode === 'relax';

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-900">
       
       {/* 1. Background (Common) */}
       <div className="absolute inset-0 overflow-hidden z-0">
          <div className="h-full w-full relative">
             {loaded && (
               <img 
                 src={bgUrl} 
                 alt="My Room" 
                 className={`w-full h-full object-cover transition-all duration-1000 ${gameState.isSleeping ? 'brightness-50 grayscale-[30%] scale-105' : 'brightness-100 scale-100'} ${isRelaxModeWithGuest ? 'opacity-0' : 'opacity-100'}`} 
               />
             )}
          </div>
       </div>

       {/* 2. Character Layer (Adaptive Scale Logic) */}
       {isGuestActive && guestChatProps && !isInviting && (
           <div 
             className={`
                absolute inset-x-0 top-0 z-10 transition-all duration-500 ease-in-out
                ${viewMode === 'chat' ? 'bottom-[45%]' : 'bottom-0'} 
             `}
           >
                <CharacterView 
                    characterId={guestChatProps.characterId} 
                    mood={guestChatProps.currentMood} 
                    isLoading={guestChatProps.isTyping} 
                    lastAction={null} 
                    disabled={guestChatProps.disabled}
                    isRoomMode={true} 
                />
           </div>
       )}

       {/* 3. UI Layer */}
       <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none">
           
           {/* Header Area */}
           <div className="pt-safe px-4 py-4 flex justify-between items-start pointer-events-auto">
                {isChatMode ? (
                    // CHAT MODE HEADER
                    <>
                        <button 
                            onClick={() => setViewMode('relax')}
                            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 shadow-sm flex items-center gap-2 hover:bg-white transition-colors"
                        >
                            <Coffee size={18} className="text-orange-500" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Relax</span>
                        </button>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowPlayer(!showPlayer)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${showPlayer || isPlaying ? 'bg-indigo-500 text-white animate-pulse-slow' : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur text-gray-600 dark:text-gray-300 hover:bg-white'}`}
                            >
                                {isPlaying ? <Music size={20} className="animate-spin-slow" /> : <Radio size={20} />}
                            </button>
                            <button 
                                onClick={onKickGuest}
                                className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors border-2 border-white/20"
                                title="End Visit"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    // DASHBOARD MODE HEADER
                    <>
                        <div className="bg-black/30 backdrop-blur-md text-white px-4 py-2 rounded-2xl border border-white/20 shadow-lg">
                            <h2 className="text-xl font-extrabold flex items-center gap-2">
                                {isNight ? <Moon size={20} className="text-indigo-300" /> : <Sun size={20} className="text-orange-300" />}
                                ห้องนอนส่วนตัว
                            </h2>
                            <p className="text-xs text-white/70 font-medium">Safe Zone • ฟื้นฟูพลังงาน {sleepMultiplier}</p>
                        </div>

                        <div className="flex gap-2">
                            {/* Inventory Button (NEW) */}
                            <button 
                                onClick={() => setShowInventory(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all bg-white/20 backdrop-blur text-white hover:bg-white/40 border border-white/10"
                                title="Inventory"
                            >
                                <Backpack size={20} />
                            </button>

                            {/* Toggle Player */}
                            <button 
                                onClick={() => setShowPlayer(!showPlayer)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${showPlayer || isPlaying ? 'bg-indigo-500 text-white animate-pulse-slow' : 'bg-white/20 backdrop-blur text-white hover:bg-white/40'}`}
                            >
                                {isPlaying ? <Music size={20} className="animate-spin-slow" /> : <Radio size={20} />}
                            </button>

                            {/* Invite / Chat Toggle */}
                            {isGuestActive ? (
                                <button 
                                    onClick={() => setViewMode('chat')}
                                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-pink-500 text-white hover:bg-pink-600 transition-all animate-bounce-soft"
                                    title="Return to Chat"
                                >
                                    <MessageCircle size={20} fill="currentColor" />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setShowInviteModal(true)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all border border-white/20 backdrop-blur-md bg-white/20 text-white hover:bg-white/40`}
                                    title="Invite Guest"
                                >
                                    <Bell size={20} />
                                </button>
                            )}
                        </div>
                    </>
                )}
           </div>

           {/* Chat Interface (Only in Chat Mode) */}
           {isChatMode && guestChatProps && (
               <div className="h-[50%] w-full pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-300">
                   <ChatInterface {...guestChatProps} />
               </div>
           )}

           {/* Dashboard Controls (Only in Relax Mode) */}
           {!isChatMode && (
                <div className="p-6 pb-8 pointer-events-auto flex flex-col items-center gap-4 animate-in fade-in duration-500">
                    {gameState.isSleeping && (
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="text-6xl mb-2 animate-bounce">💤</div>
                            <div className="bg-black/60 backdrop-blur text-green-400 font-bold px-4 py-2 rounded-xl border border-green-500/50 flex items-center gap-2">
                                <Zap size={16} fill="currentColor" />
                                กำลังฟื้นฟู {sleepMultiplier}...
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onToggleSleep}
                        disabled={!canSleep && !gameState.isSleeping}
                        className={`w-full max-w-xs py-4 rounded-3xl font-extrabold text-lg shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 border-4
                            ${!canSleep && !gameState.isSleeping ? 'bg-gray-400 border-gray-500 text-gray-200 cursor-not-allowed grayscale' : 
                            gameState.isSleeping 
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400 text-white hover:from-indigo-700 hover:to-purple-700' 
                            : 'bg-white border-white text-indigo-900 hover:bg-indigo-50'}
                        `}
                    >
                        {gameState.isSleeping ? (
                            <>ตื่นนอน</>
                        ) : (
                            <>
                                <Moon size={24} className={!canSleep ? 'text-gray-300' : 'fill-indigo-900'} /> เข้านอน ({canSleep ? sleepMultiplier : 'Locked'})
                            </>
                        )}
                    </button>
                    
                    {!gameState.isSleeping && !isGuestActive && (
                        <p className="text-white/80 text-xs font-bold bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm text-center">
                            {hasHardSleep 
                                ? "Hard Sleep ทำงาน: ฟื้นฟูพลังงานระดับสูงสุด!"
                                : hasBasicSleep 
                                    ? "Standard Sleep ทำงาน: ฟื้นฟูพลังงาน 6x (อัปเกรดเป็น 12x ได้ที่ร้านค้า)"
                                    : "ถ้าซื้อเตียงธรรมดาจะสามารถนอนเพื่อเพิ่มความเร็วในการฟื้น Energy ได้ x6"}
                        </p>
                    )}
                </div>
           )}
       </div>

       {/* GLOBAL Music Player Panel (Floating, Independent of View Mode) */}
       {showPlayer && currentTrack && (
            <div className="absolute top-20 right-4 z-50 w-64 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 shadow-2xl animate-in slide-in-from-right-10 fade-in duration-300 pointer-events-auto">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner overflow-hidden ${isPlaying ? 'bg-gradient-to-tr from-pink-500 to-purple-500' : 'bg-slate-800'}`}>
                        {currentTrack.coverImage ? (
                                <img src={currentTrack.coverImage} className="w-full h-full object-cover" />
                        ) : (
                                <Music size={20} className={`text-white ${isPlaying ? 'animate-spin-slow' : ''}`} />
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="text-white font-bold text-sm truncate">{currentTrack.title}</h3>
                        <p className="text-pink-400 text-xs font-medium">{currentTrack.artist}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mb-4">
                    <button onClick={prevTrack} className="text-slate-400 hover:text-white transition-colors"><SkipBack size={20} /></button>
                    <button 
                    onClick={togglePlay} 
                    className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/20"
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                    </button>
                    <button onClick={nextTrack} className="text-slate-400 hover:text-white transition-colors"><SkipForward size={20} /></button>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-white">
                        {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:rounded-full"
                    />
                </div>
            </div>
        )}

       {/* Invite Modal */}
       {showInviteModal && (
           <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
                   <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
                       <div>
                           <h3 className="font-extrabold text-lg text-gray-800 dark:text-white">Invite a Guest</h3>
                           <p className="text-xs text-gray-500 dark:text-gray-400">Who would you like to invite?</p>
                       </div>
                       <button onClick={() => setShowInviteModal(false)} className="bg-gray-200 dark:bg-slate-800 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors">
                           <X size={18} />
                       </button>
                   </div>
                   <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                       {eligibleGuests.length === 0 ? (
                           <div className="text-center py-8 text-gray-400">
                               <p className="mb-2 text-3xl">🔑</p>
                               <p className="text-sm font-bold">No partners with keys.</p>
                               <p className="text-xs mt-1">Give a Spare Key to a Partner first.</p>
                           </div>
                       ) : (
                           eligibleGuests.map(charId => {
                               const data = CHARACTER_DATA[charId];
                               return (
                                   <button 
                                      key={charId}
                                      onClick={() => handleSelectGuest(charId)}
                                      className="w-full flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-slate-700 border border-transparent hover:border-pink-200 transition-all group"
                                   >
                                       <GuestAvatar characterId={charId} />
                                       <div className="flex-1 text-left">
                                           <h4 className="font-bold text-gray-800 dark:text-white">{data.name}</h4>
                                           <div className="flex items-center gap-1 text-[10px] text-pink-500 font-bold bg-pink-100 dark:bg-pink-900/30 px-2 py-0.5 rounded-lg w-fit mt-0.5">
                                               <Heart size={10} fill="currentColor" /> Partner
                                           </div>
                                       </div>
                                       <div className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm text-pink-500 group-hover:scale-110 transition-transform">
                                           <Bell size={16} />
                                       </div>
                                   </button>
                               )
                           })
                       )}
                   </div>
               </div>
           </div>
       )}

       {/* INVITE LOADING OVERLAY */}
       {isInviting && (
           <div className="absolute inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
               <div className="relative">
                   <div className="w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center animate-pulse">
                       <GuestAvatar characterId={isInviting} />
                   </div>
                   <div className="absolute -bottom-2 -right-2 bg-pink-500 rounded-full p-2 border-4 border-slate-950 animate-bounce">
                       <Heart size={20} fill="currentColor" className="text-white" />
                   </div>
               </div>
               <h3 className="text-white text-xl font-bold mt-6 tracking-wide">Waiting for {CHARACTER_DATA[isInviting].name}...</h3>
               <p className="text-pink-400 text-xs font-bold uppercase tracking-widest mt-2 animate-pulse">Knocking on door</p>
               <div className="mt-8 flex gap-1">
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
               </div>
           </div>
       )}

       {/* INVENTORY MODAL */}
       {showInventory && (
           <InventoryModal onClose={() => setShowInventory(false)} onConsume={onConsumeItem} onRecycle={onRecycleItem} /> // ADDED ONRECYCLE
       )}

       {/* Sleep Overlay Layer (Darkness) */}
       {gameState.isSleeping && (
         <div className="absolute inset-0 bg-indigo-950/60 pointer-events-none transition-opacity duration-1000 z-40"></div>
       )}
    </div>
  );
};

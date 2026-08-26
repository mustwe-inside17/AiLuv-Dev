
import React, { useState, useEffect, useRef } from 'react';
import { GameState, ActiveBuff, Message, Mood, ActionType, CharacterId, RelationshipTier, MusicTrack, ActiveEvent, CharacterQuest, SceneType } from '../types';
import { BASEMENT_TRACKS, LOCATION_IMAGES } from '../constants';
import { getCharacterImageUrl } from '../services/firebase';
import { Headphones, Lock, Play, Circle, CheckCircle2, Music, Coins, MessageSquare, AudioWaveform, Clock, Pause, ChevronDown, Heart, Sparkles, Zap, Star, Volume2, VolumeX } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { CharacterView } from './CharacterView';
import { ChemistryMeter } from './ChemistryMeter'; // NEW IMPORT
import { useGameStore } from '../store/gameStore';

// Add Chat Props Interface
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
    activeEvent?: ActiveEvent | null; 
    lastLoveUpdate?: { charId: string, value: number, isCritical: boolean, timestamp: number };
    partyMemberId?: CharacterId | null;
    unlockedSkills?: string[];
    onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void; 
    gold?: number;
    onBuyItem?: (itemId: string, messageId: string) => void;
    onInputFocus?: () => void; 
    onInputBlur?: () => void;  
    chemistryScore?: number; 
    onBuyAction?: (type: ActionType) => void; // [MARCUS FIX]: Added onBuyAction
    onAcceptQuest?: (quest: CharacterQuest, charId: CharacterId, msgId: string) => void; // [MARCUS FIX]: Added onAcceptQuest
}

interface TheBasementProps {
  gameState: GameState;
  onBuyTrack: (track: MusicTrack) => void;
  onFinishTrack: (track: MusicTrack) => void; 
  chatProps?: ChatProps; 
  initialTab?: 'vibe' | 'talk'; 
  chatHeight?: number; 
  onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void; 
}

export const TheBasement: React.FC<TheBasementProps> = ({ gameState, onBuyTrack, onFinishTrack, chatProps, initialTab = 'vibe', chatHeight = 45, onDragStart }) => {
  const [bgUrl, setBgUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'vibe' | 'talk'>(initialTab);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack>(BASEMENT_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [showSuccess, setShowSuccess] = useState(false);
  const [liked, setLiked] = useState(false);
  
  // [MARCUS FIX]: Connect to Global Store for Audio Settings
  const { settings, setBgmVolume, toggleMute, setMusicActive } = useGameStore();

  // Update internal tab state if prop changes
  useEffect(() => {
      setActiveTab(initialTab);
  }, [initialTab]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const loadBg = async () => {
       const url = await getCharacterImageUrl(LOCATION_IMAGES.basement_bg);
       if (url) setBgUrl(url);
    };
    loadBg();
    
    setSelectedTrack(BASEMENT_TRACKS[0]);

    return () => {
        stopPlaying();
        setMusicActive(false); // Ensure global state is reset on unmount
    };
  }, []);

  // Sync isPlaying with Global State
  useEffect(() => {
      setMusicActive(isPlaying);
  }, [isPlaying, setMusicActive]);

  const stopPlaying = () => {
      if (progressFrameRef.current) cancelAnimationFrame(progressFrameRef.current);
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
      }
      setIsPlaying(false);
      setProgress(0);
  };

  const handleTrackClick = (track: MusicTrack) => {
      if (isPlaying) stopPlaying();
      setSelectedTrack(track);
  };

  const handlePlay = () => {
      if (isPlaying) {
          stopPlaying();
          return;
      }
      
      setIsPlaying(true);
      setProgress(0);

      const audio = new Audio(selectedTrack.src);
      // [MARCUS FIX]: Use Global Settings for Volume
      audio.volume = settings.isMuted ? 0 : settings.bgmVolume; 
      audioRef.current = audio;

      audio.onerror = () => {
          console.error(`Audio Error [${selectedTrack.title}]`);
          setIsPlaying(false);
      };

      audio.play().catch(e => {
          console.error("Audio playback failed:", e);
          setIsPlaying(false);
      });

      audio.onended = () => {
          setShowSuccess(true);
          setLiked(false);
          stopPlaying();
      };

      const updateProgress = () => {
          if (audioRef.current) {
              const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
              setProgress(isNaN(p) ? 0 : p);
              progressFrameRef.current = requestAnimationFrame(updateProgress);
          }
      };
      
      progressFrameRef.current = requestAnimationFrame(updateProgress);
  };

  // [MARCUS FIX]: React to Global Settings Changes
  useEffect(() => {
      if (audioRef.current) {
          audioRef.current.volume = settings.isMuted ? 0 : settings.bgmVolume;
      }
  }, [settings.bgmVolume, settings.isMuted]);

  const isUnlocked = (trackId: string) => gameState.unlockedTracks.includes(trackId);
  const canAfford = (cost: number) => gameState.gold >= cost;

  const handleClaimBuff = () => {
      onFinishTrack(selectedTrack);
      setShowSuccess(false);
  };

  // Reusable Tab Component
  const TabButtons = () => (
        <div className="absolute top-0 left-0 right-0 z-30 flex justify-center gap-3 pt-6 pb-4 pointer-events-none">
            <button 
                onClick={() => setActiveTab('vibe')}
                className={`pointer-events-auto px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 backdrop-blur-md shadow-lg ${activeTab === 'vibe' ? 'bg-fuchsia-600 text-white shadow-fuchsia-500/30 border border-fuchsia-400' : 'bg-black/40 text-gray-400 hover:text-white border border-white/10'}`}
            >
                <Headphones size={14} /> Vibe Check
            </button>
            <button 
                onClick={() => setActiveTab('talk')}
                className={`pointer-events-auto px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 backdrop-blur-md shadow-lg ${activeTab === 'talk' ? 'bg-violet-600 text-white shadow-violet-500/30 border border-violet-400' : 'bg-black/40 text-gray-400 hover:text-white border border-white/10'}`}
            >
                <MessageSquare size={14} /> Talk
            </button>
        </div>
  );

  return (
    <div className="relative w-full h-full overflow-hidden bg-black text-white font-sans flex flex-col">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none">
             {bgUrl && (
               <img 
                 src={bgUrl} 
                 alt="The Basement" 
                 className={`w-full h-full object-cover object-center transition-all duration-[20s] ease-linear ${isPlaying ? 'scale-110' : 'scale-100'}`} 
               />
             )}
             <div className={`absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 transition-opacity duration-500 ${activeTab === 'talk' ? 'opacity-40' : 'opacity-100'}`}></div>
        </div>

        {/* Content Area */}
        {activeTab === 'vibe' ? (
            <>
                {/* Tabs for Vibe Mode */}
                <TabButtons />
                
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-6 pb-24 pt-24">
                    
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-sm">
                                THE BASEMENT
                            </h1>
                            <p className="text-xs font-bold text-fuchsia-400 tracking-widest uppercase mt-1">Underground Studio • 18:00 - 06:00</p>
                        </div>
                        <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
                            <Coins size={14} className="text-yellow-400" />
                            <span className="text-sm font-bold">{Math.floor(gameState.gold)}</span>
                        </div>
                    </div>

                    {/* Player Section (Hero) */}
                    <div className="flex flex-col items-center justify-center mb-12">
                        <div className="mb-6 relative group">
                            <div className={`w-40 h-40 rounded-xl overflow-hidden shadow-2xl transition-all duration-700 ${isPlaying ? 'shadow-fuchsia-500/50 scale-105' : 'shadow-black/50'} ${!isUnlocked(selectedTrack.id) ? 'grayscale opacity-70' : ''}`}>
                                {selectedTrack.coverImage ? (
                                    <img src={selectedTrack.coverImage} alt={selectedTrack.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center ${selectedTrack.coverColor}`}>
                                        <Music size={40} className="text-white/50" />
                                    </div>
                                )}
                            </div>
                            {isPlaying && (
                                <div className="absolute -inset-4 bg-fuchsia-500/20 blur-xl rounded-full z-[-1] animate-pulse"></div>
                            )}
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight drop-shadow-lg">{selectedTrack.title}</h2>
                            <p className="text-fuchsia-300 text-sm font-bold uppercase tracking-widest">{selectedTrack.artist}</p>
                        </div>

                        {/* Play & Volume Controls */}
                        <div className="mb-8 w-full flex flex-col items-center">
                            {isUnlocked(selectedTrack.id) ? (
                                <div className="flex flex-col items-center gap-6 w-full max-w-xs">
                                    <button 
                                        onClick={handlePlay} 
                                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl ${isPlaying ? 'bg-fuchsia-500 text-white scale-105 shadow-fuchsia-500/50' : 'bg-white text-black hover:scale-105 hover:bg-gray-100'}`}
                                    >
                                        {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                                    </button>
                                    
                                    {/* Volume Slider (Global) */}
                                    <div className="flex items-center gap-3 w-full bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10">
                                        <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                                            {settings.isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                        </button>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="1" 
                                            step="0.05"
                                            disabled={settings.isMuted}
                                            value={settings.bgmVolume}
                                            onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-fuchsia-500 [&::-webkit-slider-thumb]:rounded-full"
                                        />
                                    </div>

                                    {isPlaying && (
                                        <div className="w-full mt-2">
                                            <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                                                <span>Listening...</span>
                                                <span className="text-fuchsia-400">Receive Buff</span>
                                            </div>
                                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                                                <div className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(192,38,211,0.8)]" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button 
                                    onClick={() => canAfford(selectedTrack.cost) && onBuyTrack(selectedTrack)} 
                                    disabled={!canAfford(selectedTrack.cost)}
                                    className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all transform active:scale-95 shadow-xl ${
                                        canAfford(selectedTrack.cost) 
                                        ? 'bg-gradient-to-b from-stone-800 to-stone-950 text-stone-200 border border-stone-700/50 hover:border-stone-500 hover:text-white shadow-black/50' 
                                        : 'bg-gray-900/50 text-gray-600 cursor-not-allowed border border-gray-800'
                                    }`}
                                >
                                    <Lock size={18} /> 
                                    <span className="uppercase tracking-wide text-xs">Unlock Track</span>
                                    <span className="bg-white/5 px-2 py-1 rounded text-xs text-yellow-600/80 font-mono border border-white/5">{selectedTrack.cost} G</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Playlist Drawer */}
                    <div className="w-full">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2 pl-2">
                            <AudioWaveform size={14} className="text-fuchsia-500"/> Lucas's Collection
                        </h3>
                        <div className="space-y-3">
                            {BASEMENT_TRACKS.map(track => {
                                const unlocked = isUnlocked(track.id);
                                const active = selectedTrack.id === track.id;
                                
                                return (
                                    <button 
                                        key={track.id}
                                        onClick={() => handleTrackClick(track)}
                                        className={`
                                            w-full flex items-center gap-4 p-4 rounded-2xl transition-all border
                                            ${active 
                                                ? 'bg-fuchsia-900/20 border-fuchsia-500/50 shadow-[inset_0_0_20px_rgba(192,38,211,0.1)]' 
                                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
                                        `}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all overflow-hidden ${!unlocked ? 'grayscale opacity-50' : 'shadow-lg'}`}>
                                            {track.coverImage ? (
                                                <img src={track.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center ${track.coverColor}`}>
                                                    {unlocked ? (active && isPlaying ? <AudioWaveform size={20} className="animate-pulse" /> : <Music size={20} />) : <Lock size={20} />}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 text-left min-w-0">
                                            <div className={`text-sm font-bold truncate ${active ? 'text-white' : 'text-gray-300'}`}>{track.title}</div>
                                            <div className="text-xs text-gray-500 truncate">{track.artist}</div>
                                        </div>
                                        
                                        <div className="text-right shrink-0">
                                            {unlocked ? (
                                                <div className="text-[10px] font-bold text-fuchsia-300 bg-fuchsia-900/30 px-2 py-1 rounded-lg border border-fuchsia-500/20">
                                                    {track.id === 'track_1' ? '+70 NRG' : track.id === 'track_2' ? 'ALL STATS' : track.buffType.replace('_', ' ').toUpperCase()}
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-yellow-500 flex items-center gap-1">
                                                    <Coins size={12}/> {track.cost}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </>
        ) : (
            <div className="absolute inset-0 z-10 flex flex-col md:flex-row">
                 {chatProps && (
                    <>
                        {/* Chemistry Meter */}
                        <ChemistryMeter score={chatProps.chemistryScore || 0} />

                        {/* Left Panel: Character */}
                        <div className="flex-1 min-h-0 relative flex items-end justify-center overflow-hidden md:w-1/2 md:border-r md:border-white/10">
                             {/* Tabs placed INSIDE Character View for Talk Mode */}
                             <TabButtons />
                             <CharacterView 
                                characterId={chatProps.characterId} 
                                mood={chatProps.currentMood} 
                                isLoading={chatProps.isTyping} 
                                lastAction={null} 
                                disabled={chatProps.disabled} 
                                isCasualMode={true} 
                             />
                        </div>

                        {/* Right Panel: Chat */}
                        <div 
                            style={{ height: window.innerWidth < 768 ? `${chatHeight}%` : '100%' }}
                            className="flex-none z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] bg-transparent transition-[height] duration-75 ease-out md:!h-full md:w-1/2 md:static md:shadow-none md:bg-black/40 md:backdrop-blur-sm"
                        >
                             <ChatInterface {...chatProps} onDragStart={onDragStart} />
                        </div>
                    </>
                 )}
            </div>
        )}

        {/* SUCCESS MODAL */}
        {showSuccess && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                <div className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] border-4 border-fuchsia-500/50 shadow-[0_0_50px_rgba(192,38,211,0.3)] overflow-hidden relative p-8 text-center animate-in zoom-in-95 duration-500">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-fuchsia-500"></div>
                    
                    <div className="w-24 h-24 bg-gradient-to-tr from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-soft">
                        <AudioWaveform size={48} className="text-white" />
                    </div>

                    <h2 className="text-2xl font-black text-white italic tracking-tight mb-2 uppercase">Vibe Check Passed!</h2>
                    <p className="text-gray-400 text-sm font-medium mb-8">You finished listening to <span className="text-white font-bold">"{selectedTrack.title}"</span>. The beats resonate within you.</p>

                    <div className="bg-black/40 border border-white/10 rounded-3xl p-5 mb-8 relative">
                        <div className="flex items-center justify-center gap-4">
                            {selectedTrack.id === 'track_1' ? (
                                <div className="flex flex-col items-center">
                                    <div className="bg-orange-500/20 text-orange-400 p-2 rounded-xl mb-2"><Zap size={24} fill="currentColor" /></div>
                                    <span className="text-[10px] font-black uppercase text-gray-500">Energy Gain</span>
                                    <span className="text-2xl font-black text-orange-400">+70</span>
                                </div>
                            ) : selectedTrack.id === 'track_2' ? (
                                <div className="flex flex-col items-center">
                                    <div className="bg-fuchsia-500/20 text-fuchsia-400 p-2 rounded-xl mb-2"><Star size={24} fill="currentColor" /></div>
                                    <span className="text-[10px] font-black uppercase text-gray-500">Limit Break</span>
                                    <span className="text-2xl font-black text-fuchsia-400">All Stats +2</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="bg-violet-500/20 text-violet-400 p-2 rounded-xl mb-2"><Clock size={24} /></div>
                                    <span className="text-[10px] font-black uppercase text-gray-500">Buff Effect</span>
                                    <span className="text-lg font-black text-violet-300">{selectedTrack.description}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => setLiked(!liked)}
                            className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 border-2 ${liked ? 'bg-pink-600 border-pink-400 text-white scale-105' : 'bg-transparent border-gray-700 text-gray-400 hover:border-pink-500 hover:text-pink-400'}`}
                        >
                            <Heart size={20} fill={liked ? "currentColor" : "none"} className={liked ? "animate-pulse" : ""} />
                            {liked ? 'LIKED!' : 'LEAVE A LIKE'}
                        </button>
                        
                        <button 
                            onClick={handleClaimBuff}
                            className="w-full bg-white text-black py-4 rounded-2xl font-black shadow-xl shadow-white/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={20} /> SYNC FREQUENCY
                        </button>
                    </div>

                    <p className="mt-6 text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em]">Underground Music Hub</p>
                </div>
            </div>
        )}
    </div>
  );
};

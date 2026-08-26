
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, UserProfile, PlayerAttributes, AvatarConfig, LocationId, StyleItem, CharacterId, RelationshipTier, TimeOfDay } from '../../types';
import { SKILL_TREE, CHARACTER_DATA, BASEMENT_TRACKS, PROFILE_COVERS, STORY_TITLES } from '../../constants';
import { FASHION_ITEMS } from '../../constants/fashion';
import { getBuffConfig, getBuffDescription, getEffectiveStat } from '../../services/buffMechanics';
import { getCharacterImageUrl } from '../../services/firebase';
import { LogOut, User, Edit, MessageCircle, Sparkles, ArrowUp, Laptop, Briefcase, ShoppingBag, Dumbbell, Zap, Brain, Clover, CheckCircle2, Lock, Plus, RefreshCcw, XCircle, Crown, ChevronDown, Image as ImageIcon, Shirt, Music, Play, Pause, SkipForward, Radio, Mars, Venus, BookOpen, Settings, Volume2, VolumeX, Speaker, BellRing, Coins, Gem, Leaf, Fingerprint, PenLine, AlertCircle, Wallet, Heart } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { TransitionImage } from '../ui/TransitionImage'; // NEW IMPORT

interface ProfileViewProps {
    gameState: GameState;
    userProfile: UserProfile | null;
    onUpdateProfile: (profile: UserProfile) => void;
    onStatUpgrade: (stat: keyof PlayerAttributes) => void;
    onDismissEvent: () => void;
    onStartEventTravel: (locId: LocationId) => void;
    onLogout: () => void;
    onChangeTab: (tab: 'work' | 'shop' | 'gym' | 'mall') => void; // Updated type to include mall
    onEquipStyle: (styleId: string | null) => void; 
    // GLOBAL MUSIC PROPS
    globalMusic?: { isPlaying: boolean, trackIndex: number, volume: number };
    onPlayGlobalMusic?: () => void;
    onPauseGlobalMusic?: () => void;
    onNextGlobalTrack?: () => void;
    // NEW: Open Diamond Shop
    onOpenDiamondShop?: () => void;
    timeOfDay?: TimeOfDay;
}

// --- NEW STAT CARD COMPONENT (2x2 Layout) ---
const StatCard: React.FC<{
    label: string;
    description: string;
    value: number;
    buffValue: number;
    styleValue: number; // Add Style Bonus
    icon: React.ReactNode;
    colorClass: string; 
    bgClass: string;
    canUpgrade: boolean;
    onUpgrade: (e: React.MouseEvent) => void;
    onClick: () => void;
}> = ({ label, description, value, buffValue, styleValue, icon, colorClass, bgClass, canUpgrade, onUpgrade, onClick }) => {
    return (
        <button 
            onClick={onClick}
            aria-label={`View details for ${label}`}
            className={`
                relative flex flex-col items-start justify-between p-4 rounded-2xl border-2 transition-all active:scale-95 text-left group h-full shadow-sm hover:shadow-md w-full focus:outline-none focus:ring-2 focus:ring-pink-400
                ${bgClass}
            `}
        >
            <div className="flex justify-between w-full items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className={`${colorClass} opacity-90`}>{icon}</div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${colorClass}`}>{label}</span>
                </div>
                {canUpgrade && (
                    <button 
                        type="button"
                        aria-label={`Upgrade ${label}`}
                        onClick={(e) => { e.stopPropagation(); onUpgrade(e); }}
                        className="bg-yellow-400 text-yellow-900 p-1.5 rounded-full shadow-lg animate-pulse hover:scale-110 transition-transform -mt-1 -mr-1 focus:outline-none focus:ring-2 focus:ring-yellow-600"
                    >
                        <Plus size={12} strokeWidth={4} />
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-0.5 mb-1.5">
                <span className="text-3xl font-black text-gray-800 dark:text-white leading-none">{value + buffValue + styleValue}</span>
                <div className="flex gap-1 flex-wrap">
                    {buffValue > 0 && <span className="text-[11px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-md border border-green-200 dark:border-green-500/20">+{buffValue} Buff</span>}
                    {styleValue > 0 && <span className="text-[11px] font-bold text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-100 dark:bg-fuchsia-900/30 px-1.5 py-0.5 rounded-md border border-fuchsia-200 dark:border-fuchsia-500/20">+{styleValue} Style</span>}
                </div>
            </div>

            <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400 leading-tight">
                {description}
            </span>
        </button>
    );
};

export const ProfileView: React.FC<ProfileViewProps> = ({ 
    gameState, userProfile, onUpdateProfile, onStatUpgrade, onDismissEvent, onStartEventTravel, onLogout, onChangeTab, onEquipStyle,
    globalMusic, onPlayGlobalMusic, onPauseGlobalMusic, onNextGlobalTrack, onOpenDiamondShop, timeOfDay = 'day'
}) => {
    
    // Store Actions for Audio & Economy
    const { toggleMute, setBgmVolume, setSfxVolume, toggleEcoMode, setAiThinkingLevel, spendDiamonds } = useGameStore();
    const settings = gameState.settings || { bgmVolume: 0.2, sfxVolume: 0.8, isMuted: false, isEcoMode: false };
    const isVip = gameState.isVip; // Grab VIP status

    // Avatar Logic
    const [realisticAvatars, setRealisticAvatars] = useState<{id: string, url: string, type: string}[]>([]);
    const [eventCharImg, setEventCharImg] = useState<string>('');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [tempAvatarConfig, setTempAvatarConfig] = useState<AvatarConfig>(userProfile?.avatarConfig || { mode: 'cartoon', cartoonSeed: userProfile?.name || 'seed' });
    const [tempCover, setTempCover] = useState<string>(userProfile?.coverImage || PROFILE_COVERS[0]);
    const [editTab, setEditTab] = useState<'cartoon' | 'realistic' | 'cover'>('cartoon');
    
    // --- NEW: SETTINGS MODAL STATE ---
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // --- NEW: TAB LOGIC (STATS vs STYLE) ---
    const [profileTab, setProfileTab] = useState<'stats' | 'style'>('stats');

    // --- SMART POPOVER LOGIC (Fixed Position) ---
    const [selectedBuffId, setSelectedBuffId] = useState<string | null>(null);
    const [popoverPos, setPopoverPos] = useState<{top: number, left: number} | null>(null);

    // --- STAT INSPECTOR STATE ---
    const [inspectedStat, setInspectedStat] = useState<keyof PlayerAttributes | null>(null);

    // --- SMART HOME UI STATE ---
    const [isHubOpen, setIsHubOpen] = useState(false);

    // --- BIO EDITOR STATE ---
    const [isBioModalOpen, setIsBioModalOpen] = useState(false);
    const [bioInput, setBioInput] = useState('');
    const BIO_EDIT_COST = 300;

    useEffect(() => {
        const loadAvatars = async () => {
            const avatarList = [
                { id: 'male', type: 'male', path: 'avatars/male.png' },
                { id: 'male2', type: 'male', path: 'avatars/male2.png' },
                { id: 'male3', type: 'male', path: 'avatars/male3.png' },
                { id: 'male4', type: 'male', path: 'avatars/male4.png' },
                { id: 'female', type: 'female', path: 'avatars/female.png' },
                { id: 'female2', type: 'female', path: 'avatars/female2.png' },
                { id: 'female3', type: 'female', path: 'avatars/female3.png' },
                { id: 'female4', type: 'female', path: 'avatars/female4.png' },
                { id: 'female5', type: 'female', path: 'avatars/female5.png' },
            ];

            const loaded = await Promise.all(avatarList.map(async (av) => {
                const url = await getCharacterImageUrl(av.path);
                return url ? { id: av.id, url, type: av.type } : null;
            }));
            
            setRealisticAvatars(loaded.filter(Boolean) as {id: string, url: string, type: string}[]);
        };
        loadAvatars();
    }, []);

    useEffect(() => {
        const loadEventImg = async () => {
            if (gameState.activeEvent) {
                const charData = CHARACTER_DATA[gameState.activeEvent.characterId];
                if (charData && charData.baseImg) {
                    const url = await getCharacterImageUrl(charData.baseImg);
                    if (url) setEventCharImg(url);
                }
            }
        };
        loadEventImg();
    }, [gameState.activeEvent]);

    // [MARCUS NEW]: Calculate top relationship
    const { topCharId, topCharTier } = React.useMemo(() => {
        let maxId: CharacterId | null = null;
        let maxTier: RelationshipTier | null = null;
        let maxScore = -1;
        Object.entries(gameState.loveScores).forEach(([charId, score]) => {
            const numericScore = score as number;
            if ((gameState.metCharacters || []).includes(charId as CharacterId) && numericScore > maxScore) {
                maxScore = numericScore;
                maxId = charId as CharacterId;
                maxTier = gameState.relationshipTiers[charId as CharacterId];
            }
        });
        return { topCharId: maxId, topCharTier: maxTier };
    }, [gameState.loveScores, gameState.metCharacters, gameState.relationshipTiers]);

    const [topCharImgUrl, setTopCharImgUrl] = useState<string | null>(null);

    useEffect(() => {
        const loadTopCharImg = async () => {
            if (topCharId) {
                const cData = CHARACTER_DATA[topCharId];
                if (cData && cData.baseImg) {
                    const url = await getCharacterImageUrl(cData.baseImg);
                    if (url) setTopCharImgUrl(url);
                }
            }
        };
        loadTopCharImg();
    }, [topCharId]);

    // Close buff popover on click outside
    useEffect(() => {
        const handleClickOutside = () => {
            setSelectedBuffId(null);
            setPopoverPos(null);
        };
        if (selectedBuffId) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [selectedBuffId]);

    const handleBuffClick = (e: React.MouseEvent, buffId: string) => {
        e.stopPropagation();
        if (selectedBuffId === buffId) {
            setSelectedBuffId(null);
            setPopoverPos(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setPopoverPos({ top: rect.bottom + 8, left: rect.left });
            setSelectedBuffId(buffId);
        }
    };

    const getAvatarUrl = (config: AvatarConfig | undefined) => {
        if (config?.mode === 'realistic' && config.realisticId) {
            const found = realisticAvatars.find(a => a.id === config.realisticId);
            return found ? found.url : null;
        }
        const seed = config?.cartoonSeed || userProfile?.name || 'seed';
        const bg = config?.cartoonColor || 'b6e3f4';
        return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=${bg}`;
    };

    const avatarUrl = getAvatarUrl(userProfile?.avatarConfig);
    const coverUrl = userProfile?.coverImage || PROFILE_COVERS[0];

    const getPlayerTitle = () => {
        if (gameState.stats.vit > 10) return "Gym Rat";
        if (gameState.stats.cha > 10) return "Heartbreaker";
        if (gameState.stats.int > 10) return "Mastermind";
        if (gameState.gold > 5000) return "High Roller";
        return "Citizen";
    };

    const hasSmartHome = (gameState.unlockedSkills || []).includes('work_from_home');
    const hasSpotify = (gameState.unlockedSkills || []).includes('spotifi_premium'); // NEW: Check for Music Skill

    // --- STYLE BADGE LOGIC ---
    const equippedStyleItem = gameState.equippedStyle 
        ? FASHION_ITEMS.find(i => i.id === gameState.equippedStyle) 
        : null;

    const getStyleBadgeClasses = (item: typeof equippedStyleItem) => {
        if (!item) return "bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700";
        
        // VANDAL: Premium Black & Gold Aura
        if (item.collection === 'vandal') {
            return "bg-slate-950 text-amber-300 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.5)] ring-1 ring-amber-500/30 animate-pulse";
        }
        
        // Expensive (> 5000): Gradient Purple/Pink
        if (item.cost >= 5000) {
            return "bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/40 dark:to-fuchsia-900/40 text-violet-600 dark:text-violet-300 border-violet-200 dark:border-violet-700 shadow-sm";
        }
        
        // Mid-Range (> 2000): Professional Blue
        if (item.cost >= 2000) {
            return "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800";
        }

        // Basic
        return "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600";
    };

    // --- HELPER: GENDER ICON ---
    const getGenderIcon = (gender: string | undefined) => {
        if (gender === 'male') return <Mars size={16} className="text-blue-500 fill-blue-100" />;
        if (gender === 'female') return <Venus size={16} className="text-pink-500 fill-pink-100" />;
        return <Sparkles size={16} className="text-purple-500 fill-purple-100" />;
    };

    // --- STORY BADGE LOGIC ---
    const storyTitle = STORY_TITLES[gameState.currentChapter || 1] || "Citizen";

    const openProfileEditor = () => {
        setTempAvatarConfig(userProfile?.avatarConfig || { mode: 'cartoon', cartoonSeed: userProfile?.name || 'seed' });
        setTempCover(userProfile?.coverImage || PROFILE_COVERS[0]);
        // Set initial tab based on current avatar mode
        setEditTab(userProfile?.avatarConfig?.mode || 'cartoon');
        setIsEditingProfile(true);
    };

    // --- HANDLE BIO EDIT ---
    const openBioEditor = () => {
        setBioInput(userProfile?.interests || "");
        setIsBioModalOpen(true);
    };

    const handleSaveBio = () => {
        if ((gameState.diamonds || 0) < BIO_EDIT_COST) return; // UI handles disabled state
        
        const success = spendDiamonds(BIO_EDIT_COST);
        if (success) {
            onUpdateProfile({ ...userProfile!, interests: bioInput.trim() });
            setIsBioModalOpen(false);
        }
    };

    // --- SETTINGS MODAL (PORTALED) ---
    const renderSettingsModal = () => {
        if (!isSettingsOpen) return null;

        return createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl flex flex-col border border-white/20 transform scale-[0.75] sm:scale-100 origin-center">
                    <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg">
                                <Settings size={18} className="text-slate-600 dark:text-slate-300" />
                            </div>
                            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white tracking-tight">Settings</h3>
                        </div>
                        <button onClick={() => setIsSettingsOpen(false)} aria-label="Close Settings" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400">
                            <XCircle size={22} className="text-gray-400 hover:text-slate-600" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        
                        {/* Audio Controls */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Audio System</h4>
                            
                            {/* Master Mute */}
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${settings.isMuted ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}>
                                        {settings.isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-800 dark:text-white">Master Sound</div>
                                        <div className="text-[11px] text-gray-500">{settings.isMuted ? 'Muted' : 'Active'}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={toggleMute}
                                    aria-label={settings.isMuted ? "Unmute master sound" : "Mute master sound"}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 ${settings.isMuted ? 'bg-gray-300' : 'bg-green-500'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${settings.isMuted ? 'translate-x-0' : 'translate-x-6'}`}></div>
                                </button>
                            </div>

                            {/* BGM Volume Slider */}
                            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        <Music size={16} className="text-pink-500" />
                                        <span className="font-bold text-sm text-gray-800 dark:text-white">BGM (Music)</span>
                                    </div>
                                    <span className="text-xs font-bold text-pink-500">{Math.round(settings.bgmVolume * 100)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.05"
                                    disabled={settings.isMuted}
                                    value={settings.bgmVolume}
                                    onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                                    aria-label="BGM Volume"
                                    className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                                />
                            </div>

                            {/* SFX Volume Slider */}
                            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        <BellRing size={16} className="text-blue-500" />
                                        <span className="font-bold text-sm text-gray-800 dark:text-white">SFX (Effects)</span>
                                    </div>
                                    <span className="text-xs font-bold text-blue-500">{Math.round(settings.sfxVolume * 100)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.05"
                                    disabled={settings.isMuted}
                                    value={settings.sfxVolume}
                                    onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                                    aria-label="SFX Volume"
                                    className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                                />
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-slate-800" />

                        {/* Performance Settings */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Performance</h4>
                            
                            {/* Eco Mode Toggle */}
                            <div className="flex items-center justify-between bg-green-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-green-100 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${settings.isEcoMode ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 dark:bg-slate-700'}`}>
                                        <Leaf size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-800 dark:text-white">Eco Mode</div>
                                        <div className="text-[11px] text-gray-500">{settings.isEcoMode ? 'Saving RAM/GPU' : 'High Performance'}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={toggleEcoMode}
                                    aria-label={settings.isEcoMode ? "Disable eco mode" : "Enable eco mode"}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 ${settings.isEcoMode ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${settings.isEcoMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </button>
                            </div>

                            {/* AI Thinking Budget */}
                            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-purple-100 text-purple-500 rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-800 dark:text-white">AI Thinking</div>
                                            <div className="text-[11px] text-gray-500">Configure AI reasoning depth</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-3">
                                    <button 
                                        onClick={() => setAiThinkingLevel('fast')}
                                        aria-label="Set AI thinking to Fast"
                                        className={`px-2 py-2 rounded-xl text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 ${settings.aiThinkingLevel === 'fast' ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-slate-600'}`}
                                    >Fast</button>
                                    <button 
                                        onClick={() => setAiThinkingLevel('normal')}
                                        aria-label="Set AI thinking to Normal"
                                        className={`px-2 py-2 rounded-xl text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 ${(!settings.aiThinkingLevel || settings.aiThinkingLevel === 'normal') ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-slate-600'}`}
                                    >Normal</button>
                                    <button 
                                        onClick={() => setAiThinkingLevel('deep')}
                                        aria-label="Set AI thinking to Deep"
                                        className={`px-2 py-2 rounded-xl text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 ${settings.aiThinkingLevel === 'deep' ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-slate-600'}`}
                                    >Deep</button>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-slate-800" />

                        {/* Account Actions */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Account</h4>
                            <button 
                                onClick={onLogout}
                                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 font-bold py-3.5 rounded-xl border border-red-200 transition-all active:scale-95"
                            >
                                <LogOut size={18} /> Log Out
                            </button>
                        </div>

                    </div>
                </div>
            </div>,
            document.body // PORTAL TARGET
        );
    };

    // Profile Editor Modal (Replaces old Avatar Editor)
    const renderProfileEditor = () => {
        if (!isEditingProfile) return null;
        const previewUrl = getAvatarUrl(tempAvatarConfig);
        
        // --- NEW: Filter Realistic Avatars by Gender (Onboarding Logic) ---
        const filteredRealistic = realisticAvatars.filter(av => {
            if (!userProfile?.gender || userProfile.gender === 'other') return true;
            return av.type === userProfile.gender;
        });
  
        return createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                    <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
                        <h3 className="font-bold text-lg dark:text-white">Edit Profile</h3>
                        <button onClick={() => setIsEditingProfile(false)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors">
                            <XCircle size={20} className="text-gray-400" />
                        </button>
                    </div>
                    
                    <div className="p-6 flex flex-col items-center gap-6 overflow-y-auto custom-scrollbar flex-1">
                        
                        {/* Tab Switcher */}
                        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-full">
                            <button 
                                onClick={() => { setEditTab('cartoon'); setTempAvatarConfig(prev => ({ ...prev, mode: 'cartoon' })); }} 
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${editTab === 'cartoon' ? 'bg-white dark:bg-slate-600 shadow text-gray-800 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Digital Soul
                            </button>
                            <button 
                                onClick={() => { 
                                    setEditTab('realistic'); 
                                    setTempAvatarConfig(prev => ({ 
                                        ...prev, 
                                        mode: 'realistic', 
                                        realisticId: prev.realisticId || filteredRealistic[0]?.id || 'male' 
                                    })); 
                                }} 
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${editTab === 'realistic' ? 'bg-white dark:bg-slate-600 shadow text-gray-800 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Real ID
                            </button>
                            <button 
                                onClick={() => setEditTab('cover')} 
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${editTab === 'cover' ? 'bg-white dark:bg-slate-600 shadow text-gray-800 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Change Cover
                            </button>
                        </div>

                        {/* Content Area */}
                        {editTab === 'cartoon' ? (
                            <div className="w-full space-y-4 flex flex-col items-center">
                                <div className="w-32 h-32 rounded-full border-[6px] border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-slate-700 relative group shrink-0">
                                    <TransitionImage src={previewUrl || undefined} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="w-full">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Seed</label>
                                    <div className="flex gap-2">
                                        <input type="text" value={tempAvatarConfig.cartoonSeed} onChange={(e) => setTempAvatarConfig(prev => ({...prev, cartoonSeed: e.target.value}))} className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-300" />
                                        <button onClick={() => setTempAvatarConfig(prev => ({...prev, cartoonSeed: Math.random().toString(36).substring(7)}))} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-pink-50 text-pink-500"><RefreshCcw size={18} /></button>
                                    </div>
                                </div>
                                <div className="w-full">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Background Color</label>
                                    <div className="flex gap-2 justify-center">
                                        {['b6e3f4', 'ffdfbf', 'c0aede', 'd1d4f9', 'ffd5dc', 'transparent'].map(color => (
                                            <button key={color} onClick={() => setTempAvatarConfig(prev => ({...prev, cartoonColor: color}))} aria-label={`Select background color ${color}`} className={`w-8 h-8 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-pink-400 ${color === 'transparent' ? 'bg-white' : ''} ${tempAvatarConfig.cartoonColor === color ? 'border-pink-500 scale-110' : 'border-transparent'}`} style={{ backgroundColor: color !== 'transparent' ? `#${color}` : undefined }}>{color === 'transparent' && <span className="text-[11px] font-bold text-gray-400">X</span>}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : editTab === 'realistic' ? (
                            <div className="w-full flex flex-col items-center">
                                <div className="w-32 h-32 rounded-full border-[6px] border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-slate-700 relative group shrink-0 mb-4">
                                    <TransitionImage src={previewUrl || undefined} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="w-full">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Select Avatar</label>
                                        <span className="text-[11px] font-bold text-pink-500 bg-pink-50 dark:bg-pink-900/30 px-2 py-0.5 rounded-lg border border-pink-100 dark:border-pink-800 flex items-center gap-1">
                                            {getGenderIcon(userProfile?.gender)}
                                            {userProfile?.gender?.toUpperCase() || 'IDENTITY'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {filteredRealistic.map(av => (
                                            <button key={av.id} onClick={() => setTempAvatarConfig(prev => ({ ...prev, realisticId: av.id }))} className={`rounded-xl overflow-hidden border-2 transition-all aspect-square ${tempAvatarConfig.realisticId === av.id ? 'border-pink-500 shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                                <TransitionImage src={av.url} alt={av.id} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                    {filteredRealistic.length === 0 && (
                                        <div className="text-center py-6 text-gray-400 text-xs">No avatars matching your identity.</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Select Cover</label>
                                <div className="grid grid-cols-1 gap-4">
                                    {PROFILE_COVERS.map((url, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setTempCover(url)}
                                            className={`relative h-32 w-full rounded-2xl overflow-hidden border-2 transition-all hover:scale-[1.02] group ${tempCover === url ? 'border-pink-500 ring-2 ring-pink-200' : 'border-transparent'}`}
                                        >
                                            <TransitionImage src={url} alt={`Cover ${idx}`} className="w-full h-full object-cover" />
                                            {tempCover === url && (
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                    <div className="bg-white p-1 rounded-full text-pink-500 shadow-md">
                                                        <CheckCircle2 size={24} />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-slate-800">
                        <button 
                            onClick={() => { 
                                onUpdateProfile({ ...userProfile!, avatarConfig: tempAvatarConfig, coverImage: tempCover }); 
                                setIsEditingProfile(false); 
                            }} 
                            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-pink-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>,
            document.body // PORTAL TARGET
        );
    };

    // --- BIO EDITOR MODAL (NEW) ---
    const renderBioEditor = () => {
        if (!isBioModalOpen) return null;
        const canAfford = (gameState.diamonds || 0) >= BIO_EDIT_COST;

        return createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl border-4 border-cyan-500/20 flex flex-col">
                    <div className="p-6 bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-20"></div>
                        <Fingerprint size={48} className="mx-auto mb-2 text-cyan-200 animate-pulse" />
                        <h3 className="font-black text-2xl tracking-tighter uppercase drop-shadow-md">Override Identity</h3>
                        <p className="text-cyan-100 text-xs font-medium mt-1">Update your personal Bio signature.</p>
                    </div>

                    <div className="p-6">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">New Identity (Bio)</label>
                        <div className="relative mb-6">
                            <input 
                                type="text" 
                                value={bioInput}
                                onChange={(e) => setBioInput(e.target.value)}
                                maxLength={30}
                                placeholder="e.g. A Billionaire heir..."
                                className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-gray-800 dark:text-white focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 dark:focus:ring-cyan-900/30 transition-all pr-12"
                            />
                            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold ${bioInput.length >= 30 ? 'text-red-500' : 'text-gray-400'}`}>
                                {bioInput.length}/30
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsBioModalOpen(false)}
                                className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveBio}
                                disabled={!canAfford || !bioInput.trim()}
                                className={`flex-[2] py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${canAfford && bioInput.trim() ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110' : 'bg-gray-400 cursor-not-allowed'}`}
                            >
                                {canAfford ? (
                                    <>Override <span className="bg-black/20 px-2 py-0.5 rounded text-xs flex items-center gap-1">{BIO_EDIT_COST} <Gem size={10}/></span></>
                                ) : (
                                    <>Insufficient Gems</>
                                )}
                            </button>
                        </div>
                        {!canAfford && (
                            <p className="text-center text-[11px] font-bold text-red-400 mt-3 flex items-center justify-center gap-1">
                                <AlertCircle size={10} /> You need {BIO_EDIT_COST} Diamonds.
                            </p>
                        )}
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    // --- STAT INSPECTOR MODAL (PORTALED) ---
    const renderStatInspector = () => {
        if (!inspectedStat) return null;
        
        const baseValue = gameState.stats[inspectedStat];
        const buffValue = getBuffValue(`buff_${inspectedStat}`);
        const styleValue = getStyleValue(inspectedStat);
        const total = baseValue + buffValue + styleValue;
        
        // Define metadata based on stat
        let title = "";
        let desc = "";
        let effectLabel = "";
        let colorClass = "";
        let bgGradient = "";
        let icon: React.ReactNode = null;

        switch(inspectedStat) {
            case 'vit':
                title = "VITALITY";
                desc = "เพิ่มขีดจำกัดพลังงานสูงสุด (Max Energy) ของคุณ";
                effectLabel = `+${(total * 5) - 5} Max Energy`;
                colorClass = "text-red-400";
                bgGradient = "from-red-500/20 to-orange-500/20 border-red-500/30";
                icon = <Zap size={32} className="text-red-400" fill="currentColor" />;
                break;
            case 'int':
                title = "INTELLECT";
                desc = "เพิ่มจำนวนเงิน (Gold) ที่ได้รับจากการทำงาน";
                effectLabel = `+${(total - 1) * 2}% Gold Bonus`;
                colorClass = "text-blue-400";
                bgGradient = "from-blue-500/20 to-indigo-500/20 border-blue-500/30";
                icon = <Brain size={32} className="text-blue-400" fill="currentColor" />;
                break;
            case 'cha':
                title = "CHARISMA";
                desc = "เพิ่มแต้มความรักที่ได้รับจากการพูดคุยและปฏิสัมพันธ์";
                effectLabel = `+${(total - 1)}% Love Bonus`;
                colorClass = "text-pink-400";
                bgGradient = "from-pink-500/20 to-rose-500/20 border-pink-500/30";
                icon = <Sparkles size={32} className="text-pink-400" fill="currentColor" />;
                break;
            case 'luck':
                title = "FORTUNE";
                desc = "เพิ่มโอกาสสำเร็จระดับ Critical (ได้รับรางวัล x2)";
                effectLabel = `+${(total - 1) * 2}% Crit Chance`;
                colorClass = "text-yellow-400";
                bgGradient = "from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
                icon = <Clover size={32} className="text-yellow-400" fill="currentColor" />;
                break;
        }

        return createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setInspectedStat(null)}>
                <div 
                    className="bg-slate-900/95 w-full max-w-[300px] rounded-3xl border border-slate-700 p-5 relative shadow-2xl animate-in zoom-in-95 duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col items-center text-center mb-4">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${bgGradient} border shadow-lg mb-3`}>
                            {icon}
                        </div>
                        <h3 className={`text-2xl font-black ${colorClass} tracking-tight uppercase`}>{title}</h3>
                        <p className="text-xs font-medium text-slate-400 mt-1 px-2 leading-relaxed">{desc}</p>
                    </div>

                    <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-700 mb-4">
                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">
                            <span>Current Level</span>
                            <span>{total}</span>
                        </div>
                        
                        <div className={`bg-gradient-to-r ${bgGradient} border rounded-xl p-3 flex flex-col items-center justify-center shadow-inner`}>
                            <span className="text-[11px] font-bold text-white/70 uppercase mb-0.5">Effect Active</span>
                            <span className={`text-xl font-black ${colorClass} drop-shadow-md`}>{effectLabel}</span>
                        </div>
                        
                        {buffValue > 0 && (
                            <div className="mt-2 text-center text-[11px] text-green-400 font-bold bg-green-900/20 py-1 rounded-lg border border-green-900/30">
                                Including +{buffValue} from Buffs
                            </div>
                        )}
                        {styleValue > 0 && (
                            <div className="mt-1 text-center text-[11px] text-fuchsia-400 font-bold bg-fuchsia-900/20 py-1 rounded-lg border border-fuchsia-900/30">
                                Including +{styleValue} from Style
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => setInspectedStat(null)}
                        className="w-full bg-white hover:bg-gray-100 text-slate-900 font-extrabold py-3 rounded-xl text-sm active:scale-95 transition-all shadow-lg"
                    >
                        Got it
                    </button>
                </div>
            </div>,
            document.body // PORTAL TARGET
        );
    };

    // Calculate selected buff config for the FIXED POPOVER
    const selectedBuff = gameState.activeBuffs.find(b => b.id === selectedBuffId);
    const selectedBuffConfig = selectedBuff ? getBuffConfig(selectedBuff.type) : null;
    const selectedBuffTimeLeft = selectedBuff ? Math.ceil((selectedBuff.expiresAt - Date.now()) / 60000) : 0;

    // --- CALCULATE BUFF VALUES ---
    const getBuffValue = (type: string) => {
        return gameState.activeBuffs
            .filter(b => b.type === type)
            .reduce((sum, b) => sum + b.value, 0);
    };

    // --- CALCULATE STYLE VALUES ---
    const getStyleValue = (stat: keyof PlayerAttributes) => {
        if (!gameState.equippedStyle) return 0;
        const style = FASHION_ITEMS.find(s => s.id === gameState.equippedStyle);
        return style?.stats[stat] || 0;
    };

    const vitBuff = getBuffValue('buff_vit');
    const intBuff = getBuffValue('buff_int');
    const chaBuff = getBuffValue('buff_cha');
    const luckBuff = getBuffValue('buff_luck');

    const vitStyle = getStyleValue('vit');
    const intStyle = getStyleValue('int');
    const chaStyle = getStyleValue('cha');
    const luckStyle = getStyleValue('luck');

    // --- RENDER STYLE LIST ---
    const renderStyleList = () => {
        const owned = gameState.ownedStyles;
        
        return (
            <div className="grid grid-cols-1 gap-3 px-1 pb-4">
                {/* Default / Unequip Option */}
                <button
                    onClick={() => onEquipStyle(null)}
                    className={`
                        p-4 rounded-2xl border-2 flex items-center justify-between transition-all active:scale-95
                        ${!gameState.equippedStyle 
                            ? 'bg-slate-800 border-white text-white shadow-lg' 
                            : 'bg-white dark:bg-slate-800 border-dashed border-gray-300 dark:border-slate-700 text-gray-500'}
                    `}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xl">
                            👕
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-sm">Standard Look</h4>
                            <p className="text-[11px] opacity-70">No bonus stats</p>
                        </div>
                    </div>
                    {!gameState.equippedStyle && <CheckCircle2 size={20} className="text-green-400" />}
                </button>

                {owned.map(styleId => {
                    const style = FASHION_ITEMS.find(s => s.id === styleId);
                    if (!style) return null;
                    const isEquipped = gameState.equippedStyle === styleId;

                    return (
                        <button
                            key={styleId}
                            onClick={() => onEquipStyle(styleId)}
                            className={`
                                p-4 rounded-2xl border-2 flex items-center justify-between transition-all active:scale-95 group relative overflow-hidden
                                ${isEquipped 
                                    ? 'bg-gradient-to-r from-fuchsia-900 to-purple-900 border-fuchsia-400 text-white shadow-lg shadow-fuchsia-900/30' 
                                    : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-800 dark:text-white hover:border-gray-300 dark:hover:border-slate-600'}
                            `}
                        >
                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${isEquipped ? 'bg-black/40' : 'bg-gray-100 dark:bg-slate-700'}`}>
                                    {style.icon}
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-sm">{style.name}</h4>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {Object.entries(style.stats).map(([stat, v]) => (
                                            <span key={stat} className={`text-[11px] font-bold px-1.5 py-0.5 rounded uppercase ${isEquipped ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>
                                                {stat} +{String(v)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {isEquipped && <div className="relative z-10"><CheckCircle2 size={20} className="text-fuchsia-400" /></div>}
                        </button>
                    );
                })}

                {owned.length === 0 && (
                    <div className="text-center py-8 text-gray-400 dark:text-slate-500 text-xs font-medium bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800">
                        No styles owned yet.<br/>Visit the Fashion Mall to buy clothes!
                    </div>
                )}
            </div>
        );
    };

    const currentTrack = globalMusic && BASEMENT_TRACKS[globalMusic.trackIndex];

    const getRelationshipThaiLabel = (tier: RelationshipTier | null) => {
        switch (tier) {
            case RelationshipTier.STRANGER: return 'เพิ่งรู้จักกัน';
            case RelationshipTier.ACQUAINTANCE: return 'คนรู้จัก';
            case RelationshipTier.FRIEND: return 'เพื่อน';
            case RelationshipTier.FLIRTING: return 'แอบชอบ / สนใจ'; // Can adjust based on character context if needed
            case RelationshipTier.PARTNER: return 'คนรัก / คบหาดูใจ';
            case RelationshipTier.SOULMATE: return 'คู่แท้';
            case RelationshipTier.ETERNAL: return 'คู่ชีวิต / แต่งงาน';
            case RelationshipTier.BEST_FRIEND: return 'เพื่อนสนิท';
            case RelationshipTier.SOUL_SIBLING: return 'ครอบครัว';
            default: return 'คนแปลกหน้า';
        }
    };
    
    // Status text logic based on Marcus/Fia examples
    const getDetailedStatusText = (charId: CharacterId | null, tier: RelationshipTier | null) => {
        if (!charId || !tier) return 'โสด / ยังไม่มีเป้าหมาย';
        
        if (charId === 'miguel' && tier === RelationshipTier.FRIEND) return 'เพื่อนสนิท';
        if (charId === 'fia' && tier === RelationshipTier.FLIRTING) return 'แอบชอบ / สนใจ';
        if (charId === 'fia' && tier === RelationshipTier.PARTNER) return 'แฟน / คนรัก';
        if (charId === 'marcus' && tier === RelationshipTier.ETERNAL) return 'คู่ชีวิต / แต่งงาน';
        
        // Fallback to purely generic
        return getRelationshipThaiLabel(tier);
    };

    const topCharLabel = getDetailedStatusText(topCharId, topCharTier);
    const topCharData = topCharId ? CHARACTER_DATA[topCharId] : null;

    return (
        <div className="relative max-w-5xl mx-auto w-full">
            {renderProfileEditor()}
            {renderBioEditor()}
            {renderStatInspector()}
            {renderSettingsModal()}

            {/* FIXED POPOVER LAYER - Also Portaled for Z-Index Safety */}
            {selectedBuff && selectedBuffConfig && popoverPos && createPortal(
                <div 
                    className="fixed z-[9999] w-max max-w-[200px] bg-slate-900/95 text-white backdrop-blur-md p-3 rounded-xl shadow-2xl border border-slate-700 animate-in zoom-in-95 fade-in duration-200 origin-top-left"
                    style={{ top: popoverPos.top, left: popoverPos.left }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{selectedBuffConfig.icon}</span>
                        <span className="font-bold text-xs text-pink-300 uppercase tracking-wide">{selectedBuffConfig.label}</span>
                    </div>
                    <div className="text-[10px] text-gray-300 font-medium leading-relaxed">
                        {getBuffDescription(selectedBuff.type, selectedBuff.value)}
                    </div>
                    <div className="mt-1.5 pt-1.5 border-t border-white/10 flex justify-between items-center text-[9px] font-mono text-gray-500">
                        <span>Expires in:</span>
                        <span className="text-white">{selectedBuffTimeLeft} mins</span>
                    </div>
                </div>,
                document.body
            )}

            {/* ... (Rest of layout grid same as original) ... */}
            <div className="md:grid md:grid-cols-12 md:gap-8 md:px-4 md:items-start pb-4">
                
                {/* --- LEFT COLUMN: IDENTITY (Sticky on Desktop) --- */}
                <div className="md:col-span-4 relative z-10 md:sticky md:top-6 h-fit animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Desktop Card Wrapper */}
                    <div className="md:bg-white md:dark:bg-slate-900 md:rounded-[2.5rem] md:shadow-xl md:border md:border-gray-100 md:dark:border-slate-700 md:overflow-hidden pb-6">

                        {/* Header Image & Avatar Group */}
                        <div className="relative -mx-4 -mt-4 mb-16 md:mx-0 md:mt-0 md:mb-0 group/cover">
                            <div className="h-80 md:h-72 w-full relative bg-gray-200 dark:bg-slate-800 md:rounded-t-[2.5rem] md:rounded-b-none md:overflow-hidden">
                                <TransitionImage 
                                    src={coverUrl} 
                                    alt="Cover" 
                                    className="w-full h-full object-cover" 
                                />
                                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/30 to-transparent pointer-events-none"></div>
                                {/* Mobile Gradient Only */}
                                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 md:hidden pointer-events-none"></div>
                                
                                {/* SETTINGS BUTTON - Fixed Visibility */}
                                <button 
                                    onClick={() => setIsSettingsOpen(true)} 
                                    className="absolute top-4 right-4 z-30 bg-black/40 hover:bg-black/60 backdrop-blur-md p-2.5 rounded-full text-white transition-all border border-white/30 shadow-sm active:scale-95"
                                    title="Settings"
                                >
                                    <Settings size={20} />
                                </button>
                            </div>

                            {/* Floating Avatar - Centered on Desktop - [MARCUS VIP]: GOLDEN BORDER & CROWN */}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 md:translate-y-1/2 z-20">
                                <div className="relative group">
                                    {/* VIP CROWN BADGE */}
                                    {isVip && (
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 animate-bounce-soft">
                                            <div className="bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-900">
                                                <Crown size={24} className="text-white drop-shadow-md" fill="currentColor" />
                                            </div>
                                        </div>
                                    )}

                                    <div 
                                        className={`
                                            w-36 h-36 md:w-48 md:h-48 rounded-full border-[6px] shadow-2xl overflow-hidden relative z-10 transition-all duration-500
                                            ${isVip 
                                                ? 'border-yellow-400 dark:border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)] bg-white dark:bg-slate-800 ring-4 ring-yellow-400/20' 
                                                : 'border-gray-50 dark:border-slate-900 md:border-white md:dark:border-slate-900 bg-white dark:bg-slate-800'}
                                        `}
                                    >
                                        {/* VIP Glow Layer inside Avatar */}
                                        {isVip && <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-500/10 to-transparent pointer-events-none z-20"></div>}

                                        {avatarUrl ? (
                                            <TransitionImage 
                                                src={avatarUrl} 
                                                alt="Avatar" 
                                                className="w-full h-full object-cover relative z-10" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 relative z-10"><User size={56} /></div>
                                        )}
                                    </div>
                                    
                                    <button 
                                        onClick={openProfileEditor} 
                                        className="absolute bottom-2 right-2 z-20 bg-white dark:bg-slate-800 text-gray-700 dark:text-white p-2 rounded-full border border-gray-200 dark:border-slate-700 shadow-md hover:scale-110 hover:text-pink-500 transition-all"
                                    >
                                        <Edit size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* User Info & Stats (Left Col Content) - AAA Dossier Redesign */}
                        <div className="w-full max-w-sm mx-auto flex flex-col gap-3 px-4 pt-4 md:pt-24 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            
                            {/* DOSSIER HEADER */}
                            <div className="flex items-center justify-between pl-1 pr-1">
                                <div className="text-[11px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]"></div>
                                    PLAYER DOSSIER
                                </div>
                                <div className="text-[11px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-sm border border-slate-300 dark:border-slate-700 font-mono tracking-wider shadow-inner">
                                    ID: {userProfile?.name?.toUpperCase().slice(0,3) || 'USR'}-{gameState.level?.toString().padStart(3, '0')}
                                </div>
                            </div>

                            {/* DOSSIER BENTO GRID */}
                            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80 rounded-[1.5rem] p-1.5 border-2 border-slate-200/60 dark:border-slate-700/60 shadow-xl relative overflow-hidden group">
                                {/* Glow accents */}
                                <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-pink-500/10 blur-[40px] pointer-events-none transition-transform group-hover:scale-150 duration-700"></div>
                                <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-cyan-500/10 blur-[40px] pointer-events-none transition-transform group-hover:scale-150 duration-700"></div>

                                <div className="flex flex-col gap-1.5 relative z-10">
                                    
                                    {/* TOP ROW: Identity */}
                                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-[1.1rem] p-4 flex flex-col items-center text-center gap-3 border border-white/50 dark:border-slate-700/50 shadow-sm">
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2 drop-shadow-sm">
                                            {userProfile?.name}
                                            <span className="inline-flex items-center gap-1 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 px-2 py-0.5 rounded-md border border-slate-300/50 dark:border-slate-700 shadow-inner text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-wider">
                                                {getGenderIcon(userProfile?.gender)}
                                                {userProfile?.age}
                                            </span>
                                        </h2>
                                        
                                        {/* Status Tags */}
                                        <div className="flex flex-wrap items-center justify-center gap-1.5 w-full">
                                            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2.5 py-0.5 rounded text-[11px] font-black tracking-widest uppercase shadow-[0_2px_10px_rgba(99,102,241,0.3)] border border-indigo-400/30 flex items-center gap-1">
                                                LV.{gameState.level}
                                            </span>
                                            {isVip ? (
                                                <button 
                                                    onClick={() => useUIStore.getState().setShowVipModal(true)}
                                                    aria-label="View VIP status"
                                                    className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 px-2.5 py-0.5 rounded text-[11px] font-black tracking-widest uppercase shadow-[0_2px_10px_rgba(245,158,11,0.4)] border border-yellow-300 flex items-center gap-1 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                >
                                                    <Crown size={10} fill="currentColor" /> VIP ACTIVE
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => useUIStore.getState().setShowVipModal(true)}
                                                    aria-label="Get VIP membership"
                                                    className="bg-slate-100 dark:bg-slate-800 hover:bg-yellow-50 dark:hover:bg-amber-950/40 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 px-2.5 py-0.5 rounded text-[11px] font-bold tracking-widest uppercase border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition-all flex items-center gap-1 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                >
                                                    <Crown size={10} /> GET VIP
                                                </button>
                                            )}
                                            <span className="bg-slate-800 dark:bg-slate-950 text-slate-200 dark:text-slate-400 px-2.5 py-0.5 rounded text-[11px] font-bold tracking-widest uppercase border border-slate-700/50 shadow-inner flex items-center">
                                                {getPlayerTitle()}
                                            </span>
                                            <span className="bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase border border-orange-200 dark:border-orange-900/50 flex items-center gap-1 shadow-sm">
                                                <BookOpen size={10} fill="currentColor" /> {storyTitle}
                                            </span>
                                        </div>
                                    </div>

                                    {/* MIDDLE ROW: Bio & Loadout Split */}
                                    <div className="grid grid-cols-2 gap-1.5 mt-3 md:mt-4">
                                        {/* Bio Card */}
                                        <div 
                                            onClick={openBioEditor} 
                                            className="bg-slate-100/80 dark:bg-slate-850 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer rounded-[1rem] px-2.5 py-2 md:p-3 flex flex-col justify-between group/bio shadow-sm"
                                        >
                                            <div className="flex justify-between items-start mb-1.5 md:mb-2">
                                                <div className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest flex items-center gap-1.5">
                                                    <Fingerprint size={11} className="text-cyan-500" /> BIO
                                                </div>
                                                <Edit size={10} className="text-slate-300 dark:text-slate-600 group-hover/bio:text-pink-500 transition-colors" />
                                            </div>
                                            <div className="text-[11px] md:text-xs font-semibold text-slate-700 dark:text-slate-200 italic line-clamp-2 leading-relaxed opacity-90">
                                                "{userProfile?.interests || 'No Bio Set'}"
                                            </div>
                                        </div>

                                        {/* Style Loadout Card */}
                                        <div className={`rounded-[1rem] px-2.5 py-2 md:p-3 flex flex-col justify-between border-2 transition-all shadow-sm ${getStyleBadgeClasses(equippedStyleItem)} hover:brightness-105`}>
                                            <div className="text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-70 mb-1.5 md:mb-2">
                                                <Shirt size={11} /> LOADOUT
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] md:text-xs font-bold leading-tight drop-shadow-sm">
                                                {equippedStyleItem ? equippedStyleItem.name : "Standard Look"}
                                                {equippedStyleItem?.collection === 'vandal' && <Sparkles size={11} className="animate-spin-slow text-yellow-200" fill="currentColor" />}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* BOTTOM ROW: Wallet */}
                                    <div className="bg-slate-100/80 dark:bg-slate-850 dark:bg-slate-800/80 rounded-[1rem] px-2.5 py-2 md:p-3 flex items-center justify-between border border-slate-200/50 dark:border-slate-700/50 shadow-sm relative overflow-hidden transition-colors hover:bg-white dark:hover:bg-slate-700 mt-1.5">
                                        <div className="text-[11px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase flex items-center gap-1.5 shrink-0">
                                            <Wallet size={12} className="text-cyan-500" /> <span className="hidden sm:inline">WALLET</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 relative z-10 flex-1 justify-end min-w-0">
                                            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-1.5 py-1 rounded-md md:rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                                                <Coins size={12} className="fill-yellow-400 text-yellow-500" />
                                                <span className="text-xs md:text-sm font-black text-slate-700 dark:text-slate-200 font-mono tracking-tight">{Math.floor(gameState.gold).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 pl-1.5 pr-1 py-1 rounded-md md:rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                                                <Gem size={12} className="fill-cyan-400 text-cyan-500" />
                                                <span className="text-xs md:text-sm font-black text-slate-700 dark:text-slate-200 font-mono tracking-tight">{(gameState.diamonds || 0).toLocaleString()}</span>
                                                <button onClick={onOpenDiamondShop} className="bg-cyan-50 dark:bg-cyan-900/30 hover:bg-cyan-100 dark:hover:bg-cyan-800 text-cyan-600 dark:text-cyan-400 p-0.5 rounded transition-all active:scale-95 ml-1 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center">
                                                    <Plus size={10} strokeWidth={4} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* [MARCUS NEW]: Top Relationship Badge */}
                                    {topCharData && (
                                        <div className="bg-slate-100/80 dark:bg-slate-850 dark:bg-slate-800/80 rounded-[1rem] px-2.5 py-2 md:p-3 flex items-center justify-between border border-slate-200/50 dark:border-slate-700/50 shadow-sm relative overflow-hidden transition-colors hover:bg-white dark:hover:bg-slate-700 mt-1.5 gap-2">
                                            <div className="text-[11px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase flex items-center gap-1.5 shrink-0">
                                                <Heart size={12} className="text-pink-500 fill-pink-500/20 shrink-0" /> <span className="hidden sm:inline">RELATION</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-1.5 relative z-10 flex-1 justify-end min-w-0">
                                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap truncate text-right">
                                                    {topCharLabel}
                                                </span>
                                                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 pr-2 pl-1 py-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                                                    {topCharImgUrl && <img src={topCharImgUrl || undefined} className="w-7 h-7 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800" alt={topCharData.name} />}
                                                    <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 tracking-tight leading-none uppercase">{topCharData.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>

                            {/* Active Buffs (Moved here for Desktop Context) */}
                            {gameState.activeBuffs.length > 0 && (
                                <div className="md:block hidden">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Active Effects</h4>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {gameState.activeBuffs.map(buff => {
                                            const timeLeft = Math.max(0, Math.ceil((buff.expiresAt - Date.now()) / 60000));
                                            const config = getBuffConfig(buff.type);
                                            const isSelected = selectedBuffId === buff.id;
                                            return (
                                                <button 
                                                    key={buff.id}
                                                    onClick={(e) => handleBuffClick(e, buff.id)}
                                                    className={`
                                                        flex items-center gap-1.5 bg-white dark:bg-slate-800 border px-3 py-1.5 rounded-full shadow-sm shrink-0 transition-all active:scale-95
                                                        ${isSelected ? 'border-pink-400 ring-2 ring-pink-200 dark:ring-pink-900 z-50' : 'border-pink-100 dark:border-slate-700'}
                                                    `}
                                                >
                                                    <span className="text-xs">{config.icon}</span>
                                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{buff.sourceName}</span>
                                                    <div className="text-[9px] font-bold text-pink-500 dark:text-pink-400 bg-pink-50 dark:bg-slate-700 px-1.5 rounded ml-1">{timeLeft}m</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: DASHBOARD & CONTROLS --- */}
                <div className="md:col-span-8 space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    
                    {/* Active Buffs (Mobile Only) */}
                    {gameState.activeBuffs.length > 0 && (
                        <div className="px-2 flex gap-2 overflow-x-auto no-scrollbar pb-1 min-h-[40px] justify-center md:hidden">
                            {gameState.activeBuffs.map(buff => {
                                const timeLeft = Math.max(0, Math.ceil((buff.expiresAt - Date.now()) / 60000));
                                const config = getBuffConfig(buff.type);
                                const isSelected = selectedBuffId === buff.id;
                                return (
                                    <button 
                                        key={buff.id}
                                        onClick={(e) => handleBuffClick(e, buff.id)}
                                        className={`
                                            flex items-center gap-1.5 bg-white dark:bg-slate-800 border px-3 py-1.5 rounded-full shadow-sm shrink-0 transition-all active:scale-95
                                            ${isSelected ? 'border-pink-400 ring-2 ring-pink-200 dark:ring-pink-900 z-50' : 'border-pink-100 dark:border-slate-700'}
                                        `}
                                    >
                                        <span className="text-xs">{config.icon}</span>
                                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{buff.sourceName}</span>
                                        <div className="text-[9px] font-bold text-pink-500 dark:text-pink-400 bg-pink-50 dark:bg-slate-700 px-1.5 rounded ml-1">{timeLeft}m</div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Active Event */}
                    {gameState.activeEvent && (
                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-5 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group mx-1 transition-all hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-5 group-hover:opacity-10 transition-opacity rotate-12"><MessageCircle size={100} className="text-violet-600" /></div>
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-violet-500 to-fuchsia-500"></div> {/* Side accent */}
                            <div className="relative z-10 pl-2">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-violet-100 dark:border-violet-800/50 flex items-center gap-2"><Sparkles size={12} fill="currentColor" className="text-yellow-400" /> Story Event</div>
                                    <div className="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600">{Math.ceil((gameState.activeEvent.expiresAt - Date.now()) / 60000)}m</div>
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative shrink-0">
                                        <div className="w-14 h-14 rounded-full border-2 border-white dark:border-slate-600 shadow-sm overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            {eventCharImg && <TransitionImage src={eventCharImg} alt="Event Char" className="w-full h-full object-cover object-top" />}
                                        </div>
                                        {/* Red Notification Dot */}
                                        <div className="absolute top-0 left-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)] z-10"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight leading-none mb-1 text-slate-900 dark:text-white">{gameState.activeEvent.title}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-tight line-clamp-2">"{gameState.activeEvent.message}"</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={onDismissEvent} className="flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold py-3 rounded-xl transition-all border border-slate-200 dark:border-slate-800 text-xs">Busy (Skip)</button>
                                    <button onClick={() => onStartEventTravel(gameState.activeEvent!.locationId)} className="flex-[2] bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-3 rounded-xl shadow-md shadow-violet-200 dark:shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-lg hover:shadow-violet-300 dark:hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm">Go Now <ArrowUp className="rotate-45" size={16} /></button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Smart Home Hub - AAA Redesign (Compact Edition) */}
                    {hasSmartHome && (
                        <motion.div 
                            initial={false}
                            className={`mx-1 overflow-hidden rounded-3xl border transition-all duration-500 shadow-xl relative group ${
                                timeOfDay === 'night' 
                                ? 'bg-slate-950/40 border-indigo-500/20' 
                                : 'bg-white/70 border-blue-100'
                            }`}
                        >
                            {/* Decorative Background Elements - Subtle */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
                                <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-[40px] ${timeOfDay === 'night' ? 'bg-indigo-600' : 'bg-blue-400'}`}></div>
                            </div>

                            <button 
                                onClick={() => setIsHubOpen(!isHubOpen)}
                                className={`w-full flex items-center justify-between p-3.5 relative z-10 transition-colors ${
                                    isHubOpen 
                                    ? (timeOfDay === 'night' ? 'bg-white/5' : 'bg-blue-50/30') 
                                    : 'hover:bg-black/5'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl border transition-all duration-500 ${
                                        timeOfDay === 'night'
                                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400/80 shadow-[0_0_15px_rgba(99,102,241,0.1)] group-hover:scale-105'
                                        : 'bg-blue-500/5 border-blue-500/10 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.05)] group-hover:scale-105'
                                    }`}>
                                        <Laptop size={18} strokeWidth={2} />
                                    </div>
                                    <div className="text-left">
                                        <div className="flex items-center gap-2">
                                            <h3 className={`text-sm font-black tracking-tight ${timeOfDay === 'night' ? 'text-slate-200' : 'text-slate-700'}`}>
                                                System Control
                                            </h3>
                                            <div className="flex gap-0.5 items-center bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/10">
                                                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                                                <span className="text-[11px] font-black text-green-500 uppercase tracking-widest ml-0.5">Online</span>
                                            </div>
                                        </div>
                                        <p className={`text-[11px] font-bold uppercase tracking-[0.1em] ${timeOfDay === 'night' ? 'text-indigo-300/40' : 'text-slate-400'}`}>
                                            Home Operations
                                        </p>
                                    </div>
                                </div>
                                <div className={`p-1.5 rounded-xl border transition-all duration-500 ${
                                    isHubOpen 
                                    ? 'rotate-180 bg-slate-800 text-white shadow-md' 
                                    : 'bg-black/5 border-black/5 text-slate-400'
                                }`}>
                                    <ChevronDown size={14} strokeWidth={3} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {isHubOpen && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
                                        className="overflow-hidden relative z-10"
                                    >
                                        <div className="p-3.5 pt-0 grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'work', label: 'WORK', icon: Briefcase, color: 'blue', desc: 'Secure Server' },
                                                { id: 'shop', label: 'SHOP', icon: ShoppingBag, color: 'emerald', desc: 'Logistics' },
                                                { id: 'gym', label: 'GYM', icon: Dumbbell, color: 'orange', desc: 'Optimization' },
                                                { id: 'mall', label: 'FASHION', icon: Shirt, color: 'fuchsia', desc: 'Style ID' }
                                            ].map((item, idx) => {
                                                const Icon = item.icon;
                                                const colors: Record<string, any> = {
                                                    blue: { bg: 'from-blue-600/10', text: 'text-blue-400/80', dayText: 'text-blue-500', dayBg: 'bg-blue-50/50', border: 'border-blue-500/10' },
                                                    emerald: { bg: 'from-emerald-600/10', text: 'text-emerald-400/80', dayText: 'text-emerald-500', dayBg: 'bg-emerald-50/50', border: 'border-emerald-500/10' },
                                                    orange: { bg: 'from-orange-600/10', text: 'text-orange-400/80', dayText: 'text-orange-500', dayBg: 'bg-orange-50/50', border: 'border-orange-500/10' },
                                                    fuchsia: { bg: 'from-fuchsia-600/10', text: 'text-fuchsia-400/80', dayText: 'text-fuchsia-500', dayBg: 'bg-fuchsia-50/50', border: 'border-fuchsia-500/10' }
                                                };
                                                const c = colors[item.color];

                                                return (
                                                    <motion.button
                                                        key={item.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.04 }}
                                                        onClick={() => onChangeTab(item.id as any)}
                                                        className={`
                                                            group/hub p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center
                                                            ${timeOfDay === 'night' 
                                                                ? `bg-slate-900/60 ${c.border} hover:bg-white/5 active:scale-95` 
                                                                : `${c.dayBg} border-white shadow-sm hover:shadow-md active:scale-95`
                                                            }
                                                        `}
                                                    >
                                                        {/* Icon Container */}
                                                        <div className={`
                                                            p-2 rounded-xl mb-1.5 transition-all duration-500 group-hover/hub:scale-105 group-hover/hub:rotate-3
                                                            ${timeOfDay === 'night' ? 'bg-black/30' : 'bg-white/80 shadow-inner'}
                                                        `}>
                                                            <Icon size={18} className={timeOfDay === 'night' ? c.text : c.dayText} />
                                                        </div>
                                                        
                                                        <div className="flex flex-col">
                                                            <span className={`text-[11px] font-black tracking-[0.1em] uppercase leading-none mb-0.5 ${timeOfDay === 'night' ? 'text-white/90' : 'text-slate-800'}`}>
                                                                {item.label}
                                                            </span>
                                                            <span className={`text-[11px] font-bold uppercase tracking-widest opacity-40 ${timeOfDay === 'night' ? 'text-white' : 'text-slate-900'}`}>
                                                                {item.desc}
                                                            </span>
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                        <div className={`pb-3 px-5 flex items-center justify-center gap-2 ${timeOfDay === 'night' ? 'text-indigo-400/20' : 'text-slate-200'}`}>
                                            <div className="h-[1px] flex-1 bg-current opacity-20"></div>
                                            <span className="text-[6px] font-black uppercase tracking-[0.2em]">Remote Link Active</span>
                                            <div className="h-[1px] flex-1 bg-current opacity-20"></div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* Stats / Style Tabs */}
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl mx-1">
                        <button 
                            onClick={() => setProfileTab('stats')}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${profileTab === 'stats' ? 'bg-white dark:bg-slate-700 shadow-md text-gray-800 dark:text-white' : 'text-gray-400'}`}
                        >
                            <Zap size={14} /> Core Stats
                        </button>
                        <button 
                            onClick={() => setProfileTab('style')}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${profileTab === 'style' ? 'bg-white dark:bg-slate-700 shadow-md text-gray-800 dark:text-white' : 'text-gray-400'}`}
                        >
                            <Shirt size={14} /> Change Style
                        </button>
                    </div>

                    {/* Main Content Area */}
                    {profileTab === 'stats' ? (
                        <>
                            <div className="px-1">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Attributes</h3>
                                    {gameState.stats.points > 0 && <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full animate-pulse shadow-sm flex items-center gap-1"><Plus size={10} strokeWidth={4} /> {gameState.stats.points} UPGRADE</span>}
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3">
                                    <StatCard 
                                        label="Vitality" 
                                        description="เพิ่มขีดจำกัดพลังงานสูงสุด (Max Energy) ของคุณ"
                                        value={gameState.stats.vit} 
                                        buffValue={vitBuff} 
                                        styleValue={vitStyle}
                                        icon={<Zap size={14} strokeWidth={3} fill="currentColor" />} 
                                        colorClass="text-red-500" 
                                        bgClass="bg-red-50/50 border-red-100 dark:bg-slate-900/50 dark:border-white/5" 
                                        canUpgrade={gameState.stats.points > 0} 
                                        onUpgrade={(e) => { e.stopPropagation(); onStatUpgrade('vit'); }} 
                                        onClick={() => setInspectedStat('vit')}
                                    />
                                    <StatCard 
                                        label="Intellect" 
                                        description="เพิ่มจำนวนเงิน (Gold) ที่ได้รับจากการทำงาน"
                                        value={gameState.stats.int} 
                                        buffValue={intBuff} 
                                        styleValue={intStyle}
                                        icon={<Brain size={14} strokeWidth={3} fill="currentColor" />} 
                                        colorClass="text-blue-500" 
                                        bgClass="bg-blue-50/50 border-blue-100 dark:bg-slate-900/50 dark:border-white/5"
                                        canUpgrade={gameState.stats.points > 0} 
                                        onUpgrade={(e) => { e.stopPropagation(); onStatUpgrade('int'); }} 
                                        onClick={() => setInspectedStat('int')}
                                    />
                                    <StatCard 
                                        label="Charisma" 
                                        description="เพิ่มแต้มความรักที่ได้รับจากการพูดคุยและปฏิสัมพันธ์"
                                        value={gameState.stats.cha} 
                                        buffValue={chaBuff} 
                                        styleValue={chaStyle}
                                        icon={<Sparkles size={14} strokeWidth={3} fill="currentColor" />} 
                                        colorClass="text-pink-400" 
                                        bgClass="bg-pink-50/50 border-pink-100 dark:bg-slate-900/50 dark:border-white/5"
                                        canUpgrade={gameState.stats.points > 0} 
                                        onUpgrade={(e) => { e.stopPropagation(); onStatUpgrade('cha'); }} 
                                        onClick={() => setInspectedStat('cha')}
                                    />
                                    <StatCard 
                                        label="Fortune" 
                                        description="เพิ่มโอกาสสำเร็จระดับ Critical (ได้รับรางวัล x2)"
                                        value={gameState.stats.luck} 
                                        buffValue={luckBuff} 
                                        styleValue={luckStyle}
                                        icon={<Clover size={14} strokeWidth={3} fill="currentColor" />} 
                                        colorClass="text-yellow-500" 
                                        bgClass="bg-yellow-50/50 border-yellow-100 dark:bg-slate-900/50 dark:border-white/5"
                                        canUpgrade={gameState.stats.points > 0} 
                                        onUpgrade={(e) => { e.stopPropagation(); onStatUpgrade('luck'); }} 
                                        onClick={() => setInspectedStat('luck')}
                                    />
                                </div>
                            </div>

                            <div className="px-1">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Skill Tree</h3>
                                <div className="space-y-3">
                                    {SKILL_TREE.map(skill => {
                                        const isUnlocked = (gameState.unlockedSkills || []).includes(skill.id);
                                        return (
                                            <div key={skill.id} className={`p-4 rounded-2xl border-2 flex items-center gap-4 relative overflow-hidden ${isUnlocked ? 'bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-900/30 shadow-sm' : 'bg-gray-50 dark:bg-slate-900 border-dashed border-gray-200 dark:border-slate-700 opacity-70'}`}>
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${isUnlocked ? 'bg-indigo-100 text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' : 'bg-gray-200 text-gray-400 dark:bg-slate-800 dark:text-slate-600'}`}>
                                                    {isUnlocked ? <CheckCircle2 size={24} /> : <Lock size={20} />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className={`font-bold ${isUnlocked ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-slate-500'}`}>{skill.name}</h4>
                                                    <p className="text-xs text-gray-400 dark:text-slate-400 leading-snug">{skill.description}</p>
                                                    {!isUnlocked && <div className="mt-2 text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-slate-800 px-2 py-1 rounded w-fit border border-orange-100 dark:border-slate-700">Req: {skill.unlockCondition}</div>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        // STYLE MANAGER TAB
                        renderStyleList()
                    )}
                </div>
            </div>
        </div>
    );
};


import React, { useState, useEffect } from 'react';
import { CharacterId, RelationshipTier, GameState, Mood, Memory, DailyChatLog } from '../../types';
import { CHARACTER_DATA, TIER_THRESHOLDS, SECRET_REGISTRY } from '../../constants';
import { getThemeData } from '../../constants/themes'; // Import Theme Helper
import { getCharacterImageUrl } from '../../services/firebase';
import { X, Smartphone, Image as ImageIcon, Lock, Heart, AlertCircle, Sparkles, ShieldCheck, Crown, Info, User, Briefcase, Calendar, BookOpen, Fingerprint, Mars, Venus, Clock, Moon, Target, Users, Gem, MessageCircle, Star, Brain, ChevronRight, ChevronDown, MessageSquare } from 'lucide-react';
import { getTierColor, getTierInfo } from '../../utils/relationshipLogic';
import { TransitionImage } from '../ui/TransitionImage'; // NEW IMPORT

interface CharacterDetailViewProps {
    id: CharacterId;
    gameState: GameState;
    onClose: () => void;
    onImageClick?: (url: string) => void;
    onSocialChat?: (id: CharacterId) => void;
}

export const CharacterDetailView: React.FC<CharacterDetailViewProps> = ({ id, gameState, onClose, onImageClick, onSocialChat }) => {
    const data = CHARACTER_DATA[id];
    const loveScore = gameState.loveScores[id] || 0;
    const tier = gameState.relationshipTiers[id] || RelationshipTier.STRANGER;
    const mood = gameState.currentMoods[id];
    
    // Get Current Theme
    const currentThemeId = gameState.dailyThemes?.[id];
    const currentTheme = currentThemeId ? getThemeData(id, currentThemeId) : null;
    // [MARCUS FIX]: Check if Rare Vibe is Active
    const isRareVibe = gameState.activeRareVibes?.[id] || false;

    const { nextThreshold, isLocked, lockMessage } = getTierInfo(tier, loveScore);
    
    // Calculate progress
    let prevThreshold = 0;
    if (tier === RelationshipTier.ACQUAINTANCE) prevThreshold = TIER_THRESHOLDS[RelationshipTier.ACQUAINTANCE];
    if (tier === RelationshipTier.FRIEND) prevThreshold = TIER_THRESHOLDS[RelationshipTier.FRIEND];
    if (tier === RelationshipTier.FLIRTING || tier === RelationshipTier.BEST_FRIEND) prevThreshold = TIER_THRESHOLDS[RelationshipTier.FLIRTING];
    if (tier === RelationshipTier.PARTNER || tier === RelationshipTier.SOULMATE || tier === RelationshipTier.SOUL_SIBLING) prevThreshold = TIER_THRESHOLDS[RelationshipTier.PARTNER];
    if (tier === RelationshipTier.SOULMATE) prevThreshold = TIER_THRESHOLDS[RelationshipTier.SOULMATE];
    if (tier === RelationshipTier.ETERNAL) prevThreshold = TIER_THRESHOLDS[RelationshipTier.ETERNAL];

    const range = nextThreshold - prevThreshold;
    const currentInTier = loveScore - prevThreshold;
    const progressPercent = Math.max(0, Math.min(100, (currentInTier / range) * 100));

    const [imgUrl, setImgUrl] = useState<string>('');
    const [secretsList, setSecretsList] = useState<{path: string, url: string, isUnlocked: boolean}[]>([]);
    const [showTierInfo, setShowTierInfo] = useState(false);
    const [selectedMemoryFilter, setSelectedMemoryFilter] = useState<'all' | 'core' | 'active' | 'sensory'>('all');
    const [selectedDailyLog, setSelectedDailyLog] = useState<DailyChatLog | null>(null);
    const [isMemoryAlbumOpen, setIsMemoryAlbumOpen] = useState(false);
    const [isDailyLogsOpen, setIsDailyLogsOpen] = useState(false);

    const charMemories: Memory[] = gameState.memories[id] || [];
    const filteredMemories = charMemories.filter(m => selectedMemoryFilter === 'all' ? true : m.tier === selectedMemoryFilter);
    const dailyLogs: DailyChatLog[] = gameState.dailyChatArchives?.[id] || [];

    const isEternal = tier === RelationshipTier.ETERNAL;

    useEffect(() => {
        const load = async () => {
             // Load Main Avatar
             const moodPaths = (data.moods && data.moods[mood]) ? data.moods[mood] : data.moods[Mood.NEUTRAL];
             const path = Array.isArray(moodPaths) ? moodPaths[0] : moodPaths; 
             
             if (path && typeof path === 'string') {
                 const url = path.startsWith('http') ? path : await getCharacterImageUrl(path);
                 if (url) setImgUrl(url);
             }

             // [MARCUS FIX]: Load ALL Secrets from Registry
             const registrySecrets = SECRET_REGISTRY[id] || [];
             
             const loadedSecrets = await Promise.all(registrySecrets.map(async (secret) => {
                 const secretPath = secret.path;
                 const isUnlocked = gameState.unlockedSecrets.includes(secretPath) || gameState.unlockedSecrets.includes(secret.id);
                 let url = '';
                 if (isUnlocked && secretPath) {
                     const loadedUrl = await getCharacterImageUrl(secretPath);
                     if (loadedUrl) url = loadedUrl;
                 }
                 return { path: secretPath, url, isUnlocked };
             }));
             setSecretsList(loadedSecrets);
        };
        load();
    }, [id, mood, data, gameState.unlockedSecrets]);

    // Sub-component for Tree Nodes
    const TierNode = ({ title, score, icon, isActive, isPast, colorClass, align = 'center', reqItem }: { title: string, score: number, icon: React.ReactNode, isActive: boolean, isPast: boolean, colorClass: string, align?: 'left' | 'center' | 'right', reqItem?: string }) => (
        <div className={`flex flex-col items-center relative z-10 ${isActive ? 'scale-110' : 'opacity-70'} transition-all`}>
            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center shadow-lg transition-colors bg-white dark:bg-slate-800 ${isActive ? colorClass : isPast ? 'border-green-500 text-green-500' : 'border-gray-200 dark:border-slate-700 text-gray-300'}`}>
                {isPast ? <ShieldCheck size={20} strokeWidth={3} /> : icon}
            </div>
            <div className={`mt-2 text-center ${align === 'left' ? '-ml-8' : align === 'right' ? '-mr-8' : ''}`}>
                <div className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-slate-800 dark:text-white' : 'text-gray-400'}`}>{title}</div>
                <div className="text-[9px] font-bold text-gray-500 bg-gray-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded w-fit mx-auto mt-0.5 border border-gray-200 dark:border-slate-600">{score.toLocaleString()} pts</div>
                {reqItem && isActive && (
                    <div className="text-[8px] font-bold text-amber-500 mt-1 animate-pulse">Req: {reqItem}</div>
                )}
            </div>
        </div>
    );

    return (
      <div className="absolute inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col md:flex-row animate-in slide-in-from-bottom-5 duration-300 overflow-hidden">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white p-2 rounded-full transition-all">
          <X size={24} />
        </button>

        {/* IMAGE SECTION */}
        <div 
            className="h-[50%] md:h-full md:w-[45%] relative bg-gray-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden cursor-pointer group" 
            onClick={() => imgUrl && onImageClick?.(imgUrl)}
        >
          {imgUrl ? (
              <TransitionImage 
                src={imgUrl} 
                alt={data.name} 
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
              />
          ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-slate-800 animate-pulse" />
          )}
          
          <div className={`absolute inset-0 z-20 bg-gradient-to-t via-transparent to-transparent opacity-90 pointer-events-none ${isEternal ? 'from-slate-900' : 'from-white dark:from-slate-900'}`}></div>
          
          {/* ETERNAL AURA */}
          {isEternal && <div className="absolute inset-0 z-20 bg-gradient-to-tr from-purple-500/20 via-pink-500/20 to-transparent mix-blend-overlay animate-pulse pointer-events-none"></div>}

          <div className="absolute bottom-6 left-0 right-0 z-30 p-6 md:p-8 pt-12 pointer-events-none flex items-end">
             <h2 className={`text-4xl md:text-5xl font-extrabold drop-shadow-sm flex items-center gap-2 ${isEternal ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 animate-pulse' : data.color}`}>
                {data.name}
                {isEternal && <Crown size={32} className="text-yellow-400 fill-yellow-200 animate-bounce-soft" />}
             </h2>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-900 -mt-6 md:mt-0 rounded-t-[2rem] md:rounded-none relative z-10 shadow-up md:shadow-none border-t md:border-t-0 md:border-l border-white dark:border-slate-800 custom-scrollbar">
            
            {/* PROFILE CARD */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 bg-gradient-to-bl from-slate-200/50 dark:from-slate-700/30 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 shadow-sm">
                        {data.gender === 'male' ? <Mars size={12} className="text-blue-500" /> : <Venus size={12} className="text-pink-500" />} 
                        {data.gender.charAt(0).toUpperCase() + data.gender.slice(1)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 shadow-sm">
                        <Calendar size={12} /> Age {data.age}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 shadow-sm">
                        <Briefcase size={12} /> {data.description}
                    </span>
                </div>

                <div className="space-y-3">
                    {/* --- DAILY THEME DISPLAY --- */}
                    {/* [MARCUS FIX]: Dynamic styling for Rare Vibe */}
                    <div 
                        className={`
                            p-3 rounded-xl border animate-in slide-in-from-left duration-500 relative overflow-hidden
                            ${isRareVibe 
                                ? 'bg-gradient-to-r from-yellow-900 via-slate-900 to-black border-yellow-500 shadow-lg shadow-yellow-500/20' 
                                : 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-indigo-100 dark:border-indigo-800'}
                        `}
                    >
                        {isRareVibe && <div className="absolute inset-0 bg-yellow-400/10 animate-pulse"></div>}
                        
                        <div className="flex items-center gap-2 mb-1 relative z-10">
                            <span className="text-lg animate-bounce-soft">{currentTheme ? currentTheme.icon : '✨'}</span>
                            <div className={`text-[10px] font-black uppercase tracking-widest ${isRareVibe ? 'text-yellow-400 drop-shadow-md' : 'text-indigo-500 dark:text-indigo-300'}`}>
                                {isRareVibe ? "MYSTERIOUS VIBE ACTIVE" : "Today's Vibe"}
                            </div>
                        </div>
                        <div className={`font-bold text-sm relative z-10 ${isRareVibe ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                            {currentTheme ? currentTheme.name : "Normal Routine"}
                        </div>
                        <p className={`text-[10px] italic mt-0.5 relative z-10 ${isRareVibe ? 'text-yellow-100/80' : 'text-slate-500 dark:text-slate-400'}`}>
                            "{currentTheme ? currentTheme.description : "Just living life as usual."}"
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                            <BookOpen size={12} /> Biography
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
                            "{data.lore}"
                        </p>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                            <Fingerprint size={12} /> Personality
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                            {data.deepPersona}
                        </p>
                    </div>

                    {/* SCHEDULE SECTION */}
                    <div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                            <Clock size={12} /> Daily Routine
                        </div>
                        <div className="flex flex-wrap gap-2 mb-1">
                            <span className="text-[10px] font-bold bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded border border-orange-100 dark:border-orange-900/30 flex items-center gap-1">
                                <Briefcase size={10} /> {String(data.schedule.workHours[0]).padStart(2, '0')}:00 - {String(data.schedule.workHours[1]).padStart(2, '0')}:00
                            </span>
                            <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-1">
                                <Moon size={10} /> {String(data.schedule.sleepHours[0]).padStart(2, '0')}:00 - {String(data.schedule.sleepHours[1]).padStart(2, '0')}:00
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                            * {data.schedule.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Social Chat Button */}
            {id === 'erin' && (
                <button 
                    onClick={() => onSocialChat?.('erin')}
                    className="w-full bg-fuchsia-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-200 dark:shadow-none hover:bg-fuchsia-700 transition-colors animate-pulse"
                >
                    <Smartphone size={22} /> Start Social Chat
                </button>
            )}

            {/* Secret Album Section */}
            <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ImageIcon size={14} /> Secret Gallery
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
                    {secretsList.map((secret, idx) => (
                        <div 
                            key={idx}
                            className={`aspect-[4/5] rounded-2xl overflow-hidden relative shadow-sm transition-all ${secret.isUnlocked ? 'border-2 border-pink-200 cursor-pointer hover:scale-105 hover:shadow-md' : 'bg-gray-100 dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-slate-700 opacity-70'}`}
                            onClick={() => secret.isUnlocked && secret.url && onImageClick?.(secret.url)}
                        >
                            {secret.isUnlocked && secret.url ? (
                                <>
                                    <TransitionImage src={secret.url} alt="Secret" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-1 right-1 bg-black/50 backdrop-blur px-1.5 rounded text-[8px] font-bold text-white uppercase">
                                        #{idx + 1}
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-slate-600">
                                    <Lock size={20} />
                                    <span className="text-[9px] font-bold mt-1 text-center px-1">Locked</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Relationship Status Block */}
            <div className={`p-5 rounded-2xl border shadow-sm flex items-center gap-4 relative overflow-hidden ${isEternal ? 'bg-slate-900 border-purple-500/50' : 'bg-gradient-to-br from-pink-50 to-white dark:from-slate-800 dark:to-slate-800 border-pink-100 dark:border-slate-700'}`}>
              {isEternal && <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse"></div>}
              
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md relative z-10 ${loveScore >= 2000 ? 'bg-red-500' : 'bg-gray-400 dark:bg-slate-600'}`}>
                 <Heart size={28} fill="currentColor" className={isEternal ? "animate-heartbeat" : ""} />
              </div>
              <div className="relative z-10">
                 <div className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wide">Status</div>
                 <div className={`text-2xl font-extrabold uppercase ${getTierColor(tier)}`}>{tier.replace('_', ' ')}</div>
              </div>
            </div>

            {/* Progress Bar & Stats */}
            <div className={`p-5 rounded-2xl border ${isLocked ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700'}`}>
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Affection Score</span>
                            <button onClick={() => setShowTierInfo(true)} className="text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors active:scale-95" title="Tier Info">
                                <Info size={14} />
                            </button>
                        </div>
                        <div className={`text-2xl font-extrabold ${isEternal ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' : data.color}`}>{Math.floor(loveScore).toLocaleString()} <span className="text-sm text-gray-400 font-medium">/ {isEternal ? '∞' : nextThreshold.toLocaleString()}</span></div>
                    </div>
                    {isLocked && (
                        <div className="flex items-center gap-1 text-red-500 font-bold text-xs bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-lg animate-pulse">
                            <Lock size={12} /> MAXED
                        </div>
                    )}
                </div>

                <div className="h-4 w-full bg-white dark:bg-slate-900 rounded-full overflow-hidden shadow-inner relative border border-gray-200 dark:border-slate-700 mb-3">
                    <div 
                        className={`h-full transition-all duration-1000 ease-out rounded-full relative ${
                            isLocked ? 'bg-red-400' : 
                            isEternal ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-move' :
                            id === 'miguel' ? 'bg-gradient-to-r from-pink-400 to-rose-400' : 
                            id === 'fia' ? 'bg-gradient-to-r from-orange-400 to-red-400' : 
                            id === 'erin' ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500' : 
                            id === 'marcus' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 
                            id === 'lucas' ? 'bg-gradient-to-r from-violet-500 to-purple-500' : 
                            id === 'bam' ? 'bg-gradient-to-r from-rose-400 to-orange-400' : 
                            'bg-gradient-to-r from-teal-400 to-emerald-400'
                        }`} 
                        style={{ width: `${isEternal ? 100 : progressPercent}%` }}
                    >
                         <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>

                {isLocked ? (
                    <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-xs font-bold bg-white dark:bg-slate-900 p-3 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm">
                       <AlertCircle size={16} className="shrink-0 mt-0.5" />
                       <div>
                          <div className="uppercase tracking-wide mb-0.5">RELATIONSHIP LOCKED</div>
                          {lockMessage}
                       </div>
                    </div>
                ) : (
                    <div className="text-xs font-bold text-center text-indigo-500 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 py-2 px-3 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-center gap-2">
                        <Sparkles size={14} /> Next Tier: {Math.max(0, Math.floor(nextThreshold - loveScore)).toLocaleString()} pts needed
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col gap-2">
                 <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">
                   <ShieldCheck size={14} /> Golden Rule
                 </div>
                 <p className="text-gray-700 dark:text-gray-300 font-medium italic text-sm leading-relaxed">
                   {isEternal ? "รักนิรันดร์... ความผูกพันที่เหนือกาลเวลาและคำบรรยาย" :
                    tier === RelationshipTier.STRANGER || tier === RelationshipTier.ACQUAINTANCE ? "รักษาระยะห่างแบบคนรู้จัก ห้ามจีบเด็ดขาด" : 
                    tier === RelationshipTier.FRIEND ? "มองคุณเป็นเพื่อน เล่นมุกได้ แต่อย่าล้ำเส้น" :
                    tier === RelationshipTier.FLIRTING ? "เริ่มมีใจให้คุณแล้ว... เดินหน้าจีบได้เลย!" :
                    "ให้ความสำคัญกับคุณเป็นอันดับหนึ่ง เชื่อใจคุณที่สุด"}
                 </p>
            </div>

            {/* CHARACTER MEMORY ALBUM ( สิ่งที่ตัวละครจดจำคุณ ) - COLLAPSIBLE ACCORDION */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/80 shadow-sm overflow-hidden transition-all">
                <button
                    onClick={() => setIsMemoryAlbumOpen(!isMemoryAlbumOpen)}
                    className="w-full p-4 flex items-center justify-between bg-white/50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <Brain size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                สิ่งที่ {data.name} จดจำเกี่ยวกับคุณ
                                <span className="text-[10px] font-black bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full">
                                    {charMemories.length} รายการ
                                </span>
                            </h3>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                ความทรงจำ คำสัญญา และรายละเอียดที่ {data.name} จำได้เกี่ยวกับคุณ
                            </p>
                        </div>
                    </div>
                    <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 transition-transform duration-200 ${isMemoryAlbumOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} />
                    </div>
                </button>

                {isMemoryAlbumOpen && (
                    <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-700/50 space-y-3 animate-in fade-in duration-200">
                        {/* Filter Pills */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[10px] font-bold">
                            <button
                                onClick={() => setSelectedMemoryFilter('all')}
                                className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap ${
                                    selectedMemoryFilter === 'all'
                                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                ทั้งหมด ({charMemories.length})
                            </button>
                            <button
                                onClick={() => setSelectedMemoryFilter('core')}
                                className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1 ${
                                    selectedMemoryFilter === 'core'
                                        ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                                        : 'bg-white dark:bg-slate-800 text-rose-500 border-rose-200 dark:border-rose-900/30'
                                }`}
                            >
                                🌟 Core ({charMemories.filter(m => m.tier === 'core').length})
                            </button>
                            <button
                                onClick={() => setSelectedMemoryFilter('active')}
                                className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1 ${
                                    selectedMemoryFilter === 'active'
                                        ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                                        : 'bg-white dark:bg-slate-800 text-cyan-600 border-cyan-200 dark:border-cyan-900/30'
                                }`}
                            >
                                ⚡ Active ({charMemories.filter(m => m.tier === 'active').length})
                            </button>
                            <button
                                onClick={() => setSelectedMemoryFilter('sensory')}
                                className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1 ${
                                    selectedMemoryFilter === 'sensory'
                                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                        : 'bg-white dark:bg-slate-800 text-amber-600 border-amber-200 dark:border-amber-900/30'
                                }`}
                            >
                                💭 Sensory ({charMemories.filter(m => m.tier === 'sensory').length})
                            </button>
                        </div>

                        {/* Memory Cards Grid */}
                        {filteredMemories.length === 0 ? (
                            <div className="text-center py-6 px-4 bg-white dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
                                <Brain size={28} className="mx-auto mb-2 opacity-40 text-purple-400" />
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">ยังไม่มีความทรงจำในหมวดหมู่นี้</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">พูดคุยหรือทำกิจกรรมร่วมกันเพื่อสร้างความทรงจำใหม่!</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                                {filteredMemories.map(m => (
                                    <div
                                        key={m.id}
                                        className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                                m.tier === 'core'
                                                    ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 border-rose-200 dark:border-rose-800/50'
                                                    : m.tier === 'active'
                                                    ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 border-cyan-200 dark:border-cyan-800/50'
                                                    : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 border-amber-200 dark:border-amber-800/50'
                                            }`}>
                                                {m.tier === 'core' ? '🌟 Core Memory (คำสัญญาหลัก)' : m.tier === 'active' ? '⚡ Active Memory (เรื่องราวร่วมกัน)' : '💭 Sensory Memory (รายละเอียดอารมณ์)'}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400">
                                                ระดับความสำคัญ: {m.importance}/10
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-snug">
                                            "{m.text}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* DAILY CONVERSATION ARCHIVES (30 DAYS HISTORY) - COLLAPSIBLE ACCORDION */}
            <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-slate-800/80 dark:to-slate-800/40 rounded-2xl border border-indigo-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all">
                <button
                    onClick={() => setIsDailyLogsOpen(!isDailyLogsOpen)}
                    className="w-full p-4 flex items-center justify-between bg-white/40 dark:bg-slate-800/60 hover:bg-indigo-50/80 dark:hover:bg-slate-700/50 transition-colors text-left"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            <BookOpen size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                📜 ความทรงจำย้อนหลัง (Daily Logs)
                                <span className="text-[10px] font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                                    ย้อนหลัง 30 วัน
                                </span>
                            </h3>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                อ่านย้อนหลังข้อความแชตสำคัญที่คุณและ {data.name} คุยกันในแต่ละวัน
                            </p>
                        </div>
                    </div>
                    <div className={`p-1.5 rounded-lg bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 transition-transform duration-200 ${isDailyLogsOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} />
                    </div>
                </button>

                {isDailyLogsOpen && (
                    <div className="p-4 pt-2 border-t border-indigo-100 dark:border-slate-700/50 space-y-3 animate-in fade-in duration-200">
                        {dailyLogs.length === 0 ? (
                            <div className="text-center py-6 px-4 bg-white dark:bg-slate-900/50 rounded-xl border border-dashed border-indigo-200 dark:border-slate-700 text-slate-400">
                                <Calendar size={28} className="mx-auto mb-2 opacity-40 text-indigo-400" />
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">ยังไม่มีประวัติแชตย้อนหลังที่ถูกจัดเก็บ</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">ระบบจะบันทึกบทสนทนาประจำวันลงคลังความทรงจำทุกเช้าเมื่อผ่านพ้นวันใหม่</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                                {dailyLogs.map(log => (
                                    <div
                                        key={log.id}
                                        onClick={() => setSelectedDailyLog(log)}
                                        className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-slate-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer flex items-center justify-between group"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                                                    <Calendar size={12} className="text-indigo-500" />
                                                    {log.date}
                                                </span>
                                                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                                                    {log.totalMessages} ข้อความ
                                                </span>
                                            </div>
                                            {log.summary && (
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic line-clamp-1">
                                                    "{log.summary}"
                                                </p>
                                            )}
                                        </div>
                                        <div className="p-1.5 bg-indigo-50 dark:bg-slate-800 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <ChevronRight size={14} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* --- RELATIONSHIP TREE MODAL --- */}
        {showTierInfo && (
            <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowTierInfo(false)}>
                <div 
                    className="bg-white dark:bg-slate-900 w-full max-w-sm max-h-[85vh] rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-start mb-6 shrink-0 z-10 relative">
                        <div>
                            <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none">Journey Map</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Relationship Path</p>
                        </div>
                        <button onClick={() => setShowTierInfo(false)} className="bg-gray-100 dark:bg-slate-800 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>
                    
                    {/* SCROLLABLE TREE AREA */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative px-2 pb-4">
                        
                        {/* Connecting Lines (SVG Layer) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-20" style={{ minHeight: '600px' }}>
                            {/* Main Trunk */}
                            <line x1="50%" y1="40" x2="50%" y2="220" stroke="currentColor" strokeWidth="4" className="text-gray-400" strokeDasharray="8 4" />
                            
                            {/* Branching Fork */}
                            <path d="M 50% 220 C 50% 260, 25% 260, 25% 300" fill="none" stroke="#f472b6" strokeWidth="4" />
                            <path d="M 50% 220 C 50% 260, 75% 260, 75% 300" fill="none" stroke="#2dd4bf" strokeWidth="4" />

                            {/* Left Path (Romance) */}
                            <line x1="25%" y1="300" x2="25%" y2="500" stroke="#f472b6" strokeWidth="4" />

                            {/* Right Path (Platonic) */}
                            <line x1="75%" y1="300" x2="75%" y2="420" stroke="#2dd4bf" strokeWidth="4" />

                            {/* Convergence to Eternal */}
                            <path d="M 25% 500 C 25% 550, 50% 540, 50% 580" fill="none" stroke="#a78bfa" strokeWidth="4" opacity="0.5" />
                            <path d="M 75% 420 C 75% 500, 50% 540, 50% 580" fill="none" stroke="#a78bfa" strokeWidth="4" opacity="0.5" />
                        </svg>

                        <div className="flex flex-col items-center gap-8 relative z-10" style={{ minHeight: '600px' }}>
                            {/* ROOT: Stranger */}
                            <TierNode 
                                title="Stranger" 
                                score={0} 
                                icon={<User size={20} />} 
                                isActive={tier === RelationshipTier.STRANGER} 
                                isPast={loveScore > 0}
                                colorClass="border-gray-400 text-gray-600"
                            />

                            {/* Node: Acquaintance */}
                            <TierNode 
                                title="Acquaintance" 
                                score={200} 
                                icon={<MessageCircle size={20} />} 
                                isActive={tier === RelationshipTier.ACQUAINTANCE} 
                                isPast={loveScore >= 200}
                                colorClass="border-blue-400 text-blue-600"
                            />

                            {/* Node: Friend (Fork Point) */}
                            <TierNode 
                                title="Friend" 
                                score={500} 
                                icon={<Users size={20} />} 
                                isActive={tier === RelationshipTier.FRIEND} 
                                isPast={loveScore >= 500}
                                colorClass="border-green-500 text-green-600"
                            />

                            {/* BRANCHING SECTION */}
                            <div className="w-full grid grid-cols-2 mt-4 gap-4">
                                {/* LEFT: ROMANCE */}
                                <div className="flex flex-col items-center gap-10">
                                    <div className="text-[10px] font-black text-pink-500 bg-pink-50 dark:bg-pink-900/30 px-2 py-0.5 rounded-full border border-pink-200">ROMANCE</div>
                                    
                                    <TierNode 
                                        title="Flirting" 
                                        score={2000} 
                                        icon={<Heart size={20} />} 
                                        isActive={tier === RelationshipTier.FLIRTING} 
                                        isPast={loveScore >= 2000 && ![RelationshipTier.BEST_FRIEND, RelationshipTier.SOUL_SIBLING].includes(tier)}
                                        colorClass="border-pink-400 text-pink-500"
                                        reqItem="Gift"
                                    />

                                    <TierNode 
                                        title="Partner" 
                                        score={5000} 
                                        icon={<Heart size={20} fill="currentColor" />} 
                                        isActive={tier === RelationshipTier.PARTNER} 
                                        isPast={loveScore >= 5000 && ![RelationshipTier.BEST_FRIEND, RelationshipTier.SOUL_SIBLING].includes(tier)}
                                        colorClass="border-red-500 text-red-600"
                                        reqItem="Ring"
                                    />
                                    
                                    <TierNode 
                                        title="Soulmate" 
                                        score={10000} 
                                        icon={<Sparkles size={20} />} 
                                        isActive={tier === RelationshipTier.SOULMATE} 
                                        isPast={loveScore >= 10000 && ![RelationshipTier.BEST_FRIEND, RelationshipTier.SOUL_SIBLING].includes(tier)}
                                        colorClass="border-purple-500 text-purple-600"
                                    />
                                </div>

                                {/* RIGHT: PLATONIC */}
                                <div className="flex flex-col items-center gap-10">
                                    <div className="text-[10px] font-black text-teal-500 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-full border border-teal-200">PLATONIC</div>
                                    
                                    <TierNode 
                                        title="Best Friend" 
                                        score={2000} 
                                        icon={<Star size={20} />} 
                                        isActive={tier === RelationshipTier.BEST_FRIEND} 
                                        isPast={loveScore >= 2000 && [RelationshipTier.BEST_FRIEND, RelationshipTier.SOUL_SIBLING].includes(tier)}
                                        colorClass="border-cyan-400 text-cyan-600"
                                        reqItem="Gift"
                                    />

                                    <TierNode 
                                        title="Soul Sibling" 
                                        score={5000} 
                                        icon={<Users size={20} fill="currentColor" />} 
                                        isActive={tier === RelationshipTier.SOUL_SIBLING} 
                                        isPast={loveScore >= 5000 && [RelationshipTier.SOUL_SIBLING].includes(tier)}
                                        colorClass="border-teal-500 text-teal-600"
                                        reqItem="Jacket"
                                    />
                                </div>
                            </div>

                            {/* GOD TIER: ETERNAL (Merged) */}
                            <div className="mt-8 mb-4">
                                <TierNode 
                                    title="Eternal Bond" 
                                    score={50000} 
                                    icon={<Gem size={24} className="animate-pulse" />} 
                                    isActive={tier === RelationshipTier.ETERNAL} 
                                    isPast={false}
                                    colorClass="border-indigo-500 text-indigo-600 bg-indigo-50"
                                    reqItem="Pendant"
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        )}
        {/* DAILY LOG DETAIL MODAL */}
        {selectedDailyLog && (
            <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedDailyLog(null)}>
                <div 
                    className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[85vh] rounded-[2rem] p-6 shadow-2xl relative overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                        <div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-indigo-500" />
                                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
                                    ประวัติแชตวันที่ {selectedDailyLog.date}
                                </h3>
                            </div>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                                {data.name} & คุณ • รวม {selectedDailyLog.totalMessages} ข้อความ
                            </p>
                        </div>
                        <button 
                            onClick={() => setSelectedDailyLog(null)}
                            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Summary if present */}
                    {selectedDailyLog.summary && (
                        <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shrink-0">
                            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-wider mb-0.5">
                                📝 สรุปความทรงจำประจำวัน
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-200 italic">
                                "{selectedDailyLog.summary}"
                            </p>
                        </div>
                    )}

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {selectedDailyLog.messages.map((msg, i) => {
                            const isUser = msg.sender === 'user' || (msg.sender as string) === 'player';
                            return (
                                <div 
                                    key={msg.id || i}
                                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                                >
                                    <div className="text-[9px] font-bold text-slate-400 mb-0.5 px-1">
                                        {isUser ? 'คุณ' : CHARACTER_DATA[msg.sender as CharacterId]?.name || msg.sender}
                                    </div>
                                    <div className={`p-3 rounded-2xl max-w-[85%] text-xs font-medium leading-relaxed ${
                                        isUser 
                                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-tr-none' 
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}
      </div>
    );
};

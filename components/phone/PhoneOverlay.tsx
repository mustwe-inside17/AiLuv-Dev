
import { AnimatePresence, motion } from 'motion/react';
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/gameStore';
import { X, Wifi, Battery, Signal, Camera, MessageSquare, Mail, Wallet, Settings, Cloud, Calendar as CalendarIcon, Music, Map as MapIcon, Compass, Phone, Aperture, Play, Pause, SkipForward, Crown } from 'lucide-react';
import { BASEMENT_TRACKS } from '../../constants';
import { useUIStore } from '../../store/uiStore';

const AiGramApp = lazy(() => import('./apps/AiGramApp').then(module => ({ default: module.AiGramApp })));
const MailApp = lazy(() => import('./apps/MailApp').then(module => ({ default: module.MailApp })));
const WalletApp = lazy(() => import('./apps/WalletApp').then(module => ({ default: module.WalletApp })));

// --- SUB-COMPONENTS ---
// ... (AppIcon, ClockWidget, WeatherWidget, CalendarWidget) ...

const AppIcon: React.FC<{ 
    label: string, 
    icon: React.ReactNode, 
    bgGradient: string, 
    notification?: number,
    onClick?: () => void 
}> = ({ label, icon, bgGradient, notification, onClick }) => (
    <button 
        onClick={onClick}
        aria-label={label}
        className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform group w-[68px] focus:outline-none focus:ring-2 focus:ring-pink-400/80 rounded-2xl p-1"
    >
        <div className={`w-[60px] h-[60px] rounded-[1.3rem] ${bgGradient} flex items-center justify-center text-white shadow-md relative group-hover:shadow-xl group-hover:brightness-110 transition-all border border-white/10`}>
            {icon}
            {/* [MARCUS FIX]: Ensure 0 doesn't render as text by checking > 0 */}
            {(notification || 0) > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold shadow-sm">
                    {notification}
                </div>
            )}
        </div>
        <span className="text-[11px] font-medium text-white drop-shadow-md tracking-tight leading-tight">{label}</span>
    </button>
);

const ClockWidget = () => {
    const [time, setTime] = useState(new Date());
    
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const dayName = time.toLocaleDateString('en-US', { weekday: 'long' });
    const dateNum = time.getDate();
    const month = time.toLocaleDateString('en-US', { month: 'short' });

    return (
        <div className="col-span-2 h-[110px] rounded-[1.4rem] bg-white/10 backdrop-blur-xl border border-white/20 p-3.5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <div className="text-[11px] font-bold text-white uppercase tracking-wider opacity-90">{dayName}</div>
                    <div className="bg-red-500/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm flex items-center gap-1 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> LIVE
                    </div>
                </div>
                
                <div className="flex items-end justify-between">
                    <div className="text-3xl font-extralight text-white tracking-tighter leading-none -ml-0.5">
                        {time.getHours()}:{String(time.getMinutes()).padStart(2, '0')}
                    </div>
                    <span className="text-xs font-medium text-white/90 shadow-black/20 drop-shadow-sm mb-0.5">{month} {dateNum}</span>
                </div>
            </div>
        </div>
    );
};

const WeatherWidget = () => (
    <div className="h-[110px] rounded-[1.4rem] bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] p-3 flex flex-col justify-between shadow-sm text-white relative overflow-hidden border border-blue-400/30">
        <div className="flex justify-between items-start">
             <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">BKK</span>
             </div>
             <Cloud size={16} fill="currentColor" className="text-blue-100 opacity-90" />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
            <span className="text-2xl font-light tracking-tighter">28°</span>
        </div>
        
        <div className="flex justify-between text-[11px] font-medium opacity-80">
            <span>H:32°</span>
            <span>L:26°</span>
        </div>
    </div>
);

const CalendarWidget = () => (
    <div className="h-[110px] rounded-[1.4rem] bg-white text-slate-900 p-0 flex flex-col items-center shadow-sm relative overflow-hidden border border-white/50">
        <div className="w-full bg-red-500/10 p-1 text-center border-b border-red-100">
            <div className="text-[11px] font-black text-red-500 uppercase tracking-widest">
                {new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
            </div>
        </div>
        <div className="flex-1 flex items-center justify-center -mt-1">
            <div className="text-3xl font-light tracking-tighter text-slate-800">
                {new Date().getDate()}
            </div>
        </div>
        <div className="pb-1.5 flex gap-1 opacity-20">
            <div className="w-1 h-1 rounded-full bg-slate-900"></div>
            <div className="w-1 h-1 rounded-full bg-slate-900"></div>
        </div>
    </div>
);

const DailyRewardWidget: React.FC = () => {
    const dailyLogin = useGameStore(state => state.dailyLogin);
    const todayStr = new Date().toDateString();
    const hasDailyClaim = dailyLogin?.lastClaimDate !== todayStr;
    const streak = dailyLogin?.currentDay || 1;

    return (
        <div className="w-full mb-4 bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-3 border border-purple-400/30 shadow-lg flex items-center justify-between relative overflow-hidden">
            <div className="flex items-center gap-2.5 relative z-10">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-md ${hasDailyClaim ? 'bg-gradient-to-br from-pink-500 to-purple-600 animate-pulse text-white' : 'bg-white/10 text-purple-300'}`}>
                    🎁
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-extrabold text-white tracking-tight">Daily Rewards</span>
                        {hasDailyClaim && <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>}
                    </div>
                    <span className="text-[11px] font-bold text-purple-200/90">
                        Day {streak} · 150 Diamonds
                    </span>
                </div>
            </div>

            <button
                aria-label={hasDailyClaim ? 'รับรางวัลประจำวัน' : 'รับรางวัลประจำวันแล้ว'}
                onClick={() => {
                    useUIStore.getState().setShowDailyLogin(true);
                }}
                className={`relative z-10 px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wide transition-all shadow-md active:scale-95 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                    hasDailyClaim 
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white shadow-pink-500/30 animate-bounce-soft' 
                    : 'bg-white/10 border border-white/20 text-white/60'
                }`}
            >
                {hasDailyClaim ? 'รับรางวัล' : 'รับแล้ว ✓'}
            </button>
        </div>
    );
};

// --- MAIN COMPONENT ---

interface PhoneOverlayProps {
    globalMusic?: { isPlaying: boolean, trackIndex: number, volume: number };
    onPlayGlobalMusic?: () => void;
    onPauseGlobalMusic?: () => void;
    onNextGlobalTrack?: () => void;
    userProfile?: any;
}

export const PhoneOverlay: React.FC<PhoneOverlayProps> = ({ 
    globalMusic, onPlayGlobalMusic, onPauseGlobalMusic, onNextGlobalTrack, userProfile
}) => {
    const { isPhoneOpen, togglePhone, activePhoneApp, unreadSocialPosts, mails, unlockedSkills, isVip, vipDailyClaimed } = useGameStore(useShallow(state => ({
        isPhoneOpen: state.isPhoneOpen,
        togglePhone: state.togglePhone,
        activePhoneApp: state.activePhoneApp,
        unreadSocialPosts: state.unreadSocialPosts,
        mails: state.mails,
        unlockedSkills: state.unlockedSkills,
        isVip: state.isVip,
        vipDailyClaimed: state.vipDailyClaimed
    })));
    const todayStr = new Date().toDateString();
    const isVipDailyClaimable = isVip && vipDailyClaimed !== todayStr;
    const [currentTime, setCurrentTime] = useState(new Date());
    const [renderState, setRenderState] = useState<'hidden' | 'pre-open' | 'open' | 'closing'>('hidden');
    
    // APP NAVIGATION STATE
    const [currentApp, setCurrentApp] = useState<'home' | 'aigram' | 'mail' | 'wallet'>('home'); // Added 'mail', 'wallet'

    // Handle external app switch command
    useEffect(() => {
        if (activePhoneApp) {
            setCurrentApp(activePhoneApp);
            useGameStore.setState({ activePhoneApp: null });
        }
    }, [activePhoneApp]);

    // Wallpaper URL (Clean Gradient Mesh)
    const WALLPAPER_URL = "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop"; 

    // Music Player state
    const hasSpotify = unlockedSkills?.includes('spotifi_premium');
    const currentTrack = globalMusic && BASEMENT_TRACKS[globalMusic.trackIndex] ? BASEMENT_TRACKS[globalMusic.trackIndex] : undefined;

    // Clock for status bar
    useEffect(() => {
        if (!isPhoneOpen) return;
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [isPhoneOpen]);

    // Animation Logic
    useEffect(() => {
        if (isPhoneOpen) {
            if (renderState === 'hidden' || renderState === 'closing') {
                setRenderState('pre-open');
                setTimeout(() => setRenderState('open'), 50);
            }
        } else {
            if (renderState === 'open' || renderState === 'pre-open') {
                setRenderState('closing');
                setTimeout(() => {
                    setRenderState('hidden');
                    setCurrentApp('home'); // Reset to home when closed
                }, 500); 
            }
        }
    }, [isPhoneOpen]);

    if (renderState === 'hidden') return null;

    const isVisible = renderState === 'open';

    const goHome = () => setCurrentApp('home');
    
    // Calc unread mails and unclaimed rewards
    const unreadMails = mails.filter(m => !m.isRead || (m.rewards && !m.isClaimed)).length;

    return (
        <div className="fixed inset-0 z-[600] flex items-end justify-center pointer-events-none">
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-black/30 backdrop-blur-[4px] transition-opacity duration-500 pointer-events-auto ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={togglePhone}
            ></div>

            {/* Phone Shell */}
            <div 
                className={`
                    pointer-events-auto relative w-full max-w-[390px] h-[92vh] max-h-[850px]
                    rounded-t-[3rem] border-t border-x border-white/20 
                    shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.6)]
                    transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)
                    flex flex-col overflow-hidden bg-black
                    ${isVisible ? 'translate-y-0' : 'translate-y-full'}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* --- WALLPAPER LAYER --- */}
                <div className="absolute inset-0 z-0">
                    <img src={WALLPAPER_URL} className="w-full h-full object-cover filter brightness-[0.95]" alt="Wallpaper" />
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
                </div>

                {/* --- STATUS BAR BACKGROUND (Notch Strip) - HIGHER Z-INDEX --- */}
                <div className="absolute top-0 left-0 right-0 h-[44px] bg-black/30 backdrop-blur-md z-[70] border-b border-white/5"></div>

                {/* --- STATUS BAR CONTENT - HIGHER Z-INDEX --- */}
                <div className="px-8 pt-4 pb-2 flex justify-between items-center text-xs font-bold text-white relative z-[80]">
                    <span className="drop-shadow-md tracking-wide">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <div className="flex gap-1.5 items-center drop-shadow-md">
                        <Signal size={14} />
                        <Wifi size={14} />
                        <Battery size={14} />
                    </div>
                </div>

                {/* --- APP LAYER --- */}
                <AnimatePresence mode="popLayout">
                    {currentApp === 'aigram' && (
                        <motion.div key="aigram" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }} className="absolute inset-0 z-50">
                            <Suspense fallback={<div className="absolute inset-0 bg-black flex items-center justify-center text-white/70">กำลังเปิด AiGram...</div>}><AiGramApp onClose={goHome} /></Suspense>
                        </motion.div>
                    )}
                    {currentApp === 'mail' && (
                        <motion.div key="mail" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }} className="absolute inset-0 z-50">
                            <Suspense fallback={<div className="absolute inset-0 bg-black flex items-center justify-center text-white/70">กำลังเปิด Mail...</div>}><MailApp onClose={goHome} /></Suspense>
                        </motion.div>
                    )}
                    {currentApp === 'wallet' && (
                        <motion.div key="wallet" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }} className="absolute inset-0 z-50">
                            <Suspense fallback={<div className="absolute inset-0 bg-black flex items-center justify-center text-white/70">กำลังเปิด Wallet...</div>}><WalletApp onClose={goHome} userProfile={userProfile} /></Suspense>
                        </motion.div>
                    )}

                    {/* --- HOME SCREEN CONTENT (Conditional) --- */}
                    {currentApp === 'home' && (
                        <motion.div key="home" initial={{ scale: 1.05, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.05, opacity: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }} className="absolute inset-0 z-10 flex flex-col">
                            {/* --- CONTENT AREA (SCROLLABLE) --- */}
                            <div className="flex-1 overflow-y-auto px-6 pt-[70px] pb-32 relative z-10 custom-scrollbar scrollbar-hide">
                                
                                {/* Widgets Section */}
                                <div className="grid grid-cols-4 gap-4 mb-4">
                                    <ClockWidget />
                                    <div className="col-span-2 grid grid-cols-2 gap-3">
                                        <WeatherWidget />
                                        <CalendarWidget />
                                    </div>
                                </div>
                                
                                {/* NEW: Daily Rewards Widget */}
                                <DailyRewardWidget />

                                {/* NEW: Music Player inside Phone UI */}
                                {hasSpotify && currentTrack && (
                                    <div className="w-full mb-8 bg-black/30 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between shadow-lg border border-white/20 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden group">
                                        {/* Cover Image blurred background effect */}
                                        {currentTrack.coverImage && (
                                            <div className="absolute inset-0 z-0 opacity-20">
                                                <img src={currentTrack.coverImage} className="w-full h-full object-cover filter blur-md" alt="" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none z-0"></div>
                                        
                                        <div className="flex items-center gap-3 overflow-hidden relative z-10">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${globalMusic?.isPlaying ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-white/10 border border-white/20'}`}>
                                                <Music size={20} className={`text-white ${globalMusic?.isPlaying ? 'animate-spin-slow' : ''}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-white truncate w-32 drop-shadow-md">
                                                    {currentTrack.title}
                                                </div>
                                                <div className="text-[11px] text-white/80 truncate uppercase tracking-widest">
                                                    {currentTrack.artist}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2.5 relative z-10">
                                            <button 
                                                aria-label={globalMusic?.isPlaying ? "Pause music" : "Play music"}
                                                onClick={(e) => { e.stopPropagation(); if(globalMusic?.isPlaying) onPauseGlobalMusic?.(); else onPlayGlobalMusic?.(); }}
                                                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
                                            >
                                                {globalMusic?.isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1" />}
                                            </button>
                                            <button 
                                                aria-label="Next track"
                                                onClick={(e) => { e.stopPropagation(); onNextGlobalTrack?.(); }}
                                                className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                                            >
                                                <SkipForward size={14} fill="currentColor" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* App Grid */}
                                <div className="grid grid-cols-4 gap-y-7 gap-x-3">
                                    <AppIcon 
                                        label="AiGram" 
                                        icon={<Aperture size={28} />} 
                                        bgGradient="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500"
                                        onClick={() => setCurrentApp('aigram')}
                                        notification={unreadSocialPosts}
                                    />
                                    <AppIcon 
                                        label="Mail" 
                                        icon={<Mail size={28} />} 
                                        bgGradient="bg-gradient-to-b from-blue-400 to-blue-600"
                                        notification={unreadMails}
                                        onClick={() => setCurrentApp('mail')}
                                    />
                                    <AppIcon 
                                        label="Wallet" 
                                        icon={<Wallet size={28} />} 
                                        bgGradient="bg-gradient-to-b from-gray-800 to-black"
                                        onClick={() => setCurrentApp('wallet')}
                                    />
                                    <AppIcon 
                                        label="Membership" 
                                        icon={<Crown size={28} fill="currentColor" />} 
                                        bgGradient="bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600"
                                        notification={isVipDailyClaimable ? 1 : 0}
                                        onClick={() => useUIStore.getState().setShowVipModal(true)}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Home Indicator (Always Visible/Functional) */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center z-30 pointer-events-auto">
                    <div 
                        className="w-32 h-1.5 bg-white rounded-full opacity-70 active:scale-90 transition-transform cursor-pointer" 
                        onClick={() => {
                            if (currentApp !== 'home') goHome();
                            else togglePhone();
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
};


import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Crown, CheckCircle2, Zap, Heart, Clock, Gem, X, Star } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../store/gameStore';
import { playSfx } from '../utils/audioUtils';
import { LOCATION_IMAGES } from '../constants';
import { getCharacterImageUrl } from '../services/firebase';
import { AnimatedIcon } from './AnimatedIcon';

interface VipPassModalProps {
    onClose: () => void;
}

export const VipPassModal: React.FC<VipPassModalProps> = ({ onClose }) => {
    const { isVip, vipExpiry, vipDailyClaimed, claimVipDaily, subscribeVip } = useGameStore(useShallow(state => ({
        isVip: state.isVip,
        vipExpiry: state.vipExpiry,
        vipDailyClaimed: state.vipDailyClaimed,
        claimVipDaily: state.claimVipDaily,
        subscribeVip: state.subscribeVip
    })));
    const [renderState, setRenderState] = useState<'hidden' | 'open' | 'closing'>('hidden');
    const [isClaiming, setIsClaiming] = useState(false);
    const [headerUrl, setHeaderUrl] = useState('');
    const [timeLeft, setTimeLeft] = useState('');
    const [showPremiumFeedback, setShowPremiumFeedback] = useState(false);

    useEffect(() => {
        if (!isVip || !vipExpiry) return;
        
        const updateTimer = () => {
            const now = Date.now();
            const diff = vipExpiry - now;
            if (diff <= 0) {
                setTimeLeft('Expired');
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            
            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h ${minutes}m`);
            } else {
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [isVip, vipExpiry]);

    useEffect(() => {
        requestAnimationFrame(() => setRenderState('open'));
        playSfx('level_up'); // Changed from gacha_reveal to level_up

        const load = async () => {
            const url = await getCharacterImageUrl(LOCATION_IMAGES.vip_pass_header);
            if (url) setHeaderUrl(url);
        };
        load();
    }, []);

    const handleClose = () => {
        setRenderState('closing');
        setTimeout(onClose, 300);
    };

    const handleSubscribe = () => {
        subscribeVip();
        playSfx('level_up');
        // Visual feedback logic if needed
    };

    const handleDailyClaim = () => {
        if (isClaiming) return;
        setIsClaiming(true);
        const success = claimVipDaily();
        if (success) {
            playSfx('task_complete');
            setShowPremiumFeedback(true);
            setTimeout(() => {
                setShowPremiumFeedback(false);
                setIsClaiming(false);
            }, 2500);
        } else {
            setIsClaiming(false);
        }
    };

    if (renderState === 'hidden') return null;

    const todayStr = new Date().toDateString();
    const canClaim = isVip && vipDailyClaimed !== todayStr;

    return createPortal(
        <div className={`fixed inset-0 z-[3000] flex items-center justify-center p-6 transition-all duration-300 ${renderState === 'open' ? 'bg-black/90 backdrop-blur-md opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`}>
            
            <div 
                className={`
                    relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-black rounded-[2.5rem] border-[4px] border-yellow-500/50 shadow-[0_0_60px_rgba(234,179,8,0.3)] overflow-hidden flex flex-col max-h-[85vh]
                    transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                    ${renderState === 'open' ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-20 opacity-0'}
                `}
            >
                {/* Close Button */}
                <button onClick={handleClose} className="absolute top-4 right-4 z-30 bg-black/40 hover:bg-white/10 text-white p-2 rounded-full transition-colors">
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="relative h-48 shrink-0 overflow-hidden group">
                    {headerUrl ? (
                        <>
                            <img src={headerUrl} className="absolute inset-0 w-full h-full object-cover z-0" alt="VIP Pass" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10"></div>
                        </>
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#a855f7,#fbbf24,#a855f7)] animate-[spin_4s_linear_infinite] opacity-30"></div>
                            <div className="absolute inset-[2px] bg-slate-900 rounded-t-[2.3rem] z-0"></div>
                        </>
                    )}
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center p-6">
                        <div className="w-20 h-20 bg-gradient-to-tr from-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.5)] border-4 border-slate-900 mb-3 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent"></div>
                            <Crown size={40} strokeWidth={1.5} className="text-slate-900 fill-slate-900/20 relative z-10 drop-shadow-sm" />
                        </div>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-100 to-yellow-200 uppercase tracking-tighter drop-shadow-sm">
                            AiLuv Elite
                        </h2>
                        <p className="text-yellow-500/80 text-xs font-bold uppercase tracking-[0.3em]">VIP Access Pass</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-0 space-y-4 relative z-10">
                    
                    {/* STATUS CARD */}
                    {isVip ? (
                        <div className="bg-gradient-to-r from-yellow-900/40 to-amber-900/40 border border-yellow-500/30 p-4 rounded-2xl flex flex-col items-center text-center animate-pulse">
                            <span className="text-yellow-400 font-bold text-sm mb-1 flex items-center gap-2">
                                <CheckCircle2 size={16} /> VIP ACTIVE
                            </span>
                            <p className="text-[10px] text-yellow-200/60">Enjoy your exclusive benefits!</p>
                            {timeLeft && timeLeft !== 'Expired' && (
                                <div className="mt-2 px-3 py-1 bg-black/40 rounded-full border border-yellow-500/20 flex items-center gap-1.5">
                                    <Clock size={12} className="text-yellow-500" />
                                    <span className="text-xs font-mono text-yellow-300">{timeLeft}</span>
                                </div>
                            )}
                            
                            {/* DAILY CLAIM BUTTON */}
                            <div className="mt-4 w-full">
                                <button 
                                    onClick={handleDailyClaim}
                                    disabled={!canClaim}
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all ${canClaim ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:scale-105 active:scale-95' : 'bg-slate-800 text-slate-500 cursor-default'}`}
                                >
                                    {canClaim ? (
                                        <><AnimatedIcon type="gem" size={24} className="-ml-2" /> Claim Daily 50 Gems</>
                                    ) : (
                                        <><CheckCircle2 size={16} /> Claimed Today</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-800/50 border border-white/10 p-4 rounded-2xl text-center">
                            <p className="text-slate-300 text-xs leading-relaxed">
                                ปลดล็อกประสบการณ์ระดับ Exclusive เพื่อความรักที่เหนือกว่า! <br/>
                                <span className="text-yellow-400 font-bold">สมัครวันนี้ เริ่มต้นเพียง ฿299/เดือน</span>
                            </p>
                        </div>
                    )}

                    {/* BENEFITS LIST */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                                <Zap size={20} fill="currentColor" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Energy Saver</h4>
                                <p className="text-[10px] text-slate-400">ลด Energy ในการแชทลง 50%</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                                <Heart size={20} fill="currentColor" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Love Magnet</h4>
                                <p className="text-[10px] text-slate-400">โบนัสความรัก +10% ทุกกิจกรรม</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                                <AnimatedIcon type="gem" size={32} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Daily Gems</h4>
                                <p className="text-[10px] text-slate-400">รับฟรี 50 Gems ทุกวัน (รวม 1,500/เดือน)</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Fast Track</h4>
                                <p className="text-[10px] text-slate-400">ลดคูลดาวน์งานและยิม 30%</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                                <Star size={20} fill="currentColor" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Golden Profile</h4>
                                <p className="text-[10px] text-slate-400">ชื่อสีทองและกรอบรูปพิเศษ</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                {!isVip && (
                    <div className="p-6 pt-0 relative z-20">
                        <button 
                            onClick={handleSubscribe}
                            className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-amber-900/40 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group"
                        >
                            <Crown size={20} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
                            <span>SUBSCRIBE NOW</span>
                        </button>
                        <p className="text-center text-[10px] text-slate-500 mt-3">
                            Recurring billing. Cancel anytime.
                        </p>
                    </div>
                )}

                {/* Premium Feedback Overlay */}
                {showPremiumFeedback && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="flex flex-col items-center text-center animate-in zoom-in-50 duration-500 spring-bounce">
                            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                                <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping"></div>
                                <div className="absolute inset-4 bg-gradient-to-tr from-yellow-300 to-amber-500 rounded-full animate-spin-slow"></div>
                                <AnimatedIcon type="gem" size={80} className="relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                            </div>
                            <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400 uppercase tracking-widest drop-shadow-lg mb-2">
                                PREMIUM CLAIM
                            </h3>
                            <p className="text-yellow-100 font-bold text-lg flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full border border-yellow-500/30">
                                <span className="text-cyan-400">+50</span> Diamonds
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

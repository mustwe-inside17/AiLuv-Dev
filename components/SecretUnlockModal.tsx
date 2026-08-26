
import React, { useEffect, useState } from 'react';
import { SecretUnlockData } from '../types';
import { getCharacterImageUrl } from '../services/firebase';
import { Gem, Download, X, Crown, Sparkles, CheckCircle2, Loader2, ZoomIn } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { playSfx } from '../utils/audioUtils';

interface SecretUnlockModalProps {
    data: SecretUnlockData | null;
    onClose: () => void;
}

export const SecretUnlockModal: React.FC<SecretUnlockModalProps> = ({ data, onClose }) => {
    const addDiamonds = useGameStore(state => state.addDiamonds);
    const [renderState, setRenderState] = useState<'hidden' | 'open' | 'closing'>('hidden');
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isClaimed, setIsClaimed] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    
    // New States
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [confetti, setConfetti] = useState<{id: number, x: number, y: number, color: string, delay: string}[]>([]);

    useEffect(() => {
        if (data) {
            setRenderState('open');
            // Load Image
            const load = async () => {
                const url = await getCharacterImageUrl(data.imagePath);
                if (url) setImageUrl(url);
            };
            load();
            playSfx('gacha_reveal'); // Use grandiose sound

            // Generate Celebration Confetti
            const colors = ['#FCD34D', '#F472B6', '#60A5FA', '#34D399', '#A78BFA'];
            const newConfetti = Array.from({ length: 60 }).map((_, i) => ({
                id: i,
                x: (Math.random() - 0.5) * 600, 
                y: (Math.random() - 0.5) * 600,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: `${Math.random() * 0.3}s`
            }));
            setConfetti(newConfetti);

        } else {
            setRenderState('hidden');
            setImageUrl('');
            setIsClaimed(false);
            setIsDownloading(false);
            setIsFullScreen(false);
            setConfetti([]);
        }
    }, [data]);

    const handleClaim = () => {
        if (isClaimed) return;
        setIsClaimed(true);
        addDiamonds(50);
        playSfx('level_up');
        
        // Auto Close
        setTimeout(() => {
            handleClose();
        }, 1500);
    };

    const handleClose = () => {
        setRenderState('closing');
        setTimeout(onClose, 300);
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent full screen trigger if buttons overlap
        if (!imageUrl || isDownloading) return;
        
        setIsDownloading(true);
        try {
            // Fetch blob to force download behavior regardless of browser/CORS
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `AiLuv_Secret_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
            // Fallback: Try standard link method if blob fetch fails
            const link = document.createElement('a');
            link.href = imageUrl;
            link.target = '_blank';
            link.download = `AiLuv_Secret_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } finally {
            setIsDownloading(false);
        }
    };

    if (renderState === 'hidden' || !data) return null;

    return (
        <>
            {/* FULL SCREEN VIEWER OVERLAY */}
            {isFullScreen && imageUrl && (
                <div 
                    className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center animate-in fade-in duration-300 touch-none cursor-zoom-out"
                    onClick={() => setIsFullScreen(false)}
                >
                    <button className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-3 rounded-full backdrop-blur-md transition-all hover:bg-white/20">
                        <X size={24} />
                    </button>
                    <img 
                        src={imageUrl} 
                        className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-300" 
                        alt="Full Secret"
                    />
                </div>
            )}

            <div className={`fixed inset-0 z-[999] flex items-center justify-center p-6 transition-all duration-500 ${renderState === 'open' ? 'bg-black/95 backdrop-blur-xl opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`}>
                
                {/* Background Rays */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,#fbbf24_20deg,transparent_40deg)] animate-[spin_10s_linear_infinite] opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
                </div>

                {/* Confetti Explosion Layer */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                    {confetti.map((c) => (
                        <div 
                            key={c.id}
                            className="absolute w-3 h-3 rounded-full animate-confetti-explode opacity-0"
                            style={{
                                backgroundColor: c.color,
                                '--tw-translate-x': `${c.x}px`,
                                '--tw-translate-y': `${c.y}px`,
                                animationDelay: c.delay
                            } as React.CSSProperties}
                        />
                    ))}
                </div>

                <div 
                    className={`
                        relative w-full max-w-sm bg-slate-900 rounded-[2.5rem] p-1 shadow-[0_0_60px_rgba(234,179,8,0.3)] border border-yellow-500/30 overflow-hidden
                        transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) flex flex-col
                        ${renderState === 'open' ? 'scale-100 translate-y-0 opacity-100' : 'scale-50 translate-y-20 opacity-0'}
                    `}
                >
                    {/* Gold Frame Border */}
                    <div className="absolute inset-0 border-[3px] border-yellow-500/20 rounded-[2.5rem] pointer-events-none z-20"></div>

                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-30 bg-gradient-to-b from-black/90 to-transparent">
                        <div className="flex items-center gap-2">
                            <Crown size={20} className="text-yellow-400 fill-yellow-400 animate-bounce-soft" />
                            <span className="text-xs font-black text-yellow-400 uppercase tracking-[0.2em] drop-shadow-md">Exclusive Secret Unlock</span>
                        </div>
                        <button onClick={handleClose} className="bg-black/40 hover:bg-white/20 text-white/70 hover:text-white p-2 rounded-full transition-colors backdrop-blur-md">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div 
                        className="relative aspect-[3/4] bg-slate-800 rounded-t-[2.3rem] overflow-hidden group cursor-zoom-in"
                        onClick={() => setIsFullScreen(true)}
                    >
                        {imageUrl ? (
                            <img src={imageUrl} alt="Secret" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900 animate-pulse">
                                <Sparkles className="text-yellow-500/50" size={48} />
                            </div>
                        )}
                        
                        {/* Zoom Hint */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                            <div className="bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 flex items-center gap-2">
                                <ZoomIn size={14} /> Tap to View
                            </div>
                        </div>

                        {/* Caption Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
                            <p className="text-white text-sm font-medium leading-relaxed italic drop-shadow-lg relative">
                                <span className="absolute -top-4 left-0 text-4xl text-yellow-500/30 font-serif">"</span>
                                {data.caption}
                                <span className="absolute -bottom-4 right-0 text-4xl text-yellow-500/30 font-serif rotate-180">"</span>
                            </p>
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="bg-slate-900 p-5 rounded-b-[2.3rem] space-y-4 relative z-20">
                        
                        <button 
                            onClick={handleClaim}
                            disabled={isClaimed}
                            className={`
                                w-full py-4 rounded-2xl font-black text-lg shadow-xl relative overflow-hidden group transition-all active:scale-95
                                ${isClaimed 
                                    ? 'bg-green-600 text-white cursor-default' 
                                    : 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 text-slate-900 hover:brightness-110'}
                            `}
                        >
                            {isClaimed ? (
                                <div className="flex items-center justify-center gap-2 animate-in zoom-in">
                                    <CheckCircle2 size={24} /> Collected!
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Gem size={20} className="fill-slate-900" /> Claim 50 Diamonds
                                </div>
                            )}
                            
                            {/* Shine Effect */}
                            {!isClaimed && <div className="absolute inset-0 bg-white/30 skew-x-12 -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>}
                        </button>

                        <button 
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="w-full text-xs font-bold text-slate-500 hover:text-white flex items-center justify-center gap-2 transition-colors uppercase tracking-wider py-2"
                        >
                            {isDownloading ? (
                                <><Loader2 size={12} className="animate-spin" /> Saving...</>
                            ) : (
                                <><Download size={12} /> Save to Device</>
                            )}
                        </button>
                    </div>
                </div>
                
                <style>{`
                    @keyframes shimmer {
                        100% { transform: translateX(200%) skewX(12deg); }
                    }
                    @keyframes confetti-explode {
                        0% { transform: translate(0, 0) scale(0.5); opacity: 1; }
                        50% { opacity: 1; }
                        100% { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(0); opacity: 0; }
                    }
                    .animate-confetti-explode {
                        animation: confetti-explode 1s ease-out forwards;
                    }
                `}</style>
            </div>
        </>
    );
};

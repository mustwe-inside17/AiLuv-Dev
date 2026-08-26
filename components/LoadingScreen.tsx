
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { LOCATION_IMAGES, CHARACTER_DATA } from '../constants';
import { getCharacterImageUrl } from '../services/firebase';

// [MARCUS CONFIG]: Configured for Random Backgrounds (7 Images)
// Path to custom images in Firebase Storage
const LOADING_BACKGROUNDS = [
    "ui/loading_bg_1.png",
    "ui/loading_bg_2.png",
    "ui/loading_bg_3.png",
    "ui/loading_bg_4.png",
    "ui/loading_bg_5.png",
    "ui/loading_bg_6.png",
    "ui/loading_bg_7.png"
];

const LOADING_TEXTS = [
    "กำลังเชื่อมต่อเข้าสู่โลกของ AiLuv...",
    "กำลังเตรียมขนมที่ร้านพี่พีท... 🍪",
    "กำลังสัมผัสเสียงหัวใจของเอริน... 💓",
    "แอบส่องคอลเลกชันใหม่ของเจลลี่... 👗",
    "ปลุกมาร์คัสจากกองเอกสาร... 📄",
    "กำลังตามหาแมวของลูคัส... 🐈‍⬛",
    "วอร์มร่างกายรอโค้ชเฟียร์... 🏋️‍♀️",
    "จัดโต๊ะให้เรียบร้อยโดยมีอา... 🧹",
    "Loading AiLuv City Assets...",
    "กำลังจะถึงคอนโดแล้ว... ✨"
];

interface LoadingScreenProps {
    onComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [textIndex, setTextIndex] = useState(0);
    const [assetsLoaded, setAssetsLoaded] = useState(0);
    const [totalAssets, setTotalAssets] = useState(0);
    const hasCompletedRef = useRef(false);
    
    // Animation State
    const [isExiting, setIsExiting] = useState(false);

    // [MARCUS LOGIC]: Randomize Background on Initialize
    // This will hold the resolved URL after useEffect fetches it
    const [currentBgUrl, setCurrentBgUrl] = useState<string>("");

    // Text Rotator Logic
    useEffect(() => {
        const textTimer = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length);
        }, 2000); 

        return () => clearInterval(textTimer);
    }, []);

    // --- REAL ASSET PRELOADER (ENHANCED) ---
    useEffect(() => {
        const preloadAssets = async () => {
            const locationAssets = Object.values(LOCATION_IMAGES);
            const characterAssets = Object.values(CHARACTER_DATA).map(c => c.baseImg);
            // Preload the background images as well
            const bgAssets = LOADING_BACKGROUNDS; 
            
            const imagesToLoad = [...new Set([...locationAssets, ...characterAssets, ...bgAssets])];
            
            setTotalAssets(imagesToLoad.length);
            
            // Pick a random background path
            const randomBgPath = LOADING_BACKGROUNDS[Math.floor(Math.random() * LOADING_BACKGROUNDS.length)];
            
            let loadedCount = 0;

            const updateProgress = () => {
                loadedCount++;
                setAssetsLoaded(loadedCount);
                
                // Calculate percentage based on real assets
                const newProgress = Math.floor((loadedCount / imagesToLoad.length) * 100);
                setProgress(newProgress);

                if (loadedCount >= imagesToLoad.length && !hasCompletedRef.current) {
                    hasCompletedRef.current = true;
                    // Trigger Exit Animation
                    setTimeout(() => {
                        setIsExiting(true);
                        // Complete callback fires after animation finishes (800ms)
                        setTimeout(() => {
                            if (onComplete) onComplete();
                        }, 700); 
                    }, 500);
                }
            };

            // Start fetching all images in parallel
            imagesToLoad.forEach(async (path) => {
                try {
                    if (!path) {
                        updateProgress();
                        return;
                    }
                    const url = await getCharacterImageUrl(path);
                    
                    // If this is the chosen background, set it to state
                    if (path === randomBgPath && url) {
                        setCurrentBgUrl(url);
                    }

                    if (url) {
                        const img = new Image();
                        img.src = url;
                        img.onload = updateProgress;
                        img.onerror = () => updateProgress();
                    } else {
                        // Fallback for direct URLs (like Unsplash) if any remain
                        const img = new Image();
                        img.src = path;
                        img.onload = updateProgress;
                        img.onerror = () => updateProgress();
                    }
                } catch (e) {
                    console.warn(`Preload error for ${path}`, e);
                    updateProgress();
                }
            });
        };

        preloadAssets();
    }, [onComplete]);

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className={`fixed inset-0 z-[9999] flex flex-col bg-white transition-all duration-700 overflow-hidden ${isExiting ? 'pointer-events-none' : ''}`}>
            
            {/* --- 1. BACKGROUND LAYER --- */}
            <div className={`absolute inset-0 z-0 transition-all duration-1000 ${isExiting ? 'scale-110 opacity-0 blur-xl' : 'scale-100 opacity-100'}`}>
                {/* Background Image (Dynamic) */}
                {currentBgUrl && (
                    <img 
                        src={currentBgUrl} 
                        alt="Background" 
                        className="w-full h-full object-cover"
                    />
                )}
                {/* Overlay Darkness (เพื่อให้ Text อ่านง่าย) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40"></div>
                
                {/* Ambient Particles */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-[20%] left-[20%] w-32 h-32 bg-pink-500 rounded-full blur-[80px] animate-pulse"></div>
                    <div className="absolute bottom-[20%] right-[20%] w-40 h-40 bg-purple-600 rounded-full blur-[80px] animate-pulse [animation-delay:2s]"></div>
                </div>
            </div>

            {/* --- 2. MAIN CONTENT (Flex Layout - Bottom Aligned) --- */}
            <div className={`relative z-10 w-full h-full flex flex-col justify-end items-center pb-24 px-8 ${isExiting ? 'animate-luma-out' : ''}`}>
                
                <div className="w-full max-w-md flex flex-col gap-3">
                    
                    {/* Cute Loading Text (Above Bar) */}
                    <div className="h-6 flex items-end justify-center">
                        <p className="text-sm font-bold text-white/90 tracking-wider uppercase animate-pulse text-center text-shadow-lg drop-shadow-md">
                            {LOADING_TEXTS[textIndex]}
                        </p>
                    </div>

                    {/* Progress Bar (Theme Color: Pink/Rose Gradient) */}
                    <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden relative shadow-inner backdrop-blur-md border border-white/10">
                        <div 
                            className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 transition-all duration-300 ease-out rounded-full shadow-[0_0_20px_rgba(236,72,153,0.6)]"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 blur-[2px] animate-pulse"></div>
                        </div>
                    </div>

                    {/* Status Percentage (Below Bar) */}
                    <div className="flex justify-between items-center text-[10px] font-bold text-white/50 uppercase tracking-widest px-1">
                        <span>Processing data...</span>
                        <span className="text-white/80">{progress}%</span>
                    </div>

                    {/* Emergency Reset (Hidden mostly) */}
                    <button 
                        onClick={handleRefresh}
                        className="self-center mt-2 flex items-center gap-2 text-[10px] font-bold text-white/30 hover:text-white transition-colors animate-in fade-in slide-in-from-bottom-4 delay-[5000ms] opacity-0 fill-mode-forwards"
                        style={{ animationDelay: '8s' }} 
                    >
                        <RefreshCw size={10} />
                        Stuck? Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

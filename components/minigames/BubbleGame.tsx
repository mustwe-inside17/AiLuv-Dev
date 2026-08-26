
import React, { useState, useEffect, useRef } from 'react';
import { Star, Coins, Skull, Gem, Diamond, Flame, Zap, Activity, Briefcase, Music } from 'lucide-react';
import { playSfx } from '../../utils/audioUtils';

interface Bubble {
    id: number;
    type: 'good' | 'bad' | 'rare' | 'bonus'; 
    x: number;
    y: number;
    speed: number;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    velocity: { x: number, y: number };
    life: number; // 0 to 1
}

interface BubbleGameProps {
    taskType: 'work' | 'gym' | 'party';
    duration: number; // Total duration in ms
    timeLeft: number; // Seconds remaining
    onScoreUpdate: (score: number) => void;
}

// --- FLAVOR TEXTS (THAI LOCALIZATION) ---
const WORK_TEXTS = [
    "ร่างอีเมล...", "แก้คำผิด...", "วิเคราะห์ข้อมูล...", 
    "จิบกาแฟ...", "คุยกับลูกค้า...", "ระดมสมอง...", 
    "รีวิวโค้ด...", "บันทึกงาน...", "แก้สไลด์...", 
    "ตอบแชทงาน...", "งานเร่ง!", "ใช้สมาธิ..."
];

const GYM_TEXTS = [
    "ชีพจรเต้นรัว...", "กล้ามเนื้อตึง...", "คาร์ดิโอโซน 2...", 
    "อีกทีนึง!", "ซับเหงื่อ...", "จิบน้ำ...", 
    "เกร็งหน้าท้อง...", "หายใจเข้า...", "ยืดเส้น...", 
    "สู้ตาย!", "โฟกัสท่า...", "ตึงเปรี๊ยะ..."
];

const PARTY_TEXTS = [
    "โยกตามจังหวะ...", "เต้นยับ...", "ชนแก้ว!", 
    "ถ่ายเซลฟี่...", "เพลงนี้โดน!", "หัวเราะ...", 
    "ชงเครื่องดื่ม...", "คุยกับเพื่อน...", "บรรยากาศดี...",
    "ชูมือขึ้น!", "ขยับเบาๆ...", "ชีวิตกลางคืน..."
];

export const BubbleGame: React.FC<BubbleGameProps> = ({ taskType, duration, timeLeft, onScoreUpdate }) => {
    const [score, setScore] = useState(0);
    const [bubbles, setBubbles] = useState<Bubble[]>([]);
    const [frenzyActive, setFrenzyActive] = useState(false);
    const [floatingTexts, setFloatingTexts] = useState<{id: number, text: string, x: number, y: number, color: string}[]>([]);
    
    // --- NEW: COMBO & EFFECTS STATE ---
    const [combo, setCombo] = useState(0);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [flavorText, setFlavorText] = useState(""); // Current narrative text

    const animationFrameRef = useRef<number | null>(null);
    const particleFrameRef = useRef<number | null>(null); // Separate loop for visual candy
    const lastSpawnTimeRef = useRef<number>(0);
    const frenzyEndTimeRef = useRef<number>(0);
    const lastFrenzySpawnTimeRef = useRef<number>(0);

    // Initial Reset
    useEffect(() => {
        setScore(0);
        setBubbles([]);
        setCombo(0);
    }, []);

    // --- NEW: NARRATIVE TICKER LOOP ---
    useEffect(() => {
        const texts = taskType === 'work' ? WORK_TEXTS : taskType === 'gym' ? GYM_TEXTS : PARTY_TEXTS;
        
        const updateFlavor = () => {
            const randomText = texts[Math.floor(Math.random() * texts.length)];
            setFlavorText(randomText);
        };
        
        updateFlavor(); // Initial
        const interval = setInterval(updateFlavor, 2500); // Change every 2.5s
        return () => clearInterval(interval);
    }, [taskType]);

    // --- NEW: PARTICLE SYSTEM LOOP ---
    useEffect(() => {
        const updateParticles = () => {
            setParticles(prev => {
                if (prev.length === 0) return prev;
                return prev.map(p => ({
                    ...p,
                    x: p.x + p.velocity.x,
                    y: p.y + p.velocity.y,
                    life: p.life - 0.05
                })).filter(p => p.life > 0);
            });
            particleFrameRef.current = requestAnimationFrame(updateParticles);
        };
        particleFrameRef.current = requestAnimationFrame(updateParticles);
        return () => {
            if (particleFrameRef.current) cancelAnimationFrame(particleFrameRef.current);
        };
    }, []);

    const spawnParticles = (x: number, y: number, color: string) => {
        const newParticles: Particle[] = [];
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 1 + 0.5;
            newParticles.push({
                id: Date.now() + Math.random(),
                x,
                y,
                color,
                velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
                life: 1.0
            });
        }
        setParticles(prev => [...prev, ...newParticles]);
    };

    // Game Loop (Preserved Logic)
    useEffect(() => {
        const updateGame = (timestamp: number) => {
            // CRITICAL FIX: Stop loop immediately if time is up
            if (timeLeft <= 0) {
                setBubbles([]); // Clear screen instantly
                return; 
            }

            const now = Date.now();
            
            // Difficulty scaling
            const timeElapsed = duration - (timeLeft * 1000);
            const difficultyFactor = Math.min(1, timeElapsed / duration);

            // Frenzy Logic
            const isFrenzy = now < frenzyEndTimeRef.current;
            if (frenzyActive !== isFrenzy) setFrenzyActive(isFrenzy);

            let currentSpawnRate = 1000 - (difficultyFactor * 600); 
            if (isFrenzy) currentSpawnRate /= 3;

            // Spawn Bubble
            if (now - lastSpawnTimeRef.current > currentSpawnRate) {
                lastSpawnTimeRef.current = now;

                const typeRoll = Math.random();
                let type: 'good' | 'bad' | 'rare' | 'bonus' = 'good';
                
                if (typeRoll > 0.98) {
                     if (now - lastFrenzySpawnTimeRef.current > 10000) {
                         type = 'bonus'; 
                         lastFrenzySpawnTimeRef.current = now;
                     } else {
                         type = 'good'; 
                     }
                }
                else if (typeRoll > 0.8) type = 'bad'; 
                else if (typeRoll < 0.1) type = 'rare'; 

                // Adjusted Speed: Base Speed * 1.375 (Increased by 10% from 1.25)
                const baseSpeed = (Math.random() * 0.2 + 0.2) + (difficultyFactor * 0.5);
                const speed = baseSpeed * 1.375;

                const newBubble: Bubble = {
                    id: Date.now() + Math.random(),
                    type,
                    x: Math.random() * 80 + 10, 
                    y: -20, 
                    speed: speed
                };
                setBubbles(prev => [...prev, newBubble]);
            }

            // Move Bubbles
            setBubbles(prev => {
                const moved = prev.map(b => ({ ...b, y: b.y + b.speed })).filter(b => b.y < 120); 
                return moved;
            });
            
            animationFrameRef.current = requestAnimationFrame(updateGame);
        };
        
        // Start loop only if time remains
        if (timeLeft > 0) {
            animationFrameRef.current = requestAnimationFrame(updateGame);
        } else {
            setBubbles([]); // Ensure clear on re-render if 0
        }

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [timeLeft, duration, frenzyActive]);

    const handleBubbleClick = (e: React.PointerEvent, bubble: Bubble) => {
        // [MARCUS FIX] Use PointerEvent for instant reaction
        e.preventDefault();
        e.stopPropagation();
        
        const clientX = e.clientX;
        const clientY = e.clientY;
        
        // CRITICAL FIX: Ignore clicks if time is up
        if (timeLeft <= 0) return;

        let basePoints = 0;
        let color = '';
        let particleColor = '#ffffff';
        
        if (bubble.type === 'good') { basePoints = 10; color = 'text-yellow-400'; particleColor = '#FACC15'; }
        else if (bubble.type === 'rare') { basePoints = 30; color = 'text-pink-400'; particleColor = '#F472B6'; }
        else if (bubble.type === 'bad') { basePoints = -20; color = 'text-red-500'; particleColor = '#EF4444'; }
        else if (bubble.type === 'bonus') {
            frenzyEndTimeRef.current = Date.now() + 5000; 
            addFloatingText(clientX, clientY, "FRENZY MODE!", 'text-cyan-400 font-black text-xl');
            basePoints = 50;
            color = 'text-cyan-400';
            particleColor = '#22D3EE';
        }

        // --- NEW: COMBO LOGIC ---
        let currentCombo = combo;
        let multiplier = 1;

        if (bubble.type === 'bad') {
            currentCombo = 0;
            setCombo(0);
            playSfx('bubble_wrong'); // [MARCUS FIX] Real SFX
            addFloatingText(clientX, clientY - 30, "COMBO BROKEN!", 'text-red-500 font-bold text-xs');
        } else {
            currentCombo += 1;
            setCombo(currentCombo);
            playSfx('bubble_pop'); // [MARCUS FIX] Real SFX

            // Multiplier Thresholds
            if (currentCombo > 75) multiplier = 1.5;
            else if (currentCombo > 50) multiplier = 1.3;
            else if (currentCombo > 30) multiplier = 1.1;
        }

        // --- Spawn Visuals ---
        spawnParticles(bubble.x, bubble.y, particleColor);

        // Calculate Final Score
        const finalPoints = Math.floor(basePoints * multiplier);
  
        const newScore = score + finalPoints;
        setScore(newScore);
        onScoreUpdate(newScore); // Propagate up
  
        if (bubble.type !== 'bonus') {
            const multiText = multiplier > 1 ? ` (x${multiplier})` : '';
            addFloatingText(clientX, clientY, finalPoints > 0 ? `+${finalPoints}${multiText}` : `${finalPoints}`, color);
        }
        setBubbles(prev => prev.filter(b => b.id !== bubble.id));
    };

    const addFloatingText = (x: number, y: number, text: string, color: string) => {
        const newText = { id: Date.now(), text, x, y, color };
        setFloatingTexts(prev => [...prev, newText]);
        setTimeout(() => { setFloatingTexts(prev => prev.filter(t => t.id !== newText.id)); }, 1000);
    };

    const renderBubbleContent = (bubble: Bubble) => {
        const isGym = taskType === 'gym';
        let content;
        
        if (isGym) {
            content = <Star size={28} className="text-indigo-600 fill-indigo-400" />;
        } else {
            content = <Coins size={28} className="text-yellow-600 fill-yellow-400" />;
        }

        if (bubble.type === 'bad') content = <Skull size={28} className="text-white fill-gray-900" />;
        if (bubble.type === 'rare') content = <Gem size={28} className="text-pink-600 fill-pink-300" />;
        if (bubble.type === 'bonus') content = <Diamond size={28} className="text-cyan-600 fill-cyan-300 animate-spin-slow" />;
        
        return content;
    };

    const getBubbleStyle = (bubble: Bubble) => {
        const isGym = taskType === 'gym';
        if (bubble.type === 'bad') return 'bg-red-100 border-4 border-red-500 shadow-red-200';
        if (bubble.type === 'rare') return 'bg-pink-100 border-4 border-pink-400 shadow-pink-200';
        if (bubble.type === 'bonus') return 'bg-cyan-100 border-4 border-cyan-400 shadow-cyan-200 ring-4 ring-cyan-200/50';
        if (isGym) return 'bg-indigo-100 border-4 border-indigo-400 shadow-indigo-200';
        return 'bg-yellow-100 border-4 border-yellow-400 shadow-yellow-200';
    };

    // --- COMBO STYLING HELPER ---
    const getComboStyle = () => {
        if (combo > 75) return 'text-fuchsia-500 scale-125 animate-shake-hard drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]';
        if (combo > 50) return 'text-red-500 scale-110 animate-bounce drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]';
        if (combo > 30) return 'text-orange-500 scale-105 animate-pulse';
        return 'text-gray-400 scale-100';
    };

    const getIcon = () => {
        if (taskType === 'gym') return <Activity size={12} />;
        if (taskType === 'work') return <Briefcase size={12} />;
        return <Music size={12} />;
    }

    return (
        <>
            {/* Frenzy Indicator */}
            {frenzyActive && (
                 <div className="absolute top-0 inset-x-0 bg-cyan-400 text-white font-black text-center py-1 tracking-widest text-xs animate-pulse z-40">FRENZY MODE ACTIVE!</div>
            )}

            {/* Score & Combo Display */}
            <div className="flex justify-between items-start w-full px-4 absolute top-4 left-0 right-0 z-20 pointer-events-none">
                <div className="flex gap-2">
                    <div className="bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700">
                        {timeLeft <= 0 ? "FINISHED" : "TIME"}
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${score >= 0 ? 'bg-green-100 text-green-600 border-green-200' : 'bg-red-100 text-red-600 border-red-200'}`}>
                        Score: {score}
                    </div>
                </div>

                {/* --- NEW: COMBO COUNTER UI --- */}
                {combo > 5 && (
                    <div className={`flex flex-col items-end transition-all duration-300 ${getComboStyle()}`}>
                        <div className="flex items-center gap-1 font-black text-lg italic tracking-tighter">
                            <Flame size={20} fill="currentColor" className={combo > 50 ? 'animate-fire' : ''} />
                            <span>{combo}x</span>
                        </div>
                        <div className="text-[8px] font-bold uppercase tracking-widest opacity-80">
                            {combo > 75 ? "MAX POWER!" : combo > 50 ? "ON FIRE!" : combo > 30 ? "HEATING UP" : "COMBO"}
                        </div>
                    </div>
                )}
            </div>

            {/* --- NEW: IMMERSIVE NARRATIVE TEXT --- */}
            {timeLeft > 0 && (
                <div className="absolute bottom-20 left-0 right-0 text-center pointer-events-none z-10">
                    <div key={flavorText} className="inline-flex items-center gap-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <span className={`animate-pulse ${taskType === 'gym' ? 'text-orange-500' : taskType === 'work' ? 'text-blue-500' : 'text-fuchsia-500'}`}>
                            {getIcon()}
                        </span>
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            {flavorText}
                        </span>
                    </div>
                </div>
            )}

            {/* Floating Texts */}
            {floatingTexts.map(ft => (
                <div key={ft.id} className={`fixed pointer-events-none text-lg font-bold animate-pop-text z-[100] ${ft.color}`} style={{ left: ft.x, top: ft.y }}>{ft.text}</div>
            ))}

            {/* --- NEW: PARTICLES LAYER --- */}
            {particles.map(p => (
                <div 
                    key={p.id}
                    className="absolute w-2 h-2 rounded-full pointer-events-none z-40"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        backgroundColor: p.color,
                        opacity: p.life,
                        transform: `scale(${p.life})`
                    }}
                />
            ))}

            {/* Bubbles */}
            {timeLeft > 0 && bubbles.map(bubble => (
                <div 
                    key={bubble.id}
                    // [MARCUS FIX] Use PointerDown for instant feedback + expanded hit area
                    onPointerDown={(e) => handleBubbleClick(e, bubble)}
                    className={`absolute w-24 h-24 -ml-4 -mt-4 flex items-center justify-center z-50 cursor-pointer touch-none select-none active:scale-95 transition-transform`}
                    style={{ left: `${bubble.x}%`, top: `${bubble.y}%` }} 
                >
                    {/* Visual Inner Bubble */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg pointer-events-none ${getBubbleStyle(bubble)}`}>
                        {renderBubbleContent(bubble)}
                    </div>
                </div>
            ))}

            <style>{`
                @keyframes fire {
                    0% { transform: scale(1); filter: brightness(100%); }
                    50% { transform: scale(1.2); filter: brightness(120%); }
                    100% { transform: scale(1); filter: brightness(100%); }
                }
                .animate-fire {
                    animation: fire 0.5s infinite alternate;
                }
            `}</style>
        </>
    );
};

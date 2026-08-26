import React, { useState, useEffect, useRef } from 'react';
import { Flame, Zap, Dumbbell, Trophy, Sparkles } from 'lucide-react';
import { playSfx } from '../../utils/audioUtils';

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    velocity: { x: number; y: number };
    life: number;
}

interface FloatingText {
    id: number;
    text: string;
    type: 'PERFECT' | 'GOOD' | 'MISS';
    x: number;
    y: number;
}

interface TimingBarGameProps {
    duration: number; // Total duration in ms
    timeLeft: number; // Seconds remaining
    onScoreUpdate: (score: number) => void;
}

// Thai Fitness Motivation Texts
const GYM_MOTIVATION = [
    "ฮึบ! ดันขึ้นมา!", "เกร็งหน้าท้อง!", "อีกทีนึง!", 
    "โฟกัสกล้ามเนื้อ!", "ซับเหงื่อแล้วสู้ต่อ!", "ปั๊มให้สุด!",
    "เพื่อหุ่นโฮ่ง!", "พลังล้นทะลัก!", "จุดเผาผลาญไขมัน!",
    "ตึงเปรี๊ยะ!", "ฟอร์มเป๊ะมาก!"
];

export const TimingBarGame: React.FC<TimingBarGameProps> = ({ duration, timeLeft, onScoreUpdate }) => {
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    
    // Bar Indicator position (0 to 100%)
    const [position, setPosition] = useState(50);
    // Target zone center position (0 to 100%)
    const [targetCenter, setTargetCenter] = useState(50);
    // Zone width constants (percentage of full bar)
    const goodZoneWidth = 28; // ±14%
    const perfectZoneWidth = 10; // ±5%

    // Visual feedback & effects
    const [particles, setParticles] = useState<Particle[]>([]);
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const [motivationText, setMotivationText] = useState("แตะที่จังหวะสีเขียวเพื่อยก!");
    const [lastHitRating, setLastHitRating] = useState<'PERFECT' | 'GOOD' | 'MISS' | null>(null);
    const [isPumping, setIsPumping] = useState(false);

    const animFrameRef = useRef<number | null>(null);
    const particleFrameRef = useRef<number | null>(null);
    const directionRef = useRef<number>(1); // 1 = right, -1 = left
    const posRef = useRef<number>(50);
    const speedRef = useRef<number>(0.75); // Slower initial start (~0.75) for better rhythm control

    const onScoreUpdateRef = useRef(onScoreUpdate);
    useEffect(() => {
        onScoreUpdateRef.current = onScoreUpdate;
    });

    // Speed adjustment based on combo (Starts relaxed at 0.75, gradually speeds up as combo increases)
    useEffect(() => {
        const comboBonusSpeed = Math.min(1.4, combo * 0.08);
        speedRef.current = 0.75 + comboBonusSpeed;
    }, [combo]);

    // Update Motivation Text periodically
    useEffect(() => {
        const interval = setInterval(() => {
            const randomMsg = GYM_MOTIVATION[Math.floor(Math.random() * GYM_MOTIVATION.length)];
            setMotivationText(randomMsg);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Particle Animation Loop
    useEffect(() => {
        const updateParticles = () => {
            setParticles(prev => {
                if (prev.length === 0) return prev;
                return prev
                    .map(p => ({
                        ...p,
                        x: p.x + p.velocity.x,
                        y: p.y + p.velocity.y,
                        life: p.life - 0.06
                    }))
                    .filter(p => p.life > 0);
            });
            particleFrameRef.current = requestAnimationFrame(updateParticles);
        };
        particleFrameRef.current = requestAnimationFrame(updateParticles);
        return () => {
            if (particleFrameRef.current) cancelAnimationFrame(particleFrameRef.current);
        };
    }, []);

    // Main Timing Indicator Loop (smooth 60fps sweep)
    useEffect(() => {
        const updateIndicator = () => {
            if (timeLeft <= 0) return;

            let nextPos = posRef.current + directionRef.current * speedRef.current;
            if (nextPos >= 98) {
                nextPos = 98;
                directionRef.current = -1;
            } else if (nextPos <= 2) {
                nextPos = 2;
                directionRef.current = 1;
            }

            posRef.current = nextPos;
            setPosition(nextPos);

            animFrameRef.current = requestAnimationFrame(updateIndicator);
        };

        animFrameRef.current = requestAnimationFrame(updateIndicator);
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [timeLeft]);

    // Particle burst generator
    const triggerParticles = (color: string) => {
        const newParticles: Particle[] = [];
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            newParticles.push({
                id: Date.now() + Math.random(),
                x: 50 + (Math.random() * 20 - 10), // center burst area
                y: 50 + (Math.random() * 20 - 10),
                color,
                velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
                life: 1.0
            });
        }
        setParticles(prev => [...prev, ...newParticles]);
    };

    // User Tap Action: Check Indicator against Target Zone
    const handleTap = (e?: React.MouseEvent | React.TouchEvent) => {
        if (e) {
            e.stopPropagation();
        }

        if (timeLeft <= 0) return;

        // Visual feedback animation
        setIsPumping(true);
        setTimeout(() => setIsPumping(false), 180);

        const currentPos = posRef.current;
        const diff = Math.abs(currentPos - targetCenter);

        const perfectThreshold = perfectZoneWidth / 2; // ±4%
        const goodThreshold = goodZoneWidth / 2;       // ±12%

        let rating: 'PERFECT' | 'GOOD' | 'MISS' = 'MISS';
        let earnedPts = 0;
        let color = '#ef4444'; // Red for miss

        if (diff <= perfectThreshold) {
            rating = 'PERFECT';
            earnedPts = 25;
            color = '#10b981'; // Emerald green
            playSfx('level_up');
        } else if (diff <= goodThreshold) {
            rating = 'GOOD';
            earnedPts = 10;
            color = '#f59e0b'; // Amber yellow
            playSfx('bubble_pop');
        } else {
            rating = 'MISS';
            earnedPts = 0;
            color = '#ef4444';
            playSfx('bubble_wrong');
        }

        setLastHitRating(rating);

        if (rating !== 'MISS') {
            const newCombo = combo + 1;
            const multiplier = newCombo >= 10 ? 2 : newCombo >= 5 ? 1.5 : 1;
            const finalPts = Math.round(earnedPts * multiplier);

            const nextScore = score + finalPts;
            setScore(nextScore);
            onScoreUpdateRef.current(nextScore);

            setCombo(newCombo);
            setMaxCombo(prev => Math.max(prev, newCombo));

            triggerParticles(color);

            // Relocate target zone slightly to keep gameplay dynamic!
            const newCenter = Math.floor(20 + Math.random() * 60); // Random position between 20% and 80%
            setTargetCenter(newCenter);
        } else {
            setCombo(0);
            triggerParticles('#ef4444');
        }

        // Add Floating text
        const textId = Date.now() + Math.random();
        const textLabel = rating === 'PERFECT' ? '🔥 PERFECT! +25' : rating === 'GOOD' ? '⚡ GOOD! +10' : '❌ MISS!';
        setFloatingTexts(prev => [...prev.slice(-3), {
            id: textId,
            text: textLabel,
            type: rating,
            x: currentPos,
            y: 35
        }]);

        // Cleanup floating text after duration
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(t => t.id !== textId));
        }, 900);
    };

    const isFever = combo >= 5;

    return (
        <div 
            onClick={handleTap}
            className={`
                relative z-50 w-full max-w-md mx-auto my-2 p-5 rounded-3xl backdrop-blur-xl border-2 transition-all duration-200 select-none touch-none cursor-pointer overflow-hidden
                ${isPumping ? 'scale-[0.98]' : 'scale-100'}
                ${isFever 
                    ? 'bg-slate-900/95 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.4)]' 
                    : 'bg-slate-900/90 border-slate-700/90 shadow-2xl'
                }
            `}
        >
            {/* Background Particles Canvas Layer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {particles.map(p => (
                    <div
                        key={p.id}
                        className="absolute w-3 h-3 rounded-full shadow-md"
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            backgroundColor: p.color,
                            opacity: p.life,
                            transform: `scale(${p.life * 1.8})`
                        }}
                    />
                ))}
            </div>

            {/* Top Bar: Stats & Combo */}
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-white">
                <div className="flex items-center gap-2 bg-slate-800/90 px-3.5 py-1.5 rounded-full border border-slate-700 shadow-inner">
                    <Trophy size={16} className="text-yellow-400" />
                    <span>คะแนน: <strong className="text-yellow-400 text-base">{score}</strong></span>
                </div>

                {combo > 0 && (
                    <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all animate-bounce ${
                        isFever 
                            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white border-amber-300 shadow-lg font-black' 
                            : 'bg-orange-500/30 text-orange-300 border-orange-500/50'
                    }`}>
                        <Flame size={16} className={isFever ? 'animate-pulse text-yellow-200' : 'text-orange-400'} />
                        <span className="tracking-wide">{combo} COMBO {isFever && '🔥 (x1.5)'}</span>
                    </div>
                )}
            </div>

            {/* Motivational Banner */}
            <div className="text-center mb-3 min-h-[24px]">
                <p className={`text-sm font-extrabold transition-all duration-300 ${
                    isFever ? 'text-amber-300 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-slate-200'
                }`}>
                    {motivationText}
                </p>
            </div>

            {/* TIMING BAR CONTAINER - TALLER & CLEARER (H-16 / 64px) */}
            <div className="relative w-full h-16 bg-slate-950 rounded-2xl border-2 border-slate-700/90 p-1 overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] flex items-center">
                
                {/* Outer Good Zone (Yellow/Amber) */}
                <div 
                    className="absolute h-full bg-amber-400/40 border-x-2 border-amber-300/90 transition-all duration-150 rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                    style={{
                        left: `${Math.max(0, targetCenter - goodZoneWidth / 2)}%`,
                        width: `${goodZoneWidth}%`
                    }}
                >
                    <span className="text-[10px] font-black text-amber-200 uppercase tracking-widest hidden sm:inline drop-shadow">GOOD</span>
                </div>

                {/* Inner Perfect Zone (Green Glow) */}
                <div 
                    className="absolute h-full bg-emerald-400/90 border-x-2 border-emerald-200 shadow-[0_0_20px_rgba(52,211,153,1)] transition-all duration-150 rounded-lg flex items-center justify-center animate-pulse"
                    style={{
                        left: `${Math.max(0, targetCenter - perfectZoneWidth / 2)}%`,
                        width: `${perfectZoneWidth}%`
                    }}
                >
                    <Sparkles size={14} className="text-white drop-shadow-md animate-spin duration-1000" />
                </div>

                {/* Sweeping Indicator Pointer */}
                <div 
                    className={`
                        absolute top-0 bottom-0 w-4 -ml-2 rounded-full transition-transform duration-75 shadow-[0_0_20px_rgba(255,255,255,1)]
                        ${isPumping ? 'scale-y-125 bg-white border-2 border-yellow-300' : 'bg-gradient-to-b from-white via-cyan-300 to-blue-500 border-2 border-white'}
                    `}
                    style={{
                        left: `${position}%`
                    }}
                >
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rotate-45 border border-white shadow-sm" />
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rotate-45 border border-white shadow-sm" />
                </div>

                {/* Floating Rating Popups */}
                {floatingTexts.map(t => (
                    <div
                        key={t.id}
                        className={`
                            absolute pointer-events-none font-black text-base whitespace-nowrap animate-in zoom-in slide-out-to-top duration-500 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]
                            ${t.type === 'PERFECT' ? 'text-emerald-400 scale-125' : t.type === 'GOOD' ? 'text-amber-300 scale-110' : 'text-red-400'}
                        `}
                        style={{
                            left: `${Math.min(75, Math.max(10, t.x))}%`,
                            top: `${t.y}%`
                        }}
                    >
                        {t.text}
                    </div>
                ))}
            </div>

            {/* Tap Action Button Area */}
            <div className="mt-4 flex flex-col items-center">
                <button
                    type="button"
                    onClick={handleTap}
                    className={`
                        w-full py-4 px-6 rounded-2xl font-black text-base uppercase tracking-wider shadow-2xl transition-all duration-150 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer
                        ${isFever
                            ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-slate-950 border-2 border-amber-200 shadow-amber-500/50 animate-pulse'
                            : 'bg-gradient-to-r from-orange-500 to-red-600 text-white border border-orange-400/60 shadow-orange-500/30 hover:brightness-110'
                        }
                        ${isPumping ? 'scale-95 brightness-125' : ''}
                    `}
                >
                    <Dumbbell size={22} className={`transition-transform duration-200 ${isPumping ? 'rotate-45 scale-125' : 'rotate-0'}`} />
                    <span>{isFever ? 'PUMP IT NOW! 🔥' : 'แตะเพื่อยกน้ำหนัก! 💪'}</span>
                </button>

                <p className="mt-2 text-xs text-slate-300 dark:text-slate-400 font-medium text-center">
                    (แตะบริเวณใดก็ได้บนกล่องนี้หรือหน้าจอเมื่อตัวชี้อยู่ตรงช่องสี)
                </p>
            </div>
        </div>
    );
};

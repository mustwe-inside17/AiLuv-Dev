import React, { useState, useEffect, useRef } from 'react';
import { Flame, Dumbbell, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';
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

interface Ripple {
    id: number;
    x: number;
    y: number;
}

interface TimingBarGameProps {
    duration: number; // Total duration in ms
    timeLeft: number; // Seconds remaining
    onScoreUpdate: (score: number) => void;
    taskName?: string;
    percentDone?: number;
    isFinishing?: boolean;
}

// Encouraging Thai Workout Quotes
const GYM_MOTIVATION = [
    "ฮึบ! ปั๊มให้สุดแรง!",
    "เกร็งหน้าท้อง หายใจเข้า!",
    "จังหวะเป๊ะมาก ลุยต่อ!",
    "โฟกัสกล้ามเนื้อ!",
    "อีกทีนึง ฮึบไว้!",
    "เผาผลาญให้กระจาย!",
    "พลังล้นเหลือ ฟอร์มดีมาก!",
    "เพื่อหุ่นเป๊ะ ดันขึ้นมา!"
];

export const TimingBarGame: React.FC<TimingBarGameProps> = ({ 
    duration, 
    timeLeft, 
    onScoreUpdate,
    taskName = "คาร์ดิโอ HIIT",
    percentDone = 0,
    isFinishing = false
}) => {
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    
    // Bar Indicator position (0 to 100%)
    const [position, setPosition] = useState(50);
    // Target zone center position (0 to 100%)
    const [targetCenter, setTargetCenter] = useState(50);
    
    // [MARCUS CRAFT]: Generous & forgiving zone widths for relaxed, intuitive rhythm play
    // Good zone: 38% (±19%) — very forgiving
    // Perfect zone: 18% (±9%) — rewarding sweet spot
    const goodZoneWidth = 38;
    const perfectZoneWidth = 18;

    // Visual feedback & effects
    const [particles, setParticles] = useState<Particle[]>([]);
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const [motivationText, setMotivationText] = useState("แตะหน้าจอตามจังหวะแถบสี!");
    const [isPumping, setIsPumping] = useState(false);

    const animFrameRef = useRef<number | null>(null);
    const particleFrameRef = useRef<number | null>(null);
    const directionRef = useRef<number>(1); // 1 = right, -1 = left
    const posRef = useRef<number>(50);
    // [MARCUS CRAFT]: Relaxed initial speed (0.55) so the rhythm feels natural, not frantic
    const speedRef = useRef<number>(0.55);

    const onScoreUpdateRef = useRef(onScoreUpdate);
    useEffect(() => {
        onScoreUpdateRef.current = onScoreUpdate;
    });

    // Gentle speed progression with combo (caps at 1.15 so it remains easily playable)
    useEffect(() => {
        const comboBonusSpeed = Math.min(0.6, combo * 0.03);
        speedRef.current = 0.55 + comboBonusSpeed;
    }, [combo]);

    // Update Motivation Text periodically
    useEffect(() => {
        const interval = setInterval(() => {
            const randomMsg = GYM_MOTIVATION[Math.floor(Math.random() * GYM_MOTIVATION.length)];
            setMotivationText(randomMsg);
        }, 3500);
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
                        life: p.life - 0.05
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
            if (timeLeft <= 0 || isFinishing) return;

            let nextPos = posRef.current + directionRef.current * speedRef.current;
            if (nextPos >= 96) {
                nextPos = 96;
                directionRef.current = -1;
            } else if (nextPos <= 4) {
                nextPos = 4;
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
    }, [timeLeft, isFinishing]);

    // Particle burst generator
    const triggerParticles = (color: string) => {
        const newParticles: Particle[] = [];
        for (let i = 0; i < 14; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2.5 + 1;
            newParticles.push({
                id: Date.now() + Math.random(),
                x: targetCenter + (Math.random() * 10 - 5),
                y: 50 + (Math.random() * 10 - 5),
                color,
                velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
                life: 1.0
            });
        }
        setParticles(prev => [...prev, ...newParticles]);
    };

    // User Tap Action: Tap ANYWHERE on the screen
    const handleTap = (e?: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
        if (timeLeft <= 0 || isFinishing) return;

        // Visual feedback animation
        setIsPumping(true);
        setTimeout(() => setIsPumping(false), 160);

        // Add ripple effect at tap coordinate
        if (e && 'clientX' in e && e.currentTarget) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const rx = ((e.clientX - rect.left) / rect.width) * 100;
            const ry = ((e.clientY - rect.top) / rect.height) * 100;
            const ripId = Date.now() + Math.random();
            setRipples(prev => [...prev.slice(-2), { id: ripId, x: rx, y: ry }]);
            setTimeout(() => {
                setRipples(prev => prev.filter(r => r.id !== ripId));
            }, 600);
        }

        const currentPos = posRef.current;
        const diff = Math.abs(currentPos - targetCenter);

        const perfectThreshold = perfectZoneWidth / 2; // ±9%
        const goodThreshold = goodZoneWidth / 2;       // ±19%

        let rating: 'PERFECT' | 'GOOD' | 'MISS' = 'MISS';
        let earnedPts = 0;
        let color = '#38bdf8';

        if (diff <= perfectThreshold) {
            rating = 'PERFECT';
            earnedPts = 25;
            color = '#34d399'; // Emerald
            playSfx('level_up');
        } else if (diff <= goodThreshold) {
            rating = 'GOOD';
            earnedPts = 10;
            color = '#fbbf24'; // Amber
            playSfx('bubble_pop');
        } else {
            rating = 'MISS';
            earnedPts = 0;
            color = '#fb7185'; // Soft coral
            playSfx('bubble_wrong');
        }

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

            // [MARCUS CRAFT]: Shift target gently between comfortable 25% to 75% range
            const minTarget = 25;
            const maxTarget = 75;
            let newCenter = Math.floor(minTarget + Math.random() * (maxTarget - minTarget));
            if (Math.abs(newCenter - targetCenter) < 16) {
                newCenter = newCenter < 50 ? newCenter + 24 : newCenter - 24;
            }
            setTargetCenter(newCenter);
        } else {
            // Gentle on miss — don't punish harshly
            setCombo(0);
        }

        // Add Floating text
        const textId = Date.now() + Math.random();
        const textLabel = rating === 'PERFECT' 
            ? '🔥 PERFECT! +25' 
            : rating === 'GOOD' 
            ? '⚡ GOOD! +10' 
            : '💪 ฮึบอีกนิด!';
            
        setFloatingTexts(prev => [...prev.slice(-2), {
            id: textId,
            text: textLabel,
            type: rating,
            x: currentPos,
            y: 40
        }]);

        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(t => t.id !== textId));
        }, 800);
    };

    const isFever = combo >= 5;

    // --- FINISHED STATE ---
    if (isFinishing) {
        return (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white rounded-[2rem] select-none">
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_40px_rgba(52,211,153,0.4)] animate-in zoom-in-75 duration-300">
                    <CheckCircle2 size={56} className="animate-in spin-in-90 duration-500" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight mb-2">WORKOUT COMPLETE!</h2>
                <p className="text-sm font-medium text-slate-400 mb-6">ออกกำลังกายสำเร็จ ได้รับพลังงานและประสบการณ์</p>
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/80 border border-slate-700/80 shadow-lg">
                    <Trophy size={20} className="text-amber-400" />
                    <span className="text-sm font-bold text-slate-200">คะแนนรวม: <strong className="text-amber-400 text-lg font-black">{score}</strong> แต้ม</span>
                </div>
            </div>
        );
    }

    // --- OPEN, UNBOXED, AIRY MINIGAME VIEW ---
    return (
        <div 
            onPointerDown={handleTap}
            className={`
                relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white rounded-[2rem] overflow-hidden select-none touch-none cursor-pointer transition-all duration-200
                ${isPumping ? 'scale-[0.995]' : 'scale-100'}
            `}
        >
            {/* Ambient Gym Spotlights (Soft, No Box Borders) */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${isFever ? 'bg-orange-500/15 opacity-100' : 'bg-emerald-500/5 opacity-50'}`} />

            {/* Tap Ripple Waves */}
            {ripples.map(r => (
                <div
                    key={r.id}
                    className="absolute pointer-events-none rounded-full border border-amber-300/60 bg-amber-400/10 animate-ping duration-500"
                    style={{
                        left: `${r.x}%`,
                        top: `${r.y}%`,
                        width: '80px',
                        height: '80px',
                        marginLeft: '-40px',
                        marginTop: '-40px'
                    }}
                />
            ))}

            {/* Particles Layer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {particles.map(p => (
                    <div
                        key={p.id}
                        className="absolute w-2.5 h-2.5 rounded-full shadow-sm"
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            backgroundColor: p.color,
                            opacity: p.life,
                            transform: `scale(${p.life * 1.5})`
                        }}
                    />
                ))}
            </div>

            {/* TOP HEADER: Clean Title & HUD Stats */}
            <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    {/* Activity Pill */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-sm">
                        <Dumbbell size={15} className="text-amber-400 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-100">{taskName}</span>
                    </div>

                    {/* Score & Combo Badges */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 shadow-sm">
                            <Trophy size={14} className="text-amber-400" />
                            <span className="text-xs font-medium text-slate-300">คะแนน</span>
                            <span className="text-sm font-black text-amber-400">{score}</span>
                        </div>

                        {combo > 0 && (
                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-all animate-bounce ${
                                isFever 
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-300 font-black shadow-lg shadow-orange-500/30' 
                                    : 'bg-orange-500/20 text-orange-300 border-orange-500/40 font-bold'
                            }`}>
                                <Flame size={14} className={isFever ? 'text-slate-950' : 'text-orange-400'} />
                                <span className="text-xs tracking-tight">{combo} COMBO</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Motivational Quote */}
                <div className="text-center pt-2 min-h-[28px]">
                    <p className={`text-base sm:text-lg font-black tracking-tight transition-all duration-300 ${
                        isFever ? 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]' : 'text-slate-200'
                    }`}>
                        {motivationText}
                    </p>
                </div>
            </div>

            {/* MIDDLE: THE RHYTHM TRACK (Spacious, Glassy, Fluid) */}
            <div className="relative z-10 w-full max-w-lg mx-auto my-auto py-6">
                
                {/* Floating Rating Popups */}
                <div className="relative h-10 w-full overflow-visible pointer-events-none">
                    {floatingTexts.map(t => (
                        <div
                            key={t.id}
                            className={`
                                absolute font-black text-base sm:text-lg whitespace-nowrap animate-in zoom-in-75 slide-out-to-top duration-500 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]
                                ${t.type === 'PERFECT' ? 'text-emerald-400' : t.type === 'GOOD' ? 'text-amber-300' : 'text-sky-300'}
                            `}
                            style={{
                                left: `${Math.min(75, Math.max(15, t.x))}%`,
                                transform: 'translateX(-50%)',
                                top: '0%'
                            }}
                        >
                            {t.text}
                        </div>
                    ))}
                </div>

                {/* THE SLEEK TRACK CONTAINER */}
                <div className="relative w-full h-20 bg-white/[0.06] backdrop-blur-xl rounded-full border border-white/15 p-2 overflow-hidden shadow-[inset_0_2px_15px_rgba(0,0,0,0.6)] flex items-center">
                    
                    {/* Outer Good Zone (Amber/Emerald Soft Gradient Glow) */}
                    <div 
                        className="absolute h-[calc(100%-12px)] bg-gradient-to-r from-amber-500/25 via-emerald-500/30 to-amber-500/25 border border-amber-400/40 rounded-full transition-all duration-200 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                        style={{
                            left: `${Math.max(2, targetCenter - goodZoneWidth / 2)}%`,
                            width: `${goodZoneWidth}%`
                        }}
                    >
                        <span className="text-[10px] font-black text-amber-200/90 tracking-widest uppercase hidden sm:inline drop-shadow">GOOD ZONE</span>
                    </div>

                    {/* Inner Perfect Zone (High-Contrast Emerald Pulse) */}
                    <div 
                        className="absolute h-[calc(100%-8px)] bg-emerald-400/90 border-2 border-emerald-100 shadow-[0_0_30px_rgba(52,211,153,0.9)] transition-all duration-200 rounded-full flex items-center justify-center animate-pulse"
                        style={{
                            left: `${Math.max(2, targetCenter - perfectZoneWidth / 2)}%`,
                            width: `${perfectZoneWidth}%`
                        }}
                    >
                        <Sparkles size={16} className="text-white drop-shadow-md animate-spin duration-1000" />
                    </div>

                    {/* Sweeping Indicator Pointer */}
                    <div 
                        className={`
                            absolute top-1 bottom-1 w-4 -ml-2 rounded-full transition-transform duration-75 shadow-[0_0_20px_rgba(255,255,255,1)]
                            ${isPumping 
                                ? 'scale-y-110 bg-white border-2 border-amber-300' 
                                : 'bg-gradient-to-b from-white via-cyan-200 to-white border-2 border-white'
                            }
                        `}
                        style={{
                            left: `${position}%`
                        }}
                    >
                        {/* Top & Bottom Arrow Guides */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-amber-400 rotate-45 border border-white shadow-sm" />
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-amber-400 rotate-45 border border-white shadow-sm" />
                    </div>
                </div>

                {/* Subtext under track */}
                <div className="flex justify-between items-center px-4 mt-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    <span>จังหวะผ่อน</span>
                    <span className="text-amber-300 font-extrabold flex items-center gap-1">
                        <Sparkles size={12} /> เล็งที่สีเขียว
                    </span>
                    <span>จังหวะผ่อน</span>
                </div>
            </div>

            {/* BOTTOM SECTION: Timer & Big Comfortable Tap Surface */}
            <div className="relative z-10 flex flex-col items-center gap-4">
                
                {/* Large Clean Timer */}
                <div className="flex flex-col items-center">
                    <div className="text-4xl sm:text-5xl font-mono font-black tabular-nums tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 drop-shadow-sm">
                        00:{timeLeft.toString().padStart(2, '0')}
                    </div>
                    
                    {/* Smooth Progress Bar */}
                    <div className="w-48 sm:w-64 h-2 bg-white/10 rounded-full overflow-hidden mt-2 border border-white/10">
                        <div 
                            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 transition-all duration-200 ease-linear rounded-full"
                            style={{ width: `${percentDone}%` }}
                        />
                    </div>
                </div>

                {/* Spacious Tap Prompt Banner */}
                <div 
                    className={`
                        w-full max-w-sm py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 border shadow-lg
                        ${isFever
                            ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-slate-950 border-amber-200 shadow-orange-500/30 animate-pulse'
                            : 'bg-white/10 backdrop-blur-md text-white border-white/15 hover:bg-white/15'
                        }
                    `}
                >
                    <Dumbbell size={18} className={`transition-transform duration-200 ${isPumping ? 'rotate-45 scale-125' : ''}`} />
                    <span>{isFever ? 'PUMP NOW! แตะตรงไหนก็ได้ 🔥' : 'แตะที่ใดก็ได้บนหน้าจอเพื่อปั๊มจังหวะ! 💪'}</span>
                </div>
            </div>
        </div>
    );
};

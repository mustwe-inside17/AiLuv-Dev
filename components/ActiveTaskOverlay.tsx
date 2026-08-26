
import React, { useState, useEffect, useRef } from 'react';
import { ActiveTask } from '../types';
import { BubbleGame } from './minigames/BubbleGame';
import { TimingBarGame } from './minigames/TimingBarGame';
import { CheckCircle2 } from 'lucide-react';

interface ActiveTaskOverlayProps {
    activeTask: ActiveTask | null;
    onUpdateScore?: (score: number) => void;
    onComplete?: () => void; // NEW: Callback
}

export const ActiveTaskOverlay: React.FC<ActiveTaskOverlayProps> = ({ activeTask, onUpdateScore, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isFinishing, setIsFinishing] = useState(false);
    const hasCompletedRef = useRef(false);

    useEffect(() => {
        if (!activeTask) { 
            setTimeLeft(0);
            hasCompletedRef.current = false;
            setIsFinishing(false);
            return; 
        }

        // Increased frequency (200ms instead of 500ms) for smoother countdown near zero
        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((activeTask.endTime - Date.now()) / 1000));
            setTimeLeft(remaining);

            // CHECK COMPLETION
            if (remaining <= 0 && !hasCompletedRef.current) {
                hasCompletedRef.current = true;
                setIsFinishing(true);
                clearInterval(interval);
                
                // [MARCUS FIX]: Add 1.5s delay before closing to prevent accidental clicks on buttons below
                setTimeout(() => {
                    if (onComplete) {
                        onComplete();
                    }
                }, 1500);
            }
        }, 200);

        return () => clearInterval(interval);
    }, [activeTask, onComplete]);

    if (!activeTask) return null;

    const totalDuration = activeTask.endTime - activeTask.startTime;
    // Calculate precise percentage based on Date.now() instead of coarse timeLeft
    const percentDone = Math.max(0, Math.min(100, ((Date.now() - activeTask.startTime) / totalDuration) * 100));

    return (
        <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300 rounded-[2rem] overflow-hidden pointer-events-auto select-none touch-none">
            
            {/* --- CLICK PROTECTION LAYER --- */}
            {/* Pointer events set to none so minigame components receive clicks/taps cleanly */}
            <div className="absolute inset-0 z-30 bg-transparent w-full h-full pointer-events-none" />

            <div className={`w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center text-5xl mb-6 shadow-xl shadow-pink-100 dark:shadow-none border-4 border-white dark:border-slate-600 relative z-10 transition-all duration-500 ${isFinishing ? 'scale-125 bg-green-100 border-green-400' : 'animate-bounce'}`}>
                {isFinishing ? <CheckCircle2 size={48} className="text-green-500 animate-in zoom-in spin-in-90 duration-500" /> : (activeTask.type === 'work' ? '💼' : '💪')}
            </div>
            
            <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white mb-2 relative z-10">
                {isFinishing ? "FINISHED!" : activeTask.name}
            </h2>
            
            {/* MINI-GAME SLOT */}
            {!isFinishing && (
                activeTask.type === 'gym' ? (
                    <TimingBarGame 
                        duration={totalDuration}
                        timeLeft={timeLeft}
                        onScoreUpdate={(s) => onUpdateScore?.(s)}
                    />
                ) : (
                    <BubbleGame 
                        taskType={activeTask.type}
                        duration={totalDuration}
                        timeLeft={timeLeft}
                        onScoreUpdate={(s) => onUpdateScore?.(s)}
                    />
                )
            )}

            <div className={`text-5xl font-mono font-bold mb-8 tabular-nums relative z-10 transition-all duration-300 ${isFinishing ? 'text-green-500 scale-110' : timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500'}`}>
                {isFinishing ? "Done!" : `00:${timeLeft.toString().padStart(2, '0')}`}
            </div>
            
            <div className="w-full max-w-xs h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-gray-200 dark:border-slate-700 relative z-10">
                <div className={`h-full transition-all duration-200 ease-linear ${isFinishing ? 'bg-green-500' : 'bg-gradient-to-r from-pink-400 to-purple-500'}`} style={{ width: `${percentDone}%` }}></div>
            </div>
            
            {!isFinishing && <p className="mt-4 text-xs text-gray-400 animate-pulse relative z-10">{activeTask.type === 'gym' ? 'Tap target area for max power!' : 'Tap bubbles for bonus!'}</p>}
        </div>
    );
};


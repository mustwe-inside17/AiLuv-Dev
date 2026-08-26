
import React, { useState } from 'react';
import { Workout, GameState, TimeOfDay } from '../../types';
import { WORKOUT_LIST, LOCATION_IMAGES } from '../../constants';
import { getCharacterImageUrl } from '../../services/firebase';
import { Clock, Zap, Coins, ChevronRight, Timer, ArrowUp } from 'lucide-react';

interface GymViewProps {
    gameState: GameState;
    onStartTask: (type: 'gym', workout: Workout) => void;
    hasSmartHome: boolean;
    isGym: boolean;
    timeOfDay: TimeOfDay;
    onBack: () => void;
}

export const GymView: React.FC<GymViewProps> = ({ gameState, onStartTask, hasSmartHome, isGym, timeOfDay, onBack }) => {
    const isNight = timeOfDay === 'night';
    const [headerUrl, setHeaderUrl] = useState('');

    React.useEffect(() => {
        const load = async () => {
            const path = isNight ? LOCATION_IMAGES.gym_night : LOCATION_IMAGES.gym_day;
            const url = await getCharacterImageUrl(path);
            if (url) setHeaderUrl(url);
        };
        load();
    }, [isNight]);

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-4">
            {/* Header */}
            <div className="relative h-48 rounded-[2rem] border-4 border-white dark:border-slate-800 mb-4 overflow-hidden shadow-lg group">
                {headerUrl ? <img src={headerUrl} alt="Gym" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-500"></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="font-extrabold text-2xl mb-1 drop-shadow-md tracking-tight">Iron Paradise</h3>
                    <p className="text-xs font-medium text-white/80">ออกกำลังกายเพื่อเพิ่มขีดจำกัดพลังงาน (Max Energy)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {WORKOUT_LIST.map(workout => {
                    const cooldownEnd = gameState.workoutCooldowns[workout.id] || 0;
                    const isOnCooldown = Date.now() < cooldownEnd;
                    const timeLeftMs = Math.max(0, cooldownEnd - Date.now());
                    const hoursLeft = Math.floor(timeLeftMs / (1000 * 60 * 60));
                    const minsLeft = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
                    const secsLeft = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

                    return (
                        <button 
                            key={workout.id} 
                            onClick={() => onStartTask('gym', workout)} 
                            disabled={gameState.energy < workout.energyCost || isOnCooldown || (workout.goldCost && gameState.gold < workout.goldCost)} 
                            className={`
                                bg-white dark:bg-slate-800 p-5 rounded-[2rem] border shadow-sm text-left transition-all active:scale-[0.98] group relative overflow-hidden
                                ${isOnCooldown ? 'border-gray-200 dark:border-slate-700 opacity-80' : 'border-orange-50 dark:border-slate-700 hover:border-orange-200 disabled:opacity-50'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl ${isOnCooldown ? 'bg-gray-100 text-gray-400' : 'bg-orange-50 dark:bg-slate-700 text-orange-500'}`}>
                                    {isOnCooldown ? <Clock size={20} /> : '💪'}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex gap-1">
                                        <div className="bg-indigo-50 dark:bg-slate-700 text-indigo-500 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 dark:border-slate-600">
                                            +{workout.expReward} XP
                                        </div>
                                        <div className="bg-green-50 dark:bg-slate-700 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-100 dark:border-slate-600 flex items-center gap-1">
                                            <Zap size={12} /> +{workout.maxEnergyGain} Max
                                        </div>
                                    </div>
                                    {/* Buff Reward Display */}
                                    {workout.buffReward && (
                                        <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 px-3 py-1 rounded-full text-[10px] font-extrabold border border-red-100 dark:border-red-900/30 flex items-center gap-1 animate-pulse">
                                            <ArrowUp size={10} strokeWidth={3} /> Overcharge +{workout.buffReward.value} ({workout.buffReward.durationMinutes/60}h)
                                        </div>
                                    )}
                                </div>
                            </div>
                    
                            <h4 className="font-bold text-gray-800 dark:text-white relative z-10">{workout.name}</h4>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 relative z-10 mt-0.5">{workout.description}</p>
                    
                            {isOnCooldown ? (
                                <div className="mt-2 text-xs font-bold text-red-400 flex items-center gap-1 bg-red-50 dark:bg-slate-900 w-fit px-2 py-1 rounded-lg">
                                    <Timer size={12} /> พักอีก: {hoursLeft > 0 ? `${hoursLeft}ชม. ` : ''}{minsLeft}นาที {secsLeft}วิ
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 mt-2 relative z-10">
                                    <span className="flex items-center gap-1 text-orange-400"><Zap size={12} fill="currentColor" /> -{workout.energyCost}</span>
                                    <span className="flex items-center gap-1 text-blue-400"><Clock size={12} /> {workout.durationSeconds}วิ</span>
                                    {workout.goldCost && (
                                        <span className="flex items-center gap-1 text-yellow-500"><Coins size={12} /> -{workout.goldCost} G</span>
                                    )}
                                </div>
                            )}

                            {isOnCooldown && <div className="absolute inset-0 bg-gray-50/50 dark:bg-slate-900/50 z-0"></div>}
                        </button>
                    );
                })}
            </div>

            {hasSmartHome && !isGym && (
                <button onClick={onBack} className="w-full py-3 text-gray-400 font-bold flex items-center justify-center gap-2 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <ChevronRight className="rotate-180" size={16}/> กลับหน้าโปรไฟล์
                </button>
            )}
        </div>
    );
};

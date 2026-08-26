
import React, { useState } from 'react';
import { Job, GameState, TimeOfDay } from '../../types';
import { JOBS_LIST, LOCATION_IMAGES } from '../../constants';
import { getCharacterImageUrl } from '../../services/firebase';
import { Clock, Zap, Coins, ChevronRight, Timer, Crown, Lock } from 'lucide-react';

interface WorkViewProps {
    gameState: GameState;
    onStartTask: (type: 'work', job: Job) => void; // Specific type
    onChat?: () => void;
    hasSmartHome: boolean;
    isOffice: boolean;
    timeOfDay: TimeOfDay;
    onBack: () => void;
}

export const WorkView: React.FC<WorkViewProps> = ({ gameState, onStartTask, onChat, hasSmartHome, isOffice, timeOfDay, onBack }) => {
    const isNight = timeOfDay === 'night';
    const [headerUrl, setHeaderUrl] = useState('');

    const currentWorkCount = gameState.totalWorkCount || 0;
    const WORK_REQ = 10;
    const isVipUnlocked = currentWorkCount >= WORK_REQ;

    React.useEffect(() => {
        const load = async () => {
            const path = isNight ? LOCATION_IMAGES.office_night : LOCATION_IMAGES.office_day;
            const url = await getCharacterImageUrl(path);
            if (url) setHeaderUrl(url);
        };
        load();
    }, [isNight]);

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-4">
            {/* Header */}
            <div className="relative h-48 rounded-[2rem] border-4 border-white dark:border-slate-800 mb-4 overflow-hidden shadow-lg group">
                {headerUrl ? <img src={headerUrl} alt="Office" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600"></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="font-extrabold text-2xl mb-1 drop-shadow-md tracking-tight">Co-Working Space</h3>
                    <p className="text-xs font-medium text-white/80">ทำงานเก็บเงิน เพื่ออนาคตที่สดใส</p>
                </div>
            </div>

            {/* VIP Access Button (Only in Office) */}
            {isOffice && (
                <button 
                    onClick={isVipUnlocked ? onChat : undefined}
                    className={`w-full p-4 rounded-[2rem] border shadow-lg shadow-black/20 mb-2 transition-all group flex items-center justify-between ${isVipUnlocked ? 'bg-gradient-to-r from-gray-900 to-slate-800 text-yellow-400 border-yellow-500/30 active:scale-95' : 'bg-gray-100 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 cursor-not-allowed'}`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${isVipUnlocked ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400 group-hover:bg-yellow-400/20' : 'bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-400'}`}>
                            {isVipUnlocked ? <Crown size={24} className="drop-shadow-md" /> : <Lock size={24} />}
                        </div>
                        <div className="text-left">
                            <h3 className={`font-extrabold text-lg ${isVipUnlocked ? 'text-white' : 'text-gray-400 dark:text-slate-500'}`}>VIP Access</h3>
                            <p className={`text-xs font-bold ${isVipUnlocked ? 'text-gray-400' : 'text-red-500'}`}>
                                {isVipUnlocked ? "เข้าพบ CEO มาร์คัส" : `เงื่อนไข: ทำงานครบ ${currentWorkCount}/${WORK_REQ} ครั้ง`}
                            </p>
                        </div>
                    </div>
                    {isVipUnlocked ? (
                        <ChevronRight className="text-gray-500 group-hover:text-white transition-colors" />
                    ) : (
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded-lg border border-gray-300 dark:border-slate-600">Locked</div>
                    )}
                </button>
            )}

            {/* Job List */}
            <div className="grid grid-cols-1 gap-3">
                {JOBS_LIST.map(job => {
                    const intBonusPercent = (gameState.stats.int - 1) * 0.02; 
                    const bonusAmount = Math.floor(job.goldReward * intBonusPercent);
                    const totalReward = job.goldReward + bonusAmount;

                    const hasFastHand = gameState.activeBuffs.some(b => b.type === 'fast_hand');
                    const effectiveDuration = hasFastHand ? Math.max(5, job.durationSeconds - 5) : job.durationSeconds;

                    const cooldownEnd = gameState.jobCooldowns?.[job.id] || 0;
                    const isOnCooldown = Date.now() < cooldownEnd;
                    const timeLeftMs = Math.max(0, cooldownEnd - Date.now());
                    const hoursLeft = Math.floor(timeLeftMs / (1000 * 60 * 60));
                    const minsLeft = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
                    const secsLeft = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

                    return (
                        <button 
                            key={job.id} 
                            onClick={() => onStartTask('work', job)} 
                            disabled={gameState.energy < job.energyCost || isOnCooldown} 
                            className={`bg-white dark:bg-slate-800 p-5 rounded-[2rem] border shadow-sm text-left transition-all active:scale-[0.98] disabled:opacity-50 group relative overflow-hidden ${isOnCooldown ? 'border-gray-200 dark:border-slate-700 opacity-80' : 'border-blue-50 dark:border-slate-700 hover:border-blue-200 dark:hover:border-slate-600'}`}
                        >
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl ${isOnCooldown ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 dark:bg-slate-700 text-blue-500'}`}>
                                    {isOnCooldown ? <Clock size={20} /> : '💼'}
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="bg-indigo-50 dark:bg-slate-700 text-indigo-500 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 dark:border-slate-600">
                                        +{job.expReward} XP
                                    </div>
                                    <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 dark:border-yellow-700 flex items-center gap-1">
                                        <Coins size={12} className="fill-yellow-500" /> 
                                        <span>+{totalReward}</span>
                                        {bonusAmount > 0 && <span className="text-[9px] opacity-80">(+{bonusAmount} โบนัส)</span>}
                                    </div>
                                </div>
                            </div>
                    
                            <h4 className="font-bold text-gray-800 dark:text-white relative z-10">{job.name}</h4>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 relative z-10 mt-0.5">{job.description}</p>
                    
                            {isOnCooldown ? (
                                <div className="mt-2 text-xs font-bold text-red-400 flex items-center gap-1 bg-red-50 dark:bg-slate-900 w-fit px-2 py-1 rounded-lg">
                                    <Timer size={12} /> พักอีก: {hoursLeft > 0 ? `${hoursLeft}ชม. ` : ''}{minsLeft}นาที {secsLeft}วิ
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 mt-2 relative z-10">
                                    <span className="flex items-center gap-1 text-orange-400"><Zap size={12} fill="currentColor" /> -{job.energyCost}</span>
                                    <span className="flex items-center gap-1 text-blue-400">
                                        <Clock size={12} /> 
                                        {hasFastHand && <span className="line-through opacity-50 mr-1">{job.durationSeconds}s</span>}
                                        {effectiveDuration}วิ
                                    </span>
                                </div>
                            )}

                            {isOnCooldown && <div className="absolute inset-0 bg-gray-50/50 dark:bg-slate-900/50 z-0"></div>}
                        </button>
                    );
                })}
            </div>

            {hasSmartHome && !isOffice && (
                <button onClick={onBack} className="w-full py-3 text-gray-400 font-bold flex items-center justify-center gap-2 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <ChevronRight className="rotate-180" size={16}/> กลับหน้าโปรไฟล์
                </button>
            )}
        </div>
    );
};

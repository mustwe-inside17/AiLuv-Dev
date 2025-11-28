
import React, { useState, useEffect } from 'react';
import { GameState, Job, ShopItem, Workout, UserProfile } from '../types';
import { JOBS_LIST, SHOP_ITEMS, WORKOUT_LIST } from '../constants';
import { Zap, MessageSquare, Activity, User, Briefcase, ShoppingBag, Dumbbell, Clock, Coins, Key, Lock } from 'lucide-react';

interface PlayerStatsProps {
  gameState: GameState;
  onStartTask?: (type: 'work' | 'gym', item: Job | Workout) => void;
  onBuyItem?: (item: ShopItem) => void;
  userProfile: UserProfile | null;
  viewMode?: 'full' | 'location_context';
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ gameState, onStartTask, onBuyItem, userProfile, viewMode = 'full' }) => {
  const isContextMode = viewMode === 'location_context';
  const isOffice = isContextMode && gameState.currentLocation === 'office';
  const isCafe = isContextMode && gameState.currentLocation === 'cafe';
  const isGym = isContextMode && gameState.currentLocation === 'gym'; 

  const [activeTab, setActiveTab] = useState<'profile' | 'work' | 'shop' | 'gym'>(
    isOffice ? 'work' : isCafe ? 'shop' : isGym ? 'gym' : 'profile'
  );
  
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  useEffect(() => {
    if (!gameState.activeTask) { setTimeLeft(0); return; }
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((gameState.activeTask!.endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    }, 500);
    return () => clearInterval(interval);
  }, [gameState.activeTask]);

  const addFloatingText = (e: React.MouseEvent, text: string, color: string) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const newText = { id: Date.now(), text, x: e.clientX, y: e.clientY, color };
    setFloatingTexts(prev => [...prev, newText]);
    setTimeout(() => { setFloatingTexts(prev => prev.filter(t => t.id !== newText.id)); }, 1000);
  };

  const handleStartWork = (e: React.MouseEvent, job: Job) => {
    if (gameState.energy < job.energyCost) return;
    addFloatingText(e, `-${job.energyCost}⚡`, 'text-orange-500');
    onStartTask?.('work', job);
  };

  const handleBuy = (e: React.MouseEvent, item: ShopItem) => {
    if (gameState.gold < item.cost) return;
    addFloatingText(e, `-${item.cost} G`, 'text-yellow-600');
    if (item.energyRestore > 0) setTimeout(() => addFloatingText(e, `+${item.energyRestore}⚡`, 'text-green-500'), 200);
    else setTimeout(() => addFloatingText(e, `ITEM UNLOCKED`, 'text-pink-500'), 200);
    onBuyItem?.(item);
  };

  const handleStartGym = (e: React.MouseEvent, workout: Workout) => {
    if (gameState.energy < workout.energyCost) return;
    addFloatingText(e, `-${workout.energyCost}⚡`, 'text-orange-500');
    onStartTask?.('gym', workout);
  };

  const renderActiveTaskOverlay = () => {
    if (!gameState.activeTask) return null;
    const percentDone = Math.max(0, Math.min(100, (1 - (timeLeft * 1000) / (gameState.activeTask.endTime - gameState.activeTask.startTime)) * 100));
    return (
      <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300 rounded-[2rem]">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center text-5xl mb-6 animate-bounce shadow-xl shadow-pink-100 border-4 border-white">{gameState.activeTask.type === 'work' ? '💼' : '💪'}</div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">{gameState.activeTask.name}</h2>
        <div className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-gray-500 mb-8">IN PROGRESS...</div>
        <div className="text-5xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-8 tabular-nums">00:{timeLeft.toString().padStart(2, '0')}</div>
        <div className="w-full max-w-xs h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200"><div className="h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-500 ease-linear" style={{ width: `${percentDone}%` }}></div></div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white border border-pink-100 rounded-[2rem] p-6 shadow-sm flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-tr from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center text-pink-500 font-bold text-3xl shadow-inner border border-white">{userProfile?.name?.charAt(0).toUpperCase() || <User size={30}/>}</div>
          <div><h3 className="font-extrabold text-2xl text-gray-800 tracking-tight">{userProfile?.name || 'Guest'}</h3><p className="text-sm text-gray-400 font-medium">{userProfile?.interests || 'No interests set'}</p><div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wide">Age: {userProfile?.age || '?'}</div></div>
      </div>
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-6 shadow-xl shadow-indigo-200 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl font-extrabold border border-white/30">{gameState.level}</div>
          <div><div className="text-indigo-200 text-xs uppercase tracking-widest font-bold">Current Level</div><div className="text-xl font-bold">City Dweller</div></div>
        </div>
        <div className="flex justify-between items-center bg-black/20 backdrop-blur-sm rounded-2xl p-4 mb-2 border border-white/10">
           <div className="flex items-center gap-3"><div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 shadow-lg"><Coins size={20} fill="currentColor" /></div><div><div className="text-[10px] text-indigo-200 uppercase font-bold">Wallet</div><span className="font-bold text-lg">{gameState.gold} G</span></div></div>
           <div className="w-px h-8 bg-white/20"></div>
           <div className="flex items-center gap-3"><div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-orange-900 shadow-lg"><Zap size={20} fill="currentColor" /></div><div><div className="text-[10px] text-indigo-200 uppercase font-bold">Energy</div><span className="font-bold text-lg">{Math.floor(gameState.energy)} / {gameState.maxEnergy}</span></div></div>
        </div>
      </div>
    </div>
  );

  const renderWork = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-5 rounded-[2rem] flex items-center justify-between border border-yellow-100 shadow-sm"><span className="text-yellow-700 font-bold flex items-center gap-2"><Coins size={20}/> Your Wallet</span><span className="text-3xl font-extrabold text-yellow-600 drop-shadow-sm">{gameState.gold} G</span></div>
      <h3 className="text-lg font-bold text-gray-700 px-2">Available Jobs</h3>
      {JOBS_LIST.map(job => (
        <button key={job.id} onClick={(e) => handleStartWork(e, job)} disabled={gameState.energy < job.energyCost} className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-pink-200 hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none group">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors"><Briefcase size={24} /></div>
            <div><div className="font-bold text-gray-800 text-lg">{job.name}</div><div className="text-xs text-gray-400 flex items-center gap-3 mt-1 font-medium"><span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md"><Clock size={12} /> {job.durationSeconds}s</span><span className="flex items-center gap-1 bg-orange-50 text-orange-500 px-2 py-0.5 rounded-md"><Zap size={12} /> -{job.energyCost}</span></div></div>
          </div>
          <div className="font-bold text-yellow-600 bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-100 group-hover:bg-yellow-100">+{job.goldReward} G</div>
        </button>
      ))}
    </div>
  );

  const renderShop = () => (
     <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-[2rem] flex items-center justify-between border border-green-100 shadow-sm"><span className="text-green-700 font-bold flex items-center gap-2"><Zap size={20}/> Energy</span><span className="text-3xl font-extrabold text-green-600 drop-shadow-sm">{Math.floor(gameState.energy)}</span></div>
       <h3 className="text-lg font-bold text-gray-700 px-2">Daily Items</h3>
       <div className="grid grid-cols-2 gap-3">
        {SHOP_ITEMS.filter(i => !i.unlocksTier).map(item => (
          <button key={item.id} onClick={(e) => handleBuy(e, item)} disabled={gameState.gold < item.cost || gameState.energy >= gameState.maxEnergy} className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center gap-2 hover:border-green-200 hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:grayscale group">
            <div className="text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">{item.emoji}</div>
            <div className="font-bold text-gray-800">{item.name}</div>
            <div className="text-xs text-white bg-green-400 px-2 py-1 rounded-md font-bold shadow-sm shadow-green-200">+{item.energyRestore} Energy</div>
            <div className="w-full mt-3 bg-gray-50 text-gray-600 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1 group-hover:bg-yellow-400 group-hover:text-white transition-colors">{item.cost} G</div>
          </button>
        ))}
       </div>

       <h3 className="text-lg font-bold text-gray-700 px-2 mt-4 flex items-center gap-2"><Key size={20} className="text-purple-500"/> Special Gifts (Unlock Levels)</h3>
       <div className="grid grid-cols-1 gap-3">
        {SHOP_ITEMS.filter(i => i.unlocksTier).map(item => (
           <button key={item.id} onClick={(e) => handleBuy(e, item)} disabled={gameState.gold < item.cost} className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-[2rem] border border-pink-100 shadow-sm flex items-center gap-4 hover:border-purple-300 hover:shadow-lg transition-all disabled:opacity-50 disabled:grayscale">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-sm">{item.emoji}</div>
               <div className="flex-1 text-left">
                  <div className="font-bold text-gray-800">{item.name}</div>
                  <div className="text-[10px] text-purple-500 font-bold uppercase tracking-wide mt-1 bg-white inline-block px-2 py-1 rounded-md border border-purple-100">{item.description}</div>
                  <div className="mt-2 font-extrabold text-yellow-600">{item.cost} G</div>
               </div>
               <div className="bg-white p-3 rounded-full shadow-sm text-gray-300"><Lock size={20}/></div>
           </button>
        ))}
       </div>
    </div>
  );

  const renderGym = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-gradient-to-r from-red-50 to-rose-50 p-5 rounded-[2rem] flex items-center justify-between border border-red-100 shadow-sm"><span className="text-red-700 font-bold flex items-center gap-2"><Activity size={20}/> Max Energy</span><span className="text-3xl font-extrabold text-red-600 drop-shadow-sm">{gameState.maxEnergy}</span></div>
      {WORKOUT_LIST.map(workout => (
        <button key={workout.id} onClick={(e) => handleStartGym(e, workout)} disabled={gameState.energy < workout.energyCost} className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-pink-200 hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none group">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center group-hover:bg-red-100 transition-colors"><Dumbbell size={24} /></div>
            <div><div className="font-bold text-gray-800 text-lg">{workout.name}</div><div className="text-xs text-gray-400 flex items-center gap-3 mt-1 font-medium"><span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md"><Clock size={12} /> {workout.durationSeconds}s</span><span className="flex items-center gap-1 bg-orange-50 text-orange-500 px-2 py-0.5 rounded-md"><Zap size={12} /> -{workout.energyCost}</span></div></div>
          </div>
          <div className="font-bold text-white bg-red-400 px-4 py-2 rounded-xl text-xs shadow-md shadow-red-200 group-hover:bg-red-500">+ {workout.maxEnergyGain} Max Energy</div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {renderActiveTaskOverlay()}
      {floatingTexts.map(ft => ( <div key={ft.id} className={`fixed pointer-events-none font-bold text-xl animate-pop-text z-[100] ${ft.color}`} style={{ left: ft.x, top: ft.y }}>{ft.text}</div>))}
      {!isContextMode && (
        <div className="flex p-4 gap-2 overflow-x-auto no-scrollbar border-b border-gray-100 bg-white/80 backdrop-blur-md z-10 flex-none sticky top-0">
          <button onClick={() => setActiveTab('profile')} className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'profile' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200 scale-105' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}><User size={16}/> Profile</button>
          <button onClick={() => setActiveTab('work')} className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'work' ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-200 scale-105' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}><Briefcase size={16}/> Work</button>
          <button onClick={() => setActiveTab('shop')} className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'shop' ? 'bg-green-500 text-white shadow-lg shadow-green-200 scale-105' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}><ShoppingBag size={16}/> Shop</button>
          <button onClick={() => setActiveTab('gym')} className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'gym' ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-105' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}><Dumbbell size={16}/> Gym</button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-2">
        {activeTab === 'profile' && renderProfile()}
        {(activeTab === 'work' || isOffice) && renderWork()}
        {(activeTab === 'shop' || isCafe) && renderShop()}
        {(activeTab === 'gym' || (isGym && isContextMode)) && renderGym()}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Zap, Plus, Crown, Backpack, Smartphone } from 'lucide-react';
import { TimeOfDay, ActiveBuff, UserProfile } from '../types';
import { useGameStore } from '../store/gameStore';
import { AnimatedIcon } from './AnimatedIcon';
import { getCharacterImageUrl } from '../services/firebase';
import { useShallow } from 'zustand/react/shallow';

interface StatusBarProps {
  energy: number;
  maxEnergy: number;
  level: number;
  currentExp: number;
  requiredExp: number;
  gold: number;
  diamonds?: number;
  timeOfDay: TimeOfDay;
  activeBuffs?: ActiveBuff[];
  userProfile?: UserProfile | null;
  onOpenDiamondShop?: () => void;
  onOpenInventory?: () => void;
  onTogglePhone?: () => void;
}

const AVATAR_MAP: Record<string, string> = {
  'male': 'avatars/male.png',
  'male2': 'avatars/male2.png',
  'male3': 'avatars/male3.png',
  'male4': 'avatars/male4.png',
  'female': 'avatars/female.png',
  'female2': 'avatars/female2.png',
  'female3': 'avatars/female3.png',
  'female4': 'avatars/female4.png',
  'female5': 'avatars/female5.png',
};

export const StatusBar: React.FC<StatusBarProps> = ({ energy, maxEnergy, level, currentExp, requiredExp, gold, diamonds = 0, userProfile, activeBuffs = [], onOpenDiamondShop, onOpenInventory, onTogglePhone }) => {
  const energyPercent = Math.max(0, Math.min((energy / maxEnergy) * 100, 100));
  const expPercent = Math.max(0, Math.min((currentExp / requiredExp) * 100, 100));
  const isOvercharged = energy > maxEnergy;
  
  const { isVip, togglePhone, unreadSocialPosts, mails, inventory, dailyLogin } = useGameStore(useShallow(state => ({
    isVip: state.isVip,
    togglePhone: state.togglePhone,
    unreadSocialPosts: state.unreadSocialPosts,
    mails: state.mails,
    inventory: state.inventory,
    dailyLogin: state.dailyLogin
  })));
  const [realisticAvatarUrl, setRealisticAvatarUrl] = useState<string | null>(null);

  // Phone notifications count
  const todayStr = new Date().toDateString();
  const hasDailyClaim = dailyLogin?.lastClaimDate !== todayStr;
  const unreadMailsCount = (mails || []).filter(m => !m.isRead || (m.rewards && !m.isClaimed)).length;
  const unreadPostsCount = typeof unreadSocialPosts === 'number' ? unreadSocialPosts : 0;
  const phoneBadgeCount = unreadMailsCount + unreadPostsCount + (hasDailyClaim ? 1 : 0);

  // Inventory total items count
  const totalInventoryCount = Object.values(inventory || {}).reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    const fetchAvatar = async () => {
      const config = userProfile?.avatarConfig;
      if (config?.mode === 'realistic' && config.realisticId) {
         const path = AVATAR_MAP[config.realisticId];
         if (path) {
             const url = await getCharacterImageUrl(path);
             if (url) setRealisticAvatarUrl(url);
         }
      }
    };
    fetchAvatar();
  }, [userProfile?.avatarConfig]);

  const getAvatarUrl = () => {
      const config = userProfile?.avatarConfig;
      if (config?.mode === 'realistic' && realisticAvatarUrl) {
          return realisticAvatarUrl;
      }
      const seed = config?.cartoonSeed || userProfile?.name || 'Player';
      const bg = config?.cartoonColor || 'b6e3f4';
      return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=${bg}`;
  };

  const circleRadius = 12;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleOffset = circleCircumference - (expPercent / 100) * circleCircumference;

  return (
    <div className="relative z-[60] w-full pt-safe transition-all duration-300 pointer-events-none pb-0 font-sans">
        {/* SINGLE ROW HUD */}
        <div className="flex justify-between items-center w-full px-1 sm:px-2 pt-1.5 sm:pt-2 gap-1 sm:gap-1.5 overflow-hidden">
            
            {/* LEFT: Profile and level */}
            <div className="resource-chip pointer-events-auto flex items-center gap-1 sm:gap-1.5 rounded-xl p-0.5 pr-1.5 sm:pr-2.5 shadow-sm shrink-0 transition-transform active:scale-95">
                
                <div className="relative w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] flex items-center justify-center shrink-0">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 28 28">
                        <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2" fill="none" className="text-white/60 dark:text-slate-800/60" />
                    </svg>
                    <svg className="absolute inset-0 w-full h-full -rotate-90 overflow-visible" viewBox="0 0 28 28">
                        <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2" fill="none" 
                            strokeDasharray={circleCircumference} 
                            strokeDashoffset={circleOffset}
                            className="text-indigo-500 shadow-xl transition-all duration-1000 ease-out" strokeLinecap="round" />
                    </svg>

                    <div className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-inner z-10 flex items-center justify-center">
                        <img src={getAvatarUrl()} alt="Avatar" className="w-full h-full object-cover" />
                    </div>

                    {isVip && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-[1.5px] shadow-sm z-20 border border-yellow-200">
                             <Crown size={6} className="text-white fill-white" />
                        </div>
                    )}
                </div>

                <div className="flex flex-row items-center justify-center gap-[3px] sm:gap-[4px] pl-0.5">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-white leading-none tracking-tight max-w-[42px] sm:max-w-[70px] truncate">{userProfile?.name || 'Player'}</span>
                    <div className="w-[1px] h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-300 tracking-wide leading-none">Lv.<span className="ml-[1px]">{level}</span></span>
                </div>
            </div>

            {/* RIGHT: Resources List */}
            <div className="pointer-events-auto flex items-center justify-end gap-0.5 sm:gap-1 shrink-0 overflow-visible">
                
                {/* Energy */}
                <div className={`resource-chip flex items-center rounded-xl p-0.5 shadow-sm shrink min-w-0 transition-colors duration-300 ${
                    isOvercharged 
                    ? 'border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)] ring-1 ring-red-400/50 scale-105' 
                    : ''
                }`}>
                    <div className={`p-0.5 sm:p-1 rounded-full flex items-center justify-center shrink-0 ${isOvercharged ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-orange-500/20'}`}>
                        <Zap size={11} className={isOvercharged ? "text-white fill-white" : "text-orange-500 fill-orange-500"} />
                    </div>
                    <span className={`text-[11px] font-extrabold pl-1 pr-1.5 leading-none truncate transition-colors duration-300 ${
                        isOvercharged 
                        ? 'text-red-600 dark:text-red-400 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]' 
                        : 'text-slate-800 dark:text-white'
                    }`}>
                        {Math.floor(energy)}<span className={`text-[10px] font-medium ${isOvercharged ? 'text-red-500/80' : 'game-muted'}`}>/{Math.floor(maxEnergy)}</span>
                    </span>
                </div>

                {/* Gold */}
                <div className="resource-chip flex items-center rounded-xl p-0.5 shadow-sm shrink min-w-0">
                    <div className="p-0.5 sm:p-1 rounded-full flex items-center justify-center bg-yellow-400/20 shrink-0">
                        <AnimatedIcon type="coin" size={11} />
                    </div>
                    <span className="text-[11px] font-extrabold pl-1 pr-1.5 leading-none text-slate-800 dark:text-white truncate">
                        {Math.floor(gold).toLocaleString()}
                    </span>
                </div>

                {/* Diamond */}
                <button type="button" aria-label={`เพชร ${diamonds.toLocaleString()} เปิดร้านเพชร`} className="resource-chip flex items-center rounded-xl p-0.5 shadow-sm shrink min-w-0 cursor-pointer hover:border-cyan-500 transition-colors" onClick={onOpenDiamondShop}>
                    <div className="p-0.5 sm:p-1 rounded-full flex items-center justify-center bg-cyan-400/20 shrink-0">
                        <AnimatedIcon type="gem" size={11} />
                    </div>
                    <span className="text-[11px] font-extrabold px-0.5 sm:px-1 leading-none text-slate-800 dark:text-white truncate">
                        {diamonds.toLocaleString()}
                    </span>
                    <span className="w-[18px] h-[18px] bg-cyan-600 text-white rounded-md flex items-center justify-center shadow-sm shrink-0">
                        <Plus size={9} strokeWidth={3} />
                    </span>
                </button>

                {/* Inventory Button */}
                <button 
                    onClick={onOpenInventory} 
                    className="game-icon-button game-panel relative rounded-xl flex items-center justify-center shadow-sm shrink-0 active:scale-95 transition-all"
                    title="กระเป๋าเดินทาง (Inventory)"
                >
                    <Backpack size={14} className="text-slate-700 dark:text-slate-200" />
                    {totalInventoryCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-900" />
                    )}
                </button>

                {/* Phone Button */}
                <button 
                    onClick={onTogglePhone || togglePhone} 
                    className="game-icon-button game-panel relative rounded-xl flex items-center justify-center shadow-sm shrink-0 active:scale-95 transition-all"
                    title="โทรศัพท์ (A-Phone)"
                >
                    <Smartphone size={14} className="text-slate-700 dark:text-slate-200" />
                    {phoneBadgeCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] sm:text-[9px] font-black px-0.5 sm:px-1 min-w-[12px] h-[12px] sm:min-w-[14px] sm:h-[14px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                            {phoneBadgeCount > 9 ? '9+' : phoneBadgeCount}
                        </span>
                    )}
                </button>

            </div>
        </div>

    </div>
  );
};

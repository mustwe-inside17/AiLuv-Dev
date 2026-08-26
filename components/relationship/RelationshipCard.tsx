
import React, { useState, useEffect } from 'react';
import { CharacterId, RelationshipTier } from '../../types';
import { CHARACTER_DATA, LOCATIONS } from '../../constants';
import { getCharacterImageUrl } from '../../services/firebase';
import { HelpCircle, MapPin, Lock, ChevronRight, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { getTierColor, getTierInfo } from '../../utils/relationshipLogic';
import { TransitionImage } from '../ui/TransitionImage';

interface RelationshipCardProps {
    id: CharacterId;
    isMet: boolean;
    loveScore: number;
    tier: RelationshipTier;
    onSelect: (id: CharacterId) => void;
    // New Props for Secrets
    unlockedSecretsCount: number;
    totalSecretsCount: number;
}

export const RelationshipCard: React.FC<RelationshipCardProps> = ({ 
    id, isMet, loveScore, tier, onSelect, 
    unlockedSecretsCount, totalSecretsCount 
}) => {
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const data = CHARACTER_DATA[id];
    
    // FAILSAFE UNLOCK LOGIC: Unlock if Met OR Score >= 100
    const isUnlocked = isMet || loveScore >= 100;

    useEffect(() => {
        if (!isUnlocked) return;
        const load = async () => {
             const path = data.baseImg; 
             if (path) {
                 const url = path.startsWith('http') ? path : await getCharacterImageUrl(path);
                 if (url) setAvatarUrl(url);
             }
        };
        load();
    }, [id, isUnlocked]);

    // LOCKED STATE (Fog of War)
    if (!isUnlocked) {
        const location = Object.values(LOCATIONS).find(l => l.characterId === id);
        return (
            <div className="w-full h-full bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 flex items-center gap-4 opacity-60">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-400 dark:text-slate-500 shrink-0">
                    <HelpCircle size={28} />
                </div>
                <div className="flex-1 text-left min-w-0">
                     <h3 className="font-bold text-lg text-gray-400 dark:text-slate-400">???</h3>
                     <div className="text-xs font-bold uppercase text-gray-300 dark:text-slate-500">Unknown</div>
                     <div className="flex items-center gap-1 text-[10px] text-pink-400 dark:text-pink-300 font-bold italic mt-1 bg-pink-50 dark:bg-slate-700 w-fit px-2 py-0.5 rounded-md truncate max-w-full">
                        <MapPin size={10} className="shrink-0" /> <span className="truncate">Visit {location?.name || 'Location'}</span>
                     </div>
                </div>
                <div className="p-2 text-gray-300 dark:text-slate-600"><Lock size={20} /></div>
            </div>
        );
    }

    // UNLOCKED STATE
    const { isLocked } = getTierInfo(tier, loveScore);
    const isSecretComplete = totalSecretsCount > 0 && unlockedSecretsCount === totalSecretsCount;

    return (
      <button onClick={() => onSelect(id)} className="w-full h-full bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:shadow-lg hover:border-pink-200 dark:hover:border-slate-500 hover:scale-[1.02] transition-all group duration-300 relative overflow-hidden">
        
        {/* Glow effect for completed collection */}
        {isSecretComplete && <div className="absolute top-0 right-0 p-8 bg-yellow-400/10 rounded-bl-full z-0 pointer-events-none"></div>}

        <div className="relative shrink-0 z-10">
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 shadow-sm ${isLocked ? 'border-red-400' : isSecretComplete ? 'border-yellow-400' : 'border-white dark:border-slate-600 group-hover:border-pink-200 dark:group-hover:border-slate-500 transition-colors'}`}>
                {avatarUrl ? (
                    <TransitionImage 
                        src={avatarUrl} 
                        alt={data.name} 
                        className={`w-full h-full object-cover ${isLocked ? 'grayscale-[50%]' : ''}`} 
                        placeholderColor="rgba(200,200,200,0.2)"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-slate-700 animate-pulse"></div>
                )}
            </div>
            {isLocked && <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-1 border-2 border-white"><Lock size={12} /></div>}
        </div>
        
        <div className="flex-1 text-left min-w-0 z-10">
             <div className="flex justify-between items-center">
                 <h3 className={`font-bold text-lg truncate ${data.color}`}>{data.name}</h3>
             </div>
             
             <div className={`text-xs font-extrabold uppercase mb-1 flex items-center gap-2 truncate ${getTierColor(tier)}`}>
                {tier.replace('_', ' ')}
             </div>
             
             <div className="flex items-center gap-2 mt-1">
                {/* Score Badge */}
                <div className="text-[10px] text-gray-400 dark:text-slate-400 font-medium bg-gray-50 dark:bg-slate-900/50 px-2 py-0.5 rounded-lg border border-gray-100 dark:border-slate-700">
                    Score: {Math.floor(loveScore).toLocaleString()}
                </div>
             </div>
        </div>

        {/* SECRET ALBUM BADGE (The Requested Feature) */}
        {totalSecretsCount > 0 && (
            <div className="flex flex-col items-end justify-center pl-2 border-l border-gray-100 dark:border-slate-700 z-10">
                <div className={`flex flex-col items-center justify-center p-1.5 rounded-xl border ${isSecretComplete ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' : 'bg-gray-50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-700'}`}>
                    {isSecretComplete ? (
                        <CheckCircle2 size={14} className="text-yellow-500 mb-0.5" />
                    ) : (
                        <ImageIcon size={14} className={`${unlockedSecretsCount > 0 ? 'text-pink-400' : 'text-gray-300 dark:text-slate-600'} mb-0.5`} />
                    )}
                    <span className={`text-[9px] font-black ${isSecretComplete ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {unlockedSecretsCount}/{totalSecretsCount}
                    </span>
                </div>
                <div className="text-[8px] font-bold text-gray-300 dark:text-slate-600 uppercase tracking-wide mt-1">
                    Secret
                </div>
            </div>
        )}

        {/* Chevron only shows if no secrets or space permits, essentially replacing it with the stats block */}
        {totalSecretsCount === 0 && (
            <div className="text-gray-300 dark:text-slate-600">
                <ChevronRight size={20} />
            </div>
        )}

      </button>
    );
};

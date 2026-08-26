
import React, { useState, useEffect, useRef } from 'react';
import { Mood, ActionEvent, CharacterId, DateScene } from '../types';
import { CHARACTER_DATA } from '../constants';
import { getCharacterImageUrl, checkUrlCache } from '../services/firebase';
import { Heart, Lock, Sparkles } from 'lucide-react';

interface CharacterViewProps {
  characterId: CharacterId;
  mood: Mood;
  isLoading: boolean;
  lastAction: ActionEvent | null;
  disabled: boolean;
  customImagePath?: string; 
  isRoomMode?: boolean; 
  isCasualMode?: boolean; 
  dateScene?: DateScene | null;
}

// 4 Stages of Image Loading (The Waterfall)
type LoadStage = 'MOOD_VAR' | 'MOOD_BASE' | 'NEUTRAL_VAR' | 'NEUTRAL_BASE';

// [MARCUS FIX]: List of Date Scenes that actually have dedicated asset folders
const ASSET_SUPPORTED_SCENES = ['rooftop_dining', 'secret_bar', 'car', 'character_home'];

export const CharacterView: React.FC<CharacterViewProps> = ({ characterId, mood, isLoading, lastAction, disabled, customImagePath, isRoomMode = false, isCasualMode = false, dateScene }) => {
  const charData = CHARACTER_DATA[characterId];
  
  const isHomeDate = dateScene?.type === 'character_home';
  const allowIntimacy = isRoomMode || isHomeDate;
  
  const safeMood = (mood === Mood.SEXUAL && !allowIntimacy) ? Mood.FLIRTY : mood;
  const isPrivateIntimacy = allowIntimacy && (safeMood === Mood.SEXUAL || safeMood === Mood.ROMANTIC);

  // [MARCUS FIX]: Keep requested mood (safeMood) so game state and UI preserve romantic/flirty/sexual moods.
  // Visual asset loader will perform image fallbacks without altering the real mood.
  const finalMood = safeMood;

  const [imgSrc, setImgSrc] = useState<string>(''); 
  const [isImgLoading, setIsImgLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorDebug, setErrorDebug] = useState('');

  // Animation States
  const [animationClass, setAnimationClass] = useState('');
  const [floatingEffects, setFloatingEffects] = useState<{id: number, icon: React.ReactNode, left: string}[]>([]);

  // --- STATE MACHINE REFS ---
  const currentFolderRef = useRef<string>('');
  const currentStageRef = useRef<LoadStage>('MOOD_VAR');
  const variantSuffixRef = useRef<string>('');
  const isFallbackActiveRef = useRef<boolean>(false);
  
  // [MARCUS NEW]: Track last used variant index to force rotation (Breathing Effect)
  const lastVariantIndexRef = useRef<number>(-1);

  // Helper: Extract folder path from a sample asset path
  const getFolderFromAsset = (assetPath: string): string => {
      const parts = assetPath.split('/');
      parts.pop(); // remove filename
      return parts.join('/');
  };

  const getCasualFolder = (): string => {
      if (charData.casualMoods) {
          const neutralAssets = charData.casualMoods[Mood.NEUTRAL];
          if (neutralAssets && neutralAssets.length > 0) {
              return getFolderFromAsset(neutralAssets[0]);
          }
      }
      return `characters/${characterId}casual`;
  };

  const getBaseFolder = (): string => {
      return `characters/${characterId}`;
  };

  // Helper to extract canonical filename
  const getCanonicalFilename = (targetMood: Mood, suffix: string): string => {
      const referenceMap = (isCasualMode && charData.casualMoods) ? charData.casualMoods : charData.moods;
      const basePaths = referenceMap?.[targetMood] || charData.moods?.[targetMood];
      
      if (Array.isArray(basePaths) && basePaths.length > 0) {
          const index = suffix === '' ? 0 : parseInt(suffix);
          const safeIndex = (index >= 0 && index < basePaths.length) ? index : 0;
          const fullPath = basePaths[safeIndex];
          return fullPath.split('/').pop() || `${targetMood}.png`;
      }
      return `${targetMood}${suffix}.png`;
  };

  const constructPath = (folder: string, stage: LoadStage, targetMood: Mood, suffix: string): string => {
      switch (stage) {
          case 'MOOD_VAR': {
              const filename = getCanonicalFilename(targetMood, suffix);
              return `${folder}/${filename}`;
          }
          case 'MOOD_BASE': {
              const filename = getCanonicalFilename(targetMood, ''); 
              return `${folder}/${filename}`;
          }
          case 'NEUTRAL_VAR': {
              const filename = getCanonicalFilename(Mood.NEUTRAL, suffix);
              return `${folder}/${filename}`;
          }
          case 'NEUTRAL_BASE': {
              const filename = getCanonicalFilename(Mood.NEUTRAL, ''); 
              return `${folder}/${filename}`;
          }
          default: return `${folder}/neutral.png`;
      }
  };

  // --- MAIN LOAD SEQUENCE ---
  useEffect(() => {
    if (isLoading && imgSrc) return; // Don't flicker if waiting for AI text
    if (customImagePath) {
        loadImageDirectly(customImagePath);
        return;
    }

    // 1. Determine Initial Folder
    let startFolder = '';
    const hasDateAssets = dateScene && ASSET_SUPPORTED_SCENES.includes(dateScene.type);

    if (hasDateAssets) {
        startFolder = `characters/${characterId}_${dateScene!.type}`;
        isFallbackActiveRef.current = false;
    } else if (isRoomMode) {
        // [MARCUS FIX]: Updated to use the new 'myroom' convention as requested
        startFolder = `characters/${characterId}myroom`; 
        isFallbackActiveRef.current = false;
    } else if (isCasualMode && characterId !== 'lucas') { 
        startFolder = getCasualFolder();
        isFallbackActiveRef.current = false;
    } else {
        startFolder = getBaseFolder();
        isFallbackActiveRef.current = false;
    }

    // 2. Generate Variant Suffix (Micro-Expressions Logic)
    // [MARCUS LOGIC]: Ensure we pick a DIFFERENT variant than the last render
    // to create a "breathing" or "shifting" effect even if mood is same.
    let variantRoll = Math.floor(Math.random() * 6); 
    
    // If rng hit the same index as before, force a shift
    if (variantRoll === lastVariantIndexRef.current) {
        variantRoll = (variantRoll + 1) % 6;
    }
    lastVariantIndexRef.current = variantRoll;

    const suffix = variantRoll === 0 ? '' : variantRoll.toString();
    variantSuffixRef.current = suffix;

    // 3. Start The Chain
    currentFolderRef.current = startFolder;
    currentStageRef.current = 'MOOD_VAR';
    
    // Use finalMood (Validated) instead of safeMood
    const initialPath = constructPath(startFolder, 'MOOD_VAR', finalMood, suffix);
    
    // [MARCUS OPTIMIZATION]: Check Sync Cache FIRST to avoid flicker
    const cachedUrl = checkUrlCache(initialPath);
    if (cachedUrl) {
        setImgSrc(cachedUrl);
    } else {
        tryLoadImage(initialPath);
    }

    // Trigger Animation
    if ([Mood.SASSY, Mood.ANGRY, Mood.SHY, Mood.SURPRISED, Mood.HORRIFIED].includes(finalMood)) {
        setAnimationClass('scale-105');
        setTimeout(() => setAnimationClass('scale-100'), 300);
    }

  }, [characterId, finalMood, dateScene, isRoomMode, isCasualMode, customImagePath, isLoading]);

  const loadImageDirectly = async (path: string) => {
      // Check cache first
      const cached = checkUrlCache(path);
      if (cached) {
          setImgSrc(cached);
          return;
      }

      setIsImgLoading(true);
      setHasError(false);
      const url = await getCharacterImageUrl(path);
      if (url) {
          setImgSrc(url);
          setIsImgLoading(false);
      } else {
          setHasError(true);
          setErrorDebug(`Custom: ${path}`);
          setIsImgLoading(false);
      }
  };

  const tryLoadImage = async (path: string) => {
      setHasError(false);
      
      const url = await getCharacterImageUrl(path);
      if (url) {
          setImgSrc(url);
      } else {
          handleImageError(path);
      }
  };

  const handleImageError = (failedPath: string) => {
      const stage = currentStageRef.current;
      const folder = currentFolderRef.current;
      const suffix = variantSuffixRef.current;

      console.log(`❌ Failed: ${failedPath} [Stage: ${stage}]`);

      // --- WATERFALL LOGIC (WITHIN FOLDER) ---
      if (stage === 'MOOD_VAR') {
          currentStageRef.current = 'MOOD_BASE';
          tryLoadImage(constructPath(folder, 'MOOD_BASE', finalMood, suffix));
          return;
      }

      if (stage === 'MOOD_BASE') {
          currentStageRef.current = 'NEUTRAL_VAR';
          tryLoadImage(constructPath(folder, 'NEUTRAL_VAR', finalMood, suffix));
          return;
      }

      if (stage === 'NEUTRAL_VAR') {
          currentStageRef.current = 'NEUTRAL_BASE';
          tryLoadImage(constructPath(folder, 'NEUTRAL_BASE', finalMood, suffix));
          return;
      }

      if (stage === 'NEUTRAL_BASE') {
          // --- FOLDER FALLBACK STRATEGY (Date/Room -> Casual -> Base) ---
          
          // 1. First Fallback: If in Date/Room mode, fallback to Standard/Casual
          if ((dateScene || isRoomMode) && !isFallbackActiveRef.current) {
              console.warn("⚠️ Supported Date/Room assets missing. Falling back to Standard Model.");
              const fallbackFolder = (isCasualMode && characterId !== 'lucas') ? getCasualFolder() : getBaseFolder();
              currentFolderRef.current = fallbackFolder;
              isFallbackActiveRef.current = true; // Mark as fallback active
              currentStageRef.current = 'MOOD_VAR'; 
              tryLoadImage(constructPath(fallbackFolder, 'MOOD_VAR', finalMood, suffix));
              return;
          }

          // 2. Second Fallback: If in Casual (original or fallback) and it fails, fallback to Base
          const casualFolder = getCasualFolder();
          const baseFolder = getBaseFolder();
          
          if (currentFolderRef.current === casualFolder && casualFolder !== baseFolder) {
               console.warn("⚠️ Casual assets missing. Falling back to Base Model.");
               currentFolderRef.current = baseFolder;
               isFallbackActiveRef.current = true;
               currentStageRef.current = 'MOOD_VAR';
               tryLoadImage(constructPath(baseFolder, 'MOOD_VAR', finalMood, suffix));
               return;
          }

          setHasError(true);
          setErrorDebug(`Asset Missing`);
          setIsImgLoading(false);
      }
  };

  // Action Effect (Hearts/Icons)
  useEffect(() => {
    if (!lastAction) return;
    let anim = '';
    if (lastAction.type === 'headpat') anim = 'animate-bounce-soft';
    if (lastAction.type === 'poke') anim = 'animate-shake-hard';
    if (lastAction.type === 'gift') anim = 'animate-bounce-soft';
    setAnimationClass(anim);
    setTimeout(() => setAnimationClass(''), 600);

    const newEffect = {
      id: Date.now(),
      icon: lastAction.type === 'gift' ? <Heart className="fill-pink-500 text-pink-500" size={30} /> : 
            lastAction.type === 'headpat' ? <Heart className="fill-pink-300 text-pink-300" size={24} /> : 
            <span className="text-2xl">💢</span>,
      left: `${30 + Math.random() * 40}%`
    };
    setFloatingEffects(prev => [...prev, newEffect]);
    setTimeout(() => setFloatingEffects(prev => prev.filter(e => e.id !== newEffect.id)), 1500);
  }, [lastAction]);

  const isDarkCharacter = ['lucas', 'erin'].includes(characterId);

  return (
    <div className="relative w-full h-full flex items-end justify-center px-0 overflow-hidden">
      <div className="relative group w-full h-full flex items-end justify-center">
        <div className="relative w-full h-full">
          {imgSrc && !hasError ? (
             <img 
              src={imgSrc} 
              alt={`${charData.name}`}
              onLoad={() => setIsImgLoading(false)}
              className={`
                w-full h-full object-cover object-top transition-all duration-700 ease-in-out
                ${animationClass}
                ${isImgLoading ? 'opacity-0' : 'opacity-100'} 
              `}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300 flex-col gap-2">
               {hasError && <span className="text-[10px] text-red-300 font-mono bg-black/50 px-2 py-1 rounded">Err: {errorDebug}</span>}
            </div>
          )}
          
          {!hasError && !isImgLoading && (
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                <div className="flex flex-col gap-1 items-start">
                    {dateScene && (
                        <div className="bg-pink-500/80 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-lg flex items-center gap-1 border border-white/20 animate-pulse">
                            <Heart size={10} fill="currentColor" /> {dateScene.name}
                        </div>
                    )}
                    {isRoomMode && (
                        <div className="bg-white/30 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-gray-800 border border-white/40 shadow-sm">
                            🏠 Room
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1 items-end">
                    {isPrivateIntimacy && (
                        <div className="bg-red-500/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider shadow-lg flex items-center gap-1 border border-white/20">
                            <Lock size={10} /> Private
                        </div>
                    )}
                </div>
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {floatingEffects.map(effect => (
              <div 
                key={effect.id}
                className="absolute bottom-1/3 animate-float-up"
                style={{ left: effect.left }}
              >
                {effect.icon}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

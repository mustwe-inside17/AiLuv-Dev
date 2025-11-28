
import React, { useState, useEffect } from 'react';
import { Mood, ActionEvent, CharacterId } from '../types';
import { CHARACTER_DATA } from '../constants';
import { getCharacterImageUrl } from '../services/firebase';
import { Heart } from 'lucide-react';

interface CharacterViewProps {
  characterId: CharacterId;
  mood: Mood;
  isLoading: boolean;
  lastAction: ActionEvent | null;
  disabled: boolean;
}

export const CharacterView: React.FC<CharacterViewProps> = ({ characterId, mood, isLoading, lastAction, disabled }) => {
  const charData = CHARACTER_DATA[characterId];
  
  // State for image handling
  const [imgSrc, setImgSrc] = useState<string>(''); // Empty initially
  const [isImgLoading, setIsImgLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Animation States
  const [animationClass, setAnimationClass] = useState('');
  const [floatingEffects, setFloatingEffects] = useState<{id: number, icon: React.ReactNode, left: string}[]>([]);

  // Effect to determine and load the correct image
  useEffect(() => {
    let isMounted = true;
    setIsImgLoading(true);
    setHasError(false);

    const loadImages = async () => {
      // 1. Get the array of image paths/urls for the current mood
      const moodImages = charData.moods[mood] || charData.moods[Mood.NEUTRAL] || [charData.baseImg];
      
      // 2. Randomly select one
      let selectedPath = moodImages[0];
      if (Array.isArray(moodImages) && moodImages.length > 0) {
        selectedPath = moodImages[Math.floor(Math.random() * moodImages.length)];
      }

      // 3. Resolve the URL (Firebase path vs Direct URL)
      let resolvedUrl = '';
      
      if (selectedPath && !selectedPath.startsWith('http')) {
        // Assume it's a Firebase Storage path
        let url = await getCharacterImageUrl(selectedPath);
        
        // Fallback Logic: If randomized variant failed (e.g. angry2 not found), try the first one (angry)
        if (!url && Array.isArray(moodImages) && moodImages.length > 0 && selectedPath !== moodImages[0]) {
             // console.warn(`Variant ${selectedPath} failed, trying fallback to ${moodImages[0]}`);
             url = await getCharacterImageUrl(moodImages[0]);
        }

        if (url) {
           resolvedUrl = url;
        } else {
           console.warn("Could not fetch image from Firebase:", selectedPath);
           // Fallback to base img if configured as URL, or just fail gracefully
           resolvedUrl = charData.baseImg.startsWith('http') ? charData.baseImg : ''; 
           setHasError(true);
        }
      } else {
         resolvedUrl = selectedPath || '';
      }

      if (isMounted) {
        setImgSrc(resolvedUrl);
        // We set loading to false in the onLine handler of <img>, 
        // but if it's empty, stop loading now
        if (!resolvedUrl) setIsImgLoading(false);
      }
    };

    loadImages();

    return () => { isMounted = false; };
  }, [mood, characterId, charData]);

  // When action happens (via prop from App), trigger animation
  useEffect(() => {
    if (!lastAction) return;
    
    // 1. Trigger Image Animation
    let anim = '';
    if (lastAction.type === 'headpat') anim = 'animate-bounce-soft';
    if (lastAction.type === 'poke') anim = 'animate-shake-hard';
    if (lastAction.type === 'gift') anim = 'animate-bounce-soft';
    
    setAnimationClass(anim);
    setTimeout(() => setAnimationClass(''), 600); // Clear animation

    // 2. Trigger Floating Particles
    const newEffect = {
      id: Date.now(),
      icon: lastAction.type === 'gift' ? <Heart className="fill-pink-500 text-pink-500" size={30} /> : 
            lastAction.type === 'headpat' ? <Heart className="fill-pink-300 text-pink-300" size={24} /> : 
            <span className="text-2xl">💢</span>,
      left: `${30 + Math.random() * 40}%`
    };

    setFloatingEffects(prev => [...prev, newEffect]);
    setTimeout(() => {
      setFloatingEffects(prev => prev.filter(e => e.id !== newEffect.id));
    }, 1500);

  }, [lastAction]);

  const handleImageError = () => {
    console.error("Failed to load image src:", imgSrc);
    setHasError(true);
    setIsImgLoading(false);
  };

  return (
    <div className="relative w-full h-full flex items-end justify-center px-0 overflow-hidden">
      <div className="relative group w-full h-full flex items-end justify-center">
        
        {/* Main Image Container - Full Frame */}
        <div className="relative w-full h-full">
          {imgSrc && !hasError ? (
             <img 
              src={imgSrc} 
              alt={`${charData.name} is ${mood}`}
              onLoad={() => setIsImgLoading(false)}
              onError={handleImageError}
              className={`
                w-full h-full object-cover object-top transition-all duration-700 ease-in-out
                ${(isLoading || isImgLoading) ? 'scale-105 brightness-105 blur-[2px]' : 'scale-100 blur-0'}
                ${animationClass}
              `}
            />
          ) : (
            // Fallback placeholder if image fails or hasn't loaded yet
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
               {isImgLoading ? "Loading..." : "Image not found"}
            </div>
          )}
          
          {/* Subtle Gradient Overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white/90 via-white/40 to-transparent pointer-events-none"></div>

          {/* Status Overlay Badge */}
          {!hasError && !isImgLoading && (
            <div className="absolute top-4 right-4 bg-white/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/40 text-gray-800 uppercase tracking-widest shadow-sm">
              {mood}
            </div>
          )}

          {/* Floating Effects Layer */}
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

        {/* Loading Indicator Overlay */}
        {(isLoading || isImgLoading) && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
             <div className="flex gap-2 p-4 bg-white/90 rounded-full shadow-xl border border-pink-100 backdrop-blur-sm">
               <span className="w-3 h-3 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
               <span className="w-3 h-3 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
               <span className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"></span>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

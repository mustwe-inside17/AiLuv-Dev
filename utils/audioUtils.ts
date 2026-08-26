
import { useGameStore } from '../store/gameStore';
import { SFX } from '../constants/audio';

/**
 * Plays a sound effect if SFX is not muted in global settings.
 * @param key The key of the SFX to play (from constants/audio)
 */
export const playSfx = (key: keyof typeof SFX) => {
    const { settings } = useGameStore.getState();
    
    // Check Master Mute
    if (settings.isMuted) return;

    const path = SFX[key];
    if (!path) return;

    // Fire and forget audio player
    const audio = new Audio(path);
    audio.volume = settings.sfxVolume;
    
    audio.play().catch(e => {
        // Silently fail if user hasn't interacted with document yet (Browser Policy)
        // or if file is missing.
        // console.warn(`SFX [${key}] play failed:`, e); 
    });
};

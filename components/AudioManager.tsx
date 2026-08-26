
import React, { useEffect, useRef, useState } from 'react';
import { LocationId, TimeOfDay } from '../types';
import { LOCATION_BGM, DATE_BGM, EVENT_BGM, MIA_DAY_BGM, MIA_NIGHT_BGM } from '../constants/audio';
import { useGameStore } from '../store/gameStore';
import { useShallow } from 'zustand/react/shallow';

interface AudioManagerProps {
    currentLocation: LocationId;
    timeOfDay: TimeOfDay; // [MARCUS FIX]: Receive TimeOfDay prop
    isGlobalMusicPlaying?: boolean; 
}

// [MARCUS TUNING]: Global BGM Attenuation
// Reduce raw file volume by 60% (Keep 40%) to prevent loudness issues
const MASTER_BGM_SCALE = 0.4; 

export const AudioManager: React.FC<AudioManagerProps> = ({ currentLocation, timeOfDay }) => {
    // [MARCUS UPDATE]: Added activeEvent to store destructuring
    const { settings, currentDateScene, isMusicActive, activeEvent } = useGameStore(useShallow(state => ({
        settings: state.settings,
        currentDateScene: state.currentDateScene,
        isMusicActive: state.isMusicActive,
        activeEvent: state.activeEvent
    })));
    const [isPageVisible, setIsPageVisible] = useState(() => document.visibilityState !== 'hidden');
    
    // --- DUAL PLAYER SYSTEM (Double Buffering) ---
    // We use two audio elements to fade one out while fading the other in.
    const player1Ref = useRef<HTMLAudioElement | null>(null);
    const player2Ref = useRef<HTMLAudioElement | null>(null);
    
    // 1 = Player 1 is the 'Target' (Fading In/Playing), 2 = Player 2 is 'Target'
    const activePlayerIndex = useRef<1 | 2>(1);
    
    // Track what is logically supposed to be playing to prevent redundant switches
    const currentTrackIdRef = useRef<string | null>(null);
    
    // Animation Interval Reference
    const crossfadeInterval = useRef<number | null>(null);

    // --- INITIALIZATION ---
    useEffect(() => {
        const onVisibilityChange = () => setIsPageVisible(document.visibilityState !== 'hidden');
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, []);

    useEffect(() => {
        const createPlayer = () => {
            const audio = new Audio();
            audio.loop = true;
            audio.volume = 0; // Start silent
            
            // Basic Error Handling (Fallback to Home BGM)
            audio.addEventListener('error', (e) => {
                const homeBgm = LOCATION_BGM['home'];
                // Check if we are already trying to play home to avoid loops
                if (audio.src && !audio.src.includes(homeBgm)) {
                    console.warn(`⚠️ [AudioManager] Track failed: ${audio.src}. Fallback to Home.`);
                    audio.src = homeBgm;
                    audio.play().catch(() => {});
                }
            });
            return audio;
        };

        player1Ref.current = createPlayer();
        player2Ref.current = createPlayer();

        return () => {
            if (crossfadeInterval.current) clearInterval(crossfadeInterval.current);
            player1Ref.current?.pause();
            player2Ref.current?.pause();
        };
    }, []);

    // --- LOGIC LOOP ---
    useEffect(() => {
        const p1 = player1Ref.current;
        const p2 = player2Ref.current;
        if (!p1 || !p2) return;

        // 1. Determine Target Track based on Priority
        let targetTrack: string | null = null;

        if (!isPageVisible) {
            targetTrack = null;
        } else if (currentDateScene) {
            // Priority 1: Date Mode (Highest)
            targetTrack = DATE_BGM;
        } else if (activeEvent && activeEvent.locationId === currentLocation) {
            // Priority 2: Active Event at Current Location (Story Tension)
            targetTrack = EVENT_BGM;
        } else if (isMusicActive) {
            // Priority 3: Global Music Active (Basement/Room/Profile) -> MUTE BGM
            // By setting targetTrack to null, the crossfade logic will fade out the current BGM to silence.
            targetTrack = null; 
        } else {
            // Priority 4: Location BGM (Default)
            if (currentLocation === 'maid_cafe') {
                // [MARCUS FIX]: Mia Duality BGM Logic
                // Night (18:00-06:00) -> Mia Spy Theme
                // Day (06:00-18:00) -> Ikura Maid Theme
                targetTrack = timeOfDay === 'night' ? MIA_NIGHT_BGM : MIA_DAY_BGM;
            } else {
                targetTrack = LOCATION_BGM[currentLocation] || null;
            }
        }

        // 2. Check if we actually need to transition
        // We compare against our ref to see if the *intent* has changed
        if (currentTrackIdRef.current === targetTrack) {
            // Same track intent. Just ensure volume matches settings (e.g. if user slid volume bar)
            const active = activePlayerIndex.current === 1 ? p1 : p2;
            const inactive = activePlayerIndex.current === 1 ? p2 : p1;
            
            // Ensure inactive is silent/paused
            if (!inactive.paused) {
                inactive.pause();
                inactive.volume = 0;
            }

            // [MARCUS FIX]: Direct Volume Control priority
            // Force volume update immediately. Do NOT rely on crossfade if track is same.
            if (settings.isMuted) {
                active.volume = 0;
            } else if (targetTrack) {
                if (active.paused) active.play().catch(() => {});
                // Apply Master Scale directly
                active.volume = settings.bgmVolume * MASTER_BGM_SCALE;
            }
            return;
        }

        // 3. START CINEMATIC CROSSFADE
        console.log(`🎵 [AudioManager] Crossfading to: ${targetTrack || 'Silence (Ducking)'}`);
        currentTrackIdRef.current = targetTrack;

        // Swap Logic: The 'Next' player becomes the 'Active' player
        const nextPlayer = activePlayerIndex.current === 1 ? p2 : p1;
        const prevPlayer = activePlayerIndex.current === 1 ? p1 : p2;
        
        // Update Index
        activePlayerIndex.current = activePlayerIndex.current === 1 ? 2 : 1;

        // Prepare Next Player
        if (targetTrack) {
            nextPlayer.src = targetTrack;
            nextPlayer.volume = 0; // Start from 0
            nextPlayer.play().catch(e => console.warn("Autoplay blocked:", e));
        }

        // Clear existing fade loop
        if (crossfadeInterval.current) window.clearInterval(crossfadeInterval.current);

        // FADE SETTINGS
        const FADE_STEP = 0.02; // Small steps for smoothness
        const INTERVAL_MS = 40; // 40ms * 50 steps = ~2 seconds fade duration

        crossfadeInterval.current = window.setInterval(() => {
            // [MARCUS FIX]: Apply Master Scale to target volume
            const targetVol = settings.isMuted ? 0 : (settings.bgmVolume * MASTER_BGM_SCALE);
            
            let isNextDone = false;
            let isPrevDone = false;

            // A. Fade In 'Next' (if there is a track)
            if (targetTrack && !settings.isMuted) {
                if (nextPlayer.volume < targetVol - FADE_STEP) {
                    nextPlayer.volume += FADE_STEP;
                } else {
                    nextPlayer.volume = targetVol;
                    isNextDone = true;
                }
            } else {
                // If target is null/muted, incoming should stay silent (or fade to 0 if it started)
                if (nextPlayer.volume > 0) {
                    nextPlayer.volume -= FADE_STEP; // Ensure it fades out if it was playing
                    if (nextPlayer.volume <= 0) {
                        nextPlayer.volume = 0;
                        nextPlayer.pause();
                        isNextDone = true;
                    }
                } else {
                    isNextDone = true;
                }
            }

            // B. Fade Out 'Prev'
            if (prevPlayer.volume > FADE_STEP) {
                prevPlayer.volume -= FADE_STEP;
            } else {
                prevPlayer.volume = 0;
                prevPlayer.pause();
                isPrevDone = true;
            }

            // C. Clean up
            if (isNextDone && isPrevDone) {
                if (crossfadeInterval.current) window.clearInterval(crossfadeInterval.current);
            }

        }, INTERVAL_MS);

    }, [currentLocation, isMusicActive, currentDateScene, activeEvent, settings.bgmVolume, settings.isMuted, timeOfDay, isPageVisible]);

    return null; // Headless
};

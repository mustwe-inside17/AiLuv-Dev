
import { RelationshipTier, DateScene, CharacterId, LocationId } from '../types';
import { TIER_THRESHOLDS } from '../constants';
import { LOCATIONS } from '../constants/locations';

export const getTierInfo = (tier: RelationshipTier, score: number) => {
    let nextThreshold = 0;
    let isLocked = false;
    let lockMessage = "";

    switch (tier) {
        case RelationshipTier.STRANGER:
            nextThreshold = TIER_THRESHOLDS[RelationshipTier.ACQUAINTANCE];
            break;
        case RelationshipTier.ACQUAINTANCE:
            nextThreshold = TIER_THRESHOLDS[RelationshipTier.FRIEND];
            break;
        case RelationshipTier.FRIEND:
            // Friend aims for FLIRTING/BEST_FRIEND threshold (2000)
            nextThreshold = TIER_THRESHOLDS[RelationshipTier.FLIRTING];
            // Check if at cap (1999)
            if (score >= nextThreshold - 1) { 
                isLocked = true;
                // [MARCUS NEW]: Updated message to reflect choice
                lockMessage = "Requires Gift to Evolve (Romance/Platonic)";
            }
            break;
        // ROMANCE PATH
        case RelationshipTier.FLIRTING:
            // Flirting aims for PARTNER threshold (5000)
            nextThreshold = TIER_THRESHOLDS[RelationshipTier.PARTNER];
            // Check if at cap (4999)
            if (score >= nextThreshold - 1) {
                isLocked = true;
                lockMessage = "Requires 'Promise Ring' to unlock Partner";
            }
            break;
        case RelationshipTier.PARTNER:
            // Partner aims for SOULMATE threshold (10000)
            nextThreshold = TIER_THRESHOLDS[RelationshipTier.SOULMATE];
            break;
        case RelationshipTier.SOULMATE:
            // Soulmate aims for ETERNAL threshold (50000)
            nextThreshold = TIER_THRESHOLDS[RelationshipTier.ETERNAL];
            if (score >= nextThreshold - 1) {
                isLocked = true;
                lockMessage = "Requires 'Eternity Pendant' to unlock Eternal Bond";
            }
            break;
        case RelationshipTier.ETERNAL:
            nextThreshold = 100000; // GOD TIER CAP
            break;
            
        // PLATONIC PATH
        case RelationshipTier.BEST_FRIEND:
            // Best Friend aims for SOUL_SIBLING threshold (5000)
            nextThreshold = TIER_THRESHOLDS[RelationshipTier.SOUL_SIBLING];
            if (score >= nextThreshold - 1) {
                isLocked = true;
                lockMessage = "Requires 'Matching Jacket' to unlock Soul Sibling";
            }
            break;
        case RelationshipTier.SOUL_SIBLING:
            // Soul Sibling aims for ETERNAL threshold (50000)
            nextThreshold = TIER_THRESHOLDS[RelationshipTier.ETERNAL];
            if (score >= nextThreshold - 1) {
                isLocked = true;
                lockMessage = "Requires 'Eternity Pendant' to unlock Eternal Bond";
            }
            break;
    }
    return { nextThreshold, isLocked, lockMessage };
};

export const getTierColor = (tier: RelationshipTier) => {
  switch (tier) {
    case RelationshipTier.STRANGER: return 'text-gray-400 dark:text-slate-500';
    case RelationshipTier.ACQUAINTANCE: return 'text-blue-400 dark:text-blue-300';
    case RelationshipTier.FRIEND: return 'text-green-500 dark:text-green-400';
    // ROMANCE
    case RelationshipTier.FLIRTING: return 'text-pink-400 dark:text-pink-300';
    case RelationshipTier.PARTNER: return 'text-red-500 font-extrabold dark:text-red-400';
    case RelationshipTier.SOULMATE: return 'text-purple-600 font-black dark:text-purple-400';
    // PLATONIC (Teal/Cyan Theme)
    case RelationshipTier.BEST_FRIEND: return 'text-cyan-500 font-bold dark:text-cyan-400';
    case RelationshipTier.SOUL_SIBLING: return 'text-teal-600 font-black dark:text-teal-400';
    // GOD TIER
    case RelationshipTier.ETERNAL: return 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-pulse font-black drop-shadow-md';
    default: return 'text-gray-500';
  }
};

/**
 * Returns the decay rate per hour based on current chemistry level:
 * - Chemistry > 75: 10 points/hour
 * - Chemistry > 50: 5 points/hour
 * - Chemistry <= 50: 3 points/hour
 */
export const getChemistryDecayRate = (currentChem: number): number => {
    if (currentChem > 75) return 10;
    if (currentChem > 50) return 5;
    return 3;
};

/**
 * Calculates updated chemistry after a given number of decay hours,
 * applying step-based decay hour by hour.
 */
export const calculateDecayedChemistry = (currentChem: number, hoursPassed: number): number => {
    let chem = currentChem;
    for (let h = 0; h < hoursPassed; h++) {
        if (chem <= 0) break;
        const rate = getChemistryDecayRate(chem);
        chem = Math.max(0, chem - rate);
    }
    return chem;
};

export const DATE_SCENE_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes of inactivity

/**
 * Checks if a Date Scene should expire due to inactivity or missing timestamps.
 */
export const isDateSceneExpired = (dateScene: DateScene | null | undefined, currentTime: number = Date.now()): boolean => {
    if (!dateScene) return false;
    const lastActive = dateScene.lastInteractionAt || dateScene.startedAt || 0;
    if (lastActive === 0) return true; // Legacy date scene without timestamp is expired
    return (currentTime - lastActive) >= DATE_SCENE_TIMEOUT_MS;
};

export interface ChemistryDecayResult {
    updatedChemistry: Record<CharacterId, number>;
    updatedDateScene: DateScene | null;
    newDecayTimestamp: number;
    hoursPassed: number;
    hasChanges: boolean;
    dateExpired: boolean;
}

/**
 * Processes chemistry decay and handles date expiration for game state.
 */
export const processGameStateChemistryDecay = (
    currentChemistry: Record<CharacterId, number> | undefined,
    currentDateScene: DateScene | null | undefined,
    currentLocation: LocationId,
    lastDecayTimestamp: number,
    currentTime: number = Date.now()
): ChemistryDecayResult => {
    const hoursPassed = Math.floor(Math.max(0, currentTime - lastDecayTimestamp) / 3600000);
    
    // Check if date scene has expired due to time or inactivity
    const dateExpired = isDateSceneExpired(currentDateScene, currentTime);
    const activeDateScene = dateExpired ? null : (currentDateScene || null);
    
    const loc = LOCATIONS[currentLocation];
    const activeDateCharId = activeDateScene && loc ? loc.characterId : null;

    if (!currentChemistry) {
        return {
            updatedChemistry: {} as Record<CharacterId, number>,
            updatedDateScene: activeDateScene,
            newDecayTimestamp: lastDecayTimestamp + (hoursPassed * 3600000),
            hoursPassed,
            hasChanges: dateExpired,
            dateExpired
        };
    }

    if (hoursPassed <= 0) {
        return {
            updatedChemistry: currentChemistry,
            updatedDateScene: activeDateScene,
            newDecayTimestamp: lastDecayTimestamp,
            hoursPassed: 0,
            hasChanges: dateExpired,
            dateExpired
        };
    }

    const newChem: Record<CharacterId, number> = { ...currentChemistry };
    let chemChanged = false;

    (Object.keys(newChem) as CharacterId[]).forEach(charId => {
        // Do not decay if character is currently in an ACTIVE, unexpired date scene
        if (charId === activeDateCharId) return;

        if (newChem[charId] > 0) {
            const oldVal = newChem[charId];
            newChem[charId] = calculateDecayedChemistry(oldVal, hoursPassed);
            if (newChem[charId] !== oldVal) {
                chemChanged = true;
            }
        }
    });

    return {
        updatedChemistry: newChem,
        updatedDateScene: activeDateScene,
        newDecayTimestamp: lastDecayTimestamp + (hoursPassed * 3600000),
        hoursPassed,
        hasChanges: chemChanged || dateExpired,
        dateExpired
    };
};

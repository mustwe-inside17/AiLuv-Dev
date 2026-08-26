import { DateSceneType, SceneTransition, CharacterId, RelationshipTier, Mood } from '../types';
import { DATE_LOCATIONS_DATA } from '../constants/assets';

/**
 * Normalizes scene keys from AI or user inputs into standard DateSceneType.
 */
export function normalizeSceneKey(
  rawInput: string | null | undefined,
  context?: {
    characterId?: CharacterId;
    relationshipTier?: RelationshipTier;
    timeOfDay?: string;
    mood?: Mood;
  }
): DateSceneType {
  if (!rawInput || typeof rawInput !== 'string') {
    return resolveFreestyleScene(context);
  }

  const cleaned = rawInput.toLowerCase().trim();

  // Direct matches
  if (cleaned === 'secret_bar' || cleaned === 'บาร์ลับ' || cleaned === 'secret bar' || cleaned.includes('บาร์') || cleaned.includes('bar')) {
    return 'secret_bar';
  }

  if (cleaned === 'character_home' || cleaned === 'คอนโด' || cleaned === 'บ้าน' || cleaned === 'home' || cleaned.includes('condo') || cleaned.includes('house')) {
    return 'character_home';
  }

  if (cleaned === 'car' || cleaned === 'บนรถ' || cleaned === 'drive' || cleaned.includes('รถ') || cleaned.includes('ride')) {
    return 'car';
  }

  if (cleaned === 'rooftop_dining' || cleaned === 'ร้านอาหารดาดฟ้า' || cleaned === 'ดาดฟ้า' || cleaned === 'rooftop' || cleaned.includes('dining')) {
    return 'rooftop_dining';
  }

  if (cleaned === 'freestyle') {
    return resolveFreestyleScene(context);
  }

  // Fallback based on context if unrecognized
  return resolveFreestyleScene(context);
}

/**
 * Resolves a 'freestyle' date request to an explicit DateSceneType
 * based on character personality, relationship level, mood, and time.
 */
export function resolveFreestyleScene(context?: {
  characterId?: CharacterId;
  relationshipTier?: RelationshipTier;
  timeOfDay?: string;
  mood?: Mood;
}): DateSceneType {
  const { characterId, relationshipTier, timeOfDay, mood } = context || {};

  // Romantic or intimate mood prefers home or rooftop
  if (mood === Mood.ROMANTIC || mood === Mood.FLIRTY || mood === Mood.SEXUAL) {
    if (relationshipTier === RelationshipTier.PARTNER || relationshipTier === RelationshipTier.SOULMATE) {
      return 'character_home';
    }
    return 'rooftop_dining';
  }

  // Character preferences
  if (characterId === 'marcus' || characterId === 'jellie') {
    return timeOfDay === 'night' || timeOfDay === 'evening' ? 'rooftop_dining' : 'car';
  }

  if (characterId === 'lucas' || characterId === 'erin') {
    return 'secret_bar';
  }

  if (characterId === 'fia' || characterId === 'peat') {
    return 'car';
  }

  if (characterId === 'miguel' || characterId === 'bam' || characterId === 'soul' || characterId === 'mia') {
    return 'character_home';
  }

  // Time-based default fallback
  if (timeOfDay === 'night' || timeOfDay === 'evening') {
    return 'secret_bar';
  }

  return 'character_home';
}

/**
 * Parses raw scene transition from AI into standard SceneTransition object.
 */
export function parseSceneTransition(
  raw: any,
  context?: {
    characterId?: CharacterId;
    relationshipTier?: RelationshipTier;
    timeOfDay?: string;
    mood?: Mood;
  }
): SceneTransition | null {
  if (!raw) return null;

  // Case 1: String
  if (typeof raw === 'string') {
    const cleaned = raw.trim().toLowerCase();
    if (cleaned === 'end' || cleaned === 'exit' || cleaned === 'close') {
      return { target: 'end', name: 'Normal', narrative_status: 'กลับสู่บรรยากาศปกติ' };
    }
    const normalizedTarget = normalizeSceneKey(cleaned, context);
    const locInfo = DATE_LOCATIONS_DATA[normalizedTarget];
    return {
      target: normalizedTarget,
      name: locInfo?.nameTh || locInfo?.nameEn || 'Date Scene',
      narrative_status: 'กำลังเดตและใช้เวลาอยู่ด้วยกัน'
    };
  }

  // Case 2: Object
  if (typeof raw === 'object' && raw !== null) {
    const rawTarget = String(raw.target || raw.type || '').trim().toLowerCase();
    if (rawTarget === 'end' || rawTarget === 'exit' || rawTarget === 'close') {
      return {
        target: 'end',
        name: raw.name || 'Normal',
        narrative_status: raw.narrative_status || raw.narrativeStatus || 'กลับสู่บรรยากาศปกติ'
      };
    }

    const normalizedTarget = normalizeSceneKey(rawTarget, context);
    const locInfo = DATE_LOCATIONS_DATA[normalizedTarget];
    return {
      target: normalizedTarget,
      name: raw.name || locInfo?.nameTh || locInfo?.nameEn || 'Date Scene',
      narrative_status: raw.narrative_status || raw.narrativeStatus || 'กำลังเดตและใช้เวลาอยู่ด้วยกัน'
    };
  }

  return null;
}

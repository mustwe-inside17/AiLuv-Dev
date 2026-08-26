import { CharacterId, Mood, CharacterQuest, SceneTransition } from '../types';
import { SECRET_REGISTRY } from '../constants/assets';
import { CHARACTER_DATA } from '../constants';
import { parseSceneTransition } from '../utils/dateUtils';
import { validateAndSanitizeCharacterQuest } from '../utils/questUtils';

// Valid mood strings for runtime check from Mood enum
const VALID_MOODS = new Set<string>(Object.values(Mood));

export interface RawAITurnInput {
  reply?: string;
  replies?: Array<{ speaker_id?: string; text?: string }>;
  mood?: string;
  love_change?: number;
  chemistry_change?: number;
  energy_cost?: number;
  thought?: string;
  special_event_image?: string | null;
  event_resolved?: boolean;
  new_memory?: any;
  party_memory?: any;
  scene_transition?: any;
  narrative_action?: string;
  character_quest?: any;
}

export interface SanitizedAITurnOutput {
  reply: string;
  replies?: Array<{ speaker_id: CharacterId; text: string }>;
  mood: Mood;
  love_change: number;
  chemistry_change: number;
  energy_cost: number;
  thought?: string;
  special_event_image?: string;
  event_resolved?: boolean;
  new_memory?: any;
  party_memory?: any;
  scene_transition?: SceneTransition;
  narrative_action?: string;
  character_quest?: CharacterQuest;
}

/**
 * AI Gateway V1: Sanitizes, validates, clamps, and authorizes AI output
 * before applying it to the game state.
 */
export function validateAndSanitizeAITurn(
  raw: RawAITurnInput,
  context: {
    charId: CharacterId;
    partyMemberId?: CharacterId | null;
  }
): SanitizedAITurnOutput {
  const { charId, partyMemberId } = context;
  const charName = CHARACTER_DATA[charId]?.name || 'Character';

  // 1. Mood Authorization & Validation
  let mood = Mood.NEUTRAL;
  if (raw.mood && typeof raw.mood === 'string') {
    const normalizedMood = raw.mood.toLowerCase().trim();
    if (VALID_MOODS.has(normalizedMood)) {
      mood = normalizedMood as Mood;
    }
  }

  // 2. Love Score Clamping [-20, +25]
  let loveChange = Number(raw.love_change) || 0;
  if (isNaN(loveChange)) loveChange = 0;
  loveChange = Math.max(-20, Math.min(25, Math.round(loveChange)));

  // 3. Chemistry Clamping [-5, +5]
  let chemistryChange = Number(raw.chemistry_change) || 0;
  if (isNaN(chemistryChange)) chemistryChange = 0;
  chemistryChange = Math.max(-5, Math.min(5, Math.round(chemistryChange)));

  // 4. Energy Cost Clamping [0, 30]
  let energyCost = Number(raw.energy_cost) || 0;
  if (isNaN(energyCost)) energyCost = 0;
  energyCost = Math.max(0, Math.min(30, Math.round(energyCost)));

  // 5. Speaker Authorization for Burst Replies
  let sanitizedReplies: Array<{ speaker_id: CharacterId; text: string }> | undefined = undefined;
  if (raw.replies && Array.isArray(raw.replies) && raw.replies.length > 0) {
    sanitizedReplies = raw.replies
      .filter(r => r && typeof r.text === 'string' && r.text.trim().length > 0)
      .map(r => {
        let speakerId: CharacterId = charId;
        const rawSpeaker = r.speaker_id?.toLowerCase().trim();

        if (rawSpeaker) {
          if (rawSpeaker === charId || rawSpeaker === partyMemberId) {
            speakerId = rawSpeaker as CharacterId;
          } else if (CHARACTER_DATA[rawSpeaker as CharacterId]) {
            speakerId = rawSpeaker as CharacterId;
          } else if (partyMemberId && CHARACTER_DATA[partyMemberId]?.name.toLowerCase() === rawSpeaker) {
            speakerId = partyMemberId;
          }
        }

        return {
          speaker_id: speakerId,
          text: r.text!.trim()
        };
      });
  }

  // 6. Reply Fallback
  let finalReply = raw.reply && typeof raw.reply === 'string' ? raw.reply.trim() : '...';
  if (sanitizedReplies && sanitizedReplies.length > 0 && (!finalReply || finalReply === '...')) {
    finalReply = sanitizedReplies.map(r => r.text).join(' ');
  }

  // Prepend narrative_action if present and not already formatted
  if (raw.narrative_action && typeof raw.narrative_action === 'string') {
    const actionText = raw.narrative_action.trim();
    if (actionText && !finalReply.startsWith('(')) {
      const formattedAction = `(${actionText}) `;
      finalReply = formattedAction + finalReply;
      if (sanitizedReplies && sanitizedReplies.length > 0) {
        sanitizedReplies[0].text = formattedAction + sanitizedReplies[0].text;
      }
    }
  }

  // 7. Quest Sanity Check & Capping using questUtils
  let sanitizedQuest: CharacterQuest | undefined = undefined;
  if (raw.character_quest) {
    const validated = validateAndSanitizeCharacterQuest(raw.character_quest, {
      characterId: charId
    });
    if (validated) {
      sanitizedQuest = validated;
    }
  }

  // 8. Registry Sanity Check: Scene Transition using dateUtils
  let sceneTransition: SceneTransition | undefined = undefined;
  if (raw.scene_transition) {
    const parsed = parseSceneTransition(raw.scene_transition, {
      characterId: charId,
      mood
    });
    if (parsed) {
      sceneTransition = parsed;
    }
  }

  // 9. Registry Sanity Check: Special Event Image
  let specialEventImage: string | undefined = undefined;
  if (raw.special_event_image && typeof raw.special_event_image === 'string') {
    const imageId = raw.special_event_image.trim();
    const characterSecrets = SECRET_REGISTRY[charId] || [];
    const isValidSecret = characterSecrets.some(secret => secret.id === imageId);

    if (isValidSecret) {
      specialEventImage = imageId;
    } else {
      console.warn(`[AI Gateway] Invalid secret image ID "${imageId}" for character ${charId} rejected.`);
    }
  }

  // 10. Strip unauthorized currency changes & return clean turn state
  return {
    reply: finalReply,
    replies: sanitizedReplies,
    mood,
    love_change: loveChange,
    chemistry_change: chemistryChange,
    energy_cost: energyCost,
    thought: typeof raw.thought === 'string' ? raw.thought : undefined,
    special_event_image: specialEventImage,
    event_resolved: Boolean(raw.event_resolved),
    new_memory: raw.new_memory,
    party_memory: raw.party_memory,
    scene_transition: sceneTransition,
    narrative_action: typeof raw.narrative_action === 'string' ? raw.narrative_action : undefined,
    character_quest: sanitizedQuest
  };
}

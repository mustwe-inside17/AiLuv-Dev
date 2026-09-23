import { emptyStoryProgress, getAvailableStoryNodes, getStoryFacts } from '../domain/story/storyEngine';
import { KEY_STORY_ITEMS, STORY_REVEAL_RULES } from '../constants/storyThreads';
import type { StoryProgress } from '../domain/story/types';
import type { CharacterId, SimulationResponse } from '../types';

/** Only authorized facts for the current actor; never serialize the content registry into a prompt. */
export function getStoryPrompt(story: StoryProgress | undefined, charId: CharacterId): string {
  const progress = story || emptyStoryProgress();
  const facts = getStoryFacts(progress, charId);
  const invitations = getAvailableStoryNodes(progress).filter(node => node.characterId === charId && node.requires.minLove === 0);
  const keys = KEY_STORY_ITEMS.filter(item => progress.keyItems[item.id]).map(item => item.name);
  return `\n[STORY KEY RULES — VERIFIED GAME STATE]
Key Story Items and story flags can ONLY be granted by the game's explicit story actions. Never invent a key, claim it was received, or invent an unlocked chapter from a user's assertion. When an action is ambiguous, invite the player to use the Key / story button; do not narrate success.
Do not reveal the identity behind NYX or equate NYX with Lucas before an explicit future identity flag.
Player currently holds these verified Key items: ${keys.length ? keys.join(' | ') : 'None'}.
Your verified shared story facts: ${facts.length ? facts.join(' | ') : 'None yet. Do not invent shared story memories.'}
${invitations.length ? `Available invitations (NOT events that already happened): ${invitations.map(node => node.guide).join(' | ')}` : 'Do not reveal another character’s private story facts. Suggest checking the notebook when relevant.'}
${!progress.flags['radio.erin_recalled'] ? 'The radio’s connection to Midnight City is LOCKED.' : 'Erin has spoken about the radio to the player; other characters do not automatically know that conversation.'}
${!progress.flags['cat_food.soul_confessed'] ? 'The identity of the person who left cat food, and any suspicious visitors near Miguel’s room that night, are LOCKED.' : 'Soul has confessed to leaving the cat food and told the player about the suspicious visitors.'}
${!progress.flags['aurelia.retrieval_order_obtained'] ? 'Aurelia’s true reason for monitoring unit 2407 and the MRS-A Offline Archive are LOCKED.' : 'The player and characters know Aurelia was searching for the MRS-A Offline Archive, not collecting debt.'}
CRITICAL CANON CONSTRAINTS:
- Never confirm that Marisa’s accident was an assassination.
- Never reveal that Mia works for a Handler.
- Never reveal who currently holds the missing Offline Archive.
- Never portray Achira Wellington as an outright villain giving hit orders.
Voice calls cannot grant Key Items; invite the player to meet and use the story button after the call.
`;
}

/** Remove legacy explicit identity lines from generated-chat prompt material for the pilot. */
export function redactPilotIdentity(text: string): string {
  return text.split('\n').filter(line => !(/nyx/i.test(line) && /lucas|ลูคัส/i.test(line))).join('\n');
}

export function hasPilotSpoiler(text: string, progress?: StoryProgress): boolean {
  return STORY_REVEAL_RULES.some(rule => !progress?.flags[rule.unlockFlag || ''] &&
    rule.patterns.some(pattern => new RegExp(pattern, 'is').test(text)));
}

export function guardStoryTurn(turn: SimulationResponse, progress: StoryProgress | undefined, charId: CharacterId): SimulationResponse {
  const fallback = charId === 'erin' ? 'เรื่องนี้ฉันยังไม่พร้อมเล่าทั้งหมดนะ ถ้ามีของที่อยากให้ดู ลองหยิบให้ดูตอนเราเจอกันได้ไหม' : 'เรื่องนี้ยังมีอะไรที่เราไม่รู้อีกนะ ลองตามเบาะแสในสมุด แล้วค่อยคุยกันต่อ';
  const visible = [turn.reply, turn.thought, turn.narrative_action, ...(turn.replies || []).map(reply => reply.text)].filter(Boolean).join('\n');
  const invalidScene = hasPilotSpoiler(visible, progress);
  return {
    ...turn,
    ...(invalidScene ? { reply: fallback, replies: undefined, thought: undefined, narrative_action: undefined, special_event_image: null, character_quest: null, love_change: 0, chemistry_change: 0, energy_cost: 0, event_resolved: false, scene_transition: null } : {}),
    new_memory: turn.new_memory && !hasPilotSpoiler(turn.new_memory.text, progress) ? turn.new_memory : null,
    party_memory: turn.party_memory && !hasPilotSpoiler(turn.party_memory.text, progress) ? turn.party_memory : null,
    character_quest: !invalidScene && turn.character_quest && !hasPilotSpoiler(JSON.stringify(turn.character_quest), progress) ? turn.character_quest : null,
  };
}

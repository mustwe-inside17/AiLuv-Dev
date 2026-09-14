import { KEY_STORY_ITEMS, STORY_NODES } from '../../constants/storyThreads';
import type { StoryActorContext, StoryCommand, StoryNode, StoryProgress, StoryResult } from './types';

export const emptyStoryProgress = (): StoryProgress => ({ schemaVersion: 1, flags: {}, keyItems: {}, receipts: {}, journalReadCount: 0 });
const record = (value: unknown): Record<string, any> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};

/** Rebuild derived flags/items from validated, ordered receipts. Never infer them from Love, photos or prose. */
export function migrateStoryProgress(raw?: unknown): StoryProgress {
  const data = record(raw);
  const state = emptyStoryProgress();
  const receipts = record(data.receipts);
  for (const node of STORY_NODES) {
    const receipt = record(receipts[node.id]);
    if (receipt.nodeId !== node.id || receipt.characterId !== node.characterId ||
      !Number.isFinite(receipt.completedAt) || receipt.completedAt < 0 ||
      !node.requires.flags.every(flag => state.flags[flag]) ||
      (node.requires.itemId && !state.keyItems[node.requires.itemId])) continue;
    state.receipts[node.id] = { nodeId: node.id, characterId: node.characterId, completedAt: receipt.completedAt, source: receipt.source === 'chat' ? 'chat' : 'button' };
    node.grants.flags.forEach(flag => { state.flags[flag] = true; });
    node.grants.items?.forEach(id => {
      if (KEY_STORY_ITEMS.some(item => item.id === id)) state.keyItems[id] = { acquiredAt: receipt.completedAt, sourceNodeId: node.id };
    });
  }
  state.journalReadCount = Math.min(Object.keys(state.receipts).length, Math.max(0, Math.floor(Number(data.journalReadCount) || 0)));
  const latest = Object.values(state.receipts).sort((a, b) => b.completedAt - a.completedAt)
    .map(receipt => STORY_NODES.find(node => node.id === receipt.nodeId)!)
    .find(node => getNextStoryNode(state, node.threadId));
  if (latest) state.activeSession = { threadId: latest.threadId, nodeId: getNextStoryNode(state, latest.threadId)!.id,
    updatedAt: state.receipts[latest.id].completedAt };
  return state;
}

export function getNextStoryNode(progress: StoryProgress, threadId = 'nyx_radio'): StoryNode | undefined {
  return STORY_NODES.find(node => node.threadId === threadId && !progress.receipts[node.id] && node.requires.flags.every(flag => progress.flags[flag]));
}

/** Pending scenes whose story prerequisites are met. Actor/location/Love are checked separately for UI and commands. */
export function getAvailableStoryNodes(progress: StoryProgress): StoryNode[] {
  return STORY_NODES.filter(node => !progress.receipts[node.id] &&
    node.requires.flags.every(flag => progress.flags[flag]) &&
    (!node.requires.itemId || !!progress.keyItems[node.requires.itemId]));
}

export function storyLockReason(node: StoryNode, progress: StoryProgress, context: StoryActorContext): string | null {
  if (context.busy) return 'จบกิจกรรมหรือแชทเสียงก่อน แล้วกลับมาคุยเรื่องนี้ด้วยกัน';
  if (context.characterId !== node.characterId) return 'เบาะแสนี้เกี่ยวกับคนอื่น ลองดูคำใบ้ในสมุดเรื่องราว';
  if (context.locationId !== node.locationId) return 'เรื่องนี้ต้องไปพบกันที่สถานที่ในสมุดก่อน หยิบของให้ดูผ่านแชทออนไลน์ไม่ได้';
  if (!node.requires.flags.every(flag => progress.flags[flag])) return 'ยังขาดเบาะแสก่อนหน้า เปิดสมุดเรื่องราวเพื่อดูขั้นต่อไป';
  if (node.requires.itemId && !progress.keyItems[node.requires.itemId]) return 'ยังไม่มีของชิ้นนี้ ลองตามเบาะแสในสมุดเรื่องราวก่อน';
  if (!Number.isFinite(context.love) || context.love < node.requires.minLove) return `ทำความรู้จักอีกนิด: Love ${Math.max(0, Math.floor(context.love || 0))} / ${node.requires.minLove}`;
  return null;
}

export function applyStoryCommand(progress: StoryProgress, command: StoryCommand, context: StoryActorContext, now: number, source: 'chat' | 'button' = 'button'): StoryResult {
  const reply = (status: StoryResult['status'], dialogue: string, node?: StoryNode): StoryResult => ({ status, progress, dialogue, node, grantedItems: [] });
  let node: StoryNode | undefined;
  if (command.type === 'present') {
    const item = KEY_STORY_ITEMS.find(item => item.id === command.itemId);
    if (!item || !progress.keyItems[item.id]) return reply('invalid', 'คุณยังไม่มี Key ชิ้นนี้');
    if (context.busy) return reply('locked', 'จบกิจกรรมหรือแชทเสียงก่อน แล้วลองหยิบของให้ดูอีกครั้ง');
    node = STORY_NODES.find(node => node.trigger === 'present' && node.requires.itemId === item.id && node.characterId === context.characterId && !progress.receipts[node.id])
      || STORY_NODES.find(node => node.trigger === 'present' && node.requires.itemId === item.id && node.characterId === context.characterId);
    if (!node) return { ...reply('wrong_character', item.wrongCharacterHints[context.characterId] || item.defaultHint), playerAction: `(หยิบ${item.name}ให้ดู)` };
  } else node = STORY_NODES.find(node => node.id === command.nodeId);
  if (!node) return reply('invalid', 'ไม่พบเรื่องราวนี้');
  const locked = storyLockReason(node, progress, context);
  if (locked) return reply('locked', locked, node);
  if (progress.receipts[node.id]) return { ...reply('already_completed', node.repeatDialogue, node), playerAction: node.playerAction };
  const next: StoryProgress = { ...progress, flags: { ...progress.flags }, keyItems: { ...progress.keyItems }, receipts: { ...progress.receipts } };
  next.receipts[node.id] = { nodeId: node.id, characterId: context.characterId, completedAt: now, source };
  node.grants.flags.forEach(flag => { next.flags[flag] = true; });
  const grantedItems = (node.grants.items || []).filter(id => KEY_STORY_ITEMS.some(item => item.id === id) && !next.keyItems[id]);
  grantedItems.forEach(id => { next.keyItems[id] = { acquiredAt: now, sourceNodeId: node!.id }; });
  const following = getNextStoryNode(next, node.threadId);
  if (following) next.activeSession = { threadId: node.threadId, nodeId: following.id, updatedAt: now };
  else {
    const resumed = migrateStoryProgress(next).activeSession;
    if (resumed) next.activeSession = resumed;
    else delete next.activeSession;
  }
  return { status: 'completed', progress: next, dialogue: node.dialogue, playerAction: node.playerAction, node, grantedItems };
}

/** Conservative direct-action recognition. Buttons cover ambiguous/natural paraphrases; keywords alone never grant a key. */
export function matchStoryText(text: string, progress: StoryProgress, context: StoryActorContext): StoryCommand | null {
  text = text.trim();
  const normalize = (value: string) => value.trim().replace(/[()（）]/g, '').replace(/\s+/g, ' ').toLowerCase();
  const eligible = getAvailableStoryNodes(progress).filter(node => node.characterId === context.characterId);
  const exact = eligible.find(node => [node.actionLabel, node.playerAction].some(value => normalize(value) === normalize(text)));
  const commandFor = (node: StoryNode): StoryCommand => node.trigger === 'present' && node.requires.itemId
    ? { type: 'present', itemId: node.requires.itemId } : { type: 'node', nodeId: node.id };
  if (exact) return commandFor(exact);
  const active = STORY_NODES.find(node => node.id === progress.activeSession?.nodeId);
  if (active && /^(?:ต่อ|ต่อเลย|ไปต่อ|ทำต่อ|เปิดเลย|ดูเลย|ได้เลย|ตกลง|continue|yes|go ahead)[! .]*(?:ค่ะ|ครับ|คะ)?$/i.test(text)) return commandFor(active);
  if (text.length > 500 || /\[system|ignore.*instruction|ถ้า|สมมติ|ไม่(?:อยาก|ต้อง|ได้|เคย)?|อย่า|ยังไม่|เคย|เมื่อวาน|"|“|”|\b(?:if|don't|not|already|yesterday|pretend)\b/i.test(text)) return null;
  // Explicitly showing an owned key also works for the wrong recipient or a repeat visit.
  const shownKey = STORY_NODES.find(node => node.trigger === 'present' && node.requires.itemId && progress.keyItems[node.requires.itemId] && node.textCues.some(cue => new RegExp(cue, 'i').test(text)));
  if (shownKey?.requires.itemId) return { type: 'present', itemId: shownKey.requires.itemId };
  const next = [active, ...eligible].find(node => node && !storyLockReason(node, progress, context) && node.textCues.some(cue => new RegExp(cue, 'i').test(text)));
  if (!next || !next.textCues.some(cue => new RegExp(cue, 'i').test(text))) return null;
  return next.trigger === 'present' && next.requires.itemId ? { type: 'present', itemId: next.requires.itemId } : { type: 'node', nodeId: next.id };
}

export function getStoryFacts(progress: StoryProgress, charId: string): string[] {
  return STORY_NODES.filter(node => progress.receipts[node.id] && node.characterId === charId).flatMap(node => node.facts);
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { applyStoryCommand, emptyStoryProgress, getNextStoryNode, getStoryFacts, matchStoryText, migrateStoryProgress, storyLockReason } from '../domain/story/storyEngine';
import { KEY_STORY_ITEMS, STORY_NODES } from '../constants/storyThreads';
import type { StoryProgress, StoryActorContext } from '../domain/story/types';
import { getStoryPrompt, guardStoryTurn, hasPilotSpoiler, redactPilotIdentity } from '../services/storyContext';
import { Mood } from '../types';
import { mergeStoryCheckpoint, writeStoryCheckpoint } from '../services/storyCheckpoint';

const fia: StoryActorContext = { characterId: 'fia', locationId: 'gym', love: 0 };
const erin: StoryActorContext = { characterId: 'erin', locationId: 'market', love: 0 };
const hear = (state = emptyStoryProgress()) => applyStoryCommand(state, { type: 'node', nodeId: 'radio_hear_noise' }, fia, 10);
const discover = () => applyStoryCommand(hear().progress, { type: 'node', nodeId: 'radio_open_locker' }, fia, 20);

test('registry has unique IDs, resolvable items, earlier prerequisite flags and no progression cost', () => {
  assert.equal(new Set(STORY_NODES.map(n => n.id)).size, STORY_NODES.length);
  const known = new Set<string>();
  for (const node of STORY_NODES) {
    for (const flag of node.requires.flags) assert.ok(known.has(flag));
    for (const item of [...(node.grants.items || []), ...(node.requires.itemId ? [node.requires.itemId] : [])]) assert.ok(KEY_STORY_ITEMS.some(k => k.id === item));
    node.grants.flags.forEach(flag => known.add(flag));
  }
});
test('full radio loop is playable at zero Love, grants exactly one non-consumable key and records receipts', () => {
  const start = emptyStoryProgress();
  const first = hear(start); assert.equal(first.status, 'completed'); assert.deepEqual(start, emptyStoryProgress());
  const found = discover(); assert.deepEqual(found.grantedItems, ['key_nyx_radio']);
  const shown = applyStoryCommand(found.progress, { type: 'present', itemId: 'key_nyx_radio' }, erin, 30);
  assert.equal(shown.status, 'completed'); assert.equal(shown.progress.flags['radio.episode_complete'], true);
  assert.ok(shown.progress.keyItems.key_nyx_radio); assert.equal(Object.keys(shown.progress.receipts).length, 3);
  assert.equal(getNextStoryNode(shown.progress), undefined);
});
test('cannot skip discovery, use unknown keys, use a future node, or show an unowned radio', () => {
  for (const command of [{ type: 'node', nodeId: 'radio_open_locker' }, { type: 'node', nodeId: 'radio_erin_recall' }, { type: 'present', itemId: 'key_nyx_radio' }, { type: 'present', itemId: 'fake' }, { type: 'node', nodeId: '__proto__' }] as const) {
    const result = applyStoryCommand(emptyStoryProgress(), command, command.type === 'node' && command.nodeId === 'radio_open_locker' ? fia : erin, 1);
    assert.notEqual(result.status, 'completed'); assert.deepEqual(result.progress, emptyStoryProgress());
  }
});
test('wrong recipient keeps key and flags, returns bounded character hint', () => {
  const state = discover().progress;
  const result = applyStoryCommand(state, { type: 'present', itemId: 'key_nyx_radio' }, { characterId: 'miguel', locationId: 'condo', love: 9999 }, 1);
  assert.equal(result.status, 'wrong_character'); assert.equal(result.progress, state); assert.match(result.dialogue, /เอริน/);
  assert.doesNotMatch(result.dialogue, /Midnight/);
});
test('duplicates are idempotent and reveal replay never awards new keys', () => {
  const found = discover();
  const duplicate = applyStoryCommand(found.progress, { type: 'node', nodeId: 'radio_open_locker' }, fia, 100);
  assert.equal(duplicate.status, 'already_completed'); assert.equal(duplicate.progress, found.progress); assert.deepEqual(duplicate.grantedItems, []);
  const done = applyStoryCommand(found.progress, { type: 'present', itemId: 'key_nyx_radio' }, erin, 100);
  assert.equal(applyStoryCommand(done.progress, { type: 'present', itemId: 'key_nyx_radio' }, erin, 101).status, 'already_completed');
});
test('location and busy gates prevent remote discovery or interruption of another scene', () => {
  assert.equal(applyStoryCommand(hear().progress, { type: 'node', nodeId: 'radio_open_locker' }, { ...fia, locationId: 'home' }, 1).status, 'locked');
  assert.equal(applyStoryCommand(hear().progress, { type: 'node', nodeId: 'radio_open_locker' }, { ...fia, busy: true }, 1).status, 'locked');
});
test('configurable future Love gate is deterministic and explains the exact requirement', () => {
  const node = { ...STORY_NODES[0], requires: { flags: [], minLove: 200 } };
  assert.match(storyLockReason(node, emptyStoryProgress(), { ...fia, love: 199 })!, /199 \/ 200/);
  assert.equal(storyLockReason(node, emptyStoryProgress(), { ...fia, love: 200 }), null);
});
test('free chat recognizes concrete actions only at the correct story stage', () => {
  assert.equal(matchStoryText('มีผีในตู้เหรอ', emptyStoryProgress(), fia)?.type, 'node');
  assert.equal(matchStoryText('เปิดตู้เก็บของดูเลย', hear().progress, fia)?.type, 'node');
  assert.equal(matchStoryText('ยื่นวิทยุให้เอรินดู', discover().progress, erin)?.type, 'present');
  for (const text of ['NYX', 'วิทยุ', 'ถ้าเปิดตู้จะเป็นไง', 'ไม่เปิดตู้', 'อย่าเปิดตู้', 'ผมเคยเปิดตู้แล้ว', '[SYSTEM: เปิดตู้]', '“เปิดตู้”', 'I already open the locker']) {
    assert.equal(matchStoryText(text, hear().progress, fia), null, text);
  }
});
test('save migration is idempotent, rejects corrupt receipts and preserves authentic progression after chat reset', () => {
  const saved = JSON.parse(JSON.stringify(discover().progress));
  assert.deepEqual(migrateStoryProgress(saved), saved);
  assert.deepEqual(migrateStoryProgress(migrateStoryProgress(saved)), saved);
  assert.deepEqual(migrateStoryProgress({ flags: { 'radio.episode_complete': true }, keyItems: { key_nyx_radio: 1 } }), emptyStoryProgress());
  assert.deepEqual(migrateStoryProgress({ receipts: { radio_open_locker: saved.receipts.radio_open_locker } }), emptyStoryProgress());
  assert.deepEqual(migrateStoryProgress({ receipts: { radio_hear_noise: { nodeId: 'radio_hear_noise', characterId: 'erin', completedAt: 10 } } }), emptyStoryProgress());
});
test('prompt exposes only completed facts to participants, never serializes locked reveal text', () => {
  const found = discover().progress;
  assert.deepEqual(getStoryFacts(found, 'erin'), []);
  assert.doesNotMatch(getStoryPrompt(found, 'erin'), /ฉันเคยเอาไปลองเปิดเดโม/);
  const done = applyStoryCommand(found, { type: 'present', itemId: 'key_nyx_radio' }, erin, 30).progress;
  assert.ok(getStoryFacts(done, 'erin').length > 0);
  assert.ok(!getStoryFacts(done, 'fia').some(f => f.includes('Midnight')));
});
test('known identity and premature radio-song reveal are blocked in dialogue, thoughts, memories and quests', () => {
  const base = { reply: 'วิทยุใช้เล่น Midnight City', mood: Mood.NEUTRAL, love_change: 20, energy_cost: 10, thought: 'Lucas is NYX', new_memory: { text: 'ลูคัสคือ NYX', type: 'core' } };
  const guarded = guardStoryTurn(base, emptyStoryProgress(), 'erin');
  assert.doesNotMatch(guarded.reply, /Midnight|NYX/); assert.equal(guarded.thought, undefined); assert.equal(guarded.new_memory, null); assert.equal(guarded.love_change, 0);
  assert.equal(redactPilotIdentity('public\nLucas is NYX\nnormal'), 'public\nnormal');
});
test('checkpoint merges cloud/local progress per account without transferring inventory across accounts', () => {
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { value: { getItem: (k: string) => data.get(k) || null, setItem: (k: string, v: string) => data.set(k, v) }, configurable: true });
  assert.equal(writeStoryCheckpoint('alice', discover().progress), true);
  assert.ok(mergeStoryCheckpoint('alice', hear().progress).keyItems.key_nyx_radio);
  assert.deepEqual(mergeStoryCheckpoint('bob'), emptyStoryProgress());
  data.set('ailuv_story_v1:alice', '{bad'); assert.deepEqual(mergeStoryCheckpoint('alice', hear().progress), hear().progress);
});

test('showing an owned radio in free chat routes wrong recipients and repeat visits through story dialogue', () => {
  assert.equal(matchStoryText('หยิบวิทยุให้ดู', discover().progress, fia)?.type, 'present');
  const done = applyStoryCommand(discover().progress, {type:'present',itemId:'key_nyx_radio'}, erin, 30).progress;
  assert.equal(matchStoryText('ยื่นวิทยุให้ดูอีกครั้ง', done, erin)?.type, 'present');
});

const miguel200: StoryActorContext = { characterId: 'miguel', locationId: 'condo', love: 200 };
const bam: StoryActorContext = { characterId: 'bam', locationId: 'cafe_2f', love: 0 };
const mia: StoryActorContext = { characterId: 'mia', locationId: 'maid_cafe', love: 0 };
const soul: StoryActorContext = { characterId: 'soul', locationId: 'vet', love: 0 };

function completeCatFoodThread() {
  const knock = applyStoryCommand(emptyStoryProgress(), { type: 'node', nodeId: 'cat_food_hear_knock' }, miguel200, 100);
  const box = applyStoryCommand(knock.progress, { type: 'node', nodeId: 'cat_food_open_door' }, miguel200, 200);
  const receipt = applyStoryCommand(box.progress, { type: 'present', itemId: 'key_cat_cafe_receipt' }, bam, 300);
  const charm = applyStoryCommand(receipt.progress, { type: 'present', itemId: 'key_ikura_maid_charm' }, miguel200, 400);
  const photo = applyStoryCommand(charm.progress, { type: 'present', itemId: 'key_ikura_photo' }, mia, 500);
  const vip = applyStoryCommand(photo.progress, { type: 'present', itemId: 'key_ikura_vip_card' }, soul, 600);
  return { knock, box, receipt, charm, photo, vip };
}

test('AiLuv Life cat-food thread starts at Miguel Love 200 and completes six ordered nodes', () => {
  assert.equal(applyStoryCommand(emptyStoryProgress(), { type: 'node', nodeId: 'cat_food_hear_knock' }, { ...miguel200, love: 199 }, 1).status, 'locked');
  const result = completeCatFoodThread();
  assert.deepEqual(result.box.grantedItems, ['key_cat_cafe_receipt']);
  assert.deepEqual(result.receipt.grantedItems, ['key_ikura_maid_charm']);
  assert.deepEqual(result.charm.grantedItems, ['key_ikura_photo']);
  assert.deepEqual(result.photo.grantedItems, ['key_ikura_vip_card']);
  assert.equal(result.vip.status, 'completed');
  assert.equal(result.vip.progress.flags['cat_food.episode_complete'], true);
  assert.equal(Object.keys(result.vip.progress.receipts).length, 6);
  for (const id of ['key_cat_cafe_receipt', 'key_ikura_maid_charm', 'key_ikura_photo', 'key_ikura_vip_card']) assert.ok(result.vip.progress.keyItems[id]);
});

test('cat-food free chat trigger and door choice require the right stage and Love', () => {
  assert.equal(matchStoryText('ช่วงนี้นิติคอนโดมาตรวจห้องไหม', emptyStoryProgress(), { ...miguel200, love: 199 }), null);
  assert.deepEqual(matchStoryText('ช่วงนี้นิติคอนโดมาตรวจห้องไหม', emptyStoryProgress(), miguel200), { type: 'node', nodeId: 'cat_food_hear_knock' });
  const knock = applyStoryCommand(emptyStoryProgress(), { type: 'node', nodeId: 'cat_food_hear_knock' }, miguel200, 1);
  assert.deepEqual(matchStoryText('ไปเปิดประตูดูด้วยกัน', knock.progress, miguel200), { type: 'node', nodeId: 'cat_food_open_door' });
});

test('cat-food keys survive wrong recipients, repeat use, and save migration', () => {
  const { box, vip } = completeCatFoodThread();
  const wrong = applyStoryCommand(box.progress, { type: 'present', itemId: 'key_cat_cafe_receipt' }, miguel200, 1);
  assert.equal(wrong.status, 'wrong_character');
  assert.ok(wrong.progress.keyItems.key_cat_cafe_receipt);
  assert.equal(Object.keys(wrong.progress.receipts).length, 2);
  assert.deepEqual(migrateStoryProgress(JSON.parse(JSON.stringify(vip.progress))), vip.progress);
  const repeat = applyStoryCommand(vip.progress, { type: 'present', itemId: 'key_ikura_vip_card' }, soul, 700);
  assert.equal(repeat.status, 'already_completed');
  assert.equal(Object.keys(repeat.progress.receipts).length, 6);
});

test('cat-food culprit and Aurelia clue stay locked until Soul completes the final node', () => {
  const { photo, vip } = completeCatFoodThread();
  assert.equal(hasPilotSpoiler('หมอโซลเป็นคนเอาอาหารแมวไปวางไว้', photo.progress), true);
  assert.equal(hasPilotSpoiler('รถ Aurelia มาป้วนเปี้ยนแถวคอนโดของมิเกล', photo.progress), true);
  assert.equal(hasPilotSpoiler('หมอโซลวางอาหารแมวและเห็นรถ Aurelia ใกล้คอนโด', vip.progress), false);
});

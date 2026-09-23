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
  assert.equal(result.status, 'wrong_character'); assert.equal(result.progress, state); assert.match(result.dialogue, /สายลมเย็น|แผงไฟ/);
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

const marcus: StoryActorContext = { characterId: 'marcus', locationId: 'office', love: 0 };
const jellie: StoryActorContext = { characterId: 'jellie', locationId: 'mall', love: 0 };

function completeAureliaThread() {
  const { vip } = completeCatFoodThread();
  const n1 = applyStoryCommand(vip.progress, { type: 'node', nodeId: 'aurelia_soul_photo' }, soul, 1000);
  const n2 = applyStoryCommand(n1.progress, { type: 'node', nodeId: 'aurelia_zoom_case' }, soul, 1100);
  const n3 = applyStoryCommand(n2.progress, { type: 'present', itemId: 'key_aurelia_car_photo' }, marcus, 1200);
  const n4 = applyStoryCommand(n3.progress, { type: 'present', itemId: 'key_aurelia_car_photo' }, miguel200, 1300);
  const n5 = applyStoryCommand(n4.progress, { type: 'node', nodeId: 'aurelia_miguel_contract' }, miguel200, 1400);
  const n6 = applyStoryCommand(n5.progress, { type: 'present', itemId: 'key_aurelia_contract_notice' }, mia, 1500);
  const n7 = applyStoryCommand(n6.progress, { type: 'present', itemId: 'key_aurelia_contract_notice' }, jellie, 1600);
  const n8 = applyStoryCommand(n7.progress, { type: 'node', nodeId: 'aurelia_miguel_zoom_rev13' }, miguel200, 1700);
  const n9 = applyStoryCommand(n8.progress, { type: 'present', itemId: 'key_mrsa_fabric_sample' }, jellie, 1800);
  const n10 = applyStoryCommand(n9.progress, { type: 'node', nodeId: 'aurelia_miguel_sewing_box' }, miguel200, 1900);
  return { n1, n2, n3, n4, n5, n6, n7, n8, n9, n10 };
}

test('AiLuv Story 01 aurelia_miguel_watch completes all 10 nodes sequentially and enforces canon guardrails', () => {
  const { vip } = completeCatFoodThread();
  // Cannot start without cat_food completion
  assert.equal(applyStoryCommand(emptyStoryProgress(), { type: 'node', nodeId: 'aurelia_soul_photo' }, soul, 1).status, 'locked');

  const { n1, n2, n3, n4, n5, n6, n7, n8, n9, n10 } = completeAureliaThread();

  assert.equal(n1.status, 'completed');
  assert.deepEqual(n1.grantedItems, ['key_aurelia_car_photo']);

  assert.equal(n2.status, 'completed');
  assert.equal(n2.progress.flags['aurelia.case_number_found'], true);

  assert.equal(n3.status, 'completed');
  assert.equal(n3.progress.flags['aurelia.recovery_unit_identified'], true);

  assert.equal(n4.status, 'completed');
  assert.equal(n4.progress.flags['aurelia.miguel_recognized_logo'], true);

  assert.equal(n5.status, 'completed');
  assert.deepEqual(n5.grantedItems, ['key_aurelia_contract_notice']);

  assert.equal(n6.status, 'completed');
  assert.equal(n6.progress.flags['aurelia.mia_decoded_reference'], true);

  assert.equal(n7.status, 'completed');
  assert.equal(n7.progress.flags['aurelia.jellie_admitted_connection'], true);

  assert.equal(n8.status, 'completed');
  assert.deepEqual(n8.grantedItems, ['key_mrsa_fabric_sample']);

  assert.equal(n9.status, 'completed');
  assert.deepEqual(n9.grantedItems, ['key_mrsa_retrieval_order']);

  assert.equal(n10.status, 'completed');
  assert.equal(n10.progress.flags['aurelia.episode_complete'], true);
  assert.equal(n10.progress.flags['aurelia.mrsa_archive_missing'], true);
  assert.equal(n10.progress.flags['aurelia.miguel_target_reason_known'], true);

  // All 4 new keys are in inventory
  for (const k of ['key_aurelia_car_photo', 'key_aurelia_contract_notice', 'key_mrsa_fabric_sample', 'key_mrsa_retrieval_order']) {
    assert.ok(n10.progress.keyItems[k]);
  }

  // Canon strict guardrail checks
  assert.equal(hasPilotSpoiler('อุบัติเหตุของแม่มิเกลเป็นการลอบสังหาร', n10.progress), true);
  assert.equal(hasPilotSpoiler('มีอาทำงานให้ handler รับคำสั่งมา', n10.progress), true);
  assert.equal(hasPilotSpoiler('Offline Archive ของแม่ถูกขโมยโดยมาร์คัส', n10.progress), true);
});

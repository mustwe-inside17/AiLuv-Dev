import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStoryDialogue, getStoryBubbleTypingDelay, validateStoryDialogue, validateStoryDialogueTurn, resolveStoryInteraction, splitStoryDialogue } from '../services/storyDialogue';
import { useGameStore } from '../store/gameStore';
import { INITIAL_GAME_STATE } from '../constants';
import { emptyStoryProgress, applyStoryCommand } from '../domain/story/storyEngine';
import type { StoryCommand } from '../domain/story/types';
import type { SimulationResponse } from '../types';
const fia = {characterId:'fia' as const,locationId:'gym' as const,love:0};
const command: StoryCommand = {type:'node',nodeId:'radio_hear_noise'};
const heard = () => applyStoryCommand(emptyStoryProgress(),command,fia,1);
const discovered = () => applyStoryCommand(heard().progress,{type:'node',nodeId:'radio_open_locker'},fia,2);
const response = (reply:string) => ({reply,mood:'neutral',love_change:999,energy_cost:999} as SimulationResponse);
test('performance context includes approved beats, excludes fixed dialogue and future revelations', () => {
 const result = heard(); const context = buildStoryDialogue(result,command,'fia');
 assert.ok(context.instruction.includes('ตู้เก็บของ'));
 assert.ok(!context.instruction.includes(result.dialogue));
 assert.ok(!context.instruction.includes('Midnight City'));
 assert.throws(()=>validateStoryDialogue(response('เปิดตู้แล้วเจอวิทยุ NYX เลย'),context));
 assert.equal(validateStoryDialogue(response('แปลกนะ เธอก็ได้ยินเสียงจากตู้เหมือนกันเหรอ ลองฟังด้วยกันไหม'),context).includes('ตู้'),true);
});
test('wrong recipient and locked contexts contain a public hint, never locked scene facts', () => {
 const key:StoryCommand={type:'present',itemId:'key_nyx_radio'};
 const wrong=applyStoryCommand(discovered().progress,key,fia,3);
 const wrongContext=buildStoryDialogue(wrong,key,'fia');
 assert.ok(wrongContext.instruction.includes('เสียงดนตรีใต้แสงดาว'));
 assert.ok(!wrongContext.instruction.includes(wrong.dialogue));
 const locked=applyStoryCommand(heard().progress,{type:'node',nodeId:'radio_erin_recall'}, {characterId:'erin',locationId:'market',love:0},3);
 const context=buildStoryDialogue(locked,{type:'node',nodeId:'radio_erin_recall'},'erin');
 assert.ok(!context.instruction.includes('Midnight City'));
 assert.ok(!context.instruction.includes('เดโม'));
});
test('rejects incomplete discoveries and spoilers; approved radio recollection can mention NYX label and Lucas separately', () => {
 const found=discovered();const context=buildStoryDialogue(found,{type:'node',nodeId:'radio_open_locker'},'fia');
 assert.throws(()=>validateStoryDialogue(response('ว้าว เจอของแล้วล่ะ'),context));
 assert.throws(()=>validateStoryDialogue(response('วิทยุของลูคัส เขาคือ NYX เอาไปถามเอรินได้'),context));
 const key:StoryCommand={type:'present',itemId:'key_nyx_radio'};
 const recall=applyStoryCommand(found.progress,key,{characterId:'erin',locationId:'market',love:0},3);
 const reply='วิทยุสติกเกอร์ NYX นี่ฉันจำได้ ตอนทำ Midnight City ฉันกับลูคัสเคยลองเดโมด้วยกัน';
 assert.equal(validateStoryDialogue(response(reply),buildStoryDialogue(recall,key,'erin')),reply);
});
test('offline fallback commits once; subsequent dialogue does not duplicate progress', async () => {
 const store=useGameStore; store.getState().replaceGameState({...INITIAL_GAME_STATE,currentLocation:'gym'});
 const before=store.getState().story;
 const deps={preview:()=>store.getState().previewStoryAction(command,'fia'),commit:()=>store.getState().performStoryAction(command,'fia'),isCurrent:()=>true};
 const fallback=await resolveStoryInteraction({...deps,generate:async()=>{throw new Error('offline')}});
 assert.equal(fallback.text,heard().dialogue);
 assert.ok(store.getState().story?.flags['radio.noise_heard']);
 const done=await resolveStoryInteraction({...deps,generate:async()=>{assert.ok(store.getState().story?.flags['radio.noise_heard']);return 'เสียงอะไรในตู้นะ'}});
 assert.equal(done.result.status,'already_completed');
 assert.ok(store.getState().story?.flags['radio.noise_heard']);
 const count=Object.keys(store.getState().story!.receipts).length;
 await resolveStoryInteraction({...deps,generate:async()=> 'ยังได้ยินเสียงอยู่เลย ลองไปดูตู้กัน'});
 assert.equal(Object.keys(store.getState().story!.receipts).length,count);
});
test('stale location prevents committing or displaying a generated scene', async()=>{
 const store=useGameStore;store.getState().replaceGameState({...INITIAL_GAME_STATE,currentLocation:'gym'});
 await assert.rejects(resolveStoryInteraction({preview:()=>store.getState().previewStoryAction(command,'fia'),commit:()=>store.getState().performStoryAction(command,'fia'),isCurrent:()=>false,generate:async()=> 'ลองดูตู้ด้วยกันไหม'}));
 assert.deepEqual(store.getState().story,emptyStoryProgress());
});
test('story performance keeps short burst bubbles plus safe action and inner voice', () => {
 const result=heard();const context=buildStoryDialogue(result,command,'fia');
 const turn=validateStoryDialogueTurn({
   reply:'แปลกนะ เธอก็ได้ยินเสียงจากตู้เหมือนกันเหรอ ลองฟังด้วยกันไหม',
   replies:[{text:'แปลกนะ เธอก็ได้ยินเสียงจากตู้เหมือนกันเหรอ'},{text:'ลองฟังด้วยกันไหม'}],
   narrative_action:'ชะงักแล้วหันไปมองตู้เก็บของ',
   thought:'อยากรู้ว่าเสียงนั้นมาจากไหนกันแน่'
 },context);
 assert.deepEqual(turn.bubbles,['แปลกนะ เธอก็ได้ยินเสียงจากตู้เหมือนกันเหรอ','ลองฟังด้วยกันไหม']);
 assert.equal(turn.narrative_action,'ชะงักแล้วหันไปมองตู้เก็บของ');
 assert.ok(turn.thought?.includes('อยากรู้'));
});
test('authored story dialogue can be presented as several bubbles without changing source text', () => {
 const authored='(เธอชะงัก)\n\nได้ยินเหมือนกันใช่ไหม?\n\nลองฟังอีกครั้งด้วยกันนะ';
 assert.deepEqual(splitStoryDialogue(authored),['(เธอชะงัก)','ได้ยินเหมือนกันใช่ไหม?','ลองฟังอีกครั้งด้วยกันนะ']);
});
test('story bubble typing delay is bounded and respects reduced motion', () => {
 assert.equal(getStoryBubbleTypingDelay('สั้น',false),700);
 assert.equal(getStoryBubbleTypingDelay('ย'.repeat(200),false),1900);
 assert.equal(getStoryBubbleTypingDelay('ข้อความใดก็ได้',true),220);
});

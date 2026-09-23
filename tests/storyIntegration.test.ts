import test from 'node:test';
import assert from 'node:assert/strict';
import { useGameStore } from '../store/gameStore';
import { INITIAL_GAME_STATE } from '../constants';
test('game store integrates discovery, wrong recipient, reload and reveal without economy rewards', () => {
 const store = useGameStore;
 store.getState().replaceGameState({...INITIAL_GAME_STATE, currentLocation:'gym'});
 const before = store.getState();
 assert.equal(before.performStoryAction({type:'node',nodeId:'radio_hear_noise'},'fia').status,'completed');
 assert.equal(store.getState().performStoryAction({type:'node',nodeId:'radio_open_locker'},'fia').status,'completed');
 assert.equal(store.getState().performStoryAction({type:'present',itemId:'key_nyx_radio'},'fia').status,'wrong_character');
 const saved = JSON.parse(JSON.stringify(store.getState()));
 store.getState().replaceGameState(saved);
 store.getState().setGameState({currentLocation:'market'});
 assert.equal(store.getState().performStoryAction({type:'present',itemId:'key_nyx_radio'},'erin').status,'completed');
 assert.ok(store.getState().story?.flags['radio.episode_complete']);
 assert.equal(store.getState().energy,before.energy);
 assert.equal(store.getState().gold,before.gold);
 assert.deepEqual(store.getState().inventory,before.energy ? before.inventory : before.inventory);
 assert.equal(store.getState().performStoryAction({type:'present',itemId:'key_nyx_radio'},'erin').status,'already_completed');
});

test('cat-food hear-knock triggers at Miguel Condo with Love 200+ even if activeEvent is present', () => {
 const store = useGameStore;
 store.getState().replaceGameState({
   ...INITIAL_GAME_STATE,
   currentLocation: 'condo',
   loveScores: { ...INITIAL_GAME_STATE.loveScores, miguel: 202 },
   activeEvent: {
     id: 'event_test_123',
     templateId: 'tpl_1',
     characterId: 'peat',
     locationId: 'cafe',
     title: 'Help Peat at Cafe',
     message: 'Random town event',
     aiContext: 'Cafe needs help',
     expiresAt: Date.now() + 600000,
     rewards: { exp: 20, love: 10 }
   }
 });

 const preview = store.getState().previewStoryAction({ type: 'node', nodeId: 'cat_food_hear_knock' }, 'miguel');
 assert.equal(preview.status, 'completed');
 assert.equal(preview.node?.id, 'cat_food_hear_knock');

 const performed = store.getState().performStoryAction({ type: 'node', nodeId: 'cat_food_hear_knock' }, 'miguel');
 assert.equal(performed.status, 'completed');
 assert.ok(store.getState().story?.flags['cat_food.knock_heard']);

 // If at home, it should be locked due to location, not busy
 store.getState().setGameState({ currentLocation: 'home' });
 const homePreview = store.getState().previewStoryAction({ type: 'node', nodeId: 'cat_food_open_door' }, 'miguel');
 assert.equal(homePreview.status, 'locked');
 assert.match(homePreview.dialogue, /สถานที่ในสมุดก่อน/);
});


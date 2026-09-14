import test from 'node:test';
import assert from 'node:assert/strict';
import { STORY_NODES } from '../constants/storyThreads';
import { applyStoryCommand, emptyStoryProgress, matchStoryText, migrateStoryProgress } from '../domain/story/storyEngine';
import { resolveStoryInteraction } from '../services/storyDialogue';
import { useGameStore } from '../store/gameStore';
import { routeStoryInput } from '../domain/story/storyRouter';
import { INITIAL_GAME_STATE } from '../constants';

for (const threadId of ['nyx_radio', 'cat_food_knock']) {
  for (const input of ['actionLabel', 'playerAction', 'button'] as const) {
    test(`${threadId}: typed ${input} → flags → keys → completion, with incomplete AI and save reload`, async () => {
      const store = useGameStore;
      store.getState().replaceGameState({ ...INITIAL_GAME_STATE });
      const energy = store.getState().energy;
      const nodes = STORY_NODES.filter(node => node.threadId === threadId);
      for (const [index, node] of nodes.entries()) {
        store.getState().setGameState({ currentLocation: node.locationId,
          loveScores: { ...store.getState().loveScores, [node.characterId]: node.requires.minLove } });
        const context = { characterId: node.characterId, locationId: node.locationId, love: node.requires.minLove };
        const route = routeStoryInput(input === 'button' ? '@story:' + JSON.stringify({ type: 'node', nodeId: node.id }) : node[input], store.getState().story!, context);
        assert.ok(route.handled);
        const command = route.command;
        assert.ok(command, node.id);
        const result = await resolveStoryInteraction({
          preview: () => store.getState().previewStoryAction(command, node.characterId),
          commit: () => store.getState().performStoryAction(command, node.characterId, 'chat'),
          generate: async () => 'อืม ว่าไงดี', isCurrent: () => true,
        });
        assert.equal(result.result.status, 'completed');
        assert.equal(result.text, node.dialogue);
        node.grants.flags.forEach(flag => assert.ok(store.getState().story!.flags[flag]));
        node.grants.items?.forEach(item => assert.ok(store.getState().story!.keyItems[item]));
        assert.equal(store.getState().story!.receipts[node.id].source, 'chat');
        store.getState().replaceGameState(JSON.parse(JSON.stringify(store.getState())));
        assert.equal(store.getState().story!.activeSession?.nodeId, nodes[index + 1]?.id);
      }
      assert.equal(store.getState().energy, energy);
      assert.equal(Object.keys(store.getState().story!.receipts).length, nodes.length);
      assert.ok(store.getState().story!.flags[threadId === 'nyx_radio' ? 'radio.episode_complete' : 'cat_food.episode_complete']);
    });
  }
}

test('active session accepts continuation, preserves location gates, ignores negated actions', () => {
  const ctx = { characterId: 'miguel' as const, locationId: 'condo' as const, love: 200 };
  const started = applyStoryCommand(emptyStoryProgress(), { type: 'node', nodeId: 'cat_food_hear_knock' }, ctx, 1).progress;
  const command = matchStoryText('เปิดเลยค่ะ', started, ctx)!;
  assert.deepEqual(command, { type: 'node', nodeId: 'cat_food_open_door' });
  assert.equal(applyStoryCommand(started, command, { ...ctx, locationId: 'home' }, 2).status, 'locked');
  assert.equal(matchStoryText('ไม่เปิดประตู', started, ctx), null);
  assert.equal(matchStoryText('วันนี้เหนื่อยจัง', started, ctx), null);
  assert.equal(migrateStoryProgress({ ...started, activeSession: { nodeId: 'cat_food_soul_vip' } }).activeSession?.nodeId, 'cat_food_open_door');
});

test('timeout fallback completes once and late AI cannot grant another receipt', async () => {
  let progress = emptyStoryProgress();
  const ctx = { characterId: 'fia' as const, locationId: 'gym' as const, love: 0 };
  const command = { type: 'node' as const, nodeId: 'radio_hear_noise' };
  const result = await resolveStoryInteraction({
    preview: () => applyStoryCommand(progress, command, ctx, 1),
    commit: () => { const result = applyStoryCommand(progress, command, ctx, 1); progress = result.progress; return result; },
    generate: () => new Promise(() => {}), isCurrent: () => true, timeoutMs: 5,
  });
  assert.equal(result.result.status, 'completed');
  assert.equal(Object.keys(progress.receipts).length, 1);
});

test('router consumes malformed story payloads and releases ordinary chat', () => {
  const ctx = { characterId: 'fia' as const, locationId: 'gym' as const, love: 0 };
  for (const text of ['@story:null', '@story:{', '@story:{"type":"node"}'])
    assert.deepEqual(routeStoryInput(text, emptyStoryProgress(), ctx), { handled: true });
  assert.deepEqual(routeStoryInput('วันนี้กินอะไรดี', emptyStoryProgress(), ctx), { handled: false });
});

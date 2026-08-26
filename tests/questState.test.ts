import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateQuestLoveReward, isBlockingCharacterQuest, migrateCharacterQuest } from '../domain/quests/questState';
import { CharacterQuest, QuestOption } from '../types';

const quest = (status: CharacterQuest['status'], isCompleted = false): CharacterQuest => ({
  id: 'quest_1',
  characterId: 'miguel',
  title: 'Test quest',
  context: 'Context',
  description: 'Description',
  objective: 'Objective',
  choices: [],
  status,
  createdAt: 1,
  isCompleted
});

test('completed and legacy resolved quests do not block future quests', () => {
  assert.equal(isBlockingCharacterQuest(quest('completed', true)), false);
  assert.equal(isBlockingCharacterQuest(migrateCharacterQuest(quest('resolved', true))), false);
});

test('interrupted transient quests recover to active after loading a save', () => {
  assert.equal(migrateCharacterQuest(quest('resolving')).status, 'active');
  assert.equal(migrateCharacterQuest(quest('reward_pending')).status, 'active');
});

test('quest reward is deterministic and clamps unsafe multipliers', () => {
  const option: QuestOption = { id: 'best', text: 'Help', type: 'BEST', multiplier: 99 };
  assert.equal(calculateQuestLoveReward(20, option), 40);
});

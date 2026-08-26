import { CharacterQuest, CharacterQuestChoice, Message, QuestOption } from '../../types';

export const isBlockingCharacterQuest = (quest?: CharacterQuest): boolean => {
  if (!quest) return false;
  return ['pending', 'active', 'resolving', 'reward_pending'].includes(quest.status);
};

export const migrateCharacterQuest = (quest: CharacterQuest): CharacterQuest => {
  if (quest.status === 'completed' || quest.status === 'abandoned') return quest;
  if (quest.isCompleted || quest.status === 'resolved') {
    return { ...quest, status: 'completed', isCompleted: true };
  }
  if (quest.status === 'resolving' || quest.status === 'reward_pending') {
    return { ...quest, status: 'active', isCompleted: false };
  }
  return { ...quest, isCompleted: false };
};

export const migrateQuestMessages = (messages: Message[]): Message[] => messages.map(message => (
  message.characterQuest
    ? { ...message, characterQuest: migrateCharacterQuest(message.characterQuest) }
    : message
));

export const getQuestChoiceMultiplier = (choice: CharacterQuestChoice | QuestOption): number => {
  if ('multiplier' in choice) return Math.max(0.5, Math.min(2, choice.multiplier));
  switch (choice.intention) {
    case 'proactive': return 1.5;
    case 'careful': return 1.2;
    default: return 1;
  }
};

export const calculateQuestLoveReward = (
  baseReward: number | undefined,
  choice: CharacterQuestChoice | QuestOption
): number => Math.max(1, Math.round((baseReward ?? 35) * getQuestChoiceMultiplier(choice)));

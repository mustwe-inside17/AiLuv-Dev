import type { CharacterId, LocationId } from '../../types';

export interface KeyStoryItem {
  id: string;
  type: 'key';
  name: string;
  icon: 'radio' | 'receipt' | 'maid_charm' | 'photo' | 'vip_card' | 'document' | 'fabric' | 'box';
  description: string;
  hint: string;
  hintCharacter: CharacterId;
  hintLocation: LocationId;
  wrongCharacterHints: Partial<Record<CharacterId, string>>;
  defaultHint: string;
  imageUrl?: string;
}

export type StoryKind = 'life' | 'story';

export interface StoryThread {
  id: string;
  sequence: number;
  kind: StoryKind;
  icon: 'radio' | 'door' | 'shield';
  title: string;
  subtitle: string;
  intro: string;
  completion: string;
  coverImage?: string;
}

export interface StoryRevealRule {
  id: string;
  unlockFlag?: string;
  patterns: string[];
}

export interface StoryNode {
  id: string;
  threadId: string;
  title: string;
  characterId: CharacterId;
  locationId: LocationId;
  trigger: 'conversation' | 'inspect' | 'present';
  actionLabel: string;
  playerAction: string;
  requires: { flags: string[]; minLove: number; itemId?: string };
  textCues: string[];
  dialogue: string;
  summary: string;
  grants: { flags: string[]; items?: string[] };
  repeatDialogue: string;
  guide: string;
  facts: string[];
  requiredMentions?: string[][];
}

export interface StoryReceipt {
  nodeId: string;
  characterId: CharacterId;
  completedAt: number;
  source: 'chat' | 'button';
}

export interface StoryProgress {
  schemaVersion: 1;
  activeSession?: { threadId: string; nodeId: string; updatedAt: number };
  flags: Record<string, true>;
  keyItems: Record<string, { acquiredAt: number; sourceNodeId: string }>;
  receipts: Record<string, StoryReceipt>;
  journalReadCount: number;
}

export type StoryCommand = { type: 'node'; nodeId: string } | { type: 'present'; itemId: string };
export interface StoryActorContext {
  characterId: CharacterId;
  locationId: LocationId;
  love: number;
  busy?: boolean;
}
export interface StoryResult {
  status: 'completed' | 'already_completed' | 'locked' | 'wrong_character' | 'invalid';
  progress: StoryProgress;
  dialogue: string;
  playerAction?: string;
  node?: StoryNode;
  grantedItems: string[];
}

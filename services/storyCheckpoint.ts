import { migrateStoryProgress } from '../domain/story/storyEngine';
import type { StoryProgress } from '../domain/story/types';

const key = (userId: string) => `ailuv_story_v1:${userId}`;

/** Small per-account journal checkpoint, not a copy of private chat or the economy. */
export function writeStoryCheckpoint(userId: string, story: StoryProgress): boolean {
  try { localStorage.setItem(key(userId), JSON.stringify(story)); return true; }
  catch { return false; }
}

export function mergeStoryCheckpoint(userId: string, cloud?: StoryProgress): StoryProgress {
  let local: StoryProgress | undefined;
  try { local = migrateStoryProgress(JSON.parse(localStorage.getItem(key(userId)) || 'null')); } catch { /* Cloud remains usable. */ }
  return migrateStoryProgress({
    ...cloud,
    receipts: { ...local?.receipts, ...cloud?.receipts },
    journalReadCount: Math.max(local?.journalReadCount || 0, cloud?.journalReadCount || 0),
  });
}

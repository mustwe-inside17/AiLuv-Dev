import { matchStoryText } from './storyEngine';
import type { StoryActorContext, StoryCommand, StoryProgress } from './types';

/** Run before normal chat, energy charges, date recognition or AI side effects. */
export function routeStoryInput(text: string, progress: StoryProgress, context: StoryActorContext):
  { handled: false } | { handled: true; command?: StoryCommand; playerText?: string } {
  if (text.startsWith('@story:')) {
    try {
      const value = JSON.parse(text.slice(7));
      if (value?.type === 'node' && typeof value.nodeId === 'string')
        return { handled: true, command: { type: 'node', nodeId: value.nodeId } };
      if (value?.type === 'present' && typeof value.itemId === 'string')
        return { handled: true, command: { type: 'present', itemId: value.itemId } };
    } catch { /* Malformed UI commands must never reach normal AI. */ }
    return { handled: true };
  }
  const command = matchStoryText(text, progress, context);
  return command ? { handled: true, command, playerText: text } : { handled: false };
}

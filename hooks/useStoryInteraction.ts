import { useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { CharacterId, Message, UserProfile } from '../types';
import { Mood, RelationshipTier } from '../types';
import type { StoryCommand } from '../domain/story/types';
import { buildStoryDialogue, resolveStoryInteraction } from '../services/storyDialogue';
import { generateResponse } from '../services/mockAi';
import { auth } from '../services/firebase';
import { useGameStore } from '../store/gameStore';

export function useStoryInteraction({ messagesMap, setMessagesMap, userProfile, setIsTyping }: {
  messagesMap: Record<CharacterId, Message[]>;
  setMessagesMap: Dispatch<SetStateAction<Record<CharacterId, Message[]>>>;
  userProfile: UserProfile | null;
  setIsTyping: Dispatch<SetStateAction<boolean>>;
}) {
  const busy = useRef(false);
  const run = async (command: StoryCommand, charId: CharacterId, originalText?: string, retryId?: string) => {
    if (busy.current) return;
    const start = useGameStore.getState();
    const preview = start.previewStoryAction(command, charId);
    if (preview.status === 'invalid') return;
    const retry = retryId ? messagesMap[charId]?.find(m => m.id === retryId && m.storyInteraction?.status !== 'complete') : undefined;
    if (retryId && !retry) return;
    const id = retry?.id || `story_${crypto.randomUUID()}`;
    const playerText = retry?.storyInteraction?.playerText || originalText || preview.playerAction || 'หยิบเบาะแสให้ดู';
    const title = preview.node?.title || 'เบาะแสจากของชิ้นนี้';
    const sourceVersion = JSON.stringify(start.story?.receipts || {});
    const account = auth.currentUser?.uid;
    const isCurrent = () => auth.currentUser?.uid === account && useGameStore.getState().currentLocation === start.currentLocation &&
      JSON.stringify(useGameStore.getState().story?.receipts || {}) === sourceVersion;
    busy.current = true;
    setIsTyping(true);
    const pending: Message = { id, sender: 'system', text: 'กำลังต่อเรื่องราว…', timestamp: Date.now(), storyInteraction: { command, playerText, title, status: 'pending' } };
    setMessagesMap(prev => ({ ...prev, [charId]: retry
      ? prev[charId].map(m => m.id === id ? pending : m)
      : [...(prev[charId] || []), { id: `${id}_user`, sender: 'user', text: playerText, timestamp: Date.now() }, pending] }));
    try {
      const response = await resolveStoryInteraction({
        preview: () => useGameStore.getState().previewStoryAction(command, charId),
        isCurrent,
        commit: () => useGameStore.getState().performStoryAction(command, charId, originalText ? 'chat' : 'button'),
        generate: async result => {
          const context = buildStoryDialogue(result, command, charId);
          const turn = await generateResponse(playerText, charId, start.loveScores[charId] || 0,
            start.relationshipTiers[charId] || RelationshipTier.STRANGER, start.currentMoods[charId] || Mood.NEUTRAL,
            (messagesMap[charId] || []).filter(m => !m.storyInteraction || m.storyInteraction.status === 'complete'),
            userProfile, start.hasTrainedVisit, start.activeTask?.type || null, start.energy, start.stats, true,
            start.relationshipTiers, start.activeEvent, start.memories[charId] || [], start.metCharacters, false,
            start.unlockedTracks, null, [], start.giftCooldowns, start.drunkTimers, '', start.equippedStyle,
            start.currentDateScene, start.chemistryScores?.[charId] || 0, [], context);
          return turn.reply;
        },
      });
      setMessagesMap(prev => ({ ...prev, [charId]: (prev[charId] || []).map(m => m.id === id ? {
        ...m, sender: charId, text: response.text, storyInteraction: { command, playerText, title, status: 'complete' }
      } : m) }));
    } catch {
      // Stale account/location or changed progress cannot commit, even with fallback.
      if (auth.currentUser?.uid === account) setMessagesMap(prev => ({ ...prev, [charId]: (prev[charId] || []).map(m => m.id === id ? {
        ...m, text: 'ยังต่อบทสนทนาไม่สำเร็จ ลองอีกครั้งเมื่อพร้อม ของและความคืบหน้ายังเหมือนเดิม',
        storyInteraction: { command, playerText, title, status: 'error' }
      } : m) }));
    } finally { busy.current = false; setIsTyping(false); }
  };
  return { run, busy };
}

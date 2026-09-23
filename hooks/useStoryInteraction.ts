import { useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { CharacterId, Message, StoryKeyDelivery, UserProfile } from '../types';
import { Mood, RelationshipTier } from '../types';
import type { StoryCommand } from '../domain/story/types';
import { buildStoryDialogue, getStoryBubbleTypingDelay, resolveStoryInteraction } from '../services/storyDialogue';
import { generateResponse } from '../services/mockAi';
import { auth } from '../services/firebase';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { KEY_STORY_ITEMS, STORY_THREADS, STORY_NODES } from '../constants/storyThreads';

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
    const presentedKey = command.type === 'present' ? KEY_STORY_ITEMS.find(item => item.id === command.itemId) : undefined;
    const sourceVersion = JSON.stringify(start.story?.receipts || {});
    const account = auth.currentUser?.uid;
    const isCurrent = () => auth.currentUser?.uid === account && useGameStore.getState().currentLocation === start.currentLocation &&
      JSON.stringify(useGameStore.getState().story?.receipts || {}) === sourceVersion;
    busy.current = true;
    setIsTyping(true);
    const pending: Message = { id, sender: 'system', text: 'กำลังต่อเรื่องราว…', timestamp: Date.now(), storyInteraction: { command, playerText, title, status: 'pending' } };
    setMessagesMap(prev => ({ ...prev, [charId]: retry
      ? prev[charId].map(m => m.id === id ? pending : m)
      : [...(prev[charId] || []), {
          id: `${id}_user`,
          sender: 'user',
          text: playerText,
          timestamp: Date.now(),
          storyKeyPresentation: presentedKey ? {
            itemId: presentedKey.id,
            name: presentedKey.name,
            imageUrl: presentedKey.imageUrl,
            icon: presentedKey.icon,
            description: presentedKey.description,
            hint: presentedKey.hint,
          } : undefined,
        }, pending] }));
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
          return turn;
        },
      });
      const node = response.result?.status === 'completed' ? response.result.node : undefined;
      const grantedItemId = response.result?.status === 'completed' ? response.result.grantedItems?.[0] : undefined;
      const grantedKey = grantedItemId ? KEY_STORY_ITEMS.find(k => k.id === grantedItemId) : undefined;
      const thread = STORY_THREADS.find(t => t.id === node?.threadId);

      const delivery: StoryKeyDelivery | undefined = grantedKey ? {
        itemId: grantedKey.id,
        name: grantedKey.name,
        imageUrl: grantedKey.imageUrl,
        icon: grantedKey.icon,
        description: grantedKey.description,
        hint: grantedKey.hint,
        claimed: false,
        threadTitle: thread?.title,
        nodeTitle: node?.title,
        nodeSummary: node?.summary,
      } : undefined;

      const bubbles = response.bubbles.length ? response.bubbles : [response.text];
      const timestampBase = Date.now();
      const createBubble = (text: string, index: number): Message => ({
        ...pending,
        id: `${id}_${index}`,
        sender: charId,
        text,
        timestamp: timestampBase + index,
        narrativeContent: index === 0 ? response.narrativeAction : undefined,
        thought: index === 0 ? response.thought : undefined,
        storyInteraction: {
          command,
          playerText,
          title,
          status: 'complete',
          sequenceIndex: index,
          sequenceTotal: bubbles.length,
        },
        storyKeyDelivery: index === bubbles.length - 1 ? delivery : undefined,
      });
      const reducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

      for (let index = 0; index < bubbles.length; index += 1) {
        const bubble = createBubble(bubbles[index], index);
        setMessagesMap(prev => ({
          ...prev,
          [charId]: index === 0
            ? (prev[charId] || []).flatMap(message => message.id === id ? [bubble] : [message])
            : [...(prev[charId] || []), bubble]
        }));
        if (index < bubbles.length - 1) {
          await new Promise(resolve => window.setTimeout(resolve, getStoryBubbleTypingDelay(bubbles[index + 1], reducedMotion)));
        }
      }

      if (response.result?.status === 'completed') {
        // ตรวจสอบว่าเคลียร์ story flag หรือจบเบาะแสตอนสุดท้ายแล้วหรือไม่
        const isEpisodeComplete = node?.grants?.flags?.some(f => f.endsWith('.episode_complete')) ||
          (node?.id === 'radio_erin_recall' || node?.id === 'cat_food_soul_vip');

        // หากจบ episode ทั้งหมด ให้เปิด modal ฉลองหลังตัวละครพูดจบ
        if (isEpisodeComplete && thread) {
          const threadNodes = STORY_NODES.filter(n => n.threadId === thread.id);
          setTimeout(() => {
            useUIStore.getState().setStoryEventModal({
              type: 'episode_completed',
              nodeTitle: node?.title,
              nodeSummary: node?.summary,
              threadTitle: thread.title,
              threadCoverImage: thread.coverImage,
              episodeSummary: thread.completion,
              completedNodes: threadNodes.map(n => ({ title: n.title, summary: n.summary })),
            });
          }, 900);
        } else if (!grantedKey && node) {
          // หากสำเร็จเป็น node ย่อยที่ไม่มีการส่งมอบไอเทมคีย์ แสดงแจ้งเตือนความคืบหน้า
          setTimeout(() => {
            useUIStore.getState().setStoryEventModal({
              type: 'node_completed',
              nodeTitle: node.title,
              nodeSummary: node.summary,
              threadTitle: thread?.title,
            });
          }, 1500);
        }
      }
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

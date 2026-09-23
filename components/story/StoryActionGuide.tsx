import React from 'react';
import { DoorOpen, KeyRound, Sparkles, ChevronRight, Radio, Eye } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { emptyStoryProgress, getAvailableStoryNodes } from '../../domain/story/storyEngine';
import type { StoryCommand, StoryNode } from '../../domain/story/types';
import type { CharacterId, Message } from '../../types';

interface StoryActionGuideProps {
  characterId: CharacterId;
  disabled: boolean;
  onAction: (command: StoryCommand) => void;
  messages?: Message[];
}

export function StoryActionGuide({ characterId, disabled, onAction, messages = [] }: StoryActionGuideProps) {
  const story = useGameStore(state => state.story) || emptyStoryProgress();
  const location = useGameStore(state => state.currentLocation);
  const love = useGameStore(state => state.loveScores[characterId] || 0);

  const available = getAvailableStoryNodes(story);
  const activeActions = available.filter(node => {
    if (node.characterId !== characterId || node.locationId !== location) return false;
    if (love < node.requires.minLove) return false;
    if (node.trigger === 'present') {
      if (!(node.requires.itemId && story.keyItems[node.requires.itemId])) return false;
    }

    // Check if player has already entered or begun this story clue thread
    const flagPrefix = node.threadId === 'nyx_radio' ? 'radio.' : 'cat_food.';
    const hasThreadProgress = Object.keys(story.flags).some(f => f.startsWith(flagPrefix) && story.flags[f]);
    const hasActiveSession = story.activeSession?.threadId === node.threadId;

    // Check if recent messages in this chat conversation touched on clue topics
    const recentMessages = messages.slice(-5);
    const mentionsTopic = recentMessages.some(m => {
      const text = (m.text || '').toLowerCase();
      if (node.textCues?.some(cue => new RegExp(cue, 'i').test(text))) return true;
      if (node.threadId === 'nyx_radio' && (text.includes('วิทยุ') || text.includes('เสียง') || text.includes('ตู้') || text.includes('ผี') || text.includes('nyx') || text.includes('เพลง'))) return true;
      if (node.threadId === 'cat_food_knock' && (text.includes('อาหารแมว') || text.includes('กล่อง') || text.includes('ใบเสร็จ') || text.includes('พวงกุญแจ') || text.includes('อิคุระ') || text.includes('เคาะ') || text.includes('vip'))) return true;
      return false;
    });

    // Only show persistent action prompt if thread has entered active play or context is established
    return hasThreadProgress || hasActiveSession || mentionsTopic;
  });

  if (activeActions.length === 0) return null;

  const getNodeIcon = (node: StoryNode) => {
    if (node.trigger === 'present') return <KeyRound size={16} className="text-amber-500 animate-bounce-soft" />;
    if (node.id.includes('door') || node.id.includes('knock')) return <DoorOpen size={16} className="text-rose-500 animate-pulse" />;
    if (node.id.includes('locker') || node.id.includes('radio')) return <Radio size={16} className="text-purple-500 animate-pulse" />;
    if (node.trigger === 'inspect') return <Eye size={16} className="text-indigo-500" />;
    return <Sparkles size={16} className="text-amber-500 animate-pulse" />;
  };

  return (
    <div
      id="story-action-guide-container"
      className="mb-2 w-full flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      {activeActions.map(node => {
        const command: StoryCommand = node.trigger === 'present'
          ? { type: 'present', itemId: node.requires.itemId! }
          : { type: 'node', nodeId: node.id };

        return (
          <div
            key={node.id}
            id={`story-action-guide-${node.id}`}
            className="flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-pink-500/15 dark:from-amber-950/40 dark:via-purple-950/30 dark:to-pink-950/40 border border-amber-400/40 dark:border-amber-500/30 rounded-xl shadow-xs backdrop-blur-md transition-all hover:border-amber-400"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-7 h-7 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-amber-300/40 flex items-center justify-center shrink-0 shadow-xs">
                {getNodeIcon(node)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Sparkles size={10} /> เบาะแสพร้อมทำ
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {node.actionLabel}
                </p>
              </div>
            </div>

            <button
              type="button"
              id={`story-action-btn-${node.id}`}
              disabled={disabled}
              onClick={() => onAction(command)}
              className="shrink-0 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <span>ทำทันที</span>
              <ChevronRight size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

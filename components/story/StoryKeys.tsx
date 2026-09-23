import React from 'react';
import { KeyRound, Radio, BookOpen, Search, MapPin, User } from 'lucide-react';
import { KEY_STORY_ITEMS } from '../../constants/storyThreads';
import type { KeyStoryItem, StoryProgress } from '../../domain/story/types';
import { StoryClueArt } from './StoryClueArt';
import { useUIStore } from '../../store/uiStore';
import { CHARACTER_DATA } from '../../constants';
import '../../styles/story.css';

export function StoryKeys({ progress, onOpenJournal }: { progress: StoryProgress; onOpenJournal: () => void }) {
  const items = KEY_STORY_ITEMS.filter(item => progress.keyItems[item.id]);

  const handleInspect = (item: KeyStoryItem) => {
    useUIStore.getState().setStoryEventModal({
      type: 'item_received',
      item,
      threadTitle: 'ของสำคัญในกระเป๋า',
      nodeTitle: item.name,
      nodeSummary: item.description,
    });
  };

  return (
    <section className="story-ui story-key-list" aria-label="Key Story Items">
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-purple-500/10 border border-purple-200/60 dark:border-purple-800/40 text-purple-950 dark:text-purple-200 text-xs">
        <KeyRound size={16} className="text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
        <p>Key คือของสำคัญที่ใช้เปิดเรื่องราว เก็บแยกจากของใช้ทั่วไป ไม่สูญหายและขายไม่ได้</p>
      </div>

      {items.length === 0 ? (
        <div className="story-empty py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-slate-800 flex items-center justify-center text-purple-500 dark:text-purple-400 mb-3 shadow-inner">
            <Radio size={32} aria-hidden="true" />
          </div>
          <h3 className="font-bold text-base text-slate-800 dark:text-white">ยังไม่มีของสำคัญในกระเป๋า</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mt-1">
            บางบทสนทนาหรือการสืบหาความจริงจะพาคุณไปพบของที่มีเรื่องราว ลองเปิดสมุดเพื่อเริ่มติดตาม
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {items.map(item => {
            const charName = CHARACTER_DATA[item.hintCharacter]?.name || item.hintCharacter;

            return (
              <article
                className="story-key-card p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-purple-200/80 dark:border-purple-500/30 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-3.5 group cursor-pointer"
                key={item.id}
                onClick={() => handleInspect(item)}
              >
                {/* Visual Item Art with glow effect */}
                <div className="shrink-0 flex sm:flex-col items-center justify-center self-center sm:self-start">
                  <div className="p-1 rounded-2xl bg-gradient-to-tr from-purple-100 to-pink-50 dark:from-slate-700 dark:to-slate-800 border border-purple-200/60 dark:border-purple-600/40 shadow-xs group-hover:scale-105 transition-transform duration-200">
                    <StoryClueArt item={item} size="lg" />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        <KeyRound size={10} /> KEY ITEM
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInspect(item);
                        }}
                        className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-800 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                      >
                        <Search size={11} /> ตรวจดูของ
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-snug mt-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Hint and Location Tag */}
                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-medium">
                      <User size={11} className="shrink-0" />
                      <span>เกี่ยวข้องกับ {charName}</span>
                    </div>

                    <p className="story-hint text-[11px] text-gray-500 dark:text-gray-400 italic line-clamp-1">
                      "{item.hint}"
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <button className="story-button secondary w-full py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors" onClick={onOpenJournal}>
        <BookOpen size={16} aria-hidden="true" /> เปิดสมุดเรื่องราว
      </button>
    </section>
  );
}

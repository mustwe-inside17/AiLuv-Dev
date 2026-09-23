import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Check, ChevronRight, HelpCircle, MapPin, KeyRound, Lock, Sparkles, X, Maximize2 } from 'lucide-react';
import { useGameStore } from '../../../store/gameStore';
import { KEY_STORY_ITEMS, STORY_NODES, STORY_THREADS } from '../../../constants/storyThreads';
import { emptyStoryProgress, getNextStoryNode } from '../../../domain/story/storyEngine';
import { LOCATIONS, TRAVEL_COST } from '../../../constants';
import type { LocationId } from '../../../types';
import type { StoryKind } from '../../../domain/story/types';
import { StoryKeys } from '../../story/StoryKeys';
import { StoryThreadIcon } from '../../story/StoryIcon';
import '../../../styles/story.css';

export function StoryJournalApp({ onClose, onTravel }: { onClose: () => void; onTravel?: (location: LocationId) => void }) {
  const progress = useGameStore(state => state.story) || emptyStoryProgress();
  const markRead = useGameStore(state => state.markStoryJournalRead);
  const loveScores = useGameStore(state => state.loveScores);
  const currentLocation = useGameStore(state => state.currentLocation);
  const energy = useGameStore(state => state.energy);
  const skills = useGameStore(state => state.unlockedSkills);
  const [tab, setTab] = useState<'thread' | 'keys'>('thread');
  const [threadCategory, setThreadCategory] = useState<'all' | StoryKind>('all');
  const [showGuide, setShowGuide] = useState(false);
  const [previewCover, setPreviewCover] = useState<{ url: string; title: string; subtitle: string } | null>(null);
  const orderedThreads = [...STORY_THREADS].sort((a, b) => a.sequence - b.sequence);
  const [selectedThreadId, setSelectedThreadId] = useState(orderedThreads[0]?.id || '');
  const count = Object.keys(progress.receipts).length;
  useEffect(() => { markRead(); }, [count, markRead]);

  const filteredThreads = threadCategory === 'all' 
    ? orderedThreads 
    : orderedThreads.filter(t => t.kind === threadCategory);

  const thread = filteredThreads.find(item => item.id === selectedThreadId) || filteredThreads[0] || orderedThreads[0];
  if (!thread) return null;

  const next = getNextStoryNode(progress, thread.id);
  const nodes = STORY_NODES.filter(node => node.threadId === thread.id);
  const completed = nodes.filter(node => progress.receipts[node.id]);
  const isComplete = nodes.length > 0 && completed.length === nodes.length;
  const travelCost = next && currentLocation !== next.locationId ? Math.max(0, TRAVEL_COST - (skills.includes('huh_again_pls') ? 2 : 0)) : 0;
  const keyCount = KEY_STORY_ITEMS.filter(item => progress.keyItems[item.id]).length;

  return <section className="story-ui story-journal" aria-label="สมุดเรื่องราว">
    <header className="story-journal-header">
      <button type="button" className="story-icon-button" aria-label="กลับหน้ามือถือ" onClick={onClose}><ArrowLeft size={20} /></button>
      <div>
        <h2>สมุดเรื่องราว</h2>
        <p>บันทึกเบาะแส ความลับ และเรื่องราวในเมือง</p>
      </div>
      <button type="button" className="story-icon-button" aria-label="วิธีเล่นเรื่องราว" aria-expanded={showGuide} onClick={() => setShowGuide(!showGuide)}><HelpCircle size={20} /></button>
    </header>
    <nav className="story-tabs" aria-label="หมวดสมุด">
      <button type="button" aria-pressed={tab === 'thread'} onClick={() => setTab('thread')}><BookOpen size={16} /> เรื่องราว</button>
      <button type="button" aria-pressed={tab === 'keys'} onClick={() => setTab('keys')}><KeyRound size={16} /> ของสำคัญ <span>{keyCount}</span></button>
    </nav>
    <div className="story-journal-body">
      {showGuide && <section className="story-guide">
        <div className="story-section-heading">
          <h3>คุย · ค้นพบ · ส่งต่อ</h3>
          <button type="button" className="story-icon-button" aria-label="ปิดวิธีเล่น" onClick={() => setShowGuide(false)}><X size={16} /></button>
        </div>
        <ol>
          <li>ชวนคุยตามปกติ หรือแตะไอคอนกุญแจบนหัวแชท</li>
          <li>Key ที่พบจะเก็บไว้ในแท็บของสำคัญ</li>
          <li>ตามคำใบ้ไปหาอีกคน แล้วหยิบของให้ดู</li>
        </ol>
        <p>หมวด <strong>Ailuv Story</strong> คือเรื่องราวหลักที่มีความลับและเบาะแสสำคัญ · ให้ผิดคนของไม่หาย</p>
      </section>}
      {tab === 'keys' ? <StoryKeys progress={progress} onOpenJournal={() => setTab('thread')} /> : <>
        {/* Category Filter Pills: ทั้งหมด, AiLuv Story, AiLuv Life */}
        <div className="story-category-filter" role="tablist" aria-label="เลือกหมวดเรื่องราว">
          <button
            type="button"
            role="tab"
            aria-selected={threadCategory === 'all'}
            className={threadCategory === 'all' ? 'active' : ''}
            onClick={() => {
              setThreadCategory('all');
            }}
          >
            ทั้งหมด ({orderedThreads.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={threadCategory === 'story'}
            className={threadCategory === 'story' ? 'active highlight-story' : ''}
            onClick={() => {
              setThreadCategory('story');
              const firstStory = orderedThreads.find(t => t.kind === 'story');
              if (firstStory) setSelectedThreadId(firstStory.id);
            }}
          >
            <Sparkles size={13} className="text-amber-400" /> Ailuv Story ({orderedThreads.filter(t => t.kind === 'story').length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={threadCategory === 'life'}
            className={threadCategory === 'life' ? 'active' : ''}
            onClick={() => {
              setThreadCategory('life');
              const firstLife = orderedThreads.find(t => t.kind === 'life');
              if (firstLife) setSelectedThreadId(firstLife.id);
            }}
          >
            AiLuv Life ({orderedThreads.filter(t => t.kind === 'life').length})
          </button>
        </div>

        <div className="story-section-heading">
          <span className="story-eyebrow">
            {threadCategory === 'story' ? 'AILUV STORY' : threadCategory === 'life' ? 'AILUV LIFE' : 'เลือกเส้นเรื่อง'}
          </span>
          <span className="story-muted">
            {threadCategory === 'story' ? 'เรื่องราวหลักและความลับ' : threadCategory === 'life' ? 'เรื่องเล็ก ๆ ในชีวิตประจำวัน' : 'เรื่องราวทั้งหมดในเมือง'}
          </span>
        </div>

        <div className="story-thread-switcher" role="list" aria-label="เลือกเส้นเรื่อง">
          {filteredThreads.map(item => {
            const itemNodes = STORY_NODES.filter(node => node.threadId === item.id);
            const done = itemNodes.filter(node => progress.receipts[node.id]).length;
            const isStoryKind = item.kind === 'story';
            return <button
              type="button"
              role="listitem"
              key={item.id}
              aria-pressed={thread.id === item.id}
              className={isStoryKind ? 'story-thread-item-story' : ''}
              onClick={() => setSelectedThreadId(item.id)}
            >
              <span className={`story-switch-icon ${isStoryKind ? 'story-icon-story' : ''}`}>
                <StoryThreadIcon icon={item.icon} size={20} />
              </span>
              <span>
                <div className="flex items-center gap-1">
                  <span className={`story-kind-tag ${isStoryKind ? 'story-kind-tag-story' : 'story-kind-tag-life'}`}>
                    {isStoryKind ? 'STORY' : 'LIFE'}
                  </span>
                  <strong>{item.title}</strong>
                </div>
                <small>{done}/{itemNodes.length} เบาะแส {itemNodes.length > 0 && done === itemNodes.length ? '· สำเร็จครบแล้ว' : ''}</small>
              </span>
              <ChevronRight size={15} />
            </button>;
          })}
        </div>

        <div className="story-section-heading story-current-heading">
          <span className="story-eyebrow">{isComplete ? 'ความทรงจำของคุณ' : next ? 'กำลังตามเรื่องนี้' : 'ยังไม่ปลดล็อก'}</span>
          <span className="story-muted">{completed.length}/{nodes.length} เบาะแส</span>
        </div>

        <article className={`story-thread-card relative overflow-hidden ${thread.kind === 'story' ? 'story-thread-card-story' : ''}`}>
          {/* Dedicated Showcase Cover Image Banner */}
          <div 
            className="relative w-full h-48 sm:h-56 bg-slate-950 overflow-hidden cursor-pointer group select-none"
            onClick={() => {
              if (thread.coverImage) {
                setPreviewCover({ url: thread.coverImage, title: thread.title, subtitle: thread.subtitle });
              }
            }}
          >
            {thread.coverImage ? (
              <img
                src={thread.coverImage}
                alt={thread.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              /* Fallback stylish visual banner */
              <div className={`w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br ${
                thread.kind === 'story'
                  ? 'from-purple-950 via-pink-950 to-slate-950'
                  : 'from-slate-900 via-indigo-950 to-slate-950'
              }`}>
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md mb-2 text-white/40">
                  <StoryThreadIcon icon={thread.icon} size={32} />
                </div>
                <span className="text-[11px] font-bold text-white/50 tracking-wider">AILUV STORY COVER</span>
              </div>
            )}

            {/* Gradient vignette for seamless visual transition into card body */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--story-surface)] via-black/20 to-black/40 pointer-events-none" />

            {/* Top Bar on the Cover Image */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10.5px] font-bold text-white shadow-sm">
                <span className={`w-2 h-2 rounded-full ${thread.kind === 'story' ? 'bg-pink-400' : 'bg-emerald-400'}`} />
                {thread.kind === 'life' ? 'AILUV LIFE' : 'AILUV STORY'} · {String(thread.sequence).padStart(2, '0')}
              </span>

              <div className="flex items-center gap-1.5 pointer-events-auto">
                {isComplete && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md border border-emerald-400/30 text-[10px] font-bold text-white shadow-sm">
                    <Check size={12} />
                    จบตอนแล้ว
                  </span>
                )}
                {thread.coverImage && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewCover({ url: thread.coverImage!, title: thread.title, subtitle: thread.subtitle });
                    }}
                    className="py-1 px-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white/90 hover:text-white transition-all shadow-sm flex items-center gap-1.5 text-[10.5px] font-semibold"
                    title="แตะดูภาพหน้าปกขนาดเต็ม"
                  >
                    <Maximize2 size={12} />
                    <span>ดูภาพเต็ม</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Progress Counter on the Cover Image */}
            <div className="absolute bottom-2.5 right-3 z-10 pointer-events-none">
              <span className="text-[10px] font-semibold text-white/85 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15 shadow-sm">
                ค้นพบ {completed.length}/{nodes.length} เบาะแส
              </span>
            </div>
          </div>

          {/* Card Content Body */}
          <div className="story-thread-body">
            <div className="story-thread-title">
              <div className={`story-radio-icon ${thread.kind === 'story' ? 'story-radio-story' : ''}`}>
                <StoryThreadIcon icon={thread.icon} size={28} />
                <small>{thread.kind === 'life' ? 'LIFE' : 'STORY'}</small>
              </div>
              <div className="min-w-0">
                <span className="story-eyebrow">
                  {thread.kind === 'life' ? 'AILUV LIFE' : 'AILUV STORY'} · {String(thread.sequence).padStart(2, '0')}
                </span>
                <h3>{thread.title}</h3>
                <p>{thread.subtitle}</p>
              </div>
            </div>
            <div className="story-progress" aria-label={`ค้นพบ ${completed.length} จาก ${nodes.length} ช่วง`}>
              {nodes.map(node => <span key={node.id} className={progress.receipts[node.id] ? 'done' : ''} />)}
            </div>
            {next ? <div className="story-next" aria-label="ขั้นตอนถัดไป">
              <span className="story-eyebrow">เบาะแสถัดไป</span>
              <h3>{next.actionLabel}</h3>
              <p>{next.guide}</p>
              <div className="story-location">
                <MapPin size={14} />
                <span>สืบหาเบาะแส · {LOCATIONS[next.locationId].name}</span>
              </div>
              <p className="story-requirement">
                <Check size={14} />
                {next.requires.minLove === 0 ? 'พร้อมคุย · ไม่กั้น Love' : `ระดับความสนิท ${Math.floor(loveScores[next.characterId] || 0)} / ${next.requires.minLove} Love`}
              </p>
              <button
                type="button"
                className="story-button"
                disabled={!onTravel || energy < travelCost}
                onClick={() => onTravel?.(next.locationId)}
              >
                เดินทางไป {LOCATIONS[next.locationId].name}
                <ChevronRight size={16} />
              </button>
              <small>
                {energy < travelCost
                  ? `พลังงานไม่พอ · ต้องใช้ ${travelCost} Energy`
                  : travelCost
                  ? `เดินทาง ${travelCost} Energy`
                  : 'อยู่ที่นี่แล้ว · เปิดแชทสืบเบาะแสได้เลย'}
              </small>
            </div> : isComplete ? <div className="story-next complete">
              <span className="story-eyebrow"><Check size={14} /> ค้นพบครบตอนแล้ว</span>
              <h3>จบเรื่องราวนี้แล้ว</h3>
              <p>{thread.completion}</p>
            </div> : <div className="story-next locked" aria-label="ยังไม่ปลดล็อกเรื่องราว">
              <span className="story-eyebrow"><Lock size={14} /> ยังไม่ปลดล็อกเรื่องราว</span>
              <h3>ยังไม่ถึงเวลาของเรื่องราวนี้</h3>
              <div className="story-locked-box">
                <Lock size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p>
                  {thread.id === 'aurelia_miguel_watch'
                    ? 'ต้องสืบหาเบาะแสและคลี่คลายเรื่องราวใน "เสียงเคาะประตูปริศนา" ให้สำเร็จก่อน จึงจะเริ่มปะติดปะต่อเรื่องราวนี้ได้'
                    : 'ต้องทำตามเงื่อนไขหรือค้นหาเบาะแสจากเรื่องราวก่อนหน้าในเมืองเพื่อเริ่มต้น'}
                </p>
              </div>
            </div>}
          </div>
        </article>

        {count === 0 && !showGuide && (
          <button type="button" className="story-onboarding" onClick={() => setShowGuide(true)}>
            <KeyRound size={18} />
            <span>
              <strong>เริ่มจากความสงสัยเล็ก ๆ</strong>
              <small>รู้จัก Key Story ใน 3 ขั้นตอน</small>
            </span>
            <ChevronRight size={16} />
          </button>
        )}

        {completed.length > 0 && (
          <section className="story-memories">
            <h3>สิ่งที่คุณค้นพบ ({completed.length}/{nodes.length})</h3>
            {completed.map((node, index) => (
              <details key={node.id}>
                <summary>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {node.title}
                  <Check size={15} />
                </summary>
                <p>{node.summary}</p>
              </details>
            ))}
          </section>
        )}
      </>}
    </div>

    {/* Full Cover Art Preview Modal */}
    {previewCover && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
        onClick={() => setPreviewCover(null)}
      >
        <div 
          className="relative max-w-sm w-full bg-slate-900 border border-white/20 rounded-2xl overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
            <img 
              src={previewCover.url} 
              alt={previewCover.title} 
              className="w-full h-full object-contain"
            />
            <button 
              type="button" 
              onClick={() => setPreviewCover(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-black text-white/80 hover:text-white border border-white/20 transition-all"
              aria-label="ปิดรูปภาพ"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-4 bg-slate-900 text-white">
            <h3 className="text-base font-bold text-white mb-1">{previewCover.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{previewCover.subtitle}</p>
          </div>
        </div>
      </div>
    )}
  </section>;
}

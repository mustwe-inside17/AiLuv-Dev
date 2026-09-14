import { createPortal } from 'react-dom';
import React, { useEffect, useId, useRef, useState } from 'react';
import { BookOpen, KeyRound, ChevronRight, X, MessageCircle } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { KEY_STORY_ITEMS, STORY_NODES, STORY_THREADS } from '../../constants/storyThreads';
import { emptyStoryProgress, getAvailableStoryNodes, storyLockReason } from '../../domain/story/storyEngine';
import type { StoryCommand } from '../../domain/story/types';
import type { CharacterId } from '../../types';
import { StoryItemIcon } from './StoryIcon';
import '../../styles/story.css';

export function StoryChatPanel({ characterId, disabled, onAction }: { characterId: CharacterId; disabled: boolean; onAction: (command: StoryCommand) => void }) {
  const story = useGameStore(state => state.story) || emptyStoryProgress();
  const location = useGameStore(state => state.currentLocation);
  const love = useGameStore(state => state.loveScores[characterId] || 0);
  const openPhone = useGameStore(state => state.openPhone);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<React.CSSProperties>({});
  const toggle = () => {
    const rect = trigger.current?.getBoundingClientRect();
    if (rect) setPosition({ position: 'fixed', right: 'auto', left: Math.max(12, Math.min(rect.right - 322, window.innerWidth - Math.min(322, window.innerWidth - 24) - 12)), width: Math.min(322, window.innerWidth - 24), ...(window.innerHeight - rect.bottom > 280 ? { top: rect.bottom + 8 } : { top: 'auto', bottom: window.innerHeight - rect.top + 8 }), zIndex: 1000 });
    setOpen(!open);
  };
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const id = useId();
  const available = getAvailableStoryNodes(story);
  const actions = available.filter(node => node.trigger !== 'present' && node.characterId === characterId && node.locationId === location && love >= node.requires.minLove);
  const relevantPresent = available.some(node => node.trigger === 'present' && node.characterId === characterId && node.locationId === location && node.requires.itemId && story.keyItems[node.requires.itemId]);
  const here = actions.length > 0 || relevantPresent;
  const keys = KEY_STORY_ITEMS.filter(item => story.keyItems[item.id]);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  useEffect(() => { setOpen(false); }, [characterId, location, disabled]);
  useEffect(() => {
    if (!open) return;
    popup.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onPointer = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node) && !popup.current?.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
      if (event.key === 'Tab') {
        const buttons = Array.from(popup.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') || []);
        const first = buttons[0], last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onPointer); document.removeEventListener('keydown', onKey); };
  }, [open]);
  const act = (command: StoryCommand) => { close(); onAction(command); };
  return <div className="story-ui story-key-control" ref={root}>
    <button type="button" ref={trigger} className="story-key-trigger" aria-label={here ? 'Key · มีเบาะแสให้ตามต่อ' : 'เปิดเมนู Key'} title="Key Story" aria-haspopup="dialog" aria-expanded={open} aria-controls={id} disabled={disabled} onClick={toggle}>
      <KeyRound size={18} aria-hidden="true" />{here && <span className="story-hint-dot" aria-hidden="true" />}
    </button>
    {open && createPortal(<div className="story-ui story-key-popover" style={position} role="dialog" aria-label="ของสำคัญและเบาะแส" id={id} ref={popup}>
      <header><div><span className="story-eyebrow">KEY STORY</span><h3>ของชิ้นเล็ก เรื่องราวชิ้นใหญ่</h3></div><button type="button" className="story-icon-button" aria-label="ปิดเมนู Key" onClick={close}><X size={18} /></button></header>
      <div className="story-popover-body">
        {actions.map(node => {
          const lock = storyLockReason(node, story, { characterId, locationId: location, love });
          return <button type="button" key={node.id} className="story-menu-action" disabled={!!lock} onClick={() => act({ type: 'node', nodeId: node.id })}><MessageCircle size={19} /><span><strong>{node.actionLabel}</strong><small>{lock || 'มีเรื่องให้ชวนคุย'}</small></span><ChevronRight size={16} /></button>;
        })}
        {keys.length ? keys.map(item => <button type="button" key={item.id} className="story-menu-action" onClick={() => act({ type: 'present', itemId: item.id })}><span className="story-mini-item"><StoryItemIcon icon={item.icon} size={22} /></span><span><strong>{item.name}</strong><small>หยิบให้ดู</small></span><ChevronRight size={16} /></button>) : <p className="story-muted story-popover-empty">ยังไม่มี Key · บางบทสนทนาจะพาคุณไปพบของสำคัญ</p>}
      </div>
      <footer><p>ให้ผิดคน ของไม่หาย</p><button type="button" className="story-text-button" onClick={() => { close(); openPhone('story'); }}><BookOpen size={15} /> สมุดเรื่องราว <ChevronRight size={14} /></button></footer>
    </div>, document.body)}
  </div>;
}

/** Always visible continuation, including travel and terminal feedback. */
export function StoryContinuation({ characterId, disabled, onAction }: { characterId: CharacterId; disabled: boolean; onAction: (command: StoryCommand) => void }) {
  const story = useGameStore(state => state.story) || emptyStoryProgress();
  const location = useGameStore(state => state.currentLocation);
  const love = useGameStore(state => state.loveScores[characterId] || 0);
  const openPhone = useGameStore(state => state.openPhone);
  const next = STORY_NODES.find(node => node.id === story.activeSession?.nodeId);
  const available = getAvailableStoryNodes(story).filter(node => node.characterId === characterId && node.locationId === location);
  const nodes = next ? [next, ...available.filter(node => node.id !== next.id)] : available;
  const latest = Object.values(story.receipts).sort((a, b) => b.completedAt - a.completedAt)[0];
  const finished = !next && latest && STORY_NODES.find(node => node.id === latest.nodeId && node.characterId === characterId);
  if (!nodes.length && !finished) return null;
  return <div className="story-ui story-continuation" aria-label="เรื่องราวที่เล่นต่อได้" aria-live="polite">
    {finished && <p>จบตอนแล้ว · {STORY_THREADS.find(thread => thread.id === finished.threadId)?.title}</p>}
    {nodes.map(node => {
      const lock = storyLockReason(node, story, { characterId, locationId: location, love });
      return <div key={node.id}>
        <small>{STORY_THREADS.find(thread => thread.id === node.threadId)?.title}</small>
        {lock ? <><p>{node.guide}</p><button type="button" disabled={disabled} onClick={() => openPhone('story')}>ดูเส้นทางในสมุดเรื่องราว</button></>
          : <button type="button" disabled={disabled} onClick={() => onAction({ type: 'node', nodeId: node.id })}>{node.actionLabel}</button>}
      </div>;
    })}
  </div>;
}

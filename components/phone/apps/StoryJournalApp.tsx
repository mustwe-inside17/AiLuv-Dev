import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Check, ChevronRight, HelpCircle, MapPin, KeyRound, X } from 'lucide-react';
import { useGameStore } from '../../../store/gameStore';
import { KEY_STORY_ITEMS, STORY_NODES, STORY_THREADS } from '../../../constants/storyThreads';
import { emptyStoryProgress, getNextStoryNode } from '../../../domain/story/storyEngine';
import { CHARACTER_DATA, LOCATIONS, TRAVEL_COST } from '../../../constants';
import type { LocationId } from '../../../types';
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
  const [showGuide, setShowGuide] = useState(false);
  const orderedThreads = [...STORY_THREADS].sort((a, b) => a.sequence - b.sequence);
  const [selectedThreadId, setSelectedThreadId] = useState(orderedThreads[0]?.id || '');
  const count = Object.keys(progress.receipts).length;
  useEffect(() => { markRead(); }, [count, markRead]);
  const thread = STORY_THREADS.find(item => item.id === selectedThreadId) || orderedThreads[0];
  if (!thread) return null;
  const next = getNextStoryNode(progress, thread.id);
  const nodes = STORY_NODES.filter(node => node.threadId === thread.id);
  const completed = nodes.filter(node => progress.receipts[node.id]);
  const travelCost = next && currentLocation !== next.locationId ? Math.max(0, TRAVEL_COST - (skills.includes('huh_again_pls') ? 2 : 0)) : 0;
  const keyCount = KEY_STORY_ITEMS.filter(item => progress.keyItems[item.id]).length;
  return <section className="story-ui story-journal" aria-label="สมุดเรื่องราว">
    <header className="story-journal-header"><button type="button" className="story-icon-button" aria-label="กลับหน้ามือถือ" onClick={onClose}><ArrowLeft size={20} /></button><div><h2>สมุดเรื่องราว</h2><p>เก็บทุกเบาะแสของคนที่คุณรู้จัก</p></div><button type="button" className="story-icon-button" aria-label="วิธีเล่นเรื่องราว" aria-expanded={showGuide} onClick={() => setShowGuide(!showGuide)}><HelpCircle size={20} /></button></header>
    <nav className="story-tabs" aria-label="หมวดสมุด"><button type="button" aria-pressed={tab === 'thread'} onClick={() => setTab('thread')}><BookOpen size={16} /> เรื่องราว</button><button type="button" aria-pressed={tab === 'keys'} onClick={() => setTab('keys')}><KeyRound size={16} /> ของสำคัญ <span>{keyCount}</span></button></nav>
    <div className="story-journal-body">
      {showGuide && <section className="story-guide"><div className="story-section-heading"><h3>คุย · ค้นพบ · ส่งต่อ</h3><button type="button" className="story-icon-button" aria-label="ปิดวิธีเล่น" onClick={() => setShowGuide(false)}><X size={16} /></button></div><ol><li>ชวนคุยตามปกติ หรือแตะไอคอนกุญแจบนหัวแชท</li><li>Key ที่พบจะเก็บไว้ในแท็บของสำคัญ</li><li>ตามคำใบ้ไปหาอีกคน แล้วหยิบของให้ดู</li></ol><p>บางเรื่องต้องสนิทก่อน สมุดจะแจ้งเงื่อนไขให้ · ให้ผิดคนของไม่หาย</p></section>}
      {tab === 'keys' ? <StoryKeys progress={progress} onOpenJournal={() => setTab('thread')} /> : <>
        <div className="story-section-heading"><span className="story-eyebrow">AILUV LIFE</span><span className="story-muted">เรื่องเล็ก ๆ ในเมือง</span></div>
        <div className="story-thread-switcher" role="list" aria-label="เลือกเส้นเรื่อง">
          {orderedThreads.map(item => {
            const itemNodes = STORY_NODES.filter(node => node.threadId === item.id);
            const done = itemNodes.filter(node => progress.receipts[node.id]).length;
            return <button type="button" role="listitem" key={item.id} aria-pressed={thread.id === item.id} onClick={() => setSelectedThreadId(item.id)}>
              <span className="story-switch-icon"><StoryThreadIcon icon={item.icon} size={20} /></span>
              <span><strong>{item.title}</strong><small>{done}/{itemNodes.length} เบาะแส</small></span>
              <ChevronRight size={15} />
            </button>;
          })}
        </div>
        <div className="story-section-heading story-current-heading"><span className="story-eyebrow">{next ? 'กำลังตามเรื่องนี้' : 'ความทรงจำของคุณ'}</span><span className="story-muted">{completed.length}/{nodes.length} เบาะแส</span></div>
        <article className="story-thread-card">
          <div className="story-thread-title"><div className="story-radio-icon"><StoryThreadIcon icon={thread.icon} size={28} /><small>{thread.kind === 'life' ? 'LIFE' : 'STORY'}</small></div><div><span className="story-eyebrow">{thread.kind === 'life' ? 'AILUV LIFE' : 'AILUV STORY'} · {String(thread.sequence).padStart(2, '0')}</span><h3>{thread.title}</h3><p>{thread.subtitle}</p></div></div>
          <div className="story-progress" aria-label={`ค้นพบ ${completed.length} จาก ${nodes.length} ช่วง`}>{nodes.map(node => <span key={node.id} className={progress.receipts[node.id] ? 'done' : ''} />)}</div>
          {next ? <div className="story-next" aria-label="ขั้นตอนถัดไป"><span className="story-eyebrow">เบาะแสถัดไป</span><h3>{next.actionLabel}</h3><p>{next.guide}</p><div className="story-location"><MapPin size={14} /><span>{CHARACTER_DATA[next.characterId].name} · {LOCATIONS[next.locationId].name}</span></div><p className="story-requirement"><Check size={14} />{next.requires.minLove === 0 ? 'พร้อมคุย · ไม่กั้น Love' : `ความไว้ใจ ${Math.floor(loveScores[next.characterId] || 0)} / ${next.requires.minLove} Love`}</p><button type="button" className="story-button" disabled={!onTravel || energy < travelCost} onClick={() => onTravel?.(next.locationId)}>ไปหา{CHARACTER_DATA[next.characterId].name}<ChevronRight size={16} /></button><small>{energy < travelCost ? `พลังงานไม่พอ · ต้องใช้ ${travelCost} Energy` : travelCost ? `เดินทาง ${travelCost} Energy` : 'อยู่ที่นี่แล้ว · เปิดแชทได้เลย'}</small></div> : <div className="story-next complete"><span className="story-eyebrow"><Check size={14} /> ค้นพบครบตอนแล้ว</span><h3>จบเรื่องราวนี้แล้ว</h3><p>{thread.completion}</p></div>}
        </article>
        {count === 0 && !showGuide && <button type="button" className="story-onboarding" onClick={() => setShowGuide(true)}><KeyRound size={18} /><span><strong>เริ่มจากความสงสัยเล็ก ๆ</strong><small>รู้จัก Key Story ใน 3 ขั้นตอน</small></span><ChevronRight size={16} /></button>}
        {completed.length > 0 && <section className="story-memories"><h3>สิ่งที่คุณค้นพบ</h3>{completed.map((node, index) => <details key={node.id}><summary><span>{String(index + 1).padStart(2, '0')}</span>{node.title}<Check size={15} /></summary><p>{node.summary}</p></details>)}</section>}
      </>}
    </div>
  </section>;
}

import React from 'react';
import { KeyRound, Radio, BookOpen } from 'lucide-react';
import { KEY_STORY_ITEMS } from '../../constants/storyThreads';
import type { StoryProgress } from '../../domain/story/types';
import { StoryItemIcon } from './StoryIcon';
import '../../styles/story.css';

export function StoryKeys({ progress, onOpenJournal }: { progress: StoryProgress; onOpenJournal: () => void }) {
  const items = KEY_STORY_ITEMS.filter(item => progress.keyItems[item.id]);
  return <section className="story-ui story-key-list" aria-label="Key Story Items">
    <p className="story-muted"><KeyRound size={16} aria-hidden="true" /> Key คือของสำคัญที่ใช้เปิดเรื่องราว เก็บแยกจากของใช้และขายไม่ได้</p>
    {items.length === 0 ? <div className="story-empty"><Radio size={38} aria-hidden="true" /><h3>ยังไม่มีเบาะแสในกระเป๋า</h3><p>บางบทสนทนาอาจพาคุณไปพบของที่มีเรื่องราว ลองเปิดสมุดเพื่อเริ่มเรื่องแรก</p></div> : items.map(item => <article className="story-key-card" key={item.id}>
      <div className="story-radio-icon"><StoryItemIcon icon={item.icon} size={36} /><small>{item.icon === 'radio' ? 'NYX' : 'KEY'}</small></div>
      <div><span className="story-eyebrow">KEY · เก็บไว้ได้</span><h3>{item.name}</h3><p>{item.description}</p><p className="story-hint">{item.hint}</p></div>
    </article>)}
    <button className="story-button secondary" onClick={onOpenJournal}><BookOpen size={17} aria-hidden="true" /> เปิดสมุดเรื่องราว</button>
  </section>;
}

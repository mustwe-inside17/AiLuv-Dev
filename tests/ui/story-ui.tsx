// Development-only UI fixture. No auth, cloud sync or real AI credentials.
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChatInterface } from '../../components/ChatInterface';
import { PhoneOverlay } from '../../components/phone/PhoneOverlay';
import { useGameStore } from '../../store/gameStore';
import { useGameInteractions } from '../../hooks/useGameInteractions';
import { INITIAL_GAME_STATE, LOCATIONS } from '../../constants';
import type { CharacterId, Message } from '../../types';
if (!(import.meta as any).env.DEV) throw new Error('Development fixture only');
useGameStore.getState().replaceGameState({...INITIAL_GAME_STATE,playerName:'ปอน',currentLocation:'gym',tutorialStep:'completed'});
const noOp=()=>{};
function Fixture() {
 const state=useGameStore();
 const charId=(LOCATIONS[state.currentLocation]?.characterId || 'fia') as CharacterId;
 const [messages,setMessages]=useState<Record<CharacterId,Message[]>>({} as Record<CharacterId,Message[]>);
 const interactions=useGameInteractions({messagesMap:messages,setMessagesMap:setMessages,userProfile:null,triggerNotification:noOp,trackQuestProgress:noOp,updateQuestProgress:noOp,unlockAchievement:noOp});
 (window as any).__storyTest={getState:useGameStore.getState,getMessages:()=>messages};
 return <main className="h-[100dvh] flex flex-col bg-slate-100 dark:bg-slate-900">
  <nav className="flex gap-3 p-3 text-xs text-slate-600 dark:text-slate-300 shrink-0"><button onClick={()=>state.openPhone()}>โทรศัพท์</button><button onClick={()=>state.setGameState({currentLocation:'gym'})}>เฟียร์</button><button onClick={()=>state.setGameState({currentLocation:'market'})}>เอริน</button><button onClick={()=>document.documentElement.classList.toggle('dark')}>ธีม</button></nav>
  <div className="flex-1 min-h-0"><ChatInterface characterId={charId} messages={messages[charId] || []} onSendMessage={interactions.handleSendMessage} onAction={noOp} onIdleTrigger={noOp} isTyping={interactions.isTyping} disabled={false} currentMood={state.currentMoods[charId]} loveScore={state.loveScores[charId]} energy={state.energy} /></div>
  <PhoneOverlay onStoryTravel={id=>{state.togglePhone();state.setGameState({currentLocation:id});}} />
 </main>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);


import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Trash2, MessageCircle, Zap, Users, BrainCircuit, XCircle, Info, Flame, Heart, HeartCrack, Clapperboard, X, Lock, Clover, Wine, Mic, MicOff, PhoneOff } from 'lucide-react'; // Added MicOff, PhoneOff
import { Message, Mood, ActionType, CharacterId, RelationshipTier, ActiveEvent, TutorialStep, CharacterQuest, SceneType } from '../types'; // Added SceneType
import { CHARACTER_DATA, LOCATIONS } from '../constants';
import { getCharacterImageUrl } from '../services/firebase';
import { getThemeData } from '../constants/themes'; 
import { generateCreativeScenarios } from '../services/mockAi'; 
import { ChatActionMenu } from './ChatActionMenu';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { playSfx } from '../utils/audioUtils';
import { geminiLiveService } from '../services/geminiLiveService';

// Import New Sub-Components
import { ChatMessageBubble } from './chat/ChatMessageBubble';
import { ChatInputArea } from './chat/ChatInputArea';
import { ScenarioMenu } from './chat/ScenarioMenu';
import { DateSelectionModal } from './modals/DateSelectionModal'; // NEW IMPORT
import { VoiceChatOverlay } from './chat/VoiceChatOverlay';

interface ChatInterfaceProps {
  characterId: CharacterId;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onAction: (type: ActionType, dateTarget?: SceneType | 'freestyle') => void; // UPDATED SIG
  onIdleTrigger?: () => void;
  onClearChat?: () => void;
  isTyping: boolean;
  disabled: boolean;
  currentMood: Mood;
  loveScore: number;
  inventory?: Record<string, number>;
  onImageClick?: (url: string) => void;
  energy: number;
  comboStreak?: number;
  currentTier?: RelationshipTier;
  activeEvent?: ActiveEvent | null;
  tutorialStep?: TutorialStep;
  lastLoveUpdate?: { charId: string, value: number, isCritical: boolean, timestamp: number };
  onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void; 
  partyMemberId?: CharacterId | null; 
  unlockedSkills?: string[]; 
  gold?: number; 
  onBuyItem?: (itemId: string, messageId: string) => void;
  onAcceptQuest?: (quest: CharacterQuest, charId: CharacterId, msgId: string) => void; 
  onInputFocus?: () => void; 
  onInputBlur?: () => void;  
  chemistryScore?: number; 
  onBuyAction?: (type: ActionType) => void; 
  onAddSystemMessage?: (text: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ characterId, messages, onSendMessage, onAction, onIdleTrigger, onClearChat, isTyping, disabled, currentMood, loveScore, inventory = {}, onImageClick, energy, comboStreak = 0, currentTier = RelationshipTier.STRANGER, activeEvent, tutorialStep, lastLoveUpdate, onDragStart, partyMemberId, unlockedSkills = [], gold = 0, onBuyItem, onAcceptQuest, onInputFocus, onInputBlur, chemistryScore = 0, onBuyAction, onAddSystemMessage }) => {
  const [inputText, setInputText] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [partyAvatarUrl, setPartyAvatarUrl] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTriggerCount = useRef(0);
  const [floatingLoveEvents, setFloatingLoveEvents] = useState<{id: number, val: number, isCombo: boolean, isCrit: boolean}[]>([]);
  const [heartAnim, setHeartAnim] = useState(false);
  const lastProcessedUpdateRef = useRef<number>(0);
  const isComboFire = comboStreak >= 3;
  
  // Vibe Tooltip State
  const [showVibeTooltip, setShowVibeTooltip] = useState(false);

  // --- SCENARIO GENERATION STATE ---
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  const [isGeneratingScenarios, setIsGeneratingScenarios] = useState(false);
  const [generatedScenarios, setGeneratedScenarios] = useState<string[]>([]);
  
  // --- DATE MODAL STATE ---
  const [showDateModal, setShowDateModal] = useState(false);
  const [voiceTranscription, setVoiceTranscription] = useState<string>('');
  const [isVoiceConnecting, setIsVoiceConnecting] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);

  // Store Access
  const { dailyThemes, activeRareVibes, currentDateScene, setDateScene, diamonds, spendDiamonds, currentLocation, voiceChat, setVoiceChatActive, toggleMic } = useGameStore(useShallow(state => ({
      dailyThemes: state.dailyThemes,
      activeRareVibes: state.activeRareVibes,
      currentDateScene: state.currentDateScene,
      setDateScene: state.setDateScene,
      diamonds: state.diamonds,
      spendDiamonds: state.spendDiamonds,
      currentLocation: state.currentLocation,
      voiceChat: state.voiceChat,
      setVoiceChatActive: state.setVoiceChatActive,
      toggleMic: state.toggleMic
  })));
  const currentThemeId = dailyThemes?.[characterId];
  const isRareVibe = activeRareVibes?.[characterId];
  const themeData = currentThemeId ? getThemeData(characterId, currentThemeId) : null;
  const isVoiceMode = voiceChat.isActive && voiceChat.characterId === characterId;

  // SFX Refs
  const prevMessageCountRef = useRef(messages.length);
  const prevChemistryRef = useRef(chemistryScore);
  const prevMoodRef = useRef(currentMood);
  const canReadMind = unlockedSkills.includes('mind_reader');

  // Reset Scenario State on Character Change
  useEffect(() => {
      setGeneratedScenarios([]);
      setIsGeneratingScenarios(false);
      setShowScenarioMenu(false);
  }, [characterId]);

  // SFX: Typing
  useEffect(() => {
      if (isTyping) playSfx('chat_typing');
  }, [isTyping]);

  // SFX: Receive Message
  useEffect(() => {
      if (messages.length > prevMessageCountRef.current) {
          const lastMsg = messages[messages.length - 1];
          if (lastMsg.sender !== 'user') playSfx('chat_receive');
          prevMessageCountRef.current = messages.length;
      }
  }, [messages]);

  // Love Events Animation
  useEffect(() => {
    if (lastLoveUpdate && lastLoveUpdate.charId === characterId && lastLoveUpdate.timestamp > lastProcessedUpdateRef.current && lastLoveUpdate.value !== 0) {
        lastProcessedUpdateRef.current = lastLoveUpdate.timestamp;
        const newEvent = {
            id: Date.now() + Math.random(),
            val: lastLoveUpdate.value,
            isCombo: comboStreak >= 3,
            isCrit: lastLoveUpdate.isCritical
        };
        setFloatingLoveEvents(prev => [...prev, newEvent]);
        setHeartAnim(true);
        setTimeout(() => setHeartAnim(false), 500);
        setTimeout(() => {
            setFloatingLoveEvents(prev => prev.filter(e => e.id !== newEvent.id));
        }, 3000);
    }
  }, [lastLoveUpdate, characterId, comboStreak]);

  // Idle Trigger
  useEffect(() => {
      if (disabled || isTyping) {
          if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
          return;
      }
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
          if (idleTriggerCount.current < 1 && onIdleTrigger) {
              onIdleTrigger();
              idleTriggerCount.current += 1;
          }
      }, 40000); 
      return () => {
          if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      };
  }, [messages, disabled, isTyping, onIdleTrigger]);

  // Voice mode is now handled by VoiceChatOverlay component
  // Handle Mic Mute is also handled there

  // Chemistry Reaction
  useEffect(() => {
    if (chemistryScore !== prevChemistryRef.current) {
        const diff = chemistryScore - prevChemistryRef.current;
        if (diff !== 0) {
            // [MARCUS FIX]: Only show visual/audio feedback for positive changes
            // User requested to remove the "red badge" and "wrong sound" for decreases (silent decrease)
            if (diff > 0) {
                playSfx('task_complete');
            }
        }
        prevChemistryRef.current = chemistryScore;
    }
  }, [chemistryScore]);

  // Mood Reaction
  useEffect(() => {
    if (currentMood !== prevMoodRef.current) {
        if (isVoiceMode) {
            // Show a brief mood change indicator in voice mode
            setVoiceTranscription(`[Mood: ${currentMood.toUpperCase()}]`);
            setTimeout(() => setVoiceTranscription(''), 2000);
        }
        prevMoodRef.current = currentMood;
    }
  }, [currentMood, isVoiceMode]);

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    const timer = setTimeout(scrollToBottom, 150);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  // Load Avatars
  useEffect(() => {
      const load = async () => {
          const charData = CHARACTER_DATA[characterId];
          if (charData && charData.baseImg) {
              const url = await getCharacterImageUrl(charData.baseImg);
              if (url) setAvatarUrl(url);
          }
          if (partyMemberId) {
              const partyData = CHARACTER_DATA[partyMemberId];
              if (partyData && partyData.baseImg) {
                  const pUrl = await getCharacterImageUrl(partyData.baseImg);
                  if (pUrl) setPartyAvatarUrl(pUrl);
              }
          } else {
              setPartyAvatarUrl('');
          }
      };
      load();
  }, [characterId, partyMemberId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || disabled) return;
    
    const textToSend = inputText;
    setInputText('');
    setShowActions(false);
    
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTriggerCount.current = 0;
    
    playSfx('chat_send');
    if (isVoiceMode) {
      geminiLiveService.sendText(textToSend);
    }
    
    onSendMessage(textToSend);
  };

  // Roleplay Helper
  const handleRoleplayClick = (e: React.MouseEvent, inputRef: React.RefObject<HTMLInputElement>) => {
      e.preventDefault(); 
      if (!inputRef.current) return;

      const cursorStart = inputRef.current.selectionStart || inputText.length;
      const cursorEnd = inputRef.current.selectionEnd || inputText.length;
      
      const newText = inputText.substring(0, cursorStart) + "()" + inputText.substring(cursorEnd);
      setInputText(newText);

      setTimeout(() => {
          if (inputRef.current) {
              inputRef.current.focus();
              const newCursorPos = cursorStart + 1;
              inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
      }, 0);
  };

  // Scenario Logic
  const SCENARIO_COST = 20;
  const canAffordScenario = (diamonds || 0) >= SCENARIO_COST;

  const handleGenerateScenarios = async () => {
      if ((diamonds || 0) < SCENARIO_COST) return;

      spendDiamonds(SCENARIO_COST);
      setIsGeneratingScenarios(true);
      playSfx('gacha_roll'); 

      const locName = LOCATIONS[currentLocation]?.name || "Unknown";
      
      // [MARCUS FIX]: Pass recent messages to AI for context-aware scenarios
      const scenarios = await generateCreativeScenarios(
          characterId, 
          locName, 
          currentMood, 
          currentTier || RelationshipTier.STRANGER,
          messages // <-- Pass messages here
      );
      
      setGeneratedScenarios(scenarios);
      setIsGeneratingScenarios(false);
      playSfx('gacha_reveal');
  };

  const handleSelectScenario = (text: string) => {
      onSendMessage(text);
      playSfx('chat_send');
      setShowScenarioMenu(false);
      setGeneratedScenarios([]); 
  };

  // [MARCUS NEW]: Handle Date Modal Selection
  const handleDateSelect = (targetScene: SceneType | 'freestyle') => {
      setShowDateModal(false);
      onAction('invite_date', targetScene);
  };

  const isDateMode = !!currentDateScene;
  
  // [MARCUS FIX] Can only invite if Chemistry >= 60 (Golden Hour)
  const canInviteDate = chemistryScore >= 60;

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl md:rounded-none shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] md:shadow-none relative z-20 transition-colors duration-500 overflow-visible border-t border-gray-200 dark:border-white/10">
      
      {/* Date Selection Modal */}
      {showDateModal && (
          <DateSelectionModal onClose={() => setShowDateModal(false)} onSelect={handleDateSelect} />
      )}

      {/* Mobile Drag Handle */}
      {onDragStart && (
          <div 
            className="w-full flex items-center justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing touch-none absolute top-0 left-0 right-0 z-50 hover:bg-black/5 dark:hover:bg-white/5 rounded-t-3xl transition-colors md:hidden"
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
          >
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full shadow-sm"></div>
          </div>
      )}

      {/* Active Event Banner */}
      {activeEvent && activeEvent.characterId === characterId && (
            <div className="w-full bg-gradient-to-r from-purple-100 via-fuchsia-100 to-purple-100 dark:from-purple-900/90 dark:via-fuchsia-900/90 dark:to-purple-900/90 backdrop-blur-md p-1.5 flex items-center justify-center gap-2 animate-in slide-in-from-top-full duration-500 z-30 shrink-0 border-b border-purple-200 dark:border-white/10 rounded-t-3xl md:rounded-none mt-4 md:mt-0 shadow-sm dark:shadow-lg dark:shadow-purple-900/20">
                <Sparkles size={12} className="text-purple-500 dark:text-yellow-300 animate-pulse" fill="currentColor" />
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black text-purple-700 dark:text-white uppercase tracking-wider bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded">ACTIVE EVENT</span>
                    <p className="text-[11px] text-slate-700 dark:text-white font-extrabold truncate max-w-[200px] drop-shadow-sm">{activeEvent.title}</p>
                </div>
            </div>
      )}

      {/* Date Status Banner */}
      {currentDateScene && (
          <div className="w-full bg-white/90 dark:bg-slate-900/80 backdrop-blur-md p-2 flex items-center justify-between gap-2 animate-in slide-in-from-top duration-500 z-30 shrink-0 border-b border-gray-200 dark:border-white/10 rounded-t-3xl md:rounded-none mt-4 md:mt-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 animate-pulse pointer-events-none"></div>
              <div className="flex items-center gap-2 z-10 pl-2">
                  <div className="p-1.5 bg-pink-500 rounded-full text-white shadow-lg animate-bounce-soft">
                      <Info size={12} />
                  </div>
                  <div>
                      <div className="text-[8px] font-bold text-pink-500 dark:text-pink-300 uppercase tracking-widest leading-none mb-0.5">STATUS</div>
                      <div className="text-xs font-black text-slate-800 dark:text-white leading-none">
                          {currentDateScene.narrativeStatus || "Date in progress..."}
                      </div>
                  </div>
              </div>
              <button 
                  onClick={() => {
                      setDateScene(null);
                      useUIStore.getState().addNotification({
                          id: Date.now().toString(),
                          title: 'Date Ended',
                          message: 'You have left the date location.',
                          type: 'info'
                      });
                  }} 
                  className="bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-slate-600 dark:text-white p-1.5 rounded-full z-10 transition-colors"
                  title="Return to Base"
              >
                  <X size={14} />
              </button>
          </div>
      )}

      {/* Voice Chat Overlay */}
      {isVoiceMode && (
          <VoiceChatOverlay 
            characterId={characterId} 
            onClose={() => setVoiceChatActive(false, characterId)} 
            chatHistory={messages.slice(-10).map(m => `${m.sender === 'user' ? useGameStore.getState().playerName : CHARACTER_DATA[characterId].name}: ${m.text}`).join('\n')}
            onAddSystemMessage={onAddSystemMessage}
          />
      )}

      {/* Floating Love Events */}
      {floatingLoveEvents.map(ev => (
          <div key={ev.id} className={`absolute right-6 z-50 pointer-events-none flex flex-col items-center animate-float-love ${ev.isCrit ? 'bottom-32' : 'bottom-24'}`}> 
             {ev.isCrit && <span className="text-[10px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-widest bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-full shadow-sm mb-1 animate-bounce border border-amber-500/50">Fortune!</span>}
             <div className={`text-lg font-bold px-3 py-1.5 rounded-full shadow-lg border-2 flex items-center gap-1.5 
                ${ev.val < 0 
                    ? 'bg-red-50 dark:bg-red-900/80 text-red-600 dark:text-red-300 border-red-200 dark:border-red-700 animate-shake-hard' 
                    : ev.isCrit 
                        ? 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/80 dark:to-amber-900/80 text-amber-600 dark:text-amber-300 border-amber-400 dark:border-amber-500 shadow-amber-500/20 scale-125 animate-shake-hard' 
                        : ev.val > 0 
                            ? (ev.isCombo ? 'bg-orange-50 dark:bg-orange-900/80 text-orange-600 dark:text-orange-300 border-orange-400 dark:border-orange-500 scale-110' : 'bg-white dark:bg-slate-900/80 text-pink-500 dark:text-pink-400 border-pink-200 dark:border-pink-500/50') 
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-slate-600'}
             `}>
                {ev.val < 0 && <span className="text-red-500">⚠</span>}
                {ev.isCrit && <Clover className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-spin-slow" fill="currentColor" />}
                {ev.val > 0 ? '+' : ''}{ev.val}
                {!ev.isCrit && ev.val >= 0 && (ev.isCombo ? <Flame className="w-4 h-4 text-orange-500 fill-orange-500" /> : <Heart className={`w-4 h-4 ${ev.val > 0 ? 'fill-pink-500' : 'fill-gray-400 dark:fill-gray-600'}`} />)}
                {ev.val < 0 && <HeartCrack className="w-4 h-4 text-red-500" />}
             </div>
             {ev.isCombo && !ev.isCrit && ev.val > 0 && <span className="text-[8px] font-bold text-orange-500 dark:text-orange-400 mt-1 uppercase tracking-widest bg-white/80 dark:bg-black/50 px-1 rounded animate-pulse">Combo!</span>}
          </div>
      ))}

      {/* Header Bar */}
      <div className={`flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-white/5 shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm relative z-20 ${onDragStart ? 'mt-3 md:mt-0' : ''}`}>
         <div className="flex items-center gap-3 ml-2">
            <div className="relative">
                <div className={`w-12 h-12 rounded-full border-2 shadow-md overflow-hidden bg-gray-200 dark:bg-slate-800 ${isDateMode ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-white dark:border-slate-700'}`}>
                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full animate-pulse bg-gray-300 dark:bg-slate-700"/>}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 border-2 border-white dark:border-slate-900 rounded-full ${isTyping ? 'bg-indigo-400 animate-pulse' : 'bg-green-500'}`}></div>
            </div>
            
            {partyMemberId && partyMemberId !== characterId && (
                <div className="relative -ml-4 z-10 group cursor-pointer" title={`With ${CHARACTER_DATA[partyMemberId].name}`}>
                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-md overflow-hidden bg-gray-200 dark:bg-slate-800">
                        {partyAvatarUrl ? <img src={partyAvatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-300 dark:bg-slate-700"></div>}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5 border border-gray-200 dark:border-slate-600">
                        <Users size={10} className="text-pink-500" />
                    </div>
                </div>
            )}

            <div>
                <div className="flex items-center gap-1.5">
                    <h3 className={`font-bold text-sm ${isDateMode ? 'text-purple-600 dark:text-purple-300' : 'text-slate-800 dark:text-white'}`}>{CHARACTER_DATA[characterId].name}</h3>
                    {currentTier === RelationshipTier.PARTNER && <Heart size={10} className="fill-red-500 text-red-500" />}
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{currentMood}</span>
                    {comboStreak >= 2 && (
                        <span className={`flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-all ${isComboFire ? 'text-orange-600 dark:text-orange-100 bg-orange-100 dark:bg-orange-600 animate-bounce-soft shadow-orange-500/30 dark:shadow-orange-500/50 shadow-sm' : 'text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-500/20'}`}>
                            <Flame size={8} className={`${isComboFire ? 'fill-orange-600 dark:fill-white text-orange-600 dark:text-white' : 'fill-orange-500'} mr-0.5`} /> {comboStreak}x
                        </span>
                    )}
                </div>
            </div>

             {themeData && (
                 <div className="relative z-50 ml-1">
                     <button
                        onClick={() => setShowVibeTooltip(!showVibeTooltip)}
                        className={`
                            flex items-center gap-1 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm
                            ${isRareVibe 
                                ? 'bg-slate-900 border-yellow-500/50 text-yellow-400 shadow-yellow-500/20' 
                                : 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 text-indigo-400 dark:text-indigo-300'}
                        `}
                     >
                        <span className={`text-[10px] ${isRareVibe ? 'animate-pulse' : ''}`}>{themeData.icon}</span>
                        <span className="truncate max-w-[60px]">{themeData.name.split(' ')[0]}</span>
                     </button>
                     
                     {showVibeTooltip && (
                         <>
                            <div className="fixed inset-0 z-[90]" onClick={() => setShowVibeTooltip(false)}></div>
                            <div className="absolute top-full left-0 mt-2 w-48 p-3 rounded-2xl shadow-xl z-[100] animate-in zoom-in-95 duration-200 origin-top-left bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-100 dark:border-white/10">
                                <div className={`text-[9px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1 ${isRareVibe ? 'text-yellow-500' : 'text-indigo-500'}`}>
                                    {isRareVibe ? <Sparkles size={10} /> : <Zap size={10} />}
                                    {isRareVibe ? "MYSTERIOUS VIBE" : "TODAY'S VIBE"}
                                </div>
                                <div className="font-bold text-xs text-gray-800 dark:text-white mb-1 leading-tight">
                                    {themeData.name}
                                </div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                    "{themeData.description}"
                                </div>
                            </div>
                         </>
                     )}
                 </div>
             )}
         </div>
         <div className="flex items-center gap-3">
             {/* [MARCUS FIX] INVITE DATE BUTTON - Conditionally Rendered with Visual Upgrade */}
             {canInviteDate && !isDateMode && !disabled && (
                 <button 
                    onClick={() => setShowDateModal(true)}
                    className="p-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/40 hover:scale-110 active:scale-95 transition-all animate-in zoom-in group relative overflow-hidden"
                    title="Invite Date"
                 >
                     <Wine size={16} fill="currentColor" className="animate-pulse relative z-10" />
                     {/* Shine Effect */}
                     <div className="absolute inset-0 bg-white/30 skew-x-12 -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                 </button>
             )}

             {canReadMind && (
                 <div className="text-cyan-500 dark:text-cyan-400 animate-pulse" title="Mind Reader Active">
                     <BrainCircuit size={16} />
                 </div>
             )}
             <div className="flex flex-col items-end">
                 <div className={`flex items-center gap-1 font-bold text-xs transition-colors duration-300 ${heartAnim ? 'scale-110' : ''} ${isComboFire ? 'text-orange-500' : 'text-pink-500 dark:text-pink-400'}`}>
                     {isComboFire 
                        ? <Flame size={14} className={`${heartAnim ? 'fill-orange-500 animate-pulse' : 'fill-orange-600 dark:fill-orange-900'} transition-colors`} />
                        : <Heart size={14} className={`${heartAnim ? 'fill-pink-500 dark:fill-pink-600' : 'fill-pink-600 dark:fill-pink-900'} transition-colors`} />
                     }
                     {Math.floor(loveScore)}
                 </div>
             </div>
             <button 
               onClick={() => setVoiceChatActive(!voiceChat.isActive, characterId)} 
               className={`p-1.5 transition-all rounded-full active:scale-95 ${isVoiceMode ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
               title="Voice Chat"
             >
                 <Mic size={14} className={isVoiceMode ? 'animate-pulse' : ''} />
             </button>
             {onClearChat && (
                 <button onClick={onClearChat} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-800" title="Clear History">
                     <Trash2 size={14} />
                 </button>
             )}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-slate-900/30 custom-scrollbar relative pl-6 shadow-inner">
        {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-40 text-center">
                <MessageCircle size={32} className="mb-2 text-slate-400 dark:text-slate-600" />
                <p className="text-xs font-bold text-slate-500">Start the conversation!</p>
                {tutorialStep === 'chat_guide' && <p className="text-[10px] text-pink-500 dark:text-pink-400 mt-2 animate-bounce">Type "Hello" below 👇</p>}
            </div>
        )}
        
        {messages.filter(msg => {
            if (!msg) return false;
            if (typeof msg.text !== 'string') return false; 
            if (msg.text.startsWith('[SYSTEM:')) return false;
            return true;
        }).map((msg) => (
            <ChatMessageBubble 
                key={msg.id}
                message={msg}
                characterId={characterId}
                isDateMode={isDateMode}
                canReadMind={canReadMind}
                onImageClick={onImageClick}
                onScrollToBottom={scrollToBottom}
                partyMemberId={partyMemberId}
                energy={energy}
                gold={gold}
                diamonds={diamonds || 0}
                onBuyItem={onBuyItem}
                onAcceptQuest={onAcceptQuest}
            />
        ))}
        {isTyping && (
            <div className="flex justify-start animate-in fade-in">
                <div className={`border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5 ${isDateMode ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-600' : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* FOOTER */}
      <div className={`p-3 bg-white/90 dark:bg-slate-950/90 border-t border-gray-100 dark:border-slate-800 shrink-0 relative ${showActions ? 'z-[60]' : 'z-30'} overflow-visible backdrop-blur-xl`}>
        {showActions && (
            <ChatActionMenu 
                characterId={characterId} 
                currentTier={currentTier || RelationshipTier.STRANGER} 
                energy={energy} 
                disabled={disabled || isTyping} 
                inventory={inventory} 
                onAction={onAction} 
                onClose={() => setShowActions(false)} 
                loveScore={loveScore} 
                onBuyAction={onBuyAction}
                chemistryScore={chemistryScore} // [MARCUS FIX] Pass chemistry
            />
        )}
        
        <ScenarioMenu 
            characterId={characterId}
            isOpen={showScenarioMenu}
            onClose={() => setShowScenarioMenu(false)}
            isGenerating={isGeneratingScenarios}
            generatedScenarios={generatedScenarios}
            onGenerate={handleGenerateScenarios}
            onSelect={handleSelectScenario}
            canAfford={canAffordScenario}
            cost={SCENARIO_COST}
        />

        <ChatInputArea 
            inputText={inputText}
            setInputText={setInputText}
            onSendMessage={handleSubmit}
            onToggleActions={() => setShowActions(!showActions)}
            showActions={showActions}
            disabled={disabled || isTyping}
            isTyping={isTyping}
            energy={energy}
            tutorialStep={tutorialStep}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            isScenarioMenuOpen={showScenarioMenu}
            onToggleScenario={(e) => { e.preventDefault(); if(!disabled) setShowScenarioMenu(!showScenarioMenu); }}
            onRoleplayClick={handleRoleplayClick}
            isVoiceMode={isVoiceMode}
            isMicMuted={voiceChat.isMicMuted}
            onToggleMic={toggleMic}
        />
      </div>
      
      <style>{`
        @keyframes shimmer {
            100% { transform: translateX(200%) skewX(12deg); }
        }
        @keyframes music-bar-1 { 0%, 100% { height: 4px; } 50% { height: 12px; } }
        @keyframes music-bar-2 { 0%, 100% { height: 6px; } 50% { height: 16px; } }
        @keyframes music-bar-3 { 0%, 100% { height: 3px; } 50% { height: 10px; } }
      `}</style>

      {/* Voice Chat Overlay is now replaced by the integrated dashboard above */}
    </div>
  );
};

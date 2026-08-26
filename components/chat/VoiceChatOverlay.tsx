
import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Sparkles, Zap, X, Send, AlertCircle } from 'lucide-react';
import { CharacterId, Mood, Message } from '../../types';
import { CHARACTER_DATA } from '../../constants';
import { geminiLiveService, LiveStatus } from '../../services/geminiLiveService';
import { summarizeVoiceCall } from '../../services/mockAi';
import { useGameStore } from '../../store/gameStore';
import { playSfx } from '../../utils/audioUtils';
import { getCharacterImageUrl } from '../../services/firebase';
import { motion, AnimatePresence } from 'motion/react';

const MOOD_LABELS: Record<Mood, { label: string, emoji: string }> = {
  [Mood.NEUTRAL]: { label: 'ปกติ', emoji: '😐' },
  [Mood.HAPPY]: { label: 'มีความสุข', emoji: '😊' },
  [Mood.SAD]: { label: 'เศร้า', emoji: '😢' },
  [Mood.ANGRY]: { label: 'โกรธ', emoji: '💢' },
  [Mood.SHY]: { label: 'เขิน', emoji: '😳' },
  [Mood.FLIRTY]: { label: 'อ่อย', emoji: '😏' },
  [Mood.CONFIDENT]: { label: 'มั่นใจ', emoji: '😎' },
  [Mood.TIRED]: { label: 'เหนื่อย', emoji: '😫' },
  [Mood.SURPRISED]: { label: 'ตกใจ', emoji: '😲' },
  [Mood.WORKING]: { label: 'ทำงาน', emoji: '💼' },
  [Mood.THINKING]: { label: 'คิดอยู่', emoji: '🤔' },
  [Mood.DRINKING]: { label: 'ดื่ม', emoji: '🍹' },
  [Mood.EATING]: { label: 'กิน', emoji: '🍴' },
  [Mood.ROMANTIC]: { label: 'โรแมนติก', emoji: '🌹' },
  [Mood.SEXUAL]: { label: 'ร้อนแรง', emoji: '🔥' },
  [Mood.DRUNK]: { label: 'เมา', emoji: '🥴' },
  [Mood.PET]: { label: 'อ้อน', emoji: '🐱' },
  [Mood.HOLDING_FLOWERS]: { label: 'ถือดอกไม้', emoji: '💐' },
  [Mood.SASSY]: { label: 'กวนประสาท', emoji: '😜' },
  [Mood.SHOPPING]: { label: 'ช้อปปิ้ง', emoji: '🛍️' },
  [Mood.DISGUISED]: { label: 'ปลอมตัว', emoji: '🕵️' },
  [Mood.RECEIVING_FLOWERS]: { label: 'รับดอกไม้', emoji: '🌸' },
  [Mood.COMFORTING]: { label: 'ปลอบใจ', emoji: '🫂' },
  [Mood.LISTENING]: { label: 'ฟังอยู่', emoji: '👂' },
  [Mood.DETERMINED]: { label: 'มุ่งมั่น', emoji: '🔥' },
  [Mood.WRITING]: { label: 'เขียนงาน', emoji: '✍️' },
  [Mood.SCARED]: { label: 'กลัว', emoji: '😨' },
  [Mood.HIGH_FIVE]: { label: 'ไฮไฟว์', emoji: '✋' },
  [Mood.SPOOKY]: { label: 'ลึกลับ', emoji: '👻' },
  [Mood.HORRIFIED]: { label: 'สยอง', emoji: '😱' },
  [Mood.SHOWING_PHONE]: { label: 'โชว์มือถือ', emoji: '📱' },
  [Mood.ENERGETIC]: { label: 'พลังเยอะ', emoji: '⚡' }
};

interface VoiceChatOverlayProps {
  characterId: CharacterId;
  onClose: () => void;
  chatHistory: string;
  onAddSystemMessage?: (text: string) => void;
}

export const VoiceChatOverlay: React.FC<VoiceChatOverlayProps> = ({ characterId, onClose, chatHistory, onAddSystemMessage }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string>('');
  
  const isSummarizingRef = useRef(false);
  
  // Track conversation for memory saving
  const callLogRef = useRef<{sender: string, text: string}[]>([]);
  
  // Track score changes for visual feedback
  const [scorePopups, setScorePopups] = useState<{id: string, type: 'love' | 'chemistry', amount: number}[]>([]);
  const prevLoveScore = useRef<number>(0);
  const prevChemistry = useRef<number>(0);

  const { voiceChat, addVoiceTokenUsage, loveScores, chemistryScores, addMemory, currentMoods, currentLocation } = useGameStore();
  const charData = CHARACTER_DATA[characterId];
  const currentMood = currentMoods[characterId] || Mood.NEUTRAL;
  const isCasualMode = (currentLocation === 'home' || currentLocation === 'condo' || currentLocation === 'basement');
  
  const transcriptionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const moodInfo = MOOD_LABELS[currentMood] || MOOD_LABELS[Mood.NEUTRAL];

  const handleEndCall = async () => {
    playSfx('chat_send');
    isSummarizingRef.current = true;
    geminiLiveService.disconnect(); // Stop listening immediately
    setIsConnecting(true); // Show connecting state while summarizing
    setTranscription('กำลังบันทึกความทรงจำ...');
    
    try {
      if (callLogRef.current.length > 0) {
        const summary = await summarizeVoiceCall(characterId, callLogRef.current);
        if (summary) {
          addMemory(characterId, {
            id: `mem_call_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            text: summary,
            timestamp: Date.now(),
            importance: 3,
            type: 'fact'
          });
          
          // Add system message to chat history
          if (onAddSystemMessage) {
            onAddSystemMessage(`📞 วางสายแล้ว: ${summary}`);
          }
        }
      }
    } catch (err) {
      console.error("Failed to summarize call:", err);
    } finally {
      onClose();
    }
  };

  useEffect(() => {
    const currentLove = loveScores[characterId] || 0;
    const currentChem = chemistryScores?.[characterId] || 0;
    
    if (prevLoveScore.current !== 0 && currentLove !== prevLoveScore.current) {
      const diff = currentLove - prevLoveScore.current;
      if (diff > 0) {
        setScorePopups(prev => [...prev, { id: `love-${Date.now()}-${Math.random()}`, type: 'love', amount: diff }]);
      }
    }
    
    if (prevChemistry.current !== 0 && currentChem !== prevChemistry.current) {
      const diff = currentChem - prevChemistry.current;
      if (diff > 0) {
        setScorePopups(prev => [...prev, { id: `chem-${Date.now()}-${Math.random()}`, type: 'chemistry', amount: diff }]);
      }
    }
    
    prevLoveScore.current = currentLove;
    prevChemistry.current = currentChem;
  }, [loveScores[characterId], chemistryScores?.[characterId]]);

  useEffect(() => {
    if (scorePopups.length > 0) {
      const timer = setTimeout(() => {
        setScorePopups(prev => prev.slice(1));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [scorePopups]);

  useEffect(() => {
    const resolveImg = async () => {
      // [MARCUS FIX]: Use correct mood map based on mode
      const activeMoodMap = (isCasualMode && charData.casualMoods) ? charData.casualMoods : charData.moods;
      const moodImages = activeMoodMap[currentMood] || activeMoodMap[Mood.NEUTRAL] || [charData.baseImg];
      
      // Pick the first one for consistency in voice chat avatar
      const imagePath = moodImages[0] || charData.baseImg;
      
      if (imagePath) {
        const url = await getCharacterImageUrl(imagePath);
        if (url) setResolvedImageUrl(url);
      }
    };
    resolveImg();
  }, [characterId, currentMood, charData.baseImg, charData.moods, charData.casualMoods, isCasualMode]);

  useEffect(() => {
    const checkApiKey = async () => {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setNeedsApiKey(true);
          setIsConnecting(false);
          return false;
        }
      }
      return true;
    };

    const startVoiceChat = async () => {
      const hasKey = await checkApiKey();
      if (!hasKey) return;

      try {
        const store = useGameStore.getState();
        
        const context = {
          mood: store.currentMoods[characterId],
          chemistry: store.chemistryScores?.[characterId] || 0,
          loveScore: store.loveScores?.[characterId] || 0,
          location: store.currentLocation,
          relationshipTier: store.relationshipTiers[characterId],
          inventory: Object.keys(store.inventory),
          playerName: store.playerName,
          chatHistory: chatHistory,
          memories: (store.memories[characterId] || []).map(m => m.text)
        };
        await geminiLiveService.connect(characterId, context, {
          onTranscription: (text, isUser) => {
            // [MARCUS FIX]: Only show user transcription on screen as requested
            if (isUser) {
              setTranscription(text);
              setIsUserSpeaking(true);
              if (transcriptionTimeoutRef.current) clearTimeout(transcriptionTimeoutRef.current);
              transcriptionTimeoutRef.current = setTimeout(() => setIsUserSpeaking(false), 1000);
            }
            
            // Add to call log if not empty
            if (text.trim()) {
              callLogRef.current.push({
                sender: isUser ? 'user' : 'model',
                text: text.trim()
              });
            }
          },
          onAudioData: (data) => {
            // [MARCUS FIX]: Handle hidden text logs for summary
            if (data?.startsWith?.("TEXT_LOG:")) {
              const text = data.replace("TEXT_LOG:", "");
              if (text.trim()) {
                callLogRef.current.push({
                  sender: 'model',
                  text: text.trim()
                });
              }
            }
          },
          onInterrupted: () => {
            setIsModelSpeaking(false);
          },
          onModelSpeaking: (isSpeaking) => {
            setIsModelSpeaking(isSpeaking);
            if (transcriptionTimeoutRef.current) clearTimeout(transcriptionTimeoutRef.current);
            transcriptionTimeoutRef.current = setTimeout(() => setIsModelSpeaking(false), 1000);
          },
          onStatusChange: (status) => {
            setLiveStatus(status);
          },
          onError: (err) => {
            console.error("Voice Chat Error:", err);
            const errMsg = err?.message || err || "Internal error occurred.";
            setError(errMsg);
            errorRef.current = errMsg;
          },
          onClose: () => {
            if (!isSummarizingRef.current) {
              // If we closed without error, just close
              if (!errorRef.current) onClose();
            }
          }
        });
        setIsConnecting(false);
        playSfx('task_complete');
      } catch (err) {
        console.error("Failed to start voice chat:", err);
        onClose();
      }
    };

    startVoiceChat();

    return () => {
      geminiLiveService.disconnect();
      if (transcriptionTimeoutRef.current) clearTimeout(transcriptionTimeoutRef.current);
    };
  }, [characterId]);

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setNeedsApiKey(false);
      setIsConnecting(true);
      // Re-trigger startVoiceChat by resetting state or just calling it
      // For simplicity, we'll let the user click a "Try Again" or just re-render
      window.location.reload(); // Simplest way to re-trigger the effect and ensure env is fresh
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-between p-4 md:p-6 animate-in fade-in duration-500 overflow-hidden">
      
      {/* Error State */}
      {error && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">Voice Chat Error</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-xs">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setError(null);
                errorRef.current = null;
                setIsConnecting(true);
                // Re-trigger startVoiceChat by resetting characterId or similar
                // For now, we'll just reload to be safe
                window.location.reload();
              }}
              className="px-6 py-2 rounded-full bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-500/50 shadow-lg overflow-hidden bg-slate-800">
            {resolvedImageUrl ? (
              <img src={resolvedImageUrl} alt={charData.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full animate-pulse bg-slate-700" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold text-base">{charData.name}</h2>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-[9px] text-indigo-300 uppercase font-black tracking-tighter border border-indigo-500/30 flex items-center gap-1">
                {moodInfo.emoji} {moodInfo.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-slate-400 text-[9px] uppercase tracking-widest font-bold">Live Voice</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-white/5 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
            <Zap size={10} className="text-yellow-400" />
            <span className="text-white text-[9px] font-black tracking-tighter">
              {voiceChat.tokenUsage.toLocaleString()}
            </span>
          </div>

          <button 
            onClick={handleEndCall}
            className="p-1.5 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-full border border-white/5"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Score Popups */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col gap-2 pointer-events-none z-50">
        {scorePopups.map(popup => (
          <div 
            key={popup.id} 
            className={`animate-in slide-in-from-bottom-4 fade-in duration-300 px-3 py-1.5 rounded-full font-bold text-xs shadow-lg flex items-center gap-2
              ${popup.type === 'love' ? 'bg-pink-500/90 text-white' : 'bg-indigo-500/90 text-white'}
            `}
          >
            {popup.type === 'love' ? '💖' : '✨'} 
            {popup.amount > 0 ? `+${popup.amount}` : popup.amount}
          </div>
        ))}
      </div>

      {/* Visualizer Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md gap-6 py-4 relative">
        {needsApiKey ? (
          <div className="flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
              <Zap size={40} className="text-indigo-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-xl">ต้องการ API Key</h3>
              <p className="text-slate-400 text-sm max-w-[280px]">
                โหมดเสียง (Live Voice) จำเป็นต้องใช้ API Key ของคุณเองเพื่อใช้งานในโหมด Production
              </p>
            </div>
            <button 
              onClick={handleSelectKey}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <Zap size={18} />
              เลือก API Key ของคุณ
            </button>
            <p className="text-[10px] text-slate-500 italic">
              * ต้องเป็น API Key จากโปรเจค Google Cloud ที่เปิด Billing แล้ว
            </p>
          </div>
        ) : (
          <>
            {/* Status Badge */}
            <div className="animate-in fade-in zoom-in duration-500">
              <div className={`px-4 py-1.5 rounded-full border backdrop-blur-md flex items-center gap-2 transition-all duration-300 shadow-lg
                ${liveStatus === 'listening' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 
                  liveStatus === 'thinking' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' :
                  liveStatus === 'speaking' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' :
                  'bg-white/5 border-white/10 text-slate-400'}
              `}>
                {liveStatus === 'listening' && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                {liveStatus === 'thinking' && <Sparkles size={12} className="animate-spin duration-3000" />}
                {liveStatus === 'speaking' && <Zap size={12} className="animate-bounce" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {liveStatus === 'listening' ? 'กำลังฟัง...' : 
                   liveStatus === 'thinking' ? 'กำลังคิด...' : 
                   liveStatus === 'speaking' ? 'กำลังพูด...' : 
                   'พร้อมคุย'}
                </span>
              </div>
            </div>

            <div className="relative">
              {/* Pulsing Rings */}
              {(isUserSpeaking || isModelSpeaking) && (
                <>
                  <div className={`absolute inset-0 rounded-full animate-ping-slow opacity-20 ${isUserSpeaking ? 'bg-indigo-500' : 'bg-pink-500'}`}></div>
                  <div className={`absolute inset-0 rounded-full animate-ping-slow opacity-10 delay-300 ${isUserSpeaking ? 'bg-indigo-500' : 'bg-pink-500'}`}></div>
                </>
              )}
              
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-2xl
                ${isConnecting ? 'border-slate-700 bg-slate-900' : 
                  isUserSpeaking ? 'border-indigo-500 bg-indigo-500/10 shadow-indigo-500/40' : 
                  isModelSpeaking ? 'border-pink-500 bg-pink-500/10 shadow-pink-500/40' : 
                  'border-white/10 bg-white/5'}
              `}>
                {isConnecting ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">Connecting</span>
                  </div>
                ) : isUserSpeaking ? (
                  <Mic size={32} className="text-indigo-400 animate-bounce-soft" />
                ) : isModelSpeaking ? (
                  <Sparkles size={32} className="text-pink-400 animate-pulse" />
                ) : (
                  <div className="flex gap-1 items-center">
                    <div className="w-1 h-6 bg-white/20 rounded-full animate-music-bar-1"></div>
                    <div className="w-1 h-10 bg-white/40 rounded-full animate-music-bar-2"></div>
                    <div className="w-1 h-4 bg-white/20 rounded-full animate-music-bar-3"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Transcription */}
            <div className="text-center min-h-[60px] px-6 w-full max-w-sm">
              <p className={`text-sm md:text-base font-medium leading-relaxed transition-all duration-300 ${isUserSpeaking ? 'text-indigo-300' : 'text-white/90'}`}>
                {transcription || (isConnecting ? "กำลังเตรียมความพร้อม..." : "ลองพูดอะไรบางอย่างสิ...")}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls Group */}
      <div className="w-full max-w-md flex flex-col gap-4 pb-4">
        {/* Text Input Area */}
        <div className="px-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (inputText.trim() && !isConnecting) {
                geminiLiveService.sendText(inputText.trim());
                setTranscription(inputText.trim());
                setInputText('');
                setIsUserSpeaking(true);
                if (transcriptionTimeoutRef.current) clearTimeout(transcriptionTimeoutRef.current);
                transcriptionTimeoutRef.current = setTimeout(() => setIsUserSpeaking(false), 1000);
              }
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="พิมพ์ข้อความที่นี่..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-4 pr-10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-md"
              disabled={isConnecting}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isConnecting}
              className="absolute right-1.5 p-1.5 bg-indigo-500/80 hover:bg-indigo-600 disabled:bg-white/5 disabled:text-white/20 text-white rounded-full transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>

        {/* End Call Button */}
        <div className="flex justify-center">
          <button 
            onClick={handleEndCall}
            className="group flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-full bg-red-500/90 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95">
              <PhoneOff size={24} className="text-white" />
            </div>
            <span className="text-red-400/80 text-[10px] font-black uppercase tracking-widest group-hover:text-red-300 transition-colors">End Call</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes music-bar-1 {
          0%, 100% { height: 20px; }
          50% { height: 40px; }
        }
        @keyframes music-bar-2 {
          0%, 100% { height: 30px; }
          50% { height: 60px; }
        }
        @keyframes music-bar-3 {
          0%, 100% { height: 15px; }
          50% { height: 35px; }
        }
        .animate-music-bar-1 { animation: music-bar-1 1s ease-in-out infinite; }
        .animate-music-bar-2 { animation: music-bar-2 1.2s ease-in-out infinite; }
        .animate-music-bar-3 { animation: music-bar-3 0.8s ease-in-out infinite; }
        .animate-bounce-soft {
          animation: bounce-soft 2s infinite;
        }
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

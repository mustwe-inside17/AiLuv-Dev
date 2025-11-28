
import React, { useRef, useEffect, useState } from 'react';
import { Send, Sparkles, Hand, MousePointer2, Coffee, Heart } from 'lucide-react';
import { Message, Mood, ActionType, CharacterId } from '../types';
import { CHARACTER_DATA } from '../constants';
import { getCharacterImageUrl } from '../services/firebase';

interface ChatInterfaceProps {
  characterId: CharacterId;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onAction: (type: ActionType) => void;
  isTyping: boolean;
  disabled: boolean;
  currentMood: Mood;
  loveScore: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ characterId, messages, onSendMessage, onAction, isTyping, disabled, currentMood, loveScore }) => {
  const [inputText, setInputText] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(''); // State for async avatar loading
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const charData = CHARACTER_DATA[characterId];
  const lovePercent = Math.min(100, Math.max(0, loveScore));

  // Logic to load the NEUTRAL avatar (Profile Picture)
  useEffect(() => {
    let isMounted = true;
    const loadAvatar = async () => {
      // Always select the first NEUTRAL image as the stable avatar
      const neutralImages = charData.moods[Mood.NEUTRAL];
      const selectedPath = Array.isArray(neutralImages) ? neutralImages[0] : neutralImages;
      
      // Fallback to baseImg if neutral is missing
      const path = selectedPath || charData.baseImg;

      if (path) {
        if (path.startsWith('http')) {
          if (isMounted) setAvatarUrl(path);
        } else {
          // Fetch from Firebase
          const url = await getCharacterImageUrl(path);
          if (isMounted && url) {
            setAvatarUrl(url);
          }
        }
      }
    };
    
    loadAvatar();
    return () => { isMounted = false; };
  }, [characterId, charData]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !disabled) {
      onSendMessage(inputText);
      setInputText('');
      setShowActions(false);
    }
  };

  const handleActionClick = (type: ActionType) => {
    onAction(type);
    setShowActions(false);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white/70 backdrop-blur-md border-t border-white/60 rounded-t-[2.5rem]">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative">
        {/* Sticky Relationship Header */}
        <div className="sticky top-0 z-10 flex justify-center pointer-events-none opacity-90 mb-4">
             <div className="bg-white/80 backdrop-blur-sm border border-pink-50 rounded-full px-3 py-1 flex items-center gap-2 shadow-sm">
                 <span className={`text-[10px] font-bold ${charData.color}`}>{charData.name}</span>
                 <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                     <div 
                        className={`h-full ${characterId === 'miguel' ? 'bg-pink-400' : 'bg-orange-400'} transition-all duration-500`} 
                        style={{ width: `${lovePercent}%` }}
                     />
                 </div>
                 <Heart size={10} className={`${loveScore > 50 ? 'fill-current' : ''} ${charData.color}`} />
             </div>
        </div>

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-20 text-gray-400 text-sm italic opacity-70">
            <p>Start chatting with {charData.name}! ✨</p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div 
              key={msg.id} 
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start gap-2.5'}`}
            >
              {/* Avatar - Only for Character */}
              {!isUser && (
                <div className="flex-shrink-0 flex flex-col justify-end pb-1">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={charData.name}
                      className="w-8 h-8 rounded-full object-cover shadow-sm border border-white"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[10px] text-gray-500 font-bold">
                       {charData.name.charAt(0)}
                    </div>
                  )}
                </div>
              )}

              {/* Message Bubble Container */}
              <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                {!isUser && (
                  <span className={`text-[10px] mb-1 ml-1 font-medium ${charData.color}`}>{charData.name}</span>
                )}

                <div 
                  className={`
                    px-4 py-2 text-sm shadow-sm relative min-w-[4rem]
                    ${isUser 
                      ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-2xl rounded-tr-sm' 
                      : 'bg-white text-gray-700 rounded-2xl rounded-tl-sm border border-pink-50'}
                  `}
                >
                  <p className="leading-relaxed break-words mb-1">
                    {msg.text}
                  </p>
                  
                  {msg.imageUrl && (
                    <div className="mt-2 mb-1 rounded-lg overflow-hidden border border-white/50 shadow-sm">
                      <img src={msg.imageUrl} alt="Generated Content" className="w-full h-auto" />
                    </div>
                  )}

                  {msg.isImageLoading && (
                    <div className="mt-2 mb-1 p-3 bg-gray-50 rounded-lg flex items-center gap-2 text-xs text-gray-400 animate-pulse">
                      <Sparkles size={14} /> Sending photo...
                    </div>
                  )}
                  
                  <div className={`text-[9px] text-right font-medium opacity-80 ${isUser ? 'text-pink-100' : 'text-gray-300'}`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex w-full justify-start gap-2.5">
             <div className="flex-shrink-0 flex flex-col justify-end pb-1">
                {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={charData.name}
                      className="w-8 h-8 rounded-full object-cover shadow-sm border border-white"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                  )}
              </div>
              <div className="flex flex-col items-start">
                <span className={`text-[10px] mb-1 ml-1 font-medium ${charData.color}`}>{charData.name}</span>
                <div className="bg-white text-gray-500 px-4 py-3 rounded-2xl rounded-tl-sm text-xs flex items-center gap-2 shadow-sm border border-white">
                  <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce"></span>
                </div>
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white/50 border-t border-pink-50/50 relative">
        
        {/* Action Menu Popup */}
        {showActions && (
          <div className="absolute bottom-full left-3 mb-2 bg-white/90 backdrop-blur-xl border border-pink-100 rounded-2xl shadow-xl p-3 flex gap-3 animate-in slide-in-from-bottom-2 fade-in duration-200 z-20">
             <button onClick={() => handleActionClick('poke')} disabled={disabled} className="flex flex-col items-center gap-1 p-2 hover:bg-pink-50 rounded-xl transition-colors group">
               <div className="w-10 h-10 bg-white border border-pink-100 rounded-full flex items-center justify-center text-gray-500 shadow-sm group-hover:scale-110 transition-transform"><MousePointer2 size={18} /></div>
               <span className="text-[10px] font-bold text-gray-400">-2⚡</span>
             </button>
             <button onClick={() => handleActionClick('headpat')} disabled={disabled} className="flex flex-col items-center gap-1 p-2 hover:bg-pink-50 rounded-xl transition-colors group">
               <div className="w-10 h-10 bg-gradient-to-tr from-pink-400 to-rose-400 text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"><Hand size={18} /></div>
               <span className="text-[10px] font-bold text-gray-400">-5⚡</span>
             </button>
             <button onClick={() => handleActionClick('gift')} disabled={disabled} className="flex flex-col items-center gap-1 p-2 hover:bg-pink-50 rounded-xl transition-colors group">
               <div className="w-10 h-10 bg-yellow-100 text-yellow-600 border border-yellow-200 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><Coffee size={18} /></div>
               <span className="text-[10px] font-bold text-gray-400">-15⚡</span>
             </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto relative items-end">
          <button
            type="button"
            onClick={() => setShowActions(!showActions)}
            disabled={disabled}
            className={`p-3 rounded-2xl transition-all flex-shrink-0 border-2 ${showActions ? 'bg-pink-100 border-pink-200 text-pink-500' : 'bg-white/80 border-transparent text-gray-400 hover:text-pink-400 hover:bg-pink-50'}`}
          >
            <Sparkles size={20} />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={disabled}
            placeholder={disabled ? "Need energy..." : `Message ${charData.name}...`}
            className="flex-1 bg-white/80 text-gray-800 border-2 border-transparent focus:border-pink-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-0 transition-all placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || disabled}
            className="bg-pink-400 hover:bg-pink-500 disabled:bg-gray-200 disabled:text-gray-400 text-white p-3 rounded-2xl transition-all shadow-md shadow-pink-200 flex-shrink-0"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

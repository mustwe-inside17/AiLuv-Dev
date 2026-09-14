
import React, { useRef } from 'react';
import { Send, Zap, XCircle, Clapperboard, Mic, MicOff } from 'lucide-react';
import { TutorialStep } from '../../types';

interface ChatInputAreaProps {
    inputText: string;
    setInputText: (text: string) => void;
    onSendMessage: (e: React.FormEvent) => void;
    onToggleActions: () => void;
    showActions: boolean;
    disabled: boolean;
    isTyping: boolean;
    energy: number;
    tutorialStep?: TutorialStep;
    onFocus?: () => void;
    onBlur?: () => void;
    // Scenario Props
    isScenarioMenuOpen: boolean;
    onToggleScenario: (e: React.MouseEvent) => void;
    // Roleplay Props
    onRoleplayClick: (e: React.MouseEvent, inputRef: React.RefObject<HTMLInputElement>) => void;
    // Voice Mode Props
    isVoiceMode?: boolean;
    isMicMuted?: boolean;
    onToggleMic?: () => void;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
    inputText,
    setInputText,
    onSendMessage,
    onToggleActions,
    showActions,
    disabled,
    isTyping,
    energy,
    tutorialStep,
    onFocus,
    onBlur,
    isScenarioMenuOpen,
    onToggleScenario,
    onRoleplayClick,
    isVoiceMode,
    isMicMuted,
    onToggleMic
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <form onSubmit={onSendMessage} className="flex gap-2 items-end relative overflow-visible">
            <button type="button" onClick={onToggleActions} disabled={disabled} className={`p-3 rounded-2xl transition-all ${showActions ? 'bg-pink-100 text-pink-500 border-pink-200 dark:bg-pink-900/50 dark:text-pink-400 rotate-90 dark:border-pink-500/30' : 'bg-gray-100 text-gray-500 hover:text-pink-500 hover:bg-white border border-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:hover:text-pink-400 dark:hover:bg-slate-700 dark:border-slate-700'}`}>
                {showActions ? <XCircle size={20} /> : <Zap size={20} className={energy < 2 ? 'text-red-400 animate-pulse' : ''} fill={energy < 2 ? "currentColor" : "none"} />}
            </button>
            
            <div className="flex-1 min-w-0 relative">
                <input 
                    ref={inputRef}
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onFocus={onFocus} 
                    onBlur={onBlur}   
                    placeholder={
                        disabled ? "Waiting..." : 
                        isTyping ? "Character is typing..." : 
                        tutorialStep === 'chat_guide' ? "พิมพ์ \"สวัสดี\" ทักทายมิเกล..." : 
                        "Type a message..."
                    }
                    disabled={disabled || isTyping}
                    className="w-full bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-2xl px-4 py-3 pr-20 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 transition-all placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-60 border border-gray-200 dark:border-slate-700"
                />
                {!disabled && !isTyping && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        {/* SCENARIO TRIGGER BUTTON */}
                        <button 
                            type="button"
                            onClick={onToggleScenario}
                            className={`
                                text-xs font-bold p-2 rounded-md transition-all active:scale-95 flex items-center justify-center
                                ${isScenarioMenuOpen 
                                    ? 'bg-cyan-500 text-white shadow-lg ring-2 ring-cyan-300' 
                                    : 'text-gray-400 hover:text-cyan-500 bg-gray-200 dark:bg-slate-700 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-slate-600'}
                            `}
                            title="Generate Scenario"
                        >
                            <Clapperboard size={14} />
                        </button>

                        <button 
                            type="button"
                            onClick={(e) => onRoleplayClick(e, inputRef)}
                            className="text-xs font-bold text-gray-400 hover:text-pink-500 bg-gray-200 dark:bg-slate-700 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-600 px-2 py-1 rounded-md transition-all active:scale-95"
                            title="Roleplay Action: Insert ( )"
                        >
                            ( )
                        </button>
                    </div>
                )}
            </div>
            
            {isVoiceMode && onToggleMic && (
                <button 
                    type="button"
                    onClick={onToggleMic}
                    className={`p-3 rounded-2xl transition-all shadow-lg active:scale-95 border ${isMicMuted ? 'bg-slate-700 text-slate-400 border-slate-600' : 'bg-indigo-500 text-white border-indigo-400 shadow-indigo-500/20'}`}
                >
                    {isMicMuted ? <MicOff size={20} /> : <Mic size={20} className="animate-pulse" />}
                </button>
            )}

            <button 
                type="submit" 
                disabled={!inputText.trim() || disabled || isTyping}
                className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-pink-200 dark:shadow-pink-900/20 hover:scale-105 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 border border-pink-400/20"
            >
                <Send size={20} fill="currentColor" />
            </button>
        </form>
    );
};

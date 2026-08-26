import React, { useState, useEffect } from 'react';
import { ActiveQuestChoiceSession, CharacterQuestChoice, QuestOption } from '../types';
import { CHARACTER_DATA } from '../constants';
import { HelpCircle, PlayCircle, Brain, Sparkles, Target, Compass, X } from 'lucide-react';
import { playSfx } from '../utils/audioUtils';
import { getCharacterImageUrl } from '../services/firebase';

interface QuestChoiceModalProps {
    session: ActiveQuestChoiceSession;
    onSelect: (choice: CharacterQuestChoice | QuestOption) => void;
    onClose?: () => void;
}

export const QuestChoiceModal: React.FC<QuestChoiceModalProps> = ({ session, onSelect, onClose }) => {
    const [renderState, setRenderState] = useState<'hidden' | 'open' | 'closing'>('hidden');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const charData = CHARACTER_DATA[session.charId];
    const isLoading = session.isLoading;
    const quest = session.quest;
    const isSubmitting = Boolean(session.isSubmitting);

    useEffect(() => {
        requestAnimationFrame(() => setRenderState('open'));
        playSfx('event_alert');
        
        const loadImg = async () => {
            if (charData?.baseImg) {
                const url = await getCharacterImageUrl(charData.baseImg);
                if (url) setAvatarUrl(url);
            }
        };
        loadImg();
    }, [session.charId, charData]);

    const handleChoiceClick = (choice: CharacterQuestChoice) => {
        if (isSubmitting) return;
        playSfx('bubble_pop');
        onSelect(choice);
    };

    const handleClose = () => {
        setRenderState('closing');
        playSfx('bubble_pop');
        setTimeout(() => {
            if (onClose) onClose();
        }, 300);
    };

    if (renderState === 'hidden') return null;

    // Determine choices: prefer fresh AI options if generated in session, otherwise use quest.choices
    const choices: CharacterQuestChoice[] = Array.isArray(session.options) && session.options.length > 0
        ? session.options.map((opt, idx) => ({
            id: opt.id || `opt_${idx}`,
            title: opt.text,
            description: opt.text,
            playerResponse: `เดี๋ยวฉันจะ${opt.text}ให้เองนะ`,
            intention: opt.type
        }))
        : (Array.isArray(quest.choices) && quest.choices.length > 0
            ? quest.choices
            : []);

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="quest-choice-title" aria-busy={isLoading || isSubmitting} className={`fixed inset-0 z-[1100] flex items-end md:items-center justify-center pointer-events-auto transition-colors duration-300 ${renderState === 'open' ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}>
            <div 
                className={`
                    game-panel relative w-full max-w-2xl shadow-2xl p-5 md:p-8 rounded-t-[1.5rem] md:rounded-[1.5rem] max-h-[90vh] overflow-y-auto md:mb-12
                    transform transition-all duration-300 flex flex-col gap-4 z-10
                    ${renderState === 'open' ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
                `}
            >
                {/* Close Button */}
                {onClose && (
                    <button 
                        onClick={handleClose}
                        className="game-icon-button absolute top-3 right-3 rounded-xl game-muted hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-20 flex items-center justify-center"
                        aria-label="ปิดหน้าต่างตัวเลือก"
                        title="ปิดหน้าต่าง"
                    >
                        <X size={18} />
                    </button>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="relative mb-4">
                            <Brain size={48} className="text-pink-400 dark:text-pink-500 animate-pulse" />
                            <Sparkles size={24} className="absolute -top-2 -right-2 text-yellow-400 animate-spin-slow" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">กำลังคิดทางเลือกสถานการณ์...</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400 animate-pulse font-medium">
                            {charData?.name || 'ตัวละคร'} กำลังเฝ้ารอการตัดสินใจของคุณ
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header & Character Info */}
                        <div className="flex items-center gap-3.5 border-b border-slate-100 dark:border-white/10 pb-4 pr-8">
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden border-2 shadow-sm" style={{ borderColor: charData?.color || '#ec4899' }}>
                                    {avatarUrl ? (
                                        <img 
                                            src={avatarUrl} 
                                            alt={charData?.name || 'Character'}
                                            className="w-full h-full object-cover scale-110 object-top"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                    )}
                                </div>
                                <div className="absolute -bottom-1.5 -right-1 bg-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow border border-white">
                                    CHOICE
                                </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="game-eyebrow">
                                        {charData?.name || 'ตัวละคร'}
                                    </span>
                                </div>
                                <h3 id="quest-choice-title" className="text-lg md:text-xl font-bold text-slate-900 dark:text-white truncate">
                                    {quest.title}
                                </h3>
                            </div>
                        </div>

                        {/* Situation / Goal Card (Single concise card) */}
                        {(quest.objective || quest.description || quest.context) && (
                            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl flex items-start gap-2.5">
                                <Target className="text-pink-500 shrink-0 mt-0.5" size={16} />
                                <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                                    <span className="font-bold text-slate-900 dark:text-white">สถานการณ์: </span>
                                    {quest.objective || quest.description || quest.context}
                                </div>
                            </div>
                        )}

                        {/* Choices */}
                        <div className="flex flex-col gap-2.5 mt-1">
                            <p className="game-eyebrow flex items-center gap-1.5">
                                <PlayCircle size={13} className="text-pink-500" /> เลือกการกระทำของคุณ (1 จาก {choices.length || 3})
                            </p>
                            
                            {choices.map((choice, idx) => (
                                <button
                                    key={choice.id || idx}
                                    onClick={() => handleChoiceClick(choice)}
                                    disabled={isSubmitting}
                                    className="game-choice w-full text-left p-4 rounded-xl transition-colors group relative shadow-sm flex flex-col gap-1"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-sm flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className="font-bold text-slate-900 dark:text-white text-base group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors">
                                            {choice.title}
                                        </span>
                                    </div>
                                    
                                    {choice.playerResponse && choice.playerResponse !== choice.title && (
                                        <div className="text-sm game-muted pl-9 italic flex items-start gap-1.5 leading-relaxed">
                                            <Compass size={11} className="shrink-0 text-pink-400" />
                                            <span>“{choice.playerResponse}”</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                            {isSubmitting && <p className="text-sm text-center text-pink-600 dark:text-pink-400" role="status">กำลังบันทึกผลการตัดสินใจ...</p>}
                            {session.error && <p className="text-sm text-red-500 dark:text-red-400" role="alert">{session.error}</p>}
                        </div>

                        {/* Footer Hint */}
                        <div className="flex items-center gap-1.5 text-xs game-muted font-medium justify-center pt-1 text-center">
                            <HelpCircle size={11} />
                            <span>การกระทำของคุณจะส่งผลต่อความรู้สึกและเรื่องราวของ {charData?.name || 'ตัวละคร'}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

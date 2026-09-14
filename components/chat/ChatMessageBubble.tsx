import '../../styles/story.css';

import React, { useState, useEffect } from 'react';
import { KeyRound, RotateCcw, Sparkles, Brain, Eye, Coins, Check, Gift, ShoppingBag, Shirt, Target, Zap, Heart, Gem, ArrowRight, Star, Crown } from 'lucide-react';
import { Message, CharacterId, CharacterQuest, RelationshipTier, DateScene } from '../../types';
import { CHARACTER_DATA, SHOP_ITEMS } from '../../constants';
import { FASHION_ITEMS } from '../../constants/fashion';
import { getCharacterImageUrl } from '../../services/firebase';
import { getBuffConfig } from '../../services/buffMechanics';
import { EmojiIcon } from '../ui/EmojiIcon';

// --- SUB-COMPONENTS ---

const BubbleAvatar = ({ charId }: { charId: CharacterId }) => {
    const [url, setUrl] = useState('');
    useEffect(() => {
        const load = async () => {
            const path = CHARACTER_DATA[charId]?.baseImg;
            if(path) {
                const u = await getCharacterImageUrl(path);
                if(u) setUrl(u);
            }
        };
        load();
    }, [charId]);

    return (
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/50 dark:border-white/20 shadow-md shrink-0 self-end mb-2 mr-2 bg-gray-200 dark:bg-slate-800">
            {url ? <img src={url} className="w-full h-full object-cover" /> : <div className="w-full h-full animate-pulse bg-slate-300 dark:bg-slate-700"></div>}
        </div>
    );
};

const SecretImageSpoiler = ({ src, onClick }: { src: string, onClick: () => void }) => {
    const [isRevealed, setIsRevealed] = useState(false);

    const handleReveal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRevealed(true);
    };

    return (
        <div className="mb-2 rounded-lg overflow-hidden border border-white/20 relative group">
            <img 
                src={src} 
                alt="Secret Spoiler" 
                className={`max-w-full h-auto object-cover transition-all duration-700 ${isRevealed ? 'blur-0' : 'blur-xl scale-110 brightness-50'}`} 
            />
            {!isRevealed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <button 
                        onClick={handleReveal}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/30 flex items-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                        <Eye size={16} /> Tap to View Secret
                    </button>
                    <span className="text-[10px] text-white/70 mt-2 font-medium">(Already Unlocked)</span>
                </div>
            )}
            {isRevealed && (
                <div 
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => onClick()} 
                ></div>
            )}
        </div>
    );
};

const parseMessageText = (input: any) => {
    if (!input || typeof input !== 'string') return "";
    const text = String(input);
    
    const goldRegex = /(\[|\s|^)(\d+)\s*(G|g)(\]|\s|$|[\.,!?])/g;
    if (text.search(goldRegex) === -1) return text;
    const matches = Array.from(text.matchAll(goldRegex));
    if (matches.length === 0) return text;
    const result: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    matches.forEach((match, i) => {
        const fullMatch = match[0];
        const matchIndex = match.index!;
        if (matchIndex > lastIndex) {
            result.push(text.substring(lastIndex, matchIndex));
        }
        const rawPrefix = match[1] || "";
        const amount = match[2]; 
        const rawSuffix = match[4] || "";
        const prefix = rawPrefix === '[' ? ' ' : rawPrefix;
        const suffix = rawSuffix === ']' ? ' ' : rawSuffix;
        result.push(
            <React.Fragment key={i}>
                {prefix}
                <span className="inline-flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-lg border border-yellow-200 dark:border-yellow-600/50 font-bold mx-0.5 align-middle text-xs transform -translate-y-0.5 shadow-sm select-none">
                    <Coins size={10} fill="currentColor" />
                    {amount} G
                </span>
                {suffix}
            </React.Fragment>
        );
        lastIndex = matchIndex + fullMatch.length;
    });
    if (lastIndex < text.length) {
        result.push(text.substring(lastIndex));
    }
    return result;
};

interface ChatMessageBubbleProps {
    onStoryRetry?: (messageId: string) => void;
    storyBusy?: boolean;
    message: Message;
    characterId: CharacterId;
    isDateMode: boolean;
    canReadMind: boolean;
    onImageClick?: (url: string) => void;
    onScrollToBottom: () => void;
    partyMemberId?: CharacterId | null;
    energy: number;
    gold: number;
    diamonds: number;
    onBuyItem?: (itemId: string, messageId: string) => void;
    onAcceptQuest?: (quest: CharacterQuest, charId: CharacterId, msgId: string) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
    message: msg,
    onStoryRetry,
    storyBusy,
    characterId,
    isDateMode,
    canReadMind,
    onImageClick,
    onScrollToBottom,
    partyMemberId,
    energy,
    gold,
    diamonds,
    onBuyItem,
    onAcceptQuest
}) => {
    const isUser = msg.sender === 'user';
    const cleanText = typeof msg.text === 'string' ? msg.text.trim() : "";
    const showAvatar = !isUser && partyMemberId && (msg.sender === characterId || msg.sender === partyMemberId);

    // --- NARRATIVE PARSING ---
    // Extract text inside (...) at the start of the message as "Action Narrative"
    const narrativeMatch = cleanText.match(/^\((.+?)\)([\s\S]*)/);
    
    let narrativePart = null;
    let bodyPart = cleanText;

    if (narrativeMatch) {
        narrativePart = narrativeMatch[1].trim(); // The content inside ()
        bodyPart = narrativeMatch[2].trim(); // The rest of the message
    }

    // Special case: If body is empty (pure narrative action), render as a specialized narrative bubble
    const isPureNarrative = narrativePart && !bodyPart && !msg.imageUrl && !msg.interactiveItem;

    if (msg.storyInteraction && msg.storyInteraction.status !== 'complete') {
        const waiting = msg.storyInteraction.status === 'pending' && storyBusy;
        return <div className="story-ui story-retry" role="status">
            <KeyRound size={15} aria-hidden="true" /><div><strong>{waiting ? 'กำลังต่อเรื่องราว…' : 'บทสนทนายังค้างอยู่'}</strong>
            {!waiting && <p>ลองอีกครั้งได้ ของและความคืบหน้ายังเหมือนเดิม</p>}</div>
            {!waiting && onStoryRetry && <button type="button" className="story-icon-button" disabled={storyBusy} aria-label="ลองบทสนทนาเรื่องราวอีกครั้ง" onClick={() => onStoryRetry(msg.id)}><RotateCcw size={17} /></button>}
        </div>;
    }
    if (isPureNarrative && !msg.storyInteraction) {
        return (
            <div className="flex justify-center my-2 opacity-80 animate-in fade-in slide-in-from-bottom-1">
                <span className="text-[10px] font-medium italic text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-800/60 px-3 py-1 rounded-full border border-gray-200 dark:border-white/5 shadow-sm">
                    {narrativePart}
                </span>
            </div>
        );
    }

    // --- BUBBLE STYLE ---
    let messageStyle = 'border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-gray-200';
    if (msg.isEventMessage) {
        messageStyle = 'border-2 border-purple-300 dark:border-purple-500/50 bg-purple-50 dark:bg-purple-900/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] text-slate-800 dark:text-gray-100';
    } else if (isDateMode && !isUser) {
        messageStyle = 'border border-purple-200 dark:border-purple-600/50 bg-purple-50 dark:bg-purple-900/10 text-slate-800 dark:text-gray-100 shadow-sm';
    }
    if (msg.storyInteraction && !isUser) messageStyle = 'story-dialogue-bubble';
    if (isUser) {
        messageStyle = 'bg-gradient-to-br from-fuchsia-500 to-purple-600 dark:from-fuchsia-600 dark:to-purple-700 text-white rounded-tr-none border-none shadow-[0_0_10px_rgba(192,38,211,0.3)]';
    } else {
        messageStyle += ' rounded-tl-none';
    }

    return (
        <div className={`flex flex-col mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            
            {/* SYSTEM/AI NARRATIVE (Story Events) */}
            {msg.narrativeContent && !isUser && (
                <div className="flex justify-center my-2 animate-in zoom-in duration-500">
                    <div className="max-w-[85%] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-center shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400"></div>
                        <p className="text-[10px] md:text-xs font-medium text-slate-600 dark:text-slate-300 italic leading-relaxed">
                            <span className="mr-1 not-italic">🎬</span> {msg.narrativeContent}
                        </p>
                    </div>
                </div>
            )}

            {/* [MARCUS FIX] USER/CHAR ACTION NARRATIVE (Extracted from parens) */}
            {narrativePart && (
                <div className="flex justify-center mb-1 mt-1 animate-in zoom-in duration-300">
                    <div className="max-w-[90%] px-3 py-0.5 rounded-lg text-center backdrop-blur-[1px]">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 italic font-medium flex items-center gap-1 justify-center flex-wrap">
                            {/* [MARCUS REVERT] Removed System-Injected Name. AI will provide it in text. */}
                            <span>{narrativePart}</span>
                        </p>
                    </div>
                </div>
            )}

            {/* MIND READER THOUGHTS */}
            {canReadMind && !isUser && msg.thought && (
                <div className="self-start ml-2 mb-1 max-w-[70%] animate-in fade-in slide-in-from-left-2 duration-500 delay-300">
                    <div className="bg-cyan-50 dark:bg-cyan-950/80 backdrop-blur-sm border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-200 text-[10px] italic px-3 py-2 rounded-xl rounded-bl-none relative shadow-sm dark:shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                        <div className="flex items-center gap-1.5 mb-0.5 opacity-70">
                            <Brain size={10} />
                            <span className="font-bold text-[8px] uppercase tracking-wider">Thought Process</span>
                        </div>
                        "{msg.thought}"
                    </div>
                </div>
            )}

            {/* MAIN BUBBLE (Render if body, image, items, or quest exist) */}
            {(bodyPart || msg.imageUrl || msg.interactiveItem || msg.isImageLoading || msg.characterQuest) && (
                <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {showAvatar && <BubbleAvatar charId={msg.sender as CharacterId} />}

                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%] gap-2`}>
                        {showAvatar && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1 mb-1 font-bold">
                                {CHARACTER_DATA[msg.sender as CharacterId]?.name}
                            </span>
                        )}

                        {/* NORMAL TEXT MESSAGE BUBBLE */}
                        {(bodyPart || msg.imageUrl || msg.interactiveItem || msg.isImageLoading) && (
                            <div className={`w-full rounded-2xl px-4 py-2.5 text-sm relative shadow-sm leading-relaxed group transition-all duration-300 ${messageStyle}`}>
                                {msg.storyInteraction && !isUser && <div className="story-dialogue-label"><KeyRound size={12} aria-hidden="true" /><span>{msg.storyInteraction.title}</span></div>}
                                {msg.isEventMessage && !isUser && <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-sm z-10 tracking-wider">STORY</span>}
                            
                            {/* IMAGE RENDERING */}
                            {msg.imageUrl && (
                                msg.isSecretResend ? (
                                    <SecretImageSpoiler 
                                        src={msg.imageUrl} 
                                        onClick={() => onImageClick?.(msg.imageUrl!)} 
                                    />
                                ) : (
                                    <div className="mb-2 rounded-lg overflow-hidden cursor-pointer border border-white/20" onClick={() => onImageClick?.(msg.imageUrl!)}>
                                        <img 
                                            src={msg.imageUrl} 
                                            alt="Attachment" 
                                            className="max-w-full h-auto object-cover" 
                                            onLoad={onScrollToBottom} 
                                        />
                                    </div>
                                )
                            )}
                            
                            {msg.isImageLoading && (
                                <div className="mb-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-slate-900 p-2 rounded-lg animate-pulse border border-gray-200 dark:border-white/5">
                                    <Sparkles size={12} /> Sending photo...
                                </div>
                            )}
                            
                            {/* Render BODY text (Parsed for gold etc) */}
                            <div className="break-words whitespace-pre-wrap">{bodyPart ? parseMessageText(bodyPart) : ""}</div>
                            
                            {/* INTERACTIVE ITEMS (SHOP/STYLE) */}
                            {msg.interactiveItem && !isUser && (
                                <div className={`mt-3 rounded-xl p-3 border shadow-sm flex items-center gap-3 relative overflow-hidden group/item ${msg.interactiveItem.isGift ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-gray-50 border-gray-200 dark:bg-slate-900/50 dark:border-slate-700'}`}>
                                    {/* ... Item Rendering Code (Unchanged) ... */}
                                    {(() => {
                                        if (msg.interactiveItem?.giftValue) {
                                            return (
                                                <>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-500/10 dark:to-amber-500/10 pointer-events-none"></div>
                                                    <div className={`text-3xl filter drop-shadow-md transition-transform ${msg.interactiveItem.purchased ? 'grayscale opacity-50' : 'group-hover/item:scale-110'} relative z-10`}>💰</div>
                                                    <div className={`flex-1 min-w-0 ${msg.interactiveItem.purchased ? 'opacity-50' : ''} relative z-10`}>
                                                        <div className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest mb-0.5">Cash Gift</div>
                                                        <h4 className="font-bold text-slate-800 dark:text-white truncate leading-tight">Transfer Slip</h4>
                                                        {!msg.interactiveItem.purchased && (
                                                            <div className="text-xs text-yellow-600 dark:text-yellow-400 font-bold flex items-center gap-1">
                                                                <Coins size={10} fill="currentColor"/> +{msg.interactiveItem.giftValue} G
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            );
                                        }

                                        const fullItem = SHOP_ITEMS.find(i => i.id === msg.interactiveItem!.id);
                                        const styleItem = !fullItem ? FASHION_ITEMS.find(i => i.id === msg.interactiveItem!.id) : null;
                                        const isDiamond = fullItem?.currency === 'diamond';
                                        const buffConfig = fullItem?.buffType ? getBuffConfig(fullItem.buffType) : null;
                                        
                                        const gradientClass = msg.interactiveItem!.isGift 
                                            ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                                            : "bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-500/10 dark:to-purple-500/10";
                                        
                                        return (
                                        <>
                                            <div className={`absolute inset-0 ${gradientClass} pointer-events-none`}></div>
                                            
                                            <div className={`text-3xl filter drop-shadow-md transition-transform ${msg.interactiveItem!.purchased ? 'grayscale opacity-50' : 'group-hover/item:scale-110'} relative z-10`}><EmojiIcon emoji={msg.interactiveItem!.emoji} /></div>
                                            
                                            <div className={`flex-1 min-w-0 ${msg.interactiveItem!.purchased ? 'opacity-50' : ''} relative z-10`}>
                                                <div className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${msg.interactiveItem!.isGift ? 'text-green-600 dark:text-green-500' : 'text-gray-400'}`}>
                                                    {msg.interactiveItem!.isGift ? 'Gift for You' : 'Recommended'}
                                                </div>
                                                <h4 className="font-bold text-slate-800 dark:text-white truncate leading-tight">{msg.interactiveItem!.name}</h4>
                                                {msg.interactiveItem!.description && (
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug my-1 line-clamp-2">
                                                        {msg.interactiveItem!.description}
                                                    </p>
                                                )}
                                                
                                                <div className="flex flex-wrap gap-1.5 mt-1.5 mb-1">
                                                    {fullItem && fullItem.energyRestore > 0 && fullItem.category !== 'gift' && (
                                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded border border-green-200 dark:border-green-800">
                                                            <Zap size={8} fill="currentColor" /> +{fullItem.energyRestore} NRG
                                                        </span>
                                                    )}
                                                    {fullItem && buffConfig && (
                                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                                                            <span>{buffConfig.icon}</span> {fullItem.buffDurationMinutes}m
                                                        </span>
                                                    )}
                                                    {styleItem && styleItem.stats && (
                                                        <>
                                                            {Object.entries(styleItem.stats).map(([stat, val]) => (
                                                                <span key={stat} className="inline-flex items-center gap-1 text-[9px] font-bold text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-100 dark:bg-fuchsia-900/30 px-1.5 py-0.5 rounded border border-fuchsia-200 dark:border-fuchsia-800 uppercase">
                                                                    <Shirt size={8} fill="currentColor" /> {stat} +{val}
                                                                </span>
                                                            ))}
                                                        </>
                                                    )}
                                                </div>

                                                {!msg.interactiveItem!.purchased && !msg.interactiveItem!.isGift && (
                                                    <div className={`text-xs font-bold flex items-center gap-1 ${isDiamond ? 'text-cyan-500' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                                        {isDiamond ? <Gem size={10} fill="currentColor"/> : <Coins size={10} fill="currentColor"/>} 
                                                        {msg.interactiveItem!.cost} {isDiamond ? '' : 'G'}
                                                    </div>
                                                )}
                                                {msg.interactiveItem!.isGift && !msg.interactiveItem!.purchased && (
                                                    <div className="text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                                                        <Gift size={10} /> FREE
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                        )
                                    })()}

                                    {/* Buy Button */}
                                    {(() => {
                                        const fullItem = SHOP_ITEMS.find(i => i.id === msg.interactiveItem!.id);
                                        const isDiamond = fullItem?.currency === 'diamond';
                                        const canAfford = isDiamond ? (diamonds || 0) >= msg.interactiveItem!.cost : (gold || 0) >= msg.interactiveItem!.cost;

                                        return (
                                            <button 
                                                onClick={() => {
                                                    if (!msg.interactiveItem!.purchased && onBuyItem) {
                                                        onBuyItem(msg.interactiveItem!.giftValue ? `gift_gold` : msg.interactiveItem!.id, msg.id);
                                                    }
                                                }}
                                                disabled={msg.interactiveItem!.purchased || (!msg.interactiveItem!.isGift && !canAfford)}
                                                className={`
                                                    px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1 z-10
                                                    ${msg.interactiveItem!.purchased
                                                        ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-slate-600'
                                                        : msg.interactiveItem!.isGift || msg.interactiveItem!.giftValue
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg active:scale-95'
                                                            : canAfford
                                                                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg active:scale-95' 
                                                                : 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'}
                                                `}
                                            >
                                                {msg.interactiveItem!.purchased ? (
                                                    <><Check size={12} /> {msg.interactiveItem!.isGift || msg.interactiveItem!.giftValue ? 'Accepted' : 'Bought'}</>
                                                ) : msg.interactiveItem!.isGift || msg.interactiveItem!.giftValue ? (
                                                    <><Gift size={12} /> Receive</>
                                                ) : (
                                                    <><ShoppingBag size={12} /> Buy</>
                                                )}
                                            </button>
                                        );
                                    })()}
                                </div>
                            )}

                            {(!msg.characterQuest || isUser) && (
                                <span className={`text-[9px] block mt-1 opacity-60 font-medium ${isUser ? 'text-pink-100' : isDateMode ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            )}
                        </div>
                        )}

                        {/* [MARCUS FIX]: QUEST CARD VISUAL UPGRADE (Separated and Scaled Down) */}
                        {msg.characterQuest && !isUser && (
                            <div className={`
                                w-full max-w-[270px] rounded-[1.25rem] p-3 border shadow-sm relative group/quest transition-all
                                ${msg.characterQuest.isCompleted 
                                    ? 'border-green-300 dark:border-green-800/80 bg-green-50 dark:bg-green-900/30' 
                                    : 'border-fuchsia-300 dark:border-fuchsia-600/80 bg-gradient-to-br from-indigo-50/80 to-fuchsia-50/80 dark:from-slate-800 dark:to-fuchsia-900/30'}
                            `}>
                                
                                {/* CLIPPED BACKGROUND DECOR */}
                                <div className="absolute inset-0 rounded-[1.25rem] overflow-hidden pointer-events-none">
                                    <div className="absolute top-0 right-0 p-8 bg-gradient-to-br from-fuchsia-400/10 to-transparent rounded-bl-[100%]"></div>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5"></div>
                                </div>
                                
                                {!msg.characterQuest.isCompleted && (
                                    <div className="absolute -top-2.5 -right-1.5 z-30 transform hover:scale-105 transition-transform">
                                        <div className="relative group/tag">
                                            {/* GLOW EFFECT */}
                                            <div className="absolute inset-0 bg-yellow-400 blur-sm opacity-40 group-hover/tag:opacity-80 transition-opacity animate-pulse"></div>
                                            
                                            <div className="relative bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow border border-white dark:border-slate-800 flex items-center gap-0.5 overflow-hidden">
                                                {/* SHIMMER EFFECT */}
                                                <div className="absolute inset-0 w-1/2 h-full bg-white/40 -skew-x-12 -translate-x-full group-hover/tag:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
                                                
                                                <Crown size={8} fill="currentColor" className="drop-shadow-sm" /> 
                                                <span className="tracking-widest drop-shadow-sm">SPECIAL</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* HEADER */}
                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <div className="flex items-center gap-2.5">
                                        {/* SOFTENED ICON: Glassy & Glowing */}
                                        <div className={`
                                            relative p-2 rounded-xl shadow-sm flex items-center justify-center shrink-0 overflow-hidden
                                            ${msg.characterQuest.isCompleted 
                                                ? 'bg-green-100 text-green-600 border border-green-200 /50' 
                                                : 'bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-fuchsia-200/50 dark:border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400'}
                                        `}>
                                            {!msg.characterQuest.isCompleted && (
                                                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-indigo-500/10 animate-pulse"></div>
                                            )}
                                            {msg.characterQuest.isCompleted ? <Check size={16} strokeWidth={3} /> : <Target size={16} strokeWidth={2.5} className="relative z-10 group-hover/quest:rotate-12 transition-transform" />}
                                            
                                            {/* Subtle Radial Glow */}
                                            {!msg.characterQuest.isCompleted && (
                                                <div className="absolute -inset-1 bg-fuchsia-400/20 blur-lg opacity-0 group-hover/quest:opacity-100 transition-opacity"></div>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <div className="text-[8px] font-black text-fuchsia-500/80 dark:text-fuchsia-300/80 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                                                {msg.characterQuest.isCompleted ? 'MISSION COMPLETE' : 'NEW CHALLENGE'}
                                            </div>
                                            <div className={`text-xs font-black tracking-tight ${msg.characterQuest.isCompleted ? 'text-green-700 dark:text-green-400 line-through decoration-2 opacity-70' : 'text-slate-900 dark:text-white'} leading-tight`}>
                                                {msg.characterQuest.title}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* DESCRIPTION */}
                                <div className="bg-white/60 dark:bg-slate-800/60 p-2 rounded-lg border border-white/50 dark:border-white/10 mb-2 relative z-10 backdrop-blur-sm">
                                    <p className={`text-[10px] ${msg.characterQuest.isCompleted ? 'text-gray-400 dark:text-gray-500' : 'text-slate-600 dark:text-slate-300'} italic font-medium leading-relaxed`}>
                                        "{msg.characterQuest.description}"
                                    </p>
                                </div>

                                {/* FOOTER / ACTIONS */}
                                <div className="flex items-center justify-between relative z-10">
                                    
                                    {/* Rewards Display */}
                                    <div className="flex flex-col gap-0.5">
                                        {!msg.characterQuest.isCompleted && (
                                            <div className="flex items-center gap-1 text-[9px] font-bold text-orange-500">
                                                <Zap size={8} fill="currentColor" /> 
                                                <span>-{msg.characterQuest.energyCost} NRG</span>
                                            </div>
                                        )}
                                        
                                        <div className={`flex items-center gap-1 text-[9px] font-black ${msg.characterQuest.isCompleted ? 'text-green-600 dark:text-green-400' : 'text-pink-600 dark:text-pink-400'} animate-pulse`}>
                                            <Heart size={8} fill="currentColor" /> 
                                            <span>
                                                {msg.characterQuest.isCompleted 
                                                    ? `+${msg.characterQuest.earnedLove || '?'} Love`
                                                    : `Reward: ~${Math.floor(msg.characterQuest.loveReward * 1.5)} Love`
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {/* Main Action Button */}
                                    <button 
                                        onClick={() => !msg.characterQuest?.isCompleted && onAcceptQuest && onAcceptQuest(msg.characterQuest!, characterId, msg.id)}
                                        disabled={msg.characterQuest.isCompleted || energy < msg.characterQuest.energyCost}
                                        className={`
                                            px-4 py-1.5 rounded-lg text-[10px] font-black shadow-md transition-all flex items-center gap-1.5 active:scale-95 group/btn
                                            ${msg.characterQuest.isCompleted
                                                ? 'bg-transparent text-green-600 dark:text-green-400 cursor-default shadow-none border border-green-500/20'
                                                : energy >= msg.characterQuest.energyCost 
                                                    ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white ring-1 ring-white/50 dark:ring-slate-700' 
                                                    : 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'}
                                        `}
                                    >
                                        {msg.characterQuest.isCompleted ? (
                                            <>DONE</>
                                        ) : energy < msg.characterQuest.energyCost ? (
                                            'Low Energy'
                                        ) : (
                                            <>Accept <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" /></>
                                        )}
                                    </button>
                                </div>
                                <span className={`text-[8px] block mt-1.5 opacity-60 font-medium ${isDateMode ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'} text-right`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

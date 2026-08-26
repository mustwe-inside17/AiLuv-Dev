
import React, { useState, useEffect } from 'react';
import { Mail, Trash2, ArrowLeft, Gem, Coins, Gift, AlertCircle, CheckCircle2, ChevronRight, Inbox, Eye, ShoppingBag, Bug, X, Heart, HeartCrack, Brain } from 'lucide-react';
import { useGameStore } from '../../../store/gameStore';
import { MailItem } from '../../../types';
import { playSfx } from '../../../utils/audioUtils';
import { SECRET_MAIL_SCENARIOS, DAILY_NEWS_POOL } from '../../../constants/story';
import { SHOP_ITEMS, CHARACTER_DATA } from '../../../constants';
import { FASHION_ITEMS } from '../../../constants/fashion';
import { getCharacterImageUrl } from '../../../services/firebase';
import { TransitionImage } from '../../ui/TransitionImage';
import { EmojiIcon } from '../../ui/EmojiIcon';

interface MailAppProps {
    onClose: () => void;
}

// Enhanced Feedback State to carry structured data
interface FeedbackState {
    visible: boolean;
    title: string;
    narrative: string; // The story text
    type: 'success' | 'danger' | 'neutral';
    changes: {
        gold?: number;
        diamonds?: number;
        item?: string;
        relationship?: {
            charId: string;
            charName: string;
            amount: number;
        };
        memory?: boolean;
    };
    onDismiss: () => void;
}

// --- SUB-COMPONENT: FEEDBACK MODAL (COMPACT VERSION) ---
const FeedbackModal: React.FC<{ feedback: FeedbackState }> = ({ feedback }) => {
    const [charImg, setCharImg] = useState<string>('');
    
    // Resolve Character Image
    useEffect(() => {
        const load = async () => {
             if (feedback.changes.relationship?.charId) {
                 const char = CHARACTER_DATA[feedback.changes.relationship.charId];
                 if (char && char.baseImg) {
                     const url = await getCharacterImageUrl(char.baseImg);
                     if (url) setCharImg(url);
                 }
             }
        };
        load();
    }, [feedback]);

    // Resolve Item Details
    const itemDetails = feedback.changes.item ? (() => {
        const s = SHOP_ITEMS.find(i => i.id === feedback.changes.item);
        if (s) return { emoji: s.emoji, name: s.name };
        const f = FASHION_ITEMS.find(f => f.id === feedback.changes.item);
        if (f) return { emoji: f.icon || '👕', name: f.name };
        return { emoji: '🎁', name: 'Special Item' };
    })() : null;

    const isDanger = feedback.type === 'danger';

    return (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className={`w-full max-w-xs bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border-[3px] ${isDanger ? 'border-red-500/50' : 'border-green-500/50'} relative flex flex-col transform scale-95`}>
                
                {/* Header / Status Icon */}
                <div className={`py-5 flex flex-col items-center justify-center ${isDanger ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg mb-2 ${isDanger ? 'bg-red-500 text-white' : 'bg-green-500 text-white'} animate-in zoom-in duration-300`}>
                        {isDanger ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
                    </div>
                    <h3 className={`text-xl font-black uppercase tracking-tight ${isDanger ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {feedback.title}
                    </h3>
                </div>

                {/* Character & Quote */}
                <div className="p-5 pt-0 -mt-5 relative z-10 flex flex-col items-center">
                    {charImg && (
                        <div className="w-16 h-16 rounded-full border-4 border-white dark:border-slate-800 shadow-md overflow-hidden bg-gray-200 mb-3 animate-in zoom-in duration-500 delay-100">
                            <TransitionImage src={charImg} alt="Character" className="w-full h-full object-cover object-top" />
                        </div>
                    )}
                    
                    <div className="bg-slate-800 text-white p-3 rounded-2xl text-center shadow-sm w-full relative mb-4">
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45"></div>
                        <p className="text-xs font-medium italic leading-relaxed">
                            "{feedback.narrative}"
                        </p>
                    </div>

                    {/* Rewards Stack */}
                    <div className="w-full space-y-1.5 mb-4">
                        {/* 1. Item Reward */}
                        {itemDetails && (
                            <div className="flex items-center gap-2 bg-pink-50 dark:bg-pink-900/20 p-2 rounded-xl border border-pink-200 dark:border-pink-800 animate-in slide-in-from-bottom-2 delay-200">
                                <div className="text-xl filter drop-shadow-sm"><EmojiIcon emoji={itemDetails.emoji} /></div>
                                <div className="flex-1 text-left">
                                    <div className="text-[9px] font-bold text-pink-500 uppercase tracking-wide">Received</div>
                                    <div className="text-xs font-bold text-slate-800 dark:text-white">{itemDetails.name}</div>
                                </div>
                            </div>
                        )}

                        {/* 2. Relationship Change */}
                        {feedback.changes.relationship && (
                            <div className={`flex items-center gap-2 p-2 rounded-xl border animate-in slide-in-from-bottom-2 delay-300 ${feedback.changes.relationship.amount < 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200'}`}>
                                <div className={`p-1.5 rounded-full ${feedback.changes.relationship.amount < 0 ? 'bg-red-100 text-red-500' : 'bg-rose-100 text-rose-500'}`}>
                                    {feedback.changes.relationship.amount < 0 ? <HeartCrack size={14} /> : <Heart size={14} fill="currentColor" />}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className={`text-[9px] font-bold uppercase tracking-wide ${feedback.changes.relationship.amount < 0 ? 'text-red-500' : 'text-rose-500'}`}>
                                        {feedback.changes.relationship.charName}
                                    </div>
                                    <div className="text-xs font-bold text-slate-800 dark:text-white">
                                        {feedback.changes.relationship.amount > 0 ? '+' : ''}{feedback.changes.relationship.amount} Love
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Gold/Diamonds */}
                        {(feedback.changes.gold || feedback.changes.diamonds) && (
                            <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-xl border border-yellow-200 dark:border-yellow-800 animate-in slide-in-from-bottom-2 delay-400">
                                <div className="p-1.5 rounded-full bg-yellow-100 text-yellow-600">
                                    <Coins size={14} />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-[9px] font-bold text-yellow-600 uppercase tracking-wide">Currency</div>
                                    <div className="text-xs font-bold text-slate-800 dark:text-white flex gap-2">
                                        {feedback.changes.gold && <span>+{feedback.changes.gold} G</span>}
                                        {feedback.changes.diamonds && <span className="text-cyan-500">+{feedback.changes.diamonds} Gems</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. Core Memory */}
                        {feedback.changes.memory && (
                            <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg text-center border border-slate-200 dark:border-slate-700 animate-in fade-in delay-500">
                                <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-[10px]">
                                    <Brain size={12} /> บันทึกความทรงจำสำคัญ
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={feedback.onDismiss}
                        className="w-full py-3 rounded-xl font-black bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-[1.02] transition-all shadow-xl active:scale-95 text-sm"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export const MailApp: React.FC<MailAppProps> = ({ onClose }) => {
    const { mails, deleteMail, readMail, claimMailReward, addGold, addDiamonds, addItem, addStyle, setGameState, loveScores, memories, addMail } = useGameStore();
    const [selectedMail, setSelectedMail] = useState<MailItem | null>(null);
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);

    const unreadCount = mails.filter(m => !m.isRead || (m.rewards && !m.isClaimed)).length;

    // --- DEBUG: GENERATE TEST MAIL ---
    const handleTestMail = () => {
        // 30% Chance for Secret Mail, 70% for Daily News
        const isSecret = Math.random() < 0.3;
        const timestamp = Date.now();
        let newMail: MailItem;

        if (isSecret) {
            const scenario = SECRET_MAIL_SCENARIOS[Math.floor(Math.random() * SECRET_MAIL_SCENARIOS.length)];
            newMail = {
                id: `secret_test_${timestamp}`,
                sender: scenario.sender,
                subject: scenario.subject,
                body: scenario.body,
                timestamp: timestamp,
                isRead: false,
                type: 'secret',
                actions: [
                    {
                        id: `act_A_${timestamp}`,
                        label: scenario.choices[0].label,
                        type: 'REPLY',
                        payload: `${scenario.id}:0`,
                        style: scenario.choices[0].style
                    },
                    {
                        id: `act_B_${timestamp}`,
                        label: scenario.choices[1].label,
                        type: 'REPLY',
                        payload: `${scenario.id}:1`,
                        style: scenario.choices[1].style
                    }
                ]
            };
        } else {
            const news = DAILY_NEWS_POOL[Math.floor(Math.random() * DAILY_NEWS_POOL.length)];
            newMail = {
                id: `news_test_${timestamp}`,
                sender: news.sender,
                subject: news.subject,
                body: news.body,
                timestamp: timestamp,
                isRead: false,
                type: 'system',
                rewards: { gold: 50 },
                isClaimed: false
            };
        }

        addMail(newMail);
        playSfx('chat_receive');
    };

    // --- ACTIONS LOGIC (GENERIC & SCENARIO SUPPORT) ---
    const handleAction = (mail: MailItem, payload: string) => {
        
        // 1. Check if it's a System Scenario (Format: ID:INDEX)
        if (payload.includes(':')) {
            const [scenarioId, choiceIdxStr] = payload.split(':');
            const choiceIndex = parseInt(choiceIdxStr);
            const scenario = SECRET_MAIL_SCENARIOS.find(s => s.id === scenarioId);

            if (scenario && scenario.choices[choiceIndex]) {
                const choice = scenario.choices[choiceIndex];
                const charId = scenario.targetCharId;
                const charName = CHARACTER_DATA[charId]?.name || charId;

                // Prepare Feedback Data
                const feedbackData: FeedbackState = {
                    visible: true,
                    title: choice.style === 'danger' ? 'Critical Outcome' : 'Decision Made',
                    narrative: choice.feedback, // This is now the character quote
                    type: choice.style === 'danger' ? 'danger' : 'success',
                    changes: {},
                    onDismiss: () => {
                        handleDelete(mail.id);
                        setFeedback(null);
                        setSelectedMail(null);
                    }
                };

                // A. Grant Rewards
                if (choice.reward.gold) {
                    addGold(choice.reward.gold);
                    feedbackData.changes.gold = choice.reward.gold;
                }
                if (choice.reward.diamonds) {
                    addDiamonds(choice.reward.diamonds);
                    feedbackData.changes.diamonds = choice.reward.diamonds;
                }
                if (choice.reward.item) {
                    const isStyle = FASHION_ITEMS.some(f => f.id === choice.reward.item);
                    if (isStyle) addStyle(choice.reward.item!);
                    else addItem(choice.reward.item!);
                    feedbackData.changes.item = choice.reward.item;
                }

                // B. Update Relationship
                if (choice.relationshipChange !== 0) {
                    const currentLove = loveScores[charId] || 0;
                    const newLove = Math.max(0, currentLove + choice.relationshipChange);
                    setGameState({
                        loveScores: { ...loveScores, [charId]: newLove }
                    });
                    feedbackData.changes.relationship = {
                        charId,
                        charName,
                        amount: choice.relationshipChange
                    };
                }

                // C. Inject Memory (CRITICAL)
                if (choice.memoryText) {
                    const newMem = {
                        id: `mail_mem_${Date.now()}`,
                        text: choice.memoryText,
                        tier: 'core' as const, // Force CORE to make it stick
                        timestamp: Date.now(),
                        lastAccess: Date.now(),
                        importance: 10
                    };
                    const charMems = memories[charId] || [];
                    setGameState({
                        memories: { ...memories, [charId]: [...charMems, newMem] }
                    });
                    feedbackData.changes.memory = true;
                }

                // D. Show Feedback
                playSfx(choice.style === 'danger' ? 'bubble_wrong' : 'task_complete');
                setFeedback(feedbackData);
                return;
            }
        }
        
        // Fallback for legacy/custom payloads (e.g. BETRAY / PROTECT)
        if (payload === 'BETRAY') {
            addGold(5000);
            playSfx('task_complete');
            setFeedback({
                visible: true,
                title: 'Betrayal Reward',
                narrative: 'You revealed the information to Wongwattana Corp and received 5000G.',
                type: 'danger',
                changes: { gold: 5000 },
                onDismiss: () => {
                    handleDelete(mail.id);
                    setFeedback(null);
                    setSelectedMail(null);
                }
            });
            return;
        } else if (payload === 'PROTECT') {
            playSfx('task_complete');
            setFeedback({
                visible: true,
                title: 'Protected',
                narrative: 'You deleted the inquiry and protected Ms. Jellie\'s location.',
                type: 'success',
                changes: {},
                onDismiss: () => {
                    handleDelete(mail.id);
                    setFeedback(null);
                    setSelectedMail(null);
                }
            });
            return;
        }

        handleDelete(mail.id);
        setSelectedMail(null);
    };

    const handleClaim = (mail: MailItem) => {
        const success = claimMailReward(mail.id);
        if (success) {
            playSfx('task_complete');
            // Immediately update local UI state to reflect claim
            if (selectedMail && selectedMail.id === mail.id) {
                setSelectedMail({ ...selectedMail, isClaimed: true });
            }
        }
    };

    const handleDelete = (id: string) => {
        playSfx('bubble_pop');
        deleteMail(id);
        if (selectedMail?.id === id) setSelectedMail(null);
    };

    const handleSelectMail = (mail: MailItem) => {
        if (!mail.isRead) {
            readMail(mail.id);
        }
        setSelectedMail(mail);
    };

    const getIcon = (type: string) => {
        switch(type) {
            case 'system': return <Inbox size={20} className="text-blue-500" />;
            case 'promo': return <Gift size={20} className="text-pink-500" />;
            case 'secret': return <Eye size={20} className="text-red-500" />;
            default: return <Mail size={20} className="text-gray-500" />;
        }
    };

    const resolveItemName = (itemId: string) => {
        const shopItem = SHOP_ITEMS.find(i => i.id === itemId);
        if (shopItem) return shopItem.name;
        const fashionItem = FASHION_ITEMS.find(i => i.id === itemId);
        if (fashionItem) return fashionItem.name;
        return "Special Item";
    };

    return (
        <div className="absolute inset-0 bg-slate-50 dark:bg-black flex flex-col z-50 text-slate-900 dark:text-white overflow-hidden">
            
            {/* Header */}
            <div className="shrink-0 bg-white dark:bg-slate-900 z-30 pt-[44px] pb-3 border-b border-gray-200 dark:border-white/10 shadow-sm flex items-center px-4 justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={selectedMail ? () => setSelectedMail(null) : onClose} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight">Inbox {unreadCount > 0 && <span className="text-blue-500">({unreadCount})</span>}</h1>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto relative bg-gray-50 dark:bg-black">
                {selectedMail ? (
                    // --- DETAIL VIEW ---
                    <div className="p-6 min-h-full bg-white dark:bg-slate-900 animate-in slide-in-from-right duration-300 relative">
                        
                        {/* Feedback Overlay (Modal) */}
                        {feedback && <FeedbackModal feedback={feedback} />}

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black leading-tight mb-2">{selectedMail.subject}</h2>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedMail.sender}</span>
                                    <span>•</span>
                                    <span>{new Date(selectedMail.timestamp).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className={`p-3 rounded-full ${selectedMail.type === 'secret' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                {getIcon(selectedMail.type)}
                            </div>
                        </div>

                        <div className="prose dark:prose-invert text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300 mb-8 border-t border-b border-gray-100 dark:border-white/5 py-6">
                            {selectedMail.body}
                        </div>

                        {/* REWARDS SECTION */}
                        {selectedMail.rewards && !selectedMail.isClaimed && (
                            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-2xl border border-yellow-200 dark:border-yellow-700/50 mb-6 flex items-center justify-between">
                                <div className="flex gap-3 items-center">
                                    {selectedMail.rewards.gold && (
                                        <div className="flex items-center gap-1 font-bold text-yellow-600 dark:text-yellow-400 text-xs">
                                            <Coins size={14} /> {selectedMail.rewards.gold} G
                                        </div>
                                    )}
                                    {selectedMail.rewards.diamonds && (
                                        <div className="flex items-center gap-1 font-bold text-cyan-600 dark:text-cyan-400 text-xs">
                                            <Gem size={14} /> {selectedMail.rewards.diamonds}
                                        </div>
                                    )}
                                    {selectedMail.rewards.item && (
                                        <div className="flex items-center gap-1 font-bold text-pink-600 dark:text-pink-400 text-xs">
                                            <ShoppingBag size={14} /> {resolveItemName(selectedMail.rewards.item)}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => handleClaim(selectedMail)}
                                    className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all"
                                >
                                    Claim
                                </button>
                            </div>
                        )}

                        {selectedMail.isClaimed && (
                            <div className="w-full py-3 bg-gray-100 dark:bg-white/5 rounded-xl text-center text-xs font-bold text-gray-400 mb-6 flex items-center justify-center gap-2 animate-in fade-in duration-300">
                                <CheckCircle2 size={14} /> Rewards Claimed
                            </div>
                        )}

                        {/* ACTION BUTTONS (For Event Mails) */}
                        {selectedMail.actions && (
                            <div className="space-y-3 mb-8">
                                {selectedMail.actions.map(action => (
                                    <button 
                                        key={action.id}
                                        onClick={() => handleAction(selectedMail, action.payload)}
                                        className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2
                                            ${action.style === 'danger' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'}
                                        `}
                                    >
                                        {action.style === 'danger' && <AlertCircle size={16} />}
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button 
                            onClick={() => handleDelete(selectedMail.id)}
                            className="w-full py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <Trash2 size={16} /> Delete Message
                        </button>

                    </div>
                ) : (
                    // --- LIST VIEW ---
                    <div className="pb-20">
                        {mails.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                                    <Inbox size={40} className="opacity-50" />
                                </div>
                                <p className="text-sm font-medium">No mail available.</p>
                                <button onClick={handleTestMail} className="text-xs text-blue-500 hover:underline">
                                    Generate Test Mail
                                </button>
                            </div>
                        ) : (
                            mails.map(mail => (
                                <div 
                                    key={mail.id} 
                                    onClick={() => handleSelectMail(mail)}
                                    className={`
                                        flex items-start gap-4 p-4 border-b border-gray-100 dark:border-white/5 cursor-pointer active:bg-gray-50 dark:active:bg-white/5 transition-colors relative group
                                        ${!mail.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                                    `}
                                >
                                    {!mail.isRead && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                    )}
                                    
                                    <div className={`mt-1 shrink-0 ${!mail.isRead ? 'text-blue-500' : 'text-gray-400'}`}>
                                        {getIcon(mail.type)}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h3 className={`text-sm truncate pr-2 ${!mail.isRead ? 'font-black text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                                                {mail.sender}
                                            </h3>
                                            <span className="text-[10px] text-gray-400 shrink-0">
                                                {new Date(mail.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className={`text-sm mb-1 truncate ${!mail.isRead ? 'font-bold text-slate-800 dark:text-gray-200' : 'font-medium text-gray-500 dark:text-gray-400'}`}>
                                            {mail.subject}
                                        </p>
                                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                            {mail.body}
                                        </p>
                                    </div>
                                    
                                    <div className="self-center flex items-center gap-2 text-gray-300 dark:text-gray-600">
                                        {mail.rewards && !mail.isClaimed && (
                                            <div className="bg-yellow-100 text-yellow-600 p-1.5 rounded-full animate-bounce">
                                                <Gift size={12} />
                                            </div>
                                        )}
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

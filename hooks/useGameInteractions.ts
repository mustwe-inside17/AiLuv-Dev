import { useStoryInteraction } from './useStoryInteraction';
import { emptyStoryProgress } from '../domain/story/storyEngine';
import { routeStoryInput } from '../domain/story/storyRouter';

import React, { useState, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../store/gameStore';
import { generateResponse, generateQuestOptions } from '../services/mockAi'; 
import { processTaskCompletion } from '../services/secureEconomy';
import { calculateLoveScore, calculateEffectiveMaxEnergy } from '../services/buffMechanics';
import { playSfx } from '../utils/audioUtils';
import { 
    CharacterId, Message, ActionType, CharacterQuest, QuestOption, CharacterQuestChoice, DateSceneType,
    UserProfile, ShopItem, RelationshipTier, Mood, SceneType, PlayerAttributes, ActiveTask,
    SecretUnlockData
} from '../types';
import { normalizeSceneKey, resolveFreestyleScene } from '../utils/dateUtils';
import { 
    CHARACTER_DATA, ACTION_CONFIG, SHOP_ITEMS, 
    ACTION_ITEM_MAP, LOCATIONS, DATE_LOCATIONS_DATA, TIER_THRESHOLDS, SKILL_TREE, SECRET_META,
    CHARACTER_GIFT_MAP, SECRET_REGISTRY // [MARCUS FIX]: Added SECRET_REGISTRY import
} from '../constants';
import { getRandomTheme, getRandomRareTheme } from '../constants/themes';
import { getTierInfo } from '../utils/relationshipLogic';
import { getSecretUnlockFromText } from '../services/ai/dynamicContext';
import { generateContextualFallbackChoices } from '../utils/questUtils';
import { sendCharacterMilestoneMail } from '../services/mailSystem';
import { calculateQuestLoveReward, getQuestChoiceMultiplier, isBlockingCharacterQuest } from '../domain/quests/questState';

interface UseGameInteractionsProps {
    userProfile: UserProfile | null;
    messagesMap: Record<CharacterId, Message[]>;
    setMessagesMap: React.Dispatch<React.SetStateAction<Record<CharacterId, Message[]>>>;
    triggerNotification: (title: string, message: string, rewards?: string[], type?: any, icon?: any, avatar?: string, action?: () => void) => void;
    trackQuestProgress: (type: string, amount: number) => void;
    updateQuestProgress: (type: string, amount: number) => void;
    unlockAchievement: (id: string) => void;
    onLevelUp?: (level: number) => void;
}

// COMPREHENSIVE ROLEPLAY NARRATIVE MAP
const ACTION_NARRATIVES: Record<string, string> = {
    // --- GIFTS ---
    'gift': "(ยื่นชานมไข่มุกหวาน 100% ให้ ดื่มแล้วจะอารมณ์ดีนะ) 🧋",
    'give_noodle': "(ยื่นมาม่าคัพให้ พักกินมาม่าร้อนๆให้ท้องอิ่มสักหน่อยนะ อร่อยมาก) 🍜",
    'give_beer': "(เปิดเบียร์เย็นๆกินกันดีกว่า เอ้า ชน !!) 🍺",
    'give_teddy': "(ยื่นตุ๊กตาหมีอ้วนตัวกลม นุ่มนิ่มน่ารักให้ เอาไว้กอดตอนคิดถึงกันนะ) 🧸",
    'give_console': "(ยื่นเครื่องเล่นเกมพกพารุ่นใหม่ล่าสุดให้ เขาบอกรุ่นนี้ภาพสวยสุดๆเลย) 🎮",
    'gift_bouquet': "(ซ่อนดอกไม้ไว้ข้างหลังแล้วยื่นให้) เซอร์ไพรส์! ช่อนี้สำหรับเธอครับ 💐",
    'gift_ring': "(บรรจงสวมแหวนให้) แหวนวงนี้... แทนคำสัญญาของผมนะ 💍",
    'gift_bracelet': "(ผูกข้อมือให้) สร้อยข้อมือคู่กัน... เราจะเป็นเพื่อนสนิทกันตลอดไปนะ 🧵",
    'gift_jacket': "(คลุมเสื้อแจ็คเก็ตให้) ใส่ไว้นะ เดี๋ยวจะไม่สบาย เป็นห่วง 🧥",
    'gift_keycard': "(ยื่นคีย์การ์ดสำรองให้) อยากให้เธอเก็บไว้... มาหาได้ตลอดเลยนะ 🔑",
    'gift_eternity_pendant': "(สวมสร้อยคอให้) จี้อันนี้... คือตัวแทนความรักของผมที่มีให้คุณตลอดไป 🌌",
    'gift_dead_branch': "(ยื่นกิ่งไม้ปริศนาจากตลาดมึดให้ เขาว่ากันว่ามันมีสิ่งลี้ลับ คนมักเรียกมันว่าไม้ผี ลองหักดูสิ) 🍂",
    'give_magic_ice_cream': "(ยื่นไอศครีมสีรุ้งให้ เขาว่ามันมีพลังพิเศษเปลี่ยนอารมณ์ได้) 🍦",

    // --- BASIC INTERACTIONS ---
    'poke': "(ใช้นิ้วจิ้มๆ ที่แขนเบาๆ) นี่แน่ะๆ สนใจกันหน่อย 👉",
    'headpat': "(ลูบหัวเบาๆ ด้วยความเอ็นดู) เด็กดีๆ... เก่งมากครับ 👋",
    'cheer_up': "(ชูสองนิ้วให้กำลังใจ) สู้ๆ นะ! เธอทำได้อยู่แล้ว! ✌️",
    'high_five': "(ยกมือรอไฮไฟว์) เย้! สำเร็จแล้ว แปะมือกัน! 🙏",
    'mini_heart': "(ทำท่ามินิฮาร์ทส่งให้) ส่งรักไปให้... รับด้วยนะ! 🫰",
    
    // --- SIGNATURES ---
    'cat_scratch': "(เกาเกาคางให้เหมือนแมว) เมี๊ยวๆ... ชอบมั้ยคะเจ้าเหมียว 😼",
    'wipe_sweat': "(ใช้ผ้าซับเหงื่อให้เบาๆ) เหนื่อยแย่เลย... พักหน่อยนะ 🧖‍♀️",
    'spot_check': "(ช่วยเซฟตอนยกเวท) ฮึบ! อีกนิดเดียว... ขึ้น! สวยมาก! 💪",
    'smell_check': "(ยื่นหน้าเข้าไปดมกลิ่นกาแฟ) หอมจัง... กลิ่นกาแฟหรือกลิ่นคนชงเนี่ย ☕",
    'check_watch': "(แกล้งจับข้อมือดูนาฬิกา) เวลาไหนก็คิดถึงแต่เธอเนี่ย... ⌚",
    'fix_tie': "(ขยับเข้าไปจัดเนคไทให้) เดี๋ยวหล่อน้อยลงนะ... เสร็จแล้วค่ะ 👔",
    'share_earbud': "(ยื่นหูฟังให้ข้างนึง) ฟังเพลงนี้สิ ความหมายดีนะ 🎧",
    'give_postit': "(แปะโพสต์อิทที่หน้าผาก) 'ยิ้มเข้าไว้โลกสดใส' ... อ่านด้วยนะ! 📝",
    'check_outfit': "(จับชายเสื้อจัดทรงให้) วันนี้แต่งตัวดีนี่นา... ดูดีเลย 👗",
    'poke_cheek': "(จิ้มแก้มป่องๆ) หมั่นเขี้ยวจัง... กินอะไรเข้าไปเนี่ย 🤏",
    'treat_snack': "(ป้อนขนมเข้าปาก) อ้ามมม... อร่อยมั้ย? 🍡",
    'fix_apron': "(อ้อมไปผูกผ้ากันเปื้อนให้จากด้านหลัง) เดี๋ยวหลุดนะ... ผูกให้ใหม่แล้ว 🎀",
    'selfie': "(ยกมือถือขึ้นมาถ่ายรูปคู่) ยิ้มหวานๆ หน่อย... แชะ! น่ารัก! 📸",

    // --- ROMANCE ---
    'hold_hands': "(ค่อยๆ เอื้อมมือไปกุมมือไว้) ขอจับมือหน่อยนะ... อุ่นจัง 🤝",
    'hug': "(ดึงตัวเข้ามากอดแน่นๆ) ขอกอดเติมพลังหน่อยนะ... ฮึบ! 🫂",
    'kiss_cheek': "(ขโมยหอมแก้มฟอดใหญ่) ชื่นใจจัง... แก้มนิ่มมากเลย 😚",
    'kiss': "(ประคองหน้าแล้วจูบเบาๆ) รักนะครับ... 💋",
    'deep_kiss': "(จูบอย่างดูดดื่มและเร่าร้อน) ... (บรรยากาศเริ่มร้อนแรง) 🔥",
};

export const useGameInteractions = ({
    userProfile,
    messagesMap,
    setMessagesMap,
    triggerNotification,
    trackQuestProgress,
    updateQuestProgress,
    unlockAchievement,
    onLevelUp
}: UseGameInteractionsProps) => {
    
    const [isTyping, setIsTyping] = useState(false);
    const storyInteraction = useStoryInteraction({ messagesMap, setMessagesMap, userProfile, setIsTyping });
    const [lastAction, setLastAction] = useState<{ type: ActionType, timestamp: number } | null>(null);
    const [consumptionResult, setConsumptionResult] = useState<{ item: ShopItem, energyGained: number, buffsGained?: any, statGained?: any, styleItem?: any } | null>(null);
    const questRequestRef = useRef<string | null>(null);
    const questSubmissionRef = useRef<string | null>(null);

    // Direct store actions
    const { 
        startTask, completeTask, addItem, removeItem, addGold, spendGold, spendDiamonds,
        addEnergy, deductEnergy, setGameState, setDateScene, setPendingQuestReward, setActiveQuestChoice,
        addBuff, setSecretUnlockData
    } = useGameStore(useShallow(state => ({
        startTask: state.startTask,
        completeTask: state.completeTask,
        addItem: state.addItem,
        removeItem: state.removeItem,
        addGold: state.addGold,
        spendGold: state.spendGold,
        spendDiamonds: state.spendDiamonds,
        addEnergy: state.addEnergy,
        deductEnergy: state.deductEnergy,
        setGameState: state.setGameState,
        setDateScene: state.setDateScene,
        setPendingQuestReward: state.setPendingQuestReward,
        setActiveQuestChoice: state.setActiveQuestChoice,
        addBuff: state.addBuff,
        setSecretUnlockData: state.setSecretUnlockData
    })));

    // Helper to get current state in callbacks
    const getGameState = () => useGameStore.getState();

    // --- [MARCUS NEW]: GIFTING LOGIC (20% CHANCE) ---
    const triggerCharacterGift = (charId: CharacterId) => {
        // 1. Roll Dice (20%)
        if (Math.random() > 0.2) return;

        // 2. Identify Gift
        const giftItemId = CHARACTER_GIFT_MAP[charId];
        if (!giftItemId) return;

        const shopItem = SHOP_ITEMS.find(i => i.id === giftItemId);
        // Special Case: Gold
        const isGold = giftItemId === 'gift_gold';
        
        let giftObj: any = {};
        
        if (isGold) {
            giftObj = {
                id: 'gift_gold',
                name: 'Red Envelope',
                cost: 0,
                emoji: '🧧',
                isGift: true,
                giftValue: 300 + Math.floor(Math.random() * 200) // 300-500G
            };
        } else if (shopItem) {
            giftObj = {
                id: shopItem.id,
                name: shopItem.name,
                cost: shopItem.cost,
                emoji: shopItem.emoji,
                isGift: true
            };
        } else {
            return;
        }

        // 3. Inject Message
        setTimeout(() => {
            const getGiftDialog = (cid: string) => {
                switch(cid) {
                    case 'miguel': return "ขอบใจนะสำหรับวันนี้... อะนี่! ฉันให้เป็นรางวัลความพยายามของนาย (ยื่นของให้ด้วยใบหน้าแดงรื่อ)";
                    case 'fia': return "ไม่เลวนี่! อะ... รับไปสิ ฉันแค่เห็นว่ามันน่าจะเหมาะกับเธอไม่ได้คิดอะไรหรอกนะ (โยนของให้แล้วหันหน้าหนี)";
                    case 'peat': return "วันนี้คุณน่ารักมากเลยครับ... ผมมีของขวัญเล็กๆ น้อยๆ มาให้ หวังว่าจะชอบนะครับ (ยื่นของให้พร้อมรอยยิ้มละมุน)";
                    case 'erin': return "เฮ้! ขอบใจที่มาสนุกด้วยกันนะ เอานี่ไปสิ ฉันตั้งใจเลือกให้เลยนะ (ขยิบตาพร้อมยื่นของให้)";
                    case 'marcus': return "Excellent work! ผลงานคุณประทับใจผมมาก รับโบนัสพิเศษนี่ไปเลยครับ (ยื่นของให้ด้วยความมั่นใจ)";
                    case 'lucas': return "เฮ้ย! ขอบใจว่ะเพื่อน อะนี่... ถือว่าเป็นค่าน้ำใจจากฉันแล้วกันนะ (ตบไหล่เบาๆ แล้วยื่นของให้)";
                    case 'bam': return "พี่... หนูมีของจะให้ค่ะ! พี่อุตส่าห์ช่วยหนูขนาดนี้ รับไว้เถอะนะคะ (พนมมือไหว้ย่อแล้วยื่นของให้)";
                    case 'jellie': return "โยว่! เจ๋งเป้งไปเลยพี่! เอานี่ไปเป็นรางวัลจากเจลลี่นะเฟี้ยววว! (กระโดดส่งของให้อย่างร่าเริง)";
                    case 'soul': return "ขอบคุณที่เหนื่อยมาด้วยกันนะครับ ลองใช้สิ่งนี้ดูครับ น่าจะมีประโยชน์กับคุณ (ยื่นของให้อย่างอ่อนโยน)";
                    case 'mia': return "นี่ๆ! เค้ามีของจะให้ด้วยนะ ถือว่าเป็นรางวัลที่น่ารักกับเค้าวันนี้เย้! (ยื่นของให้ด้วยรอยยิ้มสดใส)";
                    default: return "ขอบคุณนะ... อันนี้ให้เป็นรางวัลครับ/ค่ะ (ยื่นของให้)";
                }
            };

            const giftMsg: Message = {
                id: `gift_sys_${Date.now()}`,
                sender: charId,
                text: getGiftDialog(charId),
                timestamp: Date.now() + 1000, // Slight delay after main reply
                interactiveItem: giftObj
            };

            setMessagesMap(prev => ({
                ...prev,
                [charId]: [...(prev[charId] || []), giftMsg]
            }));

            playSfx('task_complete');
            triggerNotification(
                'Bonus Gift!', 
                `${CHARACTER_DATA[charId].name} gave you a gift!`, 
                ['Tap to Receive'], 
                'success'
            );
        }, 1500);
    };

    // --- 1. HANDLE START TASK ---
    const handleStartTask = (type: 'work' | 'gym' | 'party', item: any) => {
        const gameState = getGameState();
        
        let activeTask: ActiveTask | null = null;
        if (type === 'work') {
             const job = item;
             deductEnergy(job.energyCost);
             trackQuestProgress('spend_energy', job.energyCost);
             
             activeTask = {
                 type: 'work',
                 id: job.id,
                 name: job.name,
                 startTime: Date.now(),
                 endTime: Date.now() + (job.durationSeconds * 1000),
                 rewardValue: job.goldReward,
                 expReward: job.expReward,
                 cooldownMinutes: job.cooldownMinutes
             };
        } else if (type === 'gym') {
             const workout = item;
             if (workout.goldCost) spendGold(workout.goldCost);
             deductEnergy(workout.energyCost);
             trackQuestProgress('spend_energy', workout.energyCost); 

             activeTask = {
                 type: 'gym',
                 id: workout.id,
                 name: workout.name,
                 startTime: Date.now(),
                 endTime: Date.now() + (workout.durationSeconds * 1000),
                 rewardValue: 0, 
                 expReward: workout.expReward,
                 cooldownMinutes: workout.cooldownMinutes
             };
        } else if (type === 'party') {
             deductEnergy(20);
             trackQuestProgress('spend_energy', 20);
             activeTask = {
                 type: 'party',
                 id: 'party_1',
                 name: 'Party Time!',
                 startTime: Date.now(),
                 endTime: Date.now() + 15000, 
                 rewardValue: 0,
                 expReward: 50
             };
        }

        if (activeTask) {
            startTask(activeTask);
            playSfx('event_alert');
        }
    };

    // --- 2. HANDLE BUY ITEM ---
    const handleBuyItem = (item: ShopItem, targetCharId?: CharacterId) => {
        const gameState = getGameState();
        const currency = item.currency || 'gold';
        
        if (currency === 'diamond') {
            if (!spendDiamonds(item.cost)) {
                triggerNotification('Insufficient Diamonds', 'You need more gems.', [], 'error');
                return;
            }
        } else {
            if (!spendGold(item.cost)) {
                triggerNotification('Insufficient Gold', 'You need more gold.', [], 'error');
                return;
            }
        }

        addItem(item.id);
        
        if (item.unlocksSkill) {
            if (!gameState.unlockedSkills.includes(item.unlocksSkill)) {
                setGameState({ unlockedSkills: [...gameState.unlockedSkills, item.unlocksSkill] });
                const skillName = SKILL_TREE.find(s => s.id === item.unlocksSkill)?.name || "New Skill";
                triggerNotification('Skill Unlocked!', `${skillName} is now active.`, [], 'level-up');
            }
        }

        if (currency === 'gold') trackQuestProgress('spend_gold', item.cost);

        if (gameState.tutorialStep === 'shop_buy_cookie' && item.id === 'food_cookie') {
            setGameState({ tutorialStep: 'buff_explanation' });
        }

        playSfx('task_complete'); 
        triggerNotification('Purchase Successful', `Bought ${item.name}`, [`-${item.cost} ${currency === 'diamond' ? 'Gems' : 'G'}`], 'success');
    };

    // --- 3. HANDLE CHAT TRANSACTION ---
    const handleChatTransaction = (itemId: string, messageId: string, socialChatId?: CharacterId | null, guestId?: CharacterId | null) => {
        const gameState = getGameState();
        const charId = socialChatId || guestId || (LOCATIONS[gameState.currentLocation]?.characterId as CharacterId);
        
        if (charId && messagesMap[charId]) {
            const newMsgs = messagesMap[charId].map(m => {
                if (m.id === messageId && m.interactiveItem) {
                    const itemDef = SHOP_ITEMS.find(i => i.id === itemId);
                    
                    // Handle receive gift (free)
                    if (m.interactiveItem.isGift || m.interactiveItem.giftValue) {
                        if (m.interactiveItem.giftValue) {
                            addGold(m.interactiveItem.giftValue);
                            triggerNotification('Gift Received', `You received money!`, [`+${m.interactiveItem.giftValue} G`], 'success');
                        } else {
                            addItem(itemId);
                            triggerNotification('Gift Received', `You received ${m.interactiveItem.name}!`, [], 'success');
                        }
                        return { ...m, interactiveItem: { ...m.interactiveItem, purchased: true } };
                    }

                    // Handle purchase
                    if (itemDef) {
                        const currency = itemDef.currency || 'gold';
                        const canAfford = currency === 'diamond' ? (gameState.diamonds || 0) >= itemDef.cost : gameState.gold >= itemDef.cost;
                        
                        if (canAfford) {
                            if (currency === 'diamond') spendDiamonds(itemDef.cost);
                            else spendGold(itemDef.cost);
                            
                            addItem(itemId);
                            if (itemDef.unlocksSkill) {
                                if (!gameState.unlockedSkills.includes(itemDef.unlocksSkill)) {
                                    setGameState({ unlockedSkills: [...gameState.unlockedSkills, itemDef.unlocksSkill] });
                                }
                            }

                            triggerNotification('Purchased', `Bought ${itemDef.name}`, [], 'success');
                            return { ...m, interactiveItem: { ...m.interactiveItem, purchased: true } };
                        } else {
                            triggerNotification('Failed', 'Not enough funds', [], 'error');
                        }
                    }
                }
                return m;
            });
            setMessagesMap(prev => ({ ...prev, [charId]: newMsgs }));
        }
    };

    // --- 4. HANDLE TASK COMPLETE ---
    const handleTaskComplete = () => {
        const gameState = getGameState();
        if (!gameState.activeTask) return;

        const task = gameState.activeTask;
        
        if (task.type === 'party') {
             completeTask({ 
                 activeTask: null,
                 currentExp: gameState.currentExp + (task.expReward || 0)
             });
             trackQuestProgress('party', 1);
             triggerNotification('Party Over!', 'What a night!', [`+${task.expReward} XP`], 'success');
             return;
        }

        try {
            const result = processTaskCompletion(gameState, task.id, task.type as 'work' | 'gym');
            if (result.success) {
                completeTask(result.newGameState);
                const rewards = [];
                if (result.rewards.gold) {
                    rewards.push(`+${result.rewards.gold} G`);
                    trackQuestProgress('earn_gold', result.rewards.gold);
                }
                if (result.rewards.exp) rewards.push(`+${result.rewards.exp} XP`);
                if (result.rewards.maxEnergyGain) rewards.push(`+${result.rewards.maxEnergyGain} Max Energy`);
                
                triggerNotification(
                    result.isCritical ? 'CRITICAL SUCCESS!' : 'Task Complete', 
                    result.message, 
                    rewards, 
                    result.isCritical ? 'critical' : 'success'
                );
                
                if (task.type === 'work') trackQuestProgress('work', 1);
                if (task.type === 'gym') trackQuestProgress('gym', 1);
            }
        } catch (e) {
            console.error("Task completion failed", e);
            completeTask({ activeTask: null }); 
        }
    };

    // --- 5. HANDLE ACCEPT QUEST ---
    const handleAcceptQuest = (quest: CharacterQuest, charId: CharacterId, msgId: string) => {
        const requestId = `quest_options_${quest.id}_${Date.now()}`;
        questRequestRef.current = requestId;
        // Check if quest already has high-quality, situation-specific choices
        const hasValidCustomChoices = Array.isArray(quest.choices) && quest.choices.length >= 3 && quest.choices.every(c => 
            c.title && 
            !c.title.startsWith('ทางเลือกที่') && 
            c.title !== 'ช่วยลงมือจัดการปัญหาทันที' && 
            c.title !== 'สำรวจและตรวจเช็กดูอย่างละเอียด'
        );

        if (hasValidCustomChoices) {
            setActiveQuestChoice({
                quest,
                charId,
                msgId,
                options: [],
                requestId,
                isLoading: false
            });
            return;
        }

        // Otherwise, invoke AI generation for fresh, situation-tailored choices
        setActiveQuestChoice({
            quest,
            charId,
            msgId,
            options: [],
            requestId,
            isLoading: true 
        });

        generateQuestOptions(charId, quest).then(options => {
            const currentSession = getGameState().activeQuestChoiceSession;
            if (questRequestRef.current !== requestId || currentSession?.requestId !== requestId) return;
            setActiveQuestChoice({
                quest,
                charId,
                msgId,
                options,
                requestId,
                isLoading: false
            });
        }).catch(err => {
            const currentSession = getGameState().activeQuestChoiceSession;
            if (questRequestRef.current !== requestId || currentSession?.requestId !== requestId) return;
            console.error("Quest Option Gen Error:", err);
            const contextualFallbacks = generateContextualFallbackChoices(
                quest.title,
                quest.context || quest.description,
                quest.objective || quest.title,
                CHARACTER_DATA[charId]?.name || 'ตัวละคร'
            );
            setActiveQuestChoice({
                quest: { ...quest, choices: contextualFallbacks },
                charId,
                msgId,
                options: [],
                requestId,
                isLoading: false
            });
        });
    };

    // --- 5.1 HANDLE CANCEL / CLOSE QUEST CHOICE ---
    const handleCloseQuestChoice = () => {
        if (getGameState().activeQuestChoiceSession?.isSubmitting) return;
        questRequestRef.current = null;
        setActiveQuestChoice(null);
    };

    // --- 6. HANDLE SELECT QUEST CHOICE ---
    const handleSelectQuestOption = async (choice: CharacterQuestChoice | QuestOption) => {
        const gameState = getGameState();
        const session = gameState.activeQuestChoiceSession;
        if (!session || session.isSubmitting || questSubmissionRef.current === session.requestId) return;

        const { quest, charId, msgId } = session;
        const energyCost = Math.max(0, quest.energyCost ?? 10);
        if (gameState.energy < energyCost) {
            triggerNotification('พลังงานไม่พอ', `ต้องใช้ ${energyCost} Energy`, [], 'error');
            return;
        }
        questSubmissionRef.current = session.requestId;
        questRequestRef.current = null;
        setActiveQuestChoice({ ...session, isSubmitting: true, selectedChoiceId: choice.id, error: undefined });
        const playerResponseText = ('playerResponse' in choice && choice.playerResponse) 
            ? choice.playerResponse 
            : ('text' in choice ? choice.text : choice.title);

        const choiceTitle = ('title' in choice && choice.title) ? choice.title : ('text' in choice ? choice.text : 'ทางเลือก');
        const choiceIntention = ('intention' in choice && choice.intention) ? choice.intention : 'neutral';
        const userChoiceMessageId = `user_quest_choice_${Date.now()}`;

        // Update Quest state to resolved in message history
        setMessagesMap(prev => {
            const msgs = prev[charId] || [];
            const userMsg: Message = {
                id: userChoiceMessageId,
                sender: 'user',
                text: playerResponseText,
                timestamp: Date.now()
            };

            const updatedMsgs = msgs.map(m => {
                if (m.id === msgId && m.characterQuest) {
                    return { 
                        ...m, 
                        characterQuest: { 
                            ...m.characterQuest, 
                            status: 'resolving' as const,
                            isCompleted: false
                        } 
                    };
                }
                return m;
            });

            return {
                ...prev,
                [charId]: [...updatedMsgs, userMsg]
            };
        });

        deductEnergy(energyCost);
        trackQuestProgress('spend_energy', energyCost);
        const prompt = `[SYSTEM: Player made a choice on Quest "${quest.title}". Selected Choice: "${choiceTitle}" (Intention: ${choiceIntention}). Player Response: "${playerResponseText}". React directly and continue the conversation. Do not grant Love, Chemistry, Energy, currency, items, achievements, or story flags; the deterministic game system handles rewards.]`;
        const success = await processAIResponse(prompt, undefined, true, charId, undefined, true);
        if (!success) {
            addEnergy(energyCost);
            setMessagesMap(prev => ({
                ...prev,
                [charId]: (prev[charId] || []).map(m => m.id === msgId && m.characterQuest
                    ? { ...m, characterQuest: { ...m.characterQuest, status: 'active' as const, isCompleted: false } }
                    : m).filter(m => m.id !== userChoiceMessageId)
            }));
            questSubmissionRef.current = null;
            setActiveQuestChoice({ ...session, isSubmitting: false, error: 'เชื่อมต่อไม่สำเร็จ พลังงานถูกคืนแล้ว กรุณาลองอีกครั้ง' });
            return;
        }
        const multiplier = getQuestChoiceMultiplier(choice);
        const calculatedLove = calculateQuestLoveReward(quest.loveReward, choice);
        setMessagesMap(prev => ({
            ...prev,
            [charId]: (prev[charId] || []).map(m => m.id === msgId && m.characterQuest
                ? { ...m, characterQuest: { ...m.characterQuest, status: 'reward_pending' as const, isCompleted: false } }
                : m)
        }));
        setPendingQuestReward({ quest: { ...quest, status: 'reward_pending', isCompleted: false }, charId, msgId, energyCost, calculatedLove, isCritical: multiplier >= 1.8, selectedOptionText: choiceTitle });
        questSubmissionRef.current = null;
        setActiveQuestChoice(null);
    };

    // --- 7. HANDLE COLLECT QUEST REWARD ---
    const handleCollectQuestReward = () => {
        const gameState = getGameState();
        const reward = gameState.pendingQuestReward;
        if (!reward) return;

        const { charId, calculatedLove, quest, isCritical, selectedOptionText } = reward;
        const currentLove = gameState.loveScores[charId] || 0;
        
        const updates: Partial<typeof gameState> = {};
        updates.loveScores = { ...gameState.loveScores, [charId]: currentLove + calculatedLove };
        updates.lastLoveUpdate = { charId, value: calculatedLove, isCritical: reward.isCritical, timestamp: Date.now() };
        
        setGameState(updates);
        setPendingQuestReward(null);
        setMessagesMap(prev => ({
            ...prev,
            [charId]: (prev[charId] || []).map(m => m.id === reward.msgId && m.characterQuest
                ? { ...m, characterQuest: { ...m.characterQuest, status: 'completed' as const, isCompleted: true, earnedLove: calculatedLove } }
                : m)
        }));

        // [MARCUS NEW]: TRIGGER GIFT CHANCE (20%)
        triggerCharacterGift(charId);

        const outcomeContext = isCritical 
            ? "PERFECTLY (Critical Success)" 
            : "Successfully";
            
        setTimeout(() => {
            const prompt = `[SYSTEM: User completed your Side Quest "${quest.title}" ${outcomeContext}. User chose option: "${selectedOptionText}". Reward: ${calculatedLove} Love. React specifically to what they chose to do.]`;
            processAIResponse(prompt, undefined, true, charId);
        }, 500);
    };

    // --- 8. HANDLE CONSUME ITEM ---
    const handleConsumeItem = (item: ShopItem) => {
        const gameState = getGameState();
        if ((gameState.inventory[item.id] || 0) <= 0) return;

        removeItem(item.id);
        
        let energyGained = 0;
        let buffsGained = undefined;
        let statGained = undefined;

        if (item.energyRestore > 0) {
            const effectiveMax = calculateEffectiveMaxEnergy(gameState.maxEnergy, gameState.activeBuffs, gameState.equippedStyle);
            const current = gameState.energy;
            const newEnergy = item.id === 'food_full_meal' ? current + item.energyRestore : Math.min(effectiveMax, current + item.energyRestore);
            energyGained = newEnergy - current;
            setGameState({ energy: Math.floor(newEnergy) });
        }

        if (item.buffType && item.buffDurationMinutes) {
            addBuff({
                id: Date.now().toString(),
                type: item.buffType,
                value: item.buffValue || 1,
                expiresAt: Date.now() + item.buffDurationMinutes * 60 * 1000,
                sourceName: item.name
            });
            buffsGained = { type: item.buffType, value: item.buffValue || 1, duration: item.buffDurationMinutes };
        }

        if (item.id === 'omakase') {
             const statsKeys: (keyof PlayerAttributes)[] = ['vit', 'int', 'cha', 'luck'];
             const randomStat = statsKeys[Math.floor(Math.random() * statsKeys.length)];
             const newStats = { ...gameState.stats };
             newStats[randomStat]++;
             
             let maxEnergyUpdate = gameState.maxEnergy;
             if (randomStat === 'vit') maxEnergyUpdate += 5;

             setGameState({ stats: newStats, maxEnergy: maxEnergyUpdate });
             statGained = { type: randomStat, value: 1 };
        }

        setConsumptionResult({
            item,
            energyGained,
            buffsGained,
            statGained
        });
    };

    // --- 9. HANDLE RECYCLE ITEM ---
    const handleRecycleItem = (item: ShopItem) => {
        const gameState = getGameState();
        const currentCount = gameState.inventory[item.id] || 0;
        
        if (currentCount <= 1) return;

        if (removeItem(item.id)) {
            let refund = 0;
            if (item.currency === 'diamond') {
                refund = Math.floor(item.cost * 5); 
            } else {
                refund = Math.floor(item.cost * 0.5);
            }

            addGold(refund);
            playSfx('task_complete');
            triggerNotification('Recycled', `Sold ${item.name}`, [`+${refund} G`], 'info');
        }
    };

    // --- AI RESPONSE HANDLER ---
    const processAIResponse = async (userText: string, forcedResponse?: string, isSystemEvent: boolean = false, overrideCharId?: CharacterId, enforcedMood?: Mood, suppressProgressionEffects: boolean = false): Promise<boolean> => {
        const gameState = getGameState();
        const charId = overrideCharId || (LOCATIONS[gameState.currentLocation]?.characterId as CharacterId);
        
        if (!charId) return false;

        setIsTyping(true);
        
        try {
            if (!isSystemEvent) {
                const userMsg: Message = {
                    id: Date.now().toString(),
                    sender: 'user',
                    text: userText,
                    timestamp: Date.now()
                };
                setMessagesMap(prev => ({
                    ...prev,
                    [charId]: [...(prev[charId] || []), userMsg]
                }));
            }

            let simResponse;
            if (forcedResponse) {
                simResponse = {
                    reply: forcedResponse,
                    replies: undefined,
                    mood: gameState.currentMoods[charId] || Mood.NEUTRAL,
                    love_change: 0,
                    chemistry_change: 0,
                    energy_cost: 0,
                    thought: undefined,
                    character_quest: undefined,
                    scene_transition: undefined,
                    new_memory: undefined,
                    party_memory: undefined,
                    special_event_image: undefined,
                    event_resolved: false
                };
            } else {
                simResponse = await generateResponse(
                    userText,
                    charId,
                    gameState.loveScores[charId] || 0,
                    gameState.relationshipTiers[charId] || RelationshipTier.STRANGER,
                    gameState.currentMoods[charId] || Mood.NEUTRAL,
                    messagesMap[charId] || [],
                    userProfile,
                    gameState.hasTrainedVisit,
                    gameState.activeTask?.type || null,
                    gameState.energy,
                    gameState.stats,
                    true, 
                    gameState.relationshipTiers,
                    gameState.activeEvent,
                    gameState.memories[charId] || [],
                    gameState.metCharacters,
                    false, 
                    gameState.unlockedTracks,
                    gameState.partyMember,
                    gameState.partyMember ? (gameState.memories[gameState.partyMember] || []) : [], 
                    gameState.giftCooldowns,
                    gameState.drunkTimers,
                    "", 
                    gameState.equippedStyle,
                    gameState.currentDateScene,
                    gameState.chemistryScores?.[charId] || 0,
                    gameState.partyMember ? (messagesMap[gameState.partyMember] || []).slice(-5) : []
                );
            }

            const timestampBase = Date.now();

            // [MARCUS FIX]: Quest Duplication Check
            // Prevent overlapping quests if one is already pending/active/unresolved for this character
            const charMsgs = messagesMap[charId] || [];
            const hasActiveQuest = charMsgs.some(m => isBlockingCharacterQuest(m.characterQuest));
            if (hasActiveQuest && simResponse.character_quest) {
                console.warn(`[MARCUS QUEST SAFETY]: Blocked duplicate quest generation for ${charId}`);
                simResponse.character_quest = undefined;
            }

            // [MARCUS FIX]: DETERMINISTIC SECRET TRIGGER & MATCHING
            const directSecretPath = !isSystemEvent ? getSecretUnlockFromText(charId, userText) : null;
            const aiSecretPath = simResponse.special_event_image;

            const matchedSecret = SECRET_REGISTRY[charId]?.find(s => 
                (directSecretPath && s.path === directSecretPath) ||
                (aiSecretPath && (s.path === aiSecretPath || s.id === aiSecretPath))
            );
            const activeSecretPath = matchedSecret?.path;

            // [MARCUS FIX]: BURST MESSAGING (SEQUENTIAL RENDERING)
            if (simResponse.replies && simResponse.replies.length > 0) {
                // Initial typing is already true
                for (let i = 0; i < simResponse.replies.length; i++) {
                    const reply = simResponse.replies[i];
                    const isLast = i === simResponse.replies.length - 1;
                    
                    // Simulate typing duration based on text length (min 1s, max 3s)
                    const typingDuration = Math.min(3000, Math.max(1000, reply.text.length * 40));
                    await new Promise(resolve => setTimeout(resolve, typingDuration));

                    if (isLast && simResponse.character_quest) {
                        console.log(`[MARCUS DEBUG]: Quest received from AI (Burst): ${simResponse.character_quest.title}`);
                    }

                    const newMsg: Message = {
                        id: `${timestampBase}_ai_${i}`,
                        sender: (reply.speaker_id as CharacterId) || charId,
                        text: reply.text,
                        timestamp: Date.now(),
                        thought: i === 0 ? simResponse.thought : undefined,
                        characterQuest: isLast ? (simResponse.character_quest || undefined) : undefined,
                        imageUrl: isLast ? (activeSecretPath || undefined) : undefined
                    };

                    setMessagesMap(prev => ({
                        ...prev,
                        [charId]: [...(prev[charId] || []), newMsg]
                    }));

                    if (!isLast) {
                        setIsTyping(true); // Keep typing for next bubble
                    } else {
                        setIsTyping(false);
                    }
                }
            } else {
                // Fallback for single reply
                const typingDuration = Math.min(3000, Math.max(1000, simResponse.reply.length * 40));
                await new Promise(resolve => setTimeout(resolve, typingDuration));

                if (simResponse.character_quest) {
                    console.log(`[MARCUS DEBUG]: Quest received from AI: ${simResponse.character_quest.title}`);
                }

                const newMsg: Message = {
                    id: `${timestampBase}_ai`,
                    sender: charId,
                    text: simResponse.reply,
                    timestamp: Date.now(),
                    thought: simResponse.thought,
                    characterQuest: simResponse.character_quest || undefined,
                    imageUrl: activeSecretPath || undefined
                };

                setMessagesMap(prev => ({
                    ...prev,
                    [charId]: [...(prev[charId] || []), newMsg]
                }));
                setIsTyping(false);
            }

            const currentLove = gameState.loveScores[charId] || 0;
            const currentTier = gameState.relationshipTiers[charId] || RelationshipTier.STRANGER;
            const currentChem = gameState.chemistryScores?.[charId] || 0;

            const updates: Partial<typeof gameState> = {};

            // [MARCUS FIX] FORCE UNLOCK CHARACTER IN RELATIONSHIP TAB
            // If the user interacts with a character, they are considered "Met".
            if (!gameState.metCharacters.includes(charId)) {
                updates.metCharacters = [...gameState.metCharacters, charId];
            }

            const currentCombo = gameState.comboStreaks[charId] || 0;
            let newCombo = 0;

            if (simResponse.love_change > 0) {
                newCombo = currentCombo + 1;
            } else {
                newCombo = 0;
            }
            
            updates.comboStreaks = { ...gameState.comboStreaks, [charId]: newCombo };

            if (!suppressProgressionEffects && simResponse.love_change !== 0) {
                const { total: finalScore, isCritical } = calculateLoveScore(
                    simResponse.love_change,
                    newCombo, 
                    gameState.activeBuffs,
                    gameState.stats,
                    gameState.equippedStyle,
                    charId,
                    !!gameState.currentDateScene
                );

                let potentialNewScore = currentLove + finalScore;
                const { isLocked, nextThreshold } = getTierInfo(currentTier, potentialNewScore);
                
                if (isLocked) {
                    potentialNewScore = nextThreshold - 1;
                }

                updates.loveScores = { ...gameState.loveScores, [charId]: potentialNewScore };
                updates.lastLoveUpdate = { charId, value: finalScore, isCritical, timestamp: Date.now() };

                // Party Member Companion Affinity Boost
                if (gameState.partyMember && finalScore > 0) {
                    const pId = gameState.partyMember;
                    const pCurrentLove = gameState.loveScores[pId] || 0;
                    const pBonus = Math.max(1, Math.min(5, Math.round(finalScore * 0.4)));
                    const pTier = gameState.relationshipTiers[pId] || RelationshipTier.STRANGER;
                    let potentialPLove = pCurrentLove + pBonus;
                    const { isLocked: pLocked, nextThreshold: pThreshold } = getTierInfo(pTier, potentialPLove);
                    if (pLocked) {
                        potentialPLove = pThreshold - 1;
                    }
                    updates.loveScores = { ...updates.loveScores, [pId]: potentialPLove };
                }

                // --- MARCUS FIX: AUTO TIER PROMOTION (EARLY GAME) ---
                // Stranger -> Acquaintance -> Friend happens automatically based on score.
                // Higher tiers (Flirting/Partner/etc) are locked by Items via ChatActionMenu.
                let newTier = currentTier;

                if (currentTier === RelationshipTier.STRANGER && potentialNewScore >= TIER_THRESHOLDS[RelationshipTier.ACQUAINTANCE]) {
                     newTier = RelationshipTier.ACQUAINTANCE;
                }

                // If we just promoted to Acquaintance, or were already there, check for Friend
                if ((currentTier === RelationshipTier.STRANGER || currentTier === RelationshipTier.ACQUAINTANCE) && potentialNewScore >= TIER_THRESHOLDS[RelationshipTier.FRIEND]) {
                     newTier = RelationshipTier.FRIEND;
                }

                if (newTier !== currentTier) {
                    updates.relationshipTiers = { ...(updates.relationshipTiers || gameState.relationshipTiers), [charId]: newTier };
                    playSfx('level_up');
                    triggerNotification('Relationship Level Up!', `Status changed to ${newTier.replace('_', ' ')}!`, [], 'level-up');
                    sendCharacterMilestoneMail(charId, newTier);
                }
            }

            if (!suppressProgressionEffects && simResponse.chemistry_change !== 0) {
                let newChem = currentChem + simResponse.chemistry_change;
                newChem = Math.max(0, Math.min(100, newChem)); 
                
                updates.chemistryScores = { ...gameState.chemistryScores, [charId]: newChem };

                if (gameState.partyMember && simResponse.chemistry_change > 0) {
                    const pId = gameState.partyMember;
                    const pChem = gameState.chemistryScores?.[pId] || 0;
                    const newPChem = Math.min(100, pChem + Math.ceil(simResponse.chemistry_change * 0.5));
                    updates.chemistryScores = { ...updates.chemistryScores, [pId]: newPChem };
                }
            }

            if (!suppressProgressionEffects && simResponse.energy_cost > 0) {
                deductEnergy(simResponse.energy_cost);
            }

            if (enforcedMood) {
                updates.currentMoods = { ...gameState.currentMoods, [charId]: enforcedMood };
            } else if (simResponse.mood) {
                updates.currentMoods = { ...gameState.currentMoods, [charId]: simResponse.mood };
            }

            const currentMemories = { ...gameState.memories };
            let hasMemoryUpdate = false;

            if (simResponse.new_memory) {
                const mem = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                    text: simResponse.new_memory.text,
                    tier: simResponse.new_memory.type as any,
                    timestamp: Date.now(),
                    lastAccess: Date.now(),
                    importance: 5
                };
                currentMemories[charId] = [...(currentMemories[charId] || []), mem];
                hasMemoryUpdate = true;
                
                triggerNotification(
                    'Memory Stored', 
                    `"${mem.text.substring(0, 30)}..."`, 
                    [mem.tier.toUpperCase()],
                    'memory',
                    undefined,
                    CHARACTER_DATA[charId].baseImg
                );
            }

            if (simResponse.party_memory && gameState.partyMember) {
                const pId = gameState.partyMember;
                const mem = {
                    id: `pm_${Date.now()}`,
                    text: simResponse.party_memory.text,
                    tier: simResponse.party_memory.type as any,
                    timestamp: Date.now(),
                    lastAccess: Date.now(),
                    importance: 5
                };
                currentMemories[pId] = [...(currentMemories[pId] || []), mem];
                hasMemoryUpdate = true;

                triggerNotification(
                    'Shared Memory', 
                    `"${mem.text.substring(0, 30)}..."`, 
                    [mem.tier.toUpperCase()], 
                    'memory',
                    undefined,
                    CHARACTER_DATA[pId].baseImg
                );
            }

            if (hasMemoryUpdate) {
                updates.memories = currentMemories;
            }

            if (simResponse.scene_transition) {
                if (simResponse.scene_transition.target === 'end') {
                    updates.currentDateScene = null;
                    triggerNotification('Date Ended', 'จบช่วงเวลาเดต/ใกล้ชิดแล้ว', [], 'info');
                } else {
                    const sceneTarget = simResponse.scene_transition.target as SceneType | 'freestyle';
                    let bgImg = "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=2070&auto=format&fit=crop";
                    if (sceneTarget !== 'freestyle' && DATE_LOCATIONS_DATA[sceneTarget as SceneType]) {
                        bgImg = DATE_LOCATIONS_DATA[sceneTarget as SceneType].img;
                    } else if (gameState.currentDateScene?.bgImage) {
                        bgImg = gameState.currentDateScene.bgImage;
                    }

                    const sceneName = simResponse.scene_transition.name || (sceneTarget !== 'freestyle' ? DATE_LOCATIONS_DATA[sceneTarget as SceneType]?.nameEn : "Intimate Moment");
                    const dynamicStatus = simResponse.scene_transition.narrative_status || "กำลังดื่มด่ำกับบรรยากาศ";

                    updates.currentDateScene = {
                        type: sceneTarget as SceneType,
                        name: sceneName,
                        narrativeStatus: dynamicStatus,
                        bgImage: bgImg,
                        startedAt: gameState.currentDateScene?.startedAt || Date.now(),
                        lastInteractionAt: Date.now()
                    };

                    if (!gameState.currentDateScene) {
                        triggerNotification('Moment Started', `เข้าสู่โหมด: ${sceneName}`, [], 'success');
                    }
                }
            } else if (gameState.currentDateScene) {
                // Keep date scene alive and refresh lastInteractionAt on each conversation interaction
                updates.currentDateScene = {
                    ...gameState.currentDateScene,
                    lastInteractionAt: Date.now()
                };
            }

            // --- [MARCUS FIX] SECRET UNLOCK LOGIC ---
            if (matchedSecret) {
                const secretPath = matchedSecret.path;
                const currentUnlocked = updates.unlockedSecrets || gameState.unlockedSecrets || [];
                const isAlreadyUnlocked = currentUnlocked.includes(secretPath) || currentUnlocked.includes(matchedSecret.id);

                if (!isAlreadyUnlocked) {
                    updates.unlockedSecrets = [...currentUnlocked, secretPath];
                    trackQuestProgress('secret_count', 1);
                    const caption = matchedSecret.caption || SECRET_META[secretPath] || "A secret revealed...";
                    setSecretUnlockData({ imagePath: secretPath, caption: caption });
                    console.log(`🔓 [System] Secret Unlocked: ${secretPath}`);
                }
            }

            // --- [MARCUS FIX] EVENT RESOLUTION LOGIC ---
            if (simResponse.event_resolved && gameState.activeEvent && gameState.activeEvent.characterId === charId) {
                console.log(`✅ [System] Active Event Resolved for ${charId}`);
                updates.activeEvent = null;
                
                // Grant Rewards (If Any)
                const rewards = gameState.activeEvent.rewards;
                if (rewards) {
                    updates.currentExp = gameState.currentExp + rewards.exp;
                    // Love reward logic
                    const currentLoveScore = updates.loveScores?.[charId] || gameState.loveScores[charId] || 0;
                    updates.loveScores = { ...(updates.loveScores || gameState.loveScores), [charId]: currentLoveScore + rewards.love };
                    
                    playSfx('task_complete');
                    triggerNotification(
                        'Event Solved!', 
                        'You helped them out!', 
                        [`+${rewards.exp} XP`, `+${rewards.love} Love`], 
                        'success'
                    );

                    // Check Level Up immediately
                    const newExp = updates.currentExp;
                    let level = gameState.level;
                    let reqExp = gameState.requiredExp;
                    let points = gameState.stats.points;
                    
                    if (newExp >= reqExp) {
                        level++;
                        updates.currentExp = newExp - reqExp;
                        updates.requiredExp = Math.floor(reqExp * 1.2);
                        updates.level = level;
                        updates.stats = { ...gameState.stats, points: points + 1 };
                        if (onLevelUp) onLevelUp(level);
                    }
                }
            }
            
            if (Object.keys(updates).length > 0) {
                setGameState(updates);
            }
            return true;

        } catch (error) {
            console.error("AI Error:", error);
            return false;
        } finally {
            setIsTyping(false);
        }
    };

    // --- HANDLE SEND MESSAGE (UPDATED FOR VIP) ---
    const handleSendMessage = (text: string, socialChatId?: CharacterId | null, guestId?: CharacterId | null) => {
        const gameState = getGameState();
        const charId = socialChatId || guestId || (LOCATIONS[gameState.currentLocation]?.characterId as CharacterId);
        
        if (!charId) return;
        if (isTyping || storyInteraction.busy.current) return;
        if (text.startsWith('@story-retry:')) {
            const message = messagesMap[charId]?.find(m => m.id === text.slice(13));
            if (message?.storyInteraction && message.storyInteraction.status !== 'complete') void storyInteraction.run(message.storyInteraction.command, charId, undefined, message.id);
            return;
        }
        const storyRoute = routeStoryInput(text, gameState.story || emptyStoryProgress(), {
            characterId: charId, locationId: gameState.currentLocation, love: gameState.loveScores[charId] || 0
        });
        if (storyRoute.handled) {
            if (storyRoute.command) void storyInteraction.run(storyRoute.command, charId, storyRoute.playerText);
            return;
        }

        const CHAT_COST = 5; 
        const hasChatterbox = gameState.activeBuffs.some(b => b.type === 'chatterbox');
        
        // Base Cost
        let cost = hasChatterbox ? Math.max(0, CHAT_COST - 1) : CHAT_COST;
        
        // [MARCUS VIP]: Energy Saver (-50%)
        if (gameState.isVip) {
            cost = Math.ceil(cost * 0.5);
        }

        if (gameState.energy < cost) {
            triggerNotification('Out of Energy', `Need ${cost} energy to chat.`, [], 'error');
            return;
        }

        deductEnergy(cost);
        trackQuestProgress('spend_energy', cost);
        trackQuestProgress('chat', 1);

        // [MARCUS ENHANCED]: Keyword Trigger for Date Locations & Freestyle Romantic Intimacy
        const lowerText = text.toLowerCase();
        let triggeredDateTarget: SceneType | null = null;
        let isFreestyleIntimate = false;
        
        if (lowerText.includes('rooftop') || lowerText.includes('รูฟท็อป') || lowerText.includes('ดาดฟ้า') || lowerText.includes('ร้านอาหารหรู')) {
            triggeredDateTarget = 'rooftop_dining';
        } else if (lowerText.includes('secret bar') || lowerText.includes('บาร์ลับ')) {
            triggeredDateTarget = 'secret_bar';
        } else if (lowerText.includes('drive') || lowerText.includes('ขับรถ') || lowerText.includes('car') || lowerText.includes('นั่งรถ')) {
            triggeredDateTarget = 'car';
        } else if (lowerText.includes('ไปห้อง') || lowerText.includes('ไปบ้าน') || lowerText.includes('my room') || lowerText.includes('your room') || lowerText.includes('private room') || lowerText.includes('ห้องส่วนตัว')) {
            triggeredDateTarget = 'character_home';
        } else if (
            lowerText.includes('ล้มทับ') || lowerText.includes('ล้มใส่') || lowerText.includes('นอนทับ') || 
            lowerText.includes('กอด') || lowerText.includes('จูบ') || lowerText.includes('เลิฟซีน') || 
            lowerText.includes('คร่อม') || lowerText.includes('โอบ') || lowerText.includes('หนุนตัก') || 
            lowerText.includes('นอนด้วยกัน') || lowerText.includes('fall on') || lowerText.includes('fall onto') ||
            lowerText.includes('cuddle') || lowerText.includes('kiss') || lowerText.includes('embrace')
        ) {
            isFreestyleIntimate = true;
        }

        if ((triggeredDateTarget || isFreestyleIntimate) && !gameState.currentDateScene) {
            // 1. Save user message to chat history manually
            const userMsg: Message = {
                id: Date.now().toString(),
                sender: 'user',
                text: text,
                timestamp: Date.now()
            };
            setMessagesMap(prev => ({
                ...prev,
                [charId]: [...(prev[charId] || []), userMsg]
            }));
            
            // 2. Pass Context to AI for Consent & Decision evaluation (AI decides whether to trigger scene_transition)
            const targetDesc = triggeredDateTarget ? (DATE_LOCATIONS_DATA[triggeredDateTarget as SceneType]?.nameTh || triggeredDateTarget) : "โมเมนต์ใกล้ชิดพิเศษ (เช่น ล้มทับ/กอด/จูบ)";
            const targetKey = triggeredDateTarget || 'freestyle';

            const aiContext = `[SYSTEM EVENT: INTENTION DETECTED]
Player said/performed: "${text}" (Intended activity/scene: ${targetDesc}).
**AI CONSENT & DECISION REQUIRED:**
- Evaluate your relationship tier (${gameState.relationshipTiers[charId]}), Love Score, Chemistry Score (${gameState.chemistryScores?.[charId] || 0}%), and current Mood.
- **IF YOU CONSENT & ACCEPT:** Set \`scene_transition\`: { "target": "${targetKey}", "name": "${triggeredDateTarget ? DATE_LOCATIONS_DATA[triggeredDateTarget as SceneType]?.nameEn : 'Intimate Moment'}", "narrative_status": "<อธิบายสถานการณ์/บรรยากาศปัจจุบันเป็นภาษาไทยสั้นๆ กระชับ เช่น 'ล้มทับกันบนพื้นห้อง สบตากันด้วยความตกใจและหวั่นไหว'>" }. React naturally with romantic warmth/vulnerability.
- **IF YOU DO NOT CONSENT / UNREADY / REJECT:** Reject or pull back in your \`reply\` according to your personality. DO NOT set \`scene_transition\` (leave null).`;

            processAIResponse(aiContext, undefined, true, charId);
            return;
        }

        processAIResponse(text, undefined, false, charId);
    };

    const handleAction = (type: ActionType, socialChatId?: CharacterId | null, guestId?: CharacterId | null, dateTarget?: SceneType | 'freestyle') => {
        const gameState = getGameState();
        const charId = socialChatId || guestId || (LOCATIONS[gameState.currentLocation]?.characterId as CharacterId);
        
        if (!charId) return;

        if (type === 'invite_party') {
            const currentTier = gameState.relationshipTiers[charId];
            const allowedTiers = [
                RelationshipTier.FRIEND, RelationshipTier.FLIRTING, RelationshipTier.PARTNER, 
                RelationshipTier.SOULMATE, RelationshipTier.ETERNAL, 
                RelationshipTier.BEST_FRIEND, RelationshipTier.SOUL_SIBLING
            ];
            
            if (!allowedTiers.includes(currentTier)) {
                triggerNotification('Relationship Too Low', 'Must be FRIEND or higher!', [], 'error');
                return;
            }

            const PARTY_COST = 15;
            if (gameState.energy < PARTY_COST) {
                triggerNotification('Too Tired', `Need ${PARTY_COST} energy to invite.`, [], 'error');
                return;
            }

            deductEnergy(PARTY_COST);
            
            setGameState({ 
                partyMember: charId,
                totalPartyInvites: (gameState.totalPartyInvites || 0) + 1
            });
            
            playSfx('level_up'); 
            triggerNotification('Party Formed!', `${CHARACTER_DATA[charId].name} joined your party!`, ['-15 Energy'], 'success');

            setMessagesMap(prev => ({
                ...prev,
                [charId]: [...(prev[charId] || []), {
                    id: `act_${Date.now()}`,
                    sender: 'user',
                    text: "(ชวนเข้าปาร์ตี้) วันนี้ไปเที่ยวด้วยกันนะ!",
                    timestamp: Date.now()
                }]
            }));

            processAIResponse(
                `[SYSTEM: User invited you to join their Party (Follower Mode). You are now traveling with them everywhere. Respond enthusiastically.]`, 
                undefined, 
                true, 
                charId
            );
            return;
        }

        if (type === 'leave_party') {
            setGameState({ partyMember: null });
            playSfx('bubble_pop');
            triggerNotification('Party Disbanded', 'You are solo now.', [], 'info');
            
            setMessagesMap(prev => ({
                ...prev,
                [charId]: [...(prev[charId] || []), {
                    id: `act_${Date.now()}`,
                    sender: 'user',
                    text: "(แยกย้าย) วันนี้สนุกมาก ไว้เจอกันใหม่นะ",
                    timestamp: Date.now()
                }]
            }));

            processAIResponse(
                `[SYSTEM: User disbanded the party. Say goodbye politely.]`, 
                undefined, 
                true, 
                charId
            );
            return;
        }

        // [MARCUS ENHANCED]: AI CONSENT EVALUATION FOR DATE INVITE ACTION
        if (type === 'invite_date' && dateTarget) {
            const targetName = dateTarget !== 'freestyle' ? (DATE_LOCATIONS_DATA[dateTarget as SceneType]?.nameTh || dateTarget) : "เดต/โมเมนต์พิเศษแบบอิสระ";
            const targetEn = dateTarget !== 'freestyle' ? (DATE_LOCATIONS_DATA[dateTarget as SceneType]?.nameEn || dateTarget) : "Freestyle Romance";

            const aiContext = `[SYSTEM EVENT: DATE INVITE RECEIVED]
The player clicked to invite you on a date to: "${targetName}" (${targetEn}).
**AI CONSENT & DECISION REQUIRED:**
- Evaluate your relationship tier (${gameState.relationshipTiers[charId]}), Love Score, Chemistry Score (${gameState.chemistryScores?.[charId] || 0}%), and current Mood.
- **IF YOU CONSENT & ACCEPT:** Set \`scene_transition\`: { "target": "${dateTarget}", "name": "${targetEn}", "narrative_status": "<อธิบายสถานการณ์/บรรยากาศขณะตอบตกลงหรือเมื่อเดินทางมาถึงเป็นภาษาไทยสั้นๆ กระชับ เช่น 'เดินทางมาถึง${targetName} ดื่มด่ำบรรยากาศโรแมนติก'>" }. Respond with excitement and warmth.
- **IF YOU DO NOT CONSENT / UNREADY / REJECT:** Reject or politely decline in your \`reply\`. DO NOT set \`scene_transition\` (leave null).`;
            
            processAIResponse(aiContext, undefined, true, charId);
            return;
        }

        const config = ACTION_CONFIG[type];
        if (!config) return;

        if (gameState.energy < config.cost) {
            triggerNotification('Too Tired', `Need ${config.cost} energy.`, [], 'error');
            return;
        }

        const recentMsgs = messagesMap[charId] || [];
        const last10 = recentMsgs.slice(-10);
        const narrativeToCheck = ACTION_NARRATIVES[type];
        let repetitionCount = 0;
        if (narrativeToCheck) {
            repetitionCount = last10.filter(m => m.sender === 'user' && m.text === narrativeToCheck).length;
        }

        const itemId = ACTION_ITEM_MAP[type];
        let isGiftAction = false;
        let giftEffectMsg = "";
        let enforcedMood: Mood | undefined;

        if (itemId) {
            const success = removeItem(itemId);
            if (!success) {
                triggerNotification('Missing Item', `You need a ${config.label} first.`, [], 'error');
                return;
            }
            isGiftAction = true;

            if (itemId === 'gift_teddy' || itemId === 'gift_console') {
                const boost = itemId === 'gift_teddy' ? 25 : 50;
                const currentChem = gameState.chemistryScores?.[charId] || 0;
                const newChem = Math.min(100, currentChem + boost);
                
                setGameState({ 
                    chemistryScores: { ...gameState.chemistryScores, [charId]: newChem },
                    currentMoods: { ...gameState.currentMoods, [charId]: Mood.HAPPY }
                });
                enforcedMood = Mood.HAPPY;
                
                giftEffectMsg = `(Effect: Chemistry +${boost}%, Visual Change: HAPPY)`;
                triggerNotification('Chemistry Boost', `You and ${CHARACTER_DATA[charId].name} are closer!`, [`+${boost}% Chem`], 'success');
                playSfx('level_up');
            }

            else if (itemId === 'market_beer') {
                const duration = 30 * 60 * 1000; 
                setGameState({
                    drunkTimers: { ...gameState.drunkTimers, [charId]: Date.now() + duration },
                    currentMoods: { ...gameState.currentMoods, [charId]: Mood.DRUNK }
                });
                enforcedMood = Mood.DRUNK;
                giftEffectMsg = `(Effect: Target becomes DRUNK for 30m)`;
            }

            else if (itemId === 'gift_magic_ice_cream') {
                const newTheme = getRandomTheme(charId); 
                setGameState({
                    dailyThemes: { ...gameState.dailyThemes, [charId]: newTheme },
                    activeRareVibes: { ...gameState.activeRareVibes, [charId]: false } 
                });
                giftEffectMsg = `(Effect: Daily Vibe Rerolled to Normal!)`;
                triggerNotification('Vibe Shift', `New Vibe: Normal`, [], 'success');
            }

            else if (itemId === 'gift_dead_branch') {
                const rareTheme = getRandomRareTheme(charId); 
                if (rareTheme) {
                    setGameState({
                        dailyThemes: { ...gameState.dailyThemes, [charId]: rareTheme },
                        activeRareVibes: { ...gameState.activeRareVibes, [charId]: true } 
                    });
                    giftEffectMsg = `(Effect: MYSTERIOUS RARE VIBE ACTIVATED)`;
                    triggerNotification('Strange Atmosphere...', `Something changed about ${CHARACTER_DATA[charId].name}...`, [], 'critical');
                    playSfx('event_alert');
                } else {
                    giftEffectMsg = `(Effect: Failed to summon rare vibe. Nothing happened.)`;
                }
            }

            else if (itemId === 'food_bubble_tea') {
                setGameState({
                    currentMoods: { ...gameState.currentMoods, [charId]: Mood.DRINKING }
                });
                enforcedMood = Mood.DRINKING;
                giftEffectMsg = `(Effect: Character starts DRINKING Bubble Tea. Visual Change: DRINKING)`;
            }

            else if (itemId === 'cup_noodle') {
                setGameState({
                    currentMoods: { ...gameState.currentMoods, [charId]: Mood.EATING }
                });
                enforcedMood = Mood.EATING;
                giftEffectMsg = `(Effect: Character starts EATING Cup Noodle. Visual Change: EATING)`;
            }

            // ... (Evolution checks for flowers, ring, etc. same as before) ...
            else if (itemId === 'gift_flowers') {
                const currentTier = gameState.relationshipTiers[charId];
                const validTiers = [RelationshipTier.FRIEND, RelationshipTier.FLIRTING, RelationshipTier.PARTNER, RelationshipTier.SOULMATE, RelationshipTier.ETERNAL, RelationshipTier.BEST_FRIEND, RelationshipTier.SOUL_SIBLING];
                
                if (!validTiers.includes(currentTier)) {
                    triggerNotification('Failed', 'Must be FRIEND tier or higher.', [], 'error');
                    addItem(itemId); 
                    return;
                }

                if (currentTier === RelationshipTier.FRIEND) {
                    setGameState({ 
                        relationshipTiers: { ...gameState.relationshipTiers, [charId]: RelationshipTier.FLIRTING },
                        loveScores: { ...gameState.loveScores, [charId]: TIER_THRESHOLDS[RelationshipTier.FLIRTING] + 50 },
                        currentMoods: { ...gameState.currentMoods, [charId]: Mood.HOLDING_FLOWERS }
                    });
                    enforcedMood = Mood.HOLDING_FLOWERS;
                    triggerNotification('Relationship Up!', 'Status changed to Flirting! 💕', [], 'level-up');
                    playSfx('level_up');
                    sendCharacterMilestoneMail(charId, RelationshipTier.FLIRTING);
                } else {
                    const boost = 50;
                    const currentChem = gameState.chemistryScores?.[charId] || 0;
                    const newChem = Math.min(100, currentChem + boost);
                    const currentLove = gameState.loveScores[charId] || 0;
                    
                    setGameState({ 
                        chemistryScores: { ...gameState.chemistryScores, [charId]: newChem },
                        loveScores: { ...gameState.loveScores, [charId]: currentLove + boost },
                        currentMoods: { ...gameState.currentMoods, [charId]: Mood.HOLDING_FLOWERS }
                    });
                    enforcedMood = Mood.HOLDING_FLOWERS;
                    
                    giftEffectMsg = `(Effect: Love +${boost}, Chemistry +${boost}%, Visual Change: HOLDING_FLOWERS)`;
                    triggerNotification('Romantic Gift!', `You gave flowers to ${CHARACTER_DATA[charId].name}!`, [`+${boost} Love`, `+${boost}% Chem`], 'success');
                    playSfx('level_up');
                }
            }
            else if (itemId === 'gift_bracelet') {
                const currentTier = gameState.relationshipTiers[charId];
                const validTiers = [RelationshipTier.FRIEND, RelationshipTier.BEST_FRIEND, RelationshipTier.SOUL_SIBLING, RelationshipTier.ETERNAL];
                
                if (!validTiers.includes(currentTier)) {
                    triggerNotification('Failed', 'Must be FRIEND tier or higher.', [], 'error');
                    addItem(itemId); 
                    return;
                }

                if (currentTier === RelationshipTier.FRIEND) {
                    setGameState({ 
                        relationshipTiers: { ...gameState.relationshipTiers, [charId]: RelationshipTier.BEST_FRIEND },
                        loveScores: { ...gameState.loveScores, [charId]: TIER_THRESHOLDS[RelationshipTier.BEST_FRIEND] + 50 },
                        currentMoods: { ...gameState.currentMoods, [charId]: Mood.HAPPY }
                    });
                    enforcedMood = Mood.HAPPY;
                    triggerNotification('Relationship Up!', 'Status changed to Best Friend! 🌟', [], 'level-up');
                    playSfx('level_up');
                    sendCharacterMilestoneMail(charId, RelationshipTier.BEST_FRIEND);
                } else {
                    const boost = 50;
                    const currentChem = gameState.chemistryScores?.[charId] || 0;
                    const newChem = Math.min(100, currentChem + boost);
                    const currentLove = gameState.loveScores[charId] || 0;
                    
                    setGameState({ 
                        chemistryScores: { ...gameState.chemistryScores, [charId]: newChem },
                        loveScores: { ...gameState.loveScores, [charId]: currentLove + boost },
                        currentMoods: { ...gameState.currentMoods, [charId]: Mood.HAPPY }
                    });
                    enforcedMood = Mood.HAPPY;
                    
                    giftEffectMsg = `(Effect: Love +${boost}, Chemistry +${boost}%, Visual Change: HAPPY)`;
                    triggerNotification('Friendly Gift!', `You gave a bracelet to ${CHARACTER_DATA[charId].name}!`, [`+${boost} Love`, `+${boost}% Chem`], 'success');
                    playSfx('level_up');
                }
            }
            else if (itemId === 'gift_ring') {
                const currentTier = gameState.relationshipTiers[charId];
                const validTiers = [RelationshipTier.FLIRTING, RelationshipTier.PARTNER, RelationshipTier.SOULMATE, RelationshipTier.ETERNAL];
                
                if (!validTiers.includes(currentTier)) {
                    triggerNotification('Failed', 'Must be FLIRTING tier or higher.', [], 'error');
                    addItem(itemId); 
                    return;
                }

                if (currentTier === RelationshipTier.FLIRTING) {
                    setGameState({ 
                        relationshipTiers: { ...gameState.relationshipTiers, [charId]: RelationshipTier.PARTNER },
                        loveScores: { ...gameState.loveScores, [charId]: TIER_THRESHOLDS[RelationshipTier.PARTNER] + 50 },
                        currentMoods: { ...gameState.currentMoods, [charId]: Mood.ROMANTIC }
                    });
                    enforcedMood = Mood.ROMANTIC;
                    triggerNotification('Relationship Up!', 'Status changed to Partner! 💍', [], 'level-up');
                    playSfx('level_up');
                    sendCharacterMilestoneMail(charId, RelationshipTier.PARTNER);
                } else {
                    const boost = 50;
                    const currentChem = gameState.chemistryScores?.[charId] || 0;
                    const newChem = Math.min(100, currentChem + boost);
                    const currentLove = gameState.loveScores[charId] || 0;
                    
                    setGameState({ 
                        chemistryScores: { ...gameState.chemistryScores, [charId]: newChem },
                        loveScores: { ...gameState.loveScores, [charId]: currentLove + boost },
                        currentMoods: { ...gameState.currentMoods, [charId]: Mood.ROMANTIC }
                    });
                    enforcedMood = Mood.ROMANTIC;
                    
                    giftEffectMsg = `(Effect: Love +${boost}, Chemistry +${boost}%, Visual Change: ROMANTIC)`;
                    triggerNotification('Romantic Gift!', `You gave a ring to ${CHARACTER_DATA[charId].name}!`, [`+${boost} Love`, `+${boost}% Chem`], 'success');
                    playSfx('level_up');
                }
            }
            else if (itemId === 'gift_jacket') {
                const currentTier = gameState.relationshipTiers[charId];
                const validTiers = [RelationshipTier.BEST_FRIEND, RelationshipTier.SOUL_SIBLING, RelationshipTier.ETERNAL];
                
                if (!validTiers.includes(currentTier)) {
                    triggerNotification('Failed', 'Must be BEST FRIEND tier or higher.', [], 'error');
                    addItem(itemId); 
                    return;
                }

                if (currentTier === RelationshipTier.BEST_FRIEND) {
                    setGameState({ 
                        relationshipTiers: { ...gameState.relationshipTiers, [charId]: RelationshipTier.SOUL_SIBLING },
                        loveScores: { ...gameState.loveScores, [charId]: TIER_THRESHOLDS[RelationshipTier.SOUL_SIBLING] + 50 },
                        currentMoods: { ...gameState.currentMoods, [charId]: Mood.HAPPY }
                    });
                    enforcedMood = Mood.HAPPY;
                    triggerNotification('Relationship Up!', 'Status changed to Soul Sibling! 🧥', [], 'level-up');
                    playSfx('level_up');
                    sendCharacterMilestoneMail(charId, RelationshipTier.SOUL_SIBLING);
                } else {
                    const boost = 50;
                    const currentChem = gameState.chemistryScores?.[charId] || 0;
                    const newChem = Math.min(100, currentChem + boost);
                    const currentLove = gameState.loveScores[charId] || 0;
                    
                    setGameState({ 
                        chemistryScores: { ...gameState.chemistryScores, [charId]: newChem },
                        loveScores: { ...gameState.loveScores, [charId]: currentLove + boost },
                        currentMoods: { ...gameState.currentMoods, [charId]: Mood.HAPPY }
                    });
                    enforcedMood = Mood.HAPPY;
                    
                    giftEffectMsg = `(Effect: Love +${boost}, Chemistry +${boost}%, Visual Change: HAPPY)`;
                    triggerNotification('Friendly Gift!', `You gave a jacket to ${CHARACTER_DATA[charId].name}!`, [`+${boost} Love`, `+${boost}% Chem`], 'success');
                    playSfx('level_up');
                }
            }
            else if (itemId === 'spare_key') {
                const tier = gameState.relationshipTiers[charId];
                const validTiers = [RelationshipTier.PARTNER, RelationshipTier.SOUL_SIBLING, RelationshipTier.SOULMATE, RelationshipTier.ETERNAL];
                if (!validTiers.includes(tier)) {
                    triggerNotification('Failed', 'Trust level too low for Key.', [], 'error');
                    addItem(itemId); 
                    return;
                }
                if (!gameState.roomKeys.includes(charId)) {
                    setGameState({ 
                        roomKeys: [...gameState.roomKeys, charId],
                        currentMoods: { ...gameState.currentMoods, [charId]: Mood.HAPPY }
                    });
                    enforcedMood = Mood.HAPPY;
                    triggerNotification('Key Given!', `${CHARACTER_DATA[charId].name} can now visit your room!`, [], 'success');
                } else {
                    triggerNotification('Info', 'They already have a key.', [], 'info');
                    addItem(itemId); 
                }
            }
            else if (itemId === 'gift_eternity_pendant') {
                const tier = gameState.relationshipTiers[charId];
                if (tier !== RelationshipTier.SOULMATE && tier !== RelationshipTier.SOUL_SIBLING) {
                    triggerNotification('Failed', 'Bond not deep enough for Eternity.', [], 'error');
                    addItem(itemId); 
                    return;
                }
                setGameState({ 
                    relationshipTiers: { ...gameState.relationshipTiers, [charId]: RelationshipTier.ETERNAL },
                    loveScores: { ...gameState.loveScores, [charId]: TIER_THRESHOLDS[RelationshipTier.ETERNAL] + 100 },
                    currentMoods: { ...gameState.currentMoods, [charId]: Mood.ROMANTIC }
                });
                enforcedMood = Mood.ROMANTIC;
                triggerNotification('LEGENDARY BOND', 'Status changed to Eternal! 🌌', [], 'level-up');
                playSfx('level_up');
                sendCharacterMilestoneMail(charId, RelationshipTier.ETERNAL);
            }
        }

        if (ACTION_NARRATIVES[type]) {
            const narrativeText = ACTION_NARRATIVES[type];
            setMessagesMap(prev => ({
                ...prev,
                [charId]: [...(prev[charId] || []), {
                    id: `act_${Date.now()}`,
                    sender: 'user',
                    text: narrativeText,
                    timestamp: Date.now()
                }]
            }));
        }

        deductEnergy(config.cost);
        setLastAction({ type, timestamp: Date.now() });
        playSfx('bubble_pop');

        let narrativeActionText = ACTION_NARRATIVES[type] || `User performed "${config.label}".`;
        
        let repetitionContext = "";
        if (repetitionCount >= 2) {
            repetitionContext = ` [SYSTEM NOTE: User has done this exact action ${repetitionCount + 1} times recently. You are getting BORED/ANNOYED. React accordingly.]`;
        }

        const aiPrompt = isGiftAction
            ? `[ACTION: ${narrativeActionText} (Item: ${config.label} consumed). ${giftEffectMsg}. ${repetitionContext} React to the item.]`
            : `[ACTION: ${narrativeActionText} ${repetitionContext} React to the action.]`;

        processAIResponse(aiPrompt, undefined, true, charId, enforcedMood);
        
        trackQuestProgress('poke', 1);
        if (config.cost > 0) trackQuestProgress('spend_energy', config.cost);
        if (isGiftAction) trackQuestProgress('gift', 1); 
    };
    
    const handleInstantBuyAction = (type: ActionType, socialChatId?: CharacterId | null, guestId?: CharacterId | null) => {
        const itemId = ACTION_ITEM_MAP[type];
        if (!itemId) return;

        const shopItem = SHOP_ITEMS.find(i => i.id === itemId);
        if (!shopItem) return;

        const currency = shopItem.currency || 'gold';
        const cost = Math.ceil(shopItem.cost * 1.3); 

        if (currency === 'diamond') {
            if (!spendDiamonds(cost)) {
                triggerNotification('Insufficient Diamonds', 'Need more gems.', [], 'error');
                return;
            }
        } else {
            if (!spendGold(cost)) {
                triggerNotification('Insufficient Gold', 'Need more gold.', [], 'error');
                return;
            }
        }

        addItem(itemId);
        
        setTimeout(() => {
            handleAction(type, socialChatId, guestId);
        }, 100);
        
        triggerNotification('Express Delivery', `${shopItem.name} purchased!`, [`-${cost} ${currency === 'diamond' ? 'Gem' : 'G'}`], 'info');
    };

    return {
        isTyping,
        lastAction,
        consumptionResult,
        setConsumptionResult,
        handleStartTask,
        handleBuyItem,
        handleChatTransaction,
        handleSendMessage,
        handleAction,
        processAIResponse,
        handleTaskComplete,
        handleAcceptQuest,
        handleCloseQuestChoice,
        handleSelectQuestOption, 
        handleCollectQuestReward, 
        handleConsumeItem,
        handleRecycleItem,
        handleInstantBuyAction
    };
};

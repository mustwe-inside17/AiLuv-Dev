import type { StoryDialogueContext } from './storyDialogue';
import { validateStoryDialogueTurn } from './storyDialogue';
import { getStoryPrompt, redactPilotIdentity, guardStoryTurn } from './storyContext';

import { GoogleGenAI, Type, GenerateContentResponse, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { CharacterId, Mood, RelationshipTier, UserProfile, Message, SimulationResponse, PlayerAttributes, ActiveEvent, Memory, DateScene, CharacterQuest, QuestOption } from "../types";
import { CHARACTER_DATA } from "../constants";
import { GOLDEN_RULES, WORLD_CONTEXT, AILUV_BIBLE, RELATIONSHIP_LOGIC_PROMPT } from "./ai/coreRules"; 
import { getScheduleContext, getPlayerContext, getOutfitContext, getDrunkContext, getDeepPersonaLogic, getFilteredSocialWeb, getRelevantMemories, getObserverLogic, getSocialContext, analyzePlayerVibe, checkSecretTriggers, getDateTriggerLogic, getPartyContext, getChemistryContext, getDailyThemeContext, getDeepPsychologyContext, getRelationshipBehavior, getInquisitiveLogic, getLifelikeProtocol, getInitiativeContext, getPetContext, getYesterdaySummaryContext } from "./ai/dynamicContext"; 
import { useGameStore } from "../store/gameStore"; 
import { useUIStore } from "../store/uiStore";
import { validateAndSanitizeAITurn } from "./aiGateway";

// --- AI CONFIGURATION ---
export const AI_CONFIG = {
    thinkingConfig: {
        chat: 512,      // Default budget for main chat responses
        scenarios: 0,   // Quick path for events
        choices: 0      // Quick path for choices
    }
};

const getThinkingBudget = () => {
    const aiLevel = useGameStore.getState().settings.aiThinkingLevel;
    if (aiLevel === 'fast') return 0;
    if (aiLevel === 'deep') return 1024;
    return AI_CONFIG.thinkingConfig.chat; // normal
};

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Helper: robust JSON extractor and repair engine
export const cleanJsonString = (str: string): string => {
    if (!str) return "{}";
    let cleaned = str.replace(/```json/gi, '').replace(/```/g, '').trim();
    const firstOpen = cleaned.indexOf('{');
    const lastClose = cleaned.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        cleaned = cleaned.substring(firstOpen, lastClose + 1);
    }
    return cleaned;
};

export const safeJsonParse = <T = any>(str: string, fallback: T): T => {
    if (!str || typeof str !== 'string') return fallback;
    const cleaned = cleanJsonString(str);
    
    // 1. Direct parse attempt
    try {
        return JSON.parse(cleaned);
    } catch {
        // 2. Structural repair attempt for truncated responses (unterminated strings/braces)
        try {
            let repaired = cleaned;
            
            // Check if trailing string is unclosed
            const quoteMatches = repaired.match(/"/g);
            if (quoteMatches && quoteMatches.length % 2 !== 0) {
                repaired += '"';
            }
            
            // Balance curly braces
            const openBraces = (repaired.match(/{/g) || []).length;
            const closeBraces = (repaired.match(/}/g) || []).length;
            if (openBraces > closeBraces) {
                repaired += '}'.repeat(openBraces - closeBraces);
            }
            
            return JSON.parse(repaired);
        } catch {
            // 3. Regex property extraction fallback for critical dialogue fields
            try {
                const replyMatch = str.match(/"reply"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)/);
                const moodMatch = str.match(/"mood"\s*:\s*"([^"]+)"/);
                const thoughtMatch = str.match(/"thought"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)/);
                const loveMatch = str.match(/"love_change"\s*:\s*(-?\d+)/);
                const chemMatch = str.match(/"chemistry_change"\s*:\s*(-?\d+)/);
                
                if (replyMatch && replyMatch[1]) {
                    return {
                        reply: replyMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
                        mood: moodMatch ? moodMatch[1] : Mood.NEUTRAL,
                        thought: thoughtMatch ? thoughtMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '',
                        love_change: loveMatch ? parseInt(loveMatch[1], 10) : 1,
                        chemistry_change: chemMatch ? parseInt(chemMatch[1], 10) : 1,
                        energy_cost: 1,
                        event_resolved: false
                    } as unknown as T;
                }
            } catch {}
            return fallback;
        }
    }
};

const callWithTimeout = async <T>(promise: Promise<T>, ms: number): Promise<T> => {
    let timeoutHandle: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error(`API Timeout (${ms}ms)`)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
    });
};

const FALLBACK_SCENARIOS = [
    "(Event: จู่ๆ ไฟทั้งตึกก็ดับพรึ่บ! ทำให้พวกคุณต้องยืนเบียดกันท่ามกลางความมืดมิดและเสียงโวยวายของผู้คน)", 
    "(Event: มีลูกแมวหลงทางเดินเปียกฝนเข้ามาในร้านและร้องเรียกให้เธอช่วย เธอหันมามองคุณด้วยสายตาอ้อนวอน)", 
    "(Event: ขณะที่กำลังคุยกัน กลุ่มนักดนตรีเปิดหมวกก็เริ่มบรรเลงเพลงรักเสียงดัง ทำให้พวกคุณต้องขยับหน้าเข้าไปใกล้กันเพื่อจะได้ยินเสียง)"
];
const getRandomFallbackScenarios = (count: number = 3): string[] => {
    return [...FALLBACK_SCENARIOS].sort(() => 0.5 - Math.random()).slice(0, count);
};

// --- NEW: Generate Quest Options (Choice Gimmick) ---
export const summarizeVoiceCall = async (
  charId: CharacterId,
  callLog: {sender: string, text: string}[]
): Promise<string | null> => {
  if (callLog.length === 0) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY || "" });
  const charData = CHARACTER_DATA[charId];

  // Combine chunks from the same sender
  const combinedLog: {sender: string, text: string}[] = [];
  let currentSender = '';
  let currentText = '';

  for (const log of callLog) {
    if (log.sender === currentSender) {
      currentText += ' ' + log.text;
    } else {
      if (currentSender) {
        combinedLog.push({ sender: currentSender, text: currentText.trim() });
      }
      currentSender = log.sender;
      currentText = log.text;
    }
  }
  if (currentSender) {
    combinedLog.push({ sender: currentSender, text: currentText.trim() });
  }

  const logString = combinedLog.map(l => `${l.sender === 'user' ? (useGameStore.getState().playerName || 'User') : charData.name}: ${l.text}`).join('\n');

  const prompt = `
    [TASK]
    Summarize the following voice call transcript between ${useGameStore.getState().playerName || 'the User'} and ${charData.name} in a NARRATIVE and PERSONAL way.
    
    [REQUIREMENTS]
    1. LANGUAGE: THAI (ภาษาไทย)
    2. PERSPECTIVE: Written from ${charData.name}'s perspective (e.g., "วันนี้ได้คุยกับคุณเรื่อง...").
    3. CONTENT: Describe what you talked about, how you felt, and any important details you want to remember.
    4. STYLE: Warm, personal, and conversational. Not a formal report.
    5. LENGTH: 2-3 sentences.
    
    [TRANSCRIPT]
    ${logString}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });
    
    logUsageMetrics("gemini-3.7-flash", response.usageMetadata, "Voice Call Summary");
    
    const summary = response.text?.trim() || '';
    return summary.length > 0 ? summary : null;
  } catch (error) {
    console.error("Failed to summarize voice call:", error);
    return null;
  }
};

// --- TOKEN LOGGING & COST ESTIMATION HELPER ---
const MODEL_PRICING: Record<string, { promptPricePerM: number; candidatePricePerM: number }> = {
    'gemini-3.7-flash': { promptPricePerM: 0.10, candidatePricePerM: 0.40 },
    'gemini-3.1-flash-lite': { promptPricePerM: 0.075, candidatePricePerM: 0.30 },
    'gemini-2.5-flash': { promptPricePerM: 0.075, candidatePricePerM: 0.30 },
    'gemini-1.5-flash': { promptPricePerM: 0.075, candidatePricePerM: 0.30 },
    'gemini-2.5-pro': { promptPricePerM: 1.25, candidatePricePerM: 5.00 },
    'gemini-1.5-pro': { promptPricePerM: 1.25, candidatePricePerM: 5.00 },
};

const USD_TO_THB = 35.5;

const logUsageMetrics = (modelName: string, usageMetadata?: any, featureName: string = 'Chat') => {
    if (!usageMetadata) {
        console.log(`📊 [TOKEN LOG] ${featureName} (${modelName}): No usage metadata returned`);
        return;
    }

    const inputTokens = usageMetadata.promptTokenCount || 0;
    const outputTokens = usageMetadata.candidatesTokenCount || 0;
    const cachedTokens = usageMetadata.cachedContentTokenCount || 0;
    const totalTokens = usageMetadata.totalTokenCount || (inputTokens + outputTokens);

    const pricing = MODEL_PRICING[modelName] || { promptPricePerM: 0.075, candidatePricePerM: 0.30 };
    
    const inputCostUSD = (inputTokens / 1_000_000) * pricing.promptPricePerM;
    const outputCostUSD = (outputTokens / 1_000_000) * pricing.candidatePricePerM;
    const totalCostUSD = inputCostUSD + outputCostUSD;
    const totalCostTHB = totalCostUSD * USD_TO_THB;

    const cacheInfo = cachedTokens ? ` (Cached: ${cachedTokens.toLocaleString()})` : '';

    console.log(
        `\n╔══════════════════════════════════════════════════════════╗\n` +
        `  📊 [GEMINI TOKEN & COST LOG] - ${featureName}\n` +
        `  🤖 Model Used    : ${modelName}\n` +
        `  📥 Input Tokens  : ${inputTokens.toLocaleString()}${cacheInfo}\n` +
        `  📤 Output Tokens : ${outputTokens.toLocaleString()}\n` +
        `  🧮 Total Tokens  : ${totalTokens.toLocaleString()}\n` +
        `  💵 Est. Cost USD : $${totalCostUSD.toFixed(6)}\n` +
        `  🇹🇭 Est. Cost THB : ฿${totalCostTHB.toFixed(4)}\n` +
        `╚══════════════════════════════════════════════════════════╝`
    );
};

// --- NEW: Generate Quest Options (Choice Gimmick) ---
export const summarizeYesterdayTags = async (charId: CharacterId, recentMessages: Message[]): Promise<string | null> => {
    if (recentMessages.length === 0) return null;
    if (!apiKey) return null;

    const charData = CHARACTER_DATA[charId];
    // Convert to a minimal transcript
    const logString = recentMessages.map(m => `${m.sender === 'user' ? (useGameStore.getState().playerName || 'User') : charData.name}: ${m.text}`).join('\n');

    const prompt = `
    [TASK]
    Summarize the key events from this chat history between ${useGameStore.getState().playerName || 'User'} (The User) and ${charData.name} (The Character).
    Extract the 1-3 most important topics, actions, or events explicitly discussed and return them as a comma-separated list of short phrases in Thai.
    CRITICAL: For any action involving both people, you MUST explicitly state WHO did what (e.g., "${useGameStore.getState().playerName || 'User'} ช่วย ${charData.name} ยกของ" or "${useGameStore.getState().playerName || 'User'} บอกให้ ${charData.name} ไปช่วยยกของ" instead of just "ช่วยยกของ"). Do not omit the subject to prevent memory confusion later.
    If nothing important happened, return "ไม่มีเหตุการณ์พิเศษ".
    
    [EXAMPLE OUTPUT]
    "ผู้เล่นคุยเรื่องงาน, ${charData.name} บ่นเรื่องนิกกิ, ผู้เล่นสัญญาว่าจะไปกินข้าวกับ ${charData.name}"
    
    [TRANSCRIPT]
    ${logString}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
            config: {
                temperature: 0.1,
            }
        });
        
        logUsageMetrics("gemini-3.7-flash", response.usageMetadata, "Yesterday Summary");

        const summary = response.text?.trim() || '';
        return summary.length > 0 ? summary : null;
    } catch (error) {
        console.error("Failed to summarize yesterday:", error);
        return null;
    }
};

export const generateQuestOptions = async (
    charId: CharacterId,
    quest: CharacterQuest
): Promise<QuestOption[]> => {
    
    // [MARCUS HELPER] Shuffle Array
    const shuffle = <T>(array: T[]): T[] => {
        return array.sort(() => Math.random() - 0.5);
    };

    const fallbackOptions = [
        { id: '1', text: `สนับสนุนและร่วมมือกับเรื่องนี้อย่างเต็มที่`, type: 'BEST' as const, multiplier: 1.8 },
        { id: '2', text: `รับฟังและช่วยคิดหาทางออกที่ปลอดภัย`, type: 'GOOD' as const, multiplier: 1.2 },
        { id: '3', text: `หยอกล้อคลายเครียดก่อนค่อยเริ่มลงมือ`, type: 'RISKY' as const, multiplier: 0.6 }
    ];

    if (!apiKey) {
        return shuffle(fallbackOptions);
    }

    const charData = CHARACTER_DATA[charId];
    
    const systemPrompt = `
    ROLE: Game Narrative & Action Choice Designer for Interactive Story Game.
    TASK: Create 3 distinct ACTION-ORIENTED player choices (กริยาการกระทำโดยตรง) to resolve the active quest for ${charData.name}.
    LANGUAGE: THAI (ภาษาไทย)
    
    CHARACTER: ${charData.name} (${charData.description}).
    PERSONALITY: ${charData.deepPersona}.
    QUEST TITLE: "${quest.title}"
    QUEST CONTEXT: "${quest.context || quest.description}"
    QUEST DESCRIPTION: "${quest.description}"
    QUEST OBJECTIVE: "${quest.objective || quest.title}"
    
    [CHOICE REQUIREMENTS - STRICT ACTION-BASED VERBS]
    - Each choice MUST be a concrete action, behavior, or physical step responding directly to the situation (e.g. if cat is missing: "ช่วยค้นหาที่คอนโด", "โทรหานิติบุคคลให้ช่วยดูกล้อง", "ออกไปเดินถามคนแถวนั้น").
    - DO NOT write meta-explanations or emotional commentary (DO NOT write "พูดเห็นใจ...", "พูดอ้อมๆ...", "ให้คำปรึกษา...").
    - 1. **Choice A (BEST):** Direct, smart, and proactive action that solves the immediate problem effectively. (Multiplier 1.8x)
    - 2. **Choice B (GOOD):** Safe, standard, or practical action to handle the situation steadily. (Multiplier 1.2x)
    - 3. **Choice C (RISKY):** Creative, bold, playful, or unconventional action approach. (Multiplier 0.6x)
    
    [OUTPUT FORMAT]
    Return JSON object with 'options' array. Each option has 'text' (Thai action verb phrase, 4-10 words) and 'type' (BEST, GOOD, RISKY).
    DO NOT reveal the type in the 'text'.
    `;

    try {
        const response = await callWithTimeout<GenerateContentResponse>(ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: systemPrompt,
            config: {
                responseMimeType: "application/json",
                thinkingConfig: { thinkingBudget: AI_CONFIG.thinkingConfig.choices },
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        options: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    type: { type: Type.STRING, enum: ['BEST', 'GOOD', 'RISKY'] }
                                }
                            }
                        }
                    }
                }
            }
        }), 8000); // 8s Timeout

        logUsageMetrics('gemini-3.7-flash', response.usageMetadata, 'Quest Options');
        const json = safeJsonParse<{ options?: Array<{ text: string; type: 'BEST' | 'GOOD' | 'RISKY' }> }>(response.text || "{}", {});
        
        if (json.options && Array.isArray(json.options) && json.options.length >= 3) {
            const mappedOptions = json.options.map((opt: any, index: number) => ({
                id: `opt_${Date.now()}_${index}`,
                text: opt.text,
                type: opt.type,
                // Assign multiplier based on AI classification
                multiplier: opt.type === 'BEST' ? 1.8 : opt.type === 'GOOD' ? 1.2 : 0.6
            }));
            
            // [MARCUS FIX]: Shuffle results so index 0 is not always BEST
            return shuffle(mappedOptions);
        }
        
        throw new Error("Invalid format");

    } catch (e) {
        console.error("Quest Choice Gen Error:", e);
        return shuffle(fallbackOptions);
    }
};

export const generateCreativeScenarios = async (charId: CharacterId, locationName: string, currentMood: Mood, tier: RelationshipTier, recentMessages: Message[] = []): Promise<string[]> => {
    if (!apiKey) return getRandomFallbackScenarios();
    const charData = CHARACTER_DATA[charId];
    
    // Extract recent context (Last 5 messages)
    const chatContext = recentMessages.slice(-5).map(m => `${m.sender === 'user' ? (useGameStore.getState().playerName || 'User') : charData.name}: ${m.text}`).join('\n');
    
    const systemPrompt = `
    ROLE: "Chaos Director" & "Storyteller" for a Roleplay Game.
    TASK: Generate 3 **Unpredictable, Immersive, and External-Force Driven** scenarios (Plot Hooks) in Thai.
    LANGUAGE: **THAI ONLY (ภาษาไทย 100%)**.
    
    CHARACTER: ${charData.name} (${charData.description})
    LOCATION: ${locationName}
    CURRENT MOOD: ${currentMood}
    RELATIONSHIP: ${tier}
    
    [RECENT CHAT CONTEXT]:
    ${chatContext || "No recent conversation. Start a new scene."}

    [CRITICAL INSTRUCTION - EXTERNAL FORCES]:
    Do NOT just generate "She looks at you" or "You hug her". Boring!
    You MUST introduce **External Factors** (Third Parties, Nature, Accidents, Environment) that force a reaction from both characters.
    
    [SCENARIO TYPES (Mix these)]:
    1. **The Environment:** Sudden rainstorm, Blackout, Loud construction noise, Air conditioner breaks (hot!), Earthquake tremor.
    2. **Third Parties:** A rude customer bumps into table, A lost child asks for help, A street performer targets them, An ex-boyfriend/girlfriend appears nearby.
    3. **Nature/Animals:** A stray cat jumps on lap, A bee flies around causing panic, A dog chases them.
    4. **Accidents:** Waiter spills water, Elevator gets stuck, Fire alarm goes off falsely.

    [NARRATIVE STYLE]:
    - Structure: "(Event: [External Event happens]... forcing [Result/Reaction/Intimacy])"
    - The external event should create a moment of tension, comedy, or forced proximity.

    [EXAMPLES (GOOD)]:
    - "(Event: จู่ๆ พนักงานเสิร์ฟก็เดินสะดุดทำน้ำหกใส่โต๊ะข้างๆ จนกระเด็นมาทางเธอ ทำให้คุณต้องรีบดึงเธอหลบเข้าหาตัว!)"
    - "(Event: เสียงฟ้าร้องดังสนั่นหวั่นไหวพร้อมกับฝนที่เทลงมาอย่างหนัก ขังพวกคุณไว้ใต้กันสาดร้านค้าเล็กๆ เพียงสองต่อสอง)"
    - "(Event: มีสุนัขตัวใหญ่หลุดสายจูงวิ่งพุ่งเข้ามาเห่าใส่ ทำให้เธอตกใจจนกระโดดกอดแขนคุณแน่นโดยไม่รู้ตัว)"
    - "(Event: เพลงในร้านเปลี่ยนเป็นจังหวะช้าซึ้งๆ และคู่รักโต๊ะข้างๆ ก็เริ่มขอแต่งงานกัน ทำให้บรรยากาศระหว่างพวกคุณดูขัดเขินแต่โรแมนติก)"
    - "(Event: ลิฟต์กระตุกอย่างแรงและค้างอยู่ระหว่างชั้น! ไฟฉุกเฉินสีแดงทำงานพร้อมกับความเงียบที่น่าอึดอัด...)"

    OUTPUT JSON: { "scenarios": ["(Event: ...)", "(Event: ...)", "(Event: ...)"] }
    `;
    
    try {
        const response = await callWithTimeout<GenerateContentResponse>(ai.models.generateContent({
            model: 'gemini-3.7-flash', 
            contents: systemPrompt,
            config: { 
                responseMimeType: "application/json", 
                thinkingConfig: { thinkingBudget: AI_CONFIG.thinkingConfig.scenarios },
                responseSchema: { type: Type.OBJECT, properties: { scenarios: { type: Type.ARRAY, items: { type: Type.STRING } } } } 
            }
        }), 10000); // 10s timeout for scenarios
        
        logUsageMetrics('gemini-3.7-flash', response.usageMetadata, 'Creative Scenarios');
        const json = safeJsonParse<{ scenarios?: string[] }>(response.text || "{}", {});
        return json.scenarios || getRandomFallbackScenarios();
    } catch (e) { 
        console.error("Scenario Gen Error:", e);
        return getRandomFallbackScenarios(); 
    }
};

// --- MARCUS'S OFFLINE TIME CONTEXT MAGIC ---
const getTimeContext = (charId: string, charData: any, messages: Message[], currentHour: number, currentTier: string): string => {
    // Only trigger this deep ambient context if we are actually friends or more
    if (currentTier === 'stranger' || currentTier === 'acquaintance') {
        return "";
    }

    // We need at least one message from user or AI to compare
    const lastMsgTime = messages.length > 0 ? messages[messages.length - 1].timestamp : Date.now();
    const hoursSinceLastMessage = (Date.now() - lastMsgTime) / (1000 * 60 * 60);

    // If the absence is short, don't trigger anything.
    if (hoursSinceLastMessage < 4) return "";

    let timeContextMsg = "";

    // UNIVERSAL DYNAMIC CONTEXT (Based on Character's Persona)
    if (hoursSinceLastMessage >= 24) {
        timeContextMsg = `[⚠️ AMBIENT CONTEXT: ผู้เล่นหายไป 1 วันเต็มๆ หรือนานกว่านั้น ตอนนี้ (เวลาปัจจุบัน ${currentHour}:00) คุณอาจจะกังวล เป็นห่วง หรือแอบน้อยใจ (ตามนิสัยเฉพาะตัวของคุณ) ทักทายผู้เล่นและเอ่ยถึงการที่เขาหายไป 100% ตามสไตล์ของคุณ แต่อย่าดูเหมือนหุ่นยนต์]`;
    } else if (hoursSinceLastMessage >= 12) {
        timeContextMsg = `[⚠️ AMBIENT CONTEXT: คุณกับผู้เล่นไม่ได้คุยกันมาตั้งแต่ช่วงครึ่งวันก่อน ตอนนี้ (เวลาปัจจุบัน ${currentHour}:00) ทักทายผู้เล่นตามสไตล์และนิสัยของคุณ พร้อมเอ่ยถึงเวลาที่หายไปเล็กน้อย หรือเล่าสั้นๆ ว่าคุณเพิ่งไปทำอะไรมา]`;
    } else if (hoursSinceLastMessage >= 4) {
        timeContextMsg = `[⚠️ AMBIENT CONTEXT: ผู้เล่นหายเงียบไปพักใหญ่ตั้งแต่ครั้งล่าสุดที่คุยกัน ตอนนี้ (เวลาปัจจุบัน ${currentHour}:00) ต้อนรับการกลับมาของเขา หรือถามไถ่เบาๆ ว่าทำอะไรอยู่ โดยดึงบุคลิกและรูทีนตามเวลาของคุณมาใช้]`;
    }

    if (timeContextMsg !== "") {
        console.log(`%c⏳ [TIME CONTEXT INJECTED]: ${timeContextMsg}`, 'color: #9333ea; font-style: italic;');
        
        // [MARCUS NEW]: Fire the Chat Toast Notification
        setTimeout(() => {
            useUIStore.getState().addNotification({
                id: `offline_msg_${Date.now()}`,
                type: 'message', // Changed to valid notification type
                title: `${charData.name}`,
                message: 'ทักทายคุณหลังจากหายไปนาน!',
                avatar: charData.avatarUrl
            });
        }, 1500); // Slight delay so it pops up after user sends message
    }
    
    return timeContextMsg;
};

export const generateResponse = async (
    userText: string, charId: CharacterId, loveScore: number, currentTier: RelationshipTier, currentMood: Mood, messages: Message[], userProfile: UserProfile | null, hasTrainedVisit: boolean, activeTaskType: string | null, energy: number, stats: PlayerAttributes, isDay: boolean, relationshipTiers: Record<CharacterId, RelationshipTier>, activeEvent: ActiveEvent | null, memories: Memory[], metCharacters: CharacterId[], isNight: boolean, unlockedTracks: string[], partyMemberId: CharacterId | null, partyMemories: Memory[], giftCooldowns: Record<string, number>, drunkTimers: Record<string, number>, extraContext: string = "", equippedStyle: string | null = null, currentDateScene: DateScene | null = null, currentChemistry: number = 0,
    partyMemberRecentMessages: Message[] = [],
    storyDialogue?: StoryDialogueContext
): Promise<SimulationResponse> => {
    
    if (!apiKey && storyDialogue) throw new Error('story_ai_unavailable');
    if (!apiKey) return { reply: "(ระบบ: ไม่พบ API Key)", mood: currentMood, love_change: 0, energy_cost: 0, chemistry_change: 0 };
    const charData = CHARACTER_DATA[charId];
    const currentGameState = useGameStore.getState();
    const currentDailyThemeId = currentGameState.dailyThemes?.[charId] || '';
    const isRareVibe = currentGameState.activeRareVibes?.[charId] || false;

    const recentMessages = messages.slice(-35); 
    const chatHistoryBlock = recentMessages.map(m => {
            const label = m.sender === 'user' ? `[${useGameStore.getState().playerName || 'USER'}]` : `[${CHARACTER_DATA[m.sender]?.name || m.sender}]`;
            const narrative = m.narrativeContent ? ` [EVENT: ${m.narrativeContent}] ` : '';
            return `${label}: "${m.text}"${narrative}`;
    }).join('\n');

    try {
        const currentHour = new Date().getHours();
        let scheduleContext = getScheduleContext(charId, currentHour, currentDateScene);
        let playerContext = getPlayerContext(userProfile, charId, currentTier === RelationshipTier.STRANGER);
        let outfitContext = getOutfitContext(charId, equippedStyle);
        let deepPersona = getDeepPersonaLogic(charId, hasTrainedVisit, !!partyMemberId, unlockedTracks);
        let socialWeb = getFilteredSocialWeb(charId);
        let memoryContext = getRelevantMemories(memories, userText).text;
        let drunkContext = (drunkTimers[charId] || 0) > Date.now() ? getDrunkContext(charId) : "";
        
        const guestTier = partyMemberId ? (relationshipTiers[partyMemberId] || currentGameState.relationshipTiers?.[partyMemberId] || RelationshipTier.STRANGER) : undefined;
        const guestLove = partyMemberId ? (currentGameState.loveScores?.[partyMemberId] || 0) : undefined;
        const guestChem = partyMemberId ? (currentGameState.chemistryScores?.[partyMemberId] || 0) : undefined;
        const guestMood = partyMemberId ? (currentGameState.currentMoods?.[partyMemberId] || Mood.NEUTRAL) : undefined;

        let partyContext = partyMemberId ? getPartyContext(charId, partyMemberId, {
            guestTier,
            guestLoveScore: guestLove,
            guestChemistry: guestChem,
            guestMood,
            guestMemories: partyMemories,
            guestRecentMessages: partyMemberRecentMessages,
            userProfile,
            userText
        }) : "";
        let dailyThemeContext = getDailyThemeContext(charId, currentDailyThemeId, currentChemistry, isRareVibe);
        let deepPsychologyContext = getDeepPsychologyContext(charId, currentChemistry, currentTier);
        let relationshipBehavior = getRelationshipBehavior(charId, currentTier);
        let chemistryContext = getChemistryContext(currentTier, currentChemistry, loveScore);
        let inquisitiveLogic = getInquisitiveLogic(currentTier, currentChemistry);
        let lifelikeProtocol = getLifelikeProtocol(charId, currentChemistry, currentTier);
        let initiativeContext = getInitiativeContext(charId, currentTier, currentHour, memories);
        let petContext = getPetContext(charId, userText);
        let timeContextMsg = getTimeContext(charId, charData, messages, currentHour, currentTier);
        let yesterdayContext = getYesterdaySummaryContext(userText, currentGameState.yesterdayMemoryTags?.[charId]);

        let eventContext = activeEvent && activeEvent.characterId === charId ? `[ACTIVE EVENT]: ${activeEvent.title}. ${activeEvent.aiContext}` : "";
        let secretTriggerContext = checkSecretTriggers(userText, charId, currentTier) || "";

        let isCasual = false;
        if (charId === 'miguel' || charId === 'fia' || charId === 'bam' || charId === 'mia') {
             if (charId === 'bam') isCasual = (currentHour >= 20 || currentHour < 8);
             else isCasual = (currentHour >= 18 || currentHour < 6);
        }
        
        const targetMoodMap = (isCasual && charData.casualMoods) ? charData.casualMoods : charData.moods;
        const validMoodsList = Object.keys(targetMoodMap || {}).join(', ');

        // [MARCUS FIX]: TUNED QUEST LOGIC AS REQUESTED (Reduced to 15%)
        const hasActiveEvent = !!(activeEvent && activeEvent.characterId === charId);
        
        // --- NEW CHALLENGE COOLDOWN (3 MINUTES) ---
        const THREE_MINUTES_MS = 3 * 60 * 1000;
        let timeSinceLastQuest = Infinity;
        
        // Find the last quest sent by this character
        for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];
            if (msg.sender === charId && msg.characterQuest) {
                timeSinceLastQuest = Date.now() - msg.timestamp;
                break;
            }
        }

        const isCooldownActive = timeSinceLastQuest < THREE_MINUTES_MS;

        // [MARCUS DEBUG]: Add a force trigger for testing
        const isDebugQuest = userText.toLowerCase().includes("quest") || userText.includes("ภารกิจ");
        
        // Case A: Event-Driven -> 100% chance (Bypasses cooldown to prevent breaking story)
        // Case B: Spontaneous -> 15% chance (Blocked if cooldown is active)
        const shouldTriggerQuest = isDebugQuest || (hasActiveEvent ? (Math.random() < 1.0) : (!isCooldownActive && Math.random() < 0.15));
        
        let questInstruction = "";
        if (shouldTriggerQuest) {
            if (hasActiveEvent) {
                questInstruction = `
                [⚡ SYSTEM OVERRIDE: ACTIVE EVENT RESOLUTION - MANDATORY]
                - **STATUS:** An Active Event "${activeEvent?.title}" is currently unfolding.
                - **CRITICAL:** You MUST generate a complete, coherent \`character_quest\` object in JSON.
                - **TITLE:** Short & concise (3-5 words, e.g. "ตามหาเจ้าเต้าหู้", "ช่วยยกของเข้าห้อง"). NO repetitive words.
                - **STORY CONTINUITY:** The quest context, description, objective, and choices MUST directly solve and resolve the event situation: "${activeEvent?.message}".
                - **CHOICES REQUIREMENT (ACTION-BASED):** Provide EXACTLY 3 distinct ACTION-ORIENTED choices (กริยาการกระทำโดยตรง ไม่ใช่คำอธิบายกว้างๆ หรือการบอกอารมณ์).
                  - \`title\`: Concrete action verb phrase (3-8 words, e.g. "ช่วยค้นหาตามซอกเตียงและตู้", "โทรหานิติบุคคลขอดูกล้อง", "เดินลงไปถามคนแถวนั้น").
                  - \`playerResponse\`: Short natural dialogue (1 sentence) spoken by the player while taking this action.
                - **DIALOGUE:** Your reply MUST lead into this quest naturally.
                `;
            } else {
                questInstruction = `
                [✨ SYSTEM SUGGESTION: SPONTANEOUS QUEST - HIGH PRIORITY]
                - **OPPORTUNITY:** The ongoing conversation creates an organic moment for an interactive decision.
                - **MANDATORY CONTEXT:** The quest MUST be directly related to what you and the player are discussing right now.
                - **TITLE:** Short & concise (3-5 words). NO repetitive words.
                - **ACTION:** Generate a complete \`character_quest\` object.
                - **CHOICES REQUIREMENT (ACTION-BASED):** Provide EXACTLY 3 distinct ACTION-ORIENTED choices (กริยาการกระทำโดยตรงต่อสถานการณ์).
                  - \`title\`: Concrete action verb phrase (3-8 words).
                  - \`playerResponse\`: Short natural dialogue spoken by the player while doing that action.
                - **DIALOGUE:** Your reply MUST mention or lead into this request.
                `;
            }
        }

        const systemPrompt = `
        ${GOLDEN_RULES}
        ${WORLD_CONTEXT}
        ${AILUV_BIBLE} 
        ${RELATIONSHIP_LOGIC_PROMPT}

        [CURRENT CHARACTER: ${charData.name.toUpperCase()}]
        - ROLE: ${charData.description}
        - CURRENT MOOD: ${currentMood}
        - RELATIONSHIP: ${currentTier} (${loveScore} pts). 
        - **CURRENT CHEMISTRY (VIBE):** ${currentChemistry}/100.
        - **AVAILABLE MOODS:** [${validMoodsList}]
        
        ${petContext}
        ${timeContextMsg}
        ${relationshipBehavior}
        ${chemistryContext}
        ${inquisitiveLogic}

        [CHEMISTRY MECHANIC (VIBE CHECK)]
        - Field: \`chemistry_change\` (Integer: -5 to +5)
        - Meaning: How much the CURRENT momentum/vibe improves.
        - **Logic:**
          - **+3 to +5:** User is funny, charming, deep, or flirty (and you like it). Great flow.
          - **+1 to +2:** Normal pleasant conversation. Good manners.
          - **0:** Boring, one-word answers, or confusing.
          - **-1 to -3:** Rude, awkward, pushy, or boring repetition.
          - **-5:** Offensive or creepy (especially if Tier is low).
        - **Goal:** Reward the user for "Reading the Room".

        [LOVE SCORE vs CHEMISTRY]
        - **Love Score:** Long-term bond (Slow accumulation).
        - **Chemistry:** Short-term "Spark" or "Mood" (Fluctuates quickly).
        
        [NARRATIVE ACTIONS (CRITICAL)]
        - Field: \`narrative_action\` (String, Optional)
        - Content: Describe physical actions, facial expressions, body language, or atmosphere in Thai. 
        - **RULE:** You **MUST** start the action with your **THAI NAME** (e.g., "มิเกล...", "เจลลี่...", "พีท...") to make it clear who is doing it.
        - Examples: "มิเกลยิ้มหวาน", "เจลลี่ขมวดคิ้วแล้วกอดอก", "พีทยื่นแก้วน้ำให้", "เฟียร์หัวเราะเบาๆ", "มีอาหน้าแดง"
        - FREQUENCY: **Use this in ~30% to 50% of replies.** Do NOT use it for every single message to keep it natural.
        - **WHEN TO USE:**
          1. Changing mood (e.g. going from Happy to Shy).
          2. Performing a physical interaction (giving item, touching, leaning in).
          3. Reacting emotionally (sighing, laughing).
          4. **DO NOT** use for simple Yes/No or boring facts unless necessary.

        [INNER THOUGHT PROTOCOL (VITAL)]
        - Field: \`thought\`
        - Concept: The character's **DEEP INTERNAL MONOLOGUE**.
        - **Requirement:** This is your private voice. Express what you are REALLY thinking but not saying.
        - Logic: If Chemistry/Love is LOW, they might be suspicious or indifferent in thought, even if polite in speech.
        - Logic: If Chemistry/Love is HIGH, they might be shy, excited, or possessive in thought, even if acting cool.
        - **Requirement:** Always generate a distinct \`thought\` that adds depth/subtext to the \`reply\`.

        [ACTIVE EVENT RESOLUTION (CRITICAL)]
        **IF an [ACTIVE EVENT] is present in the context:**
        1. The user has arrived to help you or respond to your call.
        2. Roleplay the situation described in the context.
        3. **RESOLUTION RULE:** If the user helps you, comforts you, or successfully joins the activity you requested, YOU MUST set \`event_resolved: true\` in the output.
        4. Be generous. Any positive interaction regarding the event is enough to resolve it.

        [DATE & INTIMATE SCENE CONSENT PROTOCOL]
        - Field: \`scene_transition\` (Object or Null)
        - **Format:** \`{ "target": "freestyle" | "rooftop_dining" | "car" | "character_home" | "end", "name": "ชื่อโหมด/สถานที่", "narrative_status": "คำอธิบายบรรยากาศ/สถานการณ์สด" }\`
        - **DYNAMIC NARRATIVE STATUS RULE:** The \`narrative_status\` MUST be a short, highly evocative description in Thai of the CURRENT physical or romantic situation (e.g., "ล้มทับกันอยู่บนพื้น สบตากันด้วยความหวั่นไหว", "นั่งจิบเครื่องดื่มสบตากันในร้าน", "โอบกอดกันท่ามกลางความเงียบ"). Never use generic English static status like "In progress".
        - **AI DECISION & CONSENT GATEWAY:**
          - When the user invites you on a date or attempts physical/romantic intimacy (e.g. falling on you, hugging, kissing, flirting):
          - **EVALUATE YOUR FEELINGS FIRST:** Look at your Relationship Tier, Love Score, Chemistry Score, and current Mood.
          - **IF YOU RECIPROCATE / CONSENT:** Trigger or update \`scene_transition\` in your JSON output with an expressive \`narrative_status\`.
          - **IF YOU DO NOT CONSENT / ARE UNREADY / SHYLY REFUSE:** Reject or pull back in your \`reply\` naturally according to your personality, and set \`scene_transition\`: null. DO NOT enter date mode if you don't feel it!
        - **EXIT DATE:** If the date naturally concludes or you both part ways, set \`scene_transition\`: { "target": "end" }.

        [MULTI-BUBBLE MESSAGING (BURST MODE)]
        - Field: \`replies\` (Array of Objects)
        - **INSTRUCTION:** You are encouraged to break your response into multiple smaller "bubbles" (burst messages) to feel more natural and dynamic, especially if:
          1. You are excited or talking fast.
          2. You are changing topics.
          3. You want to emphasize a specific point.
          4. You are asking a question after a statement.
        - **SOLO MODE:** Even when alone, you can use the \`replies\` array instead of the single \`reply\` field.
        - **PARTY MODE:** You MUST use the \`replies\` array to handle dialogue between characters.
        - **MAX BUBBLES:** Keep it between 1 to 4 bubbles for better flow.
        - **SPEAKER ID:** In solo mode, \`speaker_id\` should always be your own ID (${charId}).

        [MULTI-CHARACTER SCRIPTING (PARTY MODE)]
        ${partyMemberId ? `
        **STATUS:** A GUEST is present! [${CHARACTER_DATA[partyMemberId].name}] has joined the session with User.
        **INSTRUCTION:** You are generating a script involving [${charData.name}] (Host) and [${CHARACTER_DATA[partyMemberId].name}] (Guest).
        **CRITICAL RELATIONSHIP & MEMORY CONTINUITY:**
        - [${CHARACTER_DATA[partyMemberId].name}] MUST strictly preserve their exact relationship bond, intimacy level, emotional tone, and memories with the User (as detailed in [PARTY INTERACTION MODE]). If they are lovers/partners (แฟน), they MUST act like loving partners!
        - [${charData.name}] (Host) naturally acknowledges their bond (e.g. welcoming both, teasing them as a couple, commenting on their vibe).
        **OUTPUT:** Use the \`replies\` array field.
        - Entry 1: Host (${charData.name}) or Guest speaks.
        - Entry 2: The other character responds, reacts, or addresses User.
        - Entry 3+: Lively multi-character banter between User, Host, and Guest.
        **ROLEPLAYING:** You must faithfully simulate the Guest's personality and voice based on the context provided in [PARTY INTERACTION MODE].
        ` : `STATUS: Solo conversation. You can use either \`reply\` or \`replies\` (for burst messaging).`}

        [MEMORY PROTOCOL - DUAL PERSPECTIVE]
        **IF A GUEST IS PRESENT:**
        You must generate TWO distinct memory records if the event is significant:
        1. \`new_memory\` -> For YOU (Host). Your perspective. (e.g., "I'm glad User brought X over.")
        2. \`party_memory\` -> For the GUEST. Their perspective. (e.g., "I visited X's room. It was messy.")
        **RULE:** These must be different text reflecting each character's inner voice.

        [DYNAMIC CONTEXT]
        ${lifelikeProtocol}
        ${dailyThemeContext}
        ${scheduleContext}
        ${deepPsychologyContext}
        ${playerContext}
        ${partyContext}
        ${outfitContext}
        ${socialWeb}
        ${memoryContext}
        ${initiativeContext}
        ${yesterdayContext}
        ${eventContext}
        ${questInstruction}
        ${drunkContext}
        ${secretTriggerContext}
        ${extraContext}

        [CHAT HISTORY]
        ${chatHistoryBlock}
        `;

        // Format Input
        let finalInputText = userText.includes('[SYSTEM:') ? userText : `[USER]: "${userText}"`;

        const ATTEMPT_TIMEOUT = 18000;

        const modelsToTry = [
            "gemini-3.7-flash", 
            "gemini-2.5-flash", 
            "gemini-3.1-flash-lite"
        ];

        let finalResponseText = "";
        let attemptError = null;
        let parsedJson = null;

        for (let i = 0; i < modelsToTry.length; i++) {
            const modelName = modelsToTry[i];
            const attemptNum = i + 1;
            
            try {
                // console.log(`🤖 [AI] Attempt ${attemptNum}/3: Connecting to ${modelName}...`);
                
                const response = await callWithTimeout<GenerateContentResponse>(
                    ai.models.generateContent({
                        model: modelName,
                        contents: finalInputText,
                        config: {
                            systemInstruction: redactPilotIdentity(systemPrompt) + getStoryPrompt(storyDialogue?.progress || currentGameState.story, charId) + (storyDialogue?.instruction || ''),
                            responseMimeType: "application/json",
                            maxOutputTokens: 8192, // Generous token ceiling for thinking + full Thai JSON response
                            thinkingConfig: { thinkingBudget: getThinkingBudget() }, 
                            responseSchema: {
                                type: Type.OBJECT,
                                properties: {
                                    reply: { type: Type.STRING },
                                    mood: { type: Type.STRING },
                                    love_change: { type: Type.INTEGER },
                                    chemistry_change: { type: Type.INTEGER },
                                    energy_cost: { type: Type.INTEGER },
                                    thought: { type: Type.STRING },
                                    narrative_action: { type: Type.STRING, nullable: true },
                                    special_event_image: { type: Type.STRING, nullable: true },
                                    event_resolved: { type: Type.BOOLEAN },
                                    new_memory: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, type: { type: Type.STRING } }, nullable: true },
                                    party_memory: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, type: { type: Type.STRING } }, nullable: true },
                                    scene_transition: { type: Type.OBJECT, properties: { target: { type: Type.STRING }, name: { type: Type.STRING }, narrative_status: { type: Type.STRING } }, nullable: true },
                                    // NEW: REPLIES ARRAY FOR PARTY MODE
                                    replies: { 
                                        type: Type.ARRAY, 
                                        items: { 
                                            type: Type.OBJECT, 
                                            properties: { 
                                                text: { type: Type.STRING }, 
                                                speaker_id: { type: Type.STRING },
                                                mood: { type: Type.STRING, nullable: true } // Optional mood per line
                                            } 
                                        }, 
                                        nullable: true 
                                    },
                                    character_quest: { 
                                        type: Type.OBJECT, 
                                        properties: {
                                            title: { type: Type.STRING },
                                            context: { type: Type.STRING },
                                            description: { type: Type.STRING },
                                            objective: { type: Type.STRING },
                                            choices: {
                                                type: Type.ARRAY,
                                                items: {
                                                    type: Type.OBJECT,
                                                    properties: {
                                                        id: { type: Type.STRING },
                                                        title: { type: Type.STRING },
                                                        description: { type: Type.STRING },
                                                        playerResponse: { type: Type.STRING },
                                                        intention: { type: Type.STRING },
                                                        consequenceHint: { type: Type.STRING }
                                                    }
                                                }
                                            },
                                            energyCost: { type: Type.INTEGER },
                                            loveReward: { type: Type.INTEGER },
                                            responseOnComplete: { type: Type.STRING }
                                        },
                                        nullable: true 
                                    }
                                },
                                required: ["reply", "mood", "love_change", "thought", "chemistry_change"]
                            }
                        }
                    }),
                    ATTEMPT_TIMEOUT
                );
                
                if (response.text) {
                    logUsageMetrics(modelName, response.usageMetadata, `Character Chat (${charData.name})`);
                    finalResponseText = response.text;
                    parsedJson = safeJsonParse(finalResponseText, null);
                    if (parsedJson) {
                        break;
                    } else {
                        throw new Error("Unable to parse JSON response");
                    }
                } else {
                    throw new Error("Empty response from AI");
                }

            } catch (e: any) {
                const errorMsg = String(e?.message || e || '');
                console.warn(`❌ [AI] Attempt ${attemptNum} Failed:`, errorMsg);
                attemptError = e;
                parsedJson = null;

                // Stop retrying if Gemini API key quota is exhausted (HTTP 429)
                if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota')) {
                    console.warn("⚠️ [AI Gateway] Gemini API Rate Limit / Quota Exceeded (429). Falling back to offline response immediately.");
                    break;
                }
            }
        }

        if (!parsedJson) {
            if (storyDialogue) throw new Error('story_ai_unavailable');
            console.error("❌ All AI attempts failed.");
            return { 
                reply: `(หันมายิ้มให้คุณอย่างอ่อนโยน) ...เอ๊ะ เมื่อกี้เหมือนมีอะไรสะดุดไปนิดนึง ขอโทษทีนะ คุณว่าไงนะ?`, 
                mood: currentMood, 
                love_change: 0, 
                energy_cost: 0, 
                chemistry_change: 0,
                thought: "(กำลังเรียบเรียงความคิด)"
            };
        }

        // [AI GATEWAY V1]: Validate, clamp, and sanitize AI response
        const sanitizedTurn = validateAndSanitizeAITurn(parsedJson, {
            charId,
            partyMemberId
        });

        if (storyDialogue) {
            const storyTurn = validateStoryDialogueTurn(sanitizedTurn, storyDialogue);
            return {
                reply: storyTurn.reply,
                replies: storyTurn.replies?.map(reply => ({ speaker_id: charId, text: reply.text })) || undefined,
                thought: storyTurn.thought,
                narrative_action: storyTurn.narrative_action,
                mood: sanitizedTurn.mood,
                love_change: 0,
                chemistry_change: 0,
                energy_cost: 0
            };
        }

        if (sanitizedTurn.thought) {
            console.log(`%c🧠 [${charData.name}'s Inner Thought]: ${sanitizedTurn.thought}`, 'color: #06b6d4; font-weight: bold; font-style: italic;');
        }

        return guardStoryTurn(sanitizedTurn, currentGameState.story, charId);

    } catch (error) {
        if (storyDialogue) throw error;
        console.error("AI Critical Error:", error);
        return { reply: "...", mood: Mood.NEUTRAL, love_change: 0, energy_cost: 0, chemistry_change: 0 };
    }
};

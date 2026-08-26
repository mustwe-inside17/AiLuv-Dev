
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { CharacterId, RelationshipTier, EventTemplate, LocationId } from "../types";
import { CHARACTER_DATA, LOCATIONS, SECRET_REGISTRY } from "../constants";
import { cleanJsonString, safeJsonParse } from "./mockAi";

const getLocationForChar = (charId: CharacterId): LocationId => {
    switch (charId) {
        case 'miguel': return 'condo';
        case 'fia': return 'gym';
        case 'peat': return 'cafe';
        case 'erin': return 'market';
        case 'marcus': return 'office';
        case 'lucas': return 'basement';
        case 'bam': return 'cafe_2f';
        case 'jellie': return 'mall';
        case 'soul': return 'vet'; 
        case 'mia': return 'maid_cafe'; 
        default: return 'home';
    }
};

// [MARCUS FIX]: Expanded Generic Themes (Apply to everyone)
const GENERIC_THEMES = [
    "ทำของสำคัญหาย/หาไม่เจอ (Lost Item)",
    "อุปกรณ์ทำงานพัง/ขัดข้อง (Tech Issue)",
    "รู้สึกไม่สบาย/เวียนหัว/เป็นตะคริว (Health Crisis)",
    "เจอแมลง/สัตว์ที่กลัว (Phobia)",
    "หิวมาก/น้ำตาลตก/ไม่มีแรง (Hunger)",
    "เครียดเรื่องงาน/ตัดสินใจไม่ได้ (Decision Fatigue)",
    "อุบัติเหตุเล็กน้อย/สะดุดล้ม/เดินชนของ (Clumsy Accident)",
    "ได้ยินเสียงแปลกๆ/ไฟดับ (Environment Scare)",
    "ต้องการคนช่วยถือของ/ช่วยเลือกของ (Need Assistance)",
    "เบื่อ/เหงา/อยากหาคนคุย (Emotional Need)"
];

// [MARCUS FIX]: Specific Themes per Character (To be picked randomly)
const CHAR_SPECIFIC_THEMES: Record<string, string[]> = {
    miguel: [
        "ซิปเสื้อติด/กระดุมหลุด (Wardrobe Malfunction)", 
        "แมว (เต้าหู้) กวนจนทำงานไม่ได้ (Pet Trouble)",
        "ห้องรกมาก/ท่อน้ำรั่ว (Room Issue)",
        "กลัวเสียงฟ้าร้อง/ฝนตกหนัก (Weather Fear)"
    ],
    fia: [
        "เจ็บกล้ามเนื้อ/ตะคริวกิน (Muscle Pain)",
        "หิว Cheat Meal แต่ไม่อยากกินคนเดียว (Craving)",
        "ลูกค้าที่ยิมทำตัวน่ารำคาญ (Annoying Customer)",
        "เสื้อผ้ากีฬาขาด/ยางรัดผมขาด (Gear Failure)"
    ],
    peat: [
        "วัตถุดิบหมด/ของส่งไม่ทัน (Supply Shortage)",
        "ทำกาแฟหกใส่ตัวเอง (Messy Accident)",
        "ลูกค้าเยอะจนทำไม่ทัน (Overwhelmed)",
        "คิดสูตรเมนูใหม่ไม่ออก (Creative Block)"
    ],
    erin: [
        "รองเท้ากัด/ส้นสูงหัก (Shoe Crisis)",
        "เมาค้าง/มึนหัวจากปาร์ตี้ (Hangover/Dizzy)",
        "โดนแฟนคลับตามตื๊อ (Stalker/Fan Trouble)",
        "แบตมือถือหมด/พาวเวอร์แบงค์เสีย (No Battery)"
    ],
    marcus: [
        "ปวดหัวไมเกรน/เครียดสะสม (Migraine)",
        "เนคไทแน่นเกินไป/หายใจไม่ออก (Suffocating)",
        "ลืมเอกสารสำคัญ/หากุญแจรถไม่เจอ (Forgetful)",
        "เบื่ออาหารหรู อยากกินอะไรง่ายๆ (Bored of Luxury)"
    ],
    lucas: [
        "สายกีตาร์ขาด/หูฟังพัง (Equipment Break)",
        "แมว (ไอ้ถ่าน) หายไปไหนไม่รู้ (Lost Cat)",
        "ง่วงนอนจนจะวูบ (Sleepy)",
        "แต่งเพลงไม่ออก/ตัน (Writer's Block)"
    ],
    bam: [
        "อ่านหนังสือไม่ทัน/เครียดสอบ (Study Stress)",
        "เงินหมด/ทำกระเป๋าตังค์หาย (No Money)",
        "อยากกินขนมหวานเติมพลัง (Sugar Craving)",
        "ทะเลาะกับเพื่อน/นอยด์ (Drama)"
    ],
    jellie: [
        "ถือของพะรุงพะรัง/ถุงช้อปปิ้งขาด (Shopping Fail)",
        "แต่งหน้าเลอะ/เล็บฉีก (Beauty Crisis)",
        "เจอคู่แข่ง/คนที่ไม่ชอบหน้า (Rival Encounter)",
        "อยากหนีบอดี้การ์ด (Sneaking Out)"
    ],
    soul: [
        "สัตว์ไข้ดุ/โดนข่วน (Animal Attack)",
        "อ่อนเพลียจากการเข้าเวร (Exhaustion)",
        "นิกกิ (หมา) ป่วย/ซึม (Pet Sick)",
        "ทำยารักษาหก/ขวดยาแตก (Clumsy)"
    ],
    mia: [
        "ชุดเมดขาด/เปื้อน (Costume Fail)",
        "เจอลูกค้าลวนลาม/รุ่มร่าม (Creepy Customer)",
        "อุปกรณ์สายลับขัดข้อง (Spy Gear Fail)",
        "กังวลเรื่องพี่สาว (Worried about Sister)"
    ]
};

export const generateDynamicEvent = async (
    characterId: CharacterId,
    hour: number,
    tier: RelationshipTier,
    existingTemplates: EventTemplate[],
    playerName: string = "User",
    userGender: string = "other",
    unlockedSecrets: string[] = [], 
    currentChapter: number = 1 
): Promise<EventTemplate | null> => {
    
    if (characterId === 'erin' && (hour >= 4 && hour < 21)) return null;
    if (characterId === 'lucas' && (hour >= 6 && hour < 18)) return null;

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    if (!apiKey) return null;

    const ai = new GoogleGenAI({ apiKey });
    const charData = CHARACTER_DATA[characterId];
    const locId = getLocationForChar(characterId);

    let speechRule = "";
    if (['marcus', 'lucas', 'peat', 'soul'].includes(characterId)) {
        speechRule = "GENDER: MALE. SELF: 'Phom' (ผม) or Name. ENDING: 'Krub' (ครับ).";
    } else {
        speechRule = "GENDER: FEMALE. SELF: 'Chan' (ฉัน), 'Rao' (เรา) or Name. ENDING: 'Ka' (คะ/ค่ะ).";
    }

    // --- MARCUS FIXED RANDOMIZER ---
    // 1. Decide Source: 60% Generic (Variety), 40% Specific (Character Flavor)
    // This prevents Miguel from ALWAYS having zipper/cat issues.
    const useSpecific = Math.random() < 0.4;
    
    let pool = GENERIC_THEMES;
    if (useSpecific && CHAR_SPECIFIC_THEMES[characterId]) {
        pool = CHAR_SPECIFIC_THEMES[characterId];
    }

    // 2. Pick ONE theme strictly
    let pickedTheme = pool[Math.floor(Math.random() * pool.length)];

    // 3. Inject Hints (Optional Overrides)
    if (Math.random() < 0.15) {
        // 15% chance to override with Secret Hint if available
        const charSecrets = SECRET_REGISTRY[characterId] || [];
        const lockedSecrets = charSecrets.filter(s => !unlockedSecrets.includes(s.path));
        
        if (lockedSecrets.length > 0) {
            const targetSecret = lockedSecrets[Math.floor(Math.random() * lockedSecrets.length)];
            pickedTheme = `SECRET HINT: Create a situation related to keywords [${targetSecret.keywords.join(", ")}]. Hint at a secret picture.`;
        }
    } else if (Math.random() < 0.10) {
        // 10% chance to relate to Story Chapter
        pickedTheme = `MAIN STORY LINK: Relate the problem to Chapter ${currentChapter} themes (Growth/Love/Success).`;
    }

    const systemPrompt = `
    ROLE: You are the "AI Game Director". Generate a NEW "Active Event" (Mini-Quest) for ${charData.name}.
    
    [SITUATION]: 
    1. The Player is **NOT** with you.
    2. ${charData.name} is facing a specific problem at ${LOCATIONS[locId].name}.
    3. **GOAL:** Send a MESSAGE asking the Player to come and **SOLVE THE PROBLEM**.
    
    IDENTITY:
    ${charData.lore}
    PERSONA: ${charData.deepPersona}
    ${speechRule}

    PLAYER_PROFILE: Name=${playerName}, Gender=${userGender}.

    *** CRITICAL INSTRUCTION ***
    **TOPIC:** "${pickedTheme}"
    
    **RULES:**
    1. **STICK TO THE TOPIC:** Do NOT generate a generic "I'm lonely" message. Focus purely on the "${pickedTheme}".
    2. **VARIETY:** If the topic is generic (e.g. Lost Item), invent a specific item that fits the character's job/life.
    3. **URGENCY:** Make it sound like they need help NOW.
    4. **SPICY/SERVICE (Optional):** If the theme allows (e.g. Injury, Wardrobe, Scare), make it slightly intimate or requiring physical touch.
    
    - **Title:** Short, concise Thai title with 1 emoji (3-6 words maximum, e.g. "เจ้าเต้าหู้หายตัวไป! 🐱", "ช่วยยกของเข้าห้องหน่อย 📦", "สายกีตาร์ขาดกลางคัน 🎸"). **DO NOT repeat words or phrases**.
    - **Message:** Direct speech in THAI. Urgent, Pleading, or Shy tone suitable for character (1-2 sentences).
    - **aiContext:** Instructions for the chatbot. **MUST INCLUDE:** "User must roleplay [ACTION] to solve the problem. If they do, set event_resolved=true."
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.7-flash', 
            contents: systemPrompt,
            config: {
                responseMimeType: "application/json",
                thinkingConfig: { thinkingBudget: 0 },
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        eventType: { type: Type.STRING, enum: ['CRISIS', 'IDEA', 'ACTIVITY', 'STORY', 'GOSSIP', 'SECRET', 'SERVICE'] },
                        title: { type: Type.STRING },
                        message: { type: Type.STRING },
                        aiContext: { type: Type.STRING },
                        validHours: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                        rewards: { 
                            type: Type.OBJECT,
                            properties: {
                                exp: { type: Type.NUMBER },
                                love: { type: Type.NUMBER }
                            },
                            required: ["exp", "love"]
                        }
                    },
                    required: ["title", "message", "aiContext", "validHours", "rewards", "eventType"]
                }
            },
        });

        const text = response.text;
        if (!text) return null;
        const data = safeJsonParse<{
            title: string;
            message: string;
            aiContext: string;
            validHours: number[];
            rewards: { exp: number; love: number };
            eventType: string;
        } | null>(text, null);
        if (!data || !data.title || !data.message) return null;

        return {
            templateId: `${characterId}_gen_${Date.now()}`, 
            characterId: characterId,
            locationId: locId,
            title: data.title.replace(/คะ\/ค่ะ/g, 'ค่ะ').replace(/ครับ\/ค่ะ/g, 'ครับ'),
            message: data.message.replace(/คะ\/ค่ะ/g, 'ค่ะ').replace(/ครับ\/ค่ะ/g, 'ครับ'),
            aiContext: `TOPIC: ${pickedTheme}. ${data.aiContext}. [SYSTEM RULE]: When user ROLEPLAYS the solution, set event_resolved=true.`,
            validHours: data.validHours && data.validHours.length > 0 ? data.validHours : [hour],
            rewards: data.rewards
        };

    } catch (error: any) {
        console.error("AI Director Failed:", error.message);
        return null;
    }
};
    
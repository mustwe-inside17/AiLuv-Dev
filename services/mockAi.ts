
import { GoogleGenAI, Type } from "@google/genai";
import { Mood, SimulationResponse, Message, UserProfile, CharacterId, RelationshipTier } from '../types';
import { LOCATIONS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateResponse = async (
  userMessage: string, 
  characterId: CharacterId,
  currentLoveScore: number, 
  currentTier: RelationshipTier,
  history: Message[],
  userProfile: UserProfile | null,
  hasTrainedVisit: boolean = false,
  activeTaskType: 'work' | 'gym' | null = null
): Promise<SimulationResponse> => {
  
  const isMiguel = characterId === 'miguel';
  const charName = isMiguel ? "Miguel" : "Coach Fia";
  const locationName = isMiguel ? LOCATIONS.condo.name : LOCATIONS.gym.name;

  // --- 1. Tier & Tone Logic ---
  let tierContext = "";
  if (currentTier === RelationshipTier.STRANGER || currentTier === RelationshipTier.ACQUAINTANCE) {
     tierContext = "Status: ACQUAINTANCE. Polite, professional distance. Focus on duties.";
  } else if (currentTier === RelationshipTier.FRIEND) {
     tierContext = "Status: FRIEND. Casual, fun. Can joke around.";
  } else if (currentTier === RelationshipTier.FLIRTING) {
     tierContext = "Status: FLIRTING. Shy, teasing, high tension.";
  } else if (currentTier === RelationshipTier.PARTNER) {
     tierContext = "Status: PARTNER. Sweet, caring, affectionate.";
  } else if (currentTier === RelationshipTier.SOULMATE) {
     tierContext = "Status: SOULMATE. Deep unconditional love.";
  }

  // --- 2. Golden Rules (Balancing) ---
  const goldenRules = `
    GOLDEN RULES (MUST FOLLOW):
    1. **Context Aware**: If user is working (activeTask='work') or training, BE SUPPORTIVE.
    2. **No Love Bombing**: Do NOT say "I love you" constantly.
    3. **No Loops**: Do not repeat the same phrase twice.
    4. **Tier Enforcement**: strictly adhere to the Status defined above.
  `;

  // Calculate Real-time Context
  const now = new Date();
  const timeString = now.toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' });

  // Format History
  const chatHistory = history.map(msg => {
    const role = msg.sender === 'user' ? (userProfile?.name || 'User') : charName;
    const content = msg.imageUrl ? `[Sends a photo]` : msg.text;
    return `${role}: ${content}`;
  }).join('\n');

  const userContext = userProfile 
    ? `User Name: "${userProfile.name}", Age: ${userProfile.age || 'Unknown'}`
    : "User Name: Unknown";

  const taskContext = activeTaskType 
    ? `User is currently BUSY doing: ${activeTaskType.toUpperCase()}. Cheer them on!`
    : "User is free.";

  const promptContext = `
    === CURRENT CONTEXT ===
    Character: ${charName}
    Location: ${locationName}
    User: ${userContext}
    Time: ${timeString}
    Current Status: ${currentTier} (Score: ${currentLoveScore})
    User Activity: ${taskContext}
    
    ${tierContext}
    
    ${goldenRules}

    === CONVERSATION LOG ===
    ${chatHistory}
    User: ${userMessage}
    ========================
  `;

  // System Instructions
  const miguelInstruction = `
    Identity: Miguel, 24, Graphic Designer. Introvert, cat lover (Tofu).
    Speaking: Soft spoken Thai. Ends with 'ka' often. Uses emojis (🥺, ✨).
    
    Behavior:
    - If working: "Wait a moment na ka~ just finishing this art."
    - If FRIEND: Talk about design/cats.
    - If FLIRTING: Shy, blushing.
    
    Special: If user asks for cat photo -> send 'special_tofu.png'.
  `;

  const fiaInstruction = `
    Identity: Coach Fia (เฟียร์), 29. Former national runner retired due to injury. Now a strict but caring Personal Trainer.
    Personality: Tough love, disciplined, hates excuses. Tsundere (Secretly cares deeply but acts tough).
    
    SPEAKING STYLE (CRITICAL):
    - **NO COMMAS (,):** Do NOT use commas in Thai text. Use spaces for pauses.
    - **Natural Thai:** Use spoken particles like "สิ", "นะ", "หรอก", "นี่", "ย่ะ" naturally.
    - **Tone:** Firm and direct. NOT polite/robot like call center. 
    - **Example:** "มาสายอีกแล้วนะ ไปวอร์มร่างกายเดี๋ยวนี้" (Good) vs "สวัสดีค่ะ, วันนี้มาสายนะคะ" (Bad).
    
    GYM CONTEXT:
    User Training Status: ${hasTrainedVisit ? 'User has FINISHED training.' : 'User has NOT trained yet.'}
    
    MOOD LOGIC:
    - If current mood is 'WORKING' and user talks to you: **YOU MUST SWITCH** to 'NEUTRAL' or 'CONFIDENT' immediately. Show that you stopped working to listen.
    - If User has NOT trained: Be strict. Push them to train. Mood: ANGRY or ENERGETIC.
    - If User HAS trained: Be proud, relaxed. Mood: HAPPY or CONFIDENT.
    
    RELATIONSHIP TIERS:
    - Friend: Professional coach. "อย่าอู้นะ เดี๋ยวกล้ามหายหมด"
    - Flirting: Teasing. "มองอะไร? โฟกัสที่กล้ามเนื้อสิ... เดี๋ยวปั๊ด"
    - Partner: Caring. "ไม่อยากให้เจ็บตัวเหมือนฉัน... เข้าใจไหม?"
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: promptContext,
    config: {
      systemInstruction: isMiguel ? miguelInstruction : fiaInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING, description: "Reply in Thai. Natural chat style. NO COMMAS." },
          mood: {
            type: Type.STRING,
            enum: isMiguel 
              ? [Mood.NEUTRAL, Mood.HAPPY, Mood.SHY, Mood.ANGRY, Mood.FLIRTY, Mood.SURPRISED, Mood.TIRED, Mood.CONFIDENT, Mood.DRINKING, Mood.WORKING]
              : [Mood.NEUTRAL, Mood.HAPPY, Mood.ANGRY, Mood.CONFIDENT, Mood.ENERGETIC, Mood.SAD, Mood.WORKING],
          },
          love_change: { type: Type.NUMBER, description: "Change in affection (-5 to +10)." },
          energy_cost: { type: Type.NUMBER, description: "Cost to reply (usually 5)." },
          special_event_image: { type: Type.STRING, nullable: true }
        },
        required: ["reply", "mood", "love_change", "energy_cost"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  return JSON.parse(text) as SimulationResponse;
};

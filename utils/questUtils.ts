import { CharacterQuest, CharacterQuestChoice, CharacterId } from '../types';
import { CHARACTER_DATA } from '../constants';

/**
 * Strips excessive / clustered emoji loops and limits emojis to clean, readable text.
 * Prevents AI hallucinations where dozens of emojis are outputted in sequence.
 */
export function sanitizeEmojiSpam(text: string): string {
  if (!text || typeof text !== 'string') return text;

  let cleaned = text;

  // 1. Remove long sequences of 2 or more emojis attached together (e.g. 💫✨🪩💖🍾🎉...)
  const clusteredEmojiRegex = /(?:[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\s*){2,}/gu;
  cleaned = cleaned.replace(clusteredEmojiRegex, ' ').trim();

  // 2. Count total remaining emojis; if more than 2 exist in a short phrase, clean them completely
  const singleEmojiRegex = /[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const matches = cleaned.match(singleEmojiRegex);
  if (matches && matches.length > 2) {
    cleaned = cleaned.replace(singleEmojiRegex, '').trim();
  }

  // 3. Normalize spacing
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned || text;
}

/**
 * Removes accidental choice lists (e.g., "1. ... 2. ... 3. ..." or "A) ... B) ...") 
 * from the character's conversational reply so choices don't merge into story dialogue.
 */
export function stripChoicesFromDialogue(text: string): string {
  if (!text || typeof text !== 'string') return text;

  let cleaned = text;

  // Pattern 1: Numbered or Lettered choice lists at the end or in a block
  // e.g. "1. ช้อยหนึ่ง\n2. ช้อยสอง\n3. ช้อยสาม" or "A. ... B. ... C. ..."
  // or "ตัวเลือก: 1)... 2)..."
  const choiceListRegex = /(?:\n+|\s+)(?:ตัวเลือก(?:\s*คือ)?[:：]?\s*)?(?:[1-3A-Ca-c][\.\)\-:]\s*[\s\S]+?(?:\n|$)){2,}/g;
  cleaned = cleaned.replace(choiceListRegex, '').trim();

  // Pattern 2: Explicit prefix like "ตัวเลือกที่ 1: ... ตัวเลือกที่ 2: ..."
  const thaiChoiceListRegex = /(?:\n+|\s+)(?:ตัวเลือกที่\s*[1-3A-Ca-c][:：]?\s*[\s\S]+?(?:\n|$)){2,}/g;
  cleaned = cleaned.replace(thaiChoiceListRegex, '').trim();

  // Pattern 3: Trailing question headers like "คุณจะเลือกทำอะไรดี? 1... 2... 3..."
  const trailingChoiceBlockRegex = /(?:\n+|\s+)(?:คุณจะ(?:เลือก)?(?:ทำอย่างไร|ช่วยอย่างไร|ตอบว่าอะไร|ทำอะไรดี)[\?？]?\s*)(?:[1-3A-Ca-c][\.\)\-:]\s*[\s\S]+)$/gi;
  cleaned = cleaned.replace(trailingChoiceBlockRegex, '').trim();

  return cleaned || text;
}

/**
 * Validates raw character quest object from AI and repairs missing or invalid fields.
 */
export function validateAndSanitizeCharacterQuest(
  raw: any,
  context: {
    characterId: CharacterId;
    recentMessages?: { sender: string; text: string }[];
  }
): CharacterQuest | null {
  if (!raw || typeof raw !== 'object') return null;

  const charId = context.characterId;
  const charName = CHARACTER_DATA[charId]?.name || 'ตัวละคร';

  // 1. Title Validation, Deduplication & Emoji Spam Cleansing
  let title = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : '';
  if (title) {
    // Sanitize emoji spam first
    title = sanitizeEmojiSpam(title);
    // Remove duplicate repetitive phrases like "ช่วยด้วย! ช่วยด้วย!" or duplicated words
    title = title.replace(/(.+?)(?:\s*[,!?:-]\s*|\s+)\1+/gi, '$1');
    title = title.replace(/\s+/g, ' ').trim();
  }
  if (!title) {
    title = `เรื่องสำคัญของ${charName}`;
  }

  // 2. Context Validation
  let questContext = typeof raw.context === 'string' && raw.context.trim() ? raw.context.trim() : '';
  if (questContext) {
    questContext = sanitizeEmojiSpam(questContext);
  }
  if (!questContext || questContext.length < 10) {
    const recentSummary = context.recentMessages && context.recentMessages.length > 0
      ? context.recentMessages.slice(-4).map(m => `${m.sender === 'user' ? 'ผู้เล่น' : charName}: ${m.text}`).join(' ')
      : `${charName} กำลังเผชิญกับสถานการณ์ที่ต้องการความคิดเห็นและการตัดสินใจจากคุณในขณะนี้`;
    questContext = `ในระหว่างบทสนทนา (${recentSummary.substring(0, 120)}...) ${charName} กำลังมีเรื่องที่ต้องการให้คุณช่วยตัดสินใจลงมือทำ`;
  }

  // 3. Description & Objective Validation
  let description = typeof raw.description === 'string' && raw.description.trim() ? raw.description.trim() : '';
  if (description) {
    description = sanitizeEmojiSpam(description);
  }
  if (!description) {
    description = `${charName} ต้องการความช่วยเหลือจากคุณในเรื่อง "${title}"`;
  }

  let objective = typeof raw.objective === 'string' && raw.objective.trim() ? raw.objective.trim() : '';
  if (objective) {
    objective = sanitizeEmojiSpam(objective);
  }
  if (!objective) {
    objective = `ช่วย${charName} ตัดสินใจและจัดการกับ "${title}"`;
  }

  // 4. Choices Validation (Support varied naming conventions from AI)
  let choices: CharacterQuestChoice[] = [];
  const rawChoices = Array.isArray(raw.choices) ? raw.choices : (Array.isArray(raw.options) ? raw.options : []);

  if (rawChoices.length > 0) {
    choices = rawChoices
      .filter((c: any) => c && typeof c === 'object')
      .map((c: any, index: number) => {
        let choiceTitle = typeof c.title === 'string' && c.title.trim() 
          ? c.title.trim() 
          : (typeof c.text === 'string' && c.text.trim() ? c.text.trim() : `ทางเลือกที่ ${index + 1}`);

        // Sanitize emoji spam & clean leading prefixes like "1. ", "A. ", "ข้อ 1: "
        choiceTitle = sanitizeEmojiSpam(choiceTitle);
        choiceTitle = choiceTitle.replace(/^(?:[1-3A-Ca-c][\.\)\-:]\s*|ข้อ\s*[1-3][:：]?\s*)/gi, '').trim();
        choiceTitle = choiceTitle.replace(/(.+?)(?:\s*[,!?:-]\s*|\s+)\1+/gi, '$1').trim();

        let choiceDesc = typeof c.description === 'string' && c.description.trim() ? c.description.trim() : choiceTitle;
        choiceDesc = sanitizeEmojiSpam(choiceDesc);
        
        let playerResponse = typeof c.playerResponse === 'string' && c.playerResponse.trim()
          ? c.playerResponse.trim()
          : (typeof c.player_response === 'string' && c.player_response.trim() 
              ? c.player_response.trim() 
              : (typeof c.dialogue === 'string' && c.dialogue.trim() ? c.dialogue.trim() : `เดี๋ยวฉันจะ${choiceTitle}ให้เองนะ`));

        playerResponse = sanitizeEmojiSpam(playerResponse);
        playerResponse = playerResponse.replace(/^(?:[1-3A-Ca-c][\.\)\-:]\s*|ข้อ\s*[1-3][:：]?\s*)/gi, '').trim();

        return {
          id: c.id && String(c.id).trim() ? String(c.id).trim() : `choice_${index + 1}_${Date.now()}`,
          title: choiceTitle,
          description: choiceDesc,
          playerResponse,
          intention: typeof c.intention === 'string' ? c.intention : (c.type ? String(c.type) : undefined),
          consequenceHint: typeof c.consequenceHint === 'string' ? sanitizeEmojiSpam(c.consequenceHint) : undefined
        };
      });
  }

  // Ensure unique IDs
  const seenIds = new Set<string>();
  choices = choices.filter(c => {
    if (seenIds.has(c.id)) return false;
    seenIds.add(c.id);
    return true;
  });

  // If choices count is invalid (less than 3), generate dynamic situation-aware fallback choices
  if (choices.length < 3) {
    const fallbackChoices = generateContextualFallbackChoices(title, questContext, objective, charName);
    // Combine existing valid choices with fallbacks if some existed
    if (choices.length > 0) {
      const remainingNeeded = 3 - choices.length;
      choices = [...choices, ...fallbackChoices.slice(0, remainingNeeded)];
    } else {
      choices = fallbackChoices;
    }
  } else if (choices.length > 3) {
    choices = choices.slice(0, 3);
  }

  const questId = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : `quest_${charId}_${Date.now()}`;

  return {
    id: questId,
    characterId: charId,
    title,
    context: questContext,
    description,
    objective,
    choices,
    status: raw.status && ['pending', 'active', 'resolving', 'reward_pending', 'resolved', 'completed', 'abandoned'].includes(raw.status) ? raw.status : 'active',
    sourceConversationIds: Array.isArray(raw.sourceConversationIds) ? raw.sourceConversationIds : [],
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    energyCost: typeof raw.energyCost === 'number' ? Math.max(0, Math.min(20, raw.energyCost)) : 10,
    loveReward: typeof raw.loveReward === 'number' ? Math.max(10, Math.min(50, raw.loveReward)) : 35,
    responseOnComplete: typeof raw.responseOnComplete === 'string' && raw.responseOnComplete.trim() 
      ? raw.responseOnComplete.trim() 
      : `ขอบคุณที่ช่วยลงมือทำและอยู่ข้างๆ ${charName} เสมอนะ!`,
    isCompleted: raw.status === 'completed' || (raw.status === 'resolved' && raw.isCompleted === true)
  };
}

/**
 * Generates 3 contextual action choices dynamically tailored to the specific quest title and objective.
 */
export function generateContextualFallbackChoices(
  title: string,
  context: string,
  objective: string,
  characterName: string
): CharacterQuestChoice[] {
  const cleanTitle = title.replace(/^เรื่องสำคัญของ/g, '').trim() || 'สถานการณ์นี้';
  const cleanObjective = objective || `จัดการเรื่อง ${cleanTitle}`;

  return [
    {
      id: `choice_action_proactive_${Date.now()}_1`,
      title: `รีบเข้าไปช่วย${cleanObjective} โดยตรงทันที`,
      description: `เข้าไปช่วย${characterName} ลงมือแก้ปัญหาตรงหน้าอย่างกระตือรือร้น`,
      playerResponse: `ไม่ต้องห่วงนะ ${characterName} เดี๋ยวฉันลงมือช่วยจัดการเรื่องนี้ให้เองทันทีเลย!`,
      intention: 'proactive',
      consequenceHint: `แสดงความมั่นใจและพึ่งพาได้ต่อ ${characterName}`
    },
    {
      id: `choice_action_investigate_${Date.now()}_2`,
      title: `ตรวจเช็กและวางแผนรับมือเรื่อง ${cleanTitle} อย่างรอบคอบ`,
      description: `วิเคราะห์รายละเอียดและเลือกแนวทางที่ปลอดภัยที่สุด`,
      playerResponse: `เรามาค่อยๆ ตรวจดูรายละเอียดเรื่องนี้ด้วยกันก่อนดีกว่า จะได้แก้ปัญหาได้ตรงจุด`,
      intention: 'careful',
      consequenceHint: `ป้องกันข้อผิดพลาดและแสดงความใส่ใจในรายละเอียด`
    },
    {
      id: `choice_action_support_${Date.now()}_3`,
      title: `เคียงข้างให้กำลังใจพร้อมหาตัวช่วยเสริมให้ ${characterName}`,
      description: `สร้างบรรยากาศที่ผ่อนคลายและประสานงานหาทางออกร่วมกัน`,
      playerResponse: `ใจเย็นๆ นะ มีฉันอยู่ข้างๆ เสมอ เดี๋ยวเราช่วยกันคิดและหาทางออกไปด้วยกันนะ`,
      intention: 'supportive',
      consequenceHint: `เพิ่มความรู้สึกอบอุ่นและสร้างความสบายใจให้กับ ${characterName}`
    }
  ];
}

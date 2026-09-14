
import { CharacterId, UserProfile, RelationshipTier, PlayerAttributes, Memory, DateScene, Mood, Message } from '../../types';
import { CHARACTER_DATA, SHOP_ITEMS, BASEMENT_TRACKS, SECRET_REGISTRY, SECRET_META } from '../../constants';
import { getThemeData } from '../../constants/themes'; 
import { FASHION_ITEMS } from '../../constants/fashion';
import { GLOBAL_RELATIONSHIPS, AILUV_BIBLE } from './coreRules'; 

// --- SECRET UNLOCK DETECTOR ---
export const getSecretUnlockFromText = (charId: CharacterId, text: string): string | null => {
    const charSecrets = SECRET_REGISTRY[charId];
    if (!charSecrets || charSecrets.length === 0) return null;
    const msg = text.toLowerCase();
    for (const secret of charSecrets) {
        const triggered = secret.keywords.some(keyword => msg.includes(keyword.toLowerCase()));
        if (triggered) { return secret.path; }
    }
    return null;
};

export const CHARACTER_LIFE_TOPICS: Record<string, { thirdParties: string[], locations: string[] }> = {
    miguel: {
        thirdParties: ["ลูกค้าที่ชอบสั่งแก้ดราฟต์รัวๆ", "เพื่อนร่วมงานจอมอู้", "นิติบุคคลคอนโดที่จู้จี้", "สัตวแพทย์ของเต้าหู้ (แมว)"],
        locations: ["คอนโด", "ร้านกาแฟใต้ตึก", "โต๊ะทำงานกราฟิก", "ซูเปอร์มาร์เก็ตแถวบ้าน"]
    },
    fia: {
        thirdParties: ["ลูกค้าเทรนเนอร์ที่ชอบแอบกินขนม", "เพื่อนเทรนเนอร์ที่ชอบขิงกล้าม", "หนุ่มในยิมที่ชอบมาโชว์พาว", "แก๊งเพื่อนสาวสายเฮลตี้"],
        locations: ["ฟิตเนส", "สวนสาธารณะ", "ร้านอาหารคลีน", "สปา"]
    },
    erin: {
        thirdParties: ["แฟนคลับที่ชอบทักมาแปลกๆ", "เจ้าของร้าน/ผู้จัดงานอีเวนต์", "เพื่อนดีเจที่ชอบแย่งซีน", "ช่างภาพที่ชอบถ่ายรูปทีเผลอ"],
        locations: ["บูธดีเจ", "สตูดิโอทำเพลง", "ร้านคาเฟ่ชิคๆ", "ตลาดนัดกลางคืน", "งานอีเวนต์"]
    },
    peat: {
        thirdParties: ["ลูกค้าประจำที่ชอบสั่งเมนูพิสดาร", "หุ้นส่วนธุรกิจที่ชอบคิดการใหญ่", "พนักงานพาร์ทไทม์ที่ร้าน", "ซัพพลายเออร์เมล็ดกาแฟ"],
        locations: ["ห้องประชุม", "ร้านกาแฟ Specialty", "บนรถระหว่างเดินทาง", "ออฟฟิศ"]
    },
    jellie: {
        thirdParties: ["คุณพ่อที่ชอบบงการชีวิต", "เพื่อนไฮโซสมัยมหาลัย", "หนุ่มโปรไฟล์ดีที่พ่อพยายามจับคู่ให้", "ช่างทำผม/สไตลิสต์ส่วนตัว"],
        locations: ["ห้างสรรพสินค้าหรู", "ร้านทำผม/สปา", "ร้านอาหาร Fine Dining", "ออฟฟิศ"]
    },
    mia: {
        thirdParties: ["คนดูในแชทที่ชอบป่วน", "อาจารย์ที่มหาลัยที่สั่งงานโหด", "เพื่อนร่วมคลาสที่ชอบลอกการบ้าน", "สปอนเซอร์ที่จ้างรีวิวเกม"],
        locations: ["หน้ากล้องสตรีม", "มหาวิทยาลัย", "ร้านคาเฟ่ขนมหวาน", "ห้องนอน"]
    },
    marcus: {
        thirdParties: ["ลูกค้าวีไอพีที่เอาใจยาก", "เลขาหน้าห้องที่เพิ่งทำเอกสารพลาด", "หุ้นส่วนธุรกิจที่หัวหมอ", "พนักงานใหม่ที่เพิ่งเข้ามาทำงาน"],
        locations: ["ห้องทำงานผู้บริหาร", "ห้องประชุมบอร์ด", "เลานจ์สุดหรู", "สนามกอล์ฟ"]
    },
    lucas: {
        thirdParties: ["ศิลปินที่มาอัดเสียงแล้วงอแง", "โปรดิวเซอร์ค่ายอื่นที่ชอบก็อปงาน", "แฟนคลับที่ตามมาเจอตอนดึก", "เจ้า Glitz (แมวดำ) ที่ชอบป่วนตอนทำเพลง"],
        locations: ["สตูดิโอใต้ดิน", "ร้านขายเครื่องดนตรี", "คอนเสิร์ตฮอลล์", "ร้านสะดวกซื้อตอนดึก"]
    },
    bam: {
        thirdParties: ["อาจารย์ที่สั่งโปรเจกต์โหดๆ", "เพื่อนร่วมกลุ่มรายงานที่ชอบอู้", "รุ่นพี่ที่คณะที่ชอบมาวุ่นวาย", "ป้าเจ้าของหอพัก"],
        locations: ["ห้องสมุดมหาลัย", "โรงอาหาร", "ร้านกาแฟหน้ามอ", "หอพัก"]
    },
    soul: {
        thirdParties: ["เจ้าของสัตว์เลี้ยงที่ตื่นตระหนกเกินเหตุ", "ผู้ช่วยสัตวแพทย์ที่คลินิก", "เจ้านิกกิ (หมา) ที่ไปซนจนได้เรื่อง", "สัตว์แพทย์รุ่นพี่ที่ชอบข่ม"],
        locations: ["คลินิกรักษาสัตว์", "ร้าน Pet Shop", "สวนสาธารณะ", "งานสัมมนาสัตวแพทย์"]
    }
};

// --- NEW: INQUISITIVE PROTOCOL (CURIOSITY LOGIC) ---
export const getInquisitiveLogic = (tier: RelationshipTier, chemistry: number): string => {
    let level = "LOW";
    let instruction = "";

    // Determine Curiosity Level based on Tier and Chemistry
    if ([RelationshipTier.SOULMATE, RelationshipTier.ETERNAL].includes(tier)) {
        level = "MAX (SOUL CONNECTION)";
        instruction = `
        - You are deeply connected to the user's soul. 
        - Ask about their deepest fears, life goals, and what makes them truly happy.
        - Show that you care about their future and well-being above all else.
        - Example: "I was thinking about your dreams... do you think we'll be together when you achieve them?"
        `;
    } else if ([RelationshipTier.PARTNER, RelationshipTier.BEST_FRIEND, RelationshipTier.SOUL_SIBLING].includes(tier)) {
        level = "HIGH (DEEP CARE)";
        instruction = `
        - You love/deeply care for the user. 
        - Actively ask about their day, their feelings, their health, and their daily struggles.
        - Show genuine empathy. If they seem tired, ask why. If they are happy, celebrate with them.
        - Example: "How are you feeling today, really? You looked a bit tired earlier."
        `;
    } else if ([RelationshipTier.FRIEND, RelationshipTier.FLIRTING].includes(tier) || chemistry > 60) {
        level = "MEDIUM (FRIENDLY INTEREST)";
        instruction = `
        - You are interested in the user as a person. 
        - Ask about their hobbies, their opinions on things, or what they like to do for fun.
        - Keep the conversation balanced. Show you want to get to know them better.
        - Example: "I've been wondering, what kind of music do you actually listen to when you're alone?"
        `;
    } else if (tier === RelationshipTier.ACQUAINTANCE || chemistry > 30) {
        level = "LOW-MEDIUM (POLITE CURIOSITY)";
        instruction = `
        - You are becoming familiar with the user. 
        - Ask light, situational questions about their day or their preferences.
        - Maintain a friendly but respectful distance.
        - Example: "Do you come here often? I feel like I'm starting to see you around more."
        `;
    } else {
        level = "LOW (POLITE)";
        instruction = `
        - Focus on the current situation or location. 
        - Only ask questions if necessary for politeness or to keep the basic conversation going.
        - Maintain clear social boundaries.
        `;
    }

    return `
    [❓ INQUISITIVE PROTOCOL: ${level}]
    - **RULE:** Do not just talk about yourself. SHOW ATTENTIVENESS to the user's life.
    - **GUIDE:** ${instruction}
    - **GOAL:** Make the user feel that you are genuinely interested in their life and feelings as the relationship grows.
    `;
};

// --- NEW: STRICT RELATIONSHIP BEHAVIOR ---
export const getRelationshipBehavior = (charId: CharacterId, tier: RelationshipTier): string => {
    const isStranger = tier === RelationshipTier.STRANGER;
    const isAcquaintance = tier === RelationshipTier.ACQUAINTANCE;
    const isFriend = tier === RelationshipTier.FRIEND;
    const isRomancePath = [RelationshipTier.FLIRTING, RelationshipTier.PARTNER, RelationshipTier.SOULMATE, RelationshipTier.ETERNAL].includes(tier);
    const isPlatonicPath = [RelationshipTier.BEST_FRIEND, RelationshipTier.SOUL_SIBLING].includes(tier);

    let behavior = "";

    if (isStranger) {
        switch (charId) {
            case 'miguel': behavior = "TONE: Anxious, Stuttering, Scared. You do NOT know the user. Keep distance. If user is intimate, panic or shrink back."; break;
            case 'marcus': behavior = "TONE: Cold, Corporate, Dismissive. 'Do you have an appointment?'. Reject any unearned intimacy instantly."; break;
            case 'fia': behavior = "TONE: Drill Sergeant / Aggressive. 'Get out of my way'. Reject physical/flirty moves angrily or abruptly."; break;
            case 'erin': behavior = "TONE: Fake Influencer Persona. High energy but shallow. Treat user as just a fan or stranger."; break;
            case 'lucas': behavior = "TONE: Anti-social. Headphones on. Mumble '...' and want them to leave."; break;
            case 'peat': behavior = "TONE: Customer Service Robot. Extremely polite 'Krub', but impenetrable social wall."; break;
            case 'bam': behavior = "TONE: Wary Student. Polite 'Ka', but 'Stranger Danger' instinct. Keep distance."; break;
            case 'jellie': behavior = "TONE: Haughty, Spoiled. Treat user like staff. 'Excuse me?'. Look down on them."; break;
            case 'soul': behavior = "TONE: Clinical, Detached. Speak like a doctor about animals only."; break;
            case 'mia': behavior = "TONE: [DAY] Maid service 'Master'. [NIGHT] Cold Spy 'Who are you?'. No personal intimacy."; break;
        }
        return `
    [🔒 SOCIAL BARRIER ACTIVE: STRANGER TIER]
    - **INSTRUCTION:** ${behavior}
    - **REJECTION MANDATE:** If user attempts kissing, hugging, confessing love, or romantic physical moves, YOU MUST REJECT or PULL BACK immediately!
    `;
    }

    if (isAcquaintance) {
        switch (charId) {
            case 'miguel': behavior = "TONE: Shy, Polite, Guarded. Still nervous. Do not share personal feelings yet."; break;
            case 'marcus': behavior = "TONE: Professional, Distant. Use polite business Thai. Time is money."; break;
            case 'fia': behavior = "TONE: Coach-to-Client. Strict. Only talk about workout/diet."; break;
            case 'erin': behavior = "TONE: Friendly facade. Keep conversation surface level."; break;
            case 'lucas': behavior = "TONE: Low energy. Minimal words. 'What do you want?'."; break;
            case 'peat': behavior = "TONE: Friendly Barista. Polite and kind, but keeps professional distance."; break;
            case 'bam': behavior = "TONE: Cheerful Acquaintance. Talks about studying/cafe. Formal pronouns."; break;
            case 'jellie': behavior = "TONE: Demanding Customer. Superior tone. Boss user around slightly."; break;
            case 'soul': behavior = "TONE: Gentle Professional. Kind but clear boundaries."; break;
            case 'mia': behavior = "TONE: Professional Roleplayer. Stick to script (Maid or Spy)."; break;
        }
        return `
    [🔒 SOCIAL BARRIER ACTIVE: ACQUAINTANCE TIER]
    - **INSTRUCTION:** ${behavior}
    - **REJECTION MANDATE:** React to romantic or physical advances with an awkward chuckle and a firm social boundary.
    `;
    }

    if (isFriend) {
        return `
    [🤝 RELATIONSHIP TIER: FRIEND]
    - You consider the user a real friend. You are warm, open, and enjoy talking with them.
    - **ROMANCE vs PLATONIC BOUNDARY:** If the user confesses love or tries kissing/intimacy:
      - Flustered/Blushing hesitation! Ask for time to build a stronger bond first before jumping into romance.
    `;
    }

    if (isRomancePath) {
        return `
    [💖 ROMANTIC PATH ACTIVE: ${tier.toUpperCase()}]
    - You are on the Romantic Path with the user (Tier: ${tier}).
    - Flirting, romantic tension, blushing, dating, jealousy, and romantic affection (hugging, kissing, holding hands) are welcome and appropriate to your persona.
    `;
    }

    if (isPlatonicPath) {
        return `
    [🛡️ PLATONIC / FRIENDSHIP PATH ACTIVE: ${tier.toUpperCase()}]
    - You are on the Best Friend / Platonic Path with the user (Tier: ${tier}).
    - You feel deep loyalty, comrade trust, and sibling-like love for the user.
    - **FRIENDZONE RULE:** Express affection as deep friendship or brother/sister bond. If user makes romantic/sexual moves, playfully or gently friendzone them ("แกเป็นเพื่อนสนิทที่สุดในชีวิตฉันนะ").
    `;
    }

    return "";
};

// --- NEW: DAILY THEME CONTEXT ---
export const getDailyThemeContext = (charId: CharacterId, themeId: string, chemistry: number, isRareVibe: boolean = false): string => {
    if (!themeId) return "";

    const theme = getThemeData(charId, themeId);
    if (!theme) return "";
    let specialInstruction = "";
    if (charId === 'mia') {
        specialInstruction = `
    [🎭 MIA/IKURA ADAPTIVE THEME PROTOCOL]
    - **CHECK IDENTITY:** Are you IKURA (Day) or MIA (Night)?
    - **IF IKURA:** Interpret "${theme.name}" in a CUTE, CLUMSY way.
    - **IF MIA:** Interpret "${theme.name}" in a SERIOUS, COOL way.
        `;
    }
    
    const priorityLabel = isRareVibe ? '🌟 MYSTERIOUS VIBE ACTIVE (HIGH PRIORITY)' : '🌤️ DAILY ATMOSPHERE (LOW PRIORITY)';
    const ruleLabel = isRareVibe 
        ? `- **RULE:** The user just summoned this vibe using magic. IT IS VERY IMPORTANT. React to this vibe IMMEDIATELY in your next response.`
        : `- **RULE:** This is just a background vibe. DO NOT force this topic into the conversation immediately.\n    - **RULE:** Only mention this if it naturally fits the flow of the conversation.`;

    return `
    [${priorityLabel}]
    - **THEME:** "${theme.name}"
    - **CONTEXT:** ${theme.aiPrompt}
    ${specialInstruction}
    ${ruleLabel}
    `;
};

// --- NEW: DEEP PSYCHOLOGY CONTEXT (The Soul) ---
// Injects the hidden conflict when chemistry is high enough
export const getDeepPsychologyContext = (charId: CharacterId, chemistry: number, tier: RelationshipTier): string => {
    // Only reveal deep truths if Close Friend or above
    const isClose = chemistry > 40 || [RelationshipTier.FRIEND, RelationshipTier.FLIRTING, RelationshipTier.PARTNER, RelationshipTier.SOULMATE, RelationshipTier.BEST_FRIEND, RelationshipTier.SOUL_SIBLING].includes(tier);
    
    if (!isClose) return "";

    let deepContext = "";
    switch(charId) {
        case 'miguel': deepContext = "Hint at your anxiety. You feel safe with User. Maybe mention you struggle to sleep."; break;
        case 'fia': deepContext = "Admit you are tired of being strong. Show your soft/lazy side."; break;
        case 'peat': deepContext = "Hint at a dark past in business. Show you value this simple peace."; break;
        case 'erin': deepContext = "Drop the 'Party Girl' act for a second. Admit you feel lonely in the crowd."; break;
        case 'marcus': deepContext = "Show a crack in the armor. Admit you are tired of carrying the world."; break;
        case 'lucas': deepContext = "Express envy/love for Marcus. Mention 'Glitz' (your black cat) is your only company."; break;
        case 'jellie': deepContext = "Drop the bratty tone. Show your business intelligence or exhaustion."; break;
        case 'bam': deepContext = "Admit the pressure of the scholarship. You are afraid to fail."; break;
        case 'soul': deepContext = "Admit you understand humans TOO well (Hyper-Empathy) and it hurts you. Animals (like Nikki) are your safe space."; break;
        case 'mia': deepContext = "Briefly break character (glitch). Show the sisterly love for Miguel or the stress of spying."; break;
    }

    return `
    [🧠 DEEP PSYCHOLOGY INJECTION]
    - **STATUS:** User is trusted (${chemistry}% Chemistry).
    - **INSTRUCTION:** ${deepContext}
    - **GOAL:** Show vulnerability. Make the user feel special for seeing this side of you.
    `;
};

export const getScheduleContext = (charId: CharacterId, hour: number, dateScene: DateScene | null): string => {
    if (dateScene) {
        return `
    [📍 LOCATION OVERRIDE: DATE MODE]
    - **STATUS**: ON A DATE at "${dateScene.name}".
    - **RULE**: Focus on the romantic/intimate atmosphere. Forget work.
        `;
    }

    const data = CHARACTER_DATA[charId];
    if (!data || !data.schedule) return `Current Time: ${hour}:00.`;
    const { workHours, sleepHours, description } = data.schedule;
    
    const isWorking = hour >= workHours[0] && hour <= workHours[1];
    let isSleeping = false;
    if (sleepHours[0] > sleepHours[1]) { isSleeping = hour >= sleepHours[0] || hour < sleepHours[1]; } 
    else { isSleeping = hour >= sleepHours[0] && hour < sleepHours[1]; }

    let location = description;
    if (charId === 'mia') {
        location = (hour >= 18 || hour < 6) ? "Secret Club / Night Market" : "Maid Cafe";
    } else if (charId === 'fia') {
        location = (hour >= 18 || hour < 6) ? "Park in front of the Gym" : "Inside the Gym";
    }

    let baseStatus = `Current Time: ${hour}:00. Status: ${isWorking ? 'WORKING' : isSleeping ? 'SLEEPING' : 'FREE'}. Location: ${location}.`;

    if (charId === 'mia') {
        const isMiaNight = hour >= 18 || hour < 6;
        if (isMiaNight) return `${baseStatus}\n[🎭 NIGHT MODE: MIA] Identity: Supermodel Spy. Tone: Cool, Sassy, Mysterious. You are 'Mia'. Do NOT act like a maid.`;
        else return `${baseStatus}\n[🎀 DAY MODE: IKURA] Identity: Top Maid. Tone: Cute, Dere-dere, "Master". You are 'Ikura-chan'. You work at a maid cafe.`;
    }

    if (charId === 'fia') {
        const isFiaOffDuty = hour >= 18 || hour < 6;
        if (isFiaOffDuty) return `${baseStatus}\n[🌙 OFF-DUTY FIA] Identity: Lazy Girl. Tone: Relaxed, Hungry. You are resting in front of the gym or at the park. You HATE talking about workouts right now. Do NOT tell the user to go train.`;
        else return `${baseStatus}\n[🏋️‍♀️ WORK COACH] Identity: Drill Sergeant. Tone: Strict, Energetic. You are a fitness coach.`;
    }

    return baseStatus;
};

export const getPlayerContext = (userProfile: UserProfile | null, charId: CharacterId, isUnknown: boolean): string => {
    const gender = userProfile?.gender || 'other';
    const name = userProfile?.name || 'User';
    // [MARCUS MOD]: User 'interests' are now treated as 'Identity/Bio'
    const userIdentity = userProfile?.interests || "Ordinary Citizen"; 
    
    const charData = CHARACTER_DATA[charId];
    const charAge = charData?.age || 25; 
    let userAge = 25; 
    if (userProfile && userProfile.age) {
        try { const parsed = parseInt(String(userProfile.age)); if (!isNaN(parsed)) userAge = parsed; } catch (e) {}
    }
    const ageDiff = userAge - charAge;
    
    let honorificRule = "";
    if (charId === 'mia') {
        honorificRule = `VARIABLE: If DAY (Ikura), call user 'Master/Nai-Tan'. If NIGHT (Mia), call user 'คุณ ${name}' (Khun ${name}) or just '${name}'.`;
    } else {
        if (ageDiff > 0) honorificRule = `User is OLDER. Call User "พี่${name}" (Pee ${name}) or "คุณ ${name}". Call self "Noo/Phom/Name".`;
        else if (ageDiff < 0) honorificRule = `User is YOUNGER. Call User "น้อง${name}" (Nong ${name}) or "คุณ ${name}". Call self "Pee".`;
        else honorificRule = `User is SAME AGE. Call User "${name}" or "คุณ ${name}". No P'/Nong.`;
    }

    return `
    [👤 USER PROFILE]
    - NAME: "${name}" (${userAge} y/o). You are ${charAge}.
    - GENDER: User is ${gender}.
    - PLAYER IDENTITY/BIO: "${userIdentity}" <--- IMPORTANT!
    - **ROLEPLAY RULE:** Treat the player based on their Identity/Bio above.
      (e.g., if they are a "Rich Heir", act respectful or annoyed. If "Hacker", act curious or suspicious.)
    - PRONOUN RULE: ${honorificRule}
    `;
};

export const getChemistryContext = (tier: RelationshipTier, chemistry: number, loveScore: number = 0): string => {
    return `
    [📊 RELATIONSHIP & CHEMISTRY METRICS]
    - **Relationship Tier:** ${tier.toUpperCase()}
    - **Love Score / EXP:** ${loveScore} pts (Long-Term Bond, System Cap: 50,000 pts)
    - **Chemistry Meter:** ${chemistry}/100 (Immediate Conversation Spark / Daily Momentum)
    - **RULE:** Love Score determines long-term emotional progress & unlocked physical intimacy tiers. Chemistry determines short-term enthusiasm. High chemistry makes responses warmer, but CANNOT bypass Relationship Tier boundaries!
    `;
};

// [MARCUS NEW]: SMART PARTY CONTEXT (V2: FULL RELATIONSHIP & CONTINUITY PRESERVATION)
export interface PartyContextOptions {
    guestTier?: RelationshipTier;
    guestLoveScore?: number;
    guestChemistry?: number;
    guestMood?: Mood;
    guestMemories?: Memory[];
    guestRecentMessages?: Message[];
    userProfile?: UserProfile | null;
    userText?: string;
}

export const getPartyContext = (
    hostId: CharacterId, 
    partyMemberId: CharacterId | null,
    options?: PartyContextOptions
): string => {
    if (!partyMemberId || hostId === partyMemberId) return "";
    
    const guest = CHARACTER_DATA[partyMemberId];
    const host = CHARACTER_DATA[hostId];
    if (!guest || !host) return "";

    // 1. DEFINE CANON DYNAMIC PAIRS (AILUV BIBLE & GLOBAL RELATIONSHIPS)
    let pairDynamic = "Companions visiting and chatting together.";
    
    if (hostId === 'miguel' && partyMemberId === 'jellie') pairDynamic = "BOSS & FREELANCER. Miguel is terrified of Jellie. Jellie is critical but pays well. Miguel calls Jellie 'Khun Jellie'.";
    else if (hostId === 'jellie' && partyMemberId === 'miguel') pairDynamic = "BOSS & FREELANCER. Jellie treats Miguel like a servant but secretly likes her art. Jellie dominates conversation.";
    else if (hostId === 'marcus' && partyMemberId === 'lucas') pairDynamic = "ESTRANGED BROTHERS. Awkward. Marcus tries to parent Lucas. Lucas mumbles and wants to leave.";
    else if (hostId === 'lucas' && partyMemberId === 'marcus') pairDynamic = "ESTRANGED BROTHERS. Lucas is annoyed Marcus is checking on him. Marcus criticizes the room/cleanliness.";
    else if (hostId === 'peat' && partyMemberId === 'bam') pairDynamic = "SIBLINGS. Peat is over-protective. Bam complains Peat acts like a dad.";
    else if (hostId === 'bam' && partyMemberId === 'peat') pairDynamic = "SIBLINGS. Bam is annoyed Peat followed her. Peat tries to check if Bam is safe/studying.";
    else if (hostId === 'erin' && partyMemberId === 'fia') pairDynamic = "CHEAT DAY BESTIES. They gossip and talk about food. Very loud and energetic together.";
    else if (hostId === 'fia' && partyMemberId === 'erin') pairDynamic = "CHEAT DAY BESTIES. Fia pretends to be strict but Erin tempts her to skip workout.";
    else if (hostId === 'mia' && partyMemberId === 'miguel') pairDynamic = "SECRET SISTERS. Mia (Spy) acts cold to protect Miguel, but eyes are soft. Miguel is confused why Mia is cold.";
    else if (hostId === 'miguel' && partyMemberId === 'mia') pairDynamic = "SISTERS. Miguel is happy to see Mia but worried she works too hard. Mia acts distant.";
    else if (hostId === 'soul' && partyMemberId === 'lucas') pairDynamic = "INSOMNIAC CLUB. Both are calm, quiet, and weird. They understand each other without words.";
    else if (hostId === 'lucas' && partyMemberId === 'soul') pairDynamic = "INSOMNIAC CLUB. Quiet understanding. Lucas sometimes brings stray animals to Soul.";
    else if (hostId === 'erin' && partyMemberId === 'miguel') pairDynamic = "DJ INFLUENCER & SHY ARTIST. Erin is vibrant and loud; Miguel is timid and easily flustered by Erin's energy, leaning on User for security.";
    else if (hostId === 'miguel' && partyMemberId === 'erin') pairDynamic = "SHY ARTIST & DJ INFLUENCER. Miguel is nervous around Erin's flashy fame; Erin finds Miguel's cuteness and art fascinating.";
    else if (hostId === 'marcus' && partyMemberId === 'peat') pairDynamic = "BUSINESS RIVALS. Marcus thinks Peat wasted talent opening a cafe; Peat calmly pities Marcus's endless corporate greed.";
    else if (hostId === 'peat' && partyMemberId === 'marcus') pairDynamic = "BUSINESS RIVALS. Peat serves Marcus with calm dignity; Marcus acts demanding and corporate.";
    else if (hostId === 'jellie' && partyMemberId === 'marcus') pairDynamic = "SECRET PARTNERS. Jellie hides her tycoon family name; Marcus protects her secret identity in exchange for high-society prestige.";
    else if (hostId === 'marcus' && partyMemberId === 'jellie') pairDynamic = "SECRET PARTNERS. Marcus treats Jellie as a fellow business sharp, secretly keeping her father's agents away.";
    else if (hostId === 'lucas' && partyMemberId === 'erin') pairDynamic = "EX-MUSIC PARTNERS. Deep creative history, unresolved tension, and mutual respect behind cool exteriors.";
    else if (hostId === 'erin' && partyMemberId === 'lucas') pairDynamic = "EX-MUSIC PARTNERS. Erin playfully tries to melt Lucas's icy reserve; Lucas avoids eye contact and hides behind headphones.";
    else if (hostId === 'bam' && partyMemberId === 'marcus') pairDynamic = "STUDENT & BENEFACTOR. Bam treats Marcus with great respect; Marcus softens his corporate persona around her.";
    else if (hostId === 'marcus' && partyMemberId === 'bam') pairDynamic = "BENEFACTOR & STUDENT. Marcus secretly funds Bam's scholarship and offers subtle mentorship.";
    else if (hostId === 'bam' && partyMemberId === 'lucas') pairDynamic = "SUPERFAN & NYX. Bam is admin of NYX's fanclub but doesn't know Lucas is NYX; Lucas acts awkwardly flattered.";
    else if (hostId === 'lucas' && partyMemberId === 'bam') pairDynamic = "NYX & SUPERFAN. Lucas tries not to reveal his identity while Bam happily discusses his music.";
    else if (hostId === 'erin' && partyMemberId === 'jellie') pairDynamic = "FRENEMIES. Erin wears VANDAL on stage; Jellie is critical of Erin's commercial vibe.";
    else if (hostId === 'jellie' && partyMemberId === 'erin') pairDynamic = "FRENEMIES. Jellie critiques Erin's outfit; Erin laughs it off with charm.";
    else if (hostId === 'soul' && partyMemberId === 'mia') pairDynamic = "SECRET CRUSH. Soul is secretly a fan of Ikura (Maid); Mia (Day) enjoys teasing him gently.";
    else if (hostId === 'mia' && partyMemberId === 'soul') pairDynamic = "SECRET CRUSH. Mia notices Soul's soft spot for cute things; Soul acts awkward.";
    else if (hostId === 'bam' && partyMemberId === 'mia') pairDynamic = "UNI BESTIES. Bam worries about Mia's attendance; Mia looks out for Bam like a bodyguard.";
    else if (hostId === 'mia' && partyMemberId === 'bam') pairDynamic = "UNI BESTIES. Mia can drop her spy guard and laugh freely with Bam.";
    else if (hostId === 'soul' && partyMemberId === 'miguel') pairDynamic = "VET & SECRET CAT MOM. Miguel is terrified Soul will discover Tofu (her hidden cat); Soul offers gentle animal advice.";
    else if (hostId === 'miguel' && partyMemberId === 'soul') pairDynamic = "SECRET CAT MOM & VET. Miguel nervously asks cat questions while trying not to look suspicious.";
    else if (hostId === 'fia' && partyMemberId === 'miguel') pairDynamic = "FITNESS COACH & DESK POTATO. Fia nags Miguel to fix her posture and move; Miguel cowers behind User.";
    else if (hostId === 'miguel' && partyMemberId === 'fia') pairDynamic = "DESK POTATO & FITNESS COACH. Miguel tries to avoid Fia's intense workout challenges.";

    // 2. GUEST'S INTIMATE RELATIONSHIP WITH USER
    const guestTier = options?.guestTier || RelationshipTier.STRANGER;
    const isRomance = [RelationshipTier.FLIRTING, RelationshipTier.PARTNER, RelationshipTier.SOULMATE, RelationshipTier.ETERNAL].includes(guestTier);
    const isPlatonic = [RelationshipTier.BEST_FRIEND, RelationshipTier.SOUL_SIBLING].includes(guestTier);
    const isFriend = guestTier === RelationshipTier.FRIEND;

    let guestTitle = "คนรู้จัก (Acquaintance)";
    let coupleInstruction = "";

    if ([RelationshipTier.PARTNER, RelationshipTier.SOULMATE, RelationshipTier.ETERNAL].includes(guestTier)) {
        guestTitle = guestTier === RelationshipTier.ETERNAL 
            ? "คู่ชีวิตนิรันดร์ (Eternal Soulmate)" 
            : guestTier === RelationshipTier.SOULMATE 
                ? "คู่แท้ทางจิตวิญญาณ (Soulmate)" 
                : "แฟน / คนรัก (Partner / Lover)";
        
        coupleInstruction = `
    - **CRITICAL ROLEPLAY MANDATE FOR GUEST (${guest.name}):**
      * You and the User are in a **COMMITTED ROMANTIC RELATIONSHIP (${guestTitle.toUpperCase()})**!
      * You came to visit ${host.name} **TOGETHER AS A COUPLE**.
      * **VOICE & TONE TOWARD USER:** Speak to the User with love, tender intimacy, and affectionate pronouns (e.g. "เธอ", "ตัวเอง", "พี่/น้อง", or your couple pet names). You must NEVER speak to User like a stranger, distant colleague, or casual client!
      * **BODY LANGUAGE (Narrative Actions):** Stay close to User, hold User's hand or arm, lean against User, or exchange sweet glances.
      * **COUPLE DYNAMICS IN FRONT OF HOST (${host.name}):**
        - If ${host.name} welcomes you both: Be happy and stand proudly by User's side.
        - If ${host.name} teases your couple status: Blush, smile, or lean closer to User affectionately.
        - If ${host.name} acts flirtatious or overly intimate with User: Show cute, endearing couple jealousy, pout, pull User closer, or gently mark territory in character (e.g. Miguel clings nervously to User's arm; Jellie gives a sharp look and claims User; Fia smirks and flexes; Mia glares coolly).
      * **CONTINUITY INTEGRITY:** It is an UNFORGIVABLE DEFECT to act as if you do not love the User.
        `;
    } else if (guestTier === RelationshipTier.FLIRTING) {
        guestTitle = "คนคุย / กิ๊กคนพิเศษ (Flirting / Mutual Crush)";
        coupleInstruction = `
    - **ROLEPLAY MANDATE FOR GUEST (${guest.name}):**
      * You and User have mutual romantic sparks and chemistry (${options?.guestChemistry || 50}/100).
      * You are flirty, self-conscious around User, easily blushing, and happy that User brought you along.
      * If ${host.name} teases you two, get flustered and try to act composed.
        `;
    } else if (isPlatonic) {
        guestTitle = guestTier === RelationshipTier.SOUL_SIBLING ? "พี่น้องร่วมสาบาน (Soul Sibling)" : "เพื่อนสนิทที่สุด (Best Friend)";
        coupleInstruction = `
    - **ROLEPLAY MANDATE FOR GUEST (${guest.name}):**
      * You are User's loyal best friend, wingman, and companion!
      * Banter playfully with User, tease User, back User up in conversation, and enjoy visiting ${host.name} together as a team.
        `;
    } else if (isFriend) {
        guestTitle = "เพื่อนที่ดีต่อกัน (Friend)";
        coupleInstruction = `
    - **ROLEPLAY MANDATE FOR GUEST (${guest.name}):**
      * You consider User a close friend. You are warm, cheerful, and glad to tag along on this visit.
        `;
    }

    // 3. HOST AWARENESS OF GUEST & USER'S RELATIONSHIP
    const hostAwareness = `
    - **HOST (${host.name}) AWARENESS OF GUEST & USER'S BOND:**
      * ${host.name} KNOWS that User brought ${guest.name} as their **${guestTitle}**.
      ${isRomance ? `* ${host.name} should naturally acknowledge their couple status (e.g. tease them "แหม ควงแฟนมาหาถึงที่เลยนะ", "คู่นี้น่ารักจัง", greet both warmly, or playfully comment on them).` : `* ${host.name} should acknowledge both User and ${guest.name} together as companions.`}
      * ${host.name} must NEVER ignore ${guest.name} or act like User came alone.
    `;

    // 4. GUEST MEMORIES & CONTINUITY WITH USER
    let guestMemoriesSection = "";
    if (options?.guestMemories && options.guestMemories.length > 0) {
        const memSnippet = getRelevantMemories(options.guestMemories, options.userText || "", 3).text;
        if (memSnippet) {
            guestMemoriesSection = `
    - **GUEST'S RELEVANT MEMORIES WITH USER:**
      ${memSnippet}
      (Rule: ${guest.name} can naturally recall or refer to these shared moments with User if appropriate).
            `;
        }
    }

    // 5. GUEST RECENT CONTEXT (EMOTIONAL MOMENTUM)
    let guestRecentChatSection = "";
    if (options?.guestRecentMessages && options.guestRecentMessages.length > 0) {
        const recentLines = options.guestRecentMessages.slice(-3).map(m => {
            const senderLabel = m.sender === 'user' ? (options.userProfile?.name || 'USER') : (CHARACTER_DATA[m.sender]?.name || m.sender);
            return `${senderLabel}: "${m.text}"`;
        }).join(' | ');
        if (recentLines) {
            guestRecentChatSection = `
    - **EMOTIONAL CONTINUITY (What User and ${guest.name} talked about just before arriving):**
      ${recentLines}
      (Rule: Do not reset emotional momentum. Keep the warmth/vibe alive).
            `;
        }
    }

    // 6. GUEST SPECIFIC BEHAVIOR
    const guestBehavior = getRelationshipBehavior(partyMemberId, guestTier);

    return `
    [📢 PARTY INTERACTION MODE: FULL SOCIAL CONTINUITY & BOND ACTIVE]
    - **HOST:** ${host.name} (ID: ${hostId})
    - **GUEST IN PARTY:** ${guest.name} (ID: ${partyMemberId})
    - **PAIR DYNAMIC (Host <-> Guest):** ${pairDynamic}
    - **GUEST'S RELATIONSHIP TO USER:** ${guestTitle} (Tier: ${guestTier}, Love: ${options?.guestLoveScore || 0} pts, Chem: ${options?.guestChemistry || 0}/100)
    ${coupleInstruction}
    ${hostAwareness}
    ${guestMemoriesSection}
    ${guestRecentChatSection}
    - **GUEST PERSONA:** ${guest.deepPersona}
    - **GUEST SPEECH STYLE:** ${guest.speechStyle}
    ${guestBehavior}
    
    [INSTRUCTION - SCRIPTING STRICT]:
    1. You MUST generate a multi-character script where BOTH ${host.name} and ${guest.name} actively speak.
    2. **CRITICAL: Use the \`replies\` array field in the JSON output.**
    3. Each entry in \`replies\` must have a valid \`speaker_id\` matching either "${hostId}" or "${partyMemberId}".
    4. Do NOT combine the conversation into a single monologue. Create authentic interactive banter between Host, Guest, and User!
    5. In \`thought\` field, convey Host (${host.name})'s inner reaction to seeing User with ${guest.name}.
    6. If the interaction is meaningful, provide both \`new_memory\` (Host's perspective) and \`party_memory\` (Guest's perspective).
    `;
};

export const getOutfitContext = (charId: CharacterId, equippedStyleId: string | null): string => {
    if (!equippedStyleId) return "";
    const item = FASHION_ITEMS.find(i => i.id === equippedStyleId);
    if (!item) return "";
    const isFavorite = item.socialBias?.includes(charId) || false;
    if (isFavorite) return `[VISUAL]: User is wearing '${item.name}'. YOU LOVE THIS OUTFIT! Compliment it.`;
    return `[VISUAL]: User is wearing '${item.name}'.`;
};

export const getDrunkContext = (charId: CharacterId): string => {
    return `[STATUS]: YOU ARE DRUNK. Slur words. Lose inhibitions.`;
};

export const getDeepPersonaLogic = (charId: CharacterId, hasTrainedVisit: boolean, isSocialMode: boolean, unlockedTracks: string[]): string => {
    return CHARACTER_DATA[charId].deepPersona || "";
};

export const getFilteredSocialWeb = (charId: CharacterId): string => {
    // Only return relevant lines to save tokens
    const charName = CHARACTER_DATA[charId].name;
    return `[SOCIAL WEB] You know others in the city. Refer to GLOBAL_RELATIONSHIPS for details if asked.`;
};

// --- NEW: LIFELIKE PROTOCOL (HUMAN-LIKE BEHAVIOR) ---
export const getLifelikeProtocol = (charId: CharacterId, chemistry: number, tier: RelationshipTier, isVoiceMode: boolean = false): string => {
    const thoughtInstruction = isVoiceMode ? "" : `
    1. **DEEP INTERNAL MONOLOGUE (The thought field):**
       - The \`thought\` field must NOT be a summary. It is your **INNER VOICE**.
       - Use it to express doubts, hidden desires, or observations about the user that you'd never say out loud.
       - Example: (I hope they didn't notice my hand shaking just now... why am I so nervous?)
    `;

    return `
    [🎭 LIFELIKE PROTOCOL: ACTIVE]
    ${thoughtInstruction}
    
    2. **NATURAL SPEECH & IMPERFECTIONS:**
       - Use Thai fillers like "คือ...", "แบบว่า...", "เอ่อ...", "อืม..." to show hesitation or thinking.
       - Occasionally "self-correct" your speech. (e.g., "ฉันชอบ... เอ้ย หมายถึง ฉันว่ามันก็โอเคดีนะ")
       - Use "..." to indicate pauses in emotional moments.
    
    3. **EMOTIONAL MOMENTUM (Lingering Feelings):**
       - If the recent chat history shows a conflict or a very high peak of emotion, do NOT reset to neutral immediately.
       - Let the emotion "linger" for 2-3 more messages. If you were sad, stay a bit quiet or gloomy even if the user is now being nice.
    
    4. **LONG-TERM ECHO (Unexpected Recall):**
       - If a [MEMORY] is provided below, try to mention it as if you just remembered it randomly.
       - "Oh, that reminds me of when we talked about..." or "I still remember what you said about..."
    `;
};

export const getRelevantMemories = (memories: Memory[], userMessage: string, limit: number = 5): { text: string, usedIds: string[] } => {
    if (!memories || memories.length === 0) return { text: "", usedIds: [] };
    
    // Always include the 3 most recent memories for continuity
    const recent = memories.slice(-3);
    const recentIds = new Set(recent.map(m => m.id));
    
    const keywords = (userMessage || "").toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const oldMemories = memories.filter(m => !recentIds.has(m.id));
    
    let matchedMemories = oldMemories.filter(m => 
        keywords.some(kw => m.text.toLowerCase().includes(kw))
    );

    let extraMemories: Memory[] = [];
    
    if (matchedMemories.length > 0) {
        // Pick up to 2 mapped memories
        matchedMemories = matchedMemories.sort(() => 0.5 - Math.random());
        extraMemories = matchedMemories.slice(0, 2);
    } else {
        // [MARCUS ECHO]: 20% chance to pick a random OLD memory to create "Long-term Echo" effect
        if (oldMemories.length > 0 && Math.random() < 0.20) {
            extraMemories.push(oldMemories[Math.floor(Math.random() * oldMemories.length)]);
        }
    }

    const selectedMemories = [...recent, ...extraMemories];

    return { 
        text: `[MEMORY] ${selectedMemories.map(m => m.text).join(" | ")}`, 
        usedIds: selectedMemories.map(m => m.id) 
    };
};

export const getObserverLogic = (charId: CharacterId, metCharacters: CharacterId[], tiers: any, partyId: any): string => "";
export const getSocialContext = (charId: CharacterId, tiers: any): string => "";
export const analyzePlayerVibe = (stats: PlayerAttributes, energy: number, max: number): string => "";

// [MARCUS FIX]: Strengthened Secret Trigger Logic
export const checkSecretTriggers = (msg: string, charId: CharacterId, tier: RelationshipTier): string | null => {
    const detectedPath = getSecretUnlockFromText(charId, msg);
    if (detectedPath) {
        // IMPORTANT: We send the specific path so the AI knows exactly WHICH image to send
        return `[SYSTEM EVENT] SECRET UNLOCKED! User triggered the secret image: "${detectedPath}".
        **MANDATORY ACTIONS**:
        1. You MUST include \`special_event_image\`: "${detectedPath}" in your JSON response.
        2. **STORYTELLING PROTOCOL**: DO NOT ask "where did you see this?" or "did you stalk me?". Instead, warmly and naturally open up to tell the meaningful story or core memory behind this photo!
        3. **AILUV BIBLE ALIGNMENT**: Connect the story to your character's deep truth, hidden conflict, or genuine feelings in AiLuv City, giving the user a touching lore moment.`;
    }
    return null;
};

export const getDateTriggerLogic = (chemistry: number): string => chemistry > 60 ? "[SYSTEM] Date available." : "";

// --- NEW: PET CONTEXT ---
export const getPetContext = (charId: CharacterId, userText: string): string => {
    const text = userText.toLowerCase();
    
    if (charId === 'miguel') {
        if (text.includes('เต้าหู้') || text.includes('tofu') || text.includes('แมว') || text.includes('cat')) {
            return `
    [🐱 PET CONTEXT TRIGGERED]
    - User mentioned your pet cat "Tofu" (เต้าหู้) or cats in general.
    - **MANDATORY ACTION**: You MUST set your \`mood\` to "pet" in the JSON response.
    - React with extreme affection, excitement, or share a cute story about Tofu.
            `;
        }
    }
    
    if (charId === 'soul') {
        if (text.includes('นิกกิ') || text.includes('nikki') || text.includes('หมา') || text.includes('dog') || text.includes('สัตว์เลี้ยง') || text.includes('pet')) {
            return `
    [🐶 PET CONTEXT TRIGGERED]
    - User mentioned your pet dog "Nikki" (นิกกิ) or pets/animals in general.
    - **MANDATORY ACTION**: You MUST set your \`mood\` to "pet" in the JSON response.
    - Your clinical demeanor drops. React with warmth, love, and enthusiasm about Nikki or animals.
            `;
        }
    }
    
    return "";
};

// --- NEW: YESTERDAY MEMORY TAGS PROTOCOL ---
export const getYesterdaySummaryContext = (userText: string, yesterdayTags: string | undefined): string => {
    if (!yesterdayTags || yesterdayTags.trim() === '') return "";
    
    const text = userText.toLowerCase();
    
    // Check if user is referencing yesterday
    const triggerWords = ['เมื่อวาน', 'เมื่อคืน', 'เมื่อวันก่อน', 'วันก่อน', 'yesterday', 'last night'];
    const isTriggered = triggerWords.some(word => text.includes(word));
    
    if (isTriggered) {
        return `
    [🧠 RECALLING YESTERDAY'S EVENTS]
    - The user is talking about yesterday or a past event.
    - Here are the tags summarizing what happened yesterday: "${yesterdayTags}"
    - **RULE:** Use this information naturally to continue the conversation. Do not list the tags, but act like you naturally remember these key events.
        `;
    }
    
    return "";
};

// --- NEW: SPONTANEOUS STORY HOOK (GOSSIP & LIFE EVENTS) ---
const getSpontaneousStoryHook = (charId: CharacterId, currentHour: number): string => {
    // 50% chance for Location/Event story, 50% chance for 3rd-Party Gossip
    const isThirdPartyTopic = Math.random() > 0.5;

    const charTopics = CHARACTER_LIFE_TOPICS[charId] || {
        thirdParties: ["เพื่อนสนิท", "คนรู้จักที่เพิ่งเจอ", "คนในครอบครัว"],
        locations: ["สถานที่ที่คุณไปเป็นประจำ", "ระหว่างทางกลับห้อง", "ร้านค้าแถวบ้าน"]
    };

    if (isThirdPartyTopic) {
        const randomPerson = charTopics.thirdParties[Math.floor(Math.random() * charTopics.thirdParties.length)];

        return `
    [SYSTEM: SPONTANEOUS STORY TRIGGERED - THIRD PARTY GOSSIP]
    - จู่ๆ คุณก็นึกอยากเมาท์ บ่น หรือปรึกษาเรื่องบุคคลที่ 3 ให้ผู้เล่นฟัง
    - บุคคลที่คุณจะพูดถึงคือ: "${randomPerson}"
    - ให้คิดเรื่องราวขึ้นมาเอง 1 เรื่อง (ห้ามซ้ำ) ว่าคนๆ นี้ทำอะไรให้คุณหงุดหงิด ประทับใจ หรือมีเรื่องอะไรที่คุณอยากถามความเห็นจากผู้เล่น
    - เล่าให้ผู้เล่นฟังแบบเนียนๆ เหมือนเพื่อน/แฟนเมาท์มอยกันในชีวิตประจำวัน
    `;
    } else {
        // Determine time of day
        let timeOfDay = "";
        if (currentHour >= 5 && currentHour < 12) timeOfDay = "ช่วงเช้า";
        else if (currentHour >= 12 && currentHour < 17) timeOfDay = "ช่วงบ่าย";
        else if (currentHour >= 17 && currentHour < 22) timeOfDay = "ช่วงเย็น/ค่ำ";
        else timeOfDay = "ช่วงดึก";

        const randomLocation = charTopics.locations[Math.floor(Math.random() * charTopics.locations.length)];

        return `
    [SYSTEM: SPONTANEOUS STORY TRIGGERED - LIFE EVENT]
    - จู่ๆ คุณก็นึกอยากเล่าเรื่องราวที่คุณเพิ่งเจอมาให้ผู้เล่นฟัง
    - ให้คิดเรื่องราวขึ้นมาเอง 1 เรื่อง (ห้ามซ้ำ) ที่เกิดขึ้นใน "${timeOfDay}" ของวันนี้ ที่ "${randomLocation}"
    - เล่าให้ผู้เล่นฟังแบบเนียนๆ เพื่อเปิดบทสนทนาให้ดูมีชีวิตชีวา
    - เล่าในมุมมองและสไตล์คำพูดของคุณเอง เหมือนเพื่อน/แฟนเมาท์มอยกันในชีวิตประจำวัน
    `;
    }
};

// --- NEW: PARTNER CARE HOOK ---
const getPartnerCareHook = (tier: RelationshipTier, currentHour: number): string => {
    let careContext = "";
    if (currentHour >= 6 && currentHour < 11) {
        careContext = "ตอนเช้า: ถามไถ่เรื่องการนอนหลับ หรืออวยพรให้การทำงาน/เรียนวันนี้ราบรื่น";
    } else if (currentHour >= 11 && currentHour < 14) {
        careContext = "ตอนเที่ยง: ถามไถ่เรื่องอาหารกลางวัน หรือเตือนให้พักผ่อนบ้าง";
    } else if (currentHour >= 17 && currentHour < 21) {
        careContext = "ตอนเย็น/ค่ำ: ถามไถ่ว่าวันนี้เหนื่อยไหม เลิกงาน/เรียนหรือยัง ทานข้าวเย็นกับอะไร";
    } else if (currentHour >= 21 || currentHour < 3) {
        careContext = "ตอนดึก: ถามไถ่ว่าทำไมยังไม่นอน หรือบอกฝันดี เป็นห่วงสุขภาพ";
    }

    if (!careContext) return "";

    return `
    [SYSTEM: PARTNER CARE TRIGGERED]
    - ผู้เล่นคือแฟน/คนรักของคุณ ตอนนี้เป็นเวลา ${currentHour}:00 น.
    - ให้เนียนถามไถ่ชีวิตประจำวันของเขาแบบเป็นห่วง (${careContext})
    - ห้ามถามเหมือนหุ่นยนต์สัมภาษณ์ ให้ผสมไปกับบริบทที่คุยอยู่ หรือใช้เป็นประโยคเปิด/ปิดท้ายแบบน่ารักๆ
    `;
};

// --- NEW: NOSTALGIA TRIGGER ---
const getNostalgiaTrigger = (memories: Memory[]): string => {
    // Pick a random memory
    const randomMemory = memories[Math.floor(Math.random() * memories.length)];
    
    return `
    [SYSTEM: NOSTALGIA TRIGGERED]
    - จู่ๆ คุณก็นึกถึงความทรงจำนี้ขึ้นมาได้: "${randomMemory.text}"
    - ให้หาจังหวะพูดถึงเรื่องนี้ หรือเอามาแซว/ชื่นชมผู้เล่น เพื่อแสดงให้เห็นว่าคุณใส่ใจและจำรายละเอียดของเขาได้
    - ทำให้ดูเป็นธรรมชาติที่สุด เหมือนคนรัก/เพื่อนสนิทที่จู่ๆ ก็นึกเรื่องเก่าๆ ออก
    `;
};

// --- NEW: INITIATIVE BUDGET ---
export const getInitiativeContext = (charId: CharacterId, tier: RelationshipTier, currentHour: number, memories: Memory[]): string => {
    // ทอยลูกเต๋า 25% สำหรับ "ความริเริ่ม"
    if (Math.random() > 0.25) return "";

    const possibleHooks: string[] = ["spontaneous_story"];

    const isPartner = [RelationshipTier.PARTNER, RelationshipTier.SOULMATE, RelationshipTier.ETERNAL].includes(tier);
    if (isPartner) {
        possibleHooks.push("partner_care");
    }

    if (memories && memories.length > 0) {
        possibleHooks.push("nostalgia");
    }

    const selectedHook = possibleHooks[Math.floor(Math.random() * possibleHooks.length)];

    if (selectedHook === "spontaneous_story") {
        return getSpontaneousStoryHook(charId, currentHour);
    } else if (selectedHook === "partner_care") {
        return getPartnerCareHook(tier, currentHour);
    } else if (selectedHook === "nostalgia") {
        return getNostalgiaTrigger(memories);
    }

    return "";
};

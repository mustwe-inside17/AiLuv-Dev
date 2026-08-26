
import { CharacterId, Memory, GameState } from '../types';
import { CHARACTER_DATA } from '../constants';
import { createMemory } from './memorySystem';

// --- DATA STRUCTURES ---

interface DirectorScenario {
    id: string;
    participants: [CharacterId, CharacterId];
    topic: string; // Used for Context Retrieval key
    memoryTemplates: {
        [key in CharacterId]?: string; // The memory text injected into this character
    };
}

// Who hangs out with whom?
const RELATIONSHIP_PAIRS: [CharacterId, CharacterId][] = [
    ['erin', 'fia'],      // Besties (Eating/Gossip)
    ['marcus', 'lucas'],  // Brothers (Awkward checks)
    ['marcus', 'jellie'], // Business Partners (Secret)
    ['peat', 'bam'],      // Siblings (Protective)
    ['miguel', 'jellie'], // Freelancer/Client (Friendly)
    ['lucas', 'soul'],    // Late night vet visits
    ['erin', 'jellie'],   // Frenemies (Fashion/Party)
];

// The Script Database
const SCENARIOS: DirectorScenario[] = [
    // 1. ERIN & FIA (Late Night Eating)
    {
        id: 'erin_fia_mookata',
        participants: ['erin', 'fia'],
        topic: 'Late Night Mookata',
        memoryTemplates: {
            erin: "เมื่อคืนไปกินหมูกระทะกับเฟียร์มา นางบ่นว่าอ้วนแต่กินหมูสามชั้นไปเยอะกว่าฉันอีก! ตลกชะมัด",
            fia: "เมื่อคืนเอรินลากไปกินหมูกระทะ... ฉันหลุดกิน Cheat Meal ไปเยอะมาก รู้สึกผิดชะมัด วันนี้ต้องเบิร์นออก!"
        }
    },
    {
        id: 'erin_fia_gossip',
        participants: ['erin', 'fia'],
        topic: 'Gossip about User',
        memoryTemplates: {
            erin: "เมื่อคืนเม้าท์มอยกับเฟียร์เรื่อง User... เฟียร์บอกว่า User ดูแลตัวเองดีขึ้นนะ แอบปลื้มแหละดูออก",
            fia: "เมื่อคืนคุยกับเอรินเรื่อง User... ยัยนั่นเชียร์ให้ฉันรุกหนักๆ น่ารำคาญจริงๆ (แต่ก็แอบเห็นด้วย)"
        }
    },

    // 2. MARCUS & LUCAS (Brothers)
    {
        id: 'marcus_lucas_checkup',
        participants: ['marcus', 'lucas'],
        topic: 'Awkward Brother Visit',
        memoryTemplates: {
            marcus: "แวะไปหาลูคัสที่ห้องใต้ดินมา สภาพดูไม่ได้เลย เอาแต่แต่งเพลงจนลืมกินข้าว... เป็นห่วงแต่พูดไม่ได้",
            lucas: "พี่มาร์คัสแวะมาหา... เอาอาหารเสริมมาทิ้งไว้แล้วก็บ่นๆๆ แล้วก็กลับ น่ารำคาญแต่ก็... ขอบคุณ"
        }
    },

    // 3. PEAT & BAM (Siblings)
    {
        id: 'peat_bam_scold',
        participants: ['peat', 'bam'],
        topic: 'Scolding about Curfew',
        memoryTemplates: {
            peat: "เมื่อคืนดุแบมไปหน่อยเรื่องกลับบ้านดึก... เป็นห่วงแทบแย่ แต่แบมงอนตุ๊บป่องไปแล้ว",
            bam: "พี่พีทขี้บ่นมาก! แค่กลับดึกนิดเดียวเอง บ่นเหมือนคนแก่เลย ฮึ!"
        }
    },
    {
        id: 'peat_bam_cafe_help',
        participants: ['peat', 'bam'],
        topic: 'Helping at Cafe',
        memoryTemplates: {
            peat: "วันนี้แบมมาช่วยงานที่ร้าน ลูกค้าชมใหญ่เลยว่าน้องสาวน่ารัก ผมล่ะหวงจริงๆ",
            bam: "ไปช่วยงานร้านพี่พีทมา เหนื่อยแต่สนุกดี! ได้ทิปจากลูกค้าด้วยแหละ อิอิ"
        }
    },

    // 4. JELLIE & MARCUS (Secret Deal)
    {
        id: 'jellie_marcus_meeting',
        participants: ['jellie', 'marcus'],
        topic: 'Secret Business Meeting',
        memoryTemplates: {
            jellie: "ไปคุยงานกับลุงมาร์คัสมา... เขาอนุมัติงบโปรเจกต์ใหม่ของ VANDAL แล้ว! ตาถึงเหมือนกันนะเนี่ย",
            marcus: "เจลลี่เอาแผนธุรกิจมาเสนอ... ไอเดียดีจนน่าตกใจ เด็กคนนี้ร้ายกาจกว่าที่คิด"
        }
    },

    // 5. LUCAS & SOUL (Vet Visit)
    {
        id: 'lucas_soul_glitz',
        participants: ['lucas', 'soul'],
        topic: 'Glitz Checkup',
        memoryTemplates: {
            lucas: "พาเจ้า Glitz ไปหาหมอโซลตอนดึก... หมอใจดีมาก ไม่บ่นสักคำที่ไปปลุก",
            soul: "ลูคัสพาแมวมาหาตอนตี 3 อีกแล้ว... เขาดูรักแมวตัวนั้นมากจริงๆ นะ อ่อนโยนผิดคาดเลย"
        }
    },

    // 6. MIGUEL & JELLIE (Work)
    {
        id: 'miguel_jellie_deadline',
        participants: ['miguel', 'jellie'],
        topic: 'Rushing Deadline',
        memoryTemplates: {
            miguel: "เมื่อคืนปั่นงานให้คุณเจลลี่... เธอเร่งงานโหดมาก แต่ก็โอนไวมากเหมือนกัน ยอมใจเลย",
            jellie: "สั่งงานกราฟิกมิเกลไป... งานเริ่ดมาก! สมแล้วที่เลือกมาทำงานให้ VANDAL (แต่ห้ามบอกใครนะ)"
        }
    }
];

// --- CORE LOGIC ---

export const runDailyDirector = (currentMemories: Record<CharacterId, Memory[]>): Record<CharacterId, Memory[]> | null => {
    // [MARCUS FIX]: Removed probability check. Now runs 100% of the time on daily reset.
    // "The Director" is always watching.

    // 1. Pick a random pair from the allowed list
    const pairIndex = Math.floor(Math.random() * RELATIONSHIP_PAIRS.length);
    const [charA, charB] = RELATIONSHIP_PAIRS[pairIndex];

    // 2. Find matching scenarios for this pair
    const possibleScenarios = SCENARIOS.filter(s => 
        (s.participants[0] === charA && s.participants[1] === charB) ||
        (s.participants[0] === charB && s.participants[1] === charA)
    );

    if (possibleScenarios.length === 0) return null;

    // 3. Pick a scenario
    const scenario = possibleScenarios[Math.floor(Math.random() * possibleScenarios.length)];

    // 4. Generate Memories
    console.log(`🎬 [The Director] Action! ${charA} & ${charB} -> ${scenario.topic}`);

    const newMemories = { ...currentMemories };

    // Inject for Char A
    if (scenario.memoryTemplates[charA]) {
        const memA = createMemory(scenario.memoryTemplates[charA]!, 'active'); // 'active' tier lasts 14 days
        // Add a special tag to identify shared memories easily
        memA.text = `[SHARED_EVENT: ${scenario.topic}] ${memA.text}`;
        newMemories[charA] = [...(newMemories[charA] || []), memA];
    }

    // Inject for Char B
    if (scenario.memoryTemplates[charB]) {
        const memB = createMemory(scenario.memoryTemplates[charB]!, 'active');
        memB.text = `[SHARED_EVENT: ${scenario.topic}] ${memB.text}`;
        newMemories[charB] = [...(newMemories[charB] || []), memB];
    }

    return newMemories;
};


import { StoryChapter, CharacterId } from '../types';

// ... (Existing SecretMailScenario interface and SECRET_MAIL_SCENARIOS array - KEEP THEM) ...
export interface SecretMailScenario {
    id: string;
    targetCharId: CharacterId;
    sender: string;
    subject: string;
    body: string;
    choices: [
        {
            label: string;
            style: 'danger' | 'primary' | 'secondary';
            reward: { gold?: number; diamonds?: number; item?: string };
            relationshipChange: number;
            memoryText: string;
            feedback: string;
        },
        {
            label: string;
            style: 'danger' | 'primary' | 'secondary';
            reward: { gold?: number; diamonds?: number; item?: string };
            relationshipChange: number;
            memoryText: string;
            feedback: string;
        }
    ]
}

export const SECRET_MAIL_SCENARIOS: SecretMailScenario[] = [
    {
        id: 'lucas_leak',
        targetCharId: 'lucas',
        sender: 'Unknown Hacker',
        subject: 'ไฟล์เสียงหลุด NYX...',
        body: 'เราแฮ็กเจอไฟล์เสียง Demo ต้นฉบับของเพลง "Midnight City" ในคอมพิวเตอร์ของ Lucas... ถ้าปล่อยไฟล์นี้ ทุกคนจะรู้ว่า Lucas คือ NYX\n\nคุณอยากได้ส่วนแบ่งค่าปิดปากไหม?',
        choices: [
            {
                label: 'เรียกค่าไถ่ (Blackmail)',
                style: 'danger',
                reward: { gold: 5000 },
                relationshipChange: -100,
                memoryText: "[CRITICAL MEMORY] User ร่วมมือกับแฮกเกอร์เพื่อแบล็คเมล์ฉันเรื่องตัวจริงของ NYX ฉันเชื่อใจเขาไม่ได้อีกแล้ว",
                feedback: "ทำไมคุณทำแบบนี้... ผมนึกว่าเราเป็นเพื่อนกันซะอีก..."
            },
            {
                label: 'ลบไฟล์เดี๋ยวนี้ (Protect)',
                style: 'primary',
                reward: { item: 'gift_console' }, // Retro Console
                relationshipChange: 50,
                memoryText: "[CORE MEMORY] User ช่วยปกป้องความลับเรื่อง NYX ของฉันจากแฮกเกอร์ เขาคือคนที่ไว้ใจได้",
                feedback: "ขอบคุณนะครับ... ถ้าไม่ได้คุณ ผมคงแย่แน่ๆ"
            }
        ]
    },
    {
        id: 'fia_cheat_meal',
        targetCharId: 'fia',
        sender: 'Gossip Weekly',
        subject: 'ภาพหลุด! โค้ชดังแอบกินดึก',
        body: 'เห็นโค้ชเฟียร์ที่เข้มงวดเรื่องคุมอาหาร แอบนั่งกินหมูกระทะคนเดียวตอนตี 1! ภาพนี้ขายได้ราคาดีนะ... หรือคุณจะซื้อไว้เอง?',
        choices: [
            {
                label: 'ขายข่าว (Sell Photo)',
                style: 'danger',
                reward: { gold: 3000 },
                relationshipChange: -60,
                memoryText: "[BAD MEMORY] User ขายภาพหลุดตอนฉันกินหมูกระทะให้นักข่าว ฉันอายจนไม่กล้าสู้หน้าใคร",
                feedback: "ฉันไม่อยากเชื่อเลย... เธอทำลายชื่อเสียงฉัน!"
            },
            {
                label: 'ปิดปาก (Pay 500G)',
                style: 'primary',
                reward: { item: 'market_wagyu' }, // A5 Wagyu
                relationshipChange: 40,
                memoryText: "[GOOD MEMORY] User ช่วยปิดข่าวเรื่องฉันหลุดกิน Cheat Meal แถมยังเข้าใจฉันด้วย",
                feedback: "ขอบใจนะ! การกินคือความสุขเดียวของฉันเลย... อย่าบอกใครนะ!"
            }
        ]
    },
    {
        id: 'erin_stalker',
        targetCharId: 'erin',
        sender: 'Stalker_X',
        subject: 'ผมรู้ที่อยู่คอนโดเธอแล้ว...',
        body: 'ผมตามหาที่พักส่วนตัวของ Erin เจอแล้ว! ผมแค่อยากส่งของขวัญ "พิเศษ" ไปให้เธอ... คุณช่วยยืนยันเลขห้องให้หน่อยได้ไหม?',
        choices: [
            {
                label: 'บอกเลขห้อง (Reveal)',
                style: 'danger',
                reward: { diamonds: 50 },
                relationshipChange: -80,
                memoryText: "[CRITICAL MEMORY] User บอกที่อยู่ห้องพักของฉันให้สตอล์กเกอร์รู้ ฉันกลัวมาก",
                feedback: "ทำไมถึงบอกเขา... ฉันกลัวจนนอนไม่หลับเลยนะ!"
            },
            {
                label: 'แจ้งตำรวจ (Report)',
                style: 'primary',
                reward: { item: 'style_neon_tee' }, // Neon Tee
                relationshipChange: 40,
                memoryText: "[CORE MEMORY] User ช่วยแจ้งตำรวจจับสตอล์กเกอร์ให้ฉัน ฉันรู้สึกปลอดภัยเมื่อมีเขา",
                feedback: "ขอบคุณนะที่ช่วย... เธอนี่พึ่งพาได้จริงๆ Love u!"
            }
        ]
    },
    {
        id: 'peat_headhunter',
        targetCharId: 'peat',
        sender: 'Headhunter Agency',
        subject: 'โอกาสกลับสู่สังเวียนธุรกิจ',
        body: 'คุณพีทเคยเป็นนักธุรกิจมือทอง เราต้องการดึงเขากลับมาบริหารเครือยักษ์ใหญ่และปิดร้านกาแฟเล็กๆ นั่นซะ ถ้าคุณช่วยกล่อมเขาได้ เรามีค่านายหน้าให้',
        choices: [
            {
                label: 'กลับไปรวยเถอะ (Persuade)',
                style: 'danger',
                reward: { gold: 10000 },
                relationshipChange: -50,
                memoryText: "[BAD MEMORY] User พยายามกดดันให้ฉันทิ้งร้านกาแฟแล้วกลับไปทำธุรกิจที่ฉันเกลียด",
                feedback: "ผมผิดหวังในตัวคุณนะครับ... ผมนึกว่าคุณจะเข้าใจความสุขของผม"
            },
            {
                label: 'ร้านกาแฟคือความสุข (Support)',
                style: 'primary',
                reward: { item: 'espresso_shot' }, // Espresso
                relationshipChange: 50,
                memoryText: "[GOOD MEMORY] User เข้าใจและสนับสนุนความฝันในการเปิดร้านกาแฟของฉัน",
                feedback: "ขอบคุณที่เข้าใจนะครับ... ร้านกาแฟนี้คือชีวิตใหม่ของผมจริงๆ"
            }
        ]
    },
    {
        id: 'jellie_leak',
        targetCharId: 'jellie',
        sender: 'LUXE Brand',
        subject: 'แบบร่างคอลเลกชันใหม่ VANDAL',
        body: 'เราทราบว่าคุณสนิทกับ Jellie ถ้าคุณแอบถ่ายรูป Sketch งานออกแบบซีซั่นหน้าของ VANDAL มาให้เราได้ เราจ่ายไม่อั้น',
        choices: [
            {
                label: 'ขโมยแบบ (Leak)',
                style: 'danger',
                reward: { gold: 8000 },
                relationshipChange: -100,
                memoryText: "[CRITICAL MEMORY] User ขโมยแบบชุด VANDAL ของฉันไปขายคู่แข่ง! ฉันจะไม่มีวันให้อภัย",
                feedback: "กล้าดียังไง! ออกไปจากชีวิตฉันเดี๋ยวนี้นะ!"
            },
            {
                label: 'ฟ้องเจลลี่ (Warn)',
                style: 'primary',
                reward: { item: 'market_macaron' }, // Macaron
                relationshipChange: 60,
                memoryText: "[CORE MEMORY] User มาเตือนฉันเรื่องคู่แข่งจ้องขโมยงาน เขาซื่อสัตย์กับฉันมาก",
                feedback: "ทำดีมาก! ความซื่อสัตย์คือสิ่งที่ฉันต้องการที่สุด... เอาขนมไปกินซะ"
            }
        ]
    },
    {
        id: 'marcus_spy',
        targetCharId: 'lucas', // Affects Lucas relation primarily via Marcus check
        sender: 'Marcus (Private)',
        subject: 'เรื่องของ Lucas...',
        body: 'ผมรู้ว่าคุณสนิทกับน้องชายผม (Lucas) ผมอยากรู้ว่าวันๆ เขาทำอะไรบ้างนอกจากหมกตัวทำเพลง? ช่วยรายงานความประพฤติเขาให้ผมหน่อย',
        choices: [
            {
                label: 'รายงานทุกอย่าง (Spy)',
                style: 'danger',
                reward: { gold: 5000 },
                relationshipChange: -40, // Lucas Dislikes
                memoryText: "[BAD MEMORY] User คอยรายงานความเคลื่อนไหวของฉันให้พี่มาร์คัสรู้ น่ารำคาญชะมัด",
                feedback: "อย่ามายุ่งกับผม... ไปบอกพี่มาร์คัสว่าผมสบายดี"
            },
            {
                label: 'โกหกช่วย (Cover Up)',
                style: 'primary',
                reward: { item: 'gift_gold' }, // Ang Pao from Marcus anyway? No, maybe better reward. Let's give market beer for Lucas vibe
                relationshipChange: 40,
                memoryText: "[GOOD MEMORY] User ช่วยโกหกพี่มาร์คัสให้ฉัน ทำให้ฉันมีอิสระในการทำเพลงมากขึ้น",
                feedback: "ขอบใจที่ช่วยปิดนะ... พี่มาร์คัสขี้บ่นจะตายไป"
            }
        ]
    },
    {
        id: 'mia_mission',
        targetCharId: 'mia',
        sender: 'The Handler',
        subject: 'ภารกิจรหัสแดง: เป้าหมาย Marcus',
        body: 'สายลับ Mia (Ikura) ต้องการความช่วยเหลือเพื่อเข้าถึงคอมพิวเตอร์ของ Marcus คืนนี้ เราต้องการให้คุณช่วย "ถ่วงเวลา" Marcus ไว้ที่ร้านอาหาร',
        choices: [
            {
                label: 'ไม่ยุ่งเกี่ยว (Ignore)',
                style: 'secondary',
                reward: { gold: 0 },
                relationshipChange: 0,
                memoryText: "[NEUTRAL MEMORY] User ปฏิเสธที่จะช่วยภารกิจของฉัน ทำให้ฉันทำงานลำบากขึ้น",
                feedback: "..."
            },
            {
                label: 'ช่วยถ่วงเวลา (Distract)',
                style: 'primary',
                reward: { item: 'strawberry_cake' }, // Cake
                relationshipChange: 50,
                memoryText: "[CORE MEMORY] User ช่วยถ่วงเวลาเป้าหมายให้ฉัน ทำให้ภารกิจสำเร็จ เขาเป็นพาร์ทเนอร์ที่ดี",
                feedback: "ทำได้ดีมาก... นายท่าน เอ้ย! คุณนี่พึ่งพาได้จริงๆ"
            }
        ]
    },
    {
        id: 'miguel_niti',
        targetCharId: 'miguel',
        sender: 'Juristic Person',
        subject: 'เรื่องร้องเรียน: เสียงแมวห้องมิเกล',
        body: 'มีลูกบ้านแจ้งว่าได้ยินเสียงแมวจากห้องมิเกล (ซึ่งผิดกฎคอนโด) คุณเป็นเพื่อนบ้าน ช่วยยืนยันได้ไหมว่าเธอแอบเลี้ยงสัตว์หรือไม่?',
        choices: [
            {
                label: 'ยืนยัน (Confirm)',
                style: 'danger',
                reward: { gold: 1000 },
                relationshipChange: -80,
                memoryText: "[CRITICAL MEMORY] User แจ้งนิติว่าฉันแอบเลี้ยงเต้าหู้! ฉันเกือบโดนไล่ออกจากคอนโด",
                feedback: "ฮือออ... ทำไมใจร้ายกับเต้าหู้แบบนี้..."
            },
            {
                label: 'โกหกช่วย (Lie)',
                style: 'primary',
                reward: { item: 'cup_noodle' }, // Comfort food
                relationshipChange: 60,
                memoryText: "[CORE MEMORY] User ช่วยโกหกนิติเรื่องเต้าหู้ให้ฉัน เขาปกป้องครอบครัวเล็กๆ ของเรา",
                feedback: "ขอบคุณนะคะ... ถ้าโดนจับได้ มิเกลคงไม่รู้จะไปอยู่ที่ไหน"
            }
        ]
    },
    {
        id: 'soul_rare_pet',
        targetCharId: 'soul',
        sender: 'Deep Web Trader',
        subject: 'ขายสัตว์หายาก...',
        body: 'ผมมี "กิ้งก่าสีรุ้ง" ที่ใกล้สูญพันธุ์หลุดมา หมอโซลน่าจะอยากได้ไปรักษา แต่ผมขายให้คนให้ราคาสูงสุด คุณจะซื้อไปปล่อย หรือซื้อไปให้หมอ?',
        choices: [
            {
                label: 'ซื้อให้หมอ (Buy 2000G)',
                style: 'primary',
                reward: { item: 'market_milk' }, // Milk
                relationshipChange: 80,
                memoryText: "[CORE MEMORY] User ยอมจ่ายเงินซื้อสัตว์หายากมาให้ฉันรักษา จิตใจเขาช่างงดงาม",
                feedback: "คุณจิตใจงดงามมากครับ... ผมสัญญาว่าจะดูแลเขาให้ดีที่สุด"
            },
            {
                label: 'ไม่สนใจ (Ignore)',
                style: 'secondary',
                reward: { gold: 0 },
                relationshipChange: 0,
                memoryText: "",
                feedback: "..."
            }
        ]
    },
    {
        id: 'bam_exam',
        targetCharId: 'bam',
        sender: 'Exam_Master_99',
        subject: 'ข้อสอบ Final พรุ่งนี้! 100%',
        body: 'มีไฟล์ข้อสอบหลุดของวิชาที่น้องแบมกำลังจะสอบตก... ถ้าคุณซื้อให้น้อง น้องรอดแน่ สนใจไหม?',
        choices: [
            {
                label: 'ซื้อโพย (Cheat Sheet)',
                style: 'secondary',
                reward: { gold: 0 },
                relationshipChange: 0, // No love gain for cheating
                memoryText: "[BAD MEMORY] User ซื้อข้อสอบให้ฉัน... ฉันสอบผ่านแต่รู้สึกผิดและภูมิใจในตัวเองน้อยลง",
                feedback: "สอบผ่านก็จริง... แต่แบมรู้สึกไม่ภูมิใจเลยค่ะ..."
            },
            {
                label: 'ชวนติว (Tutor)',
                style: 'primary',
                reward: { item: 'honey_lemon' }, // Brain food
                relationshipChange: 50,
                memoryText: "[GOOD MEMORY] User ชวนฉันติวหนังสือแทนที่จะโกง ทำให้ฉันมั่นใจในความสามารถตัวเอง",
                feedback: "ขอบคุณที่เชื่อในตัวแบมนะคะ! แบมทำได้แล้ว!"
            }
        ]
    }
];

// ... (Rest of the file with DAILY_NEWS_POOL, STORY_TITLES, STORY_CHAPTERS remains unchanged)
// [MARCUS NEW]: DAILY NEWS POOL
export interface NewsItem {
    sender: string; // The News Agency Name
    subject: string; // The Headline
    body: string; // The News Content
    category: 'business' | 'gossip' | 'social' | 'weird';
}

export const DAILY_NEWS_POOL: NewsItem[] = [
    // BUSINESS & POLITICS (Marcus/Peat/Jellie)
    {
        sender: 'AiLuv Business Daily',
        subject: '📈 หุ้น Wongwattana Corp พุ่งทะยาน!',
        body: 'ดัชนีตลาดหุ้นเช้านี้กลุ่ม Wongwattana Group ปรับตัวขึ้นสูงสุดในรอบปี หลังมีข่าวลือหนาหูว่า CEO หนุ่มไฟแรง "มาร์คัส" เตรียมปิดดีลลับระดับหมื่นล้านกับพาร์ทเนอร์ต่างชาติที่ไม่เปิดเผยนาม\n\nนักวิเคราะห์คาดการณ์ว่านี่อาจจะเป็นการผูกขาดวงการอสังหาฯ ครั้งใหม่ของเมือง AiLuv หรือเขาจะเบนเข็มไปจับธุรกิจแฟชั่นกันแน่? ต้องจับตามอง!',
        category: 'business'
    },
    {
        sender: 'The City Observer',
        subject: '❓ ลือหึ่ง! ลูกสาวเจ้าสัวตระกูลดังหายตัวไป',
        body: 'แหล่งข่าววงในรายงานว่า ลูกสาวคนเล็กของตระกูลมหาเศรษฐีคู่แข่ง Wongwattana ได้หายตัวออกจากคฤหาสน์หรูไปกว่า 3 ปีแล้ว โดยทางครอบครัวปิดข่าวเงียบกริบ\n\nล่าสุดมีพลเมืองดีแจ้งเบาะแสว่า พบเห็นหญิงสาวหน้าตาคล้ายกันทำงานอยู่ในวงการแฟชั่นสตรีทแวร์... หรือคุณหนูไฮโซจะผันตัวมาเป็นเด็กแนว?',
        category: 'business'
    },
    {
        sender: 'Fashion Focus',
        subject: '👗 จับตา VANDAL แบรนด์ใหม่มาแรง',
        body: 'แบรนด์สตรีทแวร์น้องใหม่ "VANDAL" กำลังเป็นที่จับตามองในหมู่วัยรุ่นทั่วเมือง ด้วยดีไซน์ที่ฉีกกฎและราคาที่เข้าถึงยาก!\n\nแต่หลายคนตั้งข้อสงสัย... ดีไซเนอร์หน้าใหม่อายุน้อยคนนี้ เอาเงินทุนมหาศาลมาจากไหนในการเปิดช็อปใจกลางห้างดัง? หรือจะมี "เสี่ย" หรือ "ป๋า" คอยหนุนหลังอยู่เบื้องหลังความสำเร็จนี้?',
        category: 'business'
    },
    {
        sender: 'Coffee Talk Magazine',
        subject: '☕ อดีต CEO มือทอง ผันตัวเปิดคาเฟ่?',
        body: 'ช็อกวงการธุรกิจ! มีคนจำได้ว่าเจ้าของร้านกาแฟชื่อดังย่านใจกลางเมือง หน้าตาคล้ายกับอดีตผู้บริหารระดับสูงที่ลาออกสายฟ้าแลบเมื่อปีก่อน\n\nอะไรทำให้เขาทิ้งเงินเดือนหลักล้านมาดริปกาแฟ? แหล่งข่าวบอกว่าเขา "เบื่อความจอมปลอม" แต่บางคนก็ลือว่าเขาหนี "ความผิดพลาดในอดีต" มา...',
        category: 'business'
    },
    {
        sender: 'AiLuv Property News',
        subject: '🏢 โครงการตึกใหม่ถูกระงับปริศนา',
        body: 'โครงการตึกระฟ้าแห่งใหม่ในย่านการค้าถูกสั่งระงับก่อสร้างชั่วคราวโดยไม่มีสาเหตุ!\n\nชาวบ้านละแวกนั้นลือว่าได้ยิน "เสียงดนตรี" ดังกระหึ่มมาจากชั้นใต้ดินที่ยังสร้างไม่เสร็จทุกคืน ทั้งที่ไม่มีคนงานอยู่... หรือจะมีใครแอบเข้าไปใช้พื้นที่เป็นสตูดิโอลับ?',
        category: 'business'
    },

    // GOSSIP & ENTERTAINMENT (Erin/Fia/Lucas/Mia)
    {
        sender: 'Gossip X',
        subject: '🎭 เจาะลึก NYX โปรดิวเซอร์ไร้หน้า',
        body: 'ศิลปินปริศนา "NYX" ปล่อยเพลงใหม่ยอดวิวถล่มทลายอีกแล้ว! แต่จนถึงป่านนี้ก็ยังไม่มีใครเคยเห็นหน้าเขา...\n\nแฟนคลับตาดีบางคนอ้างว่าเห็นเขาเดินเข้าออกตึก Wongwattana ตอนตี 3 บ่อยๆ หรือว่าเขาจะเป็นเด็กเส้นของท่านประธาน? หรือจริงๆ แล้วเขาคือคนในตระกูลนั้นกันแน่?',
        category: 'gossip'
    },
    {
        sender: 'Paparazzi Live',
        subject: '📸 แชะภาพหลุด! ดีเจ Erin กินดึก?',
        body: 'ใครว่าตัวแม่ไม่กินแป้ง! ปาปารัสซี่มือไวจับภาพ DJ Erin แอบย่องไปกินหมูกระทะตอนตี 2 หลังเลิกงาน!\n\nแถมคนที่นั่งตรงข้ามดูเหมือนจะเป็น... โค้ชฟิตเนสชื่อดังซะด้วย? หรือว่าสองคนนี้จะเป็น "คู่หูตะลุยกิน" ในตำนาน?',
        category: 'gossip'
    },
    {
        sender: 'Maid Weekly',
        subject: '🎀 Ikura-chan หายตัวปริศนา?',
        body: 'เมดอันดับ 1 แห่ง AiMaid Cafe "น้องอิคุระ" มักจะหายตัวไปอย่างรวดเร็วหลังเลิกงาน ชนิดที่ว่าแฟนคลับตามไม่ทัน!\n\nไม่มีใครรู้ว่าเธอพักที่ไหน หรือจริงๆ แล้วเธอมีอาชีพอื่นซ่อนอยู่? บางคนบอกว่าเห็นเธอเดินเข้าโรงแรมหรูในชุดราตรี... หรือเธอจะมีเสี่ยเลี้ยง?',
        category: 'gossip'
    },
    {
        sender: 'City Secrets',
        subject: '👀 ภาพหลุด! นายแบบหน้าคล้าย CEO มาร์คัส?',
        body: 'ชาวเน็ตแห่แชร์ภาพหนุ่มเซอร์ผมยาว หน้าตาดี เดินออกจากร้านสะดวกซื้อ... ชาวเน็ตเทียบชัดๆ แล้วว่าหน้าตาเหมือน CEO มาร์คัส ราวกับแกะ!\n\nต่างกันแค่การแต่งตัวที่เซอร์สุดๆ หรือท่านประธานจะมีฝาแฝดที่พลัดพราก? หรือแค่หน้าเหมือนเฉยๆ?',
        category: 'gossip'
    },
    {
        sender: 'NYX Fan Club',
        subject: '📢 รวมตัวประท้วง! เราต้องการเห็นหน้า NYX',
        body: 'กลุ่มแฟนคลับเตรียมรวมตัวหน้าตึกค่ายเพลง เรียกร้องให้ NYX เปิดเผยตัวตนอย่างเป็นทางการ!\n\nแกนนำกลุ่มกล่าวว่า "เรารักเพลงของคุณ แต่เราอยากรู้ว่าคุณมีตัวตนจริงๆ หรือไม่! หรือคุณเป็นแค่ AI ที่ค่ายเพลงสร้างขึ้นมาหลอกพวกเรา!"',
        category: 'gossip'
    },

    // SOCIETY & CRIME (Miguel/Bam/Soul)
    {
        sender: 'Condo Management',
        subject: '⚠️ ประกาศ: กวาดล้างสัตว์เลี้ยงแอบเลี้ยง',
        body: 'เรียนลูกบ้านคอนโด The Cloud ทุกท่าน,\n\nเนื่องจากมีการร้องเรียนเรื่องเสียงและกลิ่น ทางนิติบุคคลจะทำการ "สุ่มตรวจ" ห้องพักทุกห้องในสัปดาห์นี้ เพื่อหาสัตว์เลี้ยงผิดกฎ หากพบเห็นจะดำเนินการตามกฎหมายทันทีและเชิญออกภายใน 24 ชม. (โดยเฉพาะแมว!)',
        category: 'social'
    },
    {
        sender: 'Campus News',
        subject: '👙 ระวัง! โจรขโมยชุดชั้นในระบาด',
        body: 'นักศึกษาหอพักหญิงโปรดระวัง! มีคนร้ายโรคจิตแอบปีนระเบียงขโมยชุดชั้นในยามวิกาล...\n\nตำรวจกำลังเร่งล่าตัว คาดว่าเป็นคนในพื้นที่ที่รู้ทางหนีทีไล่เป็นอย่างดี หากใครพบเบาะแสชายสวมฮู้ดดำ โปรดแจ้ง รปภ. ทันที',
        category: 'social'
    },
    {
        sender: 'Local Community',
        subject: '🐶 คลินิกหมอโซล... หรือโรงเรียนสอนภาษา?',
        body: 'ชาวบ้านลือกันหนาหูว่าเห็นคุณหมอโซลนั่งคุยกับหมาแมวเป็นเรื่องเป็นราวในคลินิกตอนดึกๆ...\n\nบางคนสาบานว่าเห็นแมวพยักหน้าตอบรับด้วย! หมอแกเครียดงานเกินไปจนหลอน หรือแกมีสัมผัสพิเศษกันแน่? ใครพาสัตว์ไปรักษาโปรดสังเกตอาการหมอด้วย',
        category: 'social'
    },
    {
        sender: 'Education Foundation',
        subject: '🎓 ทุนการศึกษาปริศนาจาก "ผู้หวังดี"',
        body: 'นักเรียนเกรดดีหลายคนในเมือง ได้รับแจ้งว่าได้รับ "ทุนการศึกษาเต็มจำนวน" จากผู้ไม่ประสงค์ออกนาม...\n\nแหล่งข่าววงในกระซิบว่าเงินโอนมาจากบัญชีส่วนตัวของมหาเศรษฐีใจบุญคนหนึ่ง ที่อยากไถ่บาปในอดีต หรือนี่จะเป็นโครงการ CSR ลับๆ ของบริษัทใหญ่?',
        category: 'social'
    },
    {
        sender: 'Crime Watch',
        subject: '🕵️ พบชายชุดดำด้อมๆ มองๆ แถวห้าง',
        body: 'รปภ. ห้างดังรายงานพบกลุ่มชายใส่สูทดำ ท่าทางมีพิรุธ เดินวนเวียนแถวร้านเสื้อผ้า VANDAL หลายวันติดต่อกัน\n\nพวกเขาไม่ได้มาซื้อของ แต่เหมือนกำลังตามหาใครบางคน... หรือเจ้าของร้านไปกู้เงินนอกระบบมา? โปรดระมัดระวังตัว',
        category: 'social'
    },

    // MYSTERY & WEIRD (Lore)
    {
        sender: 'Ghost Hunter Forum',
        subject: '👻 เสียงปริศนาในท่อระบายน้ำ...',
        body: 'มีคนได้ยินเสียงร้อง "เมี๊ยว" ดังก้องมาจากท่อระบายน้ำใต้ตึก Wongwattana ทั้งคืน... พอเปิดฝาท่อดูดกลับไม่เจออะไรเลย!\n\nชาวบ้านเริ่มลือว่าเป็น "อาถรรพ์แมวปีศาจ" ที่เฝ้าสมบัติอยู่ใต้ตึก หรือจริงๆ แล้วมันคือรหัสลับอะไรบางอย่าง?',
        category: 'weird'
    },
    {
        sender: 'Viral Clip Today',
        subject: '👯‍♀️ คลิปไวรัล: คู่พี่น้องหน้าตาดีทะเลาะกัน?',
        body: 'คลิปหลุดจากกล้องหน้ารถ! จับภาพคู่หนุ่มสาวหน้าตาดี ยืนเถียงกันรุนแรงข้างถนนเรื่อง "ใครเป็นคนกินพุดดิ้งในตู้เย็น"\n\nชาวเน็ตแซวว่า "หน้าตาดีทั้งบ้านเลยแฮะ" อยากรู้จังว่าเป็นลูกเต้าเหล่าใคร ทำไมถึงงานดีขนาดนี้ (ปล. ผู้ชายหน้าเหมือนเจ้าของร้านกาแฟเลย)',
        category: 'weird'
    },
    {
        sender: 'Foodie Guide',
        subject: '🚨 วิกฤต! เมล็ดกาแฟขาดตลาด',
        body: 'คอกาแฟเตรียมทำใจ! ร้านกาแฟทั่วเมืองปั่นป่วน หลังเรือขนส่งเมล็ดกาแฟล็อตใหญ่ติดพายุ\n\nคาดว่าราคาลาเต้จะพุ่งสูงขึ้น 20% ในสัปดาห์หน้า รีบตุนด่วนก่อนของจะขาดตลาด! (ร้าน Cat & Cup ประกาศจำกัดการขายแล้ว)',
        category: 'weird'
    },
    {
        sender: 'Cyber Alert',
        subject: '💔 เตือนภัย: แก๊ง Romance Scam ระบาด',
        body: 'โปรดระวังแอปหาคู่! มิจฉาชีพปลอมโปรไฟล์เป็นหนุ่มหล่อ/สาวสวย หลอกให้รักแล้วโอนไว...\n\nเหยื่อรายล่าสุดสูญเงินไปกว่าแสนบาท! ตำรวจเตือน "อย่าหลงเชื่อคนแปลกหน้าง่ายๆ" และตรวจสอบโปรไฟล์ให้ดีก่อนนัดเจอ',
        category: 'weird'
    },
    {
        sender: 'Weather Station',
        subject: '⛈️ พยากรณ์อากาศ: คืนนี้ฝนถล่มหนัก',
        body: 'กรมอุตุฯ เตือน! คืนนี้จะมีพายุฝนฟ้าคะนองทั่วเมือง AiLuv อุณหภูมิจะลดลงอย่างรวดเร็ว\n\nเตรียมร่มให้พร้อม และระวังรักษาสุขภาพ... อากาศเย็นสบายแบบนี้ เหมาะกับการหาคนมากอดแก้เหงาที่สุดนะจ๊ะ!',
        category: 'weird'
    },
    {
        sender: 'Traffic Radio',
        subject: '🚗 รายงานจราจร: ถนนสายหลักอัมพาต!',
        body: 'ด่วน! กลุ่มผู้ประท้วงการสร้างตึกใหม่ของ Wongwattana Corp. ได้ปิดล้อมสี่แยกใจกลางเมือง ส่งผลให้การจราจรติดขัดอย่างหนัก...\n\nแนะนำให้หลีกเลี่ยงเส้นทาง และใช้รถไฟใต้ดินแทน จนกว่าสถานการณ์จะคลี่คลาย',
        category: 'social'
    },
    {
        sender: 'Lifestyle Today',
        subject: '🧘 เทรนด์ฮิต: "สมาธิในตู้ปลา" กำลังมาแรง',
        body: 'ชาว AiLuv City กำลังฮิตเทรนด์ฟิตเนสแบบใหม่! การเข้าไปนั่งสมาธิในตู้กระจกใส่น้ำขนาดใหญ่ เพื่อตัดขาดจากเสียงรบกวนภายนอก...\n\nผู้เชี่ยวชาญเตือน "ระวังขาดออกซิเจน" แต่ดาราหลายคนก็แห่ทำตามจนคิวจองเต็มยาวไปถึงปีหน้า!',
        category: 'gossip'
    },
    {
        sender: 'Midnight Tales Forum',
        subject: '👻 ตำนานเมือง: ลูกค้าคนที่ตีสาม',
        body: 'พนักงานร้านสะดวกซื้อกะดึกแชร์ประสบการณ์ขนลุก... มักจะมี "ลูกค้าชายใส่สูทเปียกน้ำ" เข้ามาซื้อพุดดิ้งแคชเชียร์ตอนเวลา 03:00 น. ตรง ทุกๆ คืนวันศุกร์\n\nเมื่อหันไปหยิบเงินทอน เขาก็หายไปพร้อมกับพุดดิ้ง! ใครหิวพุดดิ้งดึกๆ ระวังเจอดีนะ',
        category: 'weird'
    },
    {
        sender: 'City Event Board',
        subject: '🎆 เตรียมตัว! เทศกาลดอกไม้ไฟประจำปีคลอง AiLuv',
        body: 'สุดสัปดาห์นี้เตรียมพบกับความอลังการ! เทศกาลพลุประจำปีเมือง AiLuv กำลังจะเริ่มต้นขึ้น คาดว่าจะมีผู้คนกว่าหมื่นคนแห่ไปจับจองพื้นที่ริมแม่น้ำ\n\nโสดเหงาๆ อย่าลืมชวนใครสักคนไปดูพลุด้วยกันนะ อาจจะได้ความทรงจำดีๆ กลับมาก็ได้',
        category: 'social'
    },
    {
        sender: 'Entertainment News',
        subject: '🎤 Wongwattana Records เปิดออดิชั่นใหญ่',
        body: 'โอกาสของคนมีฝันมาถึงแล้ว! ค่ายเพลงยักษ์ใหญ่ประกาศค้นหาเกิร์ลกรุ๊ปวงใหม่ ที่จะมาเป็นรุ่นน้องของโปรดิวเซอร์อัจฉริยะ NYX\n\nคาดว่าจะมีวัยรุ่นหลายพันคนมาแห่สมัคร ใครมีของดีอย่าเก็บไว้ รีบมาโชว์สเต็ปด่วน!',
        category: 'business'
    },
    {
        sender: 'Tech Update',
        subject: '📱 A-Phone Pro Max เปิดตัวแล้ว!',
        body: 'สิ้นสุดการรอคอย! สมาร์ทโฟนรุ่นใหม่ล่าสุดที่เปิดตัวฟีเจอร์ "วิดีโอคอลแบบโฮโลแกรม" ทำเอาสาย Tech ทั่วเมืองคลั่งไคล้\n\nเปิดจองปุ๊บ คิวเต็มปั๊บภายใน 3 นาที! ส่วนราคานั้น... เตรียมขายไตกันได้เลยจ้า',
        category: 'weird'
    },
    {
        sender: 'Animal Lovers Group',
        subject: '🐶 น้ำใจล้นหลาม: อาหารสัตว์บริจาคเต็มคลินิก',
        body: 'หลังจากมีข่าวสัตว์จรจัดบาดเจ็บ ชาวเมือง AiLuv ก็พร้อมใจกันส่งมอบอาหารและยารักษาโรคไปที่คลินิกรักษาสัตว์ของคุณหมอโซลจนล้นคลินิก!\n\nคุณหมอฝากมาขอบคุณทุกคน แต่ตอนนี้ต้องขอระงับการบริจาคชั่วคราวก่อน เพราะไม่มีที่เก็บแล้วคร้าบ',
        category: 'social'
    },
    {
        sender: 'Fashion Forward',
        subject: '✨ ช็อกวงการ! VANDAL x LUXE',
        body: 'ใครจะไปเชื่อ! แบรนด์สตรีทสุดขบถ "VANDAL" ประกาศคอลแลปส์ระดับโลกกับแบรนด์ไฮเอนด์ตัวแม่อย่าง "LUXE"\n\nงานนี้ดีไซเนอร์ Jellie จะรังสรรค์ผลงานออกมาแบบไหน? จะดุดัน หรือจะหรูหรา? แฟนๆ เตรียมวงเงินบัตรเครดิตรอไว้ได้เลย',
        category: 'business'
    },
    {
        sender: 'Foodie Guide',
        subject: '🌶️ คำเตือน! เมนูใหม่ "ข้าวราดแกงลุงโจ"',
        body: 'ท้าให้ลอง! สตรีทฟู้ดเจ้าดังปล่อยเมนูใหม่ "ข้าวแกงนรกแตก" ที่เผ็ดร้อนจนยูทูบเบอร์หลายคนต้องถูกหามส่งโรงพยาบาล!\n\nใครอยากท้าทายกระเพาะตัวเองไปจัดกันได้ แต่เซ็นใบยินยอมรับความเสี่ยงก่อนกินด้วยนะเตง',
        category: 'social'
    },
    {
        sender: 'Local Observatory',
        subject: '🛸 ข่าวด่วน: แสงประหลาดตกหลังเขานอกเมือง',
        body: 'เมื่อคืนเวลาประมาณ 03:45 น. ชาวเมืองโซนชานเมืองหลายคนรายงานว่าเห็น "แสงสีเขียวประหลาด" พุ่งตกลงไปหลังภูเขาด้านทิศเหนือ!\n\nทางการยังไม่ออกมายืนยันว่าเป็นดาวตก หรือขยะอวกาศ... หรือว่าเรากำลังจะมีแขกผู้มาเยือนจากต่างดาว?',
        category: 'weird'
    }
];

export const STORY_TITLES: Record<number, string> = {
    1: "The New Neighbor",
    2: "City of Lights",
    3: "The Hustler",
    4: "Party Animal",
    5: "Fashionista",
    6: "The Connector",
    7: "Secret Hunter",
    8: "Deep Bond",
    9: "Tycoon of AiLuv",
    10: "Living Legend"
};

export const STORY_CHAPTERS: StoryChapter[] = [
    // ... (Existing Chapters - NO CHANGE) ...
    {
        id: 1,
        title: "The New Neighbor",
        subtitle: "Starting Life",
        description: "ยินดีต้อนรับสู่ AiLuv City เริ่มต้นชีวิตใหม่ สำรวจผู้คน และหางานทำเพื่อสร้างฐานะ",
        tasks: [
            { id: 'meet_3', text: "ทำความรู้จักเพื่อนใหม่ (Met 3 People)", type: 'met_count', target: 3 },
            { id: 'work_5', text: "ทำงาน 5 ครั้ง (Total Work: 5)", type: 'work_count', target: 5 },
            { id: 'gym_5', text: "ออกกำลังกาย 5 ครั้ง (Total Gym: 5)", type: 'gym_count', target: 5 },
        ],
        rewards: { gold: 0, exp: 0, diamonds: 100, item: 'cup_noodle', title: "The New Neighbor" }
    },
    // ... (Other chapters remain the same) ...
    {
        id: 2,
        title: "City of Lights",
        subtitle: "Night Life & Style",
        description: "ชีวิตกลางคืนเริ่มขึ้นแล้ว ออกไปค้นหาความลับและดูแลตัวเอง",
        tasks: [
            { id: 'earn_5000', text: "หาเงินรวม 5,000 G (Total Earned)", type: 'earn_gold', target: 5000 },
            { id: 'make_friend', text: "เลื่อนสถานะเป็น 'Friend' กับใครก็ได้ 1 คน", type: 'friend_count', target: 1 },
            { id: 'reach_lvl5', text: "Level Up to 5", type: 'level', target: 5 }
        ],
        rewards: { gold: 1000, exp: 0, diamonds: 100, title: "City of Lights" }
    },
    {
        id: 3,
        title: "The Hustler",
        subtitle: "Work Hard, Play Hard",
        description: "ทำงานหนักเพื่ออนาคต และขยายวงสังคม",
        tasks: [
            { id: 'work_20', text: "ทำงานครบ 20 ครั้ง", type: 'work_count', target: 20 },
            { id: 'friend_3', text: "มีเพื่อนสนิท (Friend) 3 คน", type: 'friend_count', target: 3 },
            { id: 'unlock_skill', text: "ปลดล็อก Skill อย่างน้อย 1 อัน", type: 'skill_count', target: 1 }
        ],
        rewards: { gold: 1000, exp: 0, diamonds: 100, title: "The Hustler" }
    },
    {
        id: 4,
        title: "Party Animal",
        subtitle: "Let's Celebrate",
        description: "ใช้ชีวิตให้สุดเหวี่ยงในงานปาร์ตี้",
        tasks: [
            { id: 'invite_party', text: "ชวน NPC เข้าปาร์ตี้ (Invite Party) 1 ครั้ง", type: 'invite_party_count', target: 1 },
            { id: 'spend_market', text: "ใช้จ่ายใน Night Market ครบ 2,000 G (Spend Gold)", type: 'spend_gold', target: 2000 },
            { id: 'friend_5', text: "มีเพื่อนสนิท (Friend) 5 คน", type: 'friend_count', target: 5 }
        ],
        rewards: { gold: 0, exp: 0, diamonds: 100, item: 'style_neon_tee', title: "Party Animal" }
    },
    {
        id: 5,
        title: "Fashionista",
        subtitle: "Dress to Impress",
        description: "เป็นผู้นำเทรนด์แฟชั่นแห่งเมือง AiLuv",
        tasks: [
            { id: 'own_4_styles', text: "ครอบครองเสื้อผ้า 4 ชิ้น (รวมที่ใส่)", type: 'style_count', target: 4 },
            { id: 'reach_lvl15', text: "Level Up to 15", type: 'level', target: 15 }
        ],
        rewards: { gold: 0, exp: 0, diamonds: 300, item: 'gift_flowers', title: "Fashionista" }
    },
    {
        id: 6,
        title: "The Connector",
        subtitle: "Know Everyone",
        description: "คุณคือผู้กว้างขวางที่ใครๆ ก็รู้จัก",
        tasks: [
            { id: 'meet_all', text: "รู้จัก NPC ครบทุกคน (8/8)", type: 'met_count', target: 8 },
            { id: 'flirting_1', text: "มีความสัมพันธ์ระดับ 'Flirting' (คนคุย) 1 คน", type: 'flirting_count', target: 1 },
            { id: 'reach_lvl20', text: "Level Up to 20", type: 'level', target: 20 }
        ],
        rewards: { gold: 0, exp: 0, diamonds: 100, item: 'gadget_pods', title: "The Connector" }
    },
    {
        id: 7,
        title: "Secret Hunter",
        subtitle: "Uncover the Truth",
        description: "ค้นหาความลับที่ซ่อนอยู่ของชาวเมือง",
        tasks: [
            { id: 'unlock_3_secrets', text: "ปลดล็อก 'Secret Photo' 3 ใบ", type: 'secret_count', target: 3 },
            { id: 'buy_3_tracks', text: "ซื้อเพลงใน The Basement อย่างน้อย 3 เพลง", type: 'track_count', target: 3 }
        ],
        rewards: { gold: 0, exp: 0, diamonds: 300, title: "Secret Hunter" }
    },
    {
        id: 8,
        title: "Deep Bond",
        subtitle: "True Love",
        description: "ความสัมพันธ์พัฒนาสู่ระดับสูงสุด",
        tasks: [
            { id: 'partner_1', text: "มีสถานะ 'Partner' (แฟน) 1 คน", type: 'partner_count', target: 1 },
            { id: 'reach_lvl25', text: "Level Up to 25", type: 'level', target: 25 },
            { id: 'unlock_5_secrets', text: "ปลดล็อก 'Secret Photo' 5 ใบ", type: 'secret_count', target: 5 }
        ],
        rewards: { gold: 8000, exp: 0, diamonds: 300, title: "Deep Bond" }
    },
    {
        id: 9,
        title: "Tycoon of AiLuv",
        subtitle: "Wealth & Power",
        description: "มหาเศรษฐีผู้มั่งคั่งที่สุดในเมือง",
        tasks: [
            { id: 'have_100k', text: "มีเงินสะสมในตัว 100,000 G (Current Gold)", type: 'current_gold', target: 100000 },
            { id: 'own_vandal', text: "ครอบครองชุด VANDAL BLACK EDITION", type: 'own_item', target: 1, targetId: 'style_vandal_black' },
            { id: 'reach_lvl30', text: "Level Up to 30", type: 'level', target: 30 }
        ],
        rewards: { gold: 0, exp: 0, diamonds: 500, title: "Tycoon of AiLuv" }
    },
    {
        id: 10,
        title: "Living Legend",
        subtitle: "Completionist",
        description: "ตำนานที่ยังมีลมหายใจ ผู้พิชิตทุกอย่าง",
        tasks: [
            { id: 'stats_30', text: "ค่า Stats ทุกอย่าง (VIT, INT, CHA, LUCK) เกิน 30", type: 'stats_min', target: 30 },
            { id: 'soulmate_1', text: "มีสถานะ 'Soulmate' (ระดับสูงสุด) กับใครก็ได้", type: 'soulmate_count', target: 1 },
            { id: 'all_secrets', text: "ปลดล็อก 'Secret Photo' ของตัวละครทุกอัน (8 ใบ)", type: 'secret_count', target: 8 }
        ],
        rewards: { gold: 0, exp: 0, diamonds: 0, item: 'creator_crown', title: "Living Legend" }
    }
];

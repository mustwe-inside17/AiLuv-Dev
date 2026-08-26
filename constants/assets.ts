
import { Mood, BuffType, CharacterId, MusicTrack, SceneType, SecretDef } from '../types';

// User Avatar (Player)
export const USER_AVATAR = "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4";

// --- VISUAL ASSETS ---

// Location Headers (Firebase Paths)
export const LOCATION_IMAGES = {
  room_day: "locations/room_day.png",
  room_night: "locations/room_night.png",
  office_day: "locations/office_day.png",
  office_night: "locations/office_night.png", 
  gym_day: "locations/gym_day.png",
  gym_night: "locations/gym_night.png",
  shop_day: "locations/shop_day.png",
  shop_night: "locations/shop_night.png",
  // New Map Headers (LARGE FORMAT 2048x2048)
  map_day: "gs://aidol-project.firebasestorage.app/locations/map_large_day.png",
  map_night: "gs://aidol-project.firebasestorage.app/locations/map_large_night.png",
  // New Market Headers
  market_night: "locations/market_night.png", // Market is only open at night
  // Basement Header
  basement_bg: "locations/basement.png", 
  // Bam's Cafe 2F
  cafe_2f_day: "locations/cafe_2f_day.png",
  cafe_2f_night: "locations/cafe_2f_night.png",
  // Miguel's Condo
  condo_day: "locations/condo_day.png",
  condo_night: "locations/condo_night.png",
  // Jellie's Mall
  mall_day: "locations/mall_day.png",
  mall_night: "locations/mall_night.png",
  // Gacha Shop Assets
  gacha_shop: "locations/gacha_shop.png", // Legacy/Fallback
  gacha_header: "ui/gacha_header.png",    // NEW: Top Banner
  gacha_bg: "ui/gacha_bg.png",            // NEW: Background
  gacha_machine: "ui/gacha_machine.png",  // NEW: Center Machine
  // UI Elements
  story_header: "ui/story_header.png",
  diamond_shop_header: "ui/diamond_shop_header.png", // NEW: Diamond Shop Header
  daily_login_bg: "ui/daily_login_bg.png", // NEW: Daily Login Header
  vip_pass_header: "ui/vip_pass_header.png", // NEW: VIP Pass Header
  // Soul's Vet
  vet_day: "locations/vet_day.png",
  vet_night: "locations/vet_night.png",
  // Mia's Maid Cafe / Secret Club
  maid_cafe_day: "locations/maid_cafe_day.png",
  maid_cafe_night: "locations/maid_cafe_night.png"
};

// --- DATE LOCATIONS DATA (MASTER REGISTRY - STRICT LIST) ---
export const DATE_LOCATIONS_DATA: Record<SceneType, { nameEn: string, nameTh: string, desc: string, img: string }> = {
    rooftop_dining: {
        nameEn: "Luxury Rooftop Dining",
        nameTh: "ร้านอาหารหรูบนยอดตึก",
        desc: "Elegant fine dining with a panoramic city view. Romantic and expensive.",
        img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
    },
    car: {
        nameEn: "Private Car Ride",
        nameTh: "นั่งคุยบนรถชิลๆ",
        desc: "Intimate drive through the city at night. Quiet and personal.",
        img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop"
    },
    secret_bar: {
        nameEn: "Secret City View Bar",
        nameTh: "บาร์ลับวิวเมือง",
        desc: "Hidden speakeasy with dim lights and a stunning skyline view.",
        img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"
    },
    character_home: {
        nameEn: "Private Home Date",
        nameTh: "บ้านของตัวละคร",
        desc: "Visiting their personal space. Deeply intimate and cozy.",
        img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2070&auto=format&fit=crop"
    }
};

export const SCENE_BACKGROUNDS: Record<string, string> = Object.entries(DATE_LOCATIONS_DATA).reduce((acc, [key, data]) => {
    acc[key] = data.img;
    return acc;
}, {} as Record<string, string>);

export const SCENE_NAMES_TH: Record<string, string> = Object.entries(DATE_LOCATIONS_DATA).reduce((acc, [key, data]) => {
    acc[key] = data.nameTh;
    return acc;
}, {} as Record<string, string>);

// --- [MARCUS FIX]: CENTRALIZED SECRET REGISTRY ---
// This replaces the old separated SECRET_IMAGES, SECRET_META, and keyword logic.
// Everything is defined here in one place per character.

export const SECRET_REGISTRY: Record<CharacterId, SecretDef[]> = {
    miguel: [
        { id: 'miguel_tofu', path: "characters/miguel/special_tofu.png", caption: "เจ้าก้อนขนนุ่มฟู มิเกลชอบฟัดทั้งวันเลย", keywords: ["cat", "tofu", "แมว", "เต้าหู้", "สัตว์เลี้ยง", "ขอดูรูป", "รูปถ่าย", "ความลับ"] },
        { id: 'miguel_soul', path: "characters/miguel/special_soul.png", caption: "มิเกลไว้ใจที่สุดก็หมอโซลนี่แหละ แถมเต้าหู้ยังได้เจอนิกกิด้วย", keywords: ["vet", "soul", "หมอ", "คลินิก", "รักษาสัตว์"] }
    ],
    fia: [
        { id: 'fia_travel', path: "characters/fia/special_travel.png", caption: "เห็นแบบนี้ เฟียร์ก็มีมุมสวยๆเหมือนกันนะ", keywords: ["travel", "trip", "เที่ยว", "ไปเที่ยว", "สถานที่"] },
        { id: 'fia_offduty', path: "characters/fia/special_offduty.png", caption: "ห้ามพูดเรื่อง สควอทเด็ดขาดนะ ถ้าไม่อยากโดน!", keywords: ["relax", "tired", "พักผ่อน", "เลิกงาน", "ใจดี", "ไม่ดุ", "วันหยุด"] },
        { id: 'fia_swimsuit', path: "characters/fia/special_swimsuit.png", caption: "ชอบมากเลยตอนได้ พักผ่อนและว่ายน้ำที่คอนโดเนี่ย", keywords: ["swim", "pool", "ว่ายน้ำ", "สระ", "ชุดว่ายน้ำ"] }
    ],
    peat: [
        { id: 'peat_barista', path: "characters/peat/special_barista.png", caption: "ผมเบื่อกับการได้รับรางวัลด้านกาแฟแล้วครับ ผมคงเก่งเกินไป", keywords: ["coffee", "brew", "กาแฟ", "ชง", "บาริสต้า", "ร้านกาแฟ"] },
        { id: 'peat_childhood', path: "characters/peat/special_childhood.png", caption: "คนที่ผมรักมากที่สุดในชีวิตหรอ ก็น่าจะสาวน้อยคนนั้น (แบมนั่นแหละ)", keywords: ["kid", "child", "bam", "น้อง", "เด็ก", "หวง", "ตอนเด็ก", "วัยเด็ก"] }
    ],
    erin: [
        { id: 'erin_pajamas', path: "characters/erin/special_pajamas.png", caption: "ชุดอยู่คอนโดหรอ...ก็น่ารักแน่นอนอยู่แล้วละ แบร่!", keywords: ["sleep", "pajama", "ชุดนอน", "ชุดอยู่คอนโด", "หน้าสด", "ไม่แต่งหน้า"] },
        { id: 'erin_fans', path: "characters/erin/special_fans.png", caption: "แฟนคลับเขามาต้อนรับหนักมาก สมัยเดินสายกับลูคัสนะ เดินไปไหนแทบไม่ได้เลยล่ะ", keywords: ["fan", "fc", "แฟนคลับ", "ลูคัส", "คอนเสิร์ต"] },
        { id: 'erin_vandal', path: "characters/erin/special_vandal.png", caption: "แบรนด์แฟชั่นที่ยอมรับมากที่สุด ก็คงเป็น VANDAL นี่แหละ", keywords: ["shop", "buy", "vandal", "ซื้อ", "ช็อป", "เสื้อผ้า", "แฟชั่น"] }
    ],
    marcus: [
        { id: 'marcus_landlord', path: "characters/marcus/special_landlord.png", caption: "ถึงผมจะดุในสายตาเขา แต่ในสายตาผมเขาก็เป็นน้องชายของผมเหมือนเดิม", keywords: ["lucas", "brother", "building", "studio", "ลูคัส", "น้องชาย", "เจ้าของตึก", "สตูดิโอ"] },
        { id: 'marcus_gaming', path: "characters/marcus/special_gaming.png", caption: "การได้เล่นเกมนี่มัน ที่สุดแล้ว...เดี๋ยวค่อยทำงานแล้วกัน", keywords: ["game", "play", "hobby", "เกม", "เล่น", "งานอดิเรก", "พักผ่อน"] }
    ],
    lucas: [
        { id: 'lucas_brother', path: "characters/lucas/special_brother.png", caption: "มาคัสคือพี่ชายผมครับ.. ผมคือคนในตระกูลวงวัฒนา", keywords: ["brother", "marcus", "พี่ชาย", "มาร์คัส"] },
        { id: 'lucas_concert', path: "characters/lucas/special_concert.png", caption: "วันนั้นหรอ..ก็ลองเปิดหน้าให้แฟนๆดูสักครั้งให้หายสงสัย", keywords: ["concert", "show", "reveal", "คอนเสิร์ต", "เวที", "โชว์ตัว", "ออกงาน", "เปิดหน้า"] }
    ],
    bam: [
        { id: 'bam_dream', path: "characters/bam/special_dreamboard.png", caption: "กระดานนี้คือความฝันในอนาคตของแบมเอง น่ารักไหม", keywords: ["dream", "goal", "ฝัน", "เป้าหมาย", "ความฝัน"] },
        { id: 'bam_writing', path: "characters/bam/special_writing.png", caption: "ติวดึกทุกวันเลยนะ อยากจะพิสูจน์ให้คนอื่นเห็นน่ะ", keywords: ["write", "diary", "study", "exam", "เรียน", "ติว", "อ่านหนังสือ"] },
        { id: 'bam_nyx', path: "characters/bam/special_nyx_reveal.png", caption: "NYX คอยอยู่ข้างแบมเสมอในเวลาที่แบมเหนื่อย..", keywords: ["nyx", "idol", "fan", "ไอดอล", "แฟนคลับ"] }
    ],
    jellie: [
        { id: 'jellie_ceo', path: "characters/jellie/special_ceo.png", caption: "จริงๆแล้ว...ฉันคือ 'ประธานบริษัท'", keywords: ["ceo", "boss", "บอส", "ประธาน"] },
        { id: 'jellie_deal', path: "characters/jellie/special_deal.png", caption: "ลุงมาคัสเป็น Partner กับ VANDAL น่ะ เขาเป็นลุงที่ดี", keywords: ["deal", "business", "partner", "ดีล", "ธุรกิจ", "พาร์ทเนอร์", "หุ้นส่วน"] }
    ],
    soul: [
        { id: 'soul_nikki', path: "characters/soul/special_nikki.png", caption: "นิกกิ..เขาก็นั่งแบบนี้ทั้งวัน", keywords: ["nikki", "dog", "หมา", "นิกกี้", "สุนัข"] },
        { id: 'soul_sleep', path: "characters/soul/special_sleep.png", caption: "ผมก็ชอบแอบไปหลับตอนง่วงๆ แต่นิกกิก็ชอบมาปลุก", keywords: ["sleep", "nap", "นอน", "งีบ"] }
    ],
    mia: [
        { id: 'mia_spy', path: "characters/mia/special_spy.png", caption: "บางสิ่งหากรับรู้ไปแล้ว...มันก็อาจไม่มีผลดีเท่าไร", keywords: ["spy", "secret", "mission", "สายลับ", "ความลับ", "ภารกิจ", "สปาย"] },
        { id: 'mia_childhood', path: "characters/mia/special_childhood.png", caption: "แม้เราจะต่างกัน แต่เราก็เป็นพี่น้องที่รักกัน", keywords: ["sister", "miguel", "childhood", "kid", "พี่น้อง", "วัยเด็ก", "เด็ก", "มิเกล", "ตอนเด็ก", "น้องสาว", "พี่สาว"] }
    ]
};

// --- LEGACY ADAPTERS (For Backward Compatibility) ---
// These extract data from the new Registry so old code still works if referenced.

export const SECRET_IMAGES: Record<string, string> = {};
export const SECRET_META: Record<string, string> = {};

Object.values(SECRET_REGISTRY).flat().forEach(secret => {
    SECRET_IMAGES[secret.id] = secret.path; // Map ID to Path
    // Also map short keys manually if needed by old code (optional, but safer to use paths)
    // Here we map PATH -> CAPTION which is what dynamicContext used to do
    SECRET_META[secret.path] = secret.caption;
});

// Add Manual Legacy Keys for specific constants used in older code
// This ensures `SECRET_IMAGES.miguel` still works
const legacyMap: Record<string, string> = {
    'miguel': 'characters/miguel/special_tofu.png',
    'miguel_soul': 'characters/miguel/special_soul.png',
    'fia': 'characters/fia/special_travel.png',
    'fia_offduty': 'characters/fia/special_offduty.png',
    'fia_swimsuit': 'characters/fia/special_swimsuit.png',
    'peat': 'characters/peat/special_barista.png',
    'peat_bam_childhood': 'characters/peat/special_childhood.png',
    'erin': 'characters/erin/special_pajamas.png',
    'erin_fans': 'characters/erin/special_fans.png',
    'erin_vandal': 'characters/erin/special_vandal.png',
    'marcus': 'characters/marcus/special_landlord.png',
    'marcus_gaming': 'characters/marcus/special_gaming.png',
    'lucas': 'characters/lucas/special_brother.png',
    'lucas_concert': 'characters/lucas/special_concert.png',
    'bam': 'characters/bam/special_dreamboard.png',
    'bam_writing': 'characters/bam/special_writing.png',
    'bam_nyx_reveal': 'characters/bam/special_nyx_reveal.png',
    'jellie': 'characters/jellie/special_ceo.png',
    'jellie_marcus_deal': 'characters/jellie/special_deal.png',
    'soul': 'characters/soul/special_nikki.png',
    'soul_sleeping': 'characters/soul/special_sleep.png',
    'mia': 'characters/mia/special_spy.png'
};

// Merge legacy keys into SECRET_IMAGES
Object.assign(SECRET_IMAGES, legacyMap);


// --- PROFILE COVERS (TEMPLATES) ---
export const PROFILE_COVERS = [
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop", // 0: Futuristic City
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop", // 1: Abstract Pink
  "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2832&auto=format&fit=crop", // 2: Dark Vibes
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop", // 3: Event/Stage
  "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2070&auto=format&fit=crop", // 4: Neon City Night
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop", // 5: [FIXED] Colorful Gradient (Replaced Pastel Clouds)
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2070&auto=format&fit=crop", // 6: Soft Beach Sky
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2070&auto=format&fit=crop", // 7: Modern Minimal Interior (Yellow Chair)
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2070&auto=format&fit=crop", // 8: [FIXED] Plant/Shadows (Replaced White Flowers)
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2070&auto=format&fit=crop", // 9: Clean White Desk/Room
];

// ... (Rest of existing file: Character Moods) ...
// 1. Miguel
export const MIGUEL_IMG_BASE = "characters/miguel/neutral.png"; 
export const MIGUEL_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/miguel/neutral.png", "characters/miguel/neutral1.png", "characters/miguel/neutral2.png", "characters/miguel/neutral3.png", "characters/miguel/neutral4.png", "characters/miguel/neutral5.png"],
  [Mood.HAPPY]:     ["characters/miguel/happy.png", "characters/miguel/happy1.png", "characters/miguel/happy2.png", "characters/miguel/happy3.png", "characters/miguel/happy4.png", "characters/miguel/happy5.png"],
  [Mood.SHY]:       ["characters/miguel/shy.png", "characters/miguel/shy1.png", "characters/miguel/shy2.png", "characters/miguel/shy3.png", "characters/miguel/shy4.png", "characters/miguel/shy5.png"],
  [Mood.ANGRY]:     ["characters/miguel/angry.png", "characters/miguel/angry1.png", "characters/miguel/angry2.png", "characters/miguel/angry3.png", "characters/miguel/angry4.png", "characters/miguel/angry5.png"],
  [Mood.FLIRTY]:    ["characters/miguel/flirty.png", "characters/miguel/flirty1.png", "characters/miguel/flirty2.png", "characters/miguel/flirty3.png", "characters/miguel/flirty4.png", "characters/miguel/flirty5.png"],
  [Mood.CONFIDENT]: ["characters/miguel/confident.png", "characters/miguel/confident1.png", "characters/miguel/confident2.png", "characters/miguel/confident3.png", "characters/miguel/confident4.png", "characters/miguel/confident5.png"],
  [Mood.TIRED]:     ["characters/miguel/tired.png", "characters/miguel/tired1.png", "characters/miguel/tired2.png", "characters/miguel/tired3.png", "characters/miguel/tired4.png", "characters/miguel/tired5.png"],
  [Mood.SURPRISED]: ["characters/miguel/surprised.png", "characters/miguel/surprised1.png", "characters/miguel/surprised2.png", "characters/miguel/surprised3.png", "characters/miguel/surprised4.png", "characters/miguel/surprised5.png"],
  [Mood.WORKING]:   ["characters/miguel/working.png", "characters/miguel/working1.png", "characters/miguel/working2.png", "characters/miguel/working3.png", "characters/miguel/working4.png", "characters/miguel/working5.png"],
  // Special Actions
  [Mood.DRINKING]:  ["characters/miguel/special_boba.png", "characters/miguel/special_boba1.png", "characters/miguel/special_boba2.png", "characters/miguel/special_boba3.png", "characters/miguel/special_boba4.png", "characters/miguel/special_boba5.png"],
  [Mood.EATING]:    ["characters/miguel/special_noodle.png", "characters/miguel/special_noodle1.png", "characters/miguel/special_noodle2.png", "characters/miguel/special_noodle3.png", "characters/miguel/special_noodle4.png", "characters/miguel/special_noodle5.png"],
  [Mood.ROMANTIC]:  ["characters/miguel/romantic.png", "characters/miguel/romantic1.png", "characters/miguel/romantic2.png", "characters/miguel/romantic3.png", "characters/miguel/romantic4.png", "characters/miguel/romantic5.png"],
  [Mood.SEXUAL]:    ["characters/miguel/sexual.png", "characters/miguel/sexual1.png", "characters/miguel/sexual2.png", "characters/miguel/sexual3.png", "characters/miguel/sexual4.png", "characters/miguel/sexual5.png"],
  [Mood.DRUNK]:     ["characters/miguel/special_drunk.png", "characters/miguel/special_drunk1.png", "characters/miguel/special_drunk2.png", "characters/miguel/special_drunk3.png", "characters/miguel/special_drunk4.png", "characters/miguel/special_drunk5.png"],
  [Mood.PET]:       ["characters/miguel/pet.png", "characters/miguel/pet1.png", "characters/miguel/pet2.png"],
  [Mood.HOLDING_FLOWERS]: ["characters/miguel/special_flowers.png", "characters/miguel/special_flowers1.png", "characters/miguel/special_flowers2.png", "characters/miguel/special_flowers3.png", "characters/miguel/special_flowers4.png", "characters/miguel/special_flowers5.png"],
};

// 1.1 Miguel Casual (Night Mode)
export const MIGUEL_CASUAL_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/miguelcasual/neutral.png", "characters/miguelcasual/neutral1.png", "characters/miguelcasual/neutral2.png", "characters/miguelcasual/neutral3.png", "characters/miguelcasual/neutral4.png", "characters/miguelcasual/neutral5.png"],
  [Mood.HAPPY]:     ["characters/miguelcasual/happy.png", "characters/miguelcasual/happy1.png", "characters/miguelcasual/happy2.png", "characters/miguelcasual/happy3.png", "characters/miguelcasual/happy4.png", "characters/miguelcasual/happy5.png"],
  [Mood.SHY]:       ["characters/miguelcasual/shy.png", "characters/miguelcasual/shy1.png", "characters/miguelcasual/shy2.png", "characters/miguelcasual/shy3.png", "characters/miguelcasual/shy4.png", "characters/miguelcasual/shy5.png"],
  [Mood.ANGRY]:     ["characters/miguelcasual/angry.png", "characters/miguelcasual/angry1.png", "characters/miguelcasual/angry2.png", "characters/miguelcasual/angry3.png", "characters/miguelcasual/angry4.png", "characters/miguelcasual/angry5.png"],
  [Mood.FLIRTY]:    ["characters/miguelcasual/flirty.png", "characters/miguelcasual/flirty1.png", "characters/miguelcasual/flirty2.png", "characters/miguelcasual/flirty3.png", "characters/miguelcasual/flirty4.png", "characters/miguelcasual/flirty5.png"],
  [Mood.CONFIDENT]: ["characters/miguelcasual/confident.png", "characters/miguelcasual/confident1.png", "characters/miguelcasual/confident2.png", "characters/miguelcasual/confident3.png", "characters/miguelcasual/confident4.png", "characters/miguelcasual/confident5.png"],
  [Mood.TIRED]:     ["characters/miguelcasual/tired.png", "characters/miguelcasual/tired1.png", "characters/miguelcasual/tired2.png", "characters/miguelcasual/tired3.png", "characters/miguelcasual/tired4.png", "characters/miguelcasual/tired5.png"],
  [Mood.SURPRISED]: ["characters/miguelcasual/surprised.png", "characters/miguelcasual/surprised1.png", "characters/miguelcasual/surprised2.png", "characters/miguelcasual/surprised3.png", "characters/miguelcasual/surprised4.png", "characters/miguelcasual/surprised5.png"],
  [Mood.DRINKING]:  ["characters/miguelcasual/special_boba.png", "characters/miguelcasual/special_boba1.png", "characters/miguelcasual/special_boba2.png", "characters/miguelcasual/special_boba3.png"],
  [Mood.EATING]:    ["characters/miguelcasual/special_noodle.png", "characters/miguelcasual/special_noodle1.png", "characters/miguelcasual/special_noodle2.png", "characters/miguelcasual/special_noodle3.png"],
  [Mood.ROMANTIC]:  ["characters/miguelcasual/romantic.png", "characters/miguelcasual/romantic1.png", "characters/miguelcasual/romantic2.png"],
  [Mood.SEXUAL]:    ["characters/miguelcasual/sexual.png", "characters/miguelcasual/sexual1.png", "characters/miguelcasual/sexual2.png"],
  [Mood.DRUNK]:     ["characters/miguelcasual/special_drunk.png", "characters/miguelcasual/special_drunk1.png", "characters/miguelcasual/special_drunk2.png"],
  [Mood.PET]:       ["characters/miguelcasual/pet.png", "characters/miguelcasual/pet1.png"],
  [Mood.HOLDING_FLOWERS]: ["characters/miguelcasual/special_flowers.png", "characters/miguelcasual/special_flowers1.png"],
};

// 2. Coach Fia
export const FIA_IMG_BASE = "characters/fia/neutral.png";
export const FIA_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/fia/neutral.png", "characters/fia/neutral1.png", "characters/fia/neutral2.png", "characters/fia/neutral3.png", "characters/fia/neutral4.png", "characters/fia/neutral5.png"],
  [Mood.HAPPY]:     ["characters/fia/happy.png", "characters/fia/happy1.png", "characters/fia/happy2.png", "characters/fia/happy3.png", "characters/fia/happy4.png", "characters/fia/happy5.png"],
  [Mood.CONFIDENT]: ["characters/fia/confident.png", "characters/fia/confident1.png", "characters/fia/confident2.png", "characters/fia/confident3.png", "characters/fia/confident4.png", "characters/fia/confident5.png"],
  [Mood.ENERGETIC]: ["characters/fia/energetic.png", "characters/fia/energetic1.png", "characters/fia/energetic2.png", "characters/fia/energetic3.png", "characters/fia/energetic4.png", "characters/fia/energetic5.png"],
  [Mood.ANGRY]:     ["characters/fia/angry.png", "characters/fia/angry1.png", "characters/fia/angry2.png", "characters/fia/angry3.png", "characters/fia/angry4.png", "characters/fia/angry5.png"],
  [Mood.SAD]:       ["characters/fia/sad.png", "characters/fia/sad1.png", "characters/fia/sad2.png", "characters/fia/sad3.png", "characters/fia/sad4.png", "characters/fia/sad5.png"],
  [Mood.SURPRISED]: ["characters/fia/surprised.png", "characters/fia/surprised1.png", "characters/fia/surprised2.png", "characters/fia/surprised3.png", "characters/fia/surprised4.png", "characters/fia/surprised5.png"], 
  [Mood.WORKING]:   ["characters/fia/working.png", "characters/fia/working1.png", "characters/fia/working2.png", "characters/fia/working3.png", "characters/fia/working4.png", "characters/fia/working5.png"],
  [Mood.THINKING]:  ["characters/fia/thinking.png", "characters/fia/thinking1.png", "characters/fia/thinking2.png", "characters/fia/thinking3.png", "characters/fia/thinking4.png", "characters/fia/thinking5.png"],
  [Mood.FLIRTY]:    ["characters/fia/flirty.png", "characters/fia/flirty1.png", "characters/fia/flirty2.png", "characters/fia/flirty3.png", "characters/fia/flirty4.png", "characters/fia/flirty5.png"],
  [Mood.DRINKING]:  ["characters/fia/special_boba.png", "characters/fia/special_boba1.png", "characters/fia/special_boba2.png", "characters/fia/special_boba3.png", "characters/fia/special_boba4.png", "characters/fia/special_boba5.png"],
  [Mood.EATING]:    ["characters/fia/special_noodle.png", "characters/fia/special_noodle1.png", "characters/fia/special_noodle2.png", "characters/fia/special_noodle3.png", "characters/fia/special_noodle4.png", "characters/fia/special_noodle5.png"],
  [Mood.ROMANTIC]:  ["characters/fia/romantic.png", "characters/fia/romantic1.png", "characters/fia/romantic2.png", "characters/fia/romantic3.png", "characters/fia/romantic4.png", "characters/fia/romantic5.png"],
  [Mood.SEXUAL]:    ["characters/fia/sexual.png", "characters/fia/sexual1.png", "characters/fia/sexual2.png", "characters/fia/sexual3.png", "characters/fia/sexual4.png", "characters/fia/sexual5.png"],
  [Mood.DRUNK]:     ["characters/fia/special_drunk.png", "characters/fia/special_drunk1.png", "characters/fia/special_drunk2.png", "characters/fia/special_drunk3.png", "characters/fia/special_drunk4.png", "characters/fia/special_drunk5.png"],
  [Mood.HOLDING_FLOWERS]: ["characters/fia/special_flowers.png", "characters/fia/special_flowers1.png", "characters/fia/special_flowers2.png", "characters/fia/special_flowers3.png", "characters/fia/special_flowers4.png", "characters/fia/special_flowers5.png"],
};

// 2.1 Coach Fia (Casual / Off-Duty Mode)
export const FIA_CASUAL_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/fiacasual/neutral.png", "characters/fiacasual/neutral1.png", "characters/fiacasual/neutral2.png", "characters/fiacasual/neutral3.png", "characters/fiacasual/neutral4.png", "characters/fiacasual/neutral5.png", "characters/fiacasual/neutral6.png"],
  [Mood.HAPPY]:     ["characters/fiacasual/happy.png", "characters/fiacasual/happy1.png", "characters/fiacasual/happy2.png", "characters/fiacasual/happy3.png", "characters/fiacasual/happy4.png", "characters/fiacasual/happy5.png", "characters/fiacasual/happy6.png"],
  [Mood.CONFIDENT]: ["characters/fiacasual/confident.png", "characters/fiacasual/confident1.png", "characters/fiacasual/confident2.png", "characters/fiacasual/confident3.png", "characters/fiacasual/confident4.png", "characters/fiacasual/confident5.png", "characters/fiacasual/confident6.png"],
  [Mood.ENERGETIC]: ["characters/fiacasual/energetic.png", "characters/fiacasual/energetic1.png", "characters/fiacasual/energetic2.png", "characters/fiacasual/energetic3.png", "characters/fiacasual/energetic4.png", "characters/fiacasual/energetic5.png", "characters/fiacasual/energetic6.png"],
  [Mood.ANGRY]:     ["characters/fiacasual/angry.png", "characters/fiacasual/angry1.png", "characters/fiacasual/angry2.png", "characters/fiacasual/angry3.png", "characters/fiacasual/angry4.png", "characters/fiacasual/angry5.png", "characters/fiacasual/angry6.png"],
  [Mood.SAD]:       ["characters/fiacasual/sad.png", "characters/fiacasual/sad1.png", "characters/fiacasual/sad2.png", "characters/fiacasual/sad3.png", "characters/fiacasual/sad4.png", "characters/fiacasual/sad5.png", "characters/fiacasual/sad6.png"],
  [Mood.SURPRISED]: ["characters/fiacasual/surprised.png", "characters/fiacasual/surprised1.png", "characters/fiacasual/surprised2.png", "characters/fiacasual/surprised3.png", "characters/fiacasual/surprised4.png", "characters/fiacasual/surprised5.png", "characters/fiacasual/surprised6.png"],
  [Mood.THINKING]:  ["characters/fiacasual/thinking.png", "characters/fiacasual/thinking1.png", "characters/fiacasual/thinking2.png", "characters/fiacasual/thinking3.png", "characters/fiacasual/thinking4.png", "characters/fiacasual/thinking5.png", "characters/fiacasual/thinking6.png"],
  [Mood.FLIRTY]:    ["characters/fiacasual/flirty.png", "characters/fiacasual/flirty1.png", "characters/fiacasual/flirty2.png", "characters/fiacasual/flirty3.png", "characters/fiacasual/flirty4.png", "characters/fiacasual/flirty5.png", "characters/fiacasual/flirty6.png"],
  [Mood.ROMANTIC]:  ["characters/fiacasual/romantic.png", "characters/fiacasual/romantic1.png", "characters/fiacasual/romantic2.png", "characters/fiacasual/romantic3.png", "characters/fiacasual/romantic4.png", "characters/fiacasual/romantic5.png", "characters/fiacasual/romantic6.png"],
  [Mood.SEXUAL]:    ["characters/fiacasual/sexual.png", "characters/fiacasual/sexual1.png", "characters/fiacasual/sexual2.png", "characters/fiacasual/sexual3.png", "characters/fiacasual/sexual4.png", "characters/fiacasual/sexual5.png", "characters/fiacasual/sexual6.png"],
  [Mood.DRUNK]:     ["characters/fiacasual/special_drunk.png", "characters/fiacasual/special_drunk1.png", "characters/fiacasual/special_drunk2.png"],
  [Mood.HOLDING_FLOWERS]: ["characters/fiacasual/special_flowers.png", "characters/fiacasual/special_flowers1.png"],
  [Mood.DRINKING]: ["characters/fiacasual/special_boba.png", "characters/fiacasual/special_boba1.png", "characters/fiacasual/special_boba2.png", "characters/fiacasual/special_boba3.png"],
  [Mood.EATING]: ["characters/fiacasual/special_noodle.png", "characters/fiacasual/special_noodle1.png", "characters/fiacasual/special_noodle2.png", "characters/fiacasual/special_noodle3.png"],
};

// 2.2 Coach Fia (Date Mode: Secret Bar)
export const FIA_SECRET_BAR_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/fia_secret_bar/neutral.png", "characters/fia_secret_bar/neutral1.png", "characters/fia_secret_bar/neutral2.png", "characters/fia_secret_bar/neutral3.png", "characters/fia_secret_bar/neutral4.png", "characters/fia_secret_bar/neutral5.png"],
  [Mood.HAPPY]:     ["characters/fia_secret_bar/happy.png", "characters/fia_secret_bar/happy1.png", "characters/fia_secret_bar/happy2.png", "characters/fia_secret_bar/happy3.png", "characters/fia_secret_bar/happy4.png", "characters/fia_secret_bar/happy5.png"],
  [Mood.FLIRTY]:    ["characters/fia_secret_bar/flirty.png", "characters/fia_secret_bar/flirty1.png", "characters/fia_secret_bar/flirty2.png", "characters/fia_secret_bar/flirty3.png", "characters/fia_secret_bar/flirty4.png", "characters/fia_secret_bar/flirty5.png"],
  [Mood.CONFIDENT]: ["characters/fia_secret_bar/confident.png", "characters/fia_secret_bar/confident1.png", "characters/fia_secret_bar/confident2.png", "characters/fia_secret_bar/confident3.png", "characters/fia_secret_bar/confident4.png", "characters/fia_secret_bar/confident5.png"],
  [Mood.DRUNK]:     ["characters/fia_secret_bar/drunk.png", "characters/fia_secret_bar/drunk1.png", "characters/fia_secret_bar/drunk2.png", "characters/fia_secret_bar/drunk3.png", "characters/fia_secret_bar/drunk4.png", "characters/fia_secret_bar/drunk5.png"],
  [Mood.ROMANTIC]:  ["characters/fia_secret_bar/romantic.png", "characters/fia_secret_bar/romantic1.png", "characters/fia_secret_bar/romantic2.png", "characters/fia_secret_bar/romantic3.png", "characters/fia_secret_bar/romantic4.png", "characters/fia_secret_bar/romantic5.png"],
  [Mood.SEXUAL]:    ["characters/fia_secret_bar/sexual.png", "characters/fia_secret_bar/sexual1.png", "characters/fia_secret_bar/sexual2.png", "characters/fia_secret_bar/sexual3.png", "characters/fia_secret_bar/sexual4.png", "characters/fia_secret_bar/sexual5.png"],
  [Mood.DRINKING]:  ["characters/fia_secret_bar/drinking.png", "characters/fia_secret_bar/drinking1.png", "characters/fia_secret_bar/drinking2.png", "characters/fia_secret_bar/drinking3.png", "characters/fia_secret_bar/drinking4.png", "characters/fia_secret_bar/drinking5.png"],
  [Mood.HOLDING_FLOWERS]: ["characters/fia_secret_bar/special_flowers.png"],
};

// 2.3 Coach Fia (Date Mode: Character Home)
export const FIA_HOME_DATE_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/fia_character_home/neutral.png", "characters/fia_character_home/neutral1.png", "characters/fia_character_home/neutral2.png", "characters/fia_character_home/neutral3.png", "characters/fia_character_home/neutral4.png", "characters/fia_character_home/neutral5.png"],
  [Mood.HAPPY]:     ["characters/fia_character_home/happy.png", "characters/fia_character_home/happy1.png", "characters/fia_character_home/happy2.png", "characters/fia_character_home/happy3.png", "characters/fia_character_home/happy4.png", "characters/fia_character_home/happy5.png"],
  [Mood.FLIRTY]:    ["characters/fia_character_home/flirty.png", "characters/fia_character_home/flirty1.png", "characters/fia_character_home/flirty2.png", "characters/fia_character_home/flirty3.png", "characters/fia_character_home/flirty4.png", "characters/fia_character_home/flirty5.png"],
  [Mood.ROMANTIC]:  ["characters/fia_character_home/romantic.png", "characters/fia_character_home/romantic1.png", "characters/fia_character_home/romantic2.png", "characters/fia_character_home/romantic3.png", "characters/fia_character_home/romantic4.png", "characters/fia_character_home/romantic5.png"],
  [Mood.SEXUAL]:    ["characters/fia_character_home/sexual.png", "characters/fia_character_home/sexual1.png", "characters/fia_character_home/sexual2.png", "characters/fia_character_home/sexual3.png", "characters/fia_character_home/sexual4.png", "characters/fia_character_home/sexual5.png"],
  [Mood.DRUNK]:     ["characters/fia_character_home/drunk.png", "characters/fia_character_home/drunk1.png", "characters/fia_character_home/drunk2.png", "characters/fia_character_home/drunk3.png", "characters/fia_character_home/drunk4.png", "characters/fia_character_home/drunk5.png"],
};

// 3. Peat
export const PEAT_IMG_BASE = "characters/peat/neutral.png";
export const PEAT_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/peat/neutral.png", "characters/peat/neutral1.png", "characters/peat/neutral2.png", "characters/peat/neutral3.png", "characters/peat/neutral4.png", "characters/peat/neutral5.png"],
  [Mood.HAPPY]:     ["characters/peat/happy.png", "characters/peat/happy1.png", "characters/peat/happy2.png", "characters/peat/happy3.png", "characters/peat/happy4.png", "characters/peat/happy5.png"],
  [Mood.SHY]:       ["characters/peat/shy.png", "characters/peat/shy1.png", "characters/peat/shy2.png", "characters/peat/shy3.png", "characters/peat/shy4.png", "characters/peat/shy5.png"],
  [Mood.CONFIDENT]: ["characters/peat/confident.png", "characters/peat/confident1.png", "characters/peat/confident2.png", "characters/peat/confident3.png", "characters/peat/confident4.png", "characters/peat/confident5.png"],
  [Mood.FLIRTY]:    ["characters/peat/flirty.png", "characters/peat/flirty1.png", "characters/peat/flirty2.png", "characters/peat/flirty3.png", "characters/peat/flirty4.png", "characters/peat/flirty5.png"], 
  [Mood.SURPRISED]: ["characters/peat/surprised.png", "characters/peat/surprised1.png", "characters/peat/surprised2.png", "characters/peat/surprised3.png", "characters/peat/surprised4.png", "characters/peat/surprised5.png"],
  [Mood.TIRED]:     ["characters/peat/tired.png", "characters/peat/tired1.png", "characters/peat/tired2.png", "characters/peat/tired3.png", "characters/peat/tired4.png", "characters/peat/tired5.png"],
  [Mood.SHOWING_PHONE]: ["characters/peat/showing_phone.png"],
  [Mood.WORKING]:   ["characters/peat/working.png", "characters/peat/working1.png", "characters/peat/working2.png", "characters/peat/working3.png", "characters/peat/working4.png", "characters/peat/working5.png"],
  [Mood.DRINKING]:  ["characters/peat/special_boba.png", "characters/peat/special_boba1.png", "characters/peat/special_boba2.png", "characters/peat/special_boba3.png", "characters/peat/special_boba4.png", "characters/peat/special_boba5.png"],
  [Mood.EATING]:    ["characters/peat/special_noodle.png", "characters/peat/special_noodle1.png", "characters/peat/special_noodle2.png", "characters/peat/special_noodle3.png", "characters/peat/special_noodle4.png", "characters/peat/special_noodle5.png"],
  [Mood.ROMANTIC]:  ["characters/peat/romantic.png", "characters/peat/romantic1.png", "characters/peat/romantic2.png", "characters/peat/romantic3.png", "characters/peat/romantic4.png", "characters/peat/romantic5.png"],
  [Mood.SEXUAL]:    ["characters/peat/sexual.png", "characters/peat/sexual1.png", "characters/peat/sexual2.png", "characters/peat/sexual3.png", "characters/peat/sexual4.png", "characters/peat/sexual5.png"],
  [Mood.DRUNK]:     ["characters/peat/special_drunk.png", "characters/peat/special_drunk1.png", "characters/peat/special_drunk2.png", "characters/peat/special_drunk3.png", "characters/peat/special_drunk4.png", "characters/peat/special_drunk5.png"],
  [Mood.HOLDING_FLOWERS]: ["characters/peat/special_flowers.png", "characters/peat/special_flowers1.png", "characters/peat/special_flowers2.png", "characters/peat/special_flowers3.png", "characters/peat/special_flowers4.png", "characters/peat/special_flowers5.png"],
};

// 4. Erin
export const ERIN_IMG_BASE = "characters/erin/neutral.png";
export const ERIN_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/erin/neutral.png", "characters/erin/neutral1.png", "characters/erin/neutral2.png", "characters/erin/neutral3.png", "characters/erin/neutral4.png", "characters/erin/neutral5.png"],
  [Mood.HAPPY]:     ["characters/erin/happy.png", "characters/erin/happy1.png", "characters/erin/happy2.png", "characters/erin/happy3.png", "characters/erin/happy4.png", "characters/erin/happy5.png"],
  [Mood.FLIRTY]:    ["characters/erin/flirty.png", "characters/erin/flirty1.png", "characters/erin/flirty2.png", "characters/erin/flirty3.png", "characters/erin/flirty4.png", "characters/erin/flirty5.png"],
  [Mood.SHY]:       ["characters/erin/shy.png", "characters/erin/shy1.png", "characters/erin/shy2.png", "characters/erin/shy3.png", "characters/erin/shy4.png", "characters/erin/shy5.png"],
  [Mood.ANGRY]:     ["characters/erin/angry.png", "characters/erin/angry1.png", "characters/erin/angry2.png", "characters/erin/angry3.png", "characters/erin/angry4.png", "characters/erin/angry5.png"],
  [Mood.CONFIDENT]: ["characters/erin/confident.png", "characters/erin/confident1.png", "characters/erin/confident2.png", "characters/erin/confident3.png", "characters/erin/confident4.png", "characters/erin/confident5.png"],
  [Mood.TIRED]:     ["characters/erin/tired.png", "characters/erin/tired1.png", "characters/erin/tired2.png", "characters/erin/tired3.png", "characters/erin/tired4.png", "characters/erin/tired5.png"],
  [Mood.SAD]:       ["characters/erin/sad.png", "characters/erin/sad1.png", "characters/erin/sad2.png", "characters/erin/sad3.png", "characters/erin/sad4.png", "characters/erin/sad5.png"],
  [Mood.SURPRISED]: ["characters/erin/surprised.png", "characters/erin/surprised1.png", "characters/erin/surprised2.png", "characters/erin/surprised3.png", "characters/erin/surprised4.png", "characters/erin/surprised5.png"],
  [Mood.WORKING]:   ["characters/erin/working.png", "characters/erin/working1.png", "characters/erin/working2.png", "characters/erin/working3.png", "characters/erin/working4.png", "characters/erin/working5.png"],
  [Mood.THINKING]:  ["characters/erin/thinking.png", "characters/erin/thinking1.png", "characters/erin/thinking2.png", "characters/erin/thinking3.png", "characters/erin/thinking4.png", "characters/erin/thinking5.png"],
  [Mood.DRINKING]:  ["characters/erin/special_boba.png", "characters/erin/special_boba1.png", "characters/erin/special_boba2.png", "characters/erin/special_boba3.png", "characters/erin/special_boba4.png", "characters/erin/special_boba5.png"],
  [Mood.EATING]:    ["characters/erin/special_noodle.png", "characters/erin/special_noodle1.png", "characters/erin/special_noodle2.png", "characters/erin/special_noodle3.png", "characters/erin/special_noodle4.png", "characters/erin/special_noodle5.png"],
  [Mood.ROMANTIC]:  ["characters/erin/romantic.png", "characters/erin/romantic1.png", "characters/erin/romantic2.png", "characters/erin/romantic3.png", "characters/erin/romantic4.png", "characters/erin/romantic5.png"],
  [Mood.SEXUAL]:    ["characters/erin/sexual.png", "characters/erin/sexual1.png", "characters/erin/sexual2.png", "characters/erin/sexual3.png", "characters/erin/sexual4.png", "characters/erin/sexual5.png"],
  [Mood.DRUNK]:     ["characters/erin/special_drunk.png", "characters/erin/special_drunk1.png", "characters/erin/special_drunk2.png", "characters/erin/special_drunk3.png", "characters/erin/special_drunk4.png", "characters/erin/special_drunk5.png"],
  [Mood.HOLDING_FLOWERS]: ["characters/erin/special_flowers.png", "characters/erin/special_flowers1.png", "characters/erin/special_flowers2.png", "characters/erin/special_flowers3.png", "characters/erin/special_flowers4.png", "characters/erin/special_flowers5.png"],
};

// 5. Marcus
export const MARCUS_IMG_BASE = "characters/marcus/neutral.png";
export const MARCUS_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/marcus/neutral.png", "characters/marcus/neutral1.png", "characters/marcus/neutral2.png", "characters/marcus/neutral3.png", "characters/marcus/neutral4.png", "characters/marcus/neutral5.png"],
  [Mood.HAPPY]:     ["characters/marcus/happy.png", "characters/marcus/happy1.png", "characters/marcus/happy2.png", "characters/marcus/happy3.png", "characters/marcus/happy4.png", "characters/marcus/happy5.png"],
  [Mood.ANGRY]:     ["characters/marcus/angry.png", "characters/marcus/angry1.png", "characters/marcus/angry2.png", "characters/marcus/angry3.png", "characters/marcus/angry4.png", "characters/marcus/angry5.png"],
  [Mood.SHY]:       ["characters/marcus/shy.png", "characters/marcus/shy1.png", "characters/marcus/shy2.png", "characters/marcus/shy3.png", "characters/marcus/shy4.png", "characters/marcus/shy5.png"],
  [Mood.FLIRTY]:    ["characters/marcus/flirty.png", "characters/marcus/flirty1.png", "characters/marcus/flirty2.png", "characters/marcus/flirty3.png", "characters/marcus/flirty4.png", "characters/marcus/flirty5.png"],
  [Mood.CONFIDENT]: ["characters/marcus/confident.png", "characters/marcus/confident1.png", "characters/marcus/confident2.png", "characters/marcus/confident3.png", "characters/marcus/confident4.png", "characters/marcus/confident5.png"],
  [Mood.SURPRISED]: ["characters/marcus/surprised.png", "characters/marcus/surprised1.png", "characters/marcus/surprised2.png", "characters/marcus/surprised3.png", "characters/marcus/surprised4.png", "characters/marcus/surprised5.png"],
  [Mood.TIRED]:     ["characters/marcus/tired.png", "characters/marcus/tired1.png", "characters/marcus/tired2.png", "characters/marcus/tired3.png", "characters/marcus/tired4.png", "characters/marcus/tired5.png"],
  [Mood.WORKING]:   ["characters/marcus/working.png", "characters/marcus/working1.png", "characters/marcus/working2.png", "characters/marcus/working3.png", "characters/marcus/working4.png", "characters/marcus/working5.png"],
  [Mood.DRINKING]:  ["characters/marcus/special_boba.png", "characters/marcus/special_boba1.png", "characters/marcus/special_boba2.png", "characters/marcus/special_boba3.png", "characters/marcus/special_boba4.png", "characters/marcus/special_boba5.png"],
  [Mood.EATING]:    ["characters/marcus/special_noodle.png", "characters/marcus/special_noodle1.png", "characters/marcus/special_noodle2.png", "characters/marcus/special_noodle3.png", "characters/marcus/special_noodle4.png", "characters/marcus/special_noodle5.png"],
  [Mood.ROMANTIC]:  ["characters/marcus/romantic.png", "characters/marcus/romantic1.png", "characters/marcus/romantic2.png", "characters/marcus/romantic3.png", "characters/marcus/romantic4.png", "characters/marcus/romantic5.png"],
  [Mood.SEXUAL]:    ["characters/marcus/sexual.png", "characters/marcus/sexual1.png", "characters/marcus/sexual2.png", "characters/marcus/sexual3.png", "characters/marcus/sexual4.png", "characters/marcus/sexual5.png"],
  [Mood.DRUNK]:     ["characters/marcus/special_drunk.png", "characters/marcus/special_drunk1.png", "characters/marcus/special_drunk2.png", "characters/marcus/special_drunk3.png", "characters/marcus/special_drunk4.png", "characters/marcus/special_drunk5.png"],
  [Mood.HOLDING_FLOWERS]: ["characters/marcus/special_flowers.png", "characters/marcus/special_flowers1.png", "characters/marcus/special_flowers2.png", "characters/marcus/special_flowers3.png", "characters/marcus/special_flowers4.png", "characters/marcus/special_flowers5.png"],
};

// 6. Lucas
export const LUCAS_IMG_BASE = "characters/lucas/neutral.png";
export const LUCAS_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/lucas/neutral.png", "characters/lucas/neutral1.png", "characters/lucas/neutral2.png", "characters/lucas/neutral3.png", "characters/lucas/neutral4.png", "characters/lucas/neutral5.png"],
  [Mood.HAPPY]:     ["characters/lucas/happy.png", "characters/lucas/happy1.png", "characters/lucas/happy2.png", "characters/lucas/happy3.png", "characters/lucas/happy4.png", "characters/lucas/happy5.png"],
  [Mood.TIRED]:     ["characters/lucas/tired.png", "characters/lucas/tired1.png", "characters/lucas/tired2.png", "characters/lucas/tired3.png", "characters/lucas/tired4.png", "characters/lucas/tired5.png"],
  [Mood.SHY]:       ["characters/lucas/shy.png", "characters/lucas/shy1.png", "characters/lucas/shy2.png", "characters/lucas/shy3.png", "characters/lucas/shy4.png", "characters/lucas/shy5.png"],
  [Mood.ANGRY]:     ["characters/lucas/angry.png", "characters/lucas/angry1.png", "characters/lucas/angry2.png", "characters/lucas/angry3.png", "characters/lucas/angry4.png", "characters/lucas/angry5.png"],
  [Mood.SURPRISED]: ["characters/lucas/surprised.png", "characters/lucas/surprised1.png", "characters/lucas/surprised2.png", "characters/lucas/surprised3.png", "characters/lucas/surprised4.png", "characters/lucas/surprised5.png"],
  [Mood.FLIRTY]:    ["characters/lucas/flirty.png", "characters/lucas/flirty1.png", "characters/lucas/flirty2.png", "characters/lucas/flirty3.png", "characters/lucas/flirty4.png", "characters/lucas/flirty5.png"],
  [Mood.CONFIDENT]: ["characters/lucas/confident.png", "characters/lucas/confident1.png", "characters/lucas/confident2.png", "characters/lucas/confident3.png", "characters/lucas/confident4.png", "characters/lucas/confident5.png"],
  [Mood.WORKING]:   ["characters/lucas/working.png", "characters/lucas/working1.png", "characters/lucas/working2.png", "characters/lucas/working3.png", "characters/lucas/working4.png", "characters/lucas/working5.png"],
  // NEW MOODS
  [Mood.SPOOKY]:    ["characters/lucas/spooky.png", "characters/lucas/spooky1.png", "characters/lucas/spooky2.png", "characters/lucas/spooky3.png", "characters/lucas/spooky4.png", "characters/lucas/spooky5.png"],
  [Mood.HORRIFIED]: ["characters/lucas/horrified.png", "characters/lucas/horrified1.png", "characters/lucas/horrified2.png", "characters/lucas/horrified3.png", "characters/lucas/horrified4.png", "characters/lucas/horrified5.png"],
  [Mood.SCARED]:    ["characters/lucas/horrified.png", "characters/lucas/horrified1.png", "characters/lucas/horrified2.png", "characters/lucas/horrified3.png", "characters/lucas/horrified4.png", "characters/lucas/horrified5.png"],
  [Mood.WRITING]:   ["characters/lucas/writing.png", "characters/lucas/writing1.png", "characters/lucas/writing2.png", "characters/lucas/writing3.png", "characters/lucas/writing4.png", "characters/lucas/writing5.png"],
  [Mood.DETERMINED]:["characters/lucas/confident.png", "characters/lucas/confident1.png", "characters/lucas/confident2.png", "characters/lucas/confident3.png", "characters/lucas/confident4.png", "characters/lucas/confident5.png"],
  [Mood.ENERGETIC]: ["characters/lucas/happy.png", "characters/lucas/happy1.png", "characters/lucas/happy2.png", "characters/lucas/happy3.png", "characters/lucas/happy4.png", "characters/lucas/happy5.png"],
  [Mood.THINKING]:  ["characters/lucas/thinking.png", "characters/lucas/thinking1.png", "characters/lucas/thinking2.png", "characters/lucas/thinking3.png", "characters/lucas/thinking4.png", "characters/lucas/thinking5.png"],
  [Mood.SAD]:       ["characters/lucas/sad.png", "characters/lucas/sad1.png", "characters/lucas/sad2.png", "characters/lucas/sad3.png", "characters/lucas/sad4.png", "characters/lucas/sad5.png"],
  [Mood.SHOWING_PHONE]: ["characters/lucas/showing_phone.png"],
  [Mood.HOLDING_FLOWERS]: ["characters/lucas/special_flowers.png", "characters/lucas/special_flowers1.png", "characters/lucas/special_flowers2.png", "characters/lucas/special_flowers3.png", "characters/lucas/special_flowers4.png", "characters/lucas/special_flowers5.png"],
  [Mood.DRINKING]:  ["characters/lucas/special_boba.png", "characters/lucas/special_boba1.png", "characters/lucas/special_boba2.png", "characters/lucas/special_boba3.png", "characters/lucas/special_boba4.png", "characters/lucas/special_boba5.png"],
  [Mood.EATING]:    ["characters/lucas/special_noodle.png", "characters/lucas/special_noodle1.png", "characters/lucas/special_noodle2.png", "characters/lucas/special_noodle3.png", "characters/lucas/special_noodle4.png", "characters/lucas/special_noodle5.png"],
  [Mood.ROMANTIC]:  ["characters/lucas/romantic.png", "characters/lucas/romantic1.png", "characters/lucas/romantic2.png", "characters/lucas/romantic3.png", "characters/lucas/romantic4.png", "characters/lucas/romantic5.png"],
  [Mood.SEXUAL]:    ["characters/lucas/sexual.png", "characters/lucas/sexual1.png", "characters/lucas/sexual2.png", "characters/lucas/sexual3.png", "characters/lucas/sexual4.png", "characters/lucas/sexual5.png"],
  [Mood.DRUNK]:     ["characters/lucas/special_drunk.png", "characters/lucas/special_drunk1.png", "characters/lucas/special_drunk2.png", "characters/lucas/special_drunk3.png", "characters/lucas/special_drunk4.png", "characters/lucas/special_drunk5.png"],
};

// 7. Bam
export const BAM_IMG_BASE = "characters/bam/neutral.png";
export const BAM_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/bam/neutral.png", "characters/bam/neutral1.png", "characters/bam/neutral2.png", "characters/bam/neutral3.png", "characters/bam/neutral4.png", "characters/bam/neutral5.png"],
  [Mood.HAPPY]:     ["characters/bam/happy.png", "characters/bam/happy1.png", "characters/bam/happy2.png", "characters/bam/happy3.png", "characters/bam/happy4.png", "characters/bam/happy5.png"],
  [Mood.DETERMINED]:["characters/bam/determined.png", "characters/bam/determined1.png", "characters/bam/determined2.png", "characters/bam/determined3.png", "characters/bam/determined4.png", "characters/bam/determined5.png"],
  [Mood.WRITING]:   ["characters/bam/writing.png", "characters/bam/writing1.png", "characters/bam/writing2.png", "characters/bam/writing3.png", "characters/bam/writing4.png", "characters/bam/writing5.png"],
  [Mood.SURPRISED]: ["characters/bam/surprised.png", "characters/bam/surprised1.png", "characters/bam/surprised2.png", "characters/bam/surprised3.png", "characters/bam/surprised4.png", "characters/bam/surprised5.png"],
  [Mood.SHY]:       ["characters/bam/shy.png", "characters/bam/shy1.png", "characters/bam/shy2.png", "characters/bam/shy3.png", "characters/bam/shy4.png", "characters/bam/shy5.png"],
  [Mood.CONFIDENT]: ["characters/bam/confident.png", "characters/bam/confident1.png", "characters/bam/confident2.png", "characters/bam/confident3.png", "characters/bam/confident4.png", "characters/bam/confident5.png"],
  [Mood.ANGRY]:     ["characters/bam/angry.png", "characters/bam/angry1.png", "characters/bam/angry2.png", "characters/bam/angry3.png", "characters/bam/angry4.png", "characters/bam/angry5.png"],
  [Mood.SAD]:       ["characters/bam/sad.png", "characters/bam/sad1.png", "characters/bam/sad2.png", "characters/bam/sad3.png", "characters/bam/sad4.png", "characters/bam/sad5.png"],
  [Mood.FLIRTY]:    ["characters/bam/flirty.png", "characters/bam/flirty1.png", "characters/bam/flirty2.png", "characters/bam/flirty3.png", "characters/bam/flirty4.png", "characters/bam/flirty5.png"],
  [Mood.SCARED]:    ["characters/bam/scared.png", "characters/bam/scared1.png", "characters/bam/scared2.png", "characters/bam/scared3.png", "characters/bam/scared4.png", "characters/bam/scared5.png"],
  [Mood.THINKING]:  ["characters/bam/thinking.png", "characters/bam/thinking1.png", "characters/bam/thinking2.png", "characters/bam/thinking3.png", "characters/bam/thinking4.png", "characters/bam/thinking5.png"],
  [Mood.HIGH_FIVE]: ["characters/bam/highfive.png", "characters/bam/highfive1.png", "characters/bam/highfive2.png", "characters/bam/highfive3.png", "characters/bam/highfive4.png", "characters/bam/highfive5.png"],
  [Mood.HOLDING_FLOWERS]: ["characters/bam/special_flowers.png", "characters/bam/special_flowers1.png", "characters/bam/special_flowers2.png", "characters/bam/special_flowers3.png", "characters/bam/special_flowers4.png", "characters/bam/special_flowers5.png"], 
  [Mood.DRINKING]:  ["characters/bam/special_boba.png", "characters/bam/special_boba1.png", "characters/bam/special_boba2.png", "characters/bam/special_boba3.png", "characters/bam/special_boba4.png", "characters/bam/special_boba5.png"], 
  [Mood.EATING]:    ["characters/bam/special_noodle.png", "characters/bam/special_noodle1.png", "characters/bam/special_noodle2.png", "characters/bam/special_noodle3.png", "characters/bam/special_noodle4.png", "characters/bam/special_noodle5.png"],
  [Mood.ROMANTIC]:  ["characters/bam/romantic.png", "characters/bam/romantic1.png", "characters/bam/romantic2.png", "characters/bam/romantic3.png", "characters/bam/romantic4.png", "characters/bam/romantic5.png"],
  [Mood.SEXUAL]:    ["characters/bam/sexual.png", "characters/bam/sexual1.png", "characters/bam/sexual2.png", "characters/bam/sexual3.png", "characters/bam/sexual4.png", "characters/bam/sexual5.png"],
  [Mood.DRUNK]:     ["characters/bam/special_drunk.png", "characters/bam/special_drunk1.png", "characters/bam/special_drunk2.png", "characters/bam/special_drunk3.png", "characters/bam/special_drunk4.png", "characters/bam/special_drunk5.png"],
};

// 7.1 Bam Casual (Date Mode / Room Mode) - Mapped to bam_character_home
export const BAM_HOME_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/bam_character_home/neutral.png", "characters/bam_character_home/neutral1.png", "characters/bam_character_home/neutral2.png", "characters/bam_character_home/neutral3.png"],
  [Mood.HAPPY]:     ["characters/bam_character_home/happy.png", "characters/bam_character_home/happy1.png", "characters/bam_character_home/happy2.png", "characters/bam_character_home/happy3.png"],
  [Mood.SHY]:       ["characters/bam_character_home/shy.png", "characters/bam_character_home/shy1.png", "characters/bam_character_home/shy2.png", "characters/bam_character_home/shy3.png"],
  [Mood.ANGRY]:     ["characters/bam_character_home/angry.png", "characters/bam_character_home/angry1.png", "characters/bam_character_home/angry2.png", "characters/bam_character_home/angry3.png"],
  [Mood.FLIRTY]:    ["characters/bam_character_home/flirty.png", "characters/bam_character_home/flirty1.png", "characters/bam_character_home/flirty2.png", "characters/bam_character_home/flirty3.png"],
  [Mood.CONFIDENT]: ["characters/bam_character_home/confident.png", "characters/bam_character_home/confident1.png", "characters/bam_character_home/confident2.png", "characters/bam_character_home/confident3.png"],
  [Mood.ROMANTIC]:  ["characters/bam_character_home/romantic.png", "characters/bam_character_home/romantic1.png", "characters/bam_character_home/romantic2.png"],
  [Mood.SEXUAL]:    ["characters/bam_character_home/sexual.png", "characters/bam_character_home/sexual1.png", "characters/bam_character_home/sexual2.png"],
  [Mood.SURPRISED]: ["characters/bam_character_home/surprised.png", "characters/bam_character_home/surprised1.png"],
  [Mood.THINKING]:  ["characters/bam_character_home/thinking.png", "characters/bam_character_home/thinking1.png"],
  [Mood.SAD]:       ["characters/bam_character_home/sad.png", "characters/bam_character_home/sad1.png"],
  // NEW & UPDATED
  [Mood.HIGH_FIVE]: ["characters/bam_character_home/highfive.png", "characters/bam_character_home/highfive1.png", "characters/bam_character_home/highfive2.png", "characters/bam_character_home/highfive3.png", "characters/bam_character_home/highfive4.png", "characters/bam_character_home/highfive5.png"],
  [Mood.DRINKING]:  ["characters/bam_character_home/special_boba.png", "characters/bam_character_home/special_boba1.png", "characters/bam_character_home/special_boba2.png", "characters/bam_character_home/special_boba3.png", "characters/bam_character_home/special_boba4.png", "characters/bam_character_home/special_boba5.png"],
  [Mood.EATING]:    ["characters/bam_character_home/special_noodle.png", "characters/bam_character_home/special_noodle1.png", "characters/bam_character_home/special_noodle2.png", "characters/bam_character_home/special_noodle3.png", "characters/bam_character_home/special_noodle4.png", "characters/bam_character_home/special_noodle5.png"],
  [Mood.DRUNK]:     ["characters/bam_character_home/special_drunk.png", "characters/bam_character_home/special_drunk1.png", "characters/bam_character_home/special_drunk2.png", "characters/bam_character_home/special_drunk3.png", "characters/bam_character_home/special_drunk4.png", "characters/bam_character_home/special_drunk5.png"],
  [Mood.HOLDING_FLOWERS]: ["characters/bam/special_flowers.png", "characters/bam/special_flowers1.png"],
};

// 8. Jellie
export const JELLIE_IMG_BASE = "characters/jellie/neutral.png";
export const JELLIE_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/jellie/neutral.png", "characters/jellie/neutral1.png", "characters/jellie/neutral2.png", "characters/jellie/neutral3.png", "characters/jellie/neutral4.png", "characters/jellie/neutral5.png"],
  [Mood.HAPPY]:     ["characters/jellie/happy.png", "characters/jellie/happy1.png", "characters/jellie/happy2.png", "characters/jellie/happy3.png", "characters/jellie/happy4.png", "characters/jellie/happy5.png"],
  [Mood.SASSY]:     ["characters/jellie/sassy.png", "characters/jellie/sassy1.png", "characters/jellie/sassy2.png", "characters/jellie/sassy3.png", "characters/jellie/sassy4.png", "characters/jellie/sassy5.png"],
  [Mood.ANGRY]:     ["characters/jellie/angry.png", "characters/jellie/angry1.png", "characters/jellie/angry2.png", "characters/jellie/angry3.png", "characters/jellie/angry4.png", "characters/jellie/angry5.png"],
  [Mood.FLIRTY]:    ["characters/jellie/flirty.png", "characters/jellie/flirty1.png", "characters/jellie/flirty2.png", "characters/jellie/flirty3.png", "characters/jellie/flirty4.png", "characters/jellie/flirty5.png"],
  [Mood.CONFIDENT]: ["characters/jellie/confident.png", "characters/jellie/confident1.png", "characters/jellie/confident2.png", "characters/jellie/confident3.png", "characters/jellie/confident4.png", "characters/jellie/confident5.png"],
  [Mood.TIRED]:     ["characters/jellie/tired.png", "characters/jellie/tired1.png", "characters/jellie/tired2.png", "characters/jellie/tired3.png", "characters/jellie/tired4.png", "characters/jellie/tired5.png"],
  [Mood.SURPRISED]: ["characters/jellie/surprised.png", "characters/jellie/surprised1.png", "characters/jellie/surprised2.png", "characters/jellie/surprised3.png", "characters/jellie/surprised4.png", "characters/jellie/surprised5.png"],
  [Mood.SHY]:       ["characters/jellie/shy.png", "characters/jellie/shy1.png", "characters/jellie/shy2.png", "characters/jellie/shy3.png", "characters/jellie/shy4.png", "characters/jellie/shy5.png"],
  [Mood.WORKING]:   ["characters/jellie/working.png", "characters/jellie/working1.png", "characters/jellie/working2.png", "characters/jellie/working3.png", "characters/jellie/working4.png", "characters/jellie/working5.png"],
  [Mood.SAD]:       ["characters/jellie/sad.png", "characters/jellie/sad1.png", "characters/jellie/sad2.png", "characters/jellie/sad3.png", "characters/jellie/sad4.png", "characters/jellie/sad5.png"],
  [Mood.THINKING]:  ["characters/jellie/thinking.png", "characters/jellie/thinking1.png", "characters/jellie/thinking2.png", "characters/jellie/thinking3.png", "characters/jellie/thinking4.png", "characters/jellie/thinking5.png"],
  [Mood.DRINKING]:  ["characters/jellie/special_boba.png", "characters/jellie/special_boba1.png", "characters/jellie/special_boba2.png", "characters/jellie/special_boba3.png"],
  [Mood.EATING]:    ["characters/jellie/special_noodle.png", "characters/jellie/special_noodle1.png", "characters/jellie/special_noodle2.png", "characters/jellie/special_noodle3.png"],
  [Mood.ROMANTIC]:  ["characters/jellie/romantic.png", "characters/jellie/romantic1.png", "characters/jellie/romantic2.png"],
  [Mood.SEXUAL]:    ["characters/jellie/sexual.png", "characters/jellie/sexual1.png", "characters/jellie/sexual2.png"],
  [Mood.DRUNK]:     ["characters/jellie/special_drunk.png", "characters/jellie/special_drunk1.png", "characters/jellie/special_drunk2.png"],
  [Mood.SHOPPING]:  ["characters/jellie/shopping.png", "characters/jellie/shopping1.png", "characters/jellie/shopping2.png"],
  [Mood.DISGUISED]: ["characters/jellie/disguised.png", "characters/jellie/disguised1.png", "characters/jellie/disguised2.png"],
  [Mood.RECEIVING_FLOWERS]: ["characters/jellie/special_flowers.png", "characters/jellie/special_flowers1.png"],
  [Mood.HOLDING_FLOWERS]: ["characters/jellie/special_flowers.png", "characters/jellie/special_flowers1.png"],
};

// 8.1 Jellie Date Mode (Condo / Home) - FULL MOOD SET
export const JELLIE_HOME_DATE_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/jellie_character_home/neutral.png", "characters/jellie_character_home/neutral1.png", "characters/jellie_character_home/neutral2.png", "characters/jellie_character_home/neutral3.png", "characters/jellie_character_home/neutral4.png", "characters/jellie_character_home/neutral5.png"],
  [Mood.HAPPY]:     ["characters/jellie_character_home/happy.png", "characters/jellie_character_home/happy1.png", "characters/jellie_character_home/happy2.png", "characters/jellie_character_home/happy3.png", "characters/jellie_character_home/happy4.png", "characters/jellie_character_home/happy5.png"],
  [Mood.SASSY]:     ["characters/jellie_character_home/sassy.png", "characters/jellie_character_home/sassy1.png", "characters/jellie_character_home/sassy2.png", "characters/jellie_character_home/sassy3.png", "characters/jellie_character_home/sassy4.png", "characters/jellie_character_home/sassy5.png"],
  [Mood.ANGRY]:     ["characters/jellie_character_home/angry.png", "characters/jellie_character_home/angry1.png", "characters/jellie_character_home/angry2.png", "characters/jellie_character_home/angry3.png", "characters/jellie_character_home/angry4.png", "characters/jellie_character_home/angry5.png"],
  [Mood.FLIRTY]:    ["characters/jellie_character_home/flirty.png", "characters/jellie_character_home/flirty1.png", "characters/jellie_character_home/flirty2.png", "characters/jellie_character_home/flirty3.png", "characters/jellie_character_home/flirty4.png", "characters/jellie_character_home/flirty5.png"],
  [Mood.CONFIDENT]: ["characters/jellie_character_home/confident.png", "characters/jellie_character_home/confident1.png", "characters/jellie_character_home/confident2.png", "characters/jellie_character_home/confident3.png", "characters/jellie_character_home/confident4.png", "characters/jellie_character_home/confident5.png"],
  [Mood.TIRED]:     ["characters/jellie_character_home/tired.png", "characters/jellie_character_home/tired1.png", "characters/jellie_character_home/tired2.png", "characters/jellie_character_home/tired3.png", "characters/jellie_character_home/tired4.png", "characters/jellie_character_home/tired5.png"],
  [Mood.SURPRISED]: ["characters/jellie_character_home/surprised.png", "characters/jellie_character_home/surprised1.png", "characters/jellie_character_home/surprised2.png", "characters/jellie_character_home/surprised3.png", "characters/jellie_character_home/surprised4.png", "characters/jellie_character_home/surprised5.png"],
  [Mood.SHY]:       ["characters/jellie_character_home/shy.png", "characters/jellie_character_home/shy1.png", "characters/jellie_character_home/shy2.png", "characters/jellie_character_home/shy3.png", "characters/jellie_character_home/shy4.png", "characters/jellie_character_home/shy5.png"],
  [Mood.WORKING]:   ["characters/jellie_character_home/working.png", "characters/jellie_character_home/working1.png", "characters/jellie_character_home/working2.png", "characters/jellie_character_home/working3.png", "characters/jellie_character_home/working4.png", "characters/jellie_character_home/working5.png"],
  [Mood.SAD]:       ["characters/jellie_character_home/sad.png", "characters/jellie_character_home/sad1.png", "characters/jellie_character_home/sad2.png", "characters/jellie_character_home/sad3.png", "characters/jellie_character_home/sad4.png", "characters/jellie_character_home/sad5.png"],
  [Mood.THINKING]:  ["characters/jellie_character_home/thinking.png", "characters/jellie_character_home/thinking1.png", "characters/jellie_character_home/thinking2.png", "characters/jellie_character_home/thinking3.png", "characters/jellie_character_home/thinking4.png", "characters/jellie_character_home/thinking5.png"],
  // Special Mappings
  [Mood.DRINKING]:  ["characters/jellie_character_home/drinking.png", "characters/jellie_character_home/drinking1.png", "characters/jellie_character_home/drinking2.png", "characters/jellie_character_home/drinking3.png", "characters/jellie_character_home/drinking4.png", "characters/jellie_character_home/drinking5.png"],
  [Mood.EATING]:    ["characters/jellie_character_home/eating.png", "characters/jellie_character_home/eating1.png", "characters/jellie_character_home/eating2.png", "characters/jellie_character_home/eating3.png", "characters/jellie_character_home/eating4.png", "characters/jellie_character_home/eating5.png"],
  [Mood.ROMANTIC]:  ["characters/jellie_character_home/romantic.png", "characters/jellie_character_home/romantic1.png", "characters/jellie_character_home/romantic2.png", "characters/jellie_character_home/romantic3.png", "characters/jellie_character_home/romantic4.png", "characters/jellie_character_home/romantic5.png"],
  [Mood.SEXUAL]:    ["characters/jellie_character_home/sexual.png", "characters/jellie_character_home/sexual1.png", "characters/jellie_character_home/sexual2.png", "characters/jellie_character_home/sexual3.png", "characters/jellie_character_home/sexual4.png", "characters/jellie_character_home/sexual5.png"],
  [Mood.DRUNK]:     ["characters/jellie_character_home/drunk.png", "characters/jellie_character_home/drunk1.png", "characters/jellie_character_home/drunk2.png", "characters/jellie_character_home/drunk3.png", "characters/jellie_character_home/drunk4.png", "characters/jellie_character_home/drunk5.png"],
  [Mood.SHOPPING]:  ["characters/jellie_character_home/shopping.png", "characters/jellie_character_home/shopping1.png", "characters/jellie_character_home/shopping2.png", "characters/jellie_character_home/shopping3.png", "characters/jellie_character_home/shopping4.png", "characters/jellie_character_home/shopping5.png"],
  [Mood.DISGUISED]: ["characters/jellie_character_home/disguised.png", "characters/jellie_character_home/disguised1.png", "characters/jellie_character_home/disguised2.png", "characters/jellie_character_home/disguised3.png", "characters/jellie_character_home/disguised4.png", "characters/jellie_character_home/disguised5.png"],
  [Mood.RECEIVING_FLOWERS]: ["characters/jellie_character_home/special_flowers.png", "characters/jellie_character_home/special_flowers1.png", "characters/jellie_character_home/special_flowers2.png", "characters/jellie_character_home/special_flowers3.png", "characters/jellie_character_home/special_flowers4.png", "characters/jellie_character_home/special_flowers5.png"],
  [Mood.HOLDING_FLOWERS]: ["characters/jellie_character_home/special_flowers.png", "characters/jellie_character_home/special_flowers1.png", "characters/jellie_character_home/special_flowers2.png", "characters/jellie_character_home/special_flowers3.png", "characters/jellie_character_home/special_flowers4.png", "characters/jellie_character_home/special_flowers5.png"],
};

// 9. Soul (The Vet & Empath)
export const SOUL_IMG_BASE = "characters/soul/neutral.png";
export const SOUL_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/soul/neutral.png", "characters/soul/neutral1.png", "characters/soul/neutral2.png", "characters/soul/neutral3.png", "characters/soul/neutral4.png", "characters/soul/neutral5.png"],
  [Mood.HAPPY]:     ["characters/soul/happy.png", "characters/soul/happy1.png", "characters/soul/happy2.png", "characters/soul/happy3.png", "characters/soul/happy4.png", "characters/soul/happy5.png"],
  [Mood.COMFORTING]: ["characters/soul/comforting.png", "characters/soul/comforting1.png", "characters/soul/comforting2.png", "characters/soul/comforting3.png", "characters/soul/comforting4.png", "characters/soul/comforting5.png"], 
  [Mood.LISTENING]: ["characters/soul/listening.png", "characters/soul/listening1.png", "characters/soul/listening2.png", "characters/soul/listening3.png", "characters/soul/listening4.png", "characters/soul/listening5.png"], 
  [Mood.THINKING]:  ["characters/soul/thinking.png", "characters/soul/thinking1.png", "characters/soul/thinking2.png", "characters/soul/thinking3.png", "characters/soul/thinking4.png", "characters/soul/thinking5.png"],
  [Mood.TIRED]:     ["characters/soul/tired.png", "characters/soul/tired1.png", "characters/soul/tired2.png", "characters/soul/tired3.png", "characters/soul/tired4.png", "characters/soul/tired5.png"],
  [Mood.CONFIDENT]: ["characters/soul/confident.png", "characters/soul/confident1.png", "characters/soul/confident2.png", "characters/soul/confident3.png", "characters/soul/confident4.png", "characters/soul/confident5.png"], 
  [Mood.SAD]:       ["characters/soul/sad.png", "characters/soul/sad1.png", "characters/soul/sad2.png", "characters/soul/sad3.png", "characters/soul/sad4.png", "characters/soul/sad5.png"],
  [Mood.SURPRISED]: ["characters/soul/surprised.png", "characters/soul/surprised1.png", "characters/soul/surprised2.png", "characters/soul/surprised3.png", "characters/soul/surprised4.png", "characters/soul/surprised5.png"],
  [Mood.SHY]:       ["characters/soul/shy.png", "characters/soul/shy1.png", "characters/soul/shy2.png", "characters/soul/shy3.png", "characters/soul/shy4.png", "characters/soul/shy5.png"],
  [Mood.ANGRY]:     ["characters/soul/angry.png", "characters/soul/angry1.png", "characters/soul/angry2.png", "characters/soul/angry3.png", "characters/soul/angry4.png", "characters/soul/angry5.png"],
  [Mood.FLIRTY]:    ["characters/soul/flirty.png", "characters/soul/flirty1.png", "characters/soul/flirty2.png", "characters/soul/flirty3.png", "characters/soul/flirty4.png", "characters/soul/flirty5.png"],
  [Mood.WORKING]:   ["characters/soul/working.png", "characters/soul/working1.png", "characters/soul/working2.png", "characters/soul/working3.png", "characters/soul/working4.png", "characters/soul/working5.png"], 
  [Mood.ROMANTIC]:  ["characters/soul/romantic.png", "characters/soul/romantic1.png", "characters/soul/romantic2.png", "characters/soul/romantic3.png", "characters/soul/romantic4.png", "characters/soul/romantic5.png"],
  [Mood.SEXUAL]:    ["characters/soul/sexual.png", "characters/soul/sexual1.png", "characters/soul/sexual2.png", "characters/soul/sexual3.png", "characters/soul/sexual4.png", "characters/soul/sexual5.png"],
  [Mood.HOLDING_FLOWERS]: ["characters/soul/special_flowers.png", "characters/soul/special_flowers1.png", "characters/soul/special_flowers2.png", "characters/soul/special_flowers3.png", "characters/soul/special_flowers4.png", "characters/soul/special_flowers5.png"],
  [Mood.PET]:       ["characters/soul/pet.png", "characters/soul/pet1.png", "characters/soul/pet2.png"],
  [Mood.DRINKING]:  ["characters/soul/special_boba.png", "characters/soul/special_boba1.png", "characters/soul/special_boba2.png", "characters/soul/special_boba3.png", "characters/soul/special_boba4.png", "characters/soul/special_boba5.png"],
  [Mood.EATING]:    ["characters/soul/special_noodle.png", "characters/soul/special_noodle1.png", "characters/soul/special_noodle2.png", "characters/soul/special_noodle3.png", "characters/soul/special_noodle4.png", "characters/soul/special_noodle5.png"],
  [Mood.DRUNK]:     ["characters/soul/special_drunk.png", "characters/soul/special_drunk1.png", "characters/soul/special_drunk2.png"],
};

// 10. Mia (Ikura / Mia)
export const MIA_IMG_BASE = "characters/mia/neutral.png";
// DAY MODE: IKURA (Maid Cafe)
export const MIA_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/mia/neutral.png", "characters/mia/neutral1.png", "characters/mia/neutral2.png", "characters/mia/neutral3.png", "characters/mia/neutral4.png", "characters/mia/neutral5.png"],
  [Mood.HAPPY]:     ["characters/mia/happy.png", "characters/mia/happy1.png", "characters/mia/happy2.png", "characters/mia/happy3.png", "characters/mia/happy4.png", "characters/mia/happy5.png"],
  [Mood.SHY]:       ["characters/mia/shy.png", "characters/mia/shy1.png", "characters/mia/shy2.png", "characters/mia/shy3.png", "characters/mia/shy4.png", "characters/mia/shy5.png"],
  [Mood.ANGRY]:     ["characters/mia/angry.png", "characters/mia/angry1.png", "characters/mia/angry2.png", "characters/mia/angry3.png", "characters/mia/angry4.png", "characters/mia/angry5.png"],
  [Mood.FLIRTY]:    ["characters/mia/flirty.png", "characters/mia/flirty1.png", "characters/mia/flirty2.png", "characters/mia/flirty3.png", "characters/mia/flirty4.png", "characters/mia/flirty5.png"],
  [Mood.CONFIDENT]: ["characters/mia/confident.png", "characters/mia/confident1.png", "characters/mia/confident2.png", "characters/mia/confident3.png", "characters/mia/confident4.png", "characters/mia/confident5.png"],
  [Mood.SURPRISED]: ["characters/mia/surprised.png", "characters/mia/surprised1.png", "characters/mia/surprised2.png", "characters/mia/surprised3.png", "characters/mia/surprised4.png", "characters/mia/surprised5.png"],
  [Mood.WORKING]:   ["characters/mia/working.png", "characters/mia/working1.png", "characters/mia/working2.png", "characters/mia/working3.png", "characters/mia/working4.png", "characters/mia/working5.png"],
  [Mood.SAD]:       ["characters/mia/sad.png", "characters/mia/sad1.png", "characters/mia/sad2.png", "characters/mia/sad3.png", "characters/mia/sad4.png", "characters/mia/sad5.png"],
  // New/Updated
  [Mood.DRINKING]:  ["characters/mia/special_boba.png", "characters/mia/special_boba1.png", "characters/mia/special_boba2.png", "characters/mia/special_boba3.png", "characters/mia/special_boba4.png", "characters/mia/special_boba5.png"],
  [Mood.EATING]:    ["characters/mia/special_noodle.png", "characters/mia/special_noodle1.png", "characters/mia/special_noodle2.png", "characters/mia/special_noodle3.png", "characters/mia/special_noodle4.png", "characters/mia/special_noodle5.png"],
  [Mood.ROMANTIC]:  ["characters/mia/romantic.png", "characters/mia/romantic1.png", "characters/mia/romantic2.png", "characters/mia/romantic3.png", "characters/mia/romantic4.png", "characters/mia/romantic5.png"],
  [Mood.SEXUAL]:    ["characters/mia/sexual.png", "characters/mia/sexual1.png", "characters/mia/sexual2.png", "characters/mia/sexual3.png", "characters/mia/sexual4.png", "characters/mia/sexual5.png"],
  [Mood.DRUNK]:     ["characters/mia/special_drunk.png", "characters/mia/special_drunk1.png", "characters/mia/special_drunk2.png", "characters/mia/special_drunk3.png", "characters/mia/special_drunk4.png", "characters/mia/special_drunk5.png"],
  [Mood.HOLDING_FLOWERS]: ["characters/mia/special_flowers.png", "characters/mia/special_flowers1.png", "characters/mia/special_flowers2.png", "characters/mia/special_flowers3.png", "characters/mia/special_flowers4.png", "characters/mia/special_flowers5.png"],
};

// NIGHT MODE: MIA (Secret Spy) - Mapped to casualMoods
export const MIA_NIGHT_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/miacasual/neutral.png", "characters/miacasual/neutral1.png", "characters/miacasual/neutral2.png", "characters/miacasual/neutral3.png", "characters/miacasual/neutral4.png", "characters/miacasual/neutral5.png"],
  [Mood.HAPPY]:     ["characters/miacasual/happy.png", "characters/miacasual/happy1.png", "characters/miacasual/happy2.png", "characters/miacasual/happy3.png", "characters/miacasual/happy4.png", "characters/miacasual/happy5.png"],
  [Mood.CONFIDENT]: ["characters/miacasual/confident.png", "characters/miacasual/confident1.png", "characters/miacasual/confident2.png", "characters/miacasual/confident3.png", "characters/miacasual/confident4.png", "characters/miacasual/confident5.png"],
  [Mood.SASSY]:     ["characters/miacasual/sassy.png", "characters/miacasual/sassy1.png", "characters/miacasual/sassy2.png", "characters/miacasual/sassy3.png", "characters/miacasual/sassy4.png", "characters/miacasual/sassy5.png"],
  [Mood.ANGRY]:     ["characters/miacasual/angry.png", "characters/miacasual/angry1.png", "characters/miacasual/angry2.png", "characters/miacasual/angry3.png", "characters/miacasual/angry4.png", "characters/miacasual/angry5.png"],
  [Mood.FLIRTY]:    ["characters/miacasual/flirty.png", "characters/miacasual/flirty1.png", "characters/miacasual/flirty2.png", "characters/miacasual/flirty3.png", "characters/miacasual/flirty4.png", "characters/miacasual/flirty5.png"],
  [Mood.THINKING]:  ["characters/miacasual/thinking.png", "characters/miacasual/thinking1.png", "characters/miacasual/thinking2.png", "characters/miacasual/thinking3.png", "characters/miacasual/thinking4.png", "characters/miacasual/thinking5.png"],
  [Mood.SAD]:       ["characters/miacasual/sad.png", "characters/miacasual/sad1.png", "characters/miacasual/sad2.png", "characters/miacasual/sad3.png", "characters/miacasual/sad4.png", "characters/miacasual/sad5.png"],
  // New
  [Mood.DRINKING]:  ["characters/miacasual/drinking.png", "characters/miacasual/drinking1.png", "characters/miacasual/drinking2.png", "characters/miacasual/drinking3.png", "characters/miacasual/drinking4.png", "characters/miacasual/drinking5.png"],
  [Mood.EATING]:    ["characters/miacasual/eating.png", "characters/miacasual/eating1.png", "characters/miacasual/eating2.png", "characters/miacasual/eating3.png", "characters/miacasual/eating4.png", "characters/miacasual/eating5.png"],
  [Mood.ROMANTIC]:  ["characters/miacasual/romantic.png", "characters/miacasual/romantic1.png", "characters/miacasual/romantic2.png", "characters/miacasual/romantic3.png", "characters/miacasual/romantic4.png", "characters/miacasual/romantic5.png"],
  [Mood.SEXUAL]:    ["characters/miacasual/sexual.png", "characters/miacasual/sexual1.png", "characters/miacasual/sexual2.png", "characters/miacasual/sexual3.png", "characters/miacasual/sexual4.png", "characters/miacasual/sexual5.png"],
  [Mood.DRUNK]:     ["characters/miacasual/drunk.png", "characters/miacasual/drunk1.png", "characters/miacasual/drunk2.png", "characters/miacasual/drunk3.png", "characters/miacasual/drunk4.png", "characters/miacasual/drunk5.png"],
  [Mood.HOLDING_FLOWERS]: ["characters/miacasual/special_flowers.png", "characters/miacasual/special_flowers1.png", "characters/miacasual/special_flowers2.png", "characters/miacasual/special_flowers3.png", "characters/miacasual/special_flowers4.png", "characters/miacasual/special_flowers5.png"],
  [Mood.SHY]:       ["characters/miacasual/shy.png", "characters/miacasual/shy1.png", "characters/miacasual/shy2.png", "characters/miacasual/shy3.png", "characters/miacasual/shy4.png", "characters/miacasual/shy5.png"],
  [Mood.SURPRISED]: ["characters/miacasual/surprised.png", "characters/miacasual/surprised1.png", "characters/miacasual/surprised2.png", "characters/miacasual/surprised3.png", "characters/miacasual/surprised4.png", "characters/miacasual/surprised5.png"],
};

export const BASEMENT_TRACKS: MusicTrack[] = [
    { 
        id: 'track_1', 
        title: 'Gravity', 
        artist: "Nyx'n Night", 
        cost: 0, 
        buffType: 'overlimit', 
        buffValue: 70, 
        buffDurationMinutes: 0,
        description: 'Instant Vibe: Energy +70.',
        durationSec: 10,
        coverColor: 'bg-indigo-500',
        src: '/music/Gravity.mp3',
        coverImage: '/images/covers/gravity.jpg'
    },
    { 
        id: 'track_2', 
        title: 'Corner of My Mind', 
        artist: "Nyx'n Night", 
        cost: 500, 
        buffType: 'buff_int', 
        buffValue: 2, 
        buffDurationMinutes: 60,
        description: 'Mental Clarity: All Stats +2 (1h).',
        durationSec: 10,
        coverColor: 'bg-fuchsia-500',
        src: '/music/Corner.mp3',
        coverImage: '/images/covers/corner.jpg'
    },
    { 
        id: 'track_3', 
        title: 'Rooftop', 
        artist: 'Lucas', 
        cost: 1000, 
        buffType: 'chill_vibes', 
        buffValue: 1.5, 
        buffDurationMinutes: 60,
        description: 'Energy Regen: Every 40s (1h).',
        durationSec: 10,
        coverColor: 'bg-red-600',
        src: '/music/Rooftop.mp3',
        coverImage: '/images/covers/rooftop.jpg'
    },
    { 
        id: 'track_4', 
        title: 'Stay for the Night', 
        artist: 'Shifu x', 
        cost: 1500, 
        buffType: 'lucky_day', 
        buffValue: 0.2, 
        buffDurationMinutes: 60,
        description: 'Lucky Day: +20% Crit Chance (1h).',
        durationSec: 10,
        coverColor: 'bg-pink-600',
        src: '/music/Stay.mp3',
        coverImage: '/images/covers/stay.jpg'
    }
];


import { RelationshipTier, ShopItem, BuffType, CharacterId } from '../types';

export const getFluent3D = (folderName: string) => {
    const fileName = folderName.toLowerCase().replace(/ /g, '_');
    // Using jsDelivr as a more stable CDN for GitHub assets
    return `https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/${encodeURIComponent(folderName)}/3D/${fileName}_3d.png`;
};

export const SHOP_ITEMS: ShopItem[] = [
    // CAFE ITEMS
    { id: 'food_cookie', name: 'Cookie', cost: 30, energyRestore: 5, emoji: getFluent3D('Cookie'), description: 'ขนมคลาสสิก หอมกรุ่นจากเตา', source: 'cafe', category: 'food' },
    
    // Updated Cafe Items
    { id: 'honey_lemon', name: 'Honey Lemon', cost: 60, energyRestore: 12, emoji: getFluent3D('Lemon'), description: 'ช่างจ้อ: ลด Energy การแชท -1 (10นาที)', source: 'cafe', category: 'food', buffType: 'chatterbox', buffValue: 1, buffDurationMinutes: 10 },
    { id: 'espresso_shot', name: 'Espresso Shot', cost: 50, energyRestore: 10, emoji: getFluent3D('Hot beverage'), description: 'มือไว: ลดเวลาทำงาน -5วิ (15นาที)', source: 'cafe', category: 'food', buffType: 'fast_hand', buffValue: 1, buffDurationMinutes: 15 },
    { id: 'food_bubble_tea', name: 'Bubble Tea', cost: 75, energyRestore: 15, emoji: getFluent3D('Bubble tea'), description: 'ปากหวาน: เพิ่มค่าความรัก +1 (15นาที)', source: 'cafe', category: 'food', buffType: 'sweet_words', buffValue: 1, buffDurationMinutes: 15 },
    { id: 'food_energy_drink', name: 'Energy Drink', cost: 70, energyRestore: 20, emoji: getFluent3D('High voltage'), description: 'ดูดทรัพย์: เงินรางวัล +10% (30นาที)', source: 'cafe', category: 'food', buffType: 'money_magnet', buffValue: 1.1, buffDurationMinutes: 30 },
    { id: 'protein_shake', name: 'Protein Shake', cost: 85, energyRestore: 25, emoji: getFluent3D('Cup with straw'), description: 'ข้ามขีดจำกัด: เพิ่ม Max Energy +20 (30นาที)', source: 'cafe', category: 'food', buffType: 'overlimit', buffValue: 20, buffDurationMinutes: 30 },
    { id: 'chicken_salad', name: 'Chicken Salad', cost: 150, energyRestore: 30, emoji: getFluent3D('Green salad'), description: 'สายลีน: ได้ EXP ยิม x2 (30นาที)', source: 'cafe', category: 'food', buffType: 'gym_junkie', buffValue: 2, buffDurationMinutes: 30 },
    
    // Moved Omakase to Cafe as requested
    { id: 'omakase', name: 'Premium Omakase', cost: 2500, energyRestore: 100, emoji: getFluent3D('Sushi'), description: 'เติบโตจริง: เพิ่ม Stat ถาวร +1', source: 'cafe', category: 'food' },

    { id: 'strawberry_cake', name: 'Strawberry Cake', cost: 130, energyRestore: 40, emoji: getFluent3D('Shortcake'), description: 'ของหวานแสนอร่อย', source: 'cafe', category: 'food' },
    { id: 'club_sandwich', name: 'Club Sandwich', cost: 100, energyRestore: 30, emoji: getFluent3D('Sandwich'), description: 'มื้อเที่ยงอิ่มท้อง', source: 'cafe', category: 'food' },
    { id: 'dark_choc', name: 'Dark Chocolate', cost: 60, energyRestore: 20, emoji: getFluent3D('Chocolate bar'), description: 'รสขมอมหวาน เข้มข้น', source: 'cafe', category: 'food' },

    // CAFE GADGETS
    { id: 'gadget_standard_bed', name: 'Standard Bed', cost: 15000, energyRestore: 0, emoji: getFluent3D('Bed'), description: 'เตียงมาตรฐาน นอนสบายขึ้นเล็กน้อย (6x)', source: 'cafe', category: 'gadget', unlocksSkill: 'basic_sleep' },
    { id: 'gadget_pods', name: 'Noise-Canceling Pods', cost: 3250, energyRestore: 0, emoji: getFluent3D('Headphone'), description: 'ตัดเสียงรบกวนรอบข้าง (ลดค่าเดินทาง)', source: 'cafe', category: 'gadget', unlocksSkill: 'huh_again_pls' },
    { id: 'gadget_laptop', name: 'Pro Laptop', cost: 5000, energyRestore: 0, emoji: getFluent3D('Laptop'), description: 'ทำงานได้ทุกที่ (Smart Home)', source: 'cafe', category: 'gadget', unlocksSkill: 'work_from_home' },
    { id: 'gadget_bed', name: 'DreamCloud Pod', cost: 1500, currency: 'diamond', energyRestore: 0, emoji: getFluent3D('Bed'), description: 'หลับลึกและฟื้นฟูไวขึ้น (12x)', source: 'cafe', category: 'gadget', unlocksSkill: 'hard_sleep' },

    // MARKET ITEMS
    // Updated Market Items
    { id: 'market_slushie', name: 'Neon Slushie', cost: 55, energyRestore: 8, emoji: getFluent3D('Tropical drink'), description: 'ข้ามขีดจำกัด: เพิ่ม Max Energy +10 (1ชม.)', source: 'market', category: 'food', buffType: 'overlimit', buffValue: 10, buffDurationMinutes: 60 },
    { id: 'market_wagyu', name: 'A5 Wagyu Stick', cost: 450, energyRestore: 80, emoji: getFluent3D('Cut of meat'), description: 'โหมดสัตว์ป่า: VIT +5 (1ชม.)', source: 'market', category: 'food', buffType: 'buff_vit', buffValue: 5, buffDurationMinutes: 60 },
    { id: 'market_macaron', name: 'Galaxy Macaron', cost: 175, energyRestore: 25, emoji: getFluent3D('Bagel'), description: 'สมองจักรวาล: INT +5 (1ชม.)', source: 'market', category: 'food', buffType: 'buff_int', buffValue: 5, buffDurationMinutes: 60 },
    { id: 'market_caviar', name: 'Caviar Bun', cost: 300, energyRestore: 50, emoji: getFluent3D('Bagel'), description: 'ออร่าผู้ดี: CHA +5 (1ชม.)', source: 'market', category: 'food', buffType: 'buff_cha', buffValue: 5, buffDurationMinutes: 60 },
    { id: 'market_lobster', name: 'Jackpot Lobster', cost: 650, energyRestore: 100, emoji: getFluent3D('Lobster'), description: 'ดวงเศรษฐี: LUCK +5 (1ชม.)', source: 'market', category: 'food', buffType: 'buff_luck', buffValue: 5, buffDurationMinutes: 60 },

    // Other Market Items
    { id: 'food_full_meal', name: 'Full Meal', cost: 400, energyRestore: 60, emoji: getFluent3D('Bento box'), description: 'สารอาหารครบถ้วน อิ่มนาน', source: 'market', category: 'food' },
    { id: 'market_mala', name: 'Mala Skewers', cost: 70, energyRestore: 15, emoji: getFluent3D('Oden'), description: 'เผ็ดชาสะใจ ลิ้นระเบิด', source: 'market', category: 'food' },
    { id: 'market_burger', name: 'Midnight Burger', cost: 150, energyRestore: 35, emoji: getFluent3D('Hamburger'), description: 'เบอร์เกอร์ฉ่ำๆ มื้อดึก', source: 'market', category: 'food' },
    { id: 'market_squid', name: 'Grilled Squid', cost: 190, energyRestore: 40, emoji: getFluent3D('Squid'), description: 'ปลาหมึกย่างหอมๆ เคี้ยวเพลิน', source: 'market', category: 'food' },
    { id: 'market_milk', name: 'Warm Milk', cost: 50, energyRestore: 10, emoji: getFluent3D('Glass of milk'), description: 'นมอุ่นช่วยให้หลับสบาย', source: 'market', category: 'food' },
    { id: 'cup_noodle', name: 'Cup Noodle', cost: 100, energyRestore: 10, emoji: getFluent3D('Steaming bowl'), description: 'เพื่อนแท้ยามดึก', source: 'market', category: 'gift' },
    { id: 'market_beer', name: 'Craft Beer', cost: 300, energyRestore: 5, emoji: getFluent3D('Beer mug'), description: 'เบียร์คราฟต์นุ่มๆ (ทำให้เมา)', source: 'market', category: 'gift', buffType: 'drunk', buffValue: 1, buffDurationMinutes: 30 },
    
    // NEW GIFTS: Chemistry Boosters
    { id: 'gift_teddy', name: 'Cuddly Bear', cost: 450, energyRestore: 0, emoji: getFluent3D('Teddy bear'), description: 'เพิ่ม Chemistry ทันที +25%', source: 'market', category: 'gift' },
    { id: 'gift_console', name: 'Retro Console', cost: 850, energyRestore: 0, emoji: getFluent3D('Video game'), description: 'เพิ่ม Chemistry ทันที +50%', source: 'market', category: 'gift' },

    // NEW GIFTS: Magic Ice Cream (Reroll Vibe)
    { id: 'gift_magic_ice_cream', name: 'Magic Ice Cream', cost: 100, currency: 'diamond', energyRestore: 0, emoji: getFluent3D('Soft ice cream'), description: 'สุ่มบรรยากาศรายวันใหม่!', source: 'market', category: 'gift' },

    // NEW: DEAD BRANCH (Rare Gift)
    { id: 'gift_dead_branch', name: 'Dead Branch', cost: 150, currency: 'diamond', energyRestore: 0, emoji: getFluent3D('Fallen leaf'), description: 'กิ่งไม้ลึกลับ... ใช้เรียกบรรยากาศแปลกๆ', source: 'market', category: 'gift' },

    // SPECIAL: GIFT VALUE (Money)
    { id: 'gift_gold', name: 'Ang Pao', cost: 0, energyRestore: 0, emoji: getFluent3D('Red envelope'), description: 'ซองแดงใส่เงิน', source: 'cafe', category: 'gift' },

    // MARKET GADGETS
    { id: 'gadget_music_pods', name: 'Music Alway Pods', cost: 2000, energyRestore: 0, emoji: getFluent3D('Musical note'), description: 'ฟังเพลงได้ทุกที่ (Music Player)', source: 'market', category: 'gadget', unlocksSkill: 'spotifi_premium' },
    { id: 'gadget_mind_reader', name: 'Neon Soul Visor', cost: 100000, energyRestore: 0, emoji: getFluent3D('Sunglasses'), description: 'อ่านใจคน (เห็นความคิด)', source: 'market', category: 'gadget', unlocksSkill: 'mind_reader' },

    // GIFTS / KEY ITEMS
    { id: 'gift_flowers', name: 'Bouquet', cost: 250, currency: 'diamond', energyRestore: 0, emoji: getFluent3D('Bouquet'), description: 'สัญลักษณ์แห่งความโรแมนติก', source: 'cafe', category: 'gift', unlocksTier: RelationshipTier.FLIRTING },
    { id: 'gift_ring', name: 'Promise Ring', cost: 1000, currency: 'diamond', energyRestore: 0, emoji: getFluent3D('Ring'), description: 'คำมั่นสัญญาของหัวใจ', source: 'cafe', category: 'gift', unlocksTier: RelationshipTier.PARTNER },
    { id: 'gift_bracelet', name: 'Friendship Bracelet', cost: 200, currency: 'diamond', energyRestore: 0, emoji: getFluent3D('Thread'), description: 'เพื่อนกันตลอดไป', source: 'cafe', category: 'gift', unlocksTier: RelationshipTier.BEST_FRIEND },
    { id: 'gift_jacket', name: 'Matching Jacket', cost: 900, currency: 'diamond', energyRestore: 0, emoji: getFluent3D('Coat'), description: 'คู่หูพี่น้องสุดซี้', source: 'cafe', category: 'gift', unlocksTier: RelationshipTier.SOUL_SIBLING },
    { id: 'spare_key', name: 'Spare Key', cost: 35000, energyRestore: 0, emoji: getFluent3D('Key'), description: 'กุญแจสำรอง เข้าห้องได้ตลอด', source: 'cafe', category: 'gift' },
    { id: 'gift_eternity_pendant', name: 'Eternity Pendant', cost: 150000, energyRestore: 0, emoji: getFluent3D('Milky way'), description: 'พันธะสัญญาชั่วนิรันดร์', source: 'cafe', category: 'gift', unlocksTier: RelationshipTier.ETERNAL },
];

// --- ACTION CONFIGURATION (Dynamic System) ---
export const ACTION_CONFIG: Record<string, { cost: number, tier: RelationshipTier, label: string, emoji: string, bonus: number }> = {
    // Basic (Legacy, dynamic defaults)
    poke: { cost: 2, tier: RelationshipTier.STRANGER, label: "Poke", emoji: "👉", bonus: 1 },
    headpat: { cost: 5, tier: RelationshipTier.ACQUAINTANCE, label: "Headpat", emoji: "👋", bonus: 2 },
    gift: { cost: 15, tier: RelationshipTier.STRANGER, label: "Give Bubble Tea", emoji: "🧋", bonus: 5 }, // RENAMED & EMOJI UPDATED

    // Signatures - Action A (Cost 2, Low Tier)
    cheer_up: { cost: 2, tier: RelationshipTier.STRANGER, label: "Cheer Up", emoji: "✌️", bonus: 2 },
    spot_check: { cost: 2, tier: RelationshipTier.STRANGER, label: "Spot Check", emoji: "💪", bonus: 2 },
    smell_check: { cost: 2, tier: RelationshipTier.STRANGER, label: "Smell Coffee", emoji: "☕", bonus: 2 },
    mini_heart: { cost: 2, tier: RelationshipTier.STRANGER, label: "Mini Heart", emoji: "🫰", bonus: 2 },
    check_watch: { cost: 2, tier: RelationshipTier.STRANGER, label: "Check Watch", emoji: "⌚", bonus: 2 },
    fix_tie: { cost: 2, tier: RelationshipTier.STRANGER, label: "Fix Tie", emoji: "👔", bonus: 2 }, // [FIX]: Moved to A for Marcus
    share_earbud: { cost: 2, tier: RelationshipTier.STRANGER, label: "Share Earbud", emoji: "🎧", bonus: 2 },
    give_postit: { cost: 20, tier: RelationshipTier.STRANGER, label: "Daily Affirmation", emoji: "📝", bonus: 3 }, // [MARCUS FIX] Bam Special: 20 Energy
    check_outfit: { cost: 2, tier: RelationshipTier.STRANGER, label: "Check Outfit", emoji: "👗", bonus: 2 }, // Jellie

    // Signatures - Action B (Cost 5, Friend Tier)
    cat_scratch: { cost: 5, tier: RelationshipTier.FRIEND, label: "Chin Scratch", emoji: "😼", bonus: 5 },
    wipe_sweat: { cost: 5, tier: RelationshipTier.FRIEND, label: "Wipe Sweat", emoji: "🧖‍♀️", bonus: 5 },
    fix_apron: { cost: 5, tier: RelationshipTier.FRIEND, label: "Fix Apron", emoji: "🎀", bonus: 5 },
    selfie: { cost: 5, tier: RelationshipTier.FRIEND, label: "Selfie", emoji: "📸", bonus: 5 },
    // fix_tie moved up
    poke_cheek: { cost: 5, tier: RelationshipTier.FRIEND, label: "Poke Cheek", emoji: "🤏", bonus: 5 },
    high_five: { cost: 20, tier: RelationshipTier.STRANGER, label: "High Five!", emoji: "🙏", bonus: 5 }, // [MARCUS FIX] Bam Energy: 20 Energy
    treat_snack: { cost: 5, tier: RelationshipTier.FRIEND, label: "Treat Snack", emoji: "🍡", bonus: 5 }, // Jellie

    // Romance (Progressive)
    hold_hands: { cost: 10, tier: RelationshipTier.FRIEND, label: "Hold Hands", emoji: "🤝", bonus: 3 },
    hug: { cost: 15, tier: RelationshipTier.FRIEND, label: "Hug", emoji: "🫂", bonus: 4 },
    kiss_cheek: { cost: 20, tier: RelationshipTier.FLIRTING, label: "Kiss Cheek", emoji: "😚", bonus: 6 },
    kiss: { cost: 30, tier: RelationshipTier.PARTNER, label: "Kiss", emoji: "💋", bonus: 10 },
    deep_kiss: { cost: 50, tier: RelationshipTier.PARTNER, label: "Deep Kiss", emoji: "🔥", bonus: 15 },
    
    // [MARCUS FIX]: NEW DATE INVITE
    invite_date: { cost: 0, tier: RelationshipTier.FRIEND, label: "Invite on Date", emoji: "🥂", bonus: 40 },

    // Items
    give_noodle: { cost: 5, tier: RelationshipTier.FRIEND, label: "Give Cup Noodle", emoji: "🍜", bonus: 8 },
    give_beer: { cost: 5, tier: RelationshipTier.FRIEND, label: "Give Beer", emoji: "🍺", bonus: 10 },
    give_teddy: { cost: 5, tier: RelationshipTier.STRANGER, label: "Give Teddy", emoji: "🧸", bonus: 10 }, // NEW
    give_console: { cost: 5, tier: RelationshipTier.STRANGER, label: "Give Console", emoji: "🎮", bonus: 15 }, // NEW
    gift_dead_branch: { cost: 0, tier: RelationshipTier.STRANGER, label: "Summon Vibe", emoji: "🍂", bonus: 0 }, // NEW: Cost is item consumption
    give_magic_ice_cream: { cost: 0, tier: RelationshipTier.STRANGER, label: "Reroll Vibe", emoji: "🍦", bonus: 15 }, // NEW: Cost is item consumption

    // Key Evolution Items
    // [MARCUS UPDATE]: Bouquet is now a high-value romantic gift (50 bonus)
    gift_bouquet: { cost: 0, tier: RelationshipTier.FRIEND, label: "Start Romance", emoji: "💐", bonus: 50 },
    gift_ring: { cost: 0, tier: RelationshipTier.FLIRTING, label: "Be Partner", emoji: "💍", bonus: 30 },
    
    gift_bracelet: { cost: 0, tier: RelationshipTier.FRIEND, label: "Give Bracelet", emoji: "🧵", bonus: 20 },
    gift_jacket: { cost: 0, tier: RelationshipTier.BEST_FRIEND, label: "Give Jacket", emoji: "🧥", bonus: 30 },
    
    gift_keycard: { cost: 0, tier: RelationshipTier.PARTNER, label: "Give Spare Key", emoji: "🔑", bonus: 20 }, // New Keycard Action
    
    // GOD TIER ACTION
    gift_eternity_pendant: { cost: 0, tier: RelationshipTier.SOULMATE, label: "Eternity Bond", emoji: "🌌", bonus: 500 },
};

// Map ActionType to ItemID for Consumption
export const ACTION_ITEM_MAP: Record<string, string> = {
    'gift': 'food_bubble_tea', // Default 'gift' action maps to bubble tea
    'give_noodle': 'cup_noodle',
    'give_beer': 'market_beer',
    'give_teddy': 'gift_teddy', // NEW
    'give_console': 'gift_console', // NEW
    'gift_bouquet': 'gift_flowers',
    'gift_bracelet': 'gift_bracelet',
    'gift_ring': 'gift_ring',
    'gift_jacket': 'gift_jacket',
    'gift_keycard': 'spare_key',
    'gift_eternity_pendant': 'gift_eternity_pendant',
    'gift_dead_branch': 'gift_dead_branch',
    'give_magic_ice_cream': 'gift_magic_ice_cream' // NEW
};

// [MARCUS NEW]: ICONIC GIFTS MAP
// 20% Chance for AI to give these items upon resolving events/quests
export const CHARACTER_GIFT_MAP: Record<CharacterId, string> = {
    miguel: 'cup_noodle',       // Late night comfort
    fia: 'protein_shake',       // Health forced
    peat: 'honey_lemon',        // Care for throat/voice
    erin: 'market_slushie',     // Fun vibe
    marcus: 'gift_gold',        // Money (Ang Pao)
    lucas: 'market_beer',       // Chill vibe
    bam: 'food_cookie',         // Sweet treat
    jellie: 'market_macaron',   // Fancy snack
    soul: 'market_milk',        // Gentle care
    mia: 'strawberry_cake',     // Maid service
};

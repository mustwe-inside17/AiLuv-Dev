
import { StyleItem } from '../types';

// --- FASHION CATALOG ---

// Collection 1: Night Market Basics (Cheap, Functional)
const BASICS: StyleItem[] = [
    {
        id: 'style_hoodie',
        name: 'Cozy Hoodie',
        collection: 'basics',
        cost: 1040,
        description: 'ฮู้ดดี้โอเวอร์ไซส์เนื้อนุ่มฟู ใส่แล้วอุ่นใจเหมือนมีคนกอดตลอดเวลา!',
        stats: { vit: 2 },
        socialBias: ['miguel', 'lucas'],
        unlockAvatarDesc: 'Hoodie (Introvert Vibe)',
        icon: '🧥'
    },
    {
        id: 'style_gym_tank',
        name: 'Gym Rat Tank',
        collection: 'basics',
        cost: 1560,
        description: 'เสื้อกล้ามระบายอากาศขั้นเทพ โชว์กล้ามเนื้อสุดเฟิร์มให้โลกจำ!',
        stats: { vit: 3 },
        socialBias: ['fia'],
        unlockAvatarDesc: 'Gym Wear (Sweat)',
        icon: '🎽'
    },
    {
        id: 'style_neon_tee',
        name: 'Neon Party Tee',
        collection: 'basics',
        cost: 1950,
        description: 'เสื้อยืดเรืองแสงสุดจี๊ด ไอเทมเด็ดที่ขาดไม่ได้สำหรับปาร์ตี้คืนนี้!',
        stats: { cha: 2 },
        socialBias: ['erin'],
        unlockAvatarDesc: 'Neon & Sunglasses',
        icon: '👕'
    }
];

// Collection 2: City Professional (Mid-Range, Social/Work)
const PROFESSIONAL: StyleItem[] = [
    {
        id: 'style_blazer',
        name: 'Smart Casual Blazer',
        collection: 'professional',
        cost: 5850,
        description: 'เบลเซอร์ทรงสมาร์ทแคชชวล ดูดีมีสไตล์แบบ CEO สตาร์ทอัพรุ่นใหม่!',
        stats: { int: 3, cha: 2 },
        socialBias: ['marcus', 'peat'],
        unlockAvatarDesc: 'Blazer & Tablet',
        icon: '👔'
    },
    {
        id: 'style_earth_tone',
        name: 'Minimalist Earth Tone',
        collection: 'professional',
        cost: 4940,
        description: 'ชุดผ้าลินินสีเอิร์ธโทนสุดมินิมอล ให้ลุคอบอุ่นละมุนใจจนใครก็ต้องมอง!',
        stats: { cha: 3 },
        socialBias: ['bam', 'miguel'],
        unlockAvatarDesc: 'Cafe Style (Beige)',
        icon: '🧣'
    },
    {
        id: 'style_date_night',
        name: 'First Date Outfit',
        collection: 'professional',
        cost: 7800,
        description: 'ชุดเดทแรกสุดเพอร์เฟกต์ จัดเต็มทุกดีเทล ดาเมจความน่ารักทะลุหลอด!',
        stats: { cha: 5, luck: 2 },
        socialBias: ['miguel', 'fia', 'peat', 'erin', 'marcus', 'lucas', 'bam', 'jellie'], // Universal
        unlockAvatarDesc: 'Charming Look',
        icon: '✨'
    }
];

// Collection 3: VANDAL X EXCLUSIVE (Expensive, High Status)
const VANDAL: StyleItem[] = [
    {
        id: 'style_vandal_tee',
        name: 'VANDAL Logo Tee',
        collection: 'vandal',
        cost: 2600,
        description: 'เสื้อยืดโลโก้ VANDAL สุดคลาสสิก เรียบง่ายแต่แฝงไปด้วยพลังความเท่!',
        stats: { vit: 1, cha: 1 },
        socialBias: ['jellie', 'bam'],
        unlockAvatarDesc: 'VANDAL Street Tee',
        icon: '👕'
    },
    {
        id: 'style_vandal_bomber',
        name: 'VANDAL Street Bomber',
        collection: 'vandal',
        cost: 5850,
        description: 'แจ็คเก็ตบอมเบอร์โอเวอร์ไซส์สุดไฮป์ กันหนาวได้แถมสแวกเกอร์เกินร้อย!',
        stats: { vit: 1, luck: 2 },
        socialBias: ['jellie', 'lucas'],
        unlockAvatarDesc: 'Street Jacket',
        icon: '🧥'
    },
    {
        id: 'style_vandal_black',
        name: 'VANDAL: Black Edition',
        collection: 'vandal',
        cost: 32500,
        description: 'สตรีทแวร์ระดับตำนานสีดำล้วน ไอเทมแรร์ที่เปิดประตู VIP ให้คุณทุกที่!',
        stats: { vit: 3, int: 3, cha: 3, luck: 3 }, // All Stats +3
        socialBias: ['jellie', 'erin'],
        unlockAvatarDesc: 'Full Black VANDAL',
        icon: '🏴'
    },
    {
        id: 'style_ceo_suit',
        name: 'The Secret CEO Suit',
        collection: 'vandal',
        cost: 65000,
        description: 'สูทสั่งตัดพิเศษทอด้วยด้ายทองคำ สวมปุ๊บออร่าผู้บริหารระดับสูงจับปั๊บ!',
        stats: { int: 10, cha: 10 },
        socialBias: ['marcus'],
        unlockAvatarDesc: 'Luxury Suit & Wine',
        icon: '🕴️'
    }
];

export const FASHION_ITEMS: StyleItem[] = [
    ...BASICS,
    ...PROFESSIONAL,
    ...VANDAL
];

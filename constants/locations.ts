
import { LocationId, CharacterId, Job, Workout } from '../types';

// COMPACT CLUSTER: Keep everything very close to center (50, 50)
// This ensures they are visible immediately, but you can still drag slightly to look around.
export const LOCATIONS: Record<LocationId, { id: LocationId, name: string, description: string, characterId?: CharacterId, bgGradient: string, icon: string, coordinates: { x: number, y: number } }> = {
  home: {
    id: 'home',
    name: "My Room",
    description: "ห้องนอนส่วนตัว พักผ่อนและเติมพลัง",
    bgGradient: "from-indigo-50 via-purple-50 to-white",
    icon: "🏠",
    coordinates: { x: 50, y: 58 } // Center Bottom
  },
  condo: {
    id: 'condo',
    name: "Miguel's Condo",
    description: "คอนโดของมิเกล วิวดีใช้ได้เลยนะ",
    characterId: 'miguel',
    bgGradient: "from-pink-50 via-purple-50 to-white",
    icon: "🏢",
    coordinates: { x: 42, y: 52 } // Left Center
  },
  gym: {
    id: 'gym',
    name: "Iron Paradise Gym",
    description: "อยากเพิ่ม Energy ใช่ไหม? ลองมาออกกำลังกายสิ",
    characterId: 'fia',
    bgGradient: "from-orange-50 via-red-50 to-white",
    icon: "🏋️‍♀️",
    coordinates: { x: 38, y: 42 } // Top Left
  },
  cafe: {
    id: 'cafe',
    name: "Cat & Cup Cafe",
    description: "คาเฟ่ บรรยากาศชิล มีบริการอาหารและเครื่องดื่ม",
    characterId: 'peat',
    bgGradient: "from-green-50 via-emerald-50 to-white",
    icon: "☕",
    coordinates: { x: 50, y: 48 } // Dead Center
  },
  office: {
    id: 'office',
    name: "Co-Working Space",
    description: "สถานที่ทำงาน เงียบสงบ สำหรับการสร้างรายได้",
    characterId: 'marcus', 
    bgGradient: "from-blue-50 via-indigo-50 to-white",
    icon: "💼",
    coordinates: { x: 62, y: 40 } // Top Right
  },
  market: {
    id: 'market',
    name: "Night Sky Market",
    description: "ชีวิตกลางคืนเริ่มต้นขึ้นแล้ว ของกินอร่อยมาก",
    characterId: 'erin',
    bgGradient: "from-fuchsia-900 via-purple-900 to-indigo-900",
    icon: "🌃",
    coordinates: { x: 60, y: 50 } // Right Center
  },
  basement: {
    id: 'basement',
    name: "The Basement",
    description: "เสียงดนตรี และจังหวะแห่งชีวิต คุณได้ยินใช่ไหม?",
    characterId: 'lucas', 
    bgGradient: "from-purple-950 via-violet-950 to-black",
    icon: "🎧",
    coordinates: { x: 65, y: 62 } // Bottom Right
  },
  cafe_2f: {
    id: 'cafe_2f',
    name: "Cat & Cup Cafe 2nd floor",
    description: "คาเฟ่ชั้น 2 เหมาะกับการอ่านหนังสือและติวสอบ",
    characterId: 'bam',
    bgGradient: "from-rose-50 via-orange-50 to-yellow-50",
    icon: "🌤️",
    coordinates: { x: 53, y: 41 } // Staggered from cafe
  },
  mall: {
    id: 'mall',
    name: "Fashion Mall",
    description: "ห้างหรูใจกลางเมือง แหล่งรวมแฟชั่นชั้นนำ",
    characterId: 'jellie',
    bgGradient: "from-cyan-50 via-fuchsia-50 to-white",
    icon: "🛍️",
    coordinates: { x: 30, y: 55 } // Far Left
  },
  gacha_shop: {
    id: 'gacha_shop',
    name: "Gacha Pong Plaza",
    description: "เสี่ยงดวง ลุ้นรับไอเทมระดับตำนาน!",
    bgGradient: "from-indigo-600 via-purple-600 to-pink-500",
    icon: "🎰",
    coordinates: { x: 36, y: 62 } // Moved closer to center (Was 25, 68)
  },
  vet: {
    id: 'vet',
    name: "Paws & Pillow",
    description: "คลินิกและโรงแรมสัตว์เลี้ยง พื้นที่พักใจ",
    characterId: 'soul',
    bgGradient: "from-teal-50 via-emerald-50 to-cyan-50",
    icon: "🐾",
    coordinates: { x: 57, y: 34 } // Moved closer to center (Was 65, 32)
  },
  // NEW: MIA'S LOCATION (Dual Theme handled by UI assets later)
  maid_cafe: {
    id: 'maid_cafe',
    name: "AiMaid Cafe", 
    description: "Day: Maid Cafe. Night: Exclusive Lounge.",
    characterId: 'mia',
    bgGradient: "from-pink-300 via-rose-300 to-red-400",
    icon: "🎀",
    coordinates: { x: 43, y: 34 } // Moved closer to center (Was 35, 35)
  }
};

export const JOBS_LIST: Job[] = [
  { 
    id: 'job_1', 
    name: 'งานพาร์ทไทม์ทั่วไป', 
    description: 'คีย์ข้อมูลเอกสารด่วน', 
    energyCost: 5, 
    durationSeconds: 5, 
    goldReward: 15, 
    expReward: 5, 
    cooldownMinutes: 1 
  },
  { 
    id: 'job_2', 
    name: 'รับจ็อบฟรีแลนซ์', 
    description: 'ช่วยงานกราฟิกดีไซน์', 
    energyCost: 20, 
    durationSeconds: 30, 
    goldReward: 70, 
    expReward: 25, 
    cooldownMinutes: 10 
  },
  { 
    id: 'job_3', 
    name: 'เข้ากะร้านกาแฟ', 
    description: 'ชงกาแฟช่วยพี่พีท', 
    energyCost: 80, 
    durationSeconds: 75, 
    goldReward: 200, 
    expReward: 70 
    // No cooldown
  },
  { 
    id: 'job_4', 
    name: 'ผู้ช่วยอินฟลูเอนเซอร์', 
    description: 'ช่วยเอรินถ่ายคอนเทนต์', 
    energyCost: 25, 
    durationSeconds: 45, 
    goldReward: 90, 
    expReward: 35, 
    cooldownMinutes: 15 
  },
];

export const WORKOUT_LIST: Workout[] = [
  { 
    id: 'gym_1', 
    name: 'ยืดเหยียดกล้ามเนื้อ', 
    description: 'วอร์มอัพร่างกายเบาๆ', 
    energyCost: 10, 
    durationSeconds: 10, 
    maxEnergyGain: 1, 
    expReward: 15,
    goldCost: 39, 
    cooldownMinutes: 0 
  },
  { 
    id: 'gym_2', 
    name: 'โยคะ', 
    description: 'ฝึกสมาธิและจัดระเบียบร่างกาย', 
    energyCost: 30, 
    durationSeconds: 30, 
    maxEnergyGain: 2, // Adjusted: +2 Perm
    expReward: 45,
    goldCost: 65,
    cooldownMinutes: 720, // 12 Hours
    // New: Overcharge Buff +15 for 12h
    buffReward: {
        type: 'overlimit',
        value: 15,
        durationMinutes: 720 // 12h
    }
  },
  { 
    id: 'gym_3', 
    name: 'คาร์ดิโอ HIIT', 
    description: 'เบิร์นไขมันขั้นสุด', 
    energyCost: 60, 
    durationSeconds: 60, 
    maxEnergyGain: 3, // Adjusted: +3 Perm
    expReward: 90,
    goldCost: 130,
    cooldownMinutes: 720, // 12 Hours
    // New: Overcharge Buff +35 for 12h
    buffReward: {
        type: 'overlimit',
        value: 35,
        durationMinutes: 720 // 12h
    }
  },
];

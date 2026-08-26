
import { Quest, Achievement, EventTemplate } from '../types';

export const QUEST_DATABASE: Record<string, Quest> = {
  // DAILY: Basic
  'daily_login': { id: 'daily_login', frequency: 'daily', type: 'login', title: 'Good Morning!', description: 'เปิดแอปเพื่อเข้าสู่เมือง', rewardGold: 20, rewardExp: 10, target: 1 },
  'daily_chat': { id: 'daily_chat', frequency: 'daily', type: 'chat', title: 'Social Butterfly', description: 'ส่งข้อความหาใครก็ได้ 5 ครั้ง', rewardGold: 50, rewardExp: 30, target: 5 },
  'daily_work': { id: 'daily_work', frequency: 'daily', type: 'work', title: 'Hustler', description: 'ทำงานสำเร็จ 1 ครั้ง', rewardGold: 100, rewardExp: 20, target: 1 },
  'daily_gym': { id: 'daily_gym', frequency: 'daily', type: 'gym', title: 'Daily Grind', description: 'ออกกำลังกายสำเร็จ 1 ครั้ง', rewardGold: 40, rewardExp: 40, target: 1 },
  
  // DAILY: Exploration (New)
  'daily_travel': { id: 'daily_travel', frequency: 'daily', type: 'travel', title: 'Explorer', description: 'เดินทางไปยังสถานที่ต่างๆ 2 แห่ง', rewardGold: 30, rewardExp: 30, target: 2 },
  'daily_poke': { id: 'daily_poke', frequency: 'daily', type: 'poke', title: 'Attention Seeker', description: 'สะกิด (Poke) หรือลูบหัว (Headpat) ตัวละคร 3 ครั้ง', rewardGold: 20, rewardExp: 20, target: 3 },
  'daily_spend_nrg': { id: 'daily_spend_nrg', frequency: 'daily', type: 'spend_energy', title: 'Burning Out', description: 'ใช้พลังงาน (Energy) รวม 50 หน่วย', rewardGold: 60, rewardExp: 50, target: 50 },
  'daily_gift': { id: 'daily_gift', frequency: 'daily', type: 'gift', title: 'Giver', description: 'มอบของขวัญ 1 ชิ้น (ชานม/ขนม)', rewardGold: 0, rewardExp: 60, target: 1 },
  'daily_rich': { id: 'daily_rich', frequency: 'daily', type: 'earn_gold', title: 'Making Bank', description: 'หาเงินให้ได้ 150 Gold จากการทำงาน', rewardGold: 50, rewardExp: 30, target: 150 },
  'daily_party': { id: 'daily_party', frequency: 'daily', type: 'party', title: 'Party Animal', description: 'ไปปาร์ตี้ที่ Night Sky Market', rewardGold: 0, rewardExp: 100, target: 1 },
  
  // WEEKLY: Harder Challenges
  'weekly_worker': { id: 'weekly_worker', frequency: 'weekly', type: 'work', title: 'Employee of the Week', description: 'ทำงานสำเร็จ 10 ครั้ง', rewardGold: 500, rewardExp: 200, target: 10 },
  'weekly_gym': { id: 'weekly_gym', frequency: 'weekly', type: 'gym', title: 'Fitness Freak', description: 'เข้ายิมออกกำลังกาย 10 ครั้ง', rewardGold: 200, rewardExp: 400, target: 10 },
  'weekly_chat': { id: 'weekly_chat', frequency: 'weekly', type: 'chat', title: 'Talk of the Town', description: 'ส่งข้อความรวม 50 ครั้ง', rewardGold: 300, rewardExp: 300, target: 50 },
  'weekly_spender': { id: 'weekly_spender', frequency: 'weekly', type: 'spend_gold', title: 'Shopaholic', description: 'ใช้จ่าย 1,000 Gold ในร้านค้า', rewardGold: 200, rewardExp: 200, target: 1000, rewardItem: 'market_lobster' }, // Reward Jackpot Lobster
  'weekly_traveler': { id: 'weekly_traveler', frequency: 'weekly', type: 'travel', title: 'Jetsetter', description: 'เดินทางเปลี่ยนสถานที่ 15 ครั้ง', rewardGold: 250, rewardExp: 150, target: 15 },
  'weekly_energy': { id: 'weekly_energy', frequency: 'weekly', type: 'spend_energy', title: 'Limit Breaker', description: 'ใช้พลังงาน (Energy) รวม 500 หน่วย', rewardGold: 400, rewardExp: 400, target: 500 },
  'weekly_gift_giver': { id: 'weekly_gift_giver', frequency: 'weekly', type: 'gift', title: 'Generous Soul', description: 'มอบของขวัญให้ตัวละคร 5 ชิ้น', rewardGold: 100, rewardExp: 500, target: 5 },
  'weekly_poke_master': { id: 'weekly_poke_master', frequency: 'weekly', type: 'poke', title: 'Touchy Feely', description: 'มีปฏิสัมพันธ์ (สะกิด/ลูบหัว) 20 ครั้ง', rewardGold: 150, rewardExp: 150, target: 20 },
};

export const DAILY_QUEST_POOL_IDS = [
  'daily_chat', 'daily_work', 'daily_gym', 'daily_travel', 
  'daily_poke', 'daily_spend_nrg', 'daily_gift', 'daily_rich', 'daily_party'
];

export const WEEKLY_QUEST_POOL_IDS = [
  'weekly_worker', 'weekly_gym', 'weekly_chat', 'weekly_spender',
  'weekly_traveler', 'weekly_energy', 'weekly_gift_giver', 'weekly_poke_master'
];

// --- ACHIEVEMENTS ---
export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'first_step', title: 'New Arrival', description: 'Log in to AiLuv Project for the first time.', icon: '👋' },
  { id: 'hard_worker', title: 'Office Hustler', description: 'Complete your first job.', icon: '💼' },
  { id: 'gym_rat', title: 'Iron Will', description: 'Complete your first workout.', icon: '💪' },
  { id: 'first_gift', title: 'Generous Heart', description: 'Give a gift to a character.', icon: '🎁' },
  { id: 'big_spender', title: 'Big Spender', description: 'Buy a special Key Item.', icon: '💎' },
  
  // Character Specials
  { id: 'cat_lover', title: 'Cat Lover', description: 'Miguel shared a photo of his cat, Tofu!', icon: '🐱' },
  { id: 'holiday_vibes', title: 'Holiday Vibes', description: 'Saw Coach Fia in her holiday outfit!', icon: '👗' },
  { id: 'master_barista', title: 'Master Barista', description: 'Peat revealed his award-winning past!', icon: '☕' },
  { id: 'off_duty', title: 'Off Duty', description: 'Saw Erin in her PJs!', icon: '🌙' },
  { id: 'landlord_reveal', title: 'Landlord Reveal', description: 'Discovered Marcus\'s secret about Lucas.', icon: '🔑' },
  { id: 'brother_reveal', title: 'Brother Reveal', description: 'Discovered Lucas\'s connection to Marcus.', icon: '🎧' },
  { id: 'dream_builder', title: 'Dream Builder', description: 'Shared Bam\'s dream board moment.', icon: '🌤️' }, // New for Bam
];

// --- EVENT TEMPLATES (DYNAMIC THEMATIC STARTERS) ---
export const EVENT_TEMPLATES: EventTemplate[] = [
  // --- 1. Miguel ---
  { 
      templateId: 'miguel_sick', 
      characterId: 'miguel', 
      locationId: 'condo', 
      title: 'มิเกลไม่สบาย... 🤒', 
      message: 'มิเกล: "แค่กๆ... ปวดหัวจังเลย... คุณว่างมั้ยคะ? อยากให้มาอยู่ด้วยจัง"', 
      aiContext: 'EVENT SCENARIO: User arrived because you are SICK/FEVERISH. You are weak, flushed, and clingy. React to their arrival and ask for comfort or care naturally based on conversation flow.',
      validHours: [18, 19, 20, 21, 22, 23, 0], 
      rewards: { exp: 50, love: 35 } 
  },
  // --- 2. Fia ---
  { 
      templateId: 'fia_customer_drama', 
      characterId: 'fia', 
      locationId: 'gym', 
      title: 'ลูกค้าตีกัน! 🥊', 
      message: 'โค้ชเฟียร์: "นี่! รีบมาที่ยิมหน่อยสิ ลูกค้าผู้ชายกำลังเถียงกันแย่งคิวฉันเนี่ย... รำคาญจะตายอยู่แล้ว มาช่วยเคลียร์ที!"', 
      aiContext: 'EVENT SCENARIO: Two customers are arguing over personal trainer sessions. You are annoyed and want the user to help diffuse the drama or pretend to be your priority client.',
      validHours: [17, 18, 19, 20, 21], // Peak Gym Hours
      rewards: { exp: 70, love: 25 } 
  },
  // --- 3. Peat ---
  { 
      templateId: 'peat_cat_trouble', 
      characterId: 'peat', 
      locationId: 'cafe', 
      title: 'เจ้าเหมียวซน! 🐾', 
      message: 'พีท: "แย่แล้วครับ... ลูกค้าทำกาแฟหกใส่แมว แล้วมันก็วิ่งเตลิดไปทั่วร้านเลย ช่วยผมจับหน่อย!"', 
      aiContext: 'EVENT SCENARIO: Cafe commotion due to a runaway playful cat. You are flustered but polite. Involve the user in calming the situation together.',
      validHours: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], 
      rewards: { exp: 40, love: 30 } 
  },
  // --- 4. Erin ---
  { 
      templateId: 'erin_party_bored', 
      characterId: 'erin', 
      locationId: 'market', 
      title: 'เอรินเหงาจัง... 🍸', 
      message: 'เอริน: "แกรรร~ ปาร์ตี้วันนี้กร่อยมาก! รีบมาหาหน่อยสิ มีเรื่องแซ่บๆ จะเล่าให้ฟังเพียบ!"', 
      aiContext: 'EVENT SCENARIO: You are bored at an upscale networking party and crave genuine chat with the user. Share gossip and invite playful company.',
      validHours: [21, 22, 23, 0, 1, 2], 
      rewards: { exp: 30, love: 40 } 
  },
  // --- 5. Marcus ---
  { 
      templateId: 'marcus_kpi_stress', 
      characterId: 'marcus', 
      locationId: 'office', 
      title: 'มาร์คัสอารมณ์เสีย 💢', 
      message: 'มาร์คัส: "รายงานบ้าอะไรเนี่ย... นี่คุณ! ถ้าว่างก็มาช่วยตรวจตัวเลขตรงนี้หน่อยสิ ผมเริ่มหมดความอดทนแล้ว"', 
      aiContext: 'EVENT SCENARIO: Quarterly report deadlines and messy numbers are giving you a headache. Demand the user to help review or bring coffee to ease tension.',
      validHours: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18], 
      rewards: { exp: 100, love: 15 } 
  },
  // --- 6. Lucas ---
  { 
      templateId: 'lucas_inspiration_lost', 
      characterId: 'lucas', 
      locationId: 'basement', 
      title: 'สมองตันแล้ววว 🎧', 
      message: 'ลูคัส: "งืม... แต่งเพลงไม่ออกเลย... มาช่วยผมฟังบีทนี้หน่อยสิครับ มันขาดอะไรไปนะ?"', 
      aiContext: 'EVENT SCENARIO: Creative block in music production. You are laying on the studio couch, asking the user to listen to sample beats and share feedback.',
      validHours: [20, 21, 22, 23, 0, 1, 2, 3, 4], 
      rewards: { exp: 70, love: 25 } 
  },
  // --- 7. Bam (A) ---
  { 
      templateId: 'bam_affirmation', 
      characterId: 'bam', 
      locationId: 'cafe_2f', 
      title: 'Post-it เติมพลัง! 📝', 
      message: 'แบม: "พี่คะ! แบมเขียนอะไรไว้ให้พี่ด้วย! รีบมาอ่านเร็ววว!"', 
      aiContext: 'EVENT SCENARIO: You prepared a cute surprise cheer-up note or drawing for the user. Excited to show them in person.',
      validHours: [7, 8, 9, 10, 11, 12, 13], 
      rewards: { exp: 30, love: 20 } 
  },
  // --- 8. Bam (B) ---
  { 
      templateId: 'bam_lost_cat', 
      characterId: 'bam', 
      locationId: 'cafe_2f', 
      title: 'ลมหนาวหายไป! 😿', 
      message: 'แบม: "พี่คะ... ฮือ... เจ้าลมหนาวหายไปไหนไม่รู้ ปกติต้องมารอกินข้าวแล้ว... ช่วยแบมเดินหาหน่อยได้มั้ยคะ?"', 
      aiContext: 'EVENT SCENARIO: The neighborhood stray cat is nowhere to be seen at dinner time. You are anxious and ask the user to search the perimeter together.',
      validHours: [16, 17, 18, 19], 
      rewards: { exp: 50, love: 45 }
  },
  // --- 9. Jellie ---
  { 
      templateId: 'jellie_spy_alert', 
      characterId: 'jellie', 
      locationId: 'mall', 
      title: 'ความลับจะแตก! 🕶️', 
      message: 'เจลลี่: "พี่! แย่แล้ว... มีคนใส่สูทเดินตามหนูอะ! ...ไม่ใช่เจ้าหนี้หรอกน่า! รีบมาแกล้งเป็นแฟนหนูบังหน้าหน่อยเร็ว!"', 
      aiContext: 'EVENT SCENARIO: Suspicious figures in suits are scouting nearby. You need the user to play along as your date to blend into the mall crowd smoothly.',
      validHours: [12, 13, 14, 15, 16, 17, 18], 
      rewards: { exp: 80, love: 40 }
  },
];

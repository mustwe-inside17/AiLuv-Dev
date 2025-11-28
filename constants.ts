
import { Mood, Quest, Job, ShopItem, Workout, LocationId, CharacterId, RelationshipTier } from './types';

// Constants
export const INITIAL_MAX_ENERGY = 100;
export const INITIAL_ENERGY = 100;
export const INITIAL_GOLD = 50; 
export const INITIAL_REQUIRED_EXP = 100;
export const EXP_PER_MESSAGE = 15;
export const TRAVEL_COST = 5;

// Relationship Scaling
export const MAX_LOVE = 5000; // Increased from 100 to 5000 for long-term play
export const INITIAL_LOVE = 0;

// Thresholds to REACH the NEXT tier (Caps)
export const TIER_THRESHOLDS: Record<RelationshipTier, number> = {
  [RelationshipTier.STRANGER]: 0,
  [RelationshipTier.ACQUAINTANCE]: 200, // Cap at 200 until unlocked
  [RelationshipTier.FRIEND]: 500,       // Cap at 500 until unlocked
  [RelationshipTier.FLIRTING]: 1000,    // Cap at 1000 until unlocked
  [RelationshipTier.PARTNER]: 2000,     // Cap at 2000 until unlocked
  [RelationshipTier.SOULMATE]: 5000     // Endgame
};

// Storage Keys
export const STORAGE_KEY_GAME_STATE = 'miguel_sim_gamestate_v3'; // Bumped version
export const STORAGE_KEY_MESSAGES = 'miguel_sim_messages_v2';
export const STORAGE_KEY_LAST_SAVE = 'miguel_sim_last_save';
export const STORAGE_KEY_USER_PROFILE = 'miguel_sim_user_profile';

// User Avatar (Player)
export const USER_AVATAR = "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4";

// --- CHARACTERS ---

// 1. Miguel (Updated to Firebase Full Paths)
export const MIGUEL_IMG_BASE = "characters/miguel/neutral.png"; 

export const MIGUEL_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/miguel/neutral.png", "characters/miguel/neutral2.png"],
  [Mood.HAPPY]:     ["characters/miguel/happy.png", "characters/miguel/happy2.png"],
  [Mood.SHY]:       ["characters/miguel/shy.png", "characters/miguel/shy2.png"],
  [Mood.ANGRY]:     ["characters/miguel/angry.png", "characters/miguel/angry2.png"],
  [Mood.FLIRTY]:    ["characters/miguel/flirty.png", "characters/miguel/flirty2.png"],
  [Mood.CONFIDENT]: ["characters/miguel/confident.png", "characters/miguel/confident2.png"],
  [Mood.TIRED]:     ["characters/miguel/tired.png", "characters/miguel/tired2.png"],
  [Mood.SURPRISED]: ["characters/miguel/surprised.png", "characters/miguel/surprised2.png"],
  [Mood.WORKING]:   ["characters/miguel/working.png"],
  [Mood.DRINKING]:  ["characters/miguel/special_boba.png"],
};

// 2. Coach Fia (Firebase Paths)
export const FIA_IMG_BASE = "characters/fia/neutral.png";
export const FIA_MOODS: Partial<Record<Mood, string[]>> = {
  [Mood.NEUTRAL]:   ["characters/fia/neutral.png"],
  [Mood.HAPPY]:     ["characters/fia/happy.png"],
  [Mood.CONFIDENT]: ["characters/fia/confident.png"],
  [Mood.ENERGETIC]: ["characters/fia/energetic.png"],
  [Mood.ANGRY]:     ["characters/fia/angry.png"],
  [Mood.SAD]:       ["characters/fia/sad.png"],
  [Mood.WORKING]:   ["characters/fia/working.png"],
};

export const CHARACTER_DATA: Record<CharacterId, { name: string, description: string, baseImg: string, moods: any, color: string }> = {
  miguel: {
    name: 'Miguel',
    description: 'Freelance Graphic Designer',
    baseImg: MIGUEL_IMG_BASE,
    moods: MIGUEL_MOODS,
    color: 'text-pink-500'
  },
  fia: {
    name: 'Coach Fia',
    description: 'Personal Trainer & Nutritionist',
    baseImg: FIA_IMG_BASE,
    moods: FIA_MOODS,
    color: 'text-[#FF5F1F]' // Neon Orange
  }
};

// --- LOCATIONS ---

export const LOCATIONS: Record<LocationId, { id: LocationId, name: string, description: string, characterId?: CharacterId, bgGradient: string, icon: string }> = {
  condo: {
    id: 'condo',
    name: "Miguel's Condo",
    description: "Cozy vibes & chill time",
    characterId: 'miguel',
    bgGradient: "from-pink-50 via-purple-50 to-white",
    icon: "🏢"
  },
  gym: {
    id: 'gym',
    name: "Iron Paradise Gym",
    description: "Train with Coach Fia",
    characterId: 'fia',
    bgGradient: "from-orange-50 via-red-50 to-white",
    icon: "🏋️‍♀️"
  },
  cafe: {
    id: 'cafe',
    name: "Cat & Cup Cafe",
    description: "Relax & Refuel",
    bgGradient: "from-green-50 via-emerald-50 to-white",
    icon: "☕"
  },
  office: {
    id: 'office',
    name: "Co-Working Space",
    description: "Hustle for Gold",
    bgGradient: "from-blue-50 via-indigo-50 to-white",
    icon: "💼"
  }
};

export const MOOD_COLORS: Record<Mood, string> = {
  [Mood.NEUTRAL]: 'border-slate-300 shadow-slate-200',
  [Mood.HAPPY]: 'border-yellow-300 shadow-yellow-100',
  [Mood.SHY]: 'border-pink-300 shadow-pink-200',
  [Mood.ANGRY]: 'border-red-300 shadow-red-200',
  [Mood.FLIRTY]: 'border-purple-300 shadow-purple-200',
  [Mood.SURPRISED]: 'border-indigo-300 shadow-indigo-200',
  [Mood.TIRED]: 'border-gray-400 shadow-gray-300',
  [Mood.CONFIDENT]: 'border-orange-400 shadow-orange-300',
  [Mood.ENERGETIC]: 'border-red-400 shadow-red-300',
  [Mood.SAD]: 'border-blue-400 shadow-blue-300',
  [Mood.DRINKING]: 'border-amber-400 shadow-amber-300',
  [Mood.WORKING]: 'border-blue-300 shadow-blue-200',
};

export const DAILY_QUESTS: Quest[] = [
  { 
    id: 'daily_login', 
    type: 'login', 
    title: 'Good Morning!', 
    description: 'Open the app to see the city.', 
    rewardGold: 20, 
    rewardExp: 10,
    target: 1 
  },
  { 
    id: 'daily_chat', 
    type: 'chat', 
    title: 'Social Butterfly', 
    description: 'Send 5 messages to anyone.', 
    rewardGold: 50, 
    rewardExp: 30,
    target: 5 
  },
  { 
    id: 'daily_work', 
    type: 'work', 
    title: 'Hustler', 
    description: 'Complete 1 Work task at Office.', 
    rewardGold: 100, 
    rewardExp: 20,
    target: 1 
  },
  { 
    id: 'daily_gym', 
    type: 'gym', 
    title: 'No Pain No Gain', 
    description: 'Complete 1 Workout at Gym.', 
    rewardGold: 40, 
    rewardExp: 40,
    target: 1 
  },
];

// --- ECOSYSTEM DATA ---

export const JOBS_LIST: Job[] = [
  { id: 'job_1', name: 'Micro Task', description: 'Quick data entry', energyCost: 5, durationSeconds: 5, goldReward: 10 },
  { id: 'job_2', name: 'Freelance Gig', description: 'Graphic design help', energyCost: 20, durationSeconds: 30, goldReward: 50 },
  { id: 'job_3', name: 'Part-time Shift', description: 'Cafe barista', energyCost: 50, durationSeconds: 60, goldReward: 150 },
];

export const SHOP_ITEMS: ShopItem[] = [
  // Consumables
  { id: 'food_1', name: 'Cookie', cost: 15, energyRestore: 10, emoji: '🍪', description: 'Quick snack' },
  { id: 'food_2', name: 'Bubble Tea', cost: 40, energyRestore: 30, emoji: '🧋', description: "Miguel's favorite" },
  { id: 'food_3', name: 'Full Meal', cost: 100, energyRestore: 100, emoji: '🍱', description: 'Fully restore energy' },
  
  // Key Items (Unlock Tiers)
  { 
    id: 'gift_flowers', 
    name: 'Bouquet', 
    cost: 500, 
    energyRestore: 0, 
    emoji: '💐', 
    description: 'Unlock "Friend" -> "Flirting" (Requires 500 Love)', 
    unlocksTier: RelationshipTier.FLIRTING 
  },
  { 
    id: 'gift_ring', 
    name: 'Promise Ring', 
    cost: 2000, 
    energyRestore: 0, 
    emoji: '💍', 
    description: 'Unlock "Flirting" -> "Partner" (Requires 1000 Love)', 
    unlocksTier: RelationshipTier.PARTNER 
  },
];

export const WORKOUT_LIST: Workout[] = [
  { id: 'gym_1', name: 'Stretching', description: 'Light warm-up', energyCost: 10, durationSeconds: 10, maxEnergyGain: 1 },
  { id: 'gym_2', name: 'Yoga', description: 'Mind & Body balance', energyCost: 30, durationSeconds: 30, maxEnergyGain: 3 },
  { id: 'gym_3', name: 'HIIT Cardio', description: 'Burn fat fast', energyCost: 60, durationSeconds: 60, maxEnergyGain: 7 },
];


import { GameState, Mood, RelationshipTier, PlayerAttributes, CharacterId, Skill, MailItem } from '../types';
import { getCharacterMoodOnArrival } from './characters';
import { getRandomTheme } from './themes'; // Import helper

// Constants
export const INITIAL_MAX_ENERGY = 100;
export const INITIAL_ENERGY = 100;
export const INITIAL_GOLD = 50; 
export const INITIAL_REQUIRED_EXP = 100;
export const EXP_PER_MESSAGE = 10; 
export const CHAT_COST = 5; 
export const TRAVEL_COST = 5;

// Relationship Scaling
export const MAX_LOVE = 100000; // Increased Cap for ETERNAL
export const INITIAL_LOVE = 0;

export const INITIAL_STATS: PlayerAttributes = {
  vit: 1,
  int: 1,
  cha: 1,
  luck: 1,
  points: 0
};

// Helper to get initial dynamic moods
const getInitialMoods = (): Record<CharacterId, Mood> => ({
    miguel: getCharacterMoodOnArrival('miguel'),
    fia: getCharacterMoodOnArrival('fia'),
    peat: getCharacterMoodOnArrival('peat'),
    erin: getCharacterMoodOnArrival('erin'),
    marcus: getCharacterMoodOnArrival('marcus'),
    lucas: getCharacterMoodOnArrival('lucas'),
    bam: getCharacterMoodOnArrival('bam'),
    jellie: getCharacterMoodOnArrival('jellie'),
    soul: getCharacterMoodOnArrival('soul'),
    mia: getCharacterMoodOnArrival('mia'),
});

// Helper to get initial themes
const getInitialThemes = (): Record<CharacterId, string> => ({
    miguel: getRandomTheme('miguel'),
    fia: getRandomTheme('fia'),
    peat: getRandomTheme('peat'),
    erin: getRandomTheme('erin'),
    marcus: getRandomTheme('marcus'),
    lucas: getRandomTheme('lucas'),
    bam: getRandomTheme('bam'),
    jellie: getRandomTheme('jellie'),
    soul: getRandomTheme('soul'),
    mia: getRandomTheme('mia'),
});

// --- DAILY LOGIN REWARDS CONFIG ---
export const DAILY_LOGIN_REWARDS = [
    { day: 1, type: 'diamond', value: 50 },
    { day: 2, type: 'diamond', value: 100 },
    { day: 3, type: 'diamond', value: 150 },
    { day: 4, type: 'item', id: 'omakase', label: 'Omakase' },
    { day: 5, type: 'item', id: 'gift_flowers', label: 'Bouquet' },
    { day: 6, type: 'item', id: 'gift_ring', label: 'Promise Ring' },
    { day: 7, type: 'diamond', value: 900, isGrand: true },
];

// --- INITIAL MAILS ---
// Starter mails are managed and delivered via mailSystem.ts with hasReceivedStarterMails flag
const INITIAL_MAILS: MailItem[] = [];

export const INITIAL_GAME_STATE: GameState = {
        energy: INITIAL_ENERGY,
        loveScores: { miguel: INITIAL_LOVE, fia: 0, peat: 0, erin: 0, marcus: 0, lucas: 0, bam: 0, jellie: 0, soul: 0, mia: 0 },
        // [MARCUS FIX]: Initialize Chemistry Scores to 0
        chemistryScores: { miguel: 0, fia: 0, peat: 0, erin: 0, marcus: 0, lucas: 0, bam: 0, jellie: 0, soul: 0, mia: 0 },
        relationshipTiers: { miguel: RelationshipTier.STRANGER, fia: RelationshipTier.STRANGER, peat: RelationshipTier.STRANGER, erin: RelationshipTier.STRANGER, marcus: RelationshipTier.STRANGER, lucas: RelationshipTier.STRANGER, bam: RelationshipTier.STRANGER, jellie: RelationshipTier.STRANGER, soul: RelationshipTier.STRANGER, mia: RelationshipTier.STRANGER },
        currentMoods: getInitialMoods(), // DYNAMIC INJECTION
        comboStreaks: { miguel: 0, fia: 0, peat: 0, erin: 0, marcus: 0, lucas: 0, bam: 0, jellie: 0, soul: 0, mia: 0 },
        
        // NEW: DAILY THEMES INIT
        dailyThemes: getInitialThemes(),
        
        // [MARCUS FIX]: Ensure activeRareVibes is initialized empty
        activeRareVibes: {},
        // [MARCUS FIX]: Ensure lastThemeUpdate is initialized
        lastThemeUpdate: Date.now(),

        memories: { miguel: [], fia: [], peat: [], erin: [], marcus: [], lucas: [], bam: [], jellie: [], soul: [], mia: [] },
        yesterdayMemoryTags: { miguel: '', fia: '', peat: '', erin: '', marcus: '', lucas: '', bam: '', jellie: '', soul: '', mia: '' },
        roomKeys: [],
        lastLoveUpdate: undefined,
        currentLocation: 'home', 
        partyMember: null, // PARTY SYSTEM INIT
        tempPartyNotes: [], // PARTY MEMORY SCRATCHPAD
        metCharacters: ['miguel'], // [MARCUS FIX] Initial met character
        isGameOver: false,
        playerName: 'คุณ',
        level: 1,
        messagesSent: 0,
        gold: INITIAL_GOLD,
        diamonds: 0, // NEW: Premium Currency Init
        totalGoldEarned: INITIAL_GOLD,
        // NEW LIFETIME STATS
        totalWorkCount: 0,
        totalGymCount: 0,
        totalPartyInvites: 0, // NEW: Init
        totalGoldSpent: 0, // NEW: Init
        maxEnergy: INITIAL_MAX_ENERGY,
        activeTask: null,
        currentExp: 0,
        requiredExp: INITIAL_REQUIRED_EXP,
        lastResetDate: '',
        lastQuestResetDate: '',
        lastWorldResetDate: '',
        lastChatResetDate: '',
        nextWeeklyReset: 0,
        activeDailyQuests: [], 
        activeWeeklyQuests: [],
        questProgress: {},
        hasTrainedVisit: false,
        inventory: {},
        // FASHION SYSTEM INIT
        ownedStyles: [],
        equippedStyle: null,
        achievements: [],
        unlockedSecrets: [],
        unlockedTracks: ['track_1'],
        stats: INITIAL_STATS,
        unlockedSkills: [],
        isSleeping: false,
        activeBuffs: [],
        activeEvent: null,
        lastEventCharacterId: undefined,
        templateCooldowns: {},
        customEventTemplates: [],
        characterEventCooldowns: { miguel: 0, fia: 0, peat: 0, erin: 0, marcus: 0, lucas: 0, bam: 0, jellie: 0, soul: 0, mia: 0 }, // NEW
        giftCooldowns: {}, // NEW: Money Gift Cooldowns
        lastEnergyUpdate: Date.now(),
        workoutCooldowns: {},
        jobCooldowns: {},
        tutorialsSeen: [],
        drunkTimers: { miguel: 0, fia: 0, peat: 0, erin: 0, marcus: 0, lucas: 0, bam: 0, jellie: 0, soul: 0, mia: 0 }, // NEW: Drunk Logic
        currentChapter: 1, // NEW: STORY MODE
        
        // NEW: SPAM PROTECTION
        actionHistory: { miguel: {type: 'poke', timestamp: 0}, fia: {type: 'poke', timestamp: 0}, peat: {type: 'poke', timestamp: 0}, erin: {type: 'poke', timestamp: 0}, marcus: {type: 'poke', timestamp: 0}, lucas: {type: 'poke', timestamp: 0}, bam: {type: 'poke', timestamp: 0}, jellie: {type: 'poke', timestamp: 0}, soul: {type: 'poke', timestamp: 0}, mia: {type: 'poke', timestamp: 0} },

        // NEW: DAILY LOGIN
        dailyLogin: { currentDay: 1, lastClaimDate: '' },
        
        // NEW: VIP STATUS
        isVip: false,

        // NEW: EXCHANGE TRACKING
        dailyExchangeCount: 0,
        lastExchangeDate: new Date().toDateString(),

        // NEW: AUDIO SETTINGS
        settings: {
            bgmVolume: 0.2, // Default BGM at 20%
            sfxVolume: 0.8,
            isMuted: false,
            isEcoMode: false // NEW: Eco Mode Default
        },
        
        // NEW: MUSIC STATE
        isMusicActive: false,

        // NEW: VOICE CHAT STATE
        voiceChat: {
            isActive: false,
            characterId: null,
            tokenUsage: 0,
            isMicMuted: false
        },

        // NEW: PHONE STATE
        isPhoneOpen: false,
        unreadSocialPosts: 4, // Initial 4 for fresh users
        
        // [MARCUS FIX]: NEW TRACKING FOR AIGRAM
        seenSocialPosts: {}, // url -> timestamp
        
        // [MARCUS NEW]: MAIL SYSTEM
        mails: INITIAL_MAILS,
        hasReceivedStarterMails: false,

        // CHEMISTRY DECAY TIMESTAMP
        lastChemistryDecayTime: Date.now(),

        // INVESTMENTS
        activeStakes: [],
        stockMarket: {
            'WCORP': { symbol: 'WCORP', name: 'W-Corp', currentPrice: 15.5, history: [15.5] },
            'AIL': { symbol: 'AIL', name: 'AiLuv Inc', currentPrice: 200.0, history: [200.0] },
            'ENE': { symbol: 'ENE', name: 'Energy Drink Co', currentPrice: 5.2, history: [5.2] }
        },
        portfolio: {}
};

// ... (Rest of file unchanged)
export const TIER_LEVELS: Record<RelationshipTier, number> = {
  [RelationshipTier.STRANGER]: 0,
  [RelationshipTier.ACQUAINTANCE]: 1,
  [RelationshipTier.FRIEND]: 2,
  // ROMANCE
  [RelationshipTier.FLIRTING]: 3,
  [RelationshipTier.PARTNER]: 4,
  [RelationshipTier.SOULMATE]: 5,
  [RelationshipTier.ETERNAL]: 6, // GOD TIER
  // PLATONIC (Parallel Levels)
  [RelationshipTier.BEST_FRIEND]: 3, 
  [RelationshipTier.SOUL_SIBLING]: 4
};

export const TIER_THRESHOLDS: Record<RelationshipTier, number> = {
  [RelationshipTier.STRANGER]: 0,
  [RelationshipTier.ACQUAINTANCE]: 200,
  [RelationshipTier.FRIEND]: 500,
  // PATH FORK (2000)
  [RelationshipTier.FLIRTING]: 2000, 
  [RelationshipTier.BEST_FRIEND]: 2000,
  // END GAME (5000)
  [RelationshipTier.PARTNER]: 5000,
  [RelationshipTier.SOUL_SIBLING]: 5000,
  // CAP
  [RelationshipTier.SOULMATE]: 10000,
  [RelationshipTier.ETERNAL]: 50000 // LEGENDARY GAP
};

export const MOOD_COLORS: Record<Mood, string> = {
  [Mood.NEUTRAL]: 'border-slate-300 shadow-slate-200',
  [Mood.HAPPY]: 'border-yellow-300 shadow-yellow-100',
  [Mood.SHY]: 'border-pink-300 shadow-pink-200',
  [Mood.ANGRY]: 'border-red-300 shadow-red-200',
  [Mood.FLIRTY]: 'border-purple-300 shadow-purple-200',
  [Mood.ROMANTIC]: 'border-rose-500 shadow-rose-300',
  [Mood.SEXUAL]: 'border-red-600 shadow-red-400',
  [Mood.SURPRISED]: 'border-indigo-300 shadow-indigo-200',
  [Mood.TIRED]: 'border-gray-400 shadow-gray-300',
  [Mood.CONFIDENT]: 'border-orange-400 shadow-orange-300',
  [Mood.ENERGETIC]: 'border-red-400 shadow-red-300',
  [Mood.SAD]: 'border-blue-400 shadow-blue-300',
  [Mood.DRINKING]: 'border-amber-400 shadow-amber-300',
  [Mood.WORKING]: 'border-blue-300 shadow-blue-200',
  [Mood.SHOWING_PHONE]: 'border-teal-400 shadow-teal-300',
  [Mood.EATING]: 'border-green-300 shadow-green-200',
  [Mood.DETERMINED]: 'border-rose-400 shadow-rose-300',
  [Mood.WRITING]: 'border-orange-300 shadow-orange-200',
  [Mood.SCARED]: 'border-purple-400 shadow-purple-300',
  [Mood.HOLDING_FLOWERS]: 'border-pink-400 shadow-pink-300',
  [Mood.THINKING]: 'border-blue-200 shadow-blue-100',
  [Mood.HIGH_FIVE]: 'border-yellow-400 shadow-yellow-200',
  [Mood.SPOOKY]: 'border-indigo-900 shadow-indigo-500/50',
  [Mood.HORRIFIED]: 'border-slate-100 shadow-white/80',
  [Mood.DRUNK]: 'border-fuchsia-400 shadow-fuchsia-300',
  [Mood.SASSY]: 'border-pink-500 shadow-pink-300',
  [Mood.RECEIVING_FLOWERS]: 'border-pink-400 shadow-pink-200',
  [Mood.DISGUISED]: 'border-gray-700 shadow-gray-500',
  [Mood.SHOPPING]: 'border-cyan-400 shadow-cyan-200',
  [Mood.COMFORTING]: 'border-teal-400 shadow-teal-200',
  [Mood.LISTENING]: 'border-emerald-300 shadow-emerald-100',
  [Mood.PET]: 'border-teal-500 shadow-teal-300'
};

export const SKILL_TREE: Skill[] = [
    { id: 'basic_sleep', name: 'Standard Sleep', description: 'สามารถนอนเพื่อฟื้นฟูพลังงานได้เร็วขึ้น x6', icon: '🛌', unlockCondition: 'Own Standard Bed' },
    { id: 'work_from_home', name: 'Smart Home', description: 'เข้าถึง Work/Shop/Gym ได้จากหน้า Profile', icon: '💻', unlockCondition: 'Own Pro Laptop' },
    { id: 'hard_sleep', name: 'Hard Sleep', description: 'ฟื้นฟู Energy เร็วขึ้น x2 (รวม 12x)', icon: '😴', unlockCondition: 'Own DreamCloud Pod' },
    { id: 'spotifi_premium', name: 'Music Lover', description: 'เปิดเพลงฟังได้ทุกที่', icon: '🎧', unlockCondition: 'Own Music Alway Pods' },
    { id: 'huh_again_pls', name: 'Frequent Flyer', description: 'ลดค่าเดินทาง 2 Energy', icon: '✈️', unlockCondition: 'Own Noise-Canceling Pods' },
    { id: 'mind_reader', name: 'Mind Reader', description: 'อ่านความคิดที่ซ่อนอยู่ของตัวละคร', icon: '👁️', unlockCondition: 'Own Neon Soul Visor' },
];

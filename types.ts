
import React from 'react';

// --- ENUMS & BASIC TYPES ---
export type CharacterId = 'miguel' | 'fia' | 'peat' | 'erin' | 'marcus' | 'lucas' | 'bam' | 'jellie' | 'soul' | 'mia';

export enum RelationshipTier {
  STRANGER = 'stranger',
  ACQUAINTANCE = 'acquaintance',
  FRIEND = 'friend',
  FLIRTING = 'flirting',
  PARTNER = 'partner',
  SOULMATE = 'soulmate',
  BEST_FRIEND = 'best_friend',
  SOUL_SIBLING = 'soul_sibling',
  ETERNAL = 'eternal'
}

export enum Mood {
  NEUTRAL = 'neutral',
  HAPPY = 'happy',
  SAD = 'sad',
  ANGRY = 'angry',
  SHY = 'shy',
  FLIRTY = 'flirty',
  CONFIDENT = 'confident',
  TIRED = 'tired',
  SURPRISED = 'surprised',
  WORKING = 'working',
  THINKING = 'thinking',
  DRINKING = 'drinking',
  EATING = 'eating',
  ROMANTIC = 'romantic',
  SEXUAL = 'sexual',
  DRUNK = 'drunk',
  PET = 'pet',
  HOLDING_FLOWERS = 'holding_flowers',
  SASSY = 'sassy',
  SHOPPING = 'shopping',
  DISGUISED = 'disguised',
  RECEIVING_FLOWERS = 'receiving_flowers',
  COMFORTING = 'comforting',
  LISTENING = 'listening',
  DETERMINED = 'determined',
  WRITING = 'writing',
  SCARED = 'scared',
  HIGH_FIVE = 'high_five',
  SPOOKY = 'spooky',
  HORRIFIED = 'horrified',
  SHOWING_PHONE = 'showing_phone',
  ENERGETIC = 'energetic'
}

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';
export type AppView = 'map' | 'player' | 'quests' | 'relationships' | 'ranking' | 'social_chat' | 'location';
export type LocationId = 'home' | 'condo' | 'gym' | 'cafe' | 'office' | 'market' | 'basement' | 'cafe_2f' | 'mall' | 'gacha_shop' | 'vet' | 'maid_cafe';
export type BuffType = 'love_bonus' | 'gold_bonus' | 'exp_bonus' | 'fast_hand' | 'money_magnet' | 'lucky_day' | 'chatterbox' | 'sweet_words' | 'charisma_aura' | 'gym_junkie' | 'overlimit' | 'chill_vibes' | 'focus_boost' | 'bass_boost' | 'motivation' | 'drunk' | 'buff_vit' | 'buff_int' | 'buff_cha' | 'buff_luck';

export type ActionType = 
  | 'headpat' | 'poke' | 'gift' | 'workout' | 'work' | 'party'
  | 'gift_bouquet' | 'gift_ring' | 'gift_keycard' | 'gift_eternity_pendant'
  | 'gift_bracelet' | 'gift_jacket' 
  | 'invite_party' | 'leave_party' | 'invite_date'
  | 'give_noodle' | 'give_beer' | 'gift_dead_branch'
  | 'hold_hands' | 'hug' | 'kiss_cheek' | 'kiss' | 'deep_kiss'
  | 'cheer_up' | 'cat_scratch'        
  | 'spot_check' | 'wipe_sweat'       
  | 'smell_check' | 'fix_apron'       
  | 'mini_heart' | 'selfie'           
  | 'check_watch' | 'fix_tie'         
  | 'share_earbud' | 'poke_cheek'     
  | 'high_five' | 'give_postit'       
  | 'check_outfit' | 'treat_snack'
  | 'give_teddy' | 'give_console' | 'give_magic_ice_cream'; 

export type SceneType = 'rooftop_dining' | 'car' | 'secret_bar' | 'character_home';
export type DateSceneType = 'secret_bar' | 'character_home' | 'car' | 'rooftop_dining';

export interface SceneTransition {
  target: DateSceneType | 'freestyle' | 'end';
  name?: string;
  narrative_status?: string;
}
export type FashionCollection = 'basics' | 'professional' | 'vandal';
export type QuestType = 'login' | 'chat' | 'work' | 'gym' | 'travel' | 'poke' | 'spend_energy' | 'gift' | 'earn_gold' | 'spend_gold' | 'invite_party_count' | 'met_count' | 'work_count' | 'gym_count' | 'friend_count' | 'level' | 'skill_count' | 'style_count' | 'flirting_count' | 'partner_count' | 'secret_count' | 'track_count' | 'current_gold' | 'own_item' | 'stats_min' | 'soulmate_count' | 'party';
export type TutorialStep = 'idle' | 'intro' | 'chat_guide' | 'energy_guide' | 'goals_intro' | 'goals_claim' | 'goals_rank' | 'relationships_intro_1' | 'relationships_intro_2' | 'relationships_tap' | 'story_intro' | 'map_intro' | 'map_pin_cafe' | 'map_drawer' | 'me_intro' | 'me_exp' | 'me_level' | 'me_stats' | 'me_skills' | 'location_action_toggle' | 'shop_buy_cookie' | 'buff_explanation' | 'completed';

// --- INTERFACES ---
export interface PlayerAttributes {
  vit: number;
  int: number;
  cha: number;
  luck: number;
  points: number;
}

export interface AvatarConfig {
  mode: 'cartoon' | 'realistic';
  cartoonSeed?: string;
  cartoonColor?: string;
  realisticId?: string;
}

export interface UserProfile {
  name: string;
  age: string;
  gender: 'male' | 'female' | 'other';
  interests: string; // Bio
  avatarConfig?: AvatarConfig;
  coverImage?: string;
}

export type MemoryTier = 'core' | 'active' | 'sensory';

export interface Memory {
  id: string;
  text: string;
  tier: MemoryTier;
  timestamp: number;
  lastAccess: number;
  importance: number;
}

export interface ActiveBuff {
  id: string;
  type: BuffType;
  value: number;
  expiresAt: number;
  sourceName: string;
}

export interface ActiveTask {
  type: 'work' | 'gym' | 'party';
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  rewardValue: number; // Gold
  expReward?: number;
  performanceScore?: number;
  cooldownMinutes?: number;
}

export interface ActiveEvent {
  id: string;
  templateId: string;
  characterId: CharacterId;
  locationId: LocationId;
  title: string;
  message: string;
  aiContext: string;
  expiresAt: number;
  rewards?: { exp: number, love: number }; // Added rewards to ActiveEvent
}

export interface EventTemplate {
  templateId: string;
  characterId: CharacterId;
  locationId: LocationId;
  title: string;
  message: string;
  aiContext: string;
  validHours?: number[];
  rewards: { exp: number, love: number };
}

export interface DateScene {
  type: DateSceneType;
  name: string;
  narrativeStatus: string;
  bgImage: string;
}

export interface CharacterQuestChoice {
  id: string;
  title: string;
  description: string;
  playerResponse: string;
  intention?: string;
  consequenceHint?: string;
}

export interface CharacterQuest {
  id: string;
  characterId: CharacterId | string;
  title: string;
  context: string;
  description: string;
  objective: string;
  choices: CharacterQuestChoice[];
  status: 'pending' | 'active' | 'resolving' | 'reward_pending' | 'completed' | 'abandoned' | 'resolved';
  sourceConversationIds?: string[];
  createdAt: number;

  // Legacy fields for backward compatibility
  energyCost?: number;
  loveReward?: number;
  responseOnComplete?: string;
  isCompleted?: boolean;
  earnedLove?: number;
}

export interface QuestOption {
  id: string;
  text: string;
  type: 'BEST' | 'GOOD' | 'RISKY';
  multiplier: number;
}

export interface ActiveQuestChoiceSession {
  quest: CharacterQuest;
  charId: CharacterId;
  msgId: string;
  options: QuestOption[];
  requestId: string;
  isLoading?: boolean;
  isSubmitting?: boolean;
  selectedChoiceId?: string;
  error?: string;
}

export interface PendingQuestReward {
  quest: CharacterQuest;
  charId: CharacterId;
  msgId: string;
  energyCost: number;
  calculatedLove: number;
  isCritical: boolean;
  selectedOptionText?: string;
}

export interface Message {
  id: string;
  sender: CharacterId | 'user' | 'system';
  text: string;
  timestamp: number;
  isEventMessage?: boolean;
  narrativeContent?: string;
  thought?: string;
  imageUrl?: string;
  isImageLoading?: boolean;
  isSecretResend?: boolean;
  interactiveItem?: {
    id: string;
    name: string;
    description?: string;
    cost: number;
    emoji: string;
    isGift?: boolean;
    giftValue?: number;
    purchased?: boolean;
  };
  characterQuest?: CharacterQuest;
}

export interface DailyChatLog {
  id: string;
  date: string;
  messages: Message[];
  summary?: string;
  totalMessages: number;
}

export interface SimulationResponse {
  reply: string;
  mood: Mood;
  love_change: number;
  chemistry_change?: number; // Optional to handle legacy errors, but should be present
  energy_cost: number;
  thought?: string;
  narrative_action?: string | null;
  special_event_image?: string | null;
  event_resolved?: boolean;
  new_memory?: { text: string, type: string } | null;
  party_memory?: { text: string, type: string } | null;
  scene_transition?: SceneTransition | SceneType | string | null;
  replies?: { text: string, speaker_id: string, mood?: string }[] | null;
  character_quest?: CharacterQuest | null;
}

export interface ShopItem {
  id: string;
  name: string;
  cost: number;
  currency?: 'gold' | 'diamond';
  energyRestore: number;
  emoji: string;
  description: string;
  source: 'cafe' | 'market';
  category: 'food' | 'gadget' | 'gift';
  buffType?: BuffType;
  buffValue?: number;
  buffDurationMinutes?: number;
  unlocksSkill?: string;
  unlocksTier?: RelationshipTier;
  unlockLevel?: number;
}

export interface StyleItem {
  id: string;
  name: string;
  collection: FashionCollection;
  cost: number;
  description: string;
  stats: Partial<PlayerAttributes>;
  socialBias: CharacterId[];
  unlockAvatarDesc: string;
  icon?: string;
  type?: 'style';
}

export interface Job {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  durationSeconds: number;
  goldReward: number;
  expReward: number;
  cooldownMinutes?: number;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  durationSeconds: number;
  maxEnergyGain: number;
  expReward: number;
  goldCost?: number;
  cooldownMinutes?: number;
  buffReward?: {
    type: BuffType;
    value: number;
    durationMinutes: number;
  };
}

export interface MusicTrack {
    id: string;
    title: string;
    artist: string;
    cost: number; 
    buffType: BuffType;
    buffValue: number;
    buffDurationMinutes: number;
    description: string;
    durationSec: number;
    coverColor: string; 
    src: string; 
    coverImage?: string; 
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockCondition: string;
}

export interface CharacterTheme {
  id: string;
  name: string;
  description: string;
  aiPrompt: string;
  icon: string;
}

export interface SecretDef {
  id: string;
  path: string;
  caption: string;
  keywords: string[];
}

export interface CharacterDefinition {
  name: string;
  description: string;
  baseImg: string;
  moods: Partial<Record<Mood, string[]>>;
  casualMoods?: Partial<Record<Mood, string[]>>;
  color: string;
  allSecrets: string[];
  secretImage: string;
  age: number;
  gender: 'male' | 'female';
  lore: string;
  deepPersona: string;
  speechStyle: string;
  schedule: { workHours: [number, number], sleepHours: [number, number], description: string };
  secretKeywords: string[];
  secretTriggerEvent: string;
}

export interface Quest {
  id: string;
  frequency: 'daily' | 'weekly';
  type: QuestType;
  title: string;
  description: string;
  rewardGold: number;
  rewardExp: number;
  target: number;
  rewardItem?: string;
  targetId?: string; 
}

export interface QuestProgress {
  current: number;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface StoryTask {
  id: string;
  text: string;
  type: QuestType;
  target: number;
  targetId?: string;
}

export interface StoryChapter {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  tasks: StoryTask[];
  rewards: {
    gold: number;
    exp: number;
    diamonds?: number;
    item?: string;
    title?: string;
  };
}

export interface SecretUnlockData {
  imagePath: string;
  caption: string;
}

export interface DailyLoginState {
  currentDay: number;
  lastClaimDate: string;
}

export interface GameSettings {
  bgmVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  isEcoMode: boolean;
  aiThinkingLevel?: 'fast' | 'normal' | 'deep';
}

export interface ActionEvent {
  type: ActionType;
  timestamp: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  rewards?: string[];
  type: 'success' | 'level-up' | 'info' | 'error' | 'achievement' | 'message' | 'event' | 'memory' | 'critical' | 'chat-alert'; 
  icon?: React.ReactNode;
  actionLabel?: string; 
  onAction?: () => void;
  avatar?: string; 
}

// --- NEW MAIL SYSTEM INTERFACES ---
export interface MailAction {
    id: string;
    label: string;
    type: 'CLAIM_REWARD' | 'LINK_EVENT' | 'REPLY' | 'DELETE';
    payload?: any; // For reward data or link target
    style?: 'primary' | 'secondary' | 'danger';
}

export interface MailItem {
    id: string;
    sender: string;
    subject: string;
    body: string;
    timestamp: number;
    isRead: boolean;
    type: 'system' | 'promo' | 'secret' | 'personal';
    actions?: MailAction[];
    rewards?: {
        gold?: number;
        diamonds?: number;
        item?: string;
    };
    isClaimed?: boolean;
}

export interface Stake {
    id: string;
    amount: number;
    startTime: number;
    durationHours: number;
    interestRate: number;
    claimed?: boolean;
}

export interface StockNewsItem {
    id: string;
    symbol: string;
    headline: string;
    detail: string;
    impact: 'positive' | 'negative' | 'neutral';
    priceBiasPercent: number;
    timestamp?: number;
}

export interface StockMarketData {
    symbol: string;
    name: string;
    currentPrice: number;
    history: number[];
    activeNews?: StockNewsItem;
    lastUpdated?: number;
}

export interface StockPortfolio {
    symbol: string;
    amount: number;
    averagePrice: number;
}

export interface GameState {
  energy: number;
  maxEnergy: number; 
  gold: number;
  diamonds: number; 
  totalGoldEarned: number; 
  
  totalWorkCount?: number;
  totalGymCount?: number;
  totalPartyInvites?: number; 
  totalGoldSpent?: number; 

  loveScores: Record<CharacterId, number>; 
  chemistryScores?: Record<CharacterId, number>; 
  relationshipTiers: Record<CharacterId, RelationshipTier>; 
  currentMoods: Record<CharacterId, Mood>;
  comboStreaks: Record<CharacterId, number>; 
  
  dailyThemes: Record<CharacterId, string>;
  activeRareVibes?: Partial<Record<CharacterId, boolean>>;
  lastThemeUpdate?: number;

  memories: Record<CharacterId, Memory[]>; 
  yesterdayMemoryTags?: Record<CharacterId, string>;
  roomKeys: CharacterId[]; 
  
  lastLoveUpdate?: {
      charId: CharacterId;
      value: number;
      isCritical: boolean;
      timestamp: number;
  };

  currentLocation: LocationId;
  partyMember: CharacterId | null;
  tempPartyNotes: string[]; 
  currentDateScene?: DateScene | null; 
  metCharacters: CharacterId[];
  inventory: Record<string, number>;
  ownedStyles: string[]; 
  equippedStyle: string | null; 
  achievements: string[]; 
  unlockedSecrets: string[]; 
  unlockedTracks: string[]; 
  stats: PlayerAttributes;
  unlockedSkills: string[];
  activeBuffs: ActiveBuff[];
  activeEvent: ActiveEvent | null; 
  lastEventCharacterId?: CharacterId; 
  templateCooldowns?: Record<string, number>; 
  customEventTemplates: EventTemplate[]; 
  characterEventCooldowns?: Record<CharacterId, number>; 
  giftCooldowns: Record<string, number>; 
  lastEnergyUpdate: number; 
  hasTrainedVisit: boolean;
  workoutCooldowns: Record<string, number>;
  jobCooldowns: Record<string, number>; 
  
  actionHistory?: Record<CharacterId, { type: ActionType, timestamp: number }>;

  isSleeping: boolean;
  isGameOver: boolean;
  playerName: string;
  level: number;
  currentExp: number;
  requiredExp: number;
  messagesSent: number;
  activeTask: ActiveTask | null; 
  lastResetDate: string; 
  lastQuestResetDate?: string;
  lastWorldResetDate?: string;
  lastChatResetDate?: string; 
  nextWeeklyReset: number; 
  activeDailyQuests: string[]; 
  activeWeeklyQuests: string[]; 
  questProgress: Record<string, QuestProgress>;
  dailyLogin: DailyLoginState;
  
  // VIP SYSTEM FIELDS
  isVip: boolean;
  vipExpiry?: number;
  vipDailyClaimed?: string;

  // EXCHANGE TRACKING
  dailyExchangeCount?: number;
  lastExchangeDate?: string;

  tutorialStep?: TutorialStep; 
  tutorialsSeen: string[]; 
  drunkTimers: Record<CharacterId, number>; 
  currentChapter: number;
  settings: GameSettings;
  isMusicActive: boolean; 
  
  secretUnlockData?: SecretUnlockData | null;
  pendingQuestReward?: PendingQuestReward | null;
  activeQuestChoiceSession?: ActiveQuestChoiceSession | null;

  // WALLET / INVESTMENT SYSTEM
  activeStakes?: Stake[];
  stockMarket?: Record<string, StockMarketData>;
  portfolio?: Record<string, StockPortfolio>;

  // VOICE CHAT SYSTEM
  voiceChat: {
    isActive: boolean;
    characterId: CharacterId | null;
    tokenUsage: number;
    isMicMuted: boolean;
  };

  // PHONE SYSTEM
  isPhoneOpen: boolean;
  unreadSocialPosts: number;
  seenSocialPosts: Record<string, number>; 
  
  // MAIL SYSTEM (NEW)
  mails: MailItem[];

  // DAILY CONVERSATION ARCHIVES (30 DAYS HISTORY)
  dailyChatArchives?: Record<CharacterId, DailyChatLog[]>;
}

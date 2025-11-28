
import React from 'react';

export enum Mood {
  NEUTRAL = 'neutral',
  HAPPY = 'happy',
  SHY = 'shy',
  ANGRY = 'angry',
  FLIRTY = 'flirty',
  SURPRISED = 'surprised', // New for Miguel
  TIRED = 'tired',
  CONFIDENT = 'confident', // Shared
  ENERGETIC = 'energetic',  // Fia
  SAD = 'sad', // Fia
  DRINKING = 'drinking', // Special Event Boba
  WORKING = 'working' // Miguel
}

export enum RelationshipTier {
  STRANGER = 'stranger',         // Lv 0
  ACQUAINTANCE = 'acquaintance', // Lv 1 (Start)
  FRIEND = 'friend',             // Lv 2
  FLIRTING = 'flirting',         // Lv 3 (The Wall)
  PARTNER = 'partner',           // Lv 4 (Girlfriend)
  SOULMATE = 'soulmate'          // Lv 5 (Endgame)
}

export type AppView = 'map' | 'location' | 'player' | 'quests' | 'relationships';
export type LocationId = 'condo' | 'gym' | 'cafe' | 'office';
export type CharacterId = 'miguel' | 'fia';

export type ActionType = 'headpat' | 'poke' | 'gift' | 'workout' | 'work';
export type QuestType = 'login' | 'chat' | 'gift' | 'work' | 'gym';

export interface ActionEvent {
  type: ActionType;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  age: string;
  interests: string;
}

export interface Message {
  id: string;
  sender: 'user' | CharacterId;
  text: string;
  timestamp: number;
  imageUrl?: string;
  isImageLoading?: boolean;
}

export interface SimulationResponse {
  reply: string;
  mood: Mood;
  love_change: number;
  energy_cost: number;
  generate_image_prompt?: string | null;
  special_event_image?: string | null;
}

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  rewardGold: number;
  rewardExp: number;
  target: number; 
}

export interface QuestProgress {
  current: number;
  claimed: boolean;
}

export interface Job {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  durationSeconds: number;
  goldReward: number;
  icon?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  cost: number;
  energyRestore: number;
  emoji: string;
  description?: string;
  // New: Items can be "Key Items" to unlock relationships
  unlocksTier?: RelationshipTier; 
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  durationSeconds: number;
  maxEnergyGain: number;
}

export interface ActiveTask {
  type: 'work' | 'gym';
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  rewardValue: number;
}

export interface GameState {
  energy: number;
  maxEnergy: number; 
  gold: number;      
  
  // Refactored for Multi-Char
  loveScores: Record<CharacterId, number>; 
  relationshipTiers: Record<CharacterId, RelationshipTier>; // NEW: Track tiers
  currentMoods: Record<CharacterId, Mood>;
  currentLocation: LocationId;

  // Track if user has exercised in the current gym visit
  hasTrainedVisit: boolean;

  isGameOver: boolean;
  level: number;
  currentExp: number;
  requiredExp: number;
  messagesSent: number;
  activeTask: ActiveTask | null; 
  lastResetDate: string;
  questProgress: Record<string, QuestProgress>;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  rewards?: string[];
  type: 'success' | 'level-up' | 'info' | 'error';
  icon?: React.ReactNode;
}

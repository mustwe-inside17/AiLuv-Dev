import { create } from 'zustand';
import { AppView, LocationId, CharacterId, AppNotification } from '../types';

export type ModalName = 'welcome' | 'diamond' | 'story' | 'login' | 'inventory' | 'vip';

interface UIState {
  // View navigation
  currentView: AppView;
  locationMode: 'chat' | 'action';
  activeSocialChat: CharacterId | null;
  roomGuestId: CharacterId | null;

  // Notifications
  notifications: AppNotification[];

  // Modals
  showWelcomeModal: boolean;
  showDiamondShop: boolean;
  showStory: boolean;
  showDailyLogin: boolean;
  showVipModal: boolean;
  showInventory: boolean;
  fullScreenImage: string | null;
  levelUpData: number | null;

  // Travel UI
  isTraveling: boolean;
  travelTarget: LocationId | null;

  // Actions
  setCurrentView: (view: AppView) => void;
  setLocationMode: (mode: 'chat' | 'action') => void;
  setActiveSocialChat: (characterId: CharacterId | null) => void;
  setRoomGuestId: (characterId: CharacterId | null) => void;
  
  addNotification: (n: AppNotification) => void;
  removeNotification: (id: string) => void;
  
  setShowWelcomeModal: (show: boolean) => void;
  setShowDiamondShop: (show: boolean) => void;
  setShowStory: (show: boolean) => void;
  setShowDailyLogin: (show: boolean) => void;
  setShowVipModal: (show: boolean) => void;
  setShowInventory: (show: boolean) => void;

  setFullScreenImage: (url: string | null) => void;
  setLevelUpData: (level: number | null) => void;
  
  setIsTraveling: (isTraveling: boolean) => void;
  setTravelTarget: (target: LocationId | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentView: 'map',
  locationMode: 'chat',
  activeSocialChat: null,
  roomGuestId: null,
  
  notifications: [],
  
  showWelcomeModal: false,
  showDiamondShop: false,
  showStory: false,
  showDailyLogin: false,
  showVipModal: false,
  showInventory: false,
  fullScreenImage: null,
  levelUpData: null,
  
  isTraveling: false,
  travelTarget: null,

  setCurrentView: (view) => set({ currentView: view }),
  setLocationMode: (mode) => set({ locationMode: mode }),
  setActiveSocialChat: (characterId) => set({ activeSocialChat: characterId }),
  setRoomGuestId: (characterId) => set({ roomGuestId: characterId }),
  
  addNotification: (n) => set((s) => ({ notifications: [...s.notifications, n] })),
  removeNotification: (id) => set((s) => ({ notifications: s.notifications.filter((x) => x.id !== id) })),
  
  setShowWelcomeModal: (show) => set({ showWelcomeModal: show }),
  setShowDiamondShop: (show) => set({ showDiamondShop: show }),
  setShowStory: (show) => set({ showStory: show }),
  setShowDailyLogin: (show) => set({ showDailyLogin: show }),
  setShowVipModal: (show) => set({ showVipModal: show }),
  setShowInventory: (show) => set({ showInventory: show }),
  
  setFullScreenImage: (url) => set({ fullScreenImage: url }),
  setLevelUpData: (level) => set({ levelUpData: level }),
  
  setIsTraveling: (isTraveling) => set({ isTraveling: isTraveling }),
  setTravelTarget: (target) => set({ travelTarget: target })
}));


import { GameState, Message, CharacterId, UserProfile } from "../types";

// Workaround for potential type definition mismatches
import * as firebaseApp from "firebase/app";
import * as firebaseAuth from "firebase/auth";
import * as firebaseAnalytics from "firebase/analytics";
import * as firebaseStorage from "firebase/storage";
import * as firebaseFirestore from "firebase/firestore";

// --- FIRESTORE WORKAROUND ---
const _firestore = firebaseFirestore as any;
const {
  doc,
  setDoc,
  getDoc, // Reverted to standard getDoc for speed
  collection,
  getDocs,
  limit,
  query,
  onSnapshot,
  initializeFirestore,
  memoryLocalCache,
  getFirestore
} = _firestore;

const firebaseConfig = {
  apiKey: "AIzaSyA9WVKyv25UboaqysvsnFuqYocNvF-0O9U",
  authDomain: "aidol-project.firebaseapp.com",
  projectId: "aidol-project",
  storageBucket: "aidol-project.firebasestorage.app",
  messagingSenderId: "801127160686",
  appId: "1:801127160686:web:fe519986570a83d29bbf7f",
  measurementId: "G-TRZT89WPK4"
};

// Initialize Firebase
const app = (firebaseApp as any).initializeApp(firebaseConfig);

// --- AUTH WORKAROUND ---
const _auth = firebaseAuth as any;
export const auth = _auth.getAuth(app);
export const signInWithEmailAndPassword = _auth.signInWithEmailAndPassword;
export const createUserWithEmailAndPassword = _auth.createUserWithEmailAndPassword;
export const sendPasswordResetEmail = _auth.sendPasswordResetEmail;
export const signOut = _auth.signOut;
export const onAuthStateChanged = _auth.onAuthStateChanged;
export const GoogleAuthProvider = _auth.GoogleAuthProvider;
export const signInWithPopup = _auth.signInWithPopup;
export type User = any;

// --- FIRESTORE INITIALIZATION ---
const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
});

const storage = (firebaseStorage as any).getStorage(app);
const analytics = (firebaseAnalytics as any).getAnalytics(app);

// --- STORAGE FUNCTIONS WITH PERSISTENT CACHING ---

// Load cache from localStorage on init
let urlCache: Record<string, string> = {};
try {
    const stored = localStorage.getItem('ailuv_asset_cache');
    if (stored) {
        urlCache = JSON.parse(stored);
    }
} catch (e) {
    console.warn("Failed to load asset cache", e);
}

const saveCache = () => {
    try {
        localStorage.setItem('ailuv_asset_cache', JSON.stringify(urlCache));
    } catch (e) {
        console.warn("Failed to save asset cache", e);
    }
};

// Synchronous check for UI components to avoid flicker
export const checkUrlCache = (path: string): string | null => {
    return urlCache[path] || null;
};

export const getCharacterImageUrl = async (path: string): Promise<string | null> => {
  if (!path || typeof path !== 'string') return null;
  if (path.startsWith('http')) return path;
  
  // 1. Check Memory/Local Cache
  if (urlCache[path]) return urlCache[path];
  
  try {
    const storageRef = (firebaseStorage as any).ref(storage, path);
    // 2. Fetch from Network
    const url = await (firebaseStorage as any).getDownloadURL(storageRef);
    
    // 3. Update Cache
    urlCache[path] = url;
    saveCache(); // Persist to disk
    
    return url;
  } catch (e: any) {
    // If error (e.g. 404), do not cache null, let it retry or fail gracefully
    return null;
  }
};

// --- NUCLEAR SANITIZER ---

const isDangerous = (value: any): boolean => {
    if (!value || typeof value !== 'object') return false;
    if (value.nodeType && typeof value.nodeName === 'string') return true;
    if (value.$$typeof && typeof value.$$typeof === 'symbol') return true;
    if (value === window || value === document) return true;
    return false;
};

const deepCleanAndCopy = (data: any): any => {
    const seen = new WeakSet();
    const clone = (obj: any): any => {
        if (typeof obj === 'number') {
            if (Number.isNaN(obj) || !isFinite(obj)) {
                return 0;
            }
            return obj;
        }

        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (isDangerous(obj)) {
            return null;
        }
        if (seen.has(obj)) {
            return null; 
        }
        seen.add(obj);
        if (Array.isArray(obj)) {
            return obj.map(item => clone(item));
        }
        const output: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (key === 'src' && typeof obj[key] === 'object') continue;
                if (key.startsWith('_')) continue; 
                const value = obj[key];
                if (typeof value !== 'function' && value !== undefined) {
                    output[key] = clone(value);
                }
            }
        }
        return output;
    };
    return clone(data);
};

// --- SESSION MANAGEMENT ---

export const registerSession = async (userId: string, sessionId: string) => {
  if (!userId) return;
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { activeSessionId: sessionId }, { merge: true });
  } catch (e) {
    console.warn("Session register failed (Offline)", e);
  }
};

export const monitorUserSession = (userId: string, onSessionChange: (remoteSessionId: string | null) => void) => {
  const userRef = doc(db, "users", userId);
  return onSnapshot(userRef, (doc: any) => {
    const data = doc.data();
    if (data && data.activeSessionId) {
      onSessionChange(data.activeSessionId);
    } else {
      onSessionChange(null);
    }
  }, (error: any) => {
      console.warn("Session monitor warning:", error.message);
  });
};

// --- SAVE FUNCTIONS ---

export const saveGameData = async (userId: string, gameState: GameState, userProfile: UserProfile | null) => {
  if (!userId) return;
  try {
    const cleanGameState = deepCleanAndCopy(gameState);
    const cleanUserProfile = userProfile ? deepCleanAndCopy(userProfile) : null;

    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { 
      gameState: cleanGameState, 
      userProfile: cleanUserProfile,
      lastUpdated: Date.now() 
    }, { merge: true });
  } catch (e) {
    console.warn("SaveGameData failed:", e);
    throw e;
  }
};

export const saveMessages = async (userId: string, messagesMap: Record<CharacterId, Message[]>) => {
  if (!userId) return;
  try {
    const cleanMessagesMap = deepCleanAndCopy(messagesMap);

    const messagesRef = doc(db, "messages", userId);
    await setDoc(messagesRef, { 
        ...cleanMessagesMap,
        lastUpdated: Date.now()
    }, { merge: true });
  } catch (e) {
     console.warn("SaveMessages warning:", e);
  }
};

// --- ROBUST LOAD FUNCTIONS (OPTIMIZED FOR SPEED) ---

export type LoadResult = 
  | { status: 'SUCCESS', data: { gameState: GameState, userProfile: UserProfile } }
  | { status: 'NOT_FOUND' } 
  | { status: 'ERROR', message: string }; 

export const loadGameDataWithRetry = async (userId: string, maxRetries = 3): Promise<LoadResult> => {
    if (!userId) return { status: 'ERROR', message: "No User ID" };
    
    const userRef = doc(db, "users", userId);
    let attempt = 0;

    while (attempt < maxRetries) {
        attempt++;
        console.log(`📡 [Load] Attempt ${attempt}/${maxRetries} fetching data...`);

        try {
            const docSnap = await getDoc(userRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data && data.userProfile) {
                    console.log("✅ [Load] Data loaded successfully.");
                    return { status: 'SUCCESS', data: data as any };
                } else {
                    return { status: 'NOT_FOUND' };
                }
            } else {
                console.log("ℹ️ [Load] Document does not exist (New User).");
                return { status: 'NOT_FOUND' };
            }

        } catch (error: any) {
            console.warn(`⚠️ [Load] Fetch failed (Attempt ${attempt}):`, error.message);
            
            if (error.code === 'permission-denied') {
                 return { status: 'ERROR', message: "Permission Denied" };
            }

            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    return { status: 'ERROR', message: "Connection Failed" };
};

export const loadMessages = async (userId: string): Promise<Record<CharacterId, Message[]> | null> => {
  if (!userId) return null;
  try {
    const messagesRef = doc(db, "messages", userId);
    const docSnap = await getDoc(messagesRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data) {
        const { lastUpdated, ...msgs } = data;
        return msgs as Record<CharacterId, Message[]>;
      }
    }
    return null;
  } catch (e: any) {
    console.warn("Error loading messages (Non-fatal):", e.message);
    return null;
  }
};

// --- LEADERBOARD FUNCTIONS ---

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarSeed?: string; 
  loveScores: Record<CharacterId, number>;
  totalGoldEarned: number;
  level: number;
  statsTotal: number;
}

export const fetchLeaderboardData = async (): Promise<LeaderboardEntry[]> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, limit(50)); 
    
    const querySnapshot = await getDocs(q);
    
    const entries: LeaderboardEntry[] = [];
    querySnapshot.forEach((doc: any) => {
      const data = doc.data();
      if (data.userProfile && data.gameState) {
        const gameState = data.gameState || {};
        const userProfile = data.userProfile || {};
        const stats = gameState.stats || { vit: 0, int: 0, cha: 0, luck: 0 };
        const totalStats = (stats.vit || 0) + (stats.int || 0) + (stats.cha || 0) + (stats.luck || 0);
        
        const rawLoveScores = gameState.loveScores || {};
        const safeLoveScores = {
           miguel: rawLoveScores.miguel || 0,
           fia: rawLoveScores.fia || 0,
           peat: rawLoveScores.peat || 0,
           erin: rawLoveScores.erin || 0,
           marcus: rawLoveScores.marcus || 0,
           lucas: rawLoveScores.lucas || 0,
           bam: rawLoveScores.bam || 0,
           jellie: rawLoveScores.jellie || 0,
           soul: rawLoveScores.soul || 0,
           mia: rawLoveScores.mia || 0
        };

        entries.push({
          userId: doc.id,
          name: userProfile.name || "Anonymous",
          loveScores: safeLoveScores,
          totalGoldEarned: gameState.totalGoldEarned ?? gameState.gold ?? 0,
          level: gameState.level || 1,
          statsTotal: totalStats
        });
      }
    });
    return entries;
  } catch (e) {
    console.warn("Error fetching leaderboard:", e);
    return [];
  }
};

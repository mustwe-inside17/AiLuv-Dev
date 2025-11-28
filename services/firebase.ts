
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { GameState, Message, CharacterId, UserProfile } from "../types";

// Helper to get or create a persistent User ID in localStorage
export const getUserId = () => {
  let uid = localStorage.getItem("miguel_sim_uid");
  if (!uid) {
    uid = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("miguel_sim_uid", uid);
  }
  return uid;
};

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

const USER_ID = getUserId();

// --- STORAGE FUNCTIONS ---

// Cache to prevent hitting Firebase for the same URL repeatedly in a session
const urlCache: Record<string, string> = {};

export const getCharacterImageUrl = async (path: string): Promise<string | null> => {
  if (urlCache[path]) return urlCache[path];
  
  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    urlCache[path] = url;
    return url;
  } catch (e) {
    console.error(`Error fetching image for path ${path}:`, e);
    return null;
  }
};

// --- SAVE FUNCTIONS ---

export const saveGameData = async (gameState: GameState, userProfile: UserProfile | null) => {
  try {
    const userRef = doc(db, "users", USER_ID);
    await setDoc(userRef, { 
      gameState, 
      userProfile,
      lastUpdated: Date.now() 
    }, { merge: true });
  } catch (e) {
    console.error("Error saving game data to Firebase:", e);
  }
};

export const saveMessages = async (messagesMap: Record<CharacterId, Message[]>) => {
  try {
    const messagesRef = doc(db, "messages", USER_ID);
    await setDoc(messagesRef, { 
        ...messagesMap,
        lastUpdated: Date.now()
    }, { merge: true });
  } catch (e) {
     console.error("Error saving messages to Firebase:", e);
  }
};

// --- LOAD FUNCTIONS ---

export const loadGameData = async (): Promise<{ gameState: GameState, userProfile: UserProfile } | null> => {
  try {
    const userRef = doc(db, "users", USER_ID);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as { gameState: GameState, userProfile: UserProfile };
    }
    return null;
  } catch (e) {
    console.error("Error loading game data from Firebase:", e);
    return null;
  }
};

export const loadMessages = async (): Promise<Record<CharacterId, Message[]> | null> => {
  try {
    const messagesRef = doc(db, "messages", USER_ID);
    const docSnap = await getDoc(messagesRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const { lastUpdated, ...msgs } = data;
      return msgs as Record<CharacterId, Message[]>;
    }
    return null;
  } catch (e) {
    console.error("Error loading messages from Firebase:", e);
    return null;
  }
};

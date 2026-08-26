
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";
import { CharacterId, Mood, RelationshipTier } from "../types";
import { useGameStore } from "../store/gameStore";
import { CHARACTER_DATA } from "../constants";
import { getScheduleContext, getPlayerContext, getDailyThemeContext, getDeepPersonaLogic, getLifelikeProtocol, getRelationshipBehavior, getPetContext } from "./ai/dynamicContext";

export interface LiveChatContext {
  mood: Mood;
  chemistry: number;
  loveScore: number;
  location: string;
  relationshipTier: string;
  inventory: string[];
  playerName: string;
  chatHistory: string;
  memories?: string[];
}

export type LiveStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface LiveChatCallbacks {
  onTranscription?: (text: string, isUser: boolean) => void;
  onAudioData?: (base64: string) => void;
  onInterrupted?: () => void;
  onUserSpeaking?: (isSpeaking: boolean) => void;
  onModelSpeaking?: (isSpeaking: boolean) => void;
  onStatusChange?: (status: LiveStatus) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
}

const VOICE_MAP: Record<CharacterId, string> = {
  miguel: 'Zephyr',
  fia: 'Kore',
  peat: 'Fenrir',
  erin: 'Kore',
  marcus: 'Puck',
  lucas: 'Fenrir',
  bam: 'Zephyr',
  jellie: 'Kore',
  soul: 'Charon',
  mia: 'Kore',
};

// Function Declarations for Game Logic
const updateChemistryTool: FunctionDeclaration = {
  name: "updateChemistry",
  parameters: {
    type: Type.OBJECT,
    description: "Update the chemistry/vibe score with the character.",
    properties: {
      amount: {
        type: Type.NUMBER,
        description: "The amount to change chemistry by (-5 to +5).",
      },
    },
    required: ["amount"],
  },
};

const updateMoodTool: FunctionDeclaration = {
  name: "updateMood",
  parameters: {
    type: Type.OBJECT,
    description: "Change the character's current mood.",
    properties: {
      mood: {
        type: Type.STRING,
        description: "The new mood (e.g., happy, shy, flirty, neutral).",
      },
    },
    required: ["mood"],
  },
};

const addMemoryTool: FunctionDeclaration = {
  name: "addMemory",
  parameters: {
    type: Type.OBJECT,
    description: "Add a new memory for the character to remember.",
    properties: {
      text: {
        type: Type.STRING,
        description: "The content of the memory.",
      },
    },
    required: ["text"],
  },
};

const updateLoveScoreTool: FunctionDeclaration = {
  name: "updateLoveScore",
  parameters: {
    type: Type.OBJECT,
    description: "Update the love/relationship score with the character.",
    properties: {
      amount: {
        type: Type.NUMBER,
        description: "The amount to change the love score by (e.g., +5, +10, -5).",
      },
    },
    required: ["amount"],
  },
};

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private session: any = null;
  private sessionPromise: Promise<any> | null = null;
  private callbacks: LiveChatCallbacks | null = null;
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private audioQueue: string[] = [];
  private isPlaying = false;
  private isMuted = false;
  private isScheduling = false;
  private nextStartTime = 0;
  private userSpeakingTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentStatus: LiveStatus = 'idle';

  private activeSources = 0;
  private currentSource: AudioBufferSourceNode | null = null;
  
  // Auto-reconnect state
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;
  private lastParams: { charId: CharacterId, context: LiveChatContext, callbacks: LiveChatCallbacks } | null = null;

  constructor() {
    // Initialized with empty key, will be updated in connect
    this.ai = new GoogleGenAI({ apiKey: "" });
  }

  private updateStatus(status: LiveStatus) {
    if (this.currentStatus !== status) {
      this.currentStatus = status;
      this.callbacks?.onStatusChange?.(status);
    }
  }

  async connect(charId: CharacterId, context: LiveChatContext, callbacks: LiveChatCallbacks, isRetry = false) {
    // Store params for auto-reconnect
    this.lastParams = { charId, context, callbacks };
    
    if (!isRetry) {
      this.retryCount = 0;
    }
    
    // Ensure previous session is fully cleaned up before starting a new one
    this.disconnect();

    // Use process.env.API_KEY as per guidelines for Gemini Live/Veo
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("API Key is missing");
      callbacks.onError?.("API Key is missing");
      return;
    }

    // Re-initialize with current API key
    this.ai = new GoogleGenAI({ apiKey });
    this.callbacks = callbacks;

    // [MIGUEL'S ADVICE]: Check playerName and provide a sweet fallback
    if (!context.playerName || context.playerName.trim() === "") {
      context.playerName = "ที่รัก";
    }
    console.log("Player Name for Live Session:", context.playerName);

    const charData = CHARACTER_DATA[charId];
    const voiceName = VOICE_MAP[charId] || 'Zephyr';
    const relationshipSummary = this.getRelationshipSummary(context, charData.name);

    // Truncate chat history to last 10 messages to prevent context overflow
    const truncatedHistory = context.chatHistory 
      ? context.chatHistory.split('\n').slice(-10).join('\n')
      : "No previous chat history.";

    // Get real-world time and schedule context
    const currentHour = new Date().getHours();
    const store = useGameStore.getState();
    const currentDateScene = store.currentDateScene || null;
    
    // [MARCUS FIX]: userProfile is not in gameStore, we construct a basic one from context
    const mockUserProfile = {
      name: context.playerName,
      age: "25", // Default
      gender: "other" as const,
      interests: "Ordinary Citizen"
    };
    const isUnknown = context.relationshipTier === 'stranger';
    
    const scheduleContext = getScheduleContext(charId, currentHour, currentDateScene);
    const playerContext = getPlayerContext(mockUserProfile, charId, isUnknown);
    
    // [MARCUS FIX]: Syncing chat context and persona logic to voice mode
    const currentDailyThemeId = store.dailyThemes?.[charId] || '';
    const isRareVibe = store.activeRareVibes?.[charId] || false;
    const dailyThemeContext = getDailyThemeContext(charId, currentDailyThemeId, context.chemistry, isRareVibe);
    const deepPersonaLogic = getDeepPersonaLogic(charId, false, false, []);
    const lifelikeProtocol = getLifelikeProtocol(charId, context.chemistry, context.relationshipTier as RelationshipTier, true);
    const relationshipBehavior = getRelationshipBehavior(charId, context.relationshipTier as RelationshipTier);

    let petInstruction = "";
    if (charId === 'miguel') {
      petInstruction = "- **PET CONTEXT**: If the user mentions your cat 'Tofu' (เต้าหู้) or cats, you MUST use the `updateMood` tool with `mood: 'pet'` and act excited/affectionate.";
    } else if (charId === 'soul') {
      petInstruction = "- **PET CONTEXT**: If the user mentions your dog 'Nikki' (นิกกิ) or pets, you MUST use the `updateMood` tool with `mood: 'pet'` and act warm/enthusiastic.";
    }

    const systemInstruction = `
      [IDENTITY]
      - Name: ${charData.name}.
      - Role: Character in a dating sim. NOT an AI.
      - **STRICT**: Output THAI only.
      - No meta-commentary. ONLY dialogue.
      ${deepPersonaLogic}
      ${petInstruction}

      [PLAYER CONTEXT & HONORIFICS]
      ${playerContext}

      [TIME & PERSONA]
      ${scheduleContext}
      ${dailyThemeContext}

      [RELATIONSHIP]
      ${relationshipSummary}
      ${relationshipBehavior}

      [RECENT CONTEXT]
      ${truncatedHistory}
      (Note: You just finished chatting with the user via text. They just called you. Continue the conversation naturally from the recent context.)

      [BEHAVIOR]
      - Proactive, natural, concise for voice.
      - Location: ${context.location}. Mood: ${context.mood}.
      - Use tools (updateChemistry, updateLoveScore, updateMood, addMemory) to reflect changes.
      ${lifelikeProtocol}
    `;

    try {
      this.sessionPromise = this.ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            console.log("Live API connected");
            this.retryCount = 0; // Reset retry count on success
            this.startMic();
            // Send initial greeting trigger
            this.sessionPromise?.then(session => {
              this.session = session; // Ensure session is set
              
              // Generate a contextual greeting trigger
              // We send a hidden prompt to the model to start the conversation
              const greetingPrompt = `[SYSTEM: Start the conversation now. You are ${charData.name} at ${context.location}. 
                The user (${context.playerName}) just connected. 
                Greet them warmly in Thai based on your mood (${context.mood}). 
                Keep it short and natural.
                STRICT: You MUST call the user by their name ("${context.playerName}"). You can use "คุณ ${context.playerName}" or just "${context.playerName}" depending on your relationship.
                Don't mention being an AI.]`;
              
              this.sendText(greetingPrompt);
            });
          },
          onmessage: async (message: LiveServerMessage) => {
            // Log for debugging
            // console.log("Live Message Received:", Object.keys(message));

            if (message.serverContent?.interrupted) {
              console.log("Interrupted!");
              this.stopPlayback();
              this.callbacks?.onInterrupted?.();
            }

            if (message.serverContent?.inputTranscription) {
              this.callbacks?.onTranscription?.(message.serverContent.inputTranscription.text || "", true);
            }

            if (message.serverContent?.outputTranscription) {
              this.callbacks?.onTranscription?.(message.serverContent.outputTranscription.text || "", false);
            }

            if (message.serverContent?.modelTurn) {
              this.callbacks?.onModelSpeaking?.(true);
              this.updateStatus('speaking');
            }

            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData) {
                  this.handleAudioOutput(part.inlineData.data);
                }
                if (part.text) {
                  const cleanedText = this.cleanText(part.text);
                  if (cleanedText) {
                    this.callbacks?.onAudioData?.("TEXT_LOG:" + cleanedText);
                  }
                }
              }
            }

            if (message.toolCall) {
              this.handleToolCall(message.toolCall);
            }
            
            if (message.serverContent?.turnComplete) {
                this.callbacks?.onModelSpeaking?.(false);
                // If we are not playing audio, we can go back to idle
                if (!this.isPlaying && this.activeSources <= 0) {
                  this.updateStatus('idle');
                }
            }
          },
          onerror: (error: any) => {
            // Log the full error details to the console for debugging
            console.error("🚨 Live API Error Details:", error);
            
            // [MARCUS FIX]: Don't trigger the error modal immediately on 'onerror'.
            // Most connection errors will trigger 'onclose' with a specific code (like 1011).
            // We let 'onclose' handle the error reporting or auto-reconnect logic.
            // This prevents the error modal from flashing during a retry attempt.
          },
          onclose: (event: any) => {
            console.log("Live API closed", event?.code, event?.reason);
            
            // Auto-reconnect on 1011 (Internal Server Error)
            if (event?.code === 1011 && this.retryCount < this.MAX_RETRIES && this.lastParams) {
              console.warn(`🔄 Auto-reconnecting due to 1011 error (Attempt ${this.retryCount + 1}/${this.MAX_RETRIES})...`);
              this.retryCount++;
              
              // Use a small delay before reconnecting
              setTimeout(() => {
                if (this.lastParams) {
                  this.connect(this.lastParams.charId, this.lastParams.context, this.lastParams.callbacks, true);
                }
              }, 1500);
              return;
            }

            // If it's not a normal closure, notify the UI
            if (event?.code && event.code !== 1000 && event.code !== 1005) {
              callbacks.onError?.(new Error(`Connection closed: ${event.reason || 'Unknown reason'} (Code: ${event.code})`));
            }
            this.cleanup();
            callbacks.onClose?.();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
          systemInstruction,
          tools: [{ functionDeclarations: [updateChemistryTool, updateLoveScoreTool, updateMoodTool, addMemoryTool] }],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
      });
      this.session = await this.sessionPromise;
    } catch (error) {
      console.error("Failed to connect to Live API:", error);
      throw error;
    }
  }

  private getRelationshipSummary(context: LiveChatContext, charName: string): string {
    const { relationshipTier, loveScore, chemistry, playerName, memories } = context;
    
    let summary = `[RELATIONSHIP SUMMARY for ${charName} and ${playerName}]\n`;
    summary += `- Current Tier: ${relationshipTier.toUpperCase()}\n`;
    summary += `- Love Score: ${loveScore}\n`;
    summary += `- Chemistry (Vibe): ${chemistry}/100\n`;
    
    if (memories && memories.length > 0) {
      summary += `- Memories: ${memories.join(', ')}\n`;
    }
    summary += `\n[BEHAVIORAL GUIDELINES BASED ON TIER]\n`;
    
    switch (relationshipTier) {
      case 'stranger':
        summary += `- You just met ${playerName}. Be polite but a bit distant. Use formal or neutral Thai honorifics.\n`;
        summary += `- Don't be too personal yet. You are still getting to know each other.\n`;
        break;
      case 'acquaintance':
        summary += `- You know ${playerName} slightly. Be friendly and welcoming.\n`;
        summary += `- You can share small talk about the location or your day.\n`;
        break;
      case 'friend':
        summary += `- You are friends with ${playerName}. Be comfortable and casual.\n`;
        summary += `- You can tease them lightly and share more personal thoughts.\n`;
        break;
      case 'flirting':
        summary += `- There is a romantic spark! Be playful, flirty, and suggestive.\n`;
        summary += `- Use sweet words and show that you are interested in them more than just a friend.\n`;
        break;
      case 'partner':
        summary += `- You are in a committed relationship with ${playerName}. Be very affectionate and caring.\n`;
        summary += `- Use intimate language and show deep trust and love.\n`;
        break;
      case 'soulmate':
        summary += `- You are soulmates. You understand each other perfectly without words.\n`;
        summary += `- Your bond is unbreakable. Be deeply romantic and protective.\n`;
        break;
      case 'best_friend':
        summary += `- You are best friends. You share everything and have zero filters.\n`;
        summary += `- Be extremely supportive but also very blunt and funny with each other.\n`;
        break;
      case 'soul_sibling':
        summary += `- You feel like siblings. A deep, non-romantic but extremely strong bond.\n`;
        summary += `- Be protective and caring like family.\n`;
        break;
      case 'eternal':
        summary += `- Your love transcends time and space. You are destined to be together forever.\n`;
        summary += `- Be divine, eternal, and infinitely loving.\n`;
        break;
      default:
        summary += `- Be natural and react based on the vibe.\n`;
    }

    return summary;
  }

  private cleanText(text: string): string {
    // [MARCUS FIX]: If text is purely English and long, it's likely meta-commentary/planning
    // In this game, dialogue should be primarily Thai.
    const hasThai = /[ก-๙]/.test(text);
    const isLongEnglish = text.length > 50 && !hasThai;
    
    if (isLongEnglish) {
        console.log("Filtered out meta-commentary:", text);
        return "";
    }

    // Remove meta-commentary patterns
    return text
      .replace(/\*\*.*?\*\*/g, '') // Remove **text**
      .replace(/\[.*?\]/g, '')     // Remove [text]
      .replace(/^(Thinking|Acknowledge|System|Action|Note|Plan|Greeting):.*$/gmi, '') // Remove lines starting with labels
      .replace(/\n+/g, ' ')        // Normalize whitespace
      .trim();
  }

  private async startMic() {
    try {
      // Back to basic getUserMedia as requested
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.inputContext = new AudioContext({ sampleRate: 16000 });
      if (this.inputContext.state === 'suspended') {
        await this.inputContext.resume();
      }
      this.source = this.inputContext.createMediaStreamSource(this.stream);
      this.processor = this.inputContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        if (this.isMuted) return;

        // [MIGUEL'S HACK]: Block mic input if AI is speaking to prevent self-interruption
        if (this.isPlaying) return;

        const inputData = e.inputBuffer.getChannelData(0);
        
        // Simple volume detection
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        
        // Check if loud enough to be considered speaking
        if (rms > 0.01) { 
          this.callbacks?.onUserSpeaking?.(true);
          this.updateStatus('listening');
          if (this.userSpeakingTimeout) clearTimeout(this.userSpeakingTimeout);
          this.userSpeakingTimeout = setTimeout(() => {
            this.callbacks?.onUserSpeaking?.(false);
            this.updateStatus('thinking'); // Transition to thinking when user stops
            this.userSpeakingTimeout = null; // Clear when timeout expires
          }, 500); // 0.5s tail buffer to catch the end of speech
        }

        // [MIGUEL'S FIX]: Only send audio data if the user is actually speaking (timeout is active)
        if (!this.userSpeakingTimeout) return;

        // Convert Float32 to Int16 PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        
        if (this.sessionPromise) {
          this.sessionPromise.then(session => {
            session.sendRealtimeInput({
              audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
            });
          });
        }
      };

      this.source.connect(this.processor);
      this.processor.connect(this.inputContext.destination);
    } catch (error: any) {
      console.error("Error starting microphone:", error);
      const msg = error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError'
        ? "Microphone permission denied. Please allow microphone access in your browser settings."
        : `Error starting microphone: ${error.message || 'Unknown error'}`;
      
      this.callbacks?.onError?.(new Error(msg));
    }
  }

  private handleAudioOutput(base64: string) {
    this.audioQueue.push(base64);
    // [MIGUEL'S FIX]: Process queue immediately when new audio arrives
    this.processAudioQueue();
    this.callbacks?.onAudioData?.(base64);
  }

  private async processAudioQueue() {
    // Prevent concurrent scheduling loops
    if (this.isScheduling) return;
    this.isScheduling = true;

    try {
      if (!this.outputContext) {
        this.outputContext = new AudioContext({ sampleRate: 24000 });
      }
      
      if (this.outputContext.state === 'suspended') {
        await this.outputContext.resume();
      }

      // Loop through the queue and schedule all available chunks
      while (this.audioQueue.length > 0) {
        const base64 = this.audioQueue.shift()!;
        
        // Decode base64 to PCM
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const pcmData = new Int16Array(bytes.buffer);
        
        // Convert Int16 PCM to Float32
        const floatData = new Float32Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
          floatData[i] = pcmData[i] / 0x7FFF;
        }

        const now = this.outputContext.currentTime;
        // Gapless playback: if nextStartTime is behind, catch up
        if (this.nextStartTime < now) {
          this.nextStartTime = now + 0.05;
        }
        
        const startTime = this.nextStartTime;
        const buffer = this.outputContext.createBuffer(1, floatData.length, 24000);
        buffer.getChannelData(0).set(floatData);

        const source = this.outputContext.createBufferSource();
        source.buffer = buffer;
        this.currentSource = source;
        
        source.connect(this.outputContext.destination);
        
        source.start(startTime);
        this.nextStartTime += buffer.duration;
        
        this.isPlaying = true;
        this.activeSources++;
        this.callbacks?.onModelSpeaking?.(true);
        
        source.onended = () => {
          if (this.currentSource === source) this.currentSource = null;
          this.activeSources--;
          if (this.activeSources <= 0) {
            this.activeSources = 0;
            this.isPlaying = false;
            this.callbacks?.onModelSpeaking?.(false);
            this.updateStatus('idle');
          }
        };
      }
    } catch (error) {
      console.error("Error processing audio queue:", error);
    } finally {
      this.isScheduling = false;
    }
  }

  private stopPlayback() {
    this.audioQueue = [];
    this.isPlaying = false;
    this.isScheduling = false;
    this.nextStartTime = 0;
    
    // [MIGUEL'S ADVICE]: Properly stop the current source
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {
        // Source might have already stopped
      }
      this.currentSource = null;
    }
    this.activeSources = 0;
    this.callbacks?.onModelSpeaking?.(false);
  }

  private handleToolCall(toolCall: any) {
    const { functionCalls } = toolCall;
    if (!functionCalls) return;

    const responses: any[] = [];

    for (const call of functionCalls) {
      const { name, args, id } = call;
      console.log(`Tool Call: ${name}`, args);

      const store = useGameStore.getState();

      if (name === "updateChemistry") {
        const { amount } = args;
        const charId = store.voiceChat.characterId;
        if (charId) {
          // Logic to update chemistry
          const current = store.chemistryScores?.[charId] || 0;
          store.setGameState({
            chemistryScores: {
              ...store.chemistryScores,
              [charId]: Math.max(0, Math.min(100, current + amount))
            }
          });
        }
        responses.push({ name, id, response: { success: true } });
      } else if (name === "updateLoveScore") {
        const { amount } = args;
        const charId = store.voiceChat.characterId;
        if (charId) {
          const current = store.loveScores?.[charId] || 0;
          store.setGameState({
            loveScores: {
              ...store.loveScores,
              [charId]: Math.max(0, current + amount)
            }
          });
        }
        responses.push({ name, id, response: { success: true } });
      } else if (name === "updateMood") {
        const { mood } = args;
        const charId = store.voiceChat.characterId;
        if (charId && typeof mood === 'string') {
          store.updateMood(charId, mood.toLowerCase() as Mood);
        }
        responses.push({ name, id, response: { success: true } });
      } else if (name === "addMemory") {
        const { text } = args;
        const charId = store.voiceChat.characterId;
        if (charId) {
          // Logic to add memory
          const newMemory = {
            id: `mem_${Date.now()}`,
            text,
            tier: 'active' as const,
            timestamp: Date.now(),
            lastAccess: Date.now(),
            importance: 5
          };
          store.setGameState({
            memories: {
              ...store.memories,
              [charId]: [newMemory, ...(store.memories[charId] || [])]
            }
          });
        }
        responses.push({ name, id, response: { success: true } });
      }
    }

    if (this.session && responses.length > 0) {
      this.session.sendToolResponse({ functionResponses: responses });
    }
  }

  disconnect() {
    if (this.session) {
      try {
        this.session.close();
      } catch (e) {
        console.warn("Error closing session:", e);
      }
      this.session = null;
    }
    this.sessionPromise = null;
    this.cleanup();
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  async sendText(text: string) {
    if (this.session) {
      this.stopPlayback(); // Interrupt model when sending text
      this.updateStatus('thinking'); // Set status to thinking immediately
      
      try {
        // Try standard sendClientContent
        (this.session as any).sendClientContent({
          turns: [{
            role: 'user',
            parts: [{ text }]
          }],
          turnComplete: true
        });
      } catch (e) {
        console.error("sendClientContent failed, trying sendRealtimeInput fallback", e);
        // Fallback for some SDK versions
        try {
          (this.session as any).sendRealtimeInput({
            text: text
          });
        } catch (e2) {
          console.error("All text sending methods failed", e2);
        }
      }
    }
  }

  private cleanup() {
    if (this.processor) {
      try { this.processor.disconnect(); } catch (e) {}
      this.processor = null;
    }
    if (this.source) {
      try { this.source.disconnect(); } catch (e) {}
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.inputContext) {
      try { this.inputContext.close(); } catch (e) {}
      this.inputContext = null;
    }
    if (this.outputContext) {
      try { this.outputContext.close(); } catch (e) {}
      this.outputContext = null;
    }
    this.audioQueue = [];
    this.isPlaying = false;
  }
}

export const geminiLiveService = new GeminiLiveService();

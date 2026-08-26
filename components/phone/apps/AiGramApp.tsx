
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ArrowLeft, Search, PlusSquare, Home, User, RefreshCw } from 'lucide-react';
import { MOCK_POSTS, MOCK_STORIES, SocialPost } from '../../../data/socialPosts';
import { CHARACTER_DATA } from '../../../constants';
import { getCharacterImageUrl } from '../../../services/firebase';
import { useGameStore } from '../../../store/gameStore';
import { CharacterId } from '../../../types';
import { getSmartSocialAsset } from '../../../data/socialAssetPool';

interface AiGramAppProps {
    onClose: () => void;
}

export const AiGramApp: React.FC<AiGramAppProps> = ({ onClose }) => {
    const [posts, setPosts] = useState<SocialPost[]>([]); // Start empty, wait for generation
    const [likedPosts, setLikedPosts] = useState<string[]>([]);
    const [heartAnims, setHeartAnims] = useState<{id: string, x: number, y: number}[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    
    // Access Store for Clearing Notification & Tracking Seen Posts
    const { setGameState, seenSocialPosts } = useGameStore();
    
    // Avatar Cache
    const [avatars, setAvatars] = useState<Record<string, string>>({});

    // Inject Memory
    const injectMemory = (charId: CharacterId, caption: string) => {
        const store = useGameStore.getState();
        const memories = store.memories[charId] || [];
        
        const memoryKey = `[SYSTEM: User LIKED your AiGram post: "${caption.substring(0, 10)}..."]`;
        const alreadyExists = memories.some(m => m.text.includes(memoryKey));

        if (!alreadyExists) {
            const newMem = {
                id: `aigram_${Date.now()}`,
                text: `${memoryKey} They are watching your social media.`,
                tier: 'active' as const,
                timestamp: Date.now(),
                lastAccess: Date.now(),
                importance: 5
            };
            
            store.setGameState({
                memories: {
                    ...store.memories,
                    [charId]: [...memories, newMem]
                }
            });
        }
    };

    // Load Avatars
    useEffect(() => {
        const load = async () => {
            const map: Record<string, string> = {};
            for (const charId of Object.keys(CHARACTER_DATA)) {
                const url = await getCharacterImageUrl(CHARACTER_DATA[charId as CharacterId].baseImg);
                if (url) map[charId] = url;
            }
            setAvatars(map);
        };
        load();
    }, []);

    // --- DAILY FEED GENERATOR (BATCH 4 - NO DUPLICATES) ---
    const generateDailyFeed = async () => {
        setIsRefreshing(true);
        
        const weightedPool: CharacterId[] = [
            'miguel', 'miguel', 'miguel', 
            'bam', 'bam', 'bam', 
            'erin', 'erin', 'erin',
            'fia', 'peat', 'marcus', 'lucas', 'jellie', 'soul', 'mia'
        ];

        const newPosts: SocialPost[] = [];
        const currentHour = new Date().getHours();
        
        // [MARCUS FIX]: Logic for Duplicate Prevention
        // 1. Get current tracking map
        const currentSeenMap = { ...(seenSocialPosts || {}) };
        // 2. Define cooldown (48 hours)
        const COOLDOWN_MS = 48 * 60 * 60 * 1000;
        const now = Date.now();
        // 3. Track assets used in THIS batch to prevent instant duplicates
        const batchAssets = new Set<string>();

        let attempts = 0;
        const MAX_ATTEMPTS = 50; // Safety break

        while (newPosts.length < 4 && attempts < MAX_ATTEMPTS) {
            attempts++;

            // 1. Pick Character
            const randomChar = weightedPool[Math.floor(Math.random() * weightedPool.length)];
            
            // 2. Pick Context Tags
            const tags: string[] = [];
            if (currentHour < 10) tags.push('morning', 'coffee');
            else if (currentHour > 18) tags.push('night', 'party', 'chill');
            else tags.push('work', 'gym', 'traffic', 'day');

            const vibes = ['pet', 'story', 'food', 'cafe', 'lifestyle', 'selfie', 'outdoor'];
            tags.push(vibes[Math.floor(Math.random() * vibes.length)]);

            if (randomChar === 'miguel' && Math.random() > 0.4) tags.push('cat', 'tofu');
            if (randomChar === 'fia') tags.push('gym');
            if (randomChar === 'peat') tags.push('coffee');
            if (randomChar === 'bam') tags.push('cafe', 'study');
            if (randomChar === 'erin') tags.push('party', 'fashion');

            // 3. Get Asset Candidate
            const asset = getSmartSocialAsset(randomChar, tags);
            const assetId = asset.url; // Use URL as unique ID

            // 4. CHECK DUPLICATION
            // - Condition A: Used in this batch?
            if (batchAssets.has(assetId)) continue;

            // - Condition B: Used recently in global state?
            const lastSeen = currentSeenMap[assetId];
            // [MARCUS FIX]: If attempts are high (> 20), ignore the cooldown so characters with few pictures still show up.
            if (lastSeen && (now - lastSeen < COOLDOWN_MS) && attempts < 20) {
                // Asset is on cooldown. Skip.
                continue;
            }

            // 5. VALID POST FOUND -> Add to batch
            batchAssets.add(assetId);
            currentSeenMap[assetId] = now; // Update timestamp

            // Resolve Image
            let finalImageUrl = asset.url;
            if (!asset.url.startsWith('http')) {
                const resolvedUrl = await getCharacterImageUrl(asset.url);
                if (resolvedUrl) finalImageUrl = resolvedUrl;
                else finalImageUrl = "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop"; 
            }
            
            newPosts.push({
                id: `post_daily_${Date.now()}_${newPosts.length}`,
                characterId: randomChar,
                imageUrl: finalImageUrl,
                caption: asset.caption,
                likes: Math.floor(Math.random() * 500) + 10,
                timestamp: `${Math.floor(Math.random() * 12) + 1}h ago`,
                location: 'AiLuv City',
                hashtags: asset.tags.map(t => `#${t}`),
                comments: []
            });
        }

        // [MARCUS FIX]: Save Updated Seen Map to Store
        setGameState({ seenSocialPosts: currentSeenMap });

        setPosts(newPosts); 
        setIsRefreshing(false);
    };

    // Initial Load (Simulate Daily Reset Check)
    useEffect(() => {
        if (isInitialLoad) {
            generateDailyFeed();
            // [MARCUS FIX]: Clear notification when opened
            setGameState({ unreadSocialPosts: 0 });
            setIsInitialLoad(false);
        }
    }, [isInitialLoad, setGameState]);

    const handleLike = (post: SocialPost, isDoubleTap: boolean = false, clientX?: number, clientY?: number) => {
        const isAlreadyLiked = likedPosts.includes(post.id);
        
        if (isDoubleTap || !isAlreadyLiked) {
            if (navigator.vibrate) navigator.vibrate(50);
            
            if (!isAlreadyLiked) {
                setLikedPosts(prev => [...prev, post.id]);
                setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: p.likes + 1 } : p));
                injectMemory(post.characterId, post.caption);
            }

            if (isDoubleTap && clientX && clientY) {
                const id = Date.now().toString();
                setHeartAnims(prev => [...prev, { id, x: clientX, y: clientY }]);
                setTimeout(() => {
                    setHeartAnims(prev => prev.filter(h => h.id !== id));
                }, 800);
            }
        } else if (!isDoubleTap && isAlreadyLiked) {
            setLikedPosts(prev => prev.filter(id => id !== post.id));
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: p.likes - 1 } : p));
        }
    };

    return (
        <div className="absolute inset-0 bg-black flex flex-col z-50 text-white overflow-hidden">
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* FIXED HEADER (Top Nav) */}
            <div className="shrink-0 bg-black z-30 pt-[44px] border-b border-white/10">
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-1 pl-8"> {/* Added padding-left for back button space */}
                        <span className="font-bold text-xl italic tracking-tighter">AiGram</span>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={generateDailyFeed} 
                            className={`transition-transform active:scale-90 text-white hover:text-pink-500 ${isRefreshing ? 'animate-spin text-pink-500' : ''}`}
                            title="Simulate Daily Reset (Refresh)"
                        >
                            <RefreshCw size={22} />
                        </button>
                        <Heart size={24} />
                        <MessageCircle size={24} />
                    </div>
                </div>
            </div>

            {/* Scrollable Content Feed */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative">
                
                {/* Stories Bar */}
                <div className="relative bg-white/5 backdrop-blur-md border-b border-white/5 py-3 pl-2 mb-2 z-10">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar px-2">
                        <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className="w-16 h-16 rounded-full border-2 border-gray-700 p-0.5 relative">
                                <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center">
                                    <PlusSquare size={20} className="text-white" />
                                </div>
                                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-black text-[10px] font-bold">+</div>
                            </div>
                            <span className="text-xs text-gray-400">Your Story</span>
                        </div>
                        
                        {MOCK_STORIES.map((charId) => (
                            <div key={charId} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
                                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600">
                                    <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-gray-800">
                                        {avatars[charId] && <img src={avatars[charId]} className="w-full h-full object-cover" />}
                                    </div>
                                </div>
                                <span className="text-xs text-white">{CHARACTER_DATA[charId]?.name || charId}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Posts Feed */}
                <div className="pb-20">
                    {posts.length === 0 && !isRefreshing && (
                        <div className="text-center py-20 text-gray-500 text-sm">No posts yet...</div>
                    )}

                    {posts.map(post => {
                        const isLiked = likedPosts.includes(post.id);
                        const charName = CHARACTER_DATA[post.characterId]?.name || post.characterId;

                        return (
                            <div key={post.id} className="mb-4 bg-black animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 border border-white/10">
                                            {avatars[post.characterId] && <img src={avatars[post.characterId]} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">{charName}</div>
                                            {post.location && <div className="text-[10px] text-gray-400">{post.location}</div>}
                                        </div>
                                    </div>
                                    <button><MoreHorizontal size={20} className="text-white" /></button>
                                </div>

                                <div 
                                    className="w-full aspect-square bg-gray-900 relative overflow-hidden group"
                                    onDoubleClick={(e) => handleLike(post, true, e.clientX, e.clientY)}
                                >
                                    <img src={post.imageUrl} className="w-full h-full object-cover" alt="Post" />
                                    {/* Like Heart Animation */}
                                    {heartAnims.map(h => (
                                        <div key={h.id} className="absolute pointer-events-none text-white drop-shadow-lg animate-ping" style={{ left: h.x - 20, top: h.y - 120 }}>
                                            <Heart size={80} fill="white" />
                                        </div>
                                    ))}
                                </div>

                                <div className="p-3 pb-0 flex justify-between items-center">
                                    <div className="flex gap-4">
                                        <button onClick={() => handleLike(post)} className="transition-transform active:scale-90">
                                            <Heart size={26} className={isLiked ? "text-red-500 fill-red-500" : "text-white"} />
                                        </button>
                                        <button className="transition-transform active:scale-90"><MessageCircle size={26} /></button>
                                        <button className="transition-transform active:scale-90"><Send size={26} /></button>
                                    </div>
                                    <button><Bookmark size={26} /></button>
                                </div>

                                <div className="px-3 pt-2">
                                    <div className="font-bold text-sm mb-1">{post.likes.toLocaleString()} likes</div>
                                    <div className="text-sm">
                                        <span className="font-bold mr-2">{charName}</span>
                                        {post.caption}
                                    </div>
                                    <div className="flex gap-1 mt-1 flex-wrap">
                                        {post.hashtags.map((tag, i) => (
                                            <span key={i} className="text-xs text-blue-400">{tag}</span>
                                        ))}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 cursor-pointer">
                                        View all {post.comments?.length || 0} comments
                                    </div>
                                    <div className="text-[10px] text-gray-600 mt-1 uppercase">{post.timestamp}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Floating Back Button (Aligned to header space) */}
            <button onClick={onClose} className="absolute top-[52px] left-3 z-50 p-2 text-white/90 hover:text-white transition-all active:scale-90">
                <ArrowLeft size={24} />
            </button>

            {/* Bottom Nav */}
            <div className="h-[50px] border-t border-white/10 bg-black/90 backdrop-blur-md flex justify-around items-center px-4 shrink-0 absolute bottom-0 w-full z-20">
                <Home size={24} strokeWidth={2.5} />
                <Search size={24} className="opacity-50" />
                <PlusSquare size={24} className="opacity-50" />
                <Heart size={24} className="opacity-50" />
                <div className="w-6 h-6 rounded-full bg-gray-600 border border-white opacity-50">
                    <User size={16} className="m-1" />
                </div>
            </div>
        </div>
    );
};

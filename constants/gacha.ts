
export type GachaTier = 'NORMAL' | 'MAGIC' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface GachaItem {
    id: string; // Refers to itemID (shop/fashion) or 'gold'/'diamond'
    name: string;
    amount?: number; // For Gold/Diamond
    tier: GachaTier;
    type: 'gold' | 'diamond' | 'item' | 'style';
}

export const GACHA_RATE = {
    NORMAL: 0.40,
    MAGIC: 0.35,
    RARE: 0.15,
    EPIC: 0.08,
    LEGENDARY: 0.02
};

export const GACHA_COLORS = {
    NORMAL: 'border-slate-300 bg-slate-100 text-slate-600',
    MAGIC: 'border-green-400 bg-green-100 text-green-600',
    RARE: 'border-blue-400 bg-blue-100 text-blue-600',
    EPIC: 'border-purple-400 bg-purple-100 text-purple-600',
    LEGENDARY: 'border-orange-400 bg-orange-100 text-orange-600'
};

export const GACHA_POOL: GachaItem[] = [
    // --- NORMAL TIER (40%) ---
    { id: 'gold', name: '250 Gold', amount: 250, tier: 'NORMAL', type: 'gold' },
    { id: 'gold', name: '500 Gold', amount: 500, tier: 'NORMAL', type: 'gold' },
    { id: 'gold', name: '900 Gold', amount: 900, tier: 'NORMAL', type: 'gold' },
    { id: 'food_full_meal', name: 'Full Meal', tier: 'NORMAL', type: 'item' },
    { id: 'style_hoodie', name: 'Cozy Hoodie', tier: 'NORMAL', type: 'style' },

    // --- MAGIC TIER (35%) ---
    { id: 'gold', name: '1100 Gold', amount: 1100, tier: 'MAGIC', type: 'gold' },
    { id: 'gold', name: '1500 Gold', amount: 1500, tier: 'MAGIC', type: 'gold' },
    { id: 'gold', name: '2500 Gold', amount: 2500, tier: 'MAGIC', type: 'gold' },
    { id: 'omakase', name: 'Premium Omakase', tier: 'MAGIC', type: 'item' },
    { id: 'style_gym_tank', name: 'Gym Rat Tank', tier: 'MAGIC', type: 'style' },
    { id: 'gift_flowers', name: 'Bouquet', tier: 'MAGIC', type: 'item' },
    { id: 'gadget_pods', name: 'Noise-Canceling Pods', tier: 'MAGIC', type: 'item' },
    { id: 'market_macaron', name: 'Galaxy Macaron', tier: 'MAGIC', type: 'item' },
    { id: 'market_caviar', name: 'Caviar Bun', tier: 'MAGIC', type: 'item' },
    { id: 'market_lobster', name: 'Jackpot Lobster', tier: 'MAGIC', type: 'item' },

    // --- RARE TIER (15%) ---
    { id: 'gold', name: '5000 Gold', amount: 5000, tier: 'RARE', type: 'gold' },
    { id: 'diamond', name: '300 Diamonds', amount: 300, tier: 'RARE', type: 'diamond' },
    { id: 'style_earth_tone', name: 'Minimalist Earth Tone', tier: 'RARE', type: 'style' },
    { id: 'style_blazer', name: 'Smart Casual Blazer', tier: 'RARE', type: 'style' },
    { id: 'gadget_laptop', name: 'Pro Laptop', tier: 'RARE', type: 'item' },

    // --- EPIC TIER (8%) ---
    { id: 'gold', name: '10000 Gold', amount: 10000, tier: 'EPIC', type: 'gold' },
    { id: 'diamond', name: '450 Diamonds', amount: 450, tier: 'EPIC', type: 'diamond' },
    { id: 'style_date_night', name: 'First Date Outfit', tier: 'EPIC', type: 'style' },
    { id: 'gift_ring', name: 'Promise Ring', tier: 'EPIC', type: 'item' },
    { id: 'gadget_bed', name: 'DreamCloud Pod', tier: 'EPIC', type: 'item' },
    { id: 'gadget_music_pods', name: 'Music Alway Pods', tier: 'EPIC', type: 'item' },
    { id: 'style_vandal_black', name: 'VANDAL: Black Edition', tier: 'EPIC', type: 'style' }, // NEW

    // --- LEGENDARY TIER (2%) ---
    { id: 'gold', name: '100000 Gold', amount: 100000, tier: 'LEGENDARY', type: 'gold' },
    { id: 'gadget_mind_reader', name: 'Neon Soul Visor', tier: 'LEGENDARY', type: 'item' },
    { id: 'style_ceo_suit', name: 'The Secret CEO Suit', tier: 'LEGENDARY', type: 'style' }, // NEW
];

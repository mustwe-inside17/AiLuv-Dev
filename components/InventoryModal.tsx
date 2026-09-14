import { StoryKeys } from './story/StoryKeys';
import { emptyStoryProgress } from '../domain/story/storyEngine';

import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../store/gameStore';
import { SHOP_ITEMS } from '../constants';
import { FASHION_ITEMS } from '../constants/fashion';
import { X, Package, Gift, Shirt, Coffee, Info, Laptop, Recycle } from 'lucide-react'; 
import { ShopItem, StyleItem } from '../types';
import { ItemIcon } from './ui/ItemIcon';

interface InventoryModalProps {
    onClose: () => void;
    onConsume?: (item: ShopItem) => void; 
    onRecycle?: (item: ShopItem) => void; // NEW PROP
}

type TabType = 'key' | 'consumable' | 'gadget' | 'gift' | 'fashion'; 

export const InventoryModal: React.FC<InventoryModalProps> = ({ onClose, onConsume, onRecycle }) => {
    const { inventory, ownedStyles } = useGameStore(useShallow(state => ({
        inventory: state.inventory,
        ownedStyles: state.ownedStyles
    })));
    const story = useGameStore(state => state.story);
    const [activeTab, setActiveTab] = useState<TabType>('consumable');
    const [isRecycleMode, setIsRecycleMode] = useState(false); // NEW STATE: Toggle Recycle

    // 1. Process Consumables & Gifts (From Inventory Map)
    const allInventoryItems = Object.entries(inventory).map(([id, count]) => {
        const itemDef = SHOP_ITEMS.find(i => i.id === id);
        if (!itemDef) return null;
        return { ...itemDef, count: count as number };
    }).filter((i): i is ShopItem & { count: number } => i !== null && i.count > 0);

    // Split Categories with explicit types to prevent unknown inference
    const consumables = allInventoryItems.filter(i => i.category === 'food'); // Food only
    const gadgets = allInventoryItems.filter(i => i.category === 'gadget');   // Tech only
    const gifts = allInventoryItems.filter(i => i.category === 'gift');

    // 2. Process Fashion (From Owned Styles Array) - Fix Type Inference
    // Using a type guard (item is StyleItem) allows us to remove the '!' assertions later
    const myFashion = ownedStyles
        .map(id => FASHION_ITEMS.find(f => f.id === id))
        .filter((item): item is StyleItem => item !== undefined);

    return (
        <div className="fixed inset-0 z-[800] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border-4 ${isRecycleMode ? 'border-yellow-400' : 'border-white/20 dark:border-slate-700'} flex flex-col max-h-[85vh] transition-colors`}>
                
                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Package size={20} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-lg text-gray-800 dark:text-white leading-none">My Inventory</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">คลังเก็บของ</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {/* RECYCLE TOGGLE */}
                        <button onClick={() => { setActiveTab('key'); setIsRecycleMode(false); }} className="flex-1 min-w-[70px] py-3 font-bold text-violet-500">Key</button>
                        <button 
                            onClick={() => setIsRecycleMode(!isRecycleMode)}
                            className={`p-2 rounded-full transition-all flex items-center gap-2 px-3 ${isRecycleMode ? 'bg-yellow-400 text-yellow-900 shadow-md animate-pulse' : 'bg-gray-200 dark:bg-slate-800 text-gray-500 hover:text-gray-700'}`}
                            title="Recycle Mode"
                        >
                            <Recycle size={18} />
                            {isRecycleMode && <span className="text-xs font-bold">เปิดโหมดขาย</span>}
                        </button>
                        
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Recycle Notice */}
                {isRecycleMode && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 text-center border-b border-yellow-200 dark:border-yellow-900/50">
                        <p className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide flex items-center justify-center gap-2">
                            <Info size={12} /> เลือกขายไอเทมซ้ำเพื่อรับ Gold/Diamonds
                        </p>
                    </div>
                )}

                {/* Tabs */}
                <div className="p-4 pb-0 shrink-0">
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto no-scrollbar gap-1">
                        <button 
                            onClick={() => setActiveTab('consumable')} 
                            className={`flex-1 min-w-[70px] py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'consumable' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Coffee size={12} /> Food
                        </button>
                        <button 
                            onClick={() => setActiveTab('gadget')} 
                            className={`flex-1 min-w-[70px] py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'gadget' ? 'bg-white dark:bg-slate-700 shadow text-cyan-600 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Laptop size={12} /> Tech
                        </button>
                        <button 
                            onClick={() => setActiveTab('gift')} 
                            className={`flex-1 min-w-[70px] py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'gift' ? 'bg-white dark:bg-slate-700 shadow text-pink-600 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Gift size={12} /> Gifts
                        </button>
                        <button 
                            onClick={() => setActiveTab('fashion')} 
                            className={`flex-1 min-w-[70px] py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'fashion' ? 'bg-white dark:bg-slate-700 shadow text-fuchsia-600 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Shirt size={12} /> Style
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                    
                    {/* CONSUMABLES TAB (FOOD) */}
                    {activeTab === 'key' && <StoryKeys progress={story || emptyStoryProgress()} onOpenJournal={() => { onClose(); useGameStore.getState().openPhone('story'); }} />}
                    {activeTab === 'consumable' && (
                        <div className="grid grid-cols-2 gap-3">
                            {consumables.length === 0 ? (
                                <div className="col-span-2 text-center py-10 text-gray-400 text-xs">No food items. Visit the Shop!</div>
                            ) : (
                                consumables.map((item, idx) => (
                                    <div key={idx} className={`bg-white dark:bg-slate-800 p-3 rounded-2xl border ${isRecycleMode && item.count > 1 ? 'border-yellow-400 shadow-md ring-1 ring-yellow-200 dark:ring-yellow-900/50' : 'border-gray-100 dark:border-slate-700'} shadow-sm flex flex-col items-center text-center relative group ${isRecycleMode && item.count <= 1 ? 'opacity-50 grayscale' : ''}`}>
                                        <div className="absolute top-2 right-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                                            x{item.count}
                                        </div>
                                        <div className="text-4xl mb-2 filter drop-shadow-md">
                                            <ItemIcon itemId={item.id} fallbackEmoji={item.emoji} className="w-12 h-12" />
                                        </div>
                                        <div className="font-bold text-sm text-gray-800 dark:text-white leading-tight">{item.name}</div>
                                        <p className="text-[9px] text-gray-400 mt-1 line-clamp-1">{item.description || ''}</p>
                                        
                                        {/* Action Button */}
                                        {isRecycleMode ? (
                                            <button 
                                                onClick={() => onRecycle && onRecycle(item)}
                                                disabled={item.count <= 1}
                                                className={`mt-2 w-full py-1.5 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${item.count > 1 ? 'bg-yellow-400 hover:bg-yellow-500 text-black shadow-md border-2 border-yellow-500' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                            >
                                                <Recycle size={10} /> ขาย
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => onConsume && onConsume(item)}
                                                className="mt-2 w-full bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 py-1.5 rounded-lg text-[9px] text-green-700 dark:text-green-400 font-bold flex items-center justify-center gap-1 transition-colors active:scale-95 border border-green-200 dark:border-green-800"
                                            >
                                                Eat in Inventory
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* GADGETS TAB (TECH) */}
                    {activeTab === 'gadget' && (
                        <div className="grid grid-cols-2 gap-3">
                            {gadgets.length === 0 ? (
                                <div className="col-span-2 text-center py-10 text-gray-400 text-xs">No gadgets owned. Check Shop!</div>
                            ) : (
                                gadgets.map((item, idx) => (
                                    <div key={idx} className={`bg-white dark:bg-slate-800 p-3 rounded-2xl border ${isRecycleMode && item.count > 1 ? 'border-yellow-400 shadow-md ring-1 ring-yellow-200 dark:ring-yellow-900/50' : 'border-cyan-100 dark:border-slate-700'} shadow-sm flex flex-col items-center text-center relative group ${isRecycleMode && item.count <= 1 ? 'opacity-50 grayscale' : ''}`}>
                                        <div className="absolute top-2 right-2 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-300 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                                            x{item.count}
                                        </div>
                                        <div className="text-4xl mb-2 filter drop-shadow-md">
    <ItemIcon itemId={item.id} fallbackEmoji={String(item.emoji)} className="w-12 h-12" />
</div>
                                        <div className="font-bold text-sm text-gray-800 dark:text-white leading-tight">{item.name}</div>
                                        <p className="text-[9px] text-gray-400 mt-1 line-clamp-2 h-6">{item.description || ''}</p>
                                        
                                        {/* Action Hint */}
                                        {isRecycleMode ? (
                                            <button 
                                                onClick={() => onRecycle && onRecycle(item)}
                                                disabled={item.count <= 1}
                                                className={`mt-2 w-full py-1.5 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${item.count > 1 ? 'bg-yellow-400 hover:bg-yellow-500 text-black shadow-md border-2 border-yellow-500' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                            >
                                                <Recycle size={10} /> ขาย
                                            </button>
                                        ) : (
                                            <div className="mt-2 w-full bg-cyan-50 dark:bg-slate-700/50 py-1 rounded-lg text-[9px] text-cyan-600 dark:text-cyan-400 font-bold flex items-center justify-center gap-1">
                                                Passive Skill
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* GIFTS TAB */}
                    {activeTab === 'gift' && (
                        <div className="grid grid-cols-2 gap-3">
                            {gifts.length === 0 ? (
                                <div className="col-span-2 text-center py-10 text-gray-400 text-xs">No gifts. Buy some for your crush!</div>
                            ) : (
                                gifts.map((item, idx) => (
                                    <div key={idx} className={`bg-white dark:bg-slate-800 p-3 rounded-2xl border ${isRecycleMode && item.count > 1 ? 'border-yellow-400 shadow-md ring-1 ring-yellow-200 dark:ring-yellow-900/50' : 'border-pink-100 dark:border-slate-700'} shadow-sm flex flex-col items-center text-center relative ${isRecycleMode && item.count <= 1 ? 'opacity-50 grayscale' : ''}`}>
                                        <div className="absolute top-2 right-2 bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                                            x{item.count}
                                        </div>
                                        <div className="text-4xl mb-2 filter drop-shadow-md">
                                            <ItemIcon itemId={item.id} fallbackEmoji={item.emoji} className="w-12 h-12" />
                                        </div>
                                        <div className="font-bold text-sm text-gray-800 dark:text-white leading-tight">{item.name}</div>
                                        
                                        {isRecycleMode ? (
                                            <button 
                                                onClick={() => onRecycle && onRecycle(item)}
                                                disabled={item.count <= 1}
                                                className={`mt-2 w-full py-1.5 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${item.count > 1 ? 'bg-yellow-400 hover:bg-yellow-500 text-black shadow-md border-2 border-yellow-500' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                            >
                                                <Recycle size={10} /> ขาย
                                            </button>
                                        ) : (
                                            <div className="mt-2 w-full bg-pink-50 dark:bg-slate-700/50 py-1 rounded-lg text-[9px] text-pink-500 font-bold">
                                                Use in Chat 💬
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* FASHION TAB */}
                    {activeTab === 'fashion' && (
                        <div className="space-y-3">
                            {isRecycleMode && (
                                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl flex items-center gap-2 mb-2">
                                    <Info size={16} className="text-red-500" />
                                    <p className="text-[10px] text-red-600 dark:text-red-400 font-bold">Fashion cannot be recycled yet.</p>
                                </div>
                            )}
                            
                            {myFashion.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 text-xs">No clothes yet. Check out the Mall!</div>
                            ) : (
                                myFashion.map((item, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                                            {item.icon || '👕'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <div className="font-bold text-sm text-gray-800 dark:text-white truncate">{item.name}</div>
                                                <div className="text-[9px] font-bold bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-300 px-1.5 py-0.5 rounded uppercase">
                                                    {item.collection}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 mt-1 flex-wrap">
                                                {/* FIX: Convert value v to String(v) to satisfy ReactNode type */}
                                                {item.stats && Object.entries(item.stats).map(([k, v]) => (
                                                    <span key={k} className="text-[8px] bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-gray-500 uppercase font-bold">
                                                        {k} +{String(v)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            
                            {!isRecycleMode && myFashion.length > 0 && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl flex items-start gap-2">
                                    <Info size={16} className="text-blue-500 mt-0.5" />
                                    <p className="text-[10px] text-blue-600 dark:text-blue-300 font-medium">
                                        Go to <b>Me &gt; Change Style</b> tab to equip these items and gain bonus stats!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};


import React, { useState, useEffect } from 'react';
import { Gem, Coins, X, CheckCircle2, Crown, Key, AlertCircle, Lock } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../store/gameStore';
import { LOCATION_IMAGES } from '../constants';
import { getCharacterImageUrl } from '../services/firebase';

interface DiamondShopModalProps {
    onClose: () => void;
}

export const DiamondShopModal: React.FC<DiamondShopModalProps> = ({ onClose }) => {
    const { gold, diamonds, addDiamonds } = useGameStore(useShallow(state => ({
        gold: state.gold,
        diamonds: state.diamonds,
        addDiamonds: state.addDiamonds
    })));
    
    // Animation State: starting -> open -> closing
    const [renderState, setRenderState] = useState<'starting' | 'open' | 'closing'>('starting');
    
    const [activeTab, setActiveTab] = useState<'topup' | 'redeem'>('topup');
    const [headerUrl, setHeaderUrl] = useState('');
    
    // Top-up State
    const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);

    // Redeem State
    const [redeemCode, setRedeemCode] = useState('');
    const [redeemStatus, setRedeemStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [redeemMsg, setRedeemMsg] = useState('');

    useEffect(() => {
        // Trigger Open Animation
        requestAnimationFrame(() => setRenderState('open'));

        const load = async () => {
            const url = await getCharacterImageUrl(LOCATION_IMAGES.diamond_shop_header);
            if (url) setHeaderUrl(url);
        };
        load();
    }, []);

    const handleClose = () => {
        setRenderState('closing');
        setTimeout(onClose, 300); // Match CSS transition duration
    };

    const handleRedeem = () => {
        if (!redeemCode.trim()) return;

        if (redeemCode.trim() === "500DIAMOND") {
            addDiamonds(500);
            setRedeemStatus('success');
            setRedeemMsg("ยินดีด้วยคุณได้รับ 500 DIAMOND");
            setRedeemCode('');
            // Reset success message after 3 seconds to allow more redeeming if needed
            setTimeout(() => {
                setRedeemStatus('idle');
                setRedeemMsg('');
            }, 3000);
        } else {
            setRedeemStatus('error');
            setRedeemMsg("Code ผิด โปรดลองใหม่");
            // Clear error after 2 seconds
            setTimeout(() => {
                setRedeemStatus('idle');
                setRedeemMsg('');
            }, 2000);
        }
    };

    const packages = [
        { id: 'p1', amount: 100, price: '$0.99', bonus: 0, color: 'bg-slate-50 dark:bg-slate-800' },
        { id: 'p2', amount: 550, price: '$4.99', bonus: 50, color: 'bg-blue-50 dark:bg-blue-900/20' },
        { id: 'p3', amount: 1200, price: '$9.99', bonus: 200, color: 'bg-purple-50 dark:bg-purple-900/20', popular: true },
        { id: 'p4', amount: 3000, price: '$24.99', bonus: 500, color: 'bg-cyan-50 dark:bg-cyan-900/20' },
    ];

    return (
        <div className={`fixed inset-0 z-[700] flex items-center justify-center p-4 transition-all duration-300 ${renderState === 'open' ? 'bg-slate-950/80 backdrop-blur-sm opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`}>
            
            <div 
                className={`
                    relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-cyan-500/20 
                    transform transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)
                    ${renderState === 'open' ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}
                `}
            >
                {/* Close Button */}
                <button onClick={handleClose} className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors">
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 h-36 relative overflow-hidden shrink-0">
                    {headerUrl ? (
                        <img src={headerUrl} className="absolute inset-0 w-full h-full object-cover" alt="Diamond Shop" />
                    ) : (
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-20"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center z-10 p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Gem size={28} className="text-cyan-200 fill-cyan-400 animate-pulse" />
                            <h2 className="text-2xl font-black tracking-tight italic text-white drop-shadow-md">DIAMOND SHOP</h2>
                        </div>
                        <p className="text-cyan-100 text-xs font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                            Premium Currency
                        </p>
                    </div>
                </div>

                {/* Balance Strip */}
                <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 p-3 flex justify-between items-center z-10 shadow-sm relative">
                    <div className="flex items-center gap-2">
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1.5 rounded-lg text-yellow-600 dark:text-yellow-400">
                            <Coins size={16} fill="currentColor" />
                        </div>
                        <div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase">Gold</div>
                            <div className="text-sm font-black text-gray-800 dark:text-white">{Math.floor(gold)}</div>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-gray-200 dark:bg-slate-700"></div>
                    <div className="flex items-center gap-2">
                        <div className="bg-cyan-100 dark:bg-cyan-900/30 p-1.5 rounded-lg text-cyan-600 dark:text-cyan-400">
                            <Gem size={16} fill="currentColor" />
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] font-bold text-gray-400 uppercase">Diamonds</div>
                            <div className="text-sm font-black text-gray-800 dark:text-white">{diamonds || 0}</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-4 mt-3">
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button 
                            onClick={() => setActiveTab('topup')}
                            className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'topup' ? 'bg-white dark:bg-slate-700 shadow text-gray-800 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Crown size={12} /> Packages
                        </button>
                        <button 
                            onClick={() => setActiveTab('redeem')}
                            className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'redeem' ? 'bg-white dark:bg-slate-700 shadow text-gray-800 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Key size={12} /> Redeem
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 h-[340px] overflow-y-auto custom-scrollbar relative flex flex-col">
                    {activeTab === 'redeem' ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 pt-4 text-center">
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm mb-2 transition-colors ${redeemStatus === 'success' ? 'bg-green-100 text-green-500' : redeemStatus === 'error' ? 'bg-red-100 text-red-500' : 'bg-white dark:bg-slate-900 text-cyan-500'}`}>
                                    {redeemStatus === 'success' ? <CheckCircle2 size={32} /> : redeemStatus === 'error' ? <AlertCircle size={32} /> : <Key size={32} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">Redeem Code</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter your promo code to claim rewards.</p>
                                </div>
                                <input 
                                    type="text" 
                                    value={redeemCode}
                                    onChange={(e) => { setRedeemCode(e.target.value); setRedeemStatus('idle'); }}
                                    placeholder="ENTER CODE"
                                    disabled={redeemStatus === 'success'}
                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-center font-mono font-bold tracking-widest text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 uppercase disabled:opacity-50"
                                />
                                
                                {/* Feedback Area */}
                                {redeemStatus !== 'idle' ? (
                                    <div className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 ${redeemStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                        {redeemStatus === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                        {redeemMsg}
                                    </div>
                                ) : (
                                    <button 
                                        onClick={handleRedeem}
                                        disabled={!redeemCode.trim()}
                                        className="w-full py-3 rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 bg-cyan-500 text-white hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Redeem Now
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        // TOPUP TAB
                        <div className="flex flex-col h-full relative">
                            {/* Packages List - Scrollable Area */}
                            <div className="flex-1 space-y-3 animate-in fade-in slide-in-from-left-4 duration-300 overflow-y-auto pb-16 custom-scrollbar">
                                {packages.map((pkg) => (
                                    <button 
                                        key={pkg.id}
                                        onClick={() => setSelectedPkgId(pkg.id)}
                                        className={`
                                            w-full p-3 rounded-2xl flex items-center justify-between border-2 transition-all relative overflow-hidden group
                                            ${pkg.color}
                                            ${selectedPkgId === pkg.id 
                                                ? 'border-cyan-500 ring-2 ring-cyan-200 dark:ring-cyan-900 scale-[1.02] shadow-md z-10' 
                                                : 'border-transparent hover:border-gray-200 dark:hover:border-slate-600'}
                                        `}
                                    >
                                        {pkg.popular && (
                                            <div className="absolute top-0 right-0 bg-cyan-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg z-10">POPULAR</div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm text-cyan-500">
                                                <Gem size={20} fill="currentColor" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-black text-gray-800 dark:text-white flex items-center gap-1">
                                                    {pkg.amount} 
                                                    {pkg.bonus > 0 && <span className="text-xs text-green-500 font-bold">+{pkg.bonus}</span>}
                                                </div>
                                                <div className="text-[10px] font-bold text-gray-400">Diamonds</div>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-lg font-bold text-sm shadow-sm border ${selectedPkgId === pkg.id ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white border-gray-100 dark:border-slate-600'}`}>
                                            {pkg.price}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Sticky Compact "Coming Soon" Button */}
                            <div className="absolute bottom-0 left-0 right-0 pt-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
                                <button 
                                    disabled={true} 
                                    className="w-full bg-gray-100 dark:bg-slate-800 text-gray-400 font-bold text-xs py-3 rounded-xl shadow-inner flex items-center justify-center gap-2 cursor-not-allowed border border-dashed border-gray-300 dark:border-slate-700 uppercase tracking-widest"
                                >
                                    <Lock size={12} /> Coming Soon
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

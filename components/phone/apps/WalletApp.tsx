import React, { useState, useEffect, useMemo } from 'react';
import { 
    ArrowLeft, Plus, Minus, User, Gem, TrendingUp, Landmark, Clock, X, 
    ArrowUpRight, ArrowDownRight, ArrowUp, ArrowDown, HelpCircle, Briefcase, 
    Newspaper, BarChart2, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { useGameStore } from '../../../store/gameStore';
import { playSfx } from '../../../utils/audioUtils';
import { motion, AnimatePresence } from 'motion/react';
import { getCharacterImageUrl } from '../../../services/firebase';
import { StockNewsItem } from '../../../types';

interface WalletAppProps {
    onClose: () => void;
    userProfile?: any;
}

const AVATAR_MAP: Record<string, string> = {
  'male': 'avatars/male.png',
  'male2': 'avatars/male2.png',
  'male3': 'avatars/male3.png',
  'male4': 'avatars/male4.png',
  'female': 'avatars/female.png',
  'female2': 'avatars/female2.png',
  'female3': 'avatars/female3.png',
  'female4': 'avatars/female4.png',
  'female5': 'avatars/female5.png',
};

export const WalletApp: React.FC<WalletAppProps> = ({ onClose, userProfile }) => {
    const { 
        gold, diamonds, activeStakes, stockMarket, portfolio, 
        investGold, claimStake, buyStock, sellStock, updateStockMarket, playerName 
    } = useGameStore();
    
    // UI states
    const [activeTab, setActiveTab] = useState<'market' | 'portfolio' | 'news' | 'staking'>('market');
    const [showHintModal, setShowHintModal] = useState(false);
    const [showStakingModal, setShowStakingModal] = useState(false);
    const [stakeAmount, setStakeAmount] = useState<number>(0);
    const [selectedPlan, setSelectedPlan] = useState<{ hours: number; rate: number; label: string }>({
        hours: 24,
        rate: 0.05,
        label: 'ฝากประจำ 24 ชม. (+5%)'
    });
    const [, setTicker] = useState<number>(0);
    
    const [selectedStock, setSelectedStock] = useState<string | null>(null);
    const [tradeAmount, setTradeAmount] = useState<number>(0);
    const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
    
    // Cooldown state for market refresh anti-spam (45s)
    const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

    // Confirmation context
    const [confirmContext, setConfirmContext] = useState<{
        type: 'invest' | 'trade', 
        action?: 'buy' | 'sell', 
        amount: number, 
        stockSymbol?: string, 
        totalValue?: number
    } | null>(null);

    // Avatar states
    const [realisticAvatarUrl, setRealisticAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchAvatar = async () => {
            const config = userProfile?.avatarConfig;
            if (config?.mode === 'realistic' && config.realisticId) {
                const path = AVATAR_MAP[config.realisticId];
                if (path) {
                    const url = await getCharacterImageUrl(path);
                    if (url) setRealisticAvatarUrl(url);
                }
            }
        };
        fetchAvatar();
    }, [userProfile?.avatarConfig]);

    const avatarUrl = useMemo(() => {
        const config = userProfile?.avatarConfig;
        if (config?.mode === 'realistic' && realisticAvatarUrl) return realisticAvatarUrl;
        if (config?.mode === 'upload' && config.uploadedUrl) return config.uploadedUrl;
        if (config?.mode === 'cartoon' && config.cartoonUrl) return config.cartoonUrl;
        
        const seed = config?.cartoonSeed || userProfile?.name || 'Player';
        const bg = config?.cartoonColor || 'b6e3f4';
        return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bg}`;
    }, [userProfile, realisticAvatarUrl]);

    // Auto update market interval every 60s
    useEffect(() => {
        const interval = setInterval(() => {
            updateStockMarket();
        }, 60000);
        return () => clearInterval(interval);
    }, [updateStockMarket]);

    // Countdown tick for manual refresh cooldown
    useEffect(() => {
        if (cooldownRemaining <= 0) return;
        const timer = setInterval(() => {
            setCooldownRemaining(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldownRemaining]);

    // Live countdown timer for staking tab
    useEffect(() => {
        if (activeTab !== 'staking') return;
        const timer = setInterval(() => {
            setTicker(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [activeTab]);

    const handleManualRefresh = () => {
        if (cooldownRemaining > 0) return;
        updateStockMarket();
        playSfx('task_complete');
        setCooldownRemaining(45); // Set 45s anti-spam cooldown
    };

    const handleBack = () => {
        playSfx('bubble_pop');
        onClose();
    };

    const handleInvestConfirm = () => {
        if (stakeAmount > 0 && stakeAmount <= gold) {
            setConfirmContext({
                type: 'invest',
                amount: stakeAmount,
                totalValue: stakeAmount
            });
        }
    };

    const executeInvest = () => {
        if (!confirmContext || confirmContext.type !== 'invest') return;
        const success = investGold(confirmContext.amount, selectedPlan.hours, selectedPlan.rate);
        if (success) {
            playSfx('task_complete');
            setShowStakingModal(false);
            setStakeAmount(0);
            setConfirmContext(null);
        }
    };

    const handleTradeConfirm = () => {
        if (!selectedStock) return;
        if (tradeAmount <= 0) return;
        const marketData = stockMarket?.[selectedStock];
        if (!marketData) return;
        
        setConfirmContext({
            type: 'trade',
            action: tradeMode,
            amount: tradeAmount,
            stockSymbol: selectedStock,
            totalValue: tradeAmount * marketData.currentPrice
        });
    };

    const executeTrade = () => {
        if (!confirmContext || confirmContext.type !== 'trade' || !confirmContext.stockSymbol) return;
        
        const success = confirmContext.action === 'buy' 
            ? buyStock(confirmContext.stockSymbol, confirmContext.amount) 
            : sellStock(confirmContext.stockSymbol, confirmContext.amount);
        
        if (success) {
            playSfx('task_complete');
            setSelectedStock(null);
            setTradeAmount(0);
            setConfirmContext(null);
        } else {
            playSfx('bubble_wrong');
        }
    };

    const handleClaimStake = (stakeId: string) => {
        const success = claimStake(stakeId);
        if (success) {
            playSfx('task_complete');
        } else {
            playSfx('bubble_wrong');
        }
    };

    // Derived Portfolio Memoized
    const portfolioList = useMemo(() => {
        return portfolio ? Object.values(portfolio).filter(p => p.amount > 0) : [];
    }, [portfolio]);
    
    // Total stock asset value Memoized
    const totalStockValue = useMemo(() => {
        return portfolioList.reduce((acc, pf) => {
            const currentPrice = stockMarket?.[pf.symbol]?.currentPrice || 0;
            return acc + (pf.amount * currentPrice);
        }, 0);
    }, [portfolioList, stockMarket]);

    return (
        <div className="absolute inset-0 bg-slate-50 z-[50] text-slate-900 font-sans flex flex-col overflow-hidden">
            {/* Top Blue Header */}
            <div className="bg-gradient-to-br from-[#1E5EEB] via-[#2D73FF] to-[#0042C6] px-5 pt-10 pb-8 text-white rounded-b-[36px] shadow-lg relative shrink-0">
                {/* Background Decor (Optimized: pure opacity without heavy blurs) */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-8 -mb-8 pointer-events-none" />
                <div className="absolute opacity-10 -right-4 top-1/3 transform rotate-12 pointer-events-none">
                     <TrendingUp size={100} />
                </div>
                
                {/* Top Nav */}
                <div className="relative z-10 flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2">
                        <button onClick={handleBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all">
                            <ArrowLeft size={18} />
                        </button>
                        <button onClick={() => setShowHintModal(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all">
                            <HelpCircle size={18} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="text-right">
                           <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">AILUV WALLET</div>
                           <div className="font-bold text-xs">{userProfile?.name || playerName}</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-white/20 border border-white/40 flex items-center justify-center shadow-md overflow-hidden">
                             {avatarUrl ? <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" /> : <User size={18} className="text-white" />}
                        </div>
                    </div>
                </div>

                {/* Balances Card */}
                <div className="relative z-10 bg-white/15 border border-white/25 rounded-2xl p-4 shadow-sm">
                    <div className="text-blue-100/90 text-[10px] uppercase tracking-widest font-bold mb-1 flex justify-between items-center">
                        <span>มูลค่าพอร์ตและเงินสด</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full font-semibold border border-amber-300/30">
                                💎 {diamonds}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-baseline gap-1 text-white">
                        <span className="text-2xl font-black">{gold.toLocaleString()}</span>
                        <span className="text-xs text-blue-200 font-bold">G</span>
                        {totalStockValue > 0 && (
                            <span className="text-xs text-emerald-300 ml-2 font-medium">
                                (+{totalStockValue.toLocaleString(undefined, {maximumFractionDigits: 0})} G หุ้น)
                            </span>
                        )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/15 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 text-blue-100">
                            <Landmark size={14} className="text-amber-300" />
                            <span>ออมเงิน (Staking)</span>
                        </div>
                        <button 
                            onClick={() => { playSfx('bubble_pop'); setShowStakingModal(true); }}
                            className="bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-full text-[11px] shadow hover:bg-amber-300 active:scale-95 transition-all"
                        >
                            ฝากดอกเบี้ย 5%
                        </button>
                    </div>
                </div>
            </div>

            {/* Sub Nav Tabs */}
            <div className="px-4 mt-3 shrink-0">
                <div className="bg-white p-1 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-1 text-xs font-bold">
                    <button 
                        onClick={() => { playSfx('bubble_pop'); setActiveTab('market'); }}
                        className={`flex-1 py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
                            activeTab === 'market' 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <BarChart2 size={14} />
                        <span>ตลาดหุ้น</span>
                    </button>
                    <button 
                        onClick={() => { playSfx('bubble_pop'); setActiveTab('news'); }}
                        className={`flex-1 py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all relative ${
                            activeTab === 'news' 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <Newspaper size={14} />
                        <span>ข่าวหุ้น</span>
                        <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1" />
                    </button>
                    <button 
                        onClick={() => { playSfx('bubble_pop'); setActiveTab('portfolio'); }}
                        className={`flex-1 py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
                            activeTab === 'portfolio' 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <Briefcase size={14} />
                        <span>พอร์ต ({portfolioList.length})</span>
                    </button>
                    <button 
                        onClick={() => { playSfx('bubble_pop'); setActiveTab('staking'); }}
                        className={`flex-1 py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
                            activeTab === 'staking' 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <Landmark size={14} />
                        <span>เงินออม</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-20">
                {/* 1. TAB: MARKET */}
                {activeTab === 'market' && (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">กระดานหุ้น AiLuv Market</h3>
                                <p className="text-[10px] text-slate-400">อัปเดตรอบราคาตามข่าววิเคราะห์เศรษฐกิจ</p>
                            </div>
                            <button 
                                onClick={handleManualRefresh} 
                                disabled={cooldownRemaining > 0}
                                className={`text-[11px] font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                                    cooldownRemaining > 0
                                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                        : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 active:scale-95 shadow-sm'
                                }`}
                            >
                                <RefreshCw size={12} className={cooldownRemaining > 0 ? '' : 'animate-spin-once'} />
                                {cooldownRemaining > 0 ? `รอ ${cooldownRemaining}s` : 'อัปเดตราคา'}
                            </button>
                        </div>

                        {/* Stock List Cards */}
                        <div className="space-y-2.5">
                            {stockMarket && Object.values(stockMarket).map((stock) => {
                                const percentChange = stock.history.length > 1 
                                    ? ((stock.currentPrice - stock.history[stock.history.length - 2]) / stock.history[stock.history.length - 2]) * 100 
                                    : 0;
                                const isUp = percentChange >= 0;
                                const activeNews = stock.activeNews;
                                
                                return (
                                    <div 
                                        key={stock.symbol} 
                                        onClick={() => { playSfx('bubble_pop'); setSelectedStock(stock.symbol); }} 
                                        className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm hover:shadow hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center font-black text-xs text-blue-700">
                                                    {stock.symbol.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900">{stock.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-medium">{stock.symbol}/GOLD</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-base font-bold text-slate-900">{stock.currentPrice.toFixed(2)} G</div>
                                                <div className={`text-[10px] font-bold px-2 py-0.5 mt-0.5 rounded-full inline-flex items-center gap-0.5 ${
                                                    isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                    {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                                                    {Math.abs(percentChange).toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>

                                        {/* Active News Hint Banner */}
                                        {activeNews && (
                                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-600">
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                                                    activeNews.impact === 'positive' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                                                }`}>
                                                    {activeNews.impact === 'positive' ? 'ข่าวบวก 📈' : 'ข่าวลบ 📉'}
                                                </span>
                                                <span className="truncate text-slate-700 font-medium">{activeNews.headline}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 2. TAB: NEWS & MARKET INSIGHTS */}
                {activeTab === 'news' && (
                    <div className="space-y-3">
                        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl p-3.5 text-white shadow-sm">
                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-100 mb-1">
                                <Newspaper size={16} />
                                <span>ศูนย์ข่าววิเคราะห์การลงทุน AiLuv Financial</span>
                            </div>
                            <p className="text-[11px] text-white/90">
                                อ่านวิเคราะห์ข่าวสารเพื่อคาดการณ์ทิศทางราคาหุ้นล่วงหน้า ข่าวสารมีผลต่อแรงซื้อขายในรอบตลาดถัดไป
                            </p>
                        </div>

                        <div className="space-y-3">
                            {stockMarket && Object.values(stockMarket).map((stock) => {
                                const news = stock.activeNews;
                                if (!news) return null;
                                const isPos = news.impact === 'positive';

                                return (
                                    <div key={stock.symbol} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-slate-200">
                                                    {stock.symbol} ({stock.name})
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                    isPos 
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                }`}>
                                                    {isPos ? 'แนวโน้มขาขึ้น 📈' : 'แนวโน้มขาลง 📉'}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-medium">รอบตลาดปัจจุบัน</span>
                                        </div>

                                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{news.headline}</h4>
                                        <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                            {news.detail}
                                        </p>

                                        <div className="flex justify-between items-center pt-1 text-[11px]">
                                            <span className="text-slate-400 font-medium">ผลกระทบคาดการณ์:</span>
                                            <span className={`font-bold ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {isPos ? '+' : ''}{news.priceBiasPercent.toFixed(1)}% แรงขับเคลื่อน
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 3. TAB: PORTFOLIO */}
                {activeTab === 'portfolio' && (
                    <div className="space-y-3">
                        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex justify-between items-center">
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">รวมมูลค่าพอร์ตหุ้น</div>
                                <div className="text-lg font-black text-slate-900">{totalStockValue.toLocaleString()} G</div>
                            </div>
                            <div className="text-right text-xs text-slate-500 font-medium">
                                ถือครอง {portfolioList.length} หุ้น
                            </div>
                        </div>

                        <div className="space-y-2">
                            {portfolioList.length > 0 ? (
                                portfolioList.map((pf) => {
                                    const marketData = stockMarket?.[pf.symbol];
                                    const currentPrice = marketData?.currentPrice || 0;
                                    const totalValue = pf.amount * currentPrice;
                                    const totalCost = pf.amount * pf.averagePrice;
                                    const profitLoss = totalValue - totalCost;
                                    const percentChange = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
                                    const isUp = profitLoss >= 0;

                                    return (
                                        <div 
                                            key={pf.symbol} 
                                            onClick={() => { playSfx('bubble_pop'); setSelectedStock(pf.symbol); }}
                                            className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex justify-between items-center cursor-pointer hover:border-blue-300 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center border border-blue-100">
                                                    {pf.symbol.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900">{pf.symbol}</div>
                                                    <div className="text-[10px] text-slate-400 font-medium">{pf.amount} หุ้น (เฉลี่ย {pf.averagePrice.toFixed(2)} G)</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-slate-900">{totalValue.toFixed(2)} G</div>
                                                <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-flex items-center gap-0.5 ${
                                                    isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                    {isUp ? '+' : ''}{profitLoss.toFixed(2)} G ({isUp ? '+' : ''}{percentChange.toFixed(2)}%)
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 text-slate-400 text-xs bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
                                    <Briefcase size={32} className="mx-auto text-slate-300" />
                                    <p className="font-semibold text-slate-500">ยังไม่มีรายการหุ้นในพอร์ต</p>
                                    <p className="text-[10px] text-slate-400">เลือกซื้อหุ้นในหน้า "ตลาดหุ้น" เพื่อเริ่มลงทุน</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 4. TAB: STAKING */}
                {activeTab === 'staking' && (
                    <div className="space-y-3">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-4 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-2 font-bold text-xs mb-1">
                                <Landmark size={16} />
                                <span>กองทุนเงินออมประจำ AiLuv Vault</span>
                            </div>
                            <p className="text-[11px] text-slate-900/90 leading-relaxed">
                                ฝากเงิน Gold ไว้นาน 24 ชั่วโมงเพื่อรับดอกเบี้ยการันตี 5% ความเสี่ยงต่ำ เหมาะสำหรับสายออมเงิน
                            </p>
                            <button 
                                onClick={() => setShowStakingModal(true)}
                                className="mt-3 bg-slate-950 text-amber-300 font-bold px-4 py-2 rounded-xl text-xs w-full shadow hover:bg-slate-900 active:scale-95 transition-all"
                            >
                                + ฝากเงินออมใหม่
                            </button>
                        </div>

                        {/* Staking List */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-700 px-1">รายการฝากประจำของฉัน</h4>
                            {activeStakes && activeStakes.filter(s => !s.claimed).length > 0 ? (
                                activeStakes.filter(s => !s.claimed).map((stake) => {
                                    const now = Date.now();
                                    const endtime = stake.startTime + (stake.durationHours * 60 * 60 * 1000);
                                    const remainingMs = Math.max(0, endtime - now);
                                    const isReady = remainingMs <= 0;
                                    const profit = Math.floor(stake.amount * stake.interestRate);
                                    const returns = stake.amount + profit;

                                    const remainingSecs = Math.ceil(remainingMs / 1000);
                                    const hrs = Math.floor(remainingSecs / 3600);
                                    const mins = Math.floor((remainingSecs % 3600) / 60);
                                    const secs = remainingSecs % 60;
                                    const timeStr = hrs > 0 
                                        ? `${hrs} ชม. ${mins} นาที` 
                                        : mins > 0 
                                            ? `${mins} นาที ${secs} วินาที` 
                                            : `${secs} วินาที`;

                                    return (
                                        <div key={stake.id} className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center border ${
                                                    isReady ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                                }`}>
                                                    <Clock size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900">{stake.amount.toLocaleString()} G</div>
                                                    <div className="text-[10px] text-slate-500 font-medium">
                                                        ผลตอบแทน: <span className="text-emerald-600 font-bold">{returns.toLocaleString()} G</span> (+{Math.round(stake.interestRate * 100)}%)
                                                    </div>
                                                    {!isReady && (
                                                        <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
                                                            ⏱️ เหลือเวลา {timeStr}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleClaimStake(stake.id)}
                                                disabled={!isReady}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                                    isReady 
                                                        ? 'bg-emerald-600 text-white shadow hover:bg-emerald-500 active:scale-95' 
                                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {isReady ? 'ถอนเงิน' : 'กำลังฝาก'}
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-slate-400 text-xs bg-white rounded-2xl border border-dashed border-slate-200 space-y-1">
                                    <p className="font-semibold text-slate-500">ไม่มีรายการฝากประจำในขณะนี้</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Stock Detail Modal */}
            {selectedStock && stockMarket && stockMarket[selectedStock] && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
                    onClick={() => setSelectedStock(null)}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4"
                    >
                        {/* Modal Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                    {stockMarket[selectedStock].symbol}
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 mt-1">{stockMarket[selectedStock].name}</h3>
                            </div>
                            <button onClick={() => setSelectedStock(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Price Overview */}
                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex justify-between items-center">
                            <div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">ราคาปัจจุบัน</div>
                                <div className="text-xl font-black text-slate-900">{stockMarket[selectedStock].currentPrice.toFixed(2)} G</div>
                            </div>
                            {portfolio?.[selectedStock] && (
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-400 font-bold uppercase">ถือครองในพอร์ต</div>
                                    <div className="text-sm font-bold text-blue-600">{portfolio[selectedStock].amount} หุ้น</div>
                                </div>
                            )}
                        </div>

                        {/* Active News Signal in Modal */}
                        {stockMarket[selectedStock].activeNews && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-2xl border border-blue-100 space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-bold">
                                    <span className="text-blue-700 flex items-center gap-1">
                                        <Newspaper size={12} /> ข่าวประจำรอบนี้
                                    </span>
                                    <span className={stockMarket[selectedStock].activeNews?.impact === 'positive' ? 'text-emerald-600' : 'text-rose-600'}>
                                        {stockMarket[selectedStock].activeNews?.impact === 'positive' ? 'ข่าวบวก 📈' : 'ข่าวลบ 📉'}
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-slate-800 leading-tight">
                                    {stockMarket[selectedStock].activeNews?.headline}
                                </p>
                                <p className="text-[11px] text-slate-600 leading-snug">
                                    {stockMarket[selectedStock].activeNews?.detail}
                                </p>
                            </div>
                        )}

                        {/* Buy/Sell Selector */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                            <button 
                                onClick={() => setTradeMode('buy')}
                                className={`py-2 rounded-xl transition-all ${tradeMode === 'buy' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}
                            >
                                ซื้อหุ้น (Buy)
                            </button>
                            <button 
                                onClick={() => setTradeMode('sell')}
                                className={`py-2 rounded-xl transition-all ${tradeMode === 'sell' ? 'bg-rose-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}
                            >
                                ขายหุ้น (Sell)
                            </button>
                        </div>

                        {/* Trade Amount Inputs */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-500 font-medium">
                                <span>จำนวนหุ้นที่ต้องการ{tradeMode === 'buy' ? 'ซื้อ' : 'ขาย'}:</span>
                                <span>
                                    {tradeMode === 'buy' 
                                        ? `สูงสุดประมาณ: ${Math.floor(gold / stockMarket[selectedStock].currentPrice)} หุ้น`
                                        : `ถือครองทั้งหมด: ${portfolio?.[selectedStock]?.amount || 0} หุ้น`
                                    }
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setTradeAmount(prev => Math.max(0, prev - 10))}
                                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center shrink-0"
                                >
                                    -10
                                </button>
                                <input 
                                    type="number" 
                                    value={tradeAmount || ''} 
                                    onChange={(e) => setTradeAmount(Math.max(0, parseInt(e.target.value) || 0))}
                                    placeholder="0"
                                    className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                                />
                                <button 
                                    onClick={() => setTradeAmount(prev => prev + 10)}
                                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center shrink-0"
                                >
                                    +10
                                </button>
                            </div>

                            {/* Quick Percentage Buttons */}
                            <div className="grid grid-cols-4 gap-1.5 pt-1">
                                {[0.25, 0.5, 0.75, 1.0].map((pct) => {
                                    const maxAmount = tradeMode === 'buy' 
                                        ? Math.floor(gold / stockMarket[selectedStock].currentPrice)
                                        : (portfolio?.[selectedStock]?.amount || 0);
                                    const calcVal = Math.floor(maxAmount * pct);

                                    return (
                                        <button 
                                            key={pct}
                                            onClick={() => setTradeAmount(calcVal)}
                                            className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                                        >
                                            {pct * 100}%
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Total Cost Display */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium">รวมมูลค่าทั้งหมด:</span>
                            <span className="font-bold text-sm text-slate-900">
                                {(tradeAmount * stockMarket[selectedStock].currentPrice).toFixed(2)} G
                            </span>
                        </div>

                        {/* Action Button */}
                        <button 
                            onClick={handleTradeConfirm}
                            disabled={
                                tradeAmount <= 0 || 
                                (tradeMode === 'buy' && (tradeAmount * stockMarket[selectedStock].currentPrice > gold)) ||
                                (tradeMode === 'sell' && (tradeAmount > (portfolio?.[selectedStock]?.amount || 0)))
                            }
                            className={`w-full py-3 rounded-2xl font-bold text-xs shadow-md transition-all ${
                                tradeMode === 'buy'
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-slate-200 disabled:text-slate-400'
                                    : 'bg-rose-600 hover:bg-rose-500 text-white disabled:bg-slate-200 disabled:text-slate-400'
                            }`}
                        >
                            {tradeMode === 'buy' ? 'ยืนยันสั่งซื้อหุ้น' : 'ยืนยันขายหุ้น'}
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmContext && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 z-[70] flex items-center justify-center p-4"
                    onClick={() => setConfirmContext(null)}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 text-center space-y-3"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                            <ShieldCheck size={24} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">ยืนยันทำรายการ</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            {confirmContext.type === 'invest' 
                                ? `คุณต้องการฝากเงินออมจำนวน ${confirmContext.amount.toLocaleString()} G ระยะเวลา 24 ชั่วโมง ใช่หรือไม่?`
                                : `คุณต้องการ${confirmContext.action === 'buy' ? 'ซื้อ' : 'ขาย'}หุ้น ${confirmContext.stockSymbol} จำนวน ${confirmContext.amount} หุ้น รวมเป็นเงิน ${confirmContext.totalValue?.toFixed(2)} G ใช่หรือไม่?`
                            }
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-bold">
                            <button 
                                onClick={() => setConfirmContext(null)}
                                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                            >
                                ยกเลิก
                            </button>
                            <button 
                                onClick={confirmContext.type === 'invest' ? executeInvest : executeTrade}
                                className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow"
                            >
                                ตกลงทำรายการ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Staking Deposit Modal */}
            {showStakingModal && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4"
                    onClick={() => setShowStakingModal(false)}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 space-y-4"
                    >
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                <Landmark size={16} className="text-amber-500" />
                                <span>ฝากเงินออมประจำ AiLuv</span>
                            </h4>
                            <button onClick={() => setShowStakingModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Plan selection */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-700">เลือกระยะเวลาฝากเงิน:</label>
                            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                                {[
                                    { hours: 1, rate: 0.02, label: '1 ชม. (+2%)' },
                                    { hours: 24, rate: 0.05, label: '24 ชม. (+5%)' },
                                    { hours: 168, rate: 0.20, label: '7 วัน (+20%)' },
                                ].map((plan) => (
                                    <button
                                        key={plan.hours}
                                        type="button"
                                        onClick={() => setSelectedPlan(plan)}
                                        className={`py-2 px-1 rounded-xl border transition-all ${
                                            selectedPlan.hours === plan.hours
                                                ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold shadow-sm'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {plan.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">จำนวนเงินที่ต้องการฝาก (Gold):</label>
                            <input 
                                type="number" 
                                value={stakeAmount || ''} 
                                onChange={(e) => setStakeAmount(Math.max(0, parseInt(e.target.value) || 0))}
                                placeholder="0 Gold"
                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-slate-900 text-sm focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        <button 
                            onClick={handleInvestConfirm}
                            disabled={stakeAmount <= 0 || stakeAmount > gold}
                            className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow disabled:bg-slate-200 disabled:text-slate-400"
                        >
                            ยืนยันฝากเงิน ({selectedPlan.label})
                        </button>
                    </div>
                </div>
            )}

            {/* Help/Hint Modal */}
            {showHintModal && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 z-[70] flex items-center justify-center p-4"
                    onClick={() => setShowHintModal(false)}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 space-y-3 text-xs"
                    >
                        <h4 className="font-bold text-slate-900 text-sm">คู่มือการลงทุน Wallet</h4>
                        <p className="text-slate-600 leading-relaxed">
                            1. 📈 **ตลาดหุ้น**: คุณสามารถซื้อขายหุ้นเพื่อทำกำไร ราคาหุ้นจะขยับตามรอบข่าวสารวิเคราะห์
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            2. 📰 **ข่าวหุ้น**: ตรวจสอบข่าวสารประจำรอบเพื่อทำนายทิศทางราคาหุ้นล่วงหน้า
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            3. 🏦 **เงินออม (Staking)**: ฝากเงินรับดอกเบี้ยการันตี 5% ปลอดภัย ไร้ความเสี่ยง
                        </p>
                        <button 
                            onClick={() => setShowHintModal(false)}
                            className="w-full py-2 rounded-xl font-bold bg-slate-900 text-white mt-2"
                        >
                            เข้าใจแล้ว
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Nav bar */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 border-t border-slate-200 px-6 flex justify-around items-center z-40 pb-2">
                <button 
                    onClick={() => { playSfx('bubble_pop'); setActiveTab('market'); }}
                    className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${activeTab === 'market' ? 'text-blue-600' : 'text-slate-400'}`}
                >
                    <BarChart2 size={18} />
                    <span>ตลาด</span>
                </button>
                <button 
                    onClick={() => { playSfx('bubble_pop'); setActiveTab('news'); }}
                    className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${activeTab === 'news' ? 'text-blue-600' : 'text-slate-400'}`}
                >
                    <Newspaper size={18} />
                    <span>ข่าวสาร</span>
                </button>
                <button 
                    onClick={() => { playSfx('bubble_pop'); setActiveTab('portfolio'); }}
                    className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${activeTab === 'portfolio' ? 'text-blue-600' : 'text-slate-400'}`}
                >
                    <Briefcase size={18} />
                    <span>พอร์ต</span>
                </button>
                <button 
                    onClick={() => { playSfx('bubble_pop'); setActiveTab('staking'); }}
                    className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${activeTab === 'staking' ? 'text-blue-600' : 'text-slate-400'}`}
                >
                    <Landmark size={18} />
                    <span>เงินออม</span>
                </button>
            </div>
        </div>
    );
};


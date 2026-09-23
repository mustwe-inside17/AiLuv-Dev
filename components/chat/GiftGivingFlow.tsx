import React, { useEffect, useRef, useState } from 'react';
import { Check, Hand, Sparkles, X } from 'lucide-react';
import { GiftIntent, canAffordGiftPurchase, isGiftDropAccepted } from '../../domain/chat/giftFlow';
import { ItemArtwork } from '../ui/ItemArtwork';
import { playSfx } from '../../utils/audioUtils';

interface GiftGivingFlowProps {
    intent: GiftIntent;
    characterName: string;
    gold: number;
    diamonds: number;
    onCancel: (resumeActions: boolean) => void;
    onConfirmed: () => void;
    onDeliver: (intent: GiftIntent) => void;
}

type GiftFlowStage = 'confirm' | 'ready' | 'delivering' | 'success';

export const GiftGivingFlow: React.FC<GiftGivingFlowProps> = ({
    intent,
    characterName,
    gold,
    diamonds,
    onCancel,
    onConfirmed,
    onDeliver
}) => {
    const [stage, setStage] = useState<GiftFlowStage>('confirm');
    const [drag, setDrag] = useState({ x: 0, y: 0 });
    const dragOrigin = useRef<{ x: number; y: number } | null>(null);
    const delivered = useRef(false);
    const canAfford = intent.source === 'inventory' || canAffordGiftPurchase(intent.currency, intent.cost, gold, diamonds);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && stage !== 'delivering' && stage !== 'success') onCancel(stage === 'ready');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onCancel, stage]);

    const completeDelivery = () => {
        if (delivered.current) return;
        delivered.current = true;
        setStage('delivering');
        setDrag({ x: 0, y: -220 });
        playSfx('gacha_reveal');
        window.setTimeout(() => {
            setStage('success');
            playSfx('task_complete');
        }, 430);
        window.setTimeout(() => onDeliver(intent), 900);
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (stage !== 'ready') return;
        event.currentTarget.setPointerCapture(event.pointerId);
        dragOrigin.current = { x: event.clientX - drag.x, y: event.clientY - drag.y };
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (!dragOrigin.current || stage !== 'ready') return;
        const nextX = Math.max(-90, Math.min(90, event.clientX - dragOrigin.current.x));
        const nextY = Math.min(20, event.clientY - dragOrigin.current.y);
        setDrag({ x: nextX, y: nextY });
    };

    const finishPointer = () => {
        if (!dragOrigin.current || stage !== 'ready') return;
        dragOrigin.current = null;
        if (isGiftDropAccepted(drag.y)) completeDelivery();
        else setDrag({ x: 0, y: 0 });
    };

    if (stage === 'confirm') {
        return (
            <div className="fixed inset-0 z-[140] grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onCancel(false); }}>
                <section role="dialog" aria-modal="true" aria-labelledby="gift-confirm-title" className="w-full max-w-[360px] rounded-[26px] border border-white/70 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.32)] dark:border-white/10 dark:bg-[#111a2e]">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-pink-500">Gift moment</p>
                            <h2 id="gift-confirm-title" className="mt-1 text-lg font-black text-slate-900 dark:text-white">ยืนยันของขวัญ</h2>
                        </div>
                        <button type="button" onClick={() => onCancel(false)} aria-label="ยกเลิกการให้ของขวัญ" className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:hover:bg-white/10 dark:hover:text-white"><X size={19} /></button>
                    </div>

                    <div className="my-5 flex items-center gap-4 rounded-2xl border border-pink-100 bg-pink-50/70 p-4 dark:border-pink-900/50 dark:bg-pink-950/20">
                        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white shadow-sm dark:bg-slate-900"><ItemArtwork itemId={intent.itemId} name={intent.itemName} className="h-14 w-14" /></div>
                        <div className="min-w-0">
                            <p className="truncate text-base font-extrabold text-slate-900 dark:text-white">{intent.itemName}</p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                {intent.source === 'express'
                                    ? <>ซื้อด่วนในราคา <strong className="text-pink-600 dark:text-pink-300">{intent.cost.toLocaleString()} {intent.currency === 'diamond' ? 'เพชร' : 'G'}</strong> เพื่อมอบให้ {characterName}</>
                                    : <>มอบของชิ้นนี้จากกระเป๋าให้ {characterName}</>}
                            </p>
                        </div>
                    </div>

                    {intent.source === 'express' && !canAfford && (
                        <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-300">ยอดคงเหลือไม่พอสำหรับการซื้อด่วน ของและเงินยังไม่ถูกหักค่ะ</p>
                    )}

                    <div className="grid grid-cols-2 gap-2.5">
                        <button type="button" onClick={() => onCancel(false)} className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">ยกเลิก</button>
                        <button type="button" disabled={!canAfford} onClick={() => { onConfirmed(); setStage('ready'); playSfx('bubble_pop'); }} className="min-h-12 rounded-2xl bg-pink-500 px-4 text-sm font-extrabold text-white shadow-lg shadow-pink-500/20 transition-all hover:bg-pink-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 dark:disabled:bg-slate-700">
                            ยืนยัน
                        </button>
                    </div>
                    <p className="mt-3 text-center text-[10px] text-slate-400">ยังไม่หักไอเทมหรือเงินจนกว่าจะลากส่งสำเร็จ</p>
                </section>
            </div>
        );
    }

    return (
        <div className="pointer-events-none absolute inset-0 z-[115] overflow-hidden" aria-live="polite">
            <div className="pointer-events-auto absolute inset-0 bg-white/80 backdrop-blur-[2px] dark:bg-slate-950/90" aria-hidden="true" />
            <div className={`absolute left-1/2 top-5 -translate-x-1/2 transition-all duration-300 ${stage === 'success' ? 'scale-110 opacity-100' : 'opacity-80'}`}>
                <div className={`relative grid h-20 w-20 place-items-center rounded-full border-2 border-dashed ${stage === 'success' ? 'border-pink-400 bg-pink-100/90 dark:bg-pink-950/80' : 'border-pink-300/70 bg-white/55 dark:border-pink-500/50 dark:bg-slate-950/55'}`}>
                    {stage === 'success' ? <Check size={30} className="text-pink-500" /> : <Hand size={25} className="text-pink-500" />}
                    {stage === 'success' && [0, 1, 2, 3, 4, 5].map(index => <Sparkles key={index} size={14} className="absolute text-amber-400 animate-ping" style={{ transform: `rotate(${index * 60}deg) translateY(-45px)`, animationDelay: `${index * 70}ms` }} />)}
                </div>
                <p className="mt-1.5 whitespace-nowrap text-center text-[11px] font-extrabold text-slate-600 drop-shadow-sm dark:text-white">{stage === 'success' ? `ส่งให้ ${characterName} แล้ว` : `ลากขึ้นไปให้ ${characterName}`}</p>
            </div>

            {stage !== 'success' && (
                <button type="button" onClick={() => onCancel(true)} className="pointer-events-auto absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white/85 text-slate-500 shadow-md backdrop-blur-md hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:border-white/10 dark:bg-slate-900/85 dark:text-slate-300" aria-label="ยกเลิกการถือของขวัญ"><X size={18} /></button>
            )}

            <button
                type="button"
                aria-label={`ลาก ${intent.itemName} ขึ้นไปให้ ${characterName}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishPointer}
                onPointerCancel={() => { dragOrigin.current = null; setDrag({ x: 0, y: 0 }); }}
                onKeyDown={event => { if ((event.key === 'Enter' || event.key === ' ') && stage === 'ready') completeDelivery(); }}
                className={`pointer-events-auto absolute bottom-[86px] left-1/2 grid h-24 w-24 -translate-x-1/2 touch-none select-none place-items-center rounded-full border border-white/80 bg-white/80 text-5xl shadow-[0_18px_55px_rgba(236,72,153,0.36)] backdrop-blur-xl focus:outline-none focus:ring-4 focus:ring-pink-300 dark:border-white/15 dark:bg-slate-950/80 ${stage === 'ready' ? 'cursor-grab animate-[gift-float_1.7s_ease-in-out_infinite] active:cursor-grabbing' : 'pointer-events-none'}`}
                style={{ transform: `translate(calc(-50% + ${drag.x}px), ${drag.y}px) scale(${stage === 'delivering' ? 0.72 : 1})`, opacity: stage === 'delivering' ? 0 : 1, transition: dragOrigin.current ? 'none' : 'transform 430ms cubic-bezier(.2,.8,.2,1), opacity 430ms ease' }}
            >
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white/80 via-pink-100/45 to-transparent dark:from-white/10 dark:via-pink-500/10" />
                <span className="relative drop-shadow-lg"><ItemArtwork itemId={intent.itemId} name={intent.itemName} className="h-20 w-20" /></span>
                {[0, 1, 2].map(index => <Sparkles key={index} size={13} className="absolute text-amber-400 animate-pulse" style={{ top: `${12 + index * 23}px`, right: `${5 + index * 10}px`, animationDelay: `${index * 180}ms` }} />)}
            </button>

            {stage === 'ready' && <p className="absolute bottom-[62px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/75 px-3 py-1 text-[10px] font-bold text-slate-600 shadow-sm backdrop-blur dark:bg-slate-950/75 dark:text-slate-200">แตะค้างแล้วลากขึ้น · กด Enter เพื่อส่ง</p>}

            <style>{`@keyframes gift-float { 0%,100% { margin-bottom: 0; } 50% { margin-bottom: 8px; } } @media (prefers-reduced-motion: reduce) { .animate-\[gift-float_1\.7s_ease-in-out_infinite\] { animation: none !important; } }`}</style>
        </div>
    );
};

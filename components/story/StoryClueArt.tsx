import React, { useState } from 'react';
import type { KeyStoryItem } from '../../domain/story/types';

interface StoryClueArtProps {
  item: KeyStoryItem | { id: string; icon: string; name: string; imageUrl?: string };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function StoryClueArt({ item, size = 'md', className = '' }: StoryClueArtProps) {
  const [imgError, setImgError] = useState(false);

  const dimensionClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-56 h-56 sm:w-64 sm:h-64',
  }[size];

  if (item.imageUrl && !imgError) {
    return (
      <div className={`relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-md ${dimensionClasses} ${className}`}>
        <img
          src={item.imageUrl}
          alt={item.name}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Visual card illustrations for story clue items
  switch (item.icon) {
    case 'radio':
      return (
        <div
          className={`relative flex items-center justify-center rounded-2xl p-2 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 border-2 border-slate-600 shadow-xl overflow-hidden ${dimensionClasses} ${className}`}
          title={item.name}
        >
          {/* Antenna */}
          <div className="absolute top-1 right-3 w-1 h-3 bg-gradient-to-t from-slate-400 to-slate-200 rounded-t" />
          {/* Radio grill & tuner */}
          <div className="w-full h-full flex flex-col justify-between p-1 bg-slate-900/80 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between px-1 bg-black/50 rounded py-0.5 border border-purple-500/30">
              <span className="text-[7px] font-mono text-purple-400 font-bold tracking-wider">88.5 FM</span>
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-purple-400" />
              </div>
            </div>
            {/* NYX Cat Sticker Emblem */}
            <div className="my-auto flex items-center justify-center">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-900 px-2 py-1 rounded-lg border border-purple-400/40 shadow-inner flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-purple-200" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 2.85 1.2 5.42 3.12 7.24L4 22l3.45-1.15C8.94 21.57 10.42 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-3 8c.83 0 1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5S8.17 10 9 10zm6 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z" />
                </svg>
                <span className="text-[9px] font-black tracking-widest text-amber-300">NYX</span>
              </div>
            </div>
            {/* Speaker mesh pattern */}
            <div className="grid grid-cols-6 gap-0.5 px-1 py-0.5 opacity-40">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-slate-300 mx-auto" />
              ))}
            </div>
          </div>
        </div>
      );

    case 'receipt':
      return (
        <div
          className={`relative flex flex-col justify-between rounded-xl p-2 bg-gradient-to-b from-amber-50 to-stone-100 dark:from-stone-200 dark:to-stone-300 text-slate-800 shadow-xl border border-stone-300 ${dimensionClasses} ${className}`}
          title={item.name}
        >
          {/* Top Zigzag tear pattern */}
          <div className="absolute -top-1 left-0 right-0 flex justify-between px-0.5 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-2 h-1 bg-white/0 border-b-2 border-stone-300 rotate-45 transform origin-bottom" />
            ))}
          </div>
          {/* Stamp Header */}
          <div className="text-center pt-0.5">
            <div className="inline-block px-1 rounded border border-rose-500/60 bg-rose-50 text-rose-600 font-extrabold text-[8px] tracking-tight transform -rotate-3">
              ☕ CAT & CUP
            </div>
          </div>
          {/* Item details */}
          <div className="space-y-0.5 text-[8px] font-mono leading-tight my-auto px-1">
            <div className="flex justify-between text-slate-700">
              <span className="truncate">Caramel Mocha</span>
              <span className="font-bold">x1</span>
            </div>
            <div className="border-b border-dashed border-slate-400/60 my-0.5" />
            <div className="flex justify-between text-[7px] text-slate-500">
              <span>ORDER #402</span>
              <span>PAID</span>
            </div>
          </div>
          {/* Faux Barcode */}
          <div className="flex justify-center items-end gap-0.5 h-2 px-1 opacity-70">
            <div className="w-0.5 h-full bg-slate-800" />
            <div className="w-1 h-3/4 bg-slate-800" />
            <div className="w-0.5 h-full bg-slate-800" />
            <div className="w-1.5 h-full bg-slate-800" />
            <div className="w-0.5 h-2/3 bg-slate-800" />
            <div className="w-1 h-full bg-slate-800" />
          </div>
        </div>
      );

    case 'maid_charm':
      return (
        <div
          className={`relative flex items-center justify-center rounded-2xl p-2 bg-gradient-to-tr from-pink-400 via-purple-300 to-rose-200 border-2 border-pink-200 shadow-xl overflow-hidden ${dimensionClasses} ${className}`}
          title={item.name}
        >
          {/* Keyring Loop */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-amber-300 bg-transparent shadow" />
          {/* Acrylic Gloss overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/10 pointer-events-none" />
          {/* Chibi Maid Silhouette */}
          <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
            <div className="w-8 h-8 rounded-full bg-white/90 border border-pink-300 shadow flex items-center justify-center relative">
              {/* Cat Ears Headband */}
              <div className="absolute -top-2 flex justify-between w-6">
                <div className="w-2.5 h-2.5 bg-pink-500 rounded-t transform -rotate-12 border border-white" />
                <div className="w-2.5 h-2.5 bg-pink-500 rounded-t transform rotate-12 border border-white" />
              </div>
              {/* Maid Cap Frill */}
              <div className="w-6 h-1.5 bg-white rounded-full border border-pink-200 absolute -top-0.5" />
              {/* Cute Winking Face */}
              <div className="flex gap-1.5 items-center">
                <span className="text-[10px] text-pink-600 font-black">^</span>
                <span className="text-[10px] text-pink-600 font-black">~</span>
              </div>
            </div>
            <span className="text-[8px] font-black text-white drop-shadow-sm mt-1 bg-pink-600/80 px-1.5 rounded-full">
              IKURA
            </span>
          </div>
        </div>
      );

    case 'photo':
      return (
        <div
          className={`relative flex flex-col items-center p-1.5 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 ${dimensionClasses} ${className}`}
          title={item.name}
        >
          {/* Tape Clip */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-amber-200/80 border border-amber-300 transform -rotate-2 rounded-sm shadow-xs" />
          {/* Photo Viewport */}
          <div className="w-full flex-1 bg-gradient-to-tr from-purple-700 via-pink-600 to-amber-400 rounded flex flex-col items-center justify-center overflow-hidden relative shadow-inner">
            {/* Bokeh or lights */}
            <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white/40 blur-xs" />
            <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-yellow-300/30 blur-xs" />
            {/* Maid Silhouette with Heart */}
            <div className="text-white flex flex-col items-center">
              <span className="text-base drop-shadow">✨</span>
              <span className="text-[8px] font-bold text-pink-100 tracking-wider">AiMaid Cafe</span>
            </div>
          </div>
          {/* Polaroid Bottom Margin with Script */}
          <div className="w-full pt-1 text-center">
            <span className="text-[8px] font-serif italic font-bold text-slate-600 block truncate">
              Ikura-chan ♡
            </span>
          </div>
        </div>
      );

    case 'vip_card':
      return (
        <div
          className={`relative flex flex-col justify-between rounded-xl p-2 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border-2 border-amber-400/80 shadow-2xl overflow-hidden ${dimensionClasses} ${className}`}
          title={item.name}
        >
          {/* Gold Shimmer diagonal */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-300/10 to-transparent pointer-events-none" />
          {/* Top bar: Gold VIP text and Chip */}
          <div className="flex items-center justify-between z-10">
            <div className="w-3.5 h-2.5 rounded bg-gradient-to-r from-amber-300 to-amber-500 border border-amber-200 shadow-xs flex items-center justify-center">
              <div className="w-2 h-1 border-t border-b border-amber-700 opacity-60" />
            </div>
            <span className="text-[8px] font-black text-amber-300 tracking-widest drop-shadow">
              ★ VIP ★
            </span>
          </div>
          {/* Center Seal */}
          <div className="text-center z-10 my-auto">
            <div className="text-[9px] font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400">
              IKURA CLUB
            </div>
          </div>
          {/* Bottom foil strip */}
          <div className="flex items-center justify-between text-[6px] font-mono text-amber-200/80 border-t border-amber-400/30 pt-0.5 z-10">
            <span>MEMBERSHIP</span>
            <span className="text-amber-300 font-bold">LIMITED</span>
          </div>
        </div>
      );

    case 'document':
      return (
        <div
          className={`relative flex flex-col justify-between rounded-xl p-2 bg-gradient-to-b from-stone-100 via-slate-50 to-stone-200 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-100 shadow-xl border border-slate-300 dark:border-slate-700 overflow-hidden ${dimensionClasses} ${className}`}
          title={item.name}
        >
          {/* Top Stamp / Header */}
          <div className="flex items-center justify-between border-b border-rose-400/40 pb-1">
            <span className="text-[7px] font-mono font-black text-rose-600 dark:text-rose-400 tracking-wider">AURELIA C&R</span>
            <span className="text-[6px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1 py-0.5 rounded">CONFIDENTIAL</span>
          </div>
          {/* Text placeholder lines */}
          <div className="space-y-1 my-auto px-0.5">
            <div className="h-1 bg-slate-400/40 rounded w-4/5" />
            <div className="h-1 bg-slate-400/30 rounded w-full" />
            <div className="h-1 bg-slate-400/30 rounded w-3/4" />
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-[6px] font-mono text-slate-500">CASE #2407</span>
              <span className="text-[6px] font-mono font-bold text-rose-500">MRS-A</span>
            </div>
          </div>
          {/* Official Red Stamp Emblem */}
          <div className="absolute bottom-1 right-1 opacity-80 pointer-events-none transform -rotate-12 border border-rose-500/80 rounded px-1 py-0.2 bg-rose-500/10 text-[6px] font-black text-rose-600">
            SEALED
          </div>
        </div>
      );

    case 'fabric':
      return (
        <div
          className={`relative flex flex-col justify-between rounded-xl p-2 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-purple-100 shadow-xl border-2 border-purple-400/50 overflow-hidden ${dimensionClasses} ${className}`}
          title={item.name}
        >
          {/* Weave texture background effect */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:4px_4px] pointer-events-none" />
          {/* Label Tag Header */}
          <div className="flex items-center justify-between z-10 border-b border-purple-500/40 pb-0.5">
            <span className="text-[7px] font-mono tracking-widest text-purple-300 font-bold">VANDAL</span>
            <span className="text-[6px] font-mono text-purple-400">REV.13</span>
          </div>
          {/* Characteristic Marisa's Triangle-inside-Circle Stitch Emblem */}
          <div className="my-auto flex flex-col items-center justify-center z-10">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-amber-300/80 flex items-center justify-center relative">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-amber-300 transform -translate-y-0.5" />
            </div>
            <span className="text-[7px] font-mono font-black tracking-widest text-amber-300 mt-1">MRS-A</span>
          </div>
          {/* Bottom Hem / Stitched Edge */}
          <div className="border-t border-dashed border-purple-400/50 pt-0.5 text-[6px] font-mono text-purple-300/70 text-center z-10">
            ADAPTIVE WEAVE
          </div>
        </div>
      );

    case 'box':
      return (
        <div
          className={`relative flex flex-col justify-between rounded-xl p-2 bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 text-amber-100 shadow-xl border-2 border-amber-600/70 overflow-hidden ${dimensionClasses} ${className}`}
          title={item.name}
        >
          {/* Wood grain highlight */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-amber-400/10 pointer-events-none" />
          {/* Brass Latch Top */}
          <div className="flex items-center justify-between border-b border-amber-600/40 pb-0.5 z-10">
            <span className="text-[6px] font-mono text-amber-400 tracking-wider">WOODEN CASKET</span>
            <div className="w-2.5 h-1.5 rounded-sm bg-gradient-to-r from-amber-400 to-yellow-600 border border-amber-300 shadow-xs" />
          </div>
          {/* Velvet cushion indentation & Gold Quote */}
          <div className="my-auto flex flex-col items-center justify-center z-10 px-1 text-center">
            {/* Indentation representing missing flash drive */}
            <div className="w-8 h-3.5 rounded bg-rose-950/90 border border-dashed border-rose-500/50 shadow-inner flex items-center justify-center mb-1">
              <span className="text-[5px] font-mono text-rose-300/80">EMPTY SLOT</span>
            </div>
            <span className="text-[6px] font-serif italic text-amber-300 font-bold leading-tight drop-shadow-xs">
              "EMOTION BELONGS TO THE WEARER"
            </span>
          </div>
          {/* Bottom velvet trim */}
          <div className="border-t border-amber-700/40 pt-0.5 text-[6px] font-mono text-amber-400/70 text-center z-10">
            MRS-A LEGACY
          </div>
        </div>
      );

    default:
      return (
        <div className={`flex items-center justify-center rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 ${dimensionClasses} ${className}`}>
          ★
        </div>
      );
  }
}

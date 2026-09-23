import React, { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles, Lightbulb, X, PackageCheck, Trophy, BookOpen, Award, Check } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { StoryClueArt } from './StoryClueArt';
import { playSfx } from '../../utils/audioUtils';

export function StoryEventModal() {
  const modalData = useUIStore(state => state.storyEventModal);
  const [artZoomed, setArtZoomed] = useState(false);
  const closeModal = () => useUIStore.getState().setStoryEventModal(null);

  useEffect(() => {
    if (!modalData) return;
    setArtZoomed(false);

    // Trigger Sound Effects when modal appears
    if (modalData.type === 'item_received') {
      playSfx('story_item_received');
    } else if (modalData.type === 'episode_completed') {
      playSfx('story_completed');
    } else if (modalData.type === 'node_completed') {
      playSfx('story_node_success');
    }

    // Auto-dismiss slide-down card after 5.5 seconds if it's node_completed
    let timer: NodeJS.Timeout | undefined;
    if (modalData.type === 'node_completed') {
      timer = setTimeout(() => {
        closeModal();
      }, 5500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [modalData]);

  useEffect(() => {
    if (!modalData) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' && event.key !== 'Enter') return;
      event.preventDefault();
      if (artZoomed) setArtZoomed(false);
      else closeModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalData, artZoomed]);

  if (!modalData) return null;

  // 1. Grand Modal when an entire story episode/thread is completed
  if (modalData.type === 'episode_completed') {
    return (
      <div
        id="story-episode-completed-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="เคลียร์บทสรุปเรื่องราวแล้ว"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={closeModal}
      >
        <div
          id="story-episode-completed-card"
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-purple-400/40 dark:border-purple-500/30 overflow-hidden p-6 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            id="story-episode-completed-close"
            onClick={closeModal}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
            aria-label="ปิด"
          >
            <X size={20} />
          </button>

          {/* Celebratory Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 border border-purple-400/40 text-purple-700 dark:text-purple-300 text-xs font-black tracking-widest uppercase shadow-sm">
            <Trophy size={14} className="text-amber-500 animate-bounce-soft" />
            <span>เคลียร์เรื่องราวสำเร็จ · EPISODE CLEARED</span>
          </div>

          {modalData.threadCoverImage && (
            <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-lg dark:border-white/10">
              <img src={modalData.threadCoverImage} alt={`ภาพปก ${modalData.threadTitle || 'เรื่องราวที่เคลียร์แล้ว'}`} className="aspect-video w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" aria-hidden="true" />
              <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/60 bg-emerald-600 px-3 py-1.5 text-xs font-black tracking-[0.18em] text-white shadow-lg">
                <Check size={15} strokeWidth={3} aria-hidden="true" />
                <span>CLEAR</span>
              </div>
            </div>
          )}

          {/* Episode Title */}
          <div className="text-center space-y-1">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {modalData.threadTitle || 'บทสรุปความลับ'}
            </h2>
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              บันทึกเรื่องราวหลักถูกอัปเดตลงสู่ประวัติศาสตร์เมืองแล้ว
            </p>
          </div>

          {/* Full Episode Summary Box */}
          {modalData.episodeSummary && (
            <div className="w-full bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/50 rounded-2xl p-4 text-left shadow-inner">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-purple-800 dark:text-purple-300">
                <BookOpen size={15} />
                <span>บทสรุปเหตุการณ์ทั้งหมดของตอนนี้:</span>
              </div>
              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {modalData.episodeSummary}
              </p>
            </div>
          )}

          {/* Completed Clue Steps Timeline */}
          {modalData.completedNodes && modalData.completedNodes.length > 0 && (
            <div className="w-full space-y-2 text-left">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Award size={13} className="text-emerald-500" />
                <span>ร่องรอยและเบาะแสที่คลี่คลาย:</span>
              </div>
              <div className="grid gap-2 max-h-44 overflow-y-auto pr-1">
                {modalData.completedNodes.map((n, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                        {n.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5 line-clamp-2">
                        {n.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm / Archive Button */}
          <button
            type="button"
            id="story-episode-completed-confirm-btn"
            onClick={closeModal}
            className="mt-2 w-full py-3.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 size={18} />
            <span>เก็บบันทึกลงในไดอารี่เรื่องราว</span>
          </button>
        </div>
      </div>
    );
  }

  // 1. Modal when a new Clue Item is received
  if (modalData.type === 'item_received' && modalData.item) {
    const item = modalData.item;
    const isInspecting = modalData.threadTitle === 'ของสำคัญในกระเป๋า';
    return (
      <div
        id="story-clue-item-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="คุณได้รับเบาะแสใหม่"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300"
        onClick={closeModal}
      >
        <div
          id="story-clue-item-modal-card"
          className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-amber-400/40 dark:border-amber-500/30 overflow-hidden text-center p-6 flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}
        >
          {/* Close corner button */}
          <button
            type="button"
            id="story-clue-item-modal-close"
            onClick={closeModal}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
            aria-label="ปิด"
          >
            <X size={20} />
          </button>

          {/* Celebratory badge */}
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-600 dark:text-amber-400 text-xs font-black tracking-wider uppercase">
            <Sparkles size={13} className="animate-spin" style={{ animationDuration: '4s' }} />
            <span>{isInspecting ? 'KEY ITEM · ดูภาพ' : 'ค้นพบเบาะแสใหม่!'}</span>
          </div>

          {/* Clue Artwork / Visual Card */}
          <button
            type="button"
            className="group my-1 rounded-3xl p-1 focus:outline-none focus:ring-2 focus:ring-pink-400"
            onClick={() => setArtZoomed(value => !value)}
            aria-label={artZoomed ? `ย่อภาพ ${item.name}` : `ขยายภาพ ${item.name}`}
            aria-pressed={artZoomed}
          >
            <span className="block transform transition-transform duration-200 group-hover:scale-[1.03]">
              <StoryClueArt item={item} size="lg" />
            </span>
            <span className="mt-2 block text-[10px] font-bold text-slate-400 dark:text-slate-500">แตะเพื่อดูภาพใหญ่</span>
          </button>

          {/* Item Name */}
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {item.name}
            </h3>
            {modalData.threadTitle && (
              <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                เรื่องราว: {modalData.threadTitle}
              </p>
            )}
          </div>

          {/* Item Description */}
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed px-1">
            {item.description}
          </p>

          {/* Hint section */}
          {item.hint && (
            <div className="w-full bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 rounded-2xl p-3 text-left">
              <span className="font-extrabold text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                <Lightbulb size={13} /> คำใบ้เบาะแสต่อไป:
              </span>
              <p className="text-xs text-amber-900/85 dark:text-amber-100/85 leading-relaxed">
                {item.hint}
              </p>
            </div>
          )}

          {/* Confirm Button */}
          <button
            type="button"
            id="story-clue-item-modal-confirm-btn"
            onClick={closeModal}
            className="mt-2 w-full py-3 bg-gradient-to-r from-amber-500 via-purple-600 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PackageCheck size={18} />
            <span>{isInspecting ? 'ปิดภาพ' : 'เก็บเข้ากระเป๋าเบาะแส (Key Item)'}</span>
          </button>
        </div>

        {artZoomed && (
          <button
            type="button"
            className="fixed inset-0 z-[10001] flex cursor-zoom-out items-center justify-center bg-slate-950/90 p-5 backdrop-blur-sm"
            onClick={event => { event.stopPropagation(); setArtZoomed(false); }}
            aria-label={`ปิดภาพขยาย ${item.name}`}
          >
            <span className="flex max-h-[88vh] max-w-[92vw] flex-col items-center gap-3">
              <StoryClueArt item={item} size="xl" className="shadow-[0_28px_80px_rgba(0,0,0,0.55)]" />
              <span className="text-xs font-bold text-white/85">แตะพื้นที่รอบภาพเพื่อกลับ</span>
            </span>
          </button>
        )}
      </div>
    );
  }

  // 2. Slide-down top card when a story node is completed (does not block dialogue)
  return (
    <div
      id="story-node-completed-toast-container"
      className="fixed top-4 md:top-6 left-0 right-0 z-[9999] flex justify-center pointer-events-none px-4"
    >
      <div
        id="story-node-completed-card"
        role="status"
        aria-live="polite"
        className="pointer-events-auto w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-emerald-400/50 dark:border-emerald-500/40 p-3.5 flex items-start gap-3 relative overflow-hidden animate-in slide-in-from-top-4 duration-300 transition-all"
      >
        {/* Success Icon */}
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 size={22} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              ผ่านเบาะแสแล้ว
            </span>
            {modalData.threadTitle && (
              <span className="text-[10px] font-medium text-slate-400 truncate">
                · {modalData.threadTitle}
              </span>
            )}
          </div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">
            {modalData.nodeTitle || 'ผ่านขั้นตอนเบาะแส'}
          </h4>
          {modalData.nodeSummary && (
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug line-clamp-2">
              {modalData.nodeSummary}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          id="story-node-completed-close"
          onClick={closeModal}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
          aria-label="ปิดการแจ้งเตือน"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

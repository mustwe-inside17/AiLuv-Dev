
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, ExternalLink, HelpCircle, Share, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const openInstallModal = () => {
  window.dispatchEvent(new CustomEvent('ailuv:open-install'));
};

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / standalone
    const standalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // 2. Check if embedded in iframe (e.g. AI Studio Preview)
    try {
      const inIframe = window.self !== window.top;
      setIsInIframe(inIframe);
    } catch {
      setIsInIframe(true);
    }

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Handle PWA install prompt on supported browsers
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Auto-show banner if not dismissed before
      const hasDismissed = sessionStorage.getItem('ailuv_pwa_banner_dismissed');
      if (!hasDismissed && !standalone) {
        setShowBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setShowBanner(false);
      setShowGuideModal(false);
      setDeferredPrompt(null);
    };

    // 5. Custom event to trigger modal from Phone or Settings
    const handleOpenInstallEvent = () => {
      setShowGuideModal(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('ailuv:open-install', handleOpenInstallEvent);

    // If iOS and not standalone, show banner once
    if (isIosDevice && !standalone) {
      const hasDismissed = sessionStorage.getItem('ailuv_pwa_banner_dismissed');
      if (!hasDismissed) {
        const timer = setTimeout(() => setShowBanner(true), 2500);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('ailuv:open-install', handleOpenInstallEvent);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isInIframe) {
      // In iframe, browsers block install prompts. Open in new tab.
      window.open(window.location.href, '_blank');
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setShowBanner(false);
          setShowGuideModal(false);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
        setShowGuideModal(true);
      }
    } else {
      // Fallback: show instructions modal
      setShowGuideModal(true);
    }
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem('ailuv_pwa_banner_dismissed', 'true');
  };

  // If already running standalone, suppress banner & modal
  if (isStandalone) return null;

  return (
    <>
      {/* --- TOP FLOATING BANNER --- */}
      {showBanner && (
        <div className="fixed top-safe left-2 right-2 md:left-auto md:right-4 md:w-96 z-[9999] mt-2 animate-in slide-in-from-top-10 duration-500">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-pink-500/40 p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 relative overflow-hidden group">
            {/* Ambient FX */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 pointer-events-none"></div>
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-pink-500/20 rounded-full blur-xl animate-pulse pointer-events-none"></div>

            <div className="flex items-center gap-3 relative z-10 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <Smartphone className="text-white" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm flex items-center gap-1.5 truncate">
                  ติดตั้ง AiLuv <Sparkles size={12} className="text-yellow-400 shrink-0" />
                </h3>
                <p className="text-slate-400 text-[10px] leading-tight mt-0.5 truncate">
                  {isInIframe 
                    ? "เปิดในแท็บใหม่เพื่อติดตั้งเป็นแอป"
                    : isIOS 
                    ? "แตะ 'แชร์' ➔ 'เพิ่มไปยังหน้าจอโฮม'" 
                    : "เพิ่มลงในหน้าจอหลักเพื่อประสบการณ์เต็มจอ"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 relative z-10 shrink-0">
              <button 
                onClick={handleInstallClick}
                className="bg-pink-500 hover:bg-pink-600 active:scale-95 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-pink-500/20 flex items-center gap-1.5"
              >
                {isInIframe ? (
                  <>
                    <ExternalLink size={14} /> เปิดแท็บใหม่
                  </>
                ) : deferredPrompt ? (
                  <>
                    <Download size={14} /> ติดตั้ง
                  </>
                ) : (
                  <>
                    <HelpCircle size={14} /> วิธีติดตั้ง
                  </>
                )}
              </button>
              <button 
                onClick={handleDismissBanner}
                aria-label="ปิดแจ้งเตือน"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DETAILED INSTALLATION GUIDE MODAL --- */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-pink-500/40 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white animate-in zoom-in-95 duration-200">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">วิธีเพิ่มเป็นแอป (Install App)</h3>
                  <p className="text-[11px] text-slate-400">เล่นแบบเต็มจอ ไม่มีแถบเบราว์เซอร์</p>
                </div>
              </div>
              <button 
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300">
              {isInIframe && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-200">
                  <p className="font-semibold mb-1 flex items-center gap-1.5 text-amber-400">
                    <ExternalLink size={14} /> กำลังเปิดในหน้าต่างพรีวิว
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                    เบราว์เซอร์จะไม่อนุญาตให้ติดตั้งแอปจากภายในกรอบพรีวิว กรุณาเปิดในหน้าต่างใหม่ก่อน
                  </p>
                  <button
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <ExternalLink size={14} /> เปิดในแท็บใหม่ตอนนี้
                  </button>
                </div>
              )}

              {deferredPrompt && !isInIframe && (
                <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-3">
                  <p className="font-semibold mb-1 text-pink-300">อุปกรณ์ของคุณพร้อมติดตั้งทันที</p>
                  <button
                    onClick={handleInstallClick}
                    className="w-full mt-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 active:scale-95 transition-all"
                  >
                    <Download size={16} /> แตะเพื่อติดตั้งแอป
                  </button>
                </div>
              )}

              {/* iOS Safari Guide */}
              {isIOS && (
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 space-y-2">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <Share size={14} className="text-blue-400" /> สำหรับ iPhone / iPad (Safari):
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                    <li>แตะปุ่ม <strong>แชร์ (Share)</strong> ที่แถบล่างของ Safari</li>
                    <li>เลื่อนลงแล้วเลือก <strong>"เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)</strong></li>
                    <li>แตะ <strong>"เพิ่ม" (Add)</strong> ที่มุมขวาบน</li>
                  </ol>
                </div>
              )}

              {/* Android / Chrome Guide */}
              {!isIOS && !deferredPrompt && (
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 space-y-2">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <PlusSquare size={14} className="text-green-400" /> สำหรับ Android หรือ Chrome:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                    <li>แตะปุ่ม <strong>จุดสามจุด (⋮)</strong> ที่มุมขวาบนของเบราว์เซอร์</li>
                    <li>เลือก <strong>"ติดตั้งแอป" (Install app)</strong> หรือ <strong>"เพิ่มลงในหน้าจอหลัก" (Add to Home screen)</strong></li>
                    <li>ยืนยันการติดตั้ง</li>
                  </ol>
                </div>
              )}
            </div>

            <div className="mt-5">
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl font-semibold text-xs transition-colors"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


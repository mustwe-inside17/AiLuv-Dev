
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isIosDevice && !isStandalone) {
        // Show iOS instructions after a slight delay
        setTimeout(() => setIsIOS(true), 3000);
    }

    // Detect Android / Desktop PWA support
    const handler = (e: Event) => {
      console.log('✅ PWA Install Prompt detected');
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a delay to not annoy user immediately
      setTimeout(() => setShowPrompt(true), 1000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleClose = () => {
      setShowPrompt(false);
      setIsIOS(false);
  };

  if (!showPrompt && !isIOS) return null;

  return (
    <div className="fixed top-safe left-2 right-2 md:left-auto md:right-4 md:w-96 z-[9999] mt-2 animate-in slide-in-from-top-10 duration-500">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-pink-500/30 p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 relative overflow-hidden group">
        
        {/* Background FX */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-pink-500/20 rounded-full blur-xl animate-pulse"></div>

        <div className="flex items-center gap-3 relative z-10 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <Smartphone className="text-white" size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm flex items-center gap-1.5 truncate">
                    Install AiLuv <Sparkles size={12} className="text-yellow-400 shrink-0" />
                </h3>
                <p className="text-slate-400 text-[10px] leading-tight mt-0.5 truncate">
                    {isIOS ? "Tap 'Share' -> 'Add to Home Screen'" : "Add to home screen for app experience"}
                </p>
            </div>
        </div>

        <div className="flex items-center gap-1.5 relative z-10 shrink-0">
            {!isIOS && (
                <button 
                    onClick={handleInstallClick}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-pink-500/20 flex items-center gap-1.5"
                >
                    <Download size={14} /> Install
                </button>
            )}
            <button 
                onClick={handleClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
                <X size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

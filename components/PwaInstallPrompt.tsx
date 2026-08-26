import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-safe left-0 right-0 z-50 p-4 animate-toast-in">
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <Download className="text-white" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-medium text-sm">Install AiLuv App</span>
            <span className="text-slate-400 text-xs">Add to home screen for a better experience</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={handleDismiss}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
          >
            <X size={18} />
          </button>
          <button 
            onClick={handleInstallClick}
            className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-pink-500/30 transition-all active:scale-95"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

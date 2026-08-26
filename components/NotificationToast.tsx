
import React, { useEffect, useState } from 'react';
import { AppNotification } from '../types';
import { X, Trophy, Sparkles, CheckCircle2, MessageCircle, Brain, Clover, Zap, Lock } from 'lucide-react';

interface NotificationToastProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onDismiss }) => {
  return (
    // [MARCUS FIX]: Changed to 'fixed' and increased z-index to 2000 to appear above InventoryModal (z-800) and other overlays
    <div className="fixed top-4 md:top-8 left-0 right-0 z-[2000] flex flex-col items-center gap-2 pointer-events-none px-4 w-full max-w-md mx-auto">
      {notifications.map((notif) => (
        <ToastItem key={notif.id} notification={notif} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ notification: AppNotification; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  // 1. Auto-dismiss Timer (Sets exiting state)
  useEffect(() => {
    // Shorter duration for Sensory memories
    const isSensory = notification.type === 'memory' && notification.rewards?.[0] === 'SENSORY';
    const duration = (notification.type === 'critical' || (notification.type === 'memory' && notification.rewards?.[0] === 'CORE')) 
        ? 5500 
        : isSensory ? 3000 : 4500;

    const timer = setTimeout(() => {
      setIsExiting(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [notification.type, notification.rewards]);

  // 2. Removal Timer (Waits for animation then kills DOM)
  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        onDismiss(notification.id);
      }, 300); // Wait for exit animation (300ms matches animate-toast-out)
      return () => clearTimeout(timer);
    }
  }, [isExiting, notification.id, onDismiss]);

  const handleClick = () => {
      if (notification.onAction) {
          notification.onAction();
          setIsExiting(true); // Dismiss immediately after click
      }
  };

  // --- DEFAULT STYLES ---
  let bgClass = 'bg-white/95 border-pink-100 text-gray-800';
  let iconColor = 'text-pink-500';
  let Icon = Sparkles;
  let pulseEffect = false;

  // --- TYPE SPECIFIC STYLES ---
  if (notification.type === 'level-up') {
    bgClass = 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-400 text-white';
    iconColor = 'text-yellow-300';
    Icon = Trophy;
  } else if (notification.type === 'success') {
    bgClass = 'bg-white/95 border-green-100 text-gray-800';
    iconColor = 'text-green-500';
    Icon = CheckCircle2;
  } else if (notification.type === 'event') {
    bgClass = 'bg-white/95 dark:bg-slate-800/95 border-violet-200 dark:border-violet-800 text-slate-800 dark:text-slate-100 shadow-lg shadow-violet-200/20 dark:shadow-none backdrop-blur-md';
    iconColor = 'text-violet-500';
    Icon = MessageCircle;
  } else if (notification.type === 'critical') {
    // GOLDEN CRITICAL STYLE
    bgClass = 'bg-gradient-to-r from-yellow-100 via-amber-100 to-yellow-100 border-yellow-400 text-amber-900 shadow-[0_0_20px_rgba(251,191,36,0.6)]';
    iconColor = 'text-amber-600';
    Icon = Clover;
    pulseEffect = true;
  } else if (notification.type === 'chat-alert') {
    // [MARCUS NEW]: Style for offline character messages
    bgClass = 'bg-white/95 dark:bg-slate-800/95 border-pink-200 dark:border-pink-900/50 text-slate-800 dark:text-slate-100 shadow-lg shadow-pink-200/20 dark:shadow-none backdrop-blur-md';
    iconColor = 'text-pink-500';
    Icon = MessageCircle;
    pulseEffect = true;
  } else if (notification.type === 'memory') {
    // [MARCUS NEW]: Dynamic Memory Styling based on Tier (Passed via rewards[0])
    const tier = notification.rewards?.[0] || 'ACTIVE';
    
    if (tier === 'CORE') {
        // Gold/Amber for CORE (Important)
        bgClass = 'bg-slate-900/95 border-amber-500/50 text-amber-50 shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-xl';
        iconColor = 'text-amber-400';
        Icon = Lock; // Represents "Locked In" / Permanent
        pulseEffect = true;
    } else if (tier === 'SENSORY') {
        // Gray/Slate for SENSORY (Fleeting)
        bgClass = 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 backdrop-blur-sm';
        iconColor = 'text-slate-400';
        Icon = Zap; // Flash / Quick
    } else {
        // Cyan/Blue for ACTIVE (Standard)
        bgClass = 'bg-white/95 dark:bg-slate-900/95 border-cyan-200 dark:border-cyan-800 text-slate-700 dark:text-cyan-50 shadow-sm';
        iconColor = 'text-cyan-500';
        Icon = Brain;
    }
  }

  const isClickable = !!notification.onAction;

  return (
    <div 
      onClick={isClickable ? handleClick : undefined}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border w-full max-w-sm relative overflow-hidden transition-transform active:scale-95
        ${bgClass}
        ${isExiting ? 'animate-toast-out pointer-events-none' : 'animate-toast-in pointer-events-auto'}
        ${isClickable ? 'cursor-pointer hover:brightness-105' : ''}
      `}
    >
      {/* Red Notification Dot for new alerts */}
      <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 z-30 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>

      {/* Decorative pulse for memory or critical */}
      {(pulseEffect || notification.type === 'memory') && (
          <div className={`absolute -left-10 top-0 bottom-0 w-20 blur-xl animate-pulse ${notification.type === 'critical' ? 'bg-white/30' : 'bg-current opacity-10'}`}></div>
      )}

      {/* [MARCUS FIX] Tap Hint Overlay for Clickable Toasts */}
      {isClickable && (
          <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors z-20"></div>
      )}

      <div className={`p-1.5 rounded-full shrink-0 relative z-10 ${['level-up', 'memory'].includes(notification.type) ? 'bg-white/10' : notification.type === 'event' ? 'bg-violet-100 dark:bg-violet-900/30' : 'bg-gray-50/50'}`}>
        {notification.avatar ? (
             <img src={notification.avatar} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" alt="Character" />
        ) : (
             <div className="p-0.5">
                {notification.icon || <Icon size={20} className={`${iconColor} ${pulseEffect ? 'animate-pulse' : ''}`} fill={notification.type === 'level-up' ? 'currentColor' : 'none'} />}
             </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-2">
            <h4 className={`font-extrabold text-[10px] uppercase tracking-widest opacity-90 truncate ${notification.type === 'memory' ? 'text-current' : notification.type === 'event' ? 'text-violet-600 dark:text-violet-300' : ''}`}>
                {notification.title}
            </h4>
            {/* Show Memory Tier Badge */}
            {notification.type === 'memory' && notification.rewards?.[0] && (
                <span className={`text-[8px] font-black px-1.5 rounded border ${
                    notification.rewards[0] === 'CORE' ? 'border-amber-500/50 text-amber-500 bg-amber-500/10' : 
                    notification.rewards[0] === 'SENSORY' ? 'border-slate-400/50 text-slate-400 bg-slate-400/10' : 
                    'border-cyan-500/50 text-cyan-500 bg-cyan-500/10'
                }`}>
                    {notification.rewards[0]}
                </span>
            )}
        </div>
        
        <p className={`text-xs font-medium leading-tight line-clamp-2 mt-0.5 ${['level-up'].includes(notification.type) ? 'text-white/90' : notification.type === 'memory' ? 'opacity-80 font-light' : notification.type === 'event' ? 'text-slate-600 dark:text-slate-300' : 'text-gray-600'}`}>
          {notification.message}
        </p>
        
        {/* Render Rewards (Exclude first item if it's a Memory Tier tag) */}
        {notification.rewards && notification.rewards.length > 0 && notification.type !== 'memory' && (
          <div className="flex gap-2 mt-1.5">
            {notification.rewards.map((reward, i) => (
              <span key={i} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${['level-up'].includes(notification.type) ? 'bg-white/20 text-white' : notification.type === 'event' ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300' : 'bg-white/50 text-gray-700 border border-black/5'}`}>
                {reward}
              </span>
            ))}
          </div>
        )}
      </div>

      <button onClick={(e) => { e.stopPropagation(); setIsExiting(true); }} className="opacity-50 hover:opacity-100 transition-opacity p-1 relative z-10 pointer-events-auto">
        <X size={14} />
      </button>
    </div>
  );
};

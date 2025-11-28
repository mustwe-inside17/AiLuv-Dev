import React, { useEffect, useState } from 'react';
import { AppNotification } from '../types';
import { X, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';

interface NotificationToastProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="absolute top-20 left-0 right-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4">
      {notifications.map((notif) => (
        <ToastItem key={notif.id} notification={notif} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ notification: AppNotification; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(notification.id), 300); // Wait for exit animation
    }, 3500);

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  let bgClass = 'bg-white/95 border-pink-100 text-gray-800';
  let iconColor = 'text-pink-500';
  let Icon = Sparkles;

  if (notification.type === 'level-up') {
    bgClass = 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-400 text-white';
    iconColor = 'text-yellow-300';
    Icon = Trophy;
  } else if (notification.type === 'success') {
    bgClass = 'bg-white/95 border-green-100 text-gray-800';
    iconColor = 'text-green-500';
    Icon = CheckCircle2;
  }

  return (
    <div 
      className={`
        pointer-events-auto flex items-center gap-4 px-5 py-4 rounded-2xl shadow-xl border-2 backdrop-blur-md min-w-[300px] max-w-sm
        ${bgClass}
        ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}
      `}
    >
      <div className={`p-2 rounded-full ${notification.type === 'level-up' ? 'bg-white/20' : 'bg-gray-50'}`}>
        {notification.icon || <Icon size={24} className={iconColor} fill={notification.type === 'level-up' ? 'currentColor' : 'none'} />}
      </div>
      
      <div className="flex-1">
        <h4 className="font-extrabold text-sm uppercase tracking-wide opacity-90">{notification.title}</h4>
        <p className={`text-sm font-medium ${notification.type === 'level-up' ? 'text-indigo-100' : 'text-gray-500'}`}>
          {notification.message}
        </p>
        
        {notification.rewards && notification.rewards.length > 0 && (
          <div className="flex gap-2 mt-2">
            {notification.rewards.map((reward, i) => (
              <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${notification.type === 'level-up' ? 'bg-white/20 text-white' : 'bg-yellow-50 text-yellow-600 border border-yellow-100'}`}>
                {reward}
              </span>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => setIsExiting(true)} className="opacity-50 hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
};
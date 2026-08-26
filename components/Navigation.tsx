
import React from 'react';
import { Map, MapPin, User, ListChecks, Heart } from 'lucide-react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  hasStatPoints?: boolean;    // New prop for ME tab
  hasClaimableQuests?: boolean; // New prop for Goals tab
  hasActiveEvent?: boolean; // NEW PROP for Active Event
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, hasStatPoints = false, hasClaimableQuests = false, hasActiveEvent = false }) => {
  return (
    <nav aria-label="เมนูหลัก" className="game-nav w-full md:w-24 md:h-full z-40 relative flex-none border-t md:border-t-0 md:border-l pb-safe md:pb-0 h-[76px] md:h-screen transition-colors duration-300">
      <div className="flex md:flex-col justify-between md:justify-center items-center h-full px-2 md:px-0 md:gap-8 md:py-8">
        
        {/* Group 1 (Map & Me) */}
        <div className="flex md:flex-col gap-1 md:gap-6 w-[40%] md:w-full justify-around md:justify-start">
          <NavButton 
            id="map" 
            label="Map" 
            icon={<Map size={24} />} 
            currentView={currentView} 
            onClick={onViewChange} 
          />
          <NavButton 
            id="player" 
            label="Me" 
            icon={<User size={24} />} 
            currentView={currentView} 
            onClick={onViewChange}
            showBadge={hasStatPoints || hasActiveEvent} 
          />
        </div>

        {/* Center - Location (Here) - Floating Action Button Style on Desktop */}
        <div className="relative -top-5 md:top-0 md:my-4">
          <button
            type="button"
            aria-label="กลับไปยังสถานที่ปัจจุบัน"
            aria-current={currentView === 'location' ? 'page' : undefined}
            onClick={() => onViewChange('location')}
            className={`
              game-icon-button w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 transition-all duration-200 relative group
              ${currentView === 'location' 
                ? 'bg-rose-600 dark:bg-rose-500 text-white border-rose-700 dark:border-rose-300 shadow-md'
                : 'game-panel game-muted hover:text-rose-600 dark:hover:text-rose-300'}
            `}
          >
            <MapPin size={26} className="md:w-8 md:h-8" fill="currentColor" />
          </button>
          <div className={`text-center mt-0.5 md:mt-2 text-[11px] font-bold uppercase tracking-wider ${currentView === 'location' ? 'game-primary' : 'game-muted'}`}>Here</div>
        </div>

        {/* Group 2 (Love & Goals) */}
        <div className="flex md:flex-col gap-1 md:gap-6 w-[40%] md:w-full justify-around md:justify-start">
          <NavButton 
            id="relationships" 
            label="Love" 
            icon={<Heart size={24} />} 
            currentView={currentView} 
            onClick={onViewChange} 
          />
          <NavButton 
            id="quests" 
            label="Goals" 
            icon={<ListChecks size={24} />} 
            currentView={currentView} 
            onClick={onViewChange}
            showBadge={hasClaimableQuests} 
          />
        </div>

      </div>
    </nav>
  );
};

const NavButton: React.FC<{ id: AppView, label: string, icon: React.ReactNode, currentView: AppView, onClick: (v: AppView) => void, showBadge?: boolean }> = ({ id, label, icon, currentView, onClick, showBadge }) => {
  const isActive = currentView === id;
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      onClick={() => onClick(id)}
      className={`
        min-h-[48px] flex flex-col items-center justify-center w-full gap-0.5 md:gap-1.5
        transition-colors duration-200 relative group
        ${isActive ? 'game-primary' : 'game-muted hover:text-rose-600 dark:hover:text-rose-300'}
      `}
    >
      <div className={`
        p-1.5 md:p-3 rounded-xl transition-colors duration-200 relative
        ${isActive ? 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800' : 'bg-transparent group-hover:bg-black/5 dark:group-hover:bg-white/5'}
      `}>
        {icon}
        {/* Generic Red Dot Badge */}
        {showBadge && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" aria-label="มีรายการใหม่"></span>
        )}
      </div>
      <span className="text-[11px] font-bold tracking-wide uppercase">{label}</span>
    </button>
  );
};

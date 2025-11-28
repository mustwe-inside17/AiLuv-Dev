
import React from 'react';
import { Map, MapPin, User, ListChecks, Heart } from 'lucide-react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="bg-white border-t border-pink-100 pb-safe shadow-[0_-5px_10px_rgba(0,0,0,0.02)] z-30 relative">
      <div className="flex justify-between items-center h-20 px-4">
        
        {/* Left Group */}
        <div className="flex gap-2 w-1/3 justify-around">
          <NavButton 
            id="map" 
            label="Map" 
            icon={<Map size={24} />} 
            currentView={currentView} 
            onClick={onViewChange} 
          />
          <NavButton 
            id="location" 
            label="Here" 
            icon={<MapPin size={24} />} 
            currentView={currentView} 
            onClick={onViewChange} 
          />
        </div>

        {/* Center - Player (Me) */}
        <div className="relative -top-6">
           <button
            onClick={() => onViewChange('player')}
            className={`
              w-16 h-16 rounded-full flex items-center justify-center shadow-xl border-4 border-white transition-all duration-300
              ${currentView === 'player' 
                ? 'bg-gradient-to-tr from-pink-500 to-rose-400 text-white scale-110 shadow-pink-200' 
                : 'bg-gray-800 text-white hover:bg-gray-700'}
            `}
          >
            <User size={30} />
          </button>
          <div className="text-center mt-1 text-[10px] font-bold text-gray-400">ME</div>
        </div>

        {/* Right Group */}
        <div className="flex gap-2 w-1/3 justify-around">
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
          />
        </div>

      </div>
    </div>
  );
};

const NavButton: React.FC<{ id: AppView, label: string, icon: React.ReactNode, currentView: AppView, onClick: (v: AppView) => void }> = ({ id, label, icon, currentView, onClick }) => {
  const isActive = currentView === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`
        flex flex-col items-center justify-center w-full gap-1
        transition-all duration-300
        ${isActive ? 'text-pink-500 scale-105' : 'text-gray-400 hover:text-pink-300'}
      `}
    >
      <div className={`
        p-2 rounded-2xl transition-all duration-300
        ${isActive ? 'bg-pink-50 shadow-sm' : 'bg-transparent'}
      `}>
        {icon}
      </div>
      <span className="text-[10px] font-bold tracking-wide">{label}</span>
    </button>
  );
};

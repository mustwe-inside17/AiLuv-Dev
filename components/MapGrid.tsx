
import React from 'react';
import { LocationId } from '../types';
import { LOCATIONS, TRAVEL_COST } from '../constants';
import { MapPin, Lock, Zap } from 'lucide-react';

interface MapGridProps {
  currentLocation: LocationId;
  onTravel: (id: LocationId) => void;
  energy: number;
  disabled?: boolean;
}

export const MapGrid: React.FC<MapGridProps> = ({ currentLocation, onTravel, energy, disabled }) => {
  const handleLocationClick = (locId: LocationId) => {
    if (disabled) return;
    if (locId === currentLocation) {
      onTravel(locId); // Enter without cost if already there (re-enter view)
    } else {
      // Logic handled in App.tsx (confirmation)
      onTravel(locId);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
          <MapPin className="text-pink-500" /> City Map
        </h2>
        <p className="text-gray-500 text-sm">Select a destination to travel.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 auto-rows-fr">
        {Object.values(LOCATIONS).map((loc) => {
          const isCurrent = loc.id === currentLocation;
          return (
            <button
              key={loc.id}
              onClick={() => handleLocationClick(loc.id)}
              disabled={disabled}
              className={`
                relative p-4 rounded-3xl text-left transition-all duration-300 group
                flex flex-col justify-between min-h-[140px] border-2
                bg-gradient-to-br ${loc.bgGradient}
                ${isCurrent ? 'border-pink-500 shadow-xl shadow-pink-100 ring-2 ring-pink-200 ring-offset-2' : 'border-white hover:border-pink-200 hover:shadow-lg shadow-sm'}
                ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
              `}
            >
              <div>
                <div className="text-3xl mb-2 filter drop-shadow-sm group-hover:scale-110 transition-transform origin-left">
                  {loc.icon}
                </div>
                <h3 className="font-bold text-gray-800 leading-tight">{loc.name}</h3>
                <p className="text-[10px] text-gray-500 mt-1 font-medium">{loc.description}</p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                {isCurrent ? (
                  <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                    You are here
                  </span>
                ) : (
                  <span className={`
                    flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full
                    ${energy >= TRAVEL_COST ? 'bg-white text-orange-500 border border-orange-100' : 'bg-gray-100 text-gray-400'}
                  `}>
                    <Zap size={10} fill="currentColor" /> -{TRAVEL_COST} Energy
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

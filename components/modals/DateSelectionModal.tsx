
import React, { useState, useEffect } from 'react';
import { DATE_LOCATIONS_DATA } from '../../constants/assets';
import { SceneType } from '../../types';
import { Sparkles, MapPin, Car, Wine, Home, Star, X } from 'lucide-react';

interface DateSelectionModalProps {
    onClose: () => void;
    onSelect: (scene: SceneType | 'freestyle') => void;
}

export const DateSelectionModal: React.FC<DateSelectionModalProps> = ({ onClose, onSelect }) => {
    const [renderState, setRenderState] = useState<'open' | 'closing'>('open');

    const handleClose = () => {
        setRenderState('closing');
        setTimeout(onClose, 300);
    };

    const handleSelect = (scene: SceneType | 'freestyle') => {
        setRenderState('closing');
        setTimeout(() => onSelect(scene), 300);
    };

    const DateOption = ({ 
        type, 
        label, 
        subLabel, 
        icon, 
        bgImage, 
        isPremium = false 
    }: { 
        type: SceneType | 'freestyle', 
        label: string, 
        subLabel: string, 
        icon: React.ReactNode, 
        bgImage?: string,
        isPremium?: boolean
    }) => (
        <button 
            onClick={() => handleSelect(type)}
            className="relative w-full h-24 rounded-2xl overflow-hidden shadow-lg group transition-all transform hover:scale-[1.02] active:scale-95 border-2 border-transparent hover:border-pink-300"
        >
            {/* Background */}
            <div className="absolute inset-0 bg-slate-900">
                {bgImage ? (
                    <img src={bgImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt={label} />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-pink-500 to-purple-600 opacity-80"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-full ${isPremium ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white backdrop-blur-md'}`}>
                        {icon}
                    </div>
                    <div className="text-left">
                        <div className="text-white font-black text-lg leading-none shadow-black drop-shadow-md">{label}</div>
                        <div className="text-pink-200 text-xs font-bold uppercase tracking-wider mt-1">{subLabel}</div>
                    </div>
                </div>
                {isPremium && <Star className="text-yellow-400 fill-yellow-400 animate-pulse" size={20} />}
            </div>
        </button>
    );

    return (
        <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${renderState === 'open' ? 'bg-slate-900/80 backdrop-blur-sm opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`}>
            <div 
                className={`
                    bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden
                    transform transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)
                    ${renderState === 'open' ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}
                `}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <Sparkles className="text-pink-500 fill-pink-500" /> Date Night
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest pl-1">Where to go?</p>
                    </div>
                    <button onClick={handleClose} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Options List */}
                <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1 pb-2">
                    <DateOption 
                        type="rooftop_dining" 
                        label="Rooftop Dining" 
                        subLabel="Elegant & Classy" 
                        icon={<Wine size={20} />} 
                        bgImage={DATE_LOCATIONS_DATA.rooftop_dining.img}
                        isPremium
                    />
                    <DateOption 
                        type="secret_bar" 
                        label="Secret Bar" 
                        subLabel="Intimate & Cozy" 
                        icon={<Sparkles size={20} />} 
                        bgImage={DATE_LOCATIONS_DATA.secret_bar.img}
                    />
                    <DateOption 
                        type="car" 
                        label="Private Drive" 
                        subLabel="Just the two of us" 
                        icon={<Car size={20} />} 
                        bgImage={DATE_LOCATIONS_DATA.car.img}
                    />
                    <DateOption 
                        type="character_home" 
                        label="Private Room" 
                        subLabel="Deep Connection" 
                        icon={<Home size={20} />} 
                        bgImage={DATE_LOCATIONS_DATA.character_home.img}
                    />
                    <DateOption 
                        type="freestyle" 
                        label="Freestyle" 
                        subLabel="Follow the Vibe" 
                        icon={<MapPin size={20} />} 
                    />
                </div>
            </div>
        </div>
    );
};


import React from 'react';
import { Clapperboard, X, Loader2, Sparkles, Lock, Gem } from 'lucide-react';
import { CharacterId } from '../../types';
import { CHARACTER_DATA } from '../../constants';

interface ScenarioMenuProps {
    characterId: CharacterId;
    isOpen: boolean;
    onClose: () => void;
    isGenerating: boolean;
    generatedScenarios: string[];
    onGenerate: () => void;
    onSelect: (text: string) => void;
    canAfford: boolean;
    cost: number;
}

export const ScenarioMenu: React.FC<ScenarioMenuProps> = ({
    characterId,
    isOpen,
    onClose,
    isGenerating,
    generatedScenarios,
    onGenerate,
    onSelect,
    canAfford,
    cost
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute bottom-full mb-2 right-2 bg-slate-900 text-white p-4 rounded-3xl shadow-2xl border-2 border-cyan-500/50 w-72 animate-in zoom-in-95 origin-bottom-right z-50">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                    <Clapperboard size={18} className="text-cyan-400" />
                    <span className="font-bold text-sm">ผู้กำกับบทละคร</span>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={16}/></button>
            </div>
            
            {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-6 text-cyan-400 gap-2">
                    <Loader2 className="animate-spin" size={32} />
                    <span className="text-xs font-bold animate-pulse">กำลังคิดบท...</span>
                </div>
            ) : generatedScenarios.length > 0 ? (
                <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 mb-1">เลือกสถานการณ์เพื่อเริ่มทันที (Auto-send):</p>
                    {generatedScenarios.map((text, i) => (
                        <button 
                            key={i}
                            onClick={() => onSelect(text)}
                            className="w-full text-left text-xs bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors border border-white/5 active:scale-95 group"
                        >
                            <span className="group-hover:text-cyan-300 transition-colors">{text}</span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-2">
                    <p className="text-xs text-gray-300 mb-4">
                        สร้าง 3 สถานการณ์จำลองสุดพิเศษสำหรับ {CHARACTER_DATA[characterId].name}
                    </p>
                    <button 
                        onClick={onGenerate}
                        disabled={!canAfford}
                        className={`
                            w-full py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95
                            ${canAfford 
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110' 
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                        `}
                    >
                        {canAfford ? <Sparkles size={16} /> : <Lock size={16} />}
                        สร้างสถานการณ์ 
                        <span className="bg-black/20 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 ml-1">
                            {cost} <Gem size={10} />
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
};


import React, { useState } from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

export const RoleplayTip: React.FC = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative pointer-events-auto z-50 animate-in fade-in zoom-in duration-300 ml-1">
            <button
                onClick={() => setOpen(!open)}
                className={`
                    w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-300
                    ${open 
                        ? 'bg-yellow-400 text-white scale-110 shadow-yellow-200 ring-2 ring-yellow-200' 
                        : 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/50 dark:border-white/10 text-yellow-500 dark:text-yellow-400 hover:scale-110 hover:bg-white/60'}
                `}
                aria-label="Roleplay Tips"
            >
                <Lightbulb size={16} fill={open ? "currentColor" : "none"} strokeWidth={2.5} />
            </button>
            
            {open && (
                <div className="absolute top-10 left-0 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-pink-100 dark:border-slate-700 animate-in slide-in-from-top-2 fade-in duration-300 origin-top-left">
                    <div className="flex gap-3 items-start">
                        <div className="mt-0.5 bg-pink-100 dark:bg-pink-900/30 p-1.5 rounded-lg text-pink-500 shrink-0 animate-bounce-soft">
                            <Sparkles size={14} fill="currentColor" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1.5">Roleplay Tip</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                                เทคนิค : คุณสามารถใช้จินตนาการในการพูดคุย และสร้างเรื่องราวทุกอย่างได้เต็มที่ตามแบบของคุณเอง
                            </p>
                            <div className="mt-2.5 text-[10px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 p-2.5 rounded-xl border border-gray-100 dark:border-slate-700 leading-relaxed">
                                💡 โอ๊ะ... อีกอย่างถ้าคุณอยากแสดงการกระทำใดๆ ให้พิมพ์วงเล็บ เช่น <span className="text-purple-600 dark:text-purple-400 font-bold bg-purple-100 dark:bg-purple-900/30 px-1 py-0.5 rounded mx-0.5">(นั่งลงที่โซฟา)</span> เป็นต้น
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

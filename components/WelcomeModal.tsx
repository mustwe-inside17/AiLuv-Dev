
import React, { useEffect, useState } from 'react';
import { Zap, Briefcase, Heart, ArrowRight, Star, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WelcomeModalProps {
  playerName: string;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ playerName, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-[999] flex items-center justify-center p-4 transition-all duration-700 ${isVisible ? 'bg-slate-950/90 backdrop-blur-xl' : 'bg-transparent pointer-events-none'}`}>
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: 10 }}
          animate={isVisible ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : {}}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.8rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden border-[4px] border-white/10 relative flex flex-col max-h-[90vh]"
        >
          
          {/* Header Graphic with Image Support */}
          <div className="h-44 shrink-0 relative overflow-hidden group">
            {/* Background Image / Gradient Fallback */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
              style={{ 
                backgroundImage: `url('/images/welcome_header.png')`
              }}
            />
            
            {/* Glossy Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Animated Read Me Tag */}
            <motion.div 
              animate={{ 
                y: [0, -6, 0],
                rotate: [5, 10, 5],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute top-5 right-5 z-20"
            >
              <div className="bg-white dark:bg-yellow-400 text-purple-600 dark:text-purple-950 px-3 py-1.5 rounded-xl shadow-lg border-2 border-white/50 backdrop-blur-md transform-gpu">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider">Read Me!</span>
                </div>
                {/* Tag String Decor */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-white/40 border-r border-black/10" />
              </div>
            </motion.div>

            <div className="absolute bottom-8 left-8 text-slate-800 dark:text-white">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 mb-2"
              >
                <span className="text-[10px] font-black uppercase tracking-widest bg-pink-500 text-white px-2.5 py-1 rounded-lg border border-pink-400/50 backdrop-blur-md flex items-center gap-1 shadow-lg shadow-pink-500/20">
                  <Star size={10} fill="currentColor" /> New Citizen
                </span>
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-black tracking-tighter drop-shadow-md leading-[0.95]"
              >
                Welcome to <br/>
                <span className="text-pink-600 dark:text-pink-400">AiLuv City!</span>
              </motion.h2>
            </div>
          </div>

          {/* Content (Scrollable) */}
          <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-slate-900">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-600 dark:text-slate-400 font-medium text-[13px] leading-relaxed mb-8"
            >
              ขอต้อนรับคุณ <span className="text-pink-600 dark:text-pink-400 font-bold text-[14px]">{playerName}</span> สู่ก้าวแรกในมหานครแห่งนี้<br/>
              เริ่มต้นเส้นทางชีวิตในแบบที่คุณเลือกเอง ไม่ว่าจะเป็นความรัก หรือความสำเร็จในหน้าที่การงาน 🏙️✨
            </motion.p>

            <div className="space-y-4 mb-8">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">🎮 Survival Guides</h3>
              
              {[
                { 
                  icon: Zap, 
                  title: "บริหารวิถีชีวิต", 
                  desc: "จัดการพลังงานในแต่ละวันด้วยการพักผ่อน หรือเลือกลิ้มรสอาหารมื้อพิเศษ", 
                  color: "orange",
                  delay: 0.6
                },
                { 
                  icon: Briefcase, 
                  title: "ความก้าวหน้าทางการเงิน", 
                  desc: "เลือกเส้นทางอาชีพและทำงานเพื่อสร้างรายได้ สำหรับการช้อปปิ้งและไลฟ์สไตล์", 
                  color: "blue",
                  delay: 0.7
                },
                { 
                  icon: Heart, 
                  title: "ความสัมพันธ์ที่มีความหมาย", 
                  desc: "สร้างความทรงจำและพัฒนาความสัมพันธ์กับผู้คนรอบตัว เพื่อเรื่องราวที่ลึกซึ้งยิ่งขึ้น", 
                  color: "pink",
                  delay: 0.8
                }
              ].map((tip, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: tip.delay }}
                  className={`flex gap-4 items-center p-4 bg-${tip.color}-50/30 dark:bg-slate-800/40 rounded-[1.5rem] border border-${tip.color}-100/20 dark:border-slate-700/50 hover:bg-${tip.color}-50/50 transition-colors shadow-sm cursor-default`}
                >
                  <div className={`bg-${tip.color}-100 dark:bg-${tip.color}-900/30 text-${tip.color}-500 p-3 rounded-2xl shrink-0 shadow-inner ring-4 ring-${tip.color}-100/20`}>
                    <tip.icon size={22} fill={tip.color === 'pink' || tip.color === 'orange' ? "currentColor" : "none"} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[13px] text-gray-800 dark:text-gray-100">{tip.title}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{tip.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Version Info Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center"
            >
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-yellow-500 animate-pulse" />
                <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                  Alpha Phase 0.5 - Beta Access
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 font-semibold leading-tight">
                นี่คือเวอร์ชั่นทดสอบ ข้อมูลอาจมีการรีเซ็ตเมื่อจบทดสอบ
              </p>
            </motion.div>
          </div>

          {/* Footer Button */}
          <div className="p-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800/50 shrink-0 z-20">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white font-black text-xl py-5 rounded-[1.8rem] shadow-[0_12px_24px_-8px_rgba(230,50,150,0.5)] flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              เริ่มใช้ชีวิตกันเลย! 
              <ArrowRight size={24} className="group-hover:translate-x-1.5 transition-transform" />
            </motion.button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

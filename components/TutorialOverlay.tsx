
import React, { useEffect, useState } from 'react';
import { TutorialStep, CharacterId } from '../types';
import { CHARACTER_DATA } from '../constants';
import { getCharacterImageUrl } from '../services/firebase';
import { MessageCircle, Zap, ArrowUp, ArrowDown, Trophy, CheckCircle2, SkipForward, Lock, BookOpen, MapPin, ShoppingBag, Brain, Sparkles, Clover, User } from 'lucide-react';

interface TutorialOverlayProps {
  step: TutorialStep;
  onNext: () => void;
  onComplete: () => void;
  playerName: string;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step, onNext, onComplete, playerName }) => {
  const [miguelImg, setMiguelImg] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      const url = await getCharacterImageUrl(CHARACTER_DATA.miguel.baseImg);
      if (url) setMiguelImg(url);
    };
    load();
    // Delay visualization for smooth entry
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  if (step === 'idle' || step === 'completed') return null;

  // Reusable Skip Button
  const SkipButton = ({ onClick }: { onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="absolute top-12 left-4 z-[250] pointer-events-auto bg-black/20 hover:bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/20 transition-all flex items-center gap-1 shadow-sm animate-in fade-in"
    >
        Skip <SkipForward size={10} className="opacity-80" />
    </button>
  );

  // --- STEP 1: INTRO (Full Screen Miguel) ---
  if (step === 'intro') {
    return (
      <div key="intro" className={`absolute inset-0 z-[200] flex items-center justify-center p-6 transition-all duration-500 ${isVisible ? 'opacity-100 bg-slate-900/90 backdrop-blur-sm' : 'opacity-0 pointer-events-none'}`}>
        
        <div className="relative w-full max-w-sm flex flex-col items-center">
          
          {/* Miguel Image with Pop In */}
          <div className="w-40 h-40 rounded-full border-4 border-white/20 bg-pink-100 shadow-[0_0_40px_rgba(236,72,153,0.5)] overflow-hidden mb-6 relative group animate-in zoom-in-50 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
             {miguelImg ? <img src={miguelImg} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-pink-200"></div>}
             <div className="absolute inset-0 ring-4 ring-pink-400/50 rounded-full animate-pulse"></div>
          </div>

          {/* Dialogue Box with Spring Up */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-2xl w-full text-center relative animate-in slide-in-from-bottom-10 fade-in duration-500 delay-100 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-white/20">
             {/* Decor Badge */}
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg animate-bounce-soft">
                New Neighbor Alert!
             </div>

             <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-3 mt-3 tracking-tight">
                "ยินดีต้อนรับนะคะ!"
             </h2>
             <p className="text-gray-600 dark:text-gray-300 font-medium text-sm leading-relaxed mb-6">
                "คุณคงเป็นคนที่พึ่งย้ายเข้ามาใหม่ใช่ไหมคะ? <br/>
                มิเกลอยู่ห้องข้างๆ นี้เอง... <br/>
                ถ้าไม่รังเกียจ เรามาคุยกันหน่อยมั้ยคะ?"
             </p>

             <button 
                onClick={onNext}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-pink-200 dark:shadow-none transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2 group"
             >
                <MessageCircle size={20} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
                ทักทายมิเกล
             </button>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 1.5: CHAT GUIDE ---
  if (step === 'chat_guide') {
    return (
      <div key="chat_guide" className="absolute inset-0 z-[200] pointer-events-none overflow-hidden rounded-[3rem]">
        {/* Helper Tooltip */}
        <div className="absolute bottom-[100px] left-0 right-0 flex justify-center items-end animate-bounce z-[220]">
            <div className="bg-pink-500 text-white px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.6)] font-bold text-xs flex items-center gap-1 border border-white/30">
                พิมพ์ทักทายตรงนี้เลย! 👇
            </div>
        </div>
      </div>
    );
  }

  // --- STEP 2: ENERGY GUIDE ---
  if (step === 'energy_guide') {
    return (
      <div key="energy_guide" className="absolute inset-0 z-[200] pointer-events-auto overflow-hidden rounded-[3rem]">
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] animate-in fade-in duration-500"></div>

        {/* Pointer & Tooltip */}
        <div className="absolute top-14 left-4 z-[210] animate-in slide-in-from-left duration-500 ease-out">
            <div className="flex flex-col items-start gap-2">
                <ArrowUp className="text-white w-10 h-10 -rotate-45 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-bounce ml-8" strokeWidth={3} />
                
                <div className="bg-white text-slate-900 p-5 rounded-2xl rounded-tl-none shadow-[0_0_30px_rgba(249,115,22,0.6)] max-w-[280px] border-4 border-orange-400 relative">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-orange-100 p-1.5 rounded-lg text-orange-600">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <h3 className="font-extrabold text-lg uppercase tracking-tight">Energy Usage</h3>
                    </div>
                    <p className="text-sm font-medium text-gray-600 leading-snug mb-4">
                        การแชทแต่ละครั้งจะใช้ <span className="text-orange-500 font-bold">Energy</span> นะคะ! <br/>
                        ถ้าพลังหมดต้องพักผ่อน หรือหาของกินอร่อยๆ
                    </p>
                    <button 
                        onClick={onComplete}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                    >
                        เข้าใจแล้ว!
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- MAP TUTORIAL 1: INTRO ---
  if (step === 'map_intro') {
      return (
        <div key="map_intro" className="absolute inset-0 z-[200] flex items-end justify-center pointer-events-auto overflow-hidden rounded-[3rem]">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] animate-in fade-in duration-500"></div>
            <SkipButton onClick={onComplete} />

            <div className="relative z-[210] w-full max-w-md mx-auto p-4 mb-20 animate-in slide-in-from-bottom duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-2xl border-4 border-indigo-400 relative">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 bg-pink-100 shadow-xl overflow-hidden animate-bounce-soft">
                            {miguelImg && <img src={miguelImg} className="w-full h-full object-cover" />}
                        </div>
                    </div>

                    <div className="mt-10 text-center">
                        <h3 className="font-black text-2xl text-gray-800 dark:text-white mb-3">AiLuv City Map</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 font-medium">
                            "ว้าว! นี่คือแผนที่เมือง AiLuv ค่ะ <br/>
                            เราสามารถเดินทางไปหาสถานที่ต่างๆ เพื่อทำกิจกรรมและพบปะเพื่อนใหม่ๆ ได้ที่นี่เลยนะคะ! <br/>
                            บางที่อาจจะมีเวลา เปิด-ปิด ด้วยนะ ต้องเช็คดีๆ ล่ะ"
                        </p>
                        <button 
                            onClick={onNext}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 text-lg"
                        >
                            ไปสำรวจกัน!
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // --- MAP TUTORIAL 2-6 (Adjusted for Desktop Centering & Single Arrow) ---
  if (step === 'map_pin_cafe') {
      return (
        <div key="map_pin_cafe" className="absolute inset-0 z-[200] pointer-events-none overflow-hidden rounded-[3rem]">
            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[0px] animate-in fade-in duration-500"></div>
            {/* REMOVED FLOATING ARROW: Now handled by MapGrid pin overlay for precision */}
            
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[250] pointer-events-auto">
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-pink-200 dark:border-slate-700">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-400 shrink-0">
                        {miguelImg && <img src={miguelImg} className="w-full h-full object-cover" />}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                        "ลองเดินทางไปหา <b>พี่พีท</b> ที่ <b>Cat & Cup Cafe</b> ดูสิคะ!"
                    </p>
                 </div>
            </div>
        </div>
      );
  }

  if (step === 'map_drawer') {
      return (
        <div key="map_drawer" className="absolute inset-0 z-[200] pointer-events-none overflow-hidden rounded-[3rem]">
            <div className="absolute inset-0 bg-black/20 animate-in fade-in duration-500"></div>
            <div className="absolute bottom-[280px] left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[250] pointer-events-auto animate-in slide-in-from-top duration-500">
                 <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-2xl border-2 border-indigo-400 relative">
                    <div className="absolute -top-6 left-6 w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-md overflow-hidden bg-pink-100">
                        {miguelImg && <img src={miguelImg} className="w-full h-full object-cover" />}
                    </div>
                    <div className="mt-4">
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-medium">
                            "การ์ดใบนี้จะบอกรายละเอียดสถานที่ค่ะ ว่ามีใครอยู่บ้าง และทำอะไรได้บ้าง <br/>
                            เช่นที่นี่มี <b>Shop</b> สำหรับซื้อของกินด้วยนะ! <br/>
                            <br/>
                            <span className="text-orange-500 font-bold">⚠️ อย่าลืมว่าการเดินทางก็ใช้ Energy นะคะ!</span>"
                        </p>
                    </div>
                    {/* REMOVED BLUE ARROW HERE */}
                 </div>
            </div>
        </div>
      );
  }

  if (step === 'location_action_toggle') {
      return (
        <div key="location_action_toggle" className="absolute inset-0 z-[200] pointer-events-none overflow-hidden rounded-[3rem]">
            <div className="absolute top-[220px] left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[250] pointer-events-auto">
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl flex items-start gap-3 border border-pink-200 dark:border-slate-700 animate-in slide-in-from-top duration-300">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-400 shrink-0">
                        {miguelImg && <img src={miguelImg} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                            "ถึงแล้ว! นี่คือหน้าแชทกับพี่พีทค่ะ <br/>
                            แต่ถ้าอยากซื้อของ ให้กดปุ่ม <b>Action</b> ด้านบนขวานะคะ ลองกดเลย!"
                        </p>
                    </div>
                 </div>
            </div>
        </div>
      );
  }

  if (step === 'shop_buy_cookie') {
      return (
        <div key="shop_buy_cookie" className="absolute inset-0 z-[200] pointer-events-none overflow-hidden rounded-[3rem]">
            <div className="absolute top-[120px] left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[250] pointer-events-auto">
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-green-200 dark:border-slate-700 animate-in slide-in-from-top duration-300">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-400 shrink-0">
                        {miguelImg && <img src={miguelImg} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                            "ว้าว! ขนมเต็มเลย 🍪 <br/>
                            ลองซื้อ <b>Cookie</b> มาทานดูสิคะ มันช่วยเพิ่มพลังงานได้นะ!"
                        </p>
                    </div>
                 </div>
            </div>
        </div>
      );
  }

  if (step === 'buff_explanation') {
      return (
        <div key="buff_explanation" className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-auto overflow-hidden rounded-[3rem]">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] animate-in fade-in duration-500"></div>
            
            <div className="relative z-[210] w-full max-w-sm p-6 animate-in zoom-in-95 duration-500">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-2xl border-4 border-green-400 relative text-center">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 bg-pink-100 shadow-xl overflow-hidden animate-bounce-soft">
                            {miguelImg && <img src={miguelImg} className="w-full h-full object-cover" />}
                        </div>
                    </div>

                    <div className="mt-10">
                        <h3 className="font-black text-xl text-gray-800 dark:text-white mb-3 flex items-center justify-center gap-2">
                            <ShoppingBag size={24} className="text-green-500" /> Food & Buffs
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 font-medium">
                            "เยี่ยมเลย! การกินอาหารนอกจากจะอร่อยแล้ว <br/>
                            ยังช่วย <b>เพิ่ม Energy</b> และบางอย่างให้ <b>Buff พิเศษ</b> ด้วยนะ! <br/>
                            <br/>
                            หมั่นแวะมาดูร้านค้าบ่อยๆ นะคะ ของดีเพียบเลย!"
                        </p>
                        <button 
                            onClick={onComplete}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 text-lg flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={20} /> พร้อมลุยแล้ว!
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // --- ME PAGE TUTORIAL FLOW ---

  // 1. ME INTRO
  if (step === 'me_intro') {
      return (
        <div key="me_intro" className="absolute inset-0 z-[200] flex items-end justify-center pointer-events-auto overflow-hidden rounded-[3rem]">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] animate-in fade-in duration-500"></div>
            <SkipButton onClick={onComplete} />

            <div className="relative z-[210] w-full max-w-md mx-auto p-4 mb-20 animate-in slide-in-from-bottom duration-500">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-2xl border-4 border-pink-400 relative">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 bg-pink-100 shadow-xl overflow-hidden animate-bounce-soft">
                            {miguelImg && <img src={miguelImg} className="w-full h-full object-cover" />}
                        </div>
                    </div>

                    <div className="mt-10 text-center">
                        <h3 className="font-black text-2xl text-gray-800 dark:text-white mb-3">Your Profile</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 font-medium">
                            "ยินดีต้อนรับสู่หน้า <b>Profile</b> ของคุณค่ะ! <br/>
                            ที่นี่คือศูนย์รวมข้อมูลสำคัญที่จะช่วยให้คุณใช้ชีวิตใน AiLuv City ได้ดียิ่งขึ้น!"
                        </p>
                        <button 
                            onClick={onNext}
                            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 text-lg"
                        >
                            ไปดูรายละเอียดกัน!
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // 2. EXP GUIDE (Pointer Top Right)
  if (step === 'me_exp') {
      return (
        <div key="me_exp" className="absolute inset-0 z-[200] pointer-events-none overflow-hidden rounded-[3rem]">
            {/* Arrow Pointing to Top Right EXP Bar */}
            <div className="absolute top-[65px] right-2 z-[250] flex flex-col items-end animate-bounce">
                <ArrowUp className="text-white drop-shadow-md w-10 h-10 rotate-[30deg]" strokeWidth={4} />
            </div>

            <div className="absolute top-[120px] left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[250] pointer-events-auto">
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-indigo-200 dark:border-slate-700 animate-in slide-in-from-top duration-300">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-400 shrink-0">
                        {miguelImg && <img src={miguelImg} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                            "ทุกกิจกรรมที่คุณทำ ไม่ว่าจะแชท ทำงาน หรือออกกำลังกาย จะได้รางวัลเป็น <b>EXP</b> ค่ะ ดูที่หลอดด้านบนนี้ได้เลย!"
                        </p>
                        <button onClick={onNext} className="mt-2 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm">เข้าใจแล้ว</button>
                    </div>
                 </div>
            </div>
        </div>
      );
  }

  // 3. LEVEL GUIDE (Pointer Top Center)
  if (step === 'me_level') {
      return (
        <div key="me_level" className="absolute inset-0 z-[200] pointer-events-none overflow-hidden rounded-[3rem]">
            {/* Arrow Pointing to Center Level Badge */}
            <div className="absolute top-[75px] left-1/2 -translate-x-1/2 z-[250] animate-bounce">
                <ArrowUp className="text-white drop-shadow-md w-10 h-10" strokeWidth={4} />
            </div>

            <div className="absolute top-[130px] left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[250] pointer-events-auto">
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-purple-200 dark:border-slate-700 animate-in slide-in-from-top duration-300">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-400 shrink-0">
                        {miguelImg && <img src={miguelImg} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                            "เมื่อสะสม EXP จนเต็ม คุณจะ <b>Level Up</b>! <br/>
                            และทุกครั้งที่เลเวลอัพ คุณจะได้ <b>Stat Point</b> 1 แต้ม เพื่อนำมาอัพเกรดความสามารถค่ะ"
                        </p>
                        <button onClick={onNext} className="mt-2 bg-purple-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm">ไปต่อเลย</button>
                    </div>
                 </div>
            </div>
        </div>
      );
  }

  // 4. STATS EXPLANATION (Center Modal)
  if (step === 'me_stats') {
      return (
        <div key="me_stats" className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-auto overflow-hidden rounded-[3rem]">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] animate-in fade-in duration-500"></div>
            
            <div className="relative z-[210] w-full max-w-sm p-4 animate-in zoom-in-95 duration-500">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-2xl border-4 border-yellow-400 relative">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-800 bg-pink-100 shadow-xl overflow-hidden">
                            {miguelImg && <img src={miguelImg} className="w-full h-full object-cover" />}
                        </div>
                    </div>

                    <h3 className="font-black text-lg text-center text-gray-800 dark:text-white mb-2">4 Core Attributes</h3>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium text-center mb-4 leading-relaxed">
                        "ค่าสถานะทั้ง 4 ประเภทจะให้โบนัสผลลัพธ์ที่แตกต่างกันค่ะ <br/>
                        นอกจากนี้คุณยังสามารถได้รับแต้มสถานะเพิ่มจาก <b>ไอเทม</b>, <b>เสื้อผ้า</b> และ <b>บัฟ</b> บางประเภทได้อีกด้วยนะ!"
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-red-50 dark:bg-slate-900 p-2 rounded-xl flex items-center gap-2 border border-red-100 dark:border-slate-700">
                            <Zap size={16} className="text-red-500" />
                            <div><div className="text-[9px] font-bold text-red-500 uppercase">VIT</div><div className="text-[8px] text-gray-500 dark:text-gray-400">Max Energy</div></div>
                        </div>
                        <div className="bg-blue-50 dark:bg-slate-900 p-2 rounded-xl flex items-center gap-2 border border-blue-100 dark:border-slate-700">
                            <Brain size={16} className="text-blue-500" />
                            <div><div className="text-[9px] font-bold text-blue-500 uppercase">INT</div><div className="text-[8px] text-gray-500 dark:text-gray-400">Gold Bonus</div></div>
                        </div>
                        <div className="bg-pink-50 dark:bg-slate-900 p-2 rounded-xl flex items-center gap-2 border border-pink-100 dark:border-slate-700">
                            <Sparkles size={16} className="text-pink-500" />
                            <div><div className="text-[9px] font-bold text-pink-500 uppercase">CHA</div><div className="text-[8px] text-gray-500 dark:text-gray-400">Love Bonus</div></div>
                        </div>
                        <div className="bg-yellow-50 dark:bg-slate-900 p-2 rounded-xl flex items-center gap-2 border border-yellow-100 dark:border-slate-700">
                            <Clover size={16} className="text-yellow-500" />
                            <div><div className="text-[9px] font-bold text-yellow-500 uppercase">LUCK</div><div className="text-[8px] text-gray-500 dark:text-gray-400">Critical %</div></div>
                        </div>
                    </div>

                    <button 
                        onClick={onNext}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 text-sm"
                    >
                        เข้าใจแล้ว!
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // 5. SKILLS GUIDE (Pointer Bottom)
  if (step === 'me_skills') {
      return (
        <div key="me_skills" className="absolute inset-0 z-[200] pointer-events-none overflow-hidden rounded-[3rem]">
            {/* Arrow Pointing Down to Skills Area */}
            <div className="absolute bottom-[200px] left-1/2 -translate-x-1/2 z-[250] animate-bounce">
                <ArrowDown className="text-white drop-shadow-md w-10 h-10" strokeWidth={4} />
            </div>

            <div className="absolute bottom-[260px] left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[250] pointer-events-auto">
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-pink-200 dark:border-slate-700 animate-in slide-in-from-bottom duration-300">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-400 shrink-0">
                        {miguelImg && <img src={miguelImg} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                            "นอกจากนี้... ถ้าทำตามเงื่อนไขได้ คุณยังสามารถปลดล็อก <b>Skills</b> พิเศษตรงนี้เพื่อช่วยให้ชีวิตสะดวกสบายขึ้นด้วยนะคะ! <br/><br/>
                            ขอให้สนุกไปกับเมือง AiLuv นะคะ! 💖"
                        </p>
                        <button onClick={onComplete} className="mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-4 py-2 rounded-lg shadow-md w-full">เริ่มต้นใช้ชีวิต!</button>
                    </div>
                 </div>
            </div>
        </div>
      );
  }

  if (step === 'goals_intro') {
      return (
        <div key="goals_intro" className="absolute inset-0 z-[200] flex items-end justify-center pointer-events-auto overflow-hidden rounded-[3rem]">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] animate-in fade-in duration-500"></div>
            <SkipButton onClick={onComplete} />
            <div className="relative z-[210] w-full max-w-md mx-auto p-4 mb-20 animate-in slide-in-from-bottom duration-500">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-2xl border-4 border-yellow-400 relative">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 bg-pink-100 shadow-xl overflow-hidden animate-bounce-soft">
                            {miguelImg && <img src={miguelImg} className="w-full h-full object-cover" />}
                        </div>
                    </div>
                    <div className="mt-10 text-center">
                        <h3 className="font-black text-2xl text-gray-800 dark:text-white mb-3">Daily & Weekly Quests</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 font-medium">
                            "มิเกลขอแนะนำส่วนของ <b>Quest</b> หรือภารกิจนะคะ! <br/>
                            แบ่งเป็น <b>Daily (รายวัน)</b> และ <b>Weekly (รายสัปดาห์)</b> <br/>
                            ทำสำเร็จแล้วอย่าลืมกดรับรางวัลนะคะ!"
                        </p>
                        <button 
                            onClick={onNext}
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-4 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 text-lg"
                        >
                            ไปลองกดรับรางวัลกัน!
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  if (step === 'goals_claim') {
      return (
        <div key="goals_claim" className="absolute inset-0 z-[200] pointer-events-none overflow-hidden rounded-[3rem]">
            {/* [MARCUS FIX]: Removed dimming background to let DailyQuests handle local backdrop */}
            <SkipButton onClick={onComplete} />
        </div>
      );
  }

  if (step === 'goals_rank') {
      return (
        <div key="goals_rank" className="absolute inset-0 z-[200] flex items-end justify-center pointer-events-auto overflow-hidden rounded-[3rem]">
            {/* [MARCUS FIX]: Removed dimming background here too */}
            <SkipButton onClick={onComplete} />
            <div className="relative z-[210] w-full max-w-md mx-auto p-4 mb-20 animate-in slide-in-from-bottom duration-500">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-2xl border-4 border-yellow-400 relative">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 bg-pink-100 shadow-xl overflow-hidden animate-bounce-soft">
                            {miguelImg && <img src={miguelImg} className="w-full h-full object-cover" />}
                        </div>
                    </div>
                    <div className="mt-10 text-center">
                        <h3 className="font-black text-2xl text-gray-800 dark:text-white mb-3">Season Rankings</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 font-medium">
                            "เช็คอันดับของคุณเทียบกับคนทั้งเมืองได้ที่ปุ่ม <b>Ranking</b> มุมขวาบนนะคะ! <br/>
                            จบ Season มีรางวัลพิเศษรออยู่ด้วยนะ! 🏆"
                        </p>
                        <button onClick={onComplete} className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-4 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 text-lg flex items-center justify-center gap-2">
                            <CheckCircle2 size={20} /> รับทราบ!
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  if (step === 'relationships_intro_1') {
      return (
        <div key="relationships_intro_1" className="absolute inset-0 z-[200] flex items-end justify-center pointer-events-auto overflow-hidden rounded-[3rem]">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] animate-in fade-in duration-500"></div>
            <SkipButton onClick={onComplete} />
            <div className="relative z-[210] w-full max-w-md mx-auto p-4 pb-6 animate-in slide-in-from-bottom duration-500">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-2xl border-2 border-pink-400 relative flex gap-4 items-center">
                    <div className="w-20 h-20 shrink-0 rounded-full border-2 border-white dark:border-slate-800 bg-pink-100 shadow-md overflow-hidden relative -top-8 self-start">
                        {miguelImg && <img src={miguelImg} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 -ml-2">
                        <h3 className="font-black text-lg text-gray-800 dark:text-white mb-1">AiLuv Relationships</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-snug font-medium mb-3">
                            "นี่คือหน้าแสดงความสัมพันธ์ของคุณ... <br/>กับผู้คนต่างๆในเมือง AiLuv นะคะ"
                        </p>
                        <button onClick={onNext} className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded-xl shadow-md text-sm w-full">ถัดไป</button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  if (step === 'relationships_intro_2') {
      return (
        <div key="relationships_intro_2" className="absolute inset-0 z-[200] flex items-end justify-center pointer-events-auto overflow-hidden rounded-[3rem]">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] animate-in fade-in duration-500"></div>
            <SkipButton onClick={onComplete} />
            <div className="relative z-[210] w-full max-w-md mx-auto p-4 pb-6 animate-in slide-in-from-bottom duration-500">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-2xl border-2 border-pink-400 relative flex gap-4 items-center">
                    <div className="w-20 h-20 shrink-0 rounded-full border-2 border-white dark:border-slate-800 bg-pink-100 shadow-md overflow-hidden relative -top-8 self-start">
                        {miguelImg && <img src={miguelImg} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 -ml-2">
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-snug font-medium mb-3">
                            "ตอนนี้คุณอาจจะเห็นแถบของมิเกลแค่คนเดียว... ลองแวะไปสถานที่ต่างๆ เพื่อทำความรู้จักเพื่อนใหม่ และค้นหาความลับเพื่อปลดล็อก <b>Secret Photo</b> ด้วยนะคะ!"
                        </p>
                        <button onClick={onNext} className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded-xl shadow-md text-sm w-full">เข้าใจแล้ว!</button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  if (step === 'relationships_tap') {
      return (
        <div key="relationships_tap" className="absolute inset-0 z-[200] pointer-events-none overflow-hidden rounded-[3rem]">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[1px] animate-in fade-in duration-500"></div>
            <SkipButton onClick={onComplete} />
            <div className="absolute top-[120px] left-1/2 -translate-x-1/2 z-[250] animate-bounce pointer-events-auto">
                <ArrowDown className="text-white w-12 h-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" strokeWidth={3} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 z-[210] p-4 pb-6 animate-in slide-in-from-bottom duration-500 flex items-end justify-center pointer-events-auto">
                <div className="w-full max-w-md bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-2xl border-2 border-pink-400 relative flex gap-4 items-center">
                    <div className="w-20 h-20 shrink-0 rounded-full border-2 border-white dark:border-slate-800 bg-pink-100 shadow-md overflow-hidden relative -top-8 self-start">
                        {miguelImg && <img src={miguelImg} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 -ml-2">
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-snug font-medium">
                            "คุณ <span className="font-bold text-pink-500">{playerName}</span>...ลองกดไปดูข้อมูลระหว่างเราสองคนได้ที่แถบมิเกลเลยนะคะ"
                        </p>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // --- STORY INTRO ---
  if (step === 'story_intro') {
      return (
        <div key="story_intro" className="absolute inset-0 z-[700] flex items-end justify-center pointer-events-auto overflow-hidden rounded-[3rem]">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] animate-in fade-in duration-500"></div>
            <SkipButton onClick={onComplete} />
            <div className="relative z-[710] w-full max-w-md mx-auto p-4 mb-20 animate-in slide-in-from-bottom duration-500">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-2xl border-4 border-orange-400 relative">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 bg-pink-100 shadow-xl overflow-hidden animate-bounce-soft">
                            {miguelImg && <img src={miguelImg} className="w-full h-full object-cover" />}
                        </div>
                    </div>
                    <div className="mt-10 text-center">
                        <h3 className="font-black text-2xl text-gray-800 dark:text-white mb-3">Main Story</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 font-medium">
                            "นี่คือ <b>ภารกิจเนื้อเรื่องหลัก (Story)</b> ที่จะช่วยให้คุณปลดล็อกฟีเจอร์ใหม่ๆ และเติบโตไปพร้อมกับเมือง AiLuv นะคะ! <br/>
                            ทำภารกิจให้ครบเพื่อรับรางวัลสุดพิเศษเลย!"
                        </p>
                        <button onClick={onComplete} className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold py-4 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 text-lg flex items-center justify-center gap-2">
                            <BookOpen size={20} /> เริ่มกันเลย!
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  return null;
};

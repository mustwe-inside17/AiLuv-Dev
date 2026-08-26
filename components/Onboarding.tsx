
import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, ArrowRight, ArrowLeft, LogOut, Mars, Venus, Camera, Check, User, Smile, Calendar, Tag, Hash, Fingerprint } from 'lucide-react';
import { UserProfile } from '../types';
import { auth, signOut, getCharacterImageUrl } from '../services/firebase';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

// System Avatar Configuration (Matches assets in Storage)
const SYSTEM_AVATARS = [
  { id: 'male', type: 'male', path: 'avatars/male.png' },
  { id: 'male2', type: 'male', path: 'avatars/male2.png' },
  { id: 'male3', type: 'male', path: 'avatars/male3.png' },
  { id: 'male4', type: 'male', path: 'avatars/male4.png' },
  { id: 'female', type: 'female', path: 'avatars/female.png' },
  { id: 'female2', type: 'female', path: 'avatars/female2.png' },
  { id: 'female3', type: 'female', path: 'avatars/female3.png' },
  { id: 'female4', type: 'female', path: 'avatars/female4.png' },
  { id: 'female5', type: 'female', path: 'avatars/female5.png' },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  
  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [interests, setInterests] = useState(''); // REPURPOSED AS BIO/IDENTITY
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

  // Loaded Images Cache
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({});

  // Load Avatar URLs on mount
  useEffect(() => {
    const loadImages = async () => {
        const urlMap: Record<string, string> = {};
        await Promise.all(SYSTEM_AVATARS.map(async (av) => {
            const url = await getCharacterImageUrl(av.path);
            if (url) urlMap[av.id] = url;
        }));
        setAvatarUrls(urlMap);
    };
    loadImages();
  }, []);

  const handleLogout = async () => {
    try { await signOut(auth); } catch (error) { console.error("Logout failed", error); }
  };

  const handleNext = () => {
    if (name.trim() && gender && age && interests.trim()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleFinish = () => {
    if (selectedAvatarId && name.trim()) {
      onComplete({
        name: name.trim(),
        age: age.trim(),
        interests: interests.trim(), // Storing Bio in 'interests' field
        gender: gender || 'other',
        avatarConfig: {
            mode: 'realistic',
            realisticId: selectedAvatarId
        }
      });
    }
  };

  // Filter Logic
  const filteredAvatars = SYSTEM_AVATARS.filter(av => {
      if (!gender) return true;
      if (gender === 'other') return true; // Special shows all
      return av.type === gender;
  });

  return (
    <div className="fixed inset-0 z-[50] w-full h-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 animate-gradient-move text-gray-800 overflow-hidden">
      
      {/* Background FX - Floating Blobs (Fixed Position) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      {/* Scrollable Content Wrapper */}
      <div className="w-full h-full overflow-y-auto flex flex-col items-center justify-center p-4 md:p-6 relative z-10">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/60 p-6 md:p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] my-auto transition-all duration-300">
            
            {/* Header / Progress */}
            <div className="flex justify-between items-center mb-6 shrink-0">
                {step === 1 ? (
                    <button onClick={handleLogout} className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <LogOut size={20} />
                    </button>
                ) : (
                    <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                )}
                
                <div className="flex gap-2">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-pink-500 shadow-md shadow-pink-200' : 'bg-gray-200'}`}></div>
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-pink-500 shadow-md shadow-pink-200' : 'bg-gray-200'}`}></div>
                </div>

                <div className="w-8"></div> {/* Spacer */}
            </div>

            <div className="text-center mb-6 shrink-0">
                <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center justify-center gap-2">
                    {step === 1 ? <>Who Are You? <span className="animate-wave origin-bottom-right">🤔</span></> : 'Pick your Style'}
                </h1>
                <p className="text-sm text-gray-500 font-medium mt-1">
                    {step === 1 ? 'Design your Roleplay Identity.' : 'How do you want to look?'}
                </p>
            </div>

            {/* STEP 1: IDENTITY */}
            {step === 1 && (
                <div className="space-y-5 animate-in slide-in-from-right fade-in duration-300 flex-1 overflow-y-auto px-1 custom-scrollbar pb-2">
                    <div className="space-y-2">
                        <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            <Tag size={12} className="text-pink-400" /> Codename
                        </label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="จะให้เราเรียกคุณว่าอะไรดี?"
                            className="w-full bg-gray-50/50 border-2 border-transparent focus:border-pink-300 text-gray-800 font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all shadow-sm placeholder:font-medium placeholder:text-gray-300 text-base"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <Calendar size={12} className="text-blue-400" /> Age
                            </label>
                            <input 
                                type="number" 
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="24"
                                className="w-full bg-gray-50/50 border-2 border-transparent focus:border-blue-300 text-gray-800 font-bold rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm text-center text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-gray-300"
                            />
                        </div>
                        <div className="flex items-center justify-center pt-6 opacity-70">
                            <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                *มีผลต่อคำสรรพนามในแชท
                            </span>
                        </div>
                    </div>

                    {/* NEW BIO FIELD */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <Fingerprint size={12} className="text-red-400" /> Your Story (Bio)
                            </label>
                            <span className={`text-[10px] font-bold ${interests.length >= 30 ? 'text-red-500' : 'text-gray-400'}`}>
                                {interests.length}/30
                            </span>
                        </div>
                        <input 
                            type="text"
                            maxLength={30} // Hard Limit
                            value={interests}
                            onChange={(e) => setInterests(e.target.value)}
                            placeholder="เช่น ทายาทมหาเศรษฐี..."
                            className="w-full bg-white border-2 border-red-100 focus:border-red-400 text-gray-800 font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all shadow-sm placeholder:font-medium placeholder:text-gray-300 text-base"
                        />
                        <p className="text-[10px] text-gray-400 ml-1 font-medium italic">
                            *ตัวละครจะตอบสนองต่อบทบาทของคุณ!
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            <User size={12} className="text-purple-400" /> I identify as...
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button 
                                type="button" 
                                onClick={() => { setGender('male'); setSelectedAvatarId(null); }}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${gender === 'male' ? 'bg-blue-50 border-blue-400 text-blue-600 shadow-md scale-105' : 'bg-gray-50/50 border-transparent text-gray-400 hover:bg-gray-100'}`}
                            >
                                <Mars size={24} strokeWidth={2.5} />
                                <span className="text-[10px] font-black uppercase tracking-wide">Male</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={() => { setGender('female'); setSelectedAvatarId(null); }}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${gender === 'female' ? 'bg-pink-50 border-pink-400 text-pink-600 shadow-md scale-105' : 'bg-gray-50/50 border-transparent text-gray-400 hover:bg-gray-100'}`}
                            >
                                <Venus size={24} strokeWidth={2.5} />
                                <span className="text-[10px] font-black uppercase tracking-wide">Female</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={() => { setGender('other'); setSelectedAvatarId(null); }}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${gender === 'other' ? 'bg-purple-50 border-purple-400 text-purple-600 shadow-md scale-105' : 'bg-gray-50/50 border-transparent text-gray-400 hover:bg-gray-100'}`}
                            >
                                <Sparkles size={24} strokeWidth={2.5} />
                                <span className="text-[10px] font-black uppercase tracking-wide">Special</span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            onClick={handleNext}
                            disabled={!name.trim() || !gender || !age || !interests.trim()}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:brightness-110 active:brightness-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform-none text-lg"
                        >
                            Next Step <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: AVATAR SELECTION */}
            {step === 2 && (
                <div className="flex flex-col h-full animate-in slide-in-from-right fade-in duration-300 overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-1 pb-4 custom-scrollbar">
                        <div className="grid grid-cols-3 gap-3">
                            {filteredAvatars.map((av) => (
                                <button
                                    key={av.id}
                                    onClick={() => setSelectedAvatarId(av.id)}
                                    className={`
                                        relative aspect-square rounded-2xl overflow-hidden border-4 transition-all duration-300 group
                                        ${selectedAvatarId === av.id 
                                            ? 'border-pink-500 scale-105 shadow-xl shadow-pink-200 z-10' 
                                            : 'border-transparent hover:border-gray-200 opacity-70 hover:opacity-100'}
                                    `}
                                >
                                    {avatarUrls[av.id] ? (
                                        <img src={avatarUrls[av.id]} className="w-full h-full object-cover" alt={av.id} />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                                            <User size={20} className="text-gray-400" />
                                        </div>
                                    )}
                                    
                                    {selectedAvatarId === av.id && (
                                        <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center animate-in zoom-in duration-200">
                                            <div className="bg-pink-50 text-white p-2 rounded-full shadow-lg">
                                                <Check size={20} strokeWidth={4} />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        {filteredAvatars.length === 0 && (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                Loading Avatars...
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-2 shrink-0">
                        <button 
                            onClick={handleFinish}
                            disabled={!selectedAvatarId}
                            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-lg py-4 rounded-2xl shadow-xl shadow-pink-200 hover:brightness-110 active:brightness-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform-none"
                        >
                            <Camera size={22} /> Start Journey
                        </button>
                    </div>
                </div>
            )}

          </div>
      </div>
    </div>
  );
};

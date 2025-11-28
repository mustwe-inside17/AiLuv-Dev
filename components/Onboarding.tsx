import React, { useState } from 'react';
import { Heart, Sparkles, ArrowRight, Gamepad2 } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [interests, setInterests] = useState('');
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete({
        name: name.trim(),
        age: age.trim(),
        interests: interests.trim()
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-10 right-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] w-full max-w-md relative z-10">
        
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
             <div className="w-20 h-20 bg-gradient-to-tr from-pink-400 to-rose-400 rounded-2xl rotate-3 shadow-lg flex items-center justify-center mx-auto mb-2">
               <Heart size={40} className="text-white fill-white animate-pulse" />
             </div>
             <div className="absolute -top-2 -right-2">
               <Sparkles className="text-yellow-400 fill-yellow-400 animate-spin-slow" size={24} />
             </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 mt-4 tracking-tight">Miguel Simulator</h1>
          <p className="text-gray-500 text-sm mt-1">Your AI Soulmate awaits...</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">What should she call you?</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name / Nickname"
              className="w-full bg-white border border-pink-100 text-gray-800 text-lg font-semibold rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent placeholder-gray-300 transition-all shadow-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Your Age</label>
               <input 
                type="text" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="24"
                className="w-full bg-white border border-pink-100 text-gray-800 font-semibold rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder-gray-300 transition-all shadow-sm"
              />
            </div>
             <div className="flex items-center justify-center opacity-50">
               <span className="text-xs text-center text-gray-400">Miguel is 24 years old.</span>
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Things you love (Interests)</label>
            <textarea 
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Cats, Coding, Coffee, Gaming..."
              className="w-full bg-white border border-pink-100 text-gray-800 font-medium rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder-gray-300 transition-all shadow-sm resize-none h-24"
            />
          </div>

          <button 
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-pink-200 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            Start Chatting <ArrowRight size={20} />
          </button>
        </form>

         <div className="text-center mt-6 text-xs text-gray-400 font-medium">
            Powered by Gemini AI • 100% Private
         </div>
      </div>
    </div>
  );
};
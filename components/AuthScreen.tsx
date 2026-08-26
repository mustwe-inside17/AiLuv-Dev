
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider } from '../services/firebase';
import { auth } from '../services/firebase';
import { Heart, Sparkles, Lock, ArrowRight, Key, Mail, CheckCircle2, Terminal, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface AuthScreenProps {
  onSuccess: () => void;
}

type AuthMode = 'choice' | 'login' | 'register' | 'reset';
type ResetStage = 'email' | 'link_generated' | 'new_password';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('choice');
  const [logoError, setLogoError] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [betaKey, setBetaKey] = useState('');
  
  // Reset Flow States
  const [resetStage, setResetStage] = useState<ResetStage>('email');
  const [isDevHardReset, setIsDevHardReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [mockLink, setMockLink] = useState('');

  // Feedback States
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Update playerName in store if it's currently "Citizen"
      const store = useGameStore.getState();
      if (store.playerName === 'Citizen' && result.user.displayName) {
        store.setGameState({ playerName: result.user.displayName });
      }
      
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          onSuccess();
        } catch (loginErr: any) {
          const errStr = loginErr.code || loginErr.message || "";
          if (errStr.includes('auth/invalid-credential') || errStr.includes('auth/user-not-found')) {
            // Attempt auto-register if account might not exist
            try {
              await createUserWithEmailAndPassword(auth, email, password);
              onSuccess();
              return;
            } catch (regErr: any) {
              const regErrStr = regErr.code || regErr.message || "";
              if (regErrStr.includes('auth/email-already-in-use')) {
                throw new Error("Wrong email or password."); // It was actually a wrong password
              }
              throw regErr; // Throw other registration errors
            }
          }
          throw loginErr;
        }
      } else if (mode === 'register') {
        // BETA KEY CHECK
        if (betaKey !== 'AiLuv') {
           setError("Invalid Beta Key. Please contact the admin.");
           setLoading(false);
           return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
        onSuccess();
      } else if (mode === 'reset') {
        
        if (resetStage === 'email') {
            if (isDevHardReset) {
                // HARD RESET SIMULATION
                if (!email) {
                    setError("Please enter email for test generation.");
                    setLoading(false);
                    return;
                }
                // Simulate delay
                await new Promise(r => setTimeout(r, 800));
                const token = Math.random().toString(36).substring(7);
                setMockLink(`https://ailuv.project/reset-password?token=${token}&email=${encodeURIComponent(email)}`);
                setResetStage('link_generated');
                setLoading(false);
            } else {
                // REAL FIREBASE RESET
                await sendPasswordResetEmail(auth, email);
                setSuccessMsg(`Reset link sent to ${email}`);
                setLoading(false);
            }
        } else if (resetStage === 'new_password') {
            // SIMULATE PASSWORD CHANGE
            if (newPassword.length < 6) {
                setError("Password must be at least 6 characters.");
                setLoading(false);
                return;
            }
            await new Promise(r => setTimeout(r, 1000));
            setSuccessMsg("Password changed successfully! (Test Mode)");
            setLoading(false);
            // After mock success, maybe redirect to login after delay
            setTimeout(() => {
                switchMode('login');
            }, 1500);
        }
      }
    } catch (err: any) {
      console.error(err);
      let msg = "Authentication failed.";
      const errorStr = err.code || err.message || "";
      if (errorStr.includes('auth/invalid-credential')) msg = "Wrong email or password.";
      else if (errorStr.includes('auth/email-already-in-use')) msg = "Email already registered.";
      else if (errorStr.includes('auth/weak-password')) msg = "Password should be at least 6 characters.";
      else if (errorStr.includes('auth/user-not-found')) msg = "No user found with this email.";
      else if (errorStr.includes('auth/invalid-email')) msg = "Invalid email format.";
      else if (errorStr.includes('auth/too-many-requests')) msg = "Too many attempts. Try again later.";
      else msg = err.message || "Authentication failed.";
      setError(msg);
    } finally {
      if (mode !== 'reset' || (mode === 'reset' && !isDevHardReset && resetStage === 'email')) {
          setLoading(false);
      }
    }
  };

  const switchMode = (newMode: AuthMode) => {
      setMode(newMode);
      setError('');
      setSuccessMsg('');
      // Reset specialized states
      setResetStage('email');
      setNewPassword('');
      setMockLink('');
  };

  const handleMockLinkClick = () => {
      setResetStage('new_password');
      setSuccessMsg(''); // Clear the "generated" msg
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 animate-gradient-move relative overflow-hidden text-gray-800">
      
      {/* Background FX - Floating Blobs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="bg-white border border-gray-100 p-7 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] w-full max-w-[380px] relative z-10 animate-in slide-in-from-bottom-10 fade-in duration-700 ease-out transform hover:scale-[1.01] transition-transform duration-500">
        
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4 group cursor-pointer">
             {!logoError ? (
                 <div className="w-40 h-40 mx-auto group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                     <img 
                         src="/images/logo.png" 
                         alt="AiLuv Project" 
                         className="w-full h-full object-contain"
                         onError={() => setLogoError(true)}
                     />
                 </div>
             ) : (
                 <div className="w-32 h-32 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-2xl rotate-3 shadow-lg flex items-center justify-center mx-auto group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                   {mode === 'reset' ? (
                       <Key size={50} className="text-white fill-white/20 animate-pulse" />
                   ) : (
                       <Heart size={50} className="text-white fill-white animate-pulse" />
                   )}
                 </div>
             )}
             <div className="absolute -top-2 -right-2 group-hover:-top-4 group-hover:-right-4 transition-all duration-300">
               <Sparkles className="text-yellow-400 fill-yellow-400 animate-spin-slow" size={24} />
             </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight drop-shadow-sm">
              {mode === 'reset' ? 'Recover Account' : 'AiLuv Project'}
          </h1>
          <p className="text-pink-500 font-bold text-xs tracking-widest uppercase mt-2 bg-pink-50 px-3 py-1 rounded-full w-fit mx-auto border border-pink-100">
            {mode === 'choice' ? 'Welcome Back' : mode === 'reset' ? 'Password Reset' : 'Exclusive Beta Test'}
          </p>
        </div>

        {mode === 'choice' ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-100 text-gray-700 font-bold py-4 rounded-2xl shadow-sm hover:bg-gray-50 hover:border-pink-200 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 group"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white/50 backdrop-blur-sm px-4 text-gray-400 font-black tracking-widest">Or</span>
              </div>
            </div>

            <button
              onClick={() => switchMode('login')}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-pink-200 hover:from-pink-400 hover:to-rose-400 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
            >
              <Mail size={20} />
              Continue with Email
            </button>
            
            <p className="text-[10px] text-gray-400 font-bold text-center mt-4 uppercase tracking-tighter opacity-60">
              By continuing, you agree to our terms of service
            </p>
          </div>
        ) : (
          <>
            {/* DEV TOGGLE FOR HARD RESET */}
            {mode === 'reset' && resetStage === 'email' && (
                <div className="flex justify-center mb-6">
                    <button
                        type="button"
                        onClick={() => setIsDevHardReset(!isDevHardReset)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-2 border transition-all ${isDevHardReset ? 'bg-slate-800 text-white border-slate-700 shadow-md' : 'bg-gray-100 text-gray-400 border-gray-200'}`}
                    >
                        <Terminal size={12} />
                        {isDevHardReset ? 'DEV MODE: HARD RESET ON' : 'DEV MODE: OFF'}
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-right fade-in duration-500">
              
              {/* EMAIL INPUT STAGE */}
              {(mode !== 'reset' || (mode === 'reset' && resetStage === 'email')) && (
                  <div className="space-y-1 group">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-pink-500 transition-colors flex items-center gap-1">
                        <Mail size={12} /> Email
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50/50 border-2 border-gray-100 text-gray-700 font-medium rounded-2xl px-5 py-3.5 focus:outline-none focus:border-pink-300 focus:bg-white focus:scale-[1.02] focus:shadow-xl focus:shadow-pink-100/50 transition-all duration-300 placeholder-gray-300"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
              )}
              
              {/* PASSWORD INPUT STAGE (LOGIN/REGISTER) */}
              {mode !== 'reset' && (
                  <div className="space-y-1 group">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-pink-500 transition-colors flex items-center gap-1">
                        <Lock size={12} /> Password
                    </label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-50/50 border-2 border-gray-100 text-gray-700 font-medium rounded-2xl px-5 py-3.5 focus:outline-none focus:border-pink-300 focus:bg-white focus:scale-[1.02] focus:shadow-xl focus:shadow-pink-100/50 transition-all duration-300 placeholder-gray-300"
                      placeholder="••••••••"
                      required
                    />
                  </div>
              )}

              {/* NEW PASSWORD STAGE (HARD RESET) */}
              {mode === 'reset' && resetStage === 'new_password' && (
                  <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-600 font-medium text-center">
                          Setting new password for: <b>{email}</b>
                      </div>
                      <div className="space-y-1 group">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-pink-500 transition-colors flex items-center gap-1">
                            <Key size={12} /> New Password
                        </label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-white border-2 border-pink-200 text-gray-800 font-bold rounded-2xl px-5 py-3.5 focus:outline-none focus:border-pink-400 focus:shadow-lg focus:shadow-pink-100/50 transition-all placeholder-gray-300"
                          placeholder="New Password"
                          autoFocus
                          required
                        />
                      </div>
                  </div>
              )}

              {/* HARD RESET LINK GENERATED STAGE */}
              {mode === 'reset' && resetStage === 'link_generated' && (
                  <div className="animate-in zoom-in fade-in duration-300">
                      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-center space-y-3">
                          <div className="flex justify-center">
                              <div className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center animate-bounce">
                                  <LinkIcon size={24} />
                              </div>
                          </div>
                          <h3 className="font-bold text-gray-800">Reset Link Generated!</h3>
                          <p className="text-xs text-gray-500">
                              Since you are in <b>Dev Mode</b>, you don't need to check your email. Click the link below to proceed.
                          </p>
                          
                          <button
                            type="button"
                            onClick={handleMockLinkClick}
                            className="w-full bg-slate-900 text-green-400 font-mono text-[10px] p-3 rounded-xl break-all hover:bg-black transition-colors border border-slate-700 shadow-inner text-center block"
                          >
                              {mockLink}
                          </button>
                          
                          <p className="text-[9px] text-gray-400 italic">
                              (Click the link above to simulate external access)
                          </p>
                      </div>
                  </div>
              )}

              {mode === 'login' && (
                  <div className="flex justify-end">
                      <button 
                        type="button"
                        onClick={() => switchMode('reset')}
                        className="text-[10px] font-bold text-gray-400 hover:text-pink-500 transition-colors uppercase tracking-wide"
                      >
                          Forgot Password?
                      </button>
                  </div>
              )}

              {mode === 'register' && (
                <div className="bg-yellow-50/80 p-4 rounded-2xl border-2 border-yellow-100 animate-in slide-in-from-top-4 fade-in duration-300">
                   <label className="block text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1"><Key size={12}/> Beta Test Key</label>
                   <input 
                    type="text" 
                    value={betaKey}
                    onChange={(e) => setBetaKey(e.target.value)}
                    className="w-full bg-white border-2 border-yellow-200 text-yellow-800 font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all tracking-widest text-center shadow-inner"
                    placeholder="ENTER-KEY"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100 animate-shake-hard">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="text-green-600 text-xs font-bold text-center bg-green-50 p-3 rounded-xl border border-green-100 flex items-center justify-center gap-2 animate-in zoom-in">
                  <CheckCircle2 size={16} /> {successMsg}
                </div>
              )}

              {/* BUTTON RENDERING LOGIC */}
              {resetStage !== 'link_generated' && (
                <div className="space-y-4 mt-6">
                  <button 
                    type="submit"
                    disabled={loading}
                    className={`
                        w-full text-white font-black text-lg py-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
                        ${mode === 'reset' 
                            ? (isDevHardReset 
                                ? 'bg-gradient-to-r from-slate-700 to-slate-900 shadow-slate-300' // Dark for Dev
                                : 'bg-slate-800 hover:bg-slate-700 shadow-slate-200') 
                            : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 shadow-pink-200'}
                    `}
                  >
                    {loading ? (
                        <span className="animate-pulse">Processing...</span> 
                    ) : (
                        <>
                            {mode === 'login' ? 'Login' : 
                             mode === 'register' ? 'Join Beta' : 
                             mode === 'reset' && resetStage === 'new_password' ? 'Update Password' :
                             mode === 'reset' && isDevHardReset ? 'Generate Link' : 
                             'Send Reset Link'} 
                            
                            {mode === 'reset' && isDevHardReset ? <Terminal size={20} /> : <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform"/>}
                        </>
                    )} 
                  </button>
                </div>
              )}
            </form>

            <div className="mt-6 text-center space-y-3">
              {mode === 'reset' ? (
                  <button 
                    onClick={() => switchMode('login')}
                    className="text-sm font-bold text-gray-400 hover:text-slate-600 transition-colors hover:underline decoration-2 underline-offset-4"
                  >
                    Back to Login
                  </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                    className="text-sm font-bold text-gray-400 hover:text-pink-500 transition-colors hover:underline decoration-2 underline-offset-4"
                  >
                    {mode === 'login' ? "Need an account? Join Beta" : "Already have an account? Login"}
                  </button>
                  <button 
                    onClick={() => switchMode('choice')}
                    className="text-[10px] font-black text-gray-300 hover:text-gray-500 transition-colors uppercase tracking-widest"
                  >
                    Back to Selection
                  </button>
                </div>
              )}
            </div>
          </>
        )}

      </div>
      
      {/* Formal Footer */}
      <div className="absolute bottom-6 flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white">
            AiLuv Project v0.5 Beta • Exclusive Beta Test
        </span>
        <span className="text-[9px] font-medium text-gray-400 flex items-center gap-1">
            Developed by <span className="font-bold text-pink-400">InSide Studio</span> © {new Date().getFullYear()}. All Rights Reserved.
        </span>
      </div>
    </div>
  );
};

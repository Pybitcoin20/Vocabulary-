import React, { useState } from 'react';
import { User as UserType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, LogIn, UserPlus, Eye, EyeOff, Sparkles, AlertCircle, Check, Mail } from 'lucide-react';

interface AuthProps {
  onLoginSuccess: (user: UserType) => void;
}

const AVATAR_PRESETS = [
  '🧠', '🚀', '🎨', '💻', '📚', '🌍', '⭐', '🔥', '🎯', '💡', '🏆', '🎭'
];

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Validate credentials
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const normalizedUsername = username.trim().toLowerCase().replace(/^@/, '');
    const trimmedPassword = password.trim();
    
    if (!normalizedUsername || !trimmedPassword) {
      setError("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }

    if (normalizedUsername.length < 3) {
      setError("Foydalanuvchi nomi kamida 3 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    // Get existing users database from localStorage
    const storedUsersRaw = localStorage.getItem('yodlash_users_db');
    let usersDb: UserType[] = [];
    if (storedUsersRaw) {
      try {
        usersDb = JSON.parse(storedUsersRaw);
      } catch (e) {
        usersDb = [];
      }
    }

    // If usersDb is empty, seed default users immediately to avoid any first-render race condition
    if (usersDb.length === 0) {
      usersDb = [
        {
          id: 'u_demo',
          username: 'demo',
          email: 'demo@example.com',
          fullName: 'Demo Foydalanuvchi',
          avatar: '🧠',
          createdAt: new Date().toISOString(),
          passwordHash: 'demo123'
        },
        {
          id: 'u_sardor',
          username: 'sardor_bek',
          email: 'sardor@example.com',
          fullName: 'Sardor Rustamov',
          avatar: '🧠',
          createdAt: new Date().toISOString(),
          passwordHash: 'sardor123'
        },
        {
          id: 'u_noila',
          username: 'noila_99',
          email: 'noila@example.com',
          fullName: 'Noila Karimova',
          avatar: '📚',
          createdAt: new Date().toISOString(),
          passwordHash: 'noila123'
        }
      ];
      localStorage.setItem('yodlash_users_db', JSON.stringify(usersDb));
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setError("Iltimos, ismingizni kiriting.");
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError("Iltimos, to'g'ri e-pochta manzilini kiriting.");
        return;
      }
      if (trimmedPassword.length < 5) {
        setError("Parol kamida 5 ta belgidan iborat bo'lishi kerak.");
        return;
      }
      if (trimmedPassword !== confirmPassword.trim()) {
        setError("Kiritilgan parollar bir-biriga mos kelmadi.");
        return;
      }

      // Check if username is already taken (case-insensitive)
      const usernameExists = usersDb.some(u => (u.username || '').toLowerCase() === normalizedUsername);
      if (usernameExists) {
        setError("Ushbu foydalanuvchi nomi band. Boshqa nom tanlang.");
        return;
      }

      // Check if email is already taken (case-insensitive)
      const emailExists = usersDb.some(u => u.email && u.email.toLowerCase() === email.trim().toLowerCase());
      if (emailExists) {
        setError("Ushbu e-pochta manzili allaqachon ro'yxatdan o'tgan.");
        return;
      }

      // Register new user
      const isUserAdmin = email.trim().toLowerCase() === 'crazyaivodeos@gmail.com';
      const newUser: UserType = {
        id: `u_${Date.now()}`,
        username: normalizedUsername,
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        avatar: selectedAvatar,
        createdAt: new Date().toISOString(),
        passwordHash: trimmedPassword,
        role: isUserAdmin ? 'admin' : 'user',
      };

      const updatedUsersDb = [...usersDb, newUser];
      localStorage.setItem('yodlash_users_db', JSON.stringify(updatedUsersDb));

      setSuccess("Muvaffaqiyatli ro'yxatdan o'tdingiz! Tizimga kirishingiz mumkin.");
      
      // Auto-switch to login or auto-login
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 1000);

    } else {
      // Login flow - allows login via username or email, case-insensitive
      const user = usersDb.find(u => {
        const uUsername = (u.username || '').toLowerCase();
        const uEmail = (u.email || '').toLowerCase();
        const uPassword = (u.passwordHash || '').trim();
        return (uUsername === normalizedUsername || uEmail === normalizedUsername) && uPassword === trimmedPassword;
      });
      
      if (!user) {
        setError("Foydalanuvchi nomi, e-pochta yoki parol noto'g'ri.");
        return;
      }

      if (user.isBlocked) {
        setError("Ushbu hisob admin tomonidan bloklangan!");
        return;
      }

      // Successful login
      setSuccess("Xush kelibsiz!");
      setTimeout(() => {
        onLoginSuccess(user);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      {/* Decorative dynamic ambient background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-200/20 dark:bg-violet-900/10 rounded-full filter blur-3xl pointer-events-none"></div>

      {/* Main card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl p-8 relative z-10"
        id="auth-card"
      >
        {/* Title area */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-100 dark:shadow-none mb-4">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2.5xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight" id="auth-title">
            {mode === 'login' ? "Lug'at Tizimiga Kirish" : "Yangi Profil Yaratish"}
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1.5" id="auth-subtitle">
            {mode === 'login' 
              ? "Lug'atingizni boshqarish va o'rganishni boshlang" 
              : "Shaxsiy so'z boyligingiz va statistikalaringizni yuriting"}
          </p>
        </div>

        {/* Feedback Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-start gap-2.5"
              id="auth-error-msg"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-start gap-2.5"
              id="auth-success-msg"
            >
              <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4" id="auth-form">
          {/* REGISTER EXTRA FIELDS: Full Name, Email, and Avatar Preset Selector */}
          {mode === 'register' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  To'liq ismingiz
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4.5 w-4.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masalan, Ali Valiyev"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 pl-11 pr-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100/50 dark:focus:ring-indigo-900/20 text-sm font-medium"
                    id="register-fullname"
                    required
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  E-pochta manzili (Email)
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4.5 w-4.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 pl-11 pr-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100/50 dark:focus:ring-indigo-900/20 text-sm font-medium"
                    id="register-email"
                    required
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Profil rasmi (Avatar)
                </label>
                
                {/* Visual Preview */}
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="w-14 h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {(selectedAvatar.startsWith('http') || selectedAvatar.startsWith('data:image')) ? (
                      <img src={selectedAvatar} alt="Rasm" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-3xl">{selectedAvatar || '👤'}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 leading-normal">
                    <p className="font-bold text-slate-700 dark:text-slate-300">Avatar tanlandi</p>
                    <p>Quyidagi tayyor timsollardan birini bosing, o'z rasmingizni yuklang yoki havolasini qo'ying.</p>
                  </div>
                </div>

                {/* Grid of presets */}
                <div className="grid grid-cols-6 gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl max-h-24 overflow-y-auto">
                  {AVATAR_PRESETS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`text-2xl p-1.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                        selectedAvatar === av 
                          ? 'bg-white dark:bg-slate-800 border-2 border-indigo-500 shadow-xs scale-110' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>

                {/* File Upload & URL inputs */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer text-xs font-semibold text-slate-500 hover:text-indigo-600">
                      <span>Fayldan rasm yuklash</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setSelectedAvatar(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden" 
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={selectedAvatar.startsWith('data:') ? '' : selectedAvatar}
                    onChange={(e) => {
                      if (e.target.value.trim()) {
                        setSelectedAvatar(e.target.value.trim());
                      }
                    }}
                    placeholder="Rasm havolasi (URL): https://example.com/rasm.jpg"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-4 py-2.5 text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-xs font-medium"
                  />
                </div>
              </div>
            </>
          )}

          {/* Username / Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {mode === 'login' ? "Foydalanuvchi nomi yoki E-pochta" : "Foydalanuvchi nomi (Username)"}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === 'login' ? "username yoki email@mail.com" : "foydalanuvchi_nomi"}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 pl-11 pr-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100/50 dark:focus:ring-indigo-900/20 text-sm font-medium"
                id="auth-username"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Parol
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4.5 w-4.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 pl-11 pr-11 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100/50 dark:focus:ring-indigo-900/20 text-sm font-medium"
                id="auth-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD FOR REGISTRATION */}
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Parolni tasdiqlash
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4.5 w-4.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 pl-11 pr-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100/50 dark:focus:ring-indigo-900/20 text-sm font-medium"
                  id="register-confirm-password"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 active:scale-[0.98] transition-all py-3.5 mt-2 font-bold text-sm text-white cursor-pointer shadow-md hover:shadow-lg"
            id="auth-submit-btn"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="h-4.5 w-4.5" />
                Kiritish (Log In)
              </>
            ) : (
              <>
                <UserPlus className="h-4.5 w-4.5" />
                Ro'yxatdan o'tish
              </>
            )}
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {mode === 'login' ? "Akkauntingiz yo'qmi?" : "Menda allaqachon akkaunt bor."}{' '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
                setSuccess('');
                setEmail('');
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold underline transition-all cursor-pointer bg-transparent border-none"
              id="auth-toggle-mode"
            >
              {mode === 'login' ? "Yangi hisob yaratish" : "Tizimga kirish"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

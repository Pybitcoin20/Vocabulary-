import React, { useState } from 'react';
import { User, Word, TestHistory, StudyStats } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, Lock, Shield, Edit3, Check, Save, 
  Calendar, Award, Flame, BookOpen, CheckCircle2, TrendingUp, Sparkles, AlertCircle, Mail
} from 'lucide-react';

interface UserProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  words: Word[];
  history: TestHistory[];
  stats: StudyStats;
}

const AVATAR_PRESETS = [
  '🧠', '🚀', '🎨', '💻', '📚', '🌍', '⭐', '🔥', '🎯', '💡', '🏆', '🎭'
];

export default function UserProfile({ user, onUpdateUser, words, history, stats }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  
  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Save profile edits (fullname and avatar)
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim()) {
      setError("Ism-sharif maydoni bo'sh bo'lishi mumkin emas.");
      return;
    }

    if (email.trim() && !email.trim().includes('@')) {
      setError("Iltimos, to'g'ri e-pochta manzilini kiriting.");
      return;
    }

    const updatedUser: User = {
      ...user,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      avatar: selectedAvatar
    };

    onUpdateUser(updatedUser);
    setIsEditing(false);
    setSuccess("Profil ma'lumotlari muvaffaqiyatli yangilandi!");
    
    setTimeout(() => setSuccess(''), 3000);
  };

  // Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("Iltimos, parolni o'zgartirish uchun barcha maydonlarni to'ldiring.");
      return;
    }

    if (currentPassword !== user.passwordHash) {
      setError("Hozirgi parol noto'g'ri kiritildi.");
      return;
    }

    if (newPassword.length < 5) {
      setError("Yangi parol kamida 5 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Yangi parollar mos kelmadi.");
      return;
    }

    const updatedUser: User = {
      ...user,
      passwordHash: newPassword
    };

    onUpdateUser(updatedUser);
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setSuccess("Parolingiz muvaffaqiyatli yangilandi!");

    setTimeout(() => setSuccess(''), 3000);
  };

  const masteredPercentage = stats.totalWords > 0 
    ? Math.round((stats.masteredCount / stats.totalWords) * 100) 
    : 0;

  return (
    <div className="space-y-8" id="profile-view-container">
      {/* Messages */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-450 text-xs font-semibold flex items-start gap-2.5 shadow-xs"
            id="profile-error-banner"
          >
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-450 text-xs font-semibold flex items-start gap-2.5 shadow-xs"
            id="profile-success-banner"
          >
            <Check className="h-4.5 w-4.5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: User Card & Personal Settings */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Main profile identity card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm relative overflow-hidden"
            id="profile-identity-card"
          >
            <div className="absolute right-0 top-0 -mr-12 -mt-12 h-36 w-36 rounded-full bg-indigo-50/50 dark:bg-indigo-950/10 blur-2xl pointer-events-none"></div>
            
            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full shadow-inner select-none transition-transform hover:scale-105 duration-200 flex items-center justify-center overflow-hidden">
                {(user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:image'))) ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-5xl">{user.avatar || '👤'}</span>
                )}
              </div>
              
              <h3 className="mt-5 text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                {user.fullName}
              </h3>
              
              <div className="mt-1 flex flex-col items-center gap-1">
                <span className="px-3 py-1 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100/30 dark:border-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold rounded-full">
                  @{user.username}
                </span>
                {user.email && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {user.email}
                  </span>
                )}
              </div>

              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                <Calendar className="h-3.5 w-3.5" />
                Ro'yxatdan o'tilgan sana: {new Date(user.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100/80 dark:border-slate-800 flex flex-col gap-2.5">
              {!isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setFullName(user.fullName);
                    setEmail(user.email || '');
                    setSelectedAvatar(user.avatar);
                    setIsChangingPassword(false);
                  }}
                  className="w-full inline-flex justify-center items-center gap-2 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white py-3 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                  id="profile-edit-trigger"
                >
                  <Edit3 className="h-4 w-4" />
                  Profilni tahrirlash
                </button>
              )}

              {!isChangingPassword && (
                <button
                  onClick={() => {
                    setIsChangingPassword(true);
                    setIsEditing(false);
                  }}
                  className="w-full inline-flex justify-center items-center gap-2 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-3 text-xs font-bold transition-all border border-slate-100 dark:border-slate-800 cursor-pointer active:scale-[0.98]"
                  id="profile-pwd-trigger"
                >
                  <Lock className="h-4 w-4" />
                  Parolni o'zgartirish
                </button>
              )}
            </div>
          </motion.div>

          {/* EDIT FORM VIEW */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-3xl border border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm overflow-hidden"
                id="profile-edit-form-container"
              >
                <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
                  Ma'lumotlarni o'zgartirish
                </h4>

                <form onSubmit={handleSaveProfile} className="space-y-4 mt-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      To'liq ism-sharif
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Masalan, Ali Valiyev"
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 pl-11 pr-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100/30 dark:focus:ring-indigo-900/10 text-xs font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      E-pochta manzili (Email)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@mail.com"
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 pl-11 pr-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100/30 dark:focus:ring-indigo-900/10 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Profil rasmi (Avatar)
                    </label>

                    {/* Real-time Preview */}
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-850">
                      <div className="w-12 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {(selectedAvatar && (selectedAvatar.startsWith('http') || selectedAvatar.startsWith('data:image'))) ? (
                          <img src={selectedAvatar} alt="Rasm" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-2xl">{selectedAvatar || '👤'}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                        <p className="font-bold text-slate-700 dark:text-slate-300">Yangi rasm ko'rinishi</p>
                        <p>Fayl yuklang yoki havolasini qo'ying.</p>
                      </div>
                    </div>

                    {/* Presets Grid */}
                    <div className="grid grid-cols-6 gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-2 rounded-2xl max-h-24 overflow-y-auto">
                      {AVATAR_PRESETS.map((av) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setSelectedAvatar(av)}
                          className={`text-xl p-1 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                            selectedAvatar === av 
                              ? 'bg-white dark:bg-slate-800 border-2 border-indigo-500 dark:border-indigo-400 shadow-xs scale-105' 
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>

                    {/* Custom Image File Upload & Image URL */}
                    <div className="space-y-1.5">
                      <label className="flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-2 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer text-[11px] font-semibold text-slate-500 hover:text-indigo-500">
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
                      <input
                        type="text"
                        value={selectedAvatar.startsWith('data:') ? '' : selectedAvatar}
                        onChange={(e) => {
                          if (e.target.value.trim()) {
                            setSelectedAvatar(e.target.value.trim());
                          }
                        }}
                        placeholder="Yoki rasm havolasi (URL): https://..."
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 inline-flex justify-center items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Saqlash
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 inline-flex justify-center items-center rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 py-2.5 text-xs font-bold transition-all cursor-pointer"
                    >
                      Bekor qilish
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CHANGE PASSWORD VIEW */}
          <AnimatePresence>
            {isChangingPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-3xl border border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm overflow-hidden"
                id="profile-pwd-form-container"
              >
                <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Shield className="h-4.5 w-4.5 text-indigo-500" />
                  Xavfsiz parolni o'rnatish
                </h4>

                <form onSubmit={handleChangePassword} className="space-y-3.5 mt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Hozirgi parol
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100/30 dark:focus:ring-indigo-900/10 text-xs font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Yangi parol
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Kamida 5 ta belgi"
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100/30 dark:focus:ring-indigo-900/10 text-xs font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Yangi parolni tasdiqlash
                    </label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100/30 dark:focus:ring-indigo-900/10 text-xs font-medium"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 inline-flex justify-center items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      O'zgartirish
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmNewPassword('');
                      }}
                      className="flex-1 inline-flex justify-center items-center rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 py-2.5 text-xs font-bold transition-all cursor-pointer"
                    >
                      Bekor qilish
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Column: User statistics breakdown */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Metric Card 1 */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
              <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 p-3.5 text-indigo-600 dark:text-indigo-400 shadow-xs">
                <BookOpen className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lug'at hajmi</p>
                <h3 className="text-2.5xl font-extrabold text-slate-800 dark:text-slate-100 font-mono tracking-tight">{stats.totalWords} ta</h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">so'zlar bazasi</span>
              </div>
            </div>

            {/* Metric Card 2 */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 p-3.5 text-emerald-600 dark:text-emerald-450 shadow-xs">
                <CheckCircle2 className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Yodlangan so'zlar</p>
                <h3 className="text-2.5xl font-extrabold text-slate-800 dark:text-slate-100 font-mono tracking-tight">{stats.masteredCount} ta</h3>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-md">{masteredPercentage}% yutuq</span>
              </div>
            </div>

            {/* Metric Card 3 */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 p-3.5 text-amber-500 dark:text-amber-440 shadow-xs">
                <Flame className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Muntazamlik zanjiri</p>
                <h3 className="text-2.5xl font-extrabold text-slate-800 dark:text-slate-100 font-mono tracking-tight">{stats.streakDays} kun</h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">to'xtovsiz o'rganish</span>
              </div>
            </div>

          </div>

          {/* Test Performance Bento Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Quiz performance circle */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between" id="profile-quiz-stats-bento">
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">O'rtacha muvaffaqiyat</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Topshirilgan testlar bo'yicha ko'rsatkichlar</p>
              </div>

              <div className="my-6 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <svg className="h-32 w-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      className="stroke-slate-50 dark:stroke-slate-800"
                      strokeWidth="9"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="54"
                      className="stroke-indigo-600"
                      strokeWidth="9"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 54}
                      initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - stats.averageScore / 100) }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2.5xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">{stats.averageScore}%</span>
                    <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mt-0.5">O'rtacha ball</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-50 dark:border-slate-800 pt-4 flex justify-between text-center text-xs">
                <div className="flex-1">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Jami urunishlar</span>
                  <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300 mt-0.5 inline-block">{stats.totalTestsTaken} ta test</span>
                </div>
                <div className="border-r border-slate-100 dark:border-slate-800"></div>
                <div className="flex-1">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">O'zlashtirish</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-450 mt-0.5 inline-block">{stats.masteredCount} ta so'z</span>
                </div>
              </div>
            </div>

            {/* General Profile Motivation Card */}
            <div className="rounded-3xl border border-transparent dark:border-slate-850 bg-gradient-to-tr from-slate-900 to-indigo-950 dark:from-slate-950 dark:to-indigo-950/80 p-6 shadow-sm text-white flex flex-col justify-between" id="profile-quote-bento">
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-200">
                  <Award className="h-3 w-3 text-yellow-400" />
                  Muvaffaqiyat yo'lida
                </span>
                
                <h4 className="mt-4 text-xl font-serif italic text-indigo-100 leading-snug">
                  "Yangi tilni o'rganish — o'z dunyosini yana bir bor kashf etish demakdir."
                </h4>
              </div>

              <div className="mt-8 relative z-10">
                <p className="text-xs text-slate-300">
                  Sizning muntazam shug'ullanishingiz til o'rganishdagi eng katta poydevordir. Bugun <b className="text-indigo-300 font-semibold">{words.filter(w => w.status === 'learning').length} ta</b> so'zni mukammal yodlash imkoniga egasiz!
                </p>
                
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                  <span>Oxirgi faollik:</span>
                  <span className="text-slate-300 font-bold">
                    {stats.lastStudyDate 
                      ? new Date(stats.lastStudyDate).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                      : 'Mavjud emas'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Detailed test history table */}
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm" id="profile-detailed-history">
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">Barcha topshirilgan testlar tarixi</h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 mb-4">Ushbu foydalanuvchining sinov tarixi va natijalari</p>

            {history.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                Hech qanday test topshirilmagan
              </div>
            ) : (
              <div>
                {/* Desktop and Tablet view (table) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
                        <th className="py-3 px-4">Test Turi</th>
                        <th className="py-3 px-4">Guruh (Kategoriya)</th>
                        <th className="py-3 px-4">Sana</th>
                        <th className="py-3 px-4">To'g'ri javoblar</th>
                        <th className="py-3 px-4 text-right">Ball</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-50/50 dark:divide-slate-800/30">
                      {history.slice().reverse().map((h) => (
                        <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                            {h.mode === 'multiple_choice' ? "Variantli test" : h.mode === 'spelling' ? "Yozma test" : "Kartochkalar"}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 font-semibold">
                              {h.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500 font-medium">
                            {new Date(h.date).toLocaleDateString('uz-UZ')} {new Date(h.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                            {h.score / 10} / {h.totalQuestions} ta
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 font-bold ${
                              h.score >= 80 
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/50' 
                                : h.score >= 50 
                                  ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-450 border border-amber-100 dark:border-amber-900/50' 
                                  : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border border-rose-100 dark:border-rose-900/50'
                            }`}>
                              {h.score}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile view (cards) */}
                <div className="block sm:hidden space-y-3" id="profile-history-cards">
                  {history.slice().reverse().map((h) => (
                    <div key={h.id} className="rounded-2xl p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
                          {h.mode === 'multiple_choice' ? "Variantli test" : h.mode === 'spelling' ? "Yozma test" : "Kartochkalar"}
                        </span>
                        <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-black ${
                          h.score >= 80 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50' 
                            : h.score >= 50 
                              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50' 
                              : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border border-rose-100 dark:border-rose-900/50'
                        }`}>
                          {h.score}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Guruh:</span>
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-350">
                            {h.category}
                          </span>
                        </div>
                        <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          {h.score / 10} / {h.totalQuestions} ta javob
                        </div>
                      </div>

                      <div className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                        {new Date(h.date).toLocaleDateString('uz-UZ')} {new Date(h.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

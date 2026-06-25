import React, { useState, useMemo } from 'react';
import { User, Word, TestHistory } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Mail, User as UserIcon, Calendar, Trophy, Award, Flame, 
  BookOpen, Eye, Trash2, Shield, ShieldCheck, ShieldAlert, Sparkles, X, 
  ArrowLeft, CheckCircle2, ChevronRight, Activity, RotateCcw, Lock, Unlock,
  Layers, AlertCircle, Sparkle, Star
} from 'lucide-react';

interface UsersListProps {
  currentUser: User;
  onUpdateCurrentUser: (updatedUser: User) => void;
}

export default function UsersList({ currentUser, onUpdateCurrentUser }: UsersListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'blocked'>('all');
  
  // Tab within selected user's profile
  const [profileTab, setProfileTab] = useState<'stats' | 'vocabulary' | 'history'>('stats');
  const [vocabSearch, setVocabSearch] = useState('');

  // Alerts & Notifications
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Load all users from DB
  const usersList = useMemo(() => {
    const storedUsersRaw = localStorage.getItem('yodlash_users_db');
    let users: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

    // Ensure crazyaivodeos@gmail.com is ALWAYS flagged as admin
    users = users.map(u => {
      if (u.email && u.email.toLowerCase() === 'crazyaivodeos@gmail.com') {
        return { ...u, role: 'admin' as const };
      }
      return u;
    });

    return users;
  }, [currentUser, alertMsg]);

  // Handle selected user live sync
  const currentSelectedUserSynced = useMemo(() => {
    if (!selectedUser) return null;
    return usersList.find(u => u.id === selectedUser.id) || selectedUser;
  }, [selectedUser, usersList]);

  // Handle user details calculations
  const userDetails = useMemo(() => {
    const activeUser = currentSelectedUserSynced;
    if (!activeUser) return null;

    const userId = activeUser.id;
    const wordsRaw = localStorage.getItem(`yodlash_words_${userId}`);
    const historyRaw = localStorage.getItem(`yodlash_history_${userId}`);
    const streakRaw = localStorage.getItem(`yodlash_streak_${userId}`);

    const words: Word[] = wordsRaw ? JSON.parse(wordsRaw) : [];
    const history: TestHistory[] = historyRaw ? JSON.parse(historyRaw) : [];
    const streakDays = streakRaw ? parseInt(streakRaw, 10) : 0;

    const totalWords = words.length;
    const masteredCount = words.filter(w => w.status === 'mastered').length;
    const learningCount = totalWords - masteredCount;
    
    const totalScore = history.reduce((sum, h) => sum + h.score, 0);
    const averageScore = history.length > 0 ? Math.round(totalScore / history.length) : 0;

    // Rating / XP calculation
    const xp = (masteredCount * 20) + (totalWords * 5) + (streakDays * 30) + (history.length * 15) + (averageScore * 2);

    return {
      words,
      history,
      streakDays,
      totalWords,
      masteredCount,
      learningCount,
      averageScore,
      xp
    };
  }, [currentSelectedUserSynced]);

  // Filter users based on query and role
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchQuery = 
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const isUserAdmin = u.email && u.email.toLowerCase() === 'crazyaivodeos@gmail.com' || u.role === 'admin';
      const isBlocked = !!u.isBlocked;

      const matchRole = 
        roleFilter === 'all' ||
        (roleFilter === 'admin' && isUserAdmin) ||
        (roleFilter === 'user' && !isUserAdmin && !isBlocked) ||
        (roleFilter === 'blocked' && isBlocked);

      return matchQuery && matchRole;
    });
  }, [usersList, searchQuery, roleFilter]);

  // Selected User Vocabulary Search
  const filteredVocab = useMemo(() => {
    if (!userDetails) return [];
    return userDetails.words.filter(w => 
      w.original.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      w.translation.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      (w.category && w.category.toLowerCase().includes(vocabSearch.toLowerCase()))
    );
  }, [userDetails, vocabSearch]);

  // Administrative Action: Toggle Admin Role
  const handleToggleAdmin = (targetUser: User) => {
    const storedUsersRaw = localStorage.getItem('yodlash_users_db');
    if (!storedUsersRaw) return;

    try {
      const users: User[] = JSON.parse(storedUsersRaw);
      const updatedUsers = users.map(u => {
        if (u.id === targetUser.id) {
          const isCurrentlyAdmin = u.role === 'admin' || u.email?.toLowerCase() === 'crazyaivodeos@gmail.com';
          return { ...u, role: isCurrentlyAdmin ? ('user' as const) : ('admin' as const) };
        }
        return u;
      });

      localStorage.setItem('yodlash_users_db', JSON.stringify(updatedUsers));
      
      // Notify
      const userToUpdate = updatedUsers.find(u => u.id === targetUser.id);
      showAlert(
        `"${targetUser.fullName}" unvoni muvaffaqiyatli o'zgartirildi: ${
          userToUpdate?.role === 'admin' ? "Administrator" : "Foydalanuvchi"
        }`, 
        'success'
      );

      // If updating current user
      if (targetUser.id === currentUser.id) {
        const updatedCurrentUser = { 
          ...currentUser, 
          role: (currentUser.role === 'admin' || currentUser.email?.toLowerCase() === 'crazyaivodeos@gmail.com') ? 'user' : 'admin' 
        } as User;
        onUpdateCurrentUser(updatedCurrentUser);
      }
    } catch (e) {
      showAlert("Xatolik yuz berdi", "error");
    }
  };

  // Administrative Action: Toggle Block Status
  const handleToggleBlock = (targetUser: User) => {
    if (targetUser.email && targetUser.email.toLowerCase() === 'crazyaivodeos@gmail.com') {
      showAlert("Asosiy admin hisobini bloklash mumkin emas!", "error");
      return;
    }

    const isCurrentBlocked = !!targetUser.isBlocked;
    const confirmMessage = isCurrentBlocked
      ? `Haqiqatan ham ${targetUser.fullName} foydalanuvchisini blokdan chiqarmoqchimisiz?`
      : `Haqiqatan ham ${targetUser.fullName} foydalanuvchisini tizimdan bloklamoqchimisiz? Bloklangan foydalanuvchi tizimga kira olmaydi.`;

    if (!window.confirm(confirmMessage)) return;

    const storedUsersRaw = localStorage.getItem('yodlash_users_db');
    if (!storedUsersRaw) return;

    try {
      const users: User[] = JSON.parse(storedUsersRaw);
      const updatedUsers = users.map(u => {
        if (u.id === targetUser.id) {
          return { ...u, isBlocked: !isCurrentBlocked };
        }
        return u;
      });

      localStorage.setItem('yodlash_users_db', JSON.stringify(updatedUsers));
      showAlert(
        `"${targetUser.fullName}" ${isCurrentBlocked ? "blokdan chiqarildi" : "bloklandi"}!`, 
        'success'
      );

      // Sync active user currently viewed if it is blocked/unblocked
      if (selectedUser && selectedUser.id === targetUser.id) {
        setSelectedUser(prev => prev ? { ...prev, isBlocked: !isCurrentBlocked } : null);
      }
    } catch (e) {
      showAlert("Bloklashda xatolik yuz berdi", "error");
    }
  };

  // Administrative Action: Reset Stats
  const handleResetUserStats = (targetUser: User) => {
    if (!window.confirm(`⚠️ DIQQAT! ${targetUser.fullName} foydalanuvchisining barcha so'zlari, yodlash ko'rsatkichlari va testlar tarixini butunlay nolga tushirmoqchimisiz? Bu amalni qaytarib bo'lmaydi!`)) {
      return;
    }

    const userId = targetUser.id;
    localStorage.removeItem(`yodlash_history_${userId}`);
    localStorage.removeItem(`yodlash_streak_${userId}`);
    localStorage.removeItem(`yodlash_last_study_${userId}`);
    
    // Clear streak from words
    const wordsRaw = localStorage.getItem(`yodlash_words_${userId}`);
    if (wordsRaw) {
      try {
        const words: Word[] = JSON.parse(wordsRaw);
        const resetWords = words.map(w => ({
          ...w,
          correctStreak: 0,
          status: 'learning' as const
        }));
        localStorage.setItem(`yodlash_words_${userId}`, JSON.stringify(resetWords));
      } catch (e) {
        console.error(e);
      }
    }

    // Force React sync update
    showAlert("Foydalanuvchi statistikasi muvaffaqiyatli tozalandi!", "success");
    setSelectedUser(prev => prev ? { ...prev } : null);
  };

  // Administrative Action: Delete User Entirely
  const handleDeleteUser = (targetUser: User) => {
    if (targetUser.email && targetUser.email.toLowerCase() === 'crazyaivodeos@gmail.com') {
      showAlert("Asosiy Admin foydalanuvchini tizimdan o'chirib bo'lmaydi!", "error");
      return;
    }

    if (!window.confirm(`❌ DIQQAT! Haqiqatan ham ${targetUser.fullName} (@${targetUser.username}) foydalanuvchisini BUTUNLAY tizimdan o'chirmoqchimisiz? Barcha ma'lumotlar o'chib ketadi!`)) {
      return;
    }

    const storedUsersRaw = localStorage.getItem('yodlash_users_db');
    if (!storedUsersRaw) return;

    try {
      const users: User[] = JSON.parse(storedUsersRaw);
      const updatedUsers = users.filter(u => u.id !== targetUser.id);
      localStorage.setItem('yodlash_users_db', JSON.stringify(updatedUsers));

      // Clean up user localstorage files
      localStorage.removeItem(`yodlash_words_${targetUser.id}`);
      localStorage.removeItem(`yodlash_categories_${targetUser.id}`);
      localStorage.removeItem(`yodlash_history_${targetUser.id}`);
      localStorage.removeItem(`yodlash_streak_${targetUser.id}`);
      localStorage.removeItem(`yodlash_last_study_${targetUser.id}`);

      setSelectedUser(null);
      showAlert("Foydalanuvchi hisobi va ma'lumotlari butunlay tizimdan o'chirildi.", "success");
    } catch (e) {
      showAlert("O'chirishda xatolik yuz berdi", "error");
    }
  };

  const isCurrentUserAdmin = currentUser.email?.toLowerCase() === 'crazyaivodeos@gmail.com' || currentUser.role === 'admin';

  return (
    <div className="space-y-8 animate-fade-in" id="users-view">
      
      {/* Alert banner */}
      <AnimatePresence mode="wait">
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 shadow-md ${
              alertMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50 text-rose-800 dark:text-rose-400'
            }`}
          >
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{alertMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!selectedUser ? (
          /* ========================================== */
          /*         1. MAIN COMMUNITY DIRECTORY VIEW    */
          /* ========================================== */
          <motion.div
            key="directory-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Header and description */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1 text-[11px] font-bold uppercase text-indigo-700 dark:text-indigo-400">
                  <UserIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  Hamjamiyat ro'yxati
                </span>
                <h2 className="mt-2.5 text-3xl font-serif italic text-slate-900 dark:text-slate-100 leading-tight">
                  A'zolar va Foydalanuvchilar
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-xl">
                  Barcha o'quvchilarning lug'at va test statistikasini kuzating. Admin sifatda accounts boshqaruv paneli orqali hisoblarni bloklashingiz yoki o'chirishingiz mumkin.
                </p>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Qidirish (ism, username, email)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50 dark:focus:ring-indigo-950/20"
                    id="users-search-input"
                  />
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800 overflow-x-auto max-w-full">
                  <button
                    onClick={() => setRoleFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      roleFilter === 'all'
                        ? 'bg-white dark:bg-slate-850 text-indigo-700 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-850'
                    }`}
                  >
                    Hammasi
                  </button>
                  <button
                    onClick={() => setRoleFilter('admin')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      roleFilter === 'admin'
                        ? 'bg-white dark:bg-slate-850 text-indigo-700 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-850'
                    }`}
                  >
                    Adminlar
                  </button>
                  <button
                    onClick={() => setRoleFilter('user')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      roleFilter === 'user'
                        ? 'bg-white dark:bg-slate-850 text-indigo-700 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-850'
                    }`}
                  >
                    Foydalanuvchilar
                  </button>
                  {isCurrentUserAdmin && (
                    <button
                      onClick={() => setRoleFilter('blocked')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                        roleFilter === 'blocked'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                      }`}
                    >
                      Bloklanganlar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Grid of Users */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="users-grid">
              {filteredUsers.map((u) => {
                const isTargetAdmin = u.email?.toLowerCase() === 'crazyaivodeos@gmail.com' || u.role === 'admin';
                const isMe = u.id === currentUser.id;
                const isBlocked = !!u.isBlocked;

                // Fetch statistics for small card representation
                const userWordsRaw = localStorage.getItem(`yodlash_words_${u.id}`);
                const parsedWords: Word[] = userWordsRaw ? JSON.parse(userWordsRaw) : [];
                const userStreakRaw = localStorage.getItem(`yodlash_streak_${u.id}`);
                const streak = userStreakRaw ? parseInt(userStreakRaw, 10) : 0;

                return (
                  <motion.div
                    key={u.id}
                    whileHover={{ y: -4 }}
                    onClick={() => {
                      setSelectedUser(u);
                      setProfileTab('stats');
                      setVocabSearch('');
                    }}
                    className={`group cursor-pointer rounded-3xl border p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden ${
                      isBlocked
                        ? 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-200/65 dark:border-rose-900/30'
                        : 'bg-white dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/30'
                    }`}
                  >
                    {/* Me badge */}
                    {isMe && (
                      <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-bl-xl">
                        Siz
                      </div>
                    )}

                    {/* Blocked watermark / status header */}
                    {isBlocked && (
                      <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-bl-xl flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5" />
                        Bloklangan
                      </div>
                    )}

                    {/* User Identity Row */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 rounded-2xl group-hover:scale-105 transition-transform duration-200 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 dark:border-slate-850">
                        {(u.avatar && (u.avatar.startsWith('http') || u.avatar.startsWith('data:image'))) ? (
                          <img src={u.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-3xl select-none">{u.avatar || '👤'}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-serif italic text-base text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                          {u.fullName}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                            @{u.username}
                          </span>
                          {isTargetAdmin && (
                            <span className="inline-flex items-center gap-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 px-1.5 py-0.5 text-[9px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                              <Shield className="h-2.5 w-2.5" />
                              Admin
                            </span>
                          )}
                        </div>

                        {u.email && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {u.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats metrics line */}
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-850">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                          Lug'at boyligi
                        </span>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-indigo-500" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            {parsedWords.length} ta so'z
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                          Faollik (Streak)
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            {streak} kun
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer hover indicator */}
                    <div className="mt-5 flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-400 font-normal">
                        Qo'shilgan: {u.createdAt ? new Date(u.createdAt).toLocaleDateString('uz-UZ', { month: 'short', year: 'numeric' }) : 'Noma\'lum'}
                      </span>
                      <div className="text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <span>Batafsil</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <UserIcon className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-3">
                    Foydalanuvchilar topilmadi
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                    Qidiruv so'zini o'zgartirib ko'ring yoki boshqa filterlarni tanlab tekshiring.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* ========================================== */
          /*  2. DEDICATED FULL-PAGE USER PROFILE VIEW  */
          /* ========================================== */
          <motion.div
            key="profile-detail-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Back Button and Navigation Path */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-250/30 dark:border-slate-850">
              <button
                onClick={() => setSelectedUser(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" />
                A'zolar ro'yxatiga qaytish
              </button>

              <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5 pr-2">
                <span>Hamjamiyat</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-indigo-600 dark:text-indigo-400">@{currentSelectedUserSynced?.username} profili</span>
              </div>
            </div>

            {/* Bento Grid User Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT CARD: Profile Identity & Admin Action Controller */}
              <div className="space-y-6 lg:col-span-1">
                <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs relative overflow-hidden">
                  {/* Visual Background Accent */}
                  <div className={`absolute right-0 top-0 -mr-12 -mt-12 h-36 w-36 rounded-full blur-2xl pointer-events-none opacity-40 ${
                    currentSelectedUserSynced?.isBlocked ? 'bg-rose-500/20' : 'bg-indigo-500/20'
                  }`}></div>

                  {/* Profile Info block */}
                  <div className="flex flex-col items-center text-center mt-3">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-full shadow-inner select-none transition-transform hover:scale-105 duration-200 flex items-center justify-center overflow-hidden shrink-0">
                      {(currentSelectedUserSynced?.avatar && (currentSelectedUserSynced.avatar.startsWith('http') || currentSelectedUserSynced.avatar.startsWith('data:image'))) ? (
                        <img src={currentSelectedUserSynced.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-5xl">{currentSelectedUserSynced?.avatar || '👤'}</span>
                      )}
                    </div>

                    <h3 className="mt-5 text-2xl font-serif italic text-slate-900 dark:text-slate-100 leading-tight">
                      {currentSelectedUserSynced?.fullName}
                    </h3>

                    <div className="mt-1.5 flex flex-col items-center gap-1.5">
                      <span className="px-3 py-1 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100/30 dark:border-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold rounded-full">
                        @{currentSelectedUserSynced?.username}
                      </span>
                      {currentSelectedUserSynced?.email && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {currentSelectedUserSynced?.email}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {/* Role representation badge */}
                      {currentSelectedUserSynced?.role === 'admin' || currentSelectedUserSynced?.email?.toLowerCase() === 'crazyaivodeos@gmail.com' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 border border-slate-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          <UserIcon className="h-3.5 w-3.5" />
                          Foydalanuvchi
                        </span>
                      )}

                      {/* Blocked badge */}
                      {currentSelectedUserSynced?.isBlocked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                          <Lock className="h-3.5 w-3.5" />
                          Bloklangan
                        </span>
                      )}
                    </div>

                    <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-semibold">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      Ro'yxatdan o'tgan: {currentSelectedUserSynced?.createdAt ? new Date(currentSelectedUserSynced.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Noma\'lum'}
                    </p>
                  </div>
                </div>

                {/* ADMIN CONTROL PANEL: Fully loaded with actions */}
                {isCurrentUserAdmin && currentSelectedUserSynced && (
                  <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <Shield className="h-4 w-4 text-indigo-500" />
                      Admin boshqaruv paneli
                    </h4>

                    <div className="flex flex-col gap-2.5">
                      {/* Block/Unblock Button */}
                      <button
                        onClick={() => handleToggleBlock(currentSelectedUserSynced)}
                        className={`w-full inline-flex justify-center items-center gap-2 rounded-2xl py-3 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
                          currentSelectedUserSynced.isBlocked
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/20'
                        }`}
                        disabled={currentSelectedUserSynced.email?.toLowerCase() === 'crazyaivodeos@gmail.com'}
                      >
                        {currentSelectedUserSynced.isBlocked ? (
                          <>
                            <Unlock className="h-4 w-4" />
                            Blokdan chiqarish
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            Hisobni bloklash
                          </>
                        )}
                      </button>

                      {/* Admin Toggle button */}
                      <button
                        onClick={() => handleToggleAdmin(currentSelectedUserSynced)}
                        className={`w-full inline-flex justify-center items-center gap-2 rounded-2xl py-3 text-xs font-bold border transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
                          currentSelectedUserSynced.role === 'admin'
                            ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/10'
                        }`}
                        disabled={currentSelectedUserSynced.email?.toLowerCase() === 'crazyaivodeos@gmail.com'}
                      >
                        <ShieldAlert className="h-4 w-4" />
                        {currentSelectedUserSynced.role === 'admin' ? "Adminlikdan olish" : "Administrator qilish"}
                      </button>

                      {/* Reset stats button */}
                      <button
                        onClick={() => handleResetUserStats(currentSelectedUserSynced)}
                        className="w-full inline-flex justify-center items-center gap-2 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-900/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/10 py-3 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Natijalarni tozalash (Reset)
                      </button>

                      {/* Delete account button */}
                      {currentSelectedUserSynced.email?.toLowerCase() !== 'crazyaivodeos@gmail.com' && (
                        <button
                          onClick={() => handleDeleteUser(currentSelectedUserSynced)}
                          className="w-full inline-flex justify-center items-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white py-3 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                        >
                          <Trash2 className="h-4 w-4" />
                          Hisobni butunlay o'chirish
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT TABS CONTENT: Statistics, Vocabulary, History logs */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Visual Top Metrics Summary Row */}
                {userDetails && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/10 p-4.5 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">XP Darajasi</span>
                      <div className="flex items-center gap-2 mt-2">
                        <Sparkles className="h-5 w-5 text-indigo-500" />
                        <span className="text-xl font-black text-indigo-950 dark:text-slate-100">{userDetails.xp} XP</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/40 dark:border-emerald-900/10 p-4.5 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Yodlagan so'zlari</span>
                      <div className="flex items-center gap-2 mt-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span className="text-xl font-black text-slate-800 dark:text-slate-100">{userDetails.masteredCount} ta</span>
                      </div>
                    </div>

                    <div className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100/40 dark:border-orange-900/10 p-4.5 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Faollik (Streak)</span>
                      <div className="flex items-center gap-2 mt-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <span className="text-xl font-black text-slate-800 dark:text-slate-100">{userDetails.streakDays} kun</span>
                      </div>
                    </div>

                    <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/40 dark:border-amber-900/10 p-4.5 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">O'rtacha ball</span>
                      <div className="flex items-center gap-2 mt-2">
                        <Award className="h-5 w-5 text-amber-500" />
                        <span className="text-xl font-black text-slate-800 dark:text-slate-100">{userDetails.averageScore}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Secondary Navigation (Tabs list) */}
                <div className="border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xs space-y-6">
                  <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-250/20 dark:border-slate-850">
                    <button
                      onClick={() => setProfileTab('stats')}
                      className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        profileTab === 'stats'
                          ? 'bg-white dark:bg-slate-850 text-indigo-700 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                      }`}
                    >
                      Statistika va Grafika
                    </button>
                    <button
                      onClick={() => setProfileTab('vocabulary')}
                      className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        profileTab === 'vocabulary'
                          ? 'bg-white dark:bg-slate-850 text-indigo-700 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                      }`}
                    >
                      Lug'at boyligi ({userDetails?.totalWords || 0} ta)
                    </button>
                    <button
                      onClick={() => setProfileTab('history')}
                      className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        profileTab === 'history'
                          ? 'bg-white dark:bg-slate-850 text-indigo-700 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                      }`}
                    >
                      Test natijalari ({userDetails?.history.length || 0})
                    </button>
                  </div>

                  {/* ACTIVE TAB COMPONENT RENDERING */}
                  <AnimatePresence mode="wait">
                    
                    {/* SUB-TAB 1: STATISTICS & GRAPHS */}
                    {profileTab === 'stats' && userDetails && (
                      <motion.div
                        key="tab-stats"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* Breakdown status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-50/50 dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/85">
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Yodlash ko'rsatkichi</h5>
                            <div className="mt-4 flex items-end justify-between">
                              <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                                {userDetails.totalWords > 0 ? Math.round((userDetails.masteredCount / userDetails.totalWords) * 100) : 0}%
                              </span>
                              <span className="text-xs text-slate-450 dark:text-slate-500 font-semibold">
                                {userDetails.masteredCount} / {userDetails.totalWords} so'z yodlangan
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-150 dark:bg-slate-850 h-2.5 rounded-full mt-3 overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${userDetails.totalWords > 0 ? (userDetails.masteredCount / userDetails.totalWords) * 100 : 0}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="bg-slate-50/50 dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/85">
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">O'rganish bosqichi</h5>
                            <div className="mt-4 flex items-end justify-between">
                              <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                                {userDetails.totalWords > 0 ? Math.round((userDetails.learningCount / userDetails.totalWords) * 100) : 0}%
                              </span>
                              <span className="text-xs text-slate-450 dark:text-slate-500 font-semibold">
                                {userDetails.learningCount} ta so'z o'rganilmoqda
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-150 dark:bg-slate-850 h-2.5 rounded-full mt-3 overflow-hidden">
                              <div 
                                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${userDetails.totalWords > 0 ? (userDetails.learningCount / userDetails.totalWords) * 100 : 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Informative advice cards or levels achieved */}
                        <div className="p-5 bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-2xl relative overflow-hidden">
                          <div className="absolute right-0 bottom-0 translate-y-3 translate-x-3 opacity-10">
                            <Sparkle className="h-44 w-44" />
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                              <Star className="h-5 w-5 text-amber-300 fill-amber-300" />
                            </div>
                            <div>
                              <h5 className="font-bold text-sm">Bilim unvoni darajasi</h5>
                              <p className="text-[11px] text-indigo-200 mt-0.5">
                                {userDetails.xp >= 1000 ? "Eng yuqori toifadagi Poliglot" : userDetails.xp >= 500 ? "Bilimdon Tilshunos" : userDetails.xp >= 100 ? "Faol Izlanuvchi" : "Yangi Boshlovchi"}
                              </p>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-300 mt-4 leading-relaxed">
                            Ushbu o'quvchi o'zining shaxsiy lug'atidagi so'zlar bilan jadal shug'ullanib kelmoqda. O'zlashtirish va test natijalari foizi uning o'rganish faolligini belgilaydi.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* SUB-TAB 2: VOCABULARY LIST WITH INDEPENDENT SEARCH */}
                    {profileTab === 'vocabulary' && userDetails && (
                      <motion.div
                        key="tab-vocab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        {/* Word Search bar inside profile */}
                        <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
                          <input
                            type="text"
                            placeholder="Foydalanuvchi lug'atidan qidirish..."
                            value={vocabSearch}
                            onChange={(e) => setVocabSearch(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-850 dark:text-slate-100 outline-none focus:border-indigo-500 focus:bg-white"
                          />
                        </div>

                        {/* List block */}
                        <div className="border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto bg-slate-50/20">
                          {filteredVocab.map((w, index) => (
                            <div key={w.id || index} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                    {w.original}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-semibold">
                                    • {w.category}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {w.translation}
                                </p>
                                {w.example && (
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                                    Misol: "{w.example}"
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2.5 justify-between sm:justify-end">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  w.difficulty === 'easy'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                                    : w.difficulty === 'medium'
                                    ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                                    : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                                }`}>
                                  {w.difficulty === 'easy' ? "Oson" : w.difficulty === 'medium' ? "O'rtacha" : "Qiyin"}
                                </span>

                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                  w.status === 'mastered'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/10'
                                }`}>
                                  {w.status === 'mastered' ? "Yodlangan" : "O'rganmoqda"}
                                </span>
                              </div>
                            </div>
                          ))}

                          {filteredVocab.length === 0 && (
                            <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">
                              Hech qanday so'z topilmadi.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* SUB-TAB 3: TEST HISTORY LOGS */}
                    {profileTab === 'history' && userDetails && (
                      <motion.div
                        key="tab-history"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <div className="border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-[420px] overflow-y-auto">
                          {userDetails.history.map((h, index) => (
                            <div key={h.id || index} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h6 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                    {h.mode === 'multiple_choice' 
                                      ? "Variantli Test" 
                                      : h.mode === 'spelling' 
                                      ? "Yozma Test (Spelling)" 
                                      : "Kartochkalar (Flashcards)"
                                    }
                                  </h6>
                                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md font-medium">
                                    {h.category}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                  Topshirgan sanasi: {h.date ? new Date(h.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : 'Noma\'lum'}
                                </p>
                              </div>

                              <div className="text-right">
                                <span className={`text-sm font-black ${
                                  h.score >= 80 
                                    ? 'text-emerald-500' 
                                    : h.score >= 50 
                                    ? 'text-amber-500' 
                                    : 'text-rose-500'
                                }`}>
                                  {h.score}%
                                </span>
                                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                                  {h.totalQuestions} ta savoldan
                                </p>
                              </div>
                            </div>
                          ))}

                          {userDetails.history.length === 0 && (
                            <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">
                              Foydalanuvchi hali biron marta ham test topshirmagan.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

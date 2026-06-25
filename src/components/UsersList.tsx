import React, { useState, useMemo } from 'react';
import { User, Word, TestHistory } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Mail, User as UserIcon, Calendar, Trophy, Award, Flame, 
  BookOpen, Eye, Trash2, Shield, ShieldCheck, ShieldAlert, Sparkles, X, 
  ArrowRight, CheckCircle2, ChevronRight, Activity, RotateCcw
} from 'lucide-react';

interface UsersListProps {
  currentUser: User;
  onUpdateCurrentUser: (updatedUser: User) => void;
}

export default function UsersList({ currentUser, onUpdateCurrentUser }: UsersListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

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
  }, [currentUser]);

  // Handle user details calculations
  const userDetails = useMemo(() => {
    if (!selectedUser) return null;

    const userId = selectedUser.id;
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
  }, [selectedUser]);

  // Filter users based on query and role
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchQuery = 
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const isUserAdmin = u.email && u.email.toLowerCase() === 'crazyaivodeos@gmail.com' || u.role === 'admin';
      const matchRole = 
        roleFilter === 'all' ||
        (roleFilter === 'admin' && isUserAdmin) ||
        (roleFilter === 'user' && !isUserAdmin);

      return matchQuery && matchRole;
    });
  }, [usersList, searchQuery, roleFilter]);

  // Administrative Actions
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
      
      // Update selected user view
      if (selectedUser && selectedUser.id === targetUser.id) {
        setSelectedUser(prev => prev ? { 
          ...prev, 
          role: (prev.role === 'admin' || prev.email?.toLowerCase() === 'crazyaivodeos@gmail.com') ? 'user' : 'admin' 
        } : null);
      }

      // If updating current user
      if (targetUser.id === currentUser.id) {
        const updatedCurrentUser = { 
          ...currentUser, 
          role: (currentUser.role === 'admin' || currentUser.email?.toLowerCase() === 'crazyaivodeos@gmail.com') ? 'user' : 'admin' 
        } as User;
        onUpdateCurrentUser(updatedCurrentUser);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetUserStats = (targetUser: User) => {
    if (!window.confirm(`${targetUser.fullName} foydalanuvchisining barcha so'zlar statistikasi va testlar tarixini butunlay o'chirib yubormoqchimisiz?`)) {
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

    // Refresh detail calculations
    if (selectedUser && selectedUser.id === targetUser.id) {
      setSelectedUser({ ...selectedUser }); // trigger re-memo
    }
    alert("Foydalanuvchi ma'lumotlari muvaffaqiyatli tozalandi!");
  };

  const handleDeleteUser = (targetUser: User) => {
    if (targetUser.email && targetUser.email.toLowerCase() === 'crazyaivodeos@gmail.com') {
      alert("Asosiy Admin foydalanuvchini tizimdan o'chirib bo'lmaydi!");
      return;
    }

    if (!window.confirm(`Haqiqatan ham ${targetUser.fullName} (@${targetUser.username}) foydalanuvchisini butunlay tizimdan o'chirib tashlamoqchimisiz?`)) {
      return;
    }

    const storedUsersRaw = localStorage.getItem('yodlash_users_db');
    if (!storedUsersRaw) return;

    try {
      const users: User[] = JSON.parse(storedUsersRaw);
      const updatedUsers = users.filter(u => u.id !== targetUser.id);
      localStorage.setItem('yodlash_users_db', JSON.stringify(updatedUsers));

      // Clean up user files
      localStorage.removeItem(`yodlash_words_${targetUser.id}`);
      localStorage.removeItem(`yodlash_categories_${targetUser.id}`);
      localStorage.removeItem(`yodlash_history_${targetUser.id}`);
      localStorage.removeItem(`yodlash_streak_${targetUser.id}`);
      localStorage.removeItem(`yodlash_last_study_${targetUser.id}`);

      setSelectedUser(null);
      alert("Foydalanuvchi tizimdan butunlay o'chirildi.");
    } catch (e) {
      console.error(e);
    }
  };

  const isCurrentUserAdmin = currentUser.email?.toLowerCase() === 'crazyaivodeos@gmail.com' || currentUser.role === 'admin';

  return (
    <div className="space-y-8 animate-fade-in" id="users-view">
      {/* Header and description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1 text-[11px] font-bold uppercase text-indigo-700 dark:text-indigo-400">
            <UserIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            Foydalanuvchilar Ro'yxati
          </span>
          <h2 className="mt-2.5 text-3xl font-serif italic text-slate-900 dark:text-slate-100 leading-tight">
            Hamjamiyat va Foydalanuvchilar
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-xl">
            Tizimdagi barcha foydalanuvchilarning natijalarini ko'ring, ularning lug'at boyligi hamda erishgan marralarini kuzatib boring.
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

          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                roleFilter === 'all'
                  ? 'bg-white dark:bg-slate-850 text-indigo-700 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-850'
              }`}
            >
              Hammasi
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                roleFilter === 'admin'
                  ? 'bg-white dark:bg-slate-850 text-indigo-700 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-850'
              }`}
            >
              Adminlar
            </button>
            <button
              onClick={() => setRoleFilter('user')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                roleFilter === 'user'
                  ? 'bg-white dark:bg-slate-850 text-indigo-700 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-850'
              }`}
            >
              Foydalanuvchilar
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Users */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="users-grid">
        {filteredUsers.map((u) => {
          const isTargetAdmin = u.email?.toLowerCase() === 'crazyaivodeos@gmail.com' || u.role === 'admin';
          const isMe = u.id === currentUser.id;

          // Fetch some preview numbers
          const userWordsRaw = localStorage.getItem(`yodlash_words_${u.id}`);
          const parsedWords: Word[] = userWordsRaw ? JSON.parse(userWordsRaw) : [];
          const userStreakRaw = localStorage.getItem(`yodlash_streak_${u.id}`);
          const streak = userStreakRaw ? parseInt(userStreakRaw, 10) : 0;

          return (
            <motion.div
              key={u.id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedUser(u)}
              className="group cursor-pointer rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all duration-350 relative overflow-hidden"
            >
              {/* Me badge */}
              {isMe && (
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-bl-xl">
                  Siz
                </div>
              )}

              {/* User Identity */}
              <div className="flex items-start gap-4">
                <span className="text-4xl bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-350">
                  {u.avatar || '👤'}
                </span>
                <div className="space-y-1">
                  <h3 className="font-serif italic text-base text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {u.fullName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      @{u.username}
                    </span>
                    {isTargetAdmin && (
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/30 px-1.5 py-0.5 text-[9px] font-bold uppercase text-rose-600 dark:text-rose-400">
                        <Shield className="h-2.5 w-2.5" />
                        Admin
                      </span>
                    )}
                  </div>
                  {u.email && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {u.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick stats preview */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Lug'at boyligi
                  </span>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {parsedWords.length} ta so'z
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Faollik (Kun)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {streak} kun
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover indicator */}
              <div className="mt-5 flex justify-end items-center text-xs text-indigo-600 dark:text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span>Profilni ko'rish</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
              Qidiruv so'zini o'zgartirib ko'ring yoki filterlarni qayta tekshiring.
            </p>
          </div>
        )}
      </div>

      {/* User Details Slide-over Modal / Popup */}
      <AnimatePresence>
        {selectedUser && userDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedUser(null)}
            id="user-detail-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              id="user-detail-modal"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedUser.avatar}</span>
                  <div>
                    <h3 className="font-serif italic text-lg text-slate-800 dark:text-slate-100 leading-none">
                      {selectedUser.fullName} faoliyati
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Foydalanuvchi ma'lumotlari va rivojlanish grafigi
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="rounded-xl p-2 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  id="close-user-detail-modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                
                {/* Meta Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50/80 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">XP Balandligi</span>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
                        <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
                      </div>
                      <span className="text-lg font-black text-slate-800 dark:text-slate-100">{userDetails.xp} XP</span>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Yodlagan So'zlar</span>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                      </div>
                      <span className="text-lg font-black text-slate-800 dark:text-slate-100">{userDetails.masteredCount} ta</span>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Faol Kunlar</span>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                        <Flame className="h-4.5 w-4.5 text-orange-500" />
                      </div>
                      <span className="text-lg font-black text-slate-800 dark:text-slate-100">{userDetails.streakDays} kun</span>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">O'rtacha ball</span>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                        <Award className="h-4.5 w-4.5 text-amber-500" />
                      </div>
                      <span className="text-lg font-black text-slate-800 dark:text-slate-100">{userDetails.averageScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Identity info */}
                <div className="bg-slate-50/50 dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Identifikatorlar</p>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex flex-wrap gap-x-4 gap-y-1.5 mt-1">
                      <span>Username: <span className="text-indigo-600 dark:text-indigo-400">@{selectedUser.username}</span></span>
                      {selectedUser.email && <span>Email: <span className="text-slate-500 dark:text-slate-400 font-medium">{selectedUser.email}</span></span>}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      A'zolik sanasi: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Noma\'lum'}
                    </div>
                  </div>

                  {/* Admin specific configuration block */}
                  {isCurrentUserAdmin && (
                    <div className="pt-4 md:pt-0 md:border-l border-slate-200 dark:border-slate-800 md:pl-6 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleToggleAdmin(selectedUser)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedUser.email?.toLowerCase() === 'crazyaivodeos@gmail.com'
                            ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/20 cursor-not-allowed'
                            : selectedUser.role === 'admin'
                            ? 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/40 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                        }`}
                        disabled={selectedUser.email?.toLowerCase() === 'crazyaivodeos@gmail.com'}
                      >
                        <ShieldCheck className="h-4 w-4" />
                        {selectedUser.role === 'admin' ? "Adminlikni bekor qilish" : "Admin qilish"}
                      </button>

                      <button
                        onClick={() => handleResetUserStats(selectedUser)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Tozalash
                      </button>

                      {selectedUser.email?.toLowerCase() !== 'crazyaivodeos@gmail.com' && (
                        <button
                          onClick={() => handleDeleteUser(selectedUser)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                          O'chirish
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Left-Right side Content Splits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Dictionary Word Preview */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-indigo-500" />
                      Lug'atdagi so'zlari ({userDetails.totalWords} ta)
                    </h4>
                    
                    <div className="border border-slate-150 dark:border-slate-800 rounded-2xl max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/20 dark:bg-slate-950/20">
                      {userDetails.words.slice(0, 10).map((w, index) => (
                        <div key={w.id || index} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{w.original}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{w.translation}</p>
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            w.status === 'mastered' 
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                          }`}>
                            {w.status === 'mastered' ? 'Yodlangan' : "O'rganmoqda"}
                          </span>
                        </div>
                      ))}

                      {userDetails.words.length > 10 && (
                        <div className="p-3 text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/40">
                          Yana {userDetails.words.length - 10} ta so'zi bor...
                        </div>
                      )}

                      {userDetails.words.length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                          Lug'atda hali so'zlar mavjud emas.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Test History Preview */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-violet-500" />
                      Yaqinda topshirgan testlari ({userDetails.history.length} marta)
                    </h4>

                    <div className="border border-slate-150 dark:border-slate-800 rounded-2xl max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/20 dark:bg-slate-950/20">
                      {userDetails.history.slice(0, 10).map((h, index) => (
                        <div key={h.id || index} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                              {h.mode === 'multiple_choice' ? "Variantli test" : h.mode === 'spelling' ? "Yozma test" : "Kartochkalar"}
                            </p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {h.category} • {h.date ? new Date(h.date).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Noma\'lum'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-extrabold ${h.score >= 80 ? 'text-emerald-500' : h.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                              {h.score}%
                            </span>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{h.totalQuestions} ta savol</p>
                          </div>
                        </div>
                      ))}

                      {userDetails.history.length > 10 && (
                        <div className="p-3 text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/40">
                          Yana {userDetails.history.length - 10} marta topshirilgan testlar bor...
                        </div>
                      )}

                      {userDetails.history.length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                          Hali testlar topshirilmagan.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Yopish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

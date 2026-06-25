import React, { useState, useEffect } from 'react';
import { Word, Category, TestHistory, StudyStats, QuizMode, QuizResult, User } from './types';
import { INITIAL_CATEGORIES, INITIAL_WORDS } from './initialData';
import DashboardStats from './components/DashboardStats';
import WordList from './components/WordList';
import AddWordForm from './components/AddWordForm';
import QuizEngine from './components/QuizEngine';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import Leaderboard from './components/Leaderboard';
import ConfirmModal from './components/ConfirmModal';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Award, Layers, Plus, Activity, BookMarked, Settings, Sparkles, LogOut, Trash2, User as UserIcon, Trophy, Sun, Moon } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'words' | 'test' | 'profile' | 'leaderboard'>('dashboard');
  
  // Current Logged-in User
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Day/Night Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('yodlash_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Apply theme class to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('yodlash_theme', theme);
  }, [theme]);

  // App Core Data State (user-specific)
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [history, setHistory] = useState<TestHistory[]>([]);
  
  // Interactive UI States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Stats State
  const [stats, setStats] = useState<StudyStats>({
    totalWords: 0,
    learningCount: 0,
    masteredCount: 0,
    streakDays: 0,
    totalTestsTaken: 0,
    averageScore: 0,
  });

  // 1. Initial Mount: Check if user is already logged in
  useEffect(() => {
    // Seed default users if users database doesn't exist or is empty
    const storedUsers = localStorage.getItem('yodlash_users_db');
    if (!storedUsers) {
      const defaultUsers: User[] = [
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
          avatar: '🦁',
          createdAt: new Date().toISOString(),
          passwordHash: 'sardor123'
        },
        {
          id: 'u_noila',
          username: 'noila_99',
          email: 'noila@example.com',
          fullName: 'Noila Karimova',
          avatar: '🦉',
          createdAt: new Date().toISOString(),
          passwordHash: 'noila123'
        }
      ];
      localStorage.setItem('yodlash_users_db', JSON.stringify(defaultUsers));

      // u_sardor mock data
      localStorage.setItem('yodlash_words_u_sardor', JSON.stringify([
        { id: 'ws1', original: 'Understand', translation: 'Tushunmoq', category: 'Fe\'llar', difficulty: 'easy', correctStreak: 3, status: 'mastered', createdAt: new Date().toISOString() },
        { id: 'ws2', original: 'Create', translation: 'Yaratmoq', category: 'Fe\'llar', difficulty: 'easy', correctStreak: 3, status: 'mastered', createdAt: new Date().toISOString() },
        { id: 'ws3', original: 'Challenge', translation: 'Qiyinchilik', category: 'Umumiy', difficulty: 'medium', correctStreak: 1, status: 'learning', createdAt: new Date().toISOString() }
      ]));
      localStorage.setItem('yodlash_history_u_sardor', JSON.stringify([
        { id: 'hs1', date: new Date().toISOString(), totalQuestions: 10, score: 90, mode: 'multiple_choice', category: 'Barchasi' }
      ]));
      localStorage.setItem('yodlash_streak_u_sardor', '5');

      // u_noila mock data
      localStorage.setItem('yodlash_words_u_noila', JSON.stringify([
        { id: 'wn1', original: 'Beautiful', translation: 'Go\'zal', category: 'Sifatlar', difficulty: 'easy', correctStreak: 3, status: 'mastered', createdAt: new Date().toISOString() },
        { id: 'wn2', original: 'Language', translation: 'Til', category: 'Umumiy', difficulty: 'easy', correctStreak: 3, status: 'mastered', createdAt: new Date().toISOString() }
      ]));
      localStorage.setItem('yodlash_history_u_noila', JSON.stringify([
        { id: 'hn1', date: new Date().toISOString(), totalQuestions: 5, score: 100, mode: 'spelling', category: 'Barchasi' }
      ]));
      localStorage.setItem('yodlash_streak_u_noila', '3');
    }

    const storedUser = localStorage.getItem('yodlash_current_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('yodlash_current_user');
      }
    }
  }, []);

  // 2. Load User-Specific Data from LocalStorage when currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setWords([]);
      setCategories([]);
      setHistory([]);
      return;
    }

    const userId = currentUser.id;
    const storedWords = localStorage.getItem(`yodlash_words_${userId}`);
    const storedCategories = localStorage.getItem(`yodlash_categories_${userId}`);
    const storedHistory = localStorage.getItem(`yodlash_history_${userId}`);
    const storedStreak = localStorage.getItem(`yodlash_streak_${userId}`);
    const storedLastStudy = localStorage.getItem(`yodlash_last_study_${userId}`);

    const loadedWords = storedWords ? JSON.parse(storedWords) : INITIAL_WORDS;
    const loadedCategories = storedCategories ? JSON.parse(storedCategories) : INITIAL_CATEGORIES;
    const loadedHistory = storedHistory ? JSON.parse(storedHistory) : [];
    
    // Streak calculations
    let streak = storedStreak ? parseInt(storedStreak, 10) : 0;
    const lastStudyStr = storedLastStudy || null;

    if (lastStudyStr) {
      const today = new Date().toDateString();
      const lastStudyDate = new Date(lastStudyStr);
      const lastStudyDay = lastStudyDate.toDateString();
      
      const diffTime = Math.abs(new Date(today).getTime() - new Date(lastStudyDay).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If user skipped more than 1 day, streak is broken
      if (diffDays > 1) {
        streak = 0;
        localStorage.setItem(`yodlash_streak_${userId}`, '0');
      }
    }

    setWords(loadedWords);
    setCategories(loadedCategories);
    setHistory(loadedHistory);

    // Initial save if empty to guarantee structure for this user
    if (!storedWords) localStorage.setItem(`yodlash_words_${userId}`, JSON.stringify(INITIAL_WORDS));
    if (!storedCategories) localStorage.setItem(`yodlash_categories_${userId}`, JSON.stringify(INITIAL_CATEGORIES));
  }, [currentUser]);

  // 3. Recalculate stats whenever user words, history change
  useEffect(() => {
    if (!currentUser) return;

    const userId = currentUser.id;
    const totalWords = words.length;
    const masteredCount = words.filter(w => w.status === 'mastered').length;
    const learningCount = totalWords - masteredCount;
    
    const storedStreak = localStorage.getItem(`yodlash_streak_${userId}`);
    const streakDays = storedStreak ? parseInt(storedStreak, 10) : 0;
    const lastStudyStr = localStorage.getItem(`yodlash_last_study_${userId}`) || undefined;

    const totalTestsTaken = history.length;
    const averageScore = totalTestsTaken > 0
      ? Math.round(history.reduce((acc, h) => acc + h.score, 0) / totalTestsTaken)
      : 0;

    setStats({
      totalWords,
      learningCount,
      masteredCount,
      streakDays,
      lastStudyDate: lastStudyStr,
      totalTestsTaken,
      averageScore,
    });
  }, [words, history, currentUser]);

  // Auth Callbacks
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('yodlash_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setConfirmState({
      isOpen: true,
      title: "Tizimdan chiqish",
      message: "Haqiqatan ham tizimdan chiqmoqchimisiz? Kelgusida qayta kirishingiz mumkin.",
      confirmLabel: "Chiqish",
      cancelLabel: "Bekor qilish",
      variant: 'info',
      onConfirm: () => {
        setCurrentUser(null);
        localStorage.removeItem('yodlash_current_user');
        setActiveTab('dashboard');
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('yodlash_current_user', JSON.stringify(updatedUser));
    
    // Also update in global users database
    const storedUsersRaw = localStorage.getItem('yodlash_users_db');
    if (storedUsersRaw) {
      try {
        const usersDb: User[] = JSON.parse(storedUsersRaw);
        const updatedDb = usersDb.map(u => u.id === updatedUser.id ? updatedUser : u);
        localStorage.setItem('yodlash_users_db', JSON.stringify(updatedDb));
      } catch (e) {
        console.error("Failed to update user database:", e);
      }
    }
  };

  // Save changes helpers
  const saveWordsToStorage = (updatedWords: Word[]) => {
    setWords(updatedWords);
    if (currentUser) {
      localStorage.setItem(`yodlash_words_${currentUser.id}`, JSON.stringify(updatedWords));
    }
  };

  const saveCategoriesToStorage = (updatedCats: Category[]) => {
    setCategories(updatedCats);
    if (currentUser) {
      localStorage.setItem(`yodlash_categories_${currentUser.id}`, JSON.stringify(updatedCats));
    }
  };

  // Add/Edit word action
  const handleSaveWord = (wordData: Omit<Word, 'id' | 'createdAt' | 'correctStreak' | 'status'>) => {
    if (editingWord) {
      // Edit word
      const updated = words.map(w => {
        if (w.id === editingWord.id) {
          return {
            ...w,
            ...wordData,
            status: w.status,
            correctStreak: w.correctStreak
          };
        }
        return w;
      });
      saveWordsToStorage(updated);
      setEditingWord(null);
    } else {
      // Create new word
      const newWord: Word = {
        id: `w_${Date.now()}`,
        ...wordData,
        correctStreak: 0,
        status: 'learning',
        createdAt: new Date().toISOString(),
      };
      saveWordsToStorage([newWord, ...words]);
    }
    setIsFormOpen(false);
  };

  // Delete word action
  const handleDeleteWord = (wordId: string) => {
    setConfirmState({
      isOpen: true,
      title: "So'zni o'chirish",
      message: "Ushbu so'zni lug'atdan butunlay o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.",
      confirmLabel: "O'chirish",
      cancelLabel: "Bekor qilish",
      variant: 'danger',
      onConfirm: () => {
        const filtered = words.filter(w => w.id !== wordId);
        saveWordsToStorage(filtered);
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Add category on the fly
  const handleAddCategory = (catName: string) => {
    const colors = ['indigo', 'emerald', 'amber', 'rose', 'sky', 'violet', 'cyan', 'fuchsia'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newCat: Category = {
      id: `c_${Date.now()}`,
      name: catName,
      color: randomColor,
    };
    saveCategoriesToStorage([...categories, newCat]);
  };

  // Complete a quiz & update streaks/history
  const handleCompleteQuiz = (score: number, quizResults: QuizResult[], mode: QuizMode, category: string) => {
    if (!currentUser) return;
    const userId = currentUser.id;

    // 1. Update words learning status and correct streak based on correct answers
    const updatedWords = words.map(w => {
      const quizRes = quizResults.find(r => r.wordId === w.id);
      if (quizRes) {
        let currentStreak = w.correctStreak;
        if (quizRes.correct) {
          currentStreak += 1;
        } else {
          currentStreak = 0; // Reset streak on mistake
        }
        
        return {
          ...w,
          correctStreak: currentStreak,
          status: currentStreak >= 3 ? ('mastered' as const) : ('learning' as const),
          lastTestedAt: new Date().toISOString()
        };
      }
      return w;
    });
    saveWordsToStorage(updatedWords);

    // 2. Track Study Streak (Consecutive Days)
    const todayStr = new Date().toDateString();
    const storedLastStudy = localStorage.getItem(`yodlash_last_study_${userId}`);
    let currentStreak = parseInt(localStorage.getItem(`yodlash_streak_${userId}`) || '0', 10);

    if (!storedLastStudy) {
      // First time studying
      currentStreak = 1;
    } else {
      const lastStudyDay = new Date(storedLastStudy).toDateString();
      if (lastStudyDay !== todayStr) {
        const diffTime = Math.abs(new Date(todayStr).getTime() - new Date(lastStudyDay).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Studied yesterday, increment streak
          currentStreak += 1;
        } else if (diffDays > 1) {
          // Missed days, restart
          currentStreak = 1;
        }
      }
    }

    localStorage.setItem(`yodlash_streak_${userId}`, currentStreak.toString());
    localStorage.setItem(`yodlash_last_study_${userId}`, new Date().toISOString());

    // 3. Save Test History
    const newHistoryItem: TestHistory = {
      id: `h_${Date.now()}`,
      date: new Date().toISOString(),
      totalQuestions: quizResults.length,
      score,
      mode,
      category,
    };
    const updatedHistory = [...history, newHistoryItem];
    setHistory(updatedHistory);
    localStorage.setItem(`yodlash_history_${userId}`, JSON.stringify(updatedHistory));
  };

  // Reset metrics
  const handleResetStats = () => {
    if (!currentUser) return;
    const userId = currentUser.id;

    setConfirmState({
      isOpen: true,
      title: "Statistikani tozalash",
      message: "Diqqat! Barcha testlar tarixi va statistikalaringiz o'chiriladi. Ushbu amalni ortga qaytarib bo'lmaydi. Rozimisiz?",
      confirmLabel: "Tozalash",
      cancelLabel: "Bekor qilish",
      variant: 'warning',
      onConfirm: () => {
        setHistory([]);
        localStorage.removeItem(`yodlash_history_${userId}`);
        localStorage.removeItem(`yodlash_streak_${userId}`);
        localStorage.removeItem(`yodlash_last_study_${userId}`);
        
        // Reset all word streaks
        const resetWords = words.map(w => ({
          ...w,
          correctStreak: 0,
          status: 'learning' as const
        }));
        saveWordsToStorage(resetWords);
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // If user is not logged in, render the login/register screen
  if (!currentUser) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col antialiased transition-colors duration-300">
      {/* Decorative ambient spots */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-violet-200/20 dark:bg-violet-900/10 rounded-full filter blur-3xl pointer-events-none"></div>

      {/* Main Header / Top Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-md shadow-indigo-100">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  So'z <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-lg">Yodlash</span>
                </h1>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Shaxsiy lug'at boyligi</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/60 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Asosiy Oyna
              </button>
              <button
                onClick={() => setActiveTab('words')}
                className={`px-4.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'words'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Lug'at
              </button>
              <button
                onClick={() => setActiveTab('test')}
                className={`px-4.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'test'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Test Topshirish
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-4.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'leaderboard'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                id="header-tab-leaderboard"
              >
                Reyting
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                id="header-tab-profile"
              >
                Profil
              </button>
            </nav>

            {/* Top Quick Actions & Profile Widget */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setEditingWord(null);
                  setIsFormOpen(true);
                }}
                className="hidden sm:inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-bold transition-all hover:shadow-md cursor-pointer active:scale-95"
                id="header-btn-add-word"
              >
                <Plus className="h-4 w-4" />
                So'z qo'shish
              </button>

              {/* Day/Night Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="rounded-xl p-2.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all cursor-pointer"
                title={theme === 'light' ? "Tungi rejimga o'tish" : "Kunduzgi rejimga o'tish"}
                id="header-btn-theme-toggle"
              >
                {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
              </button>

              {/* User Profile display & Logout button */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 sm:border-l border-slate-100 dark:border-slate-800 sm:pl-4">
                <div 
                  onClick={() => setActiveTab('profile')}
                  className={`hidden sm:flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${activeTab === 'profile' ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''}`}
                  title="Shaxsiy profilga o'tish"
                >
                  <span className="text-2xl" title={currentUser.fullName}>{currentUser.avatar}</span>
                  <div className="hidden lg:block text-left leading-none">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block max-w-[100px] truncate">{currentUser.fullName}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">@{currentUser.username}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-xl p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                  title="Tizimdan chiqish"
                  id="header-btn-logout"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Dynamic View Swapper with slide-over Form */}
        <div className="grid grid-cols-1 gap-8 relative">
          
          <AnimatePresence mode="wait">
            
            {/* Slide-over Word Creator Overlay */}
            {isFormOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
                onClick={() => setIsFormOpen(false)}
                id="form-modal-overlay"
              >
                <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl">
                  <AddWordForm
                    categories={categories}
                    editingWord={editingWord}
                    onSave={handleSaveWord}
                    onCancel={() => {
                      setIsFormOpen(false);
                      setEditingWord(null);
                    }}
                    onAddCategory={handleAddCategory}
                  />
                </div>
              </motion.div>
            )}

            {/* ACTIVE TAB VIEWS */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardStats
                  words={words}
                  history={history}
                  stats={stats}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onResetStats={handleResetStats}
                />
              </motion.div>
            )}

            {activeTab === 'words' && (
              <motion.div
                key="words-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <WordList
                  words={words}
                  categories={categories}
                  onAddWordClick={() => {
                    setEditingWord(null);
                    setIsFormOpen(true);
                  }}
                  onEditWord={(word) => {
                    setEditingWord(word);
                    setIsFormOpen(true);
                  }}
                  onDeleteWord={handleDeleteWord}
                />
              </motion.div>
            )}

            {activeTab === 'test' && (
              <motion.div
                key="test-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <QuizEngine
                  words={words}
                  categories={categories}
                  onCompleteQuiz={handleCompleteQuiz}
                  onNavigate={(tab) => {
                    if (tab === 'words') {
                      setActiveTab('words');
                    } else {
                      setActiveTab('dashboard');
                    }
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <Leaderboard currentUser={currentUser} />
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <UserProfile
                  user={currentUser}
                  onUpdateUser={handleUpdateUser}
                  words={words}
                  history={history}
                  stats={stats}
                />
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </main>

      {/* Footer Navigation for Mobile (sticky on bottom for touch precision) */}
      <nav className="md:hidden sticky bottom-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-around py-3 px-2 shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-2 text-xs font-semibold cursor-pointer ${
            activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <Activity className="h-5 w-5" />
          <span>Bosh sahifa</span>
        </button>
        <button
          onClick={() => setActiveTab('words')}
          className={`flex flex-col items-center gap-1 p-2 text-xs font-semibold cursor-pointer ${
            activeTab === 'words' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <BookMarked className="h-5 w-5" />
          <span>Lug'at</span>
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`flex flex-col items-center gap-1 p-2 text-xs font-semibold cursor-pointer ${
            activeTab === 'test' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <Award className="h-5 w-5" />
          <span>Test</span>
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center gap-1 p-2 text-xs font-semibold cursor-pointer ${
            activeTab === 'leaderboard' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 dark:text-slate-500'
          }`}
          id="mobile-nav-leaderboard"
        >
          <Trophy className="h-5 w-5" />
          <span>Reyting</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 p-2 text-xs font-semibold cursor-pointer ${
            activeTab === 'profile' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 dark:text-slate-500'
          }`}
          id="mobile-nav-profile"
        >
          <UserIcon className="h-5 w-5" />
          <span>Profil</span>
        </button>
      </nav>

      {/* Decorative footer label */}
      <footer className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100/60 dark:border-slate-800 bg-white dark:bg-slate-900">
        <p>© 2026 So'z Yodlash Tizimi. Oflayn va xavfsiz lug'at yordamchisi.</p>
      </footer>

      {/* Beautiful custom confirmation modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        variant={confirmState.variant}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

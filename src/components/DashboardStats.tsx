import React from 'react';
import { Word, TestHistory, StudyStats } from '../types';
import { BookOpen, Award, Flame, CheckCircle2, TrendingUp, Calendar, RefreshCcw, ChevronRight, Sparkles, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardStatsProps {
  words: Word[];
  history: TestHistory[];
  stats: StudyStats;
  onNavigate: (tab: 'words' | 'test' | 'leaderboard') => void;
  onResetStats: () => void;
}

export default function DashboardStats({ words, history, stats, onNavigate, onResetStats }: DashboardStatsProps) {
  // Calculate category breakdowns
  const categoryCounts: Record<string, { total: number; mastered: number }> = {};
  words.forEach(w => {
    if (!categoryCounts[w.category]) {
      categoryCounts[w.category] = { total: 0, mastered: 0 };
    }
    categoryCounts[w.category].total += 1;
    if (w.status === 'mastered') {
      categoryCounts[w.category].mastered += 1;
    }
  });

  const masteredPercentage = words.length > 0 
    ? Math.round((stats.masteredCount / stats.totalWords) * 100) 
    : 0;

  // Determine encouragement message
  let greeting = "Xush kelibsiz! 👋";
  const hour = new Date().getHours();
  if (hour < 12) greeting = "Xayrli tong! 🌅";
  else if (hour < 18) greeting = "Xayrli kun! ☀️";
  else greeting = "Xayrli kech! 🌌";

  let motivation = "Bugun yangi so'zlarni o'rganish va o'zingizni sinab ko'rish uchun ajoyib kun!";
  if (words.length === 0) {
    motivation = "Hali birorta ham so'z kiritmagansiz. Qani, birinchi so'zingizni qo'shing va boshlang!";
  } else if (masteredPercentage > 80) {
    motivation = "Ajoyib natija! So'zlarning ko'p qismini mukammal o'zlashtirdingiz. Yangilarini kiritish vaqti keldi!";
  } else if (stats.streakDays > 2) {
    motivation = `Ajoyib! Ketma-ket ${stats.streakDays} kundan beri shug'ullanmoqdasiz. Shunday davom eting! 🔥`;
  }

  return (
    <div className="space-y-6 sm:space-y-8" id="dashboard-container">
      {/* Bento Grid Top Section: Welcome Banner and Streak Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Welcome Banner: Spans 3 columns on large screens */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800/40 flex flex-col justify-between min-h-[260px]"
          id="welcome-banner"
        >
          {/* Subtle abstract glows */}
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-indigo-50/15 blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/3 bottom-0 -mb-20 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/25 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-indigo-200 border border-indigo-400/20">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Intellektual Lug'at Tizimi
            </span>
            <h2 className="mt-4 sm:mt-5 text-2.5xl font-serif italic sm:text-4.5xl tracking-tight text-white leading-tight" id="greeting-title">
              {greeting}
            </h2>
            <p className="mt-2.5 sm:mt-3 text-slate-300 text-sm sm:text-base font-normal max-w-xl">
              {motivation}
            </p>
          </div>

          <div className="mt-6 sm:mt-8 relative z-10 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('words')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5.5 py-3 text-sm font-bold text-slate-900 shadow-md transition-all hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              id="banner-btn-add"
            >
              <BookOpen className="h-4 w-4 text-indigo-600" />
              Lug'atni ko'rish
            </button>
            <button
              onClick={() => onNavigate('test')}
              disabled={words.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-md px-5.5 py-3 text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              id="banner-btn-test"
            >
              <Award className="h-4 w-4 text-yellow-400" />
              Test topshirish
            </button>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-md px-5.5 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              id="banner-btn-leaderboard"
            >
              <Trophy className="h-4 w-4 text-yellow-400" />
              Reyting
            </button>
          </div>
        </motion.div>

        {/* Streak Widget: Spans 1 column, styled as a signature Bento feature card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`rounded-3xl border p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
            stats.streakDays > 0 
              ? 'border-orange-200 dark:border-orange-950/50 bg-gradient-to-b from-orange-50/70 dark:from-orange-950/20 to-amber-50/35 dark:to-amber-950/10 shadow-sm' 
              : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
          }`}
          id="stat-card-streak"
        >
          {/* Flame background watermarks */}
          {stats.streakDays > 0 && (
            <div className="absolute -right-6 -bottom-6 text-orange-500/10 transform rotate-12 scale-150 pointer-events-none">
              <Flame className="h-32 w-32" />
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Muntazamlik</span>
            <div className={`rounded-2xl p-3 ${
              stats.streakDays > 0 
                ? 'bg-orange-500 text-white animate-pulse shadow-md shadow-orange-200 dark:shadow-none' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
            }`}>
              <Flame className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6">
            <span className="text-xs text-slate-400 dark:text-slate-500 block font-medium">Kunlik faollik</span>
            <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100 mt-1 font-mono tracking-tight">
              {stats.streakDays} <span className="text-lg font-serif italic font-normal text-slate-500 dark:text-slate-400">kun</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {stats.streakDays > 0 
                ? "Ajoyib! Shug'ullanish zanjirini uzib qo'ymang." 
                : "Bugun lug'atingizga yeni so'zlar qo'shib, bilimingizni boyiting."}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-medium">
            <span>Oxirgi dars:</span>
            <span>
              {stats.lastStudyDate 
                ? new Date(stats.lastStudyDate).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }) 
                : 'Mavjud emas'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Main Stats Grid: 3 cards showing totals & achievements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6" id="stats-grid">
        {/* Total Words Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex items-center gap-4 sm:gap-5 hover:shadow-md transition-all duration-300"
          id="stat-card-total"
        >
          <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 p-3.5 sm:p-4 text-indigo-600 dark:text-indigo-400 shadow-sm">
            <BookOpen className="h-5 sm:h-6 w-5 sm:w-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Jami so'zlar</p>
            <h3 className="text-2.5xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 sm:mt-1 font-mono tracking-tight">{stats.totalWords}</h3>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium">Shaxsiy lug'at hajmi</span>
          </div>
        </motion.div>

        {/* Mastered Words Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex items-center gap-4 sm:gap-5 hover:shadow-md transition-all duration-300"
          id="stat-card-mastered"
        >
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-3.5 sm:p-4 text-emerald-600 dark:text-emerald-400 shadow-sm">
            <CheckCircle2 className="h-5 sm:h-6 w-5 sm:w-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Yodlangan</p>
            <h3 className="text-2.5xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 sm:mt-1 font-mono tracking-tight">{stats.masteredCount}</h3>
            <span className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md font-bold">{masteredPercentage}% mukammal</span>
          </div>
        </motion.div>

        {/* Learning Words Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex items-center gap-4 sm:gap-5 hover:shadow-md transition-all duration-300"
          id="stat-card-learning"
        >
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-3.5 sm:p-4 text-amber-500 dark:text-amber-440 shadow-sm">
            <TrendingUp className="h-5 sm:h-6 w-5 sm:w-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">O'rganilmoqda</p>
            <h3 className="text-2.5xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 sm:mt-1 font-mono tracking-tight">{stats.learningCount}</h3>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium">Jarayon davom etmoqda</span>
          </div>
        </motion.div>
      </div>

      {/* Progress & Breakdown Section */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3" id="stats-details-section">
        {/* Visual Progress Dial */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex flex-col justify-between" id="progress-dial-card">
          <div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Yodlash progressi</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Sizning umumiy muvaffaqiyat ko'rsatkichingiz</p>
          </div>
          
          <div className="my-5 sm:my-7 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              {/* SVG Ring */}
              <svg className="h-36 sm:h-40 w-36 sm:w-40 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  className="stroke-slate-50 dark:stroke-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                  {...({ cx: undefined, cy: undefined, r: undefined, strokeWidth: undefined } as any)} // Overrides for responsive sizes or standard sizing
                  {...{ cx: 80, cy: 80, r: 68, strokeWidth: 11 }}
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="68"
                  className="stroke-indigo-600 dark:stroke-indigo-500"
                  strokeWidth="11"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 68}
                  initial={{ strokeDashoffset: 2 * Math.PI * 68 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 68 * (1 - masteredPercentage / 100) }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl sm:text-3.5xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">{masteredPercentage}%</span>
                <span className="text-[9px] sm:text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mt-0.5">Yodlandi</span>
              </div>
            </div>
            <p className="mt-4 sm:mt-5 text-center text-xs text-slate-500 dark:text-slate-400 max-w-[220px] leading-relaxed">
              Jami <b className="text-slate-800 dark:text-slate-100 font-semibold">{stats.totalWords} ta</b> so'zdan <b className="text-emerald-600 dark:text-emerald-400 font-bold">{stats.masteredCount} tasi</b> to'liq o'zlashtirildi.
            </p>
          </div>
          
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-around text-center">
            <div>
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Testlar</span>
              <span className="text-base font-extrabold text-slate-700 dark:text-slate-300 mt-0.5 inline-block">{stats.totalTestsTaken} ta</span>
            </div>
            <div className="border-r border-slate-100 dark:border-slate-800"></div>
            <div>
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">O'rtacha</span>
              <span className="text-base font-extrabold text-slate-700 dark:text-slate-300 mt-0.5 inline-block">
                {stats.totalTestsTaken > 0 ? `${stats.averageScore}%` : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex flex-col justify-between animate-fade-in" id="category-breakdown-card">
          <div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Guruhlar bo'yicha</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">Har bir soha bo'yicha o'zlashtirish darajasi</p>
          </div>
          
          <div className="my-5 space-y-4 max-h-[240px] overflow-y-auto pr-1">
            {Object.keys(categoryCounts).length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                Kategoriyalar mavjud emas
              </div>
            ) : (
              Object.entries(categoryCounts).map(([cat, counts]) => {
                const pct = Math.round((counts.mastered / counts.total) * 100);
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{cat}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">
                        {counts.mastered}/{counts.total} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed block">
              Yangi so'zlar kiritib, guruhlar progressini oshiring!
            </span>
          </div>
        </div>

        {/* Recent Activity / History */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex flex-col justify-between" id="recent-activity-card">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Testlar tarixi</h4>
              {history.length > 0 && (
                <button 
                  onClick={onResetStats}
                  className="text-xs text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                  title="Tarix va statistikalarni tozalash"
                >
                  <RefreshCcw className="h-3 w-3" />
                  Tozalash
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Oxirgi topshirilgan sinov natijalari</p>
          </div>

          <div className="my-5 space-y-3 flex-1 overflow-y-auto max-h-[220px] pr-1">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 dark:text-slate-500">
                <Calendar className="h-9 w-9 text-slate-200 dark:text-slate-800 mb-2" />
                <p className="text-xs font-semibold">Testlar tarixi bo'sh</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[180px] mx-auto">Bilimingizni sinab ko'rish uchun hoziroq test topshiring.</p>
              </div>
            ) : (
              history.slice().reverse().map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 p-3 text-xs border border-slate-100/60 dark:border-slate-800 hover:border-slate-200/50 dark:hover:border-slate-700 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      {h.mode === 'multiple_choice' ? "Variantli test" : h.mode === 'spelling' ? "Yozma test" : "Kartochkalar"}
                    </span>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {new Date(h.date).toLocaleDateString('uz-UZ')} {new Date(h.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center rounded-lg px-2 py-1 text-[10px] font-extrabold ${
                      h.score >= 80 
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40' 
                        : h.score >= 50 
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40' 
                          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-450 border border-rose-100 dark:border-rose-900/40'
                    }`}>
                      {h.score}%
                    </span>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">{h.score / 10}/{h.totalQuestions} to'g'ri</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <button
              onClick={() => onNavigate('test')}
              disabled={words.length === 0}
              className="w-full inline-flex justify-center items-center gap-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/45 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 py-2.5 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Yangi test topshirish
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { User, Word, TestHistory } from '../types';
import { motion } from 'motion/react';
import { Award, Flame, BookOpen, Sparkles, CheckCircle2, Trophy, Medal, Star, ShieldAlert, ArrowUp } from 'lucide-react';

interface LeaderboardProps {
  currentUser: User;
}

interface UserRankStats {
  user: User;
  totalWords: number;
  masteredCount: number;
  streakDays: number;
  testsCount: number;
  averageScore: number;
  xp: number; // Experience / Rating points
}

export default function Leaderboard({ currentUser }: LeaderboardProps) {
  const [rankingMetric, setRankingMetric] = useState<'xp' | 'mastered' | 'streak' | 'words'>('xp');

  // Load and calculate stats for all users dynamically from localStorage
  const rankedUsers = useMemo(() => {
    const storedUsersRaw = localStorage.getItem('yodlash_users_db');
    const users: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

    // Fallback if no users exist
    if (users.length === 0) {
      users.push(currentUser);
    }

    const calculated: UserRankStats[] = users.map((u) => {
      const userId = u.id;
      
      // Load user-specific data from localStorage
      const wordsRaw = localStorage.getItem(`yodlash_words_${userId}`);
      const historyRaw = localStorage.getItem(`yodlash_history_${userId}`);
      const streakRaw = localStorage.getItem(`yodlash_streak_${userId}`);

      const userWords: Word[] = wordsRaw ? JSON.parse(wordsRaw) : [];
      const userHistory: TestHistory[] = historyRaw ? JSON.parse(historyRaw) : [];
      const streakDays = streakRaw ? parseInt(streakRaw, 10) : 0;

      const totalWords = userWords.length;
      const masteredCount = userWords.filter(w => w.status === 'mastered').length;
      const testsCount = userHistory.length;
      
      const totalScore = userHistory.reduce((sum, h) => sum + h.score, 0);
      const averageScore = testsCount > 0 ? Math.round(totalScore / testsCount) : 0;

      // Rating/XP calculation formula:
      // - 20 XP per mastered word
      // - 5 XP per word in dictionary
      // - 30 XP per streak day
      // - 15 XP per completed test
      // - Bonus for average score
      const xp = (masteredCount * 20) + (totalWords * 5) + (streakDays * 30) + (testsCount * 15) + (averageScore * 2);

      return {
        user: u,
        totalWords,
        masteredCount,
        streakDays,
        testsCount,
        averageScore,
        xp
      };
    });

    // Sort based on selected filter
    return calculated.sort((a, b) => {
      if (rankingMetric === 'mastered') return b.masteredCount - a.masteredCount;
      if (rankingMetric === 'streak') return b.streakDays - a.streakDays;
      if (rankingMetric === 'words') return b.totalWords - a.totalWords;
      return b.xp - a.xp; // Default XP
    });
  }, [currentUser, rankingMetric]);

  // Top 3 Podium placements
  const podium = useMemo(() => {
    const top3 = rankedUsers.slice(0, 3);
    // Order as: 2nd, 1st, 3rd for proper visual layout
    const ordered = [];
    if (top3[1]) ordered.push({ ...top3[1], place: 2 });
    if (top3[0]) ordered.push({ ...top3[0], place: 1 });
    if (top3[2]) ordered.push({ ...top3[2], place: 3 });
    return ordered;
  }, [rankedUsers]);

  // Rest of the list
  const listUsers = useMemo(() => {
    return rankedUsers.slice(3);
  }, [rankedUsers]);

  // Current user's index / position
  const currentUserRank = useMemo(() => {
    const idx = rankedUsers.findIndex(r => r.user.id === currentUser.id);
    return idx !== -1 ? idx + 1 : null;
  }, [rankedUsers, currentUser]);

  return (
    <div className="space-y-8" id="leaderboard-view">
      {/* Header section with description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 dark:bg-yellow-500/20 border border-yellow-500/20 px-3 py-1 text-[11px] font-bold uppercase text-yellow-700 dark:text-yellow-400">
            <Trophy className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
            Liderlar Reytingi
          </span>
          <h2 className="mt-2.5 text-3xl font-serif italic text-slate-900 dark:text-slate-100 leading-tight">
            Lug'at Chempionlari
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-xl">
            Tizimdagi barcha foydalanuvchilar o'rtasida bilim bellashuvi. Har bir yeni yodlangan so'z va topshirilgan test sizni cho'qqiga yetaklaydi!
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800 self-start">
          <button
            onClick={() => setRankingMetric('xp')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              rankingMetric === 'xp' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 inline mr-1 text-indigo-500" />
            Umumiy ball (XP)
          </button>
          <button
            onClick={() => setRankingMetric('mastered')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              rankingMetric === 'mastered' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 inline mr-1 text-emerald-500" />
            Yodlangan so'zlar
          </button>
          <button
            onClick={() => setRankingMetric('streak')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              rankingMetric === 'streak' ? 'bg-white dark:bg-slate-800 text-orange-700 dark:text-orange-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Flame className="h-3.5 w-3.5 inline mr-1 text-orange-500" />
            Muntazamlik
          </button>
        </div>
      </div>

      {/* Podium Display (Top 3 Users) */}
      {rankedUsers.length > 0 && (
        <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto pt-8 pb-4 items-end" id="leaderboard-podium">
          {podium.map((rank) => {
            const isMe = rank.user.id === currentUser.id;
            const sizeClasses = rank.place === 1 
              ? 'h-48 md:h-56 bg-gradient-to-t from-yellow-500/10 via-yellow-100/30 dark:via-yellow-900/10 to-white dark:to-slate-900 border-2 border-yellow-400' 
              : rank.place === 2
                ? 'h-40 md:h-48 bg-gradient-to-t from-slate-300/10 via-slate-100/30 dark:via-slate-800/10 to-white dark:to-slate-900 border border-slate-300 dark:border-slate-700'
                : 'h-36 md:h-44 bg-gradient-to-t from-amber-600/10 via-amber-100/20 dark:via-amber-900/10 to-white dark:to-slate-900 border border-amber-500/50 dark:border-amber-900';

            const rewardValue = rankingMetric === 'xp' 
              ? `${rank.xp} XP` 
              : rankingMetric === 'mastered' 
                ? `${rank.masteredCount} ta` 
                : rankingMetric === 'streak'
                  ? `${rank.streakDays} kun`
                  : `${rank.totalWords} ta`;

            return (
              <motion.div
                key={rank.user.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: rank.place * 0.1 }}
                className={`rounded-3xl p-4 flex flex-col justify-between items-center text-center relative ${sizeClasses} shadow-sm`}
                id={`podium-${rank.place}`}
              >
                {/* Place indicator */}
                <div className="absolute -top-5 flex items-center justify-center">
                  {rank.place === 1 && (
                    <div className="h-10 w-10 bg-yellow-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 animate-bounce">
                      <Trophy className="h-5 w-5" />
                    </div>
                  )}
                  {rank.place === 2 && (
                    <div className="h-9 w-9 bg-slate-300 text-slate-800 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 font-bold text-sm">
                      2
                    </div>
                  )}
                  {rank.place === 3 && (
                    <div className="h-8 w-8 bg-amber-600 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 font-bold text-xs">
                      3
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-col items-center">
                  <span className="text-4.5xl md:text-5xl select-none filter drop-shadow-md">{rank.user.avatar}</span>
                  <h4 className="mt-3 text-xs md:text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-tight max-w-[80px] md:max-w-[120px] truncate leading-tight">
                    {rank.user.fullName}
                  </h4>
                  <span className="text-[9px] md:text-xs text-slate-400 dark:text-slate-500 font-medium truncate max-w-[70px] md:max-w-[100px]">
                    @{rank.user.username}
                  </span>
                </div>

                <div className="w-full">
                  <div className={`py-1 px-2.5 rounded-xl font-mono font-black text-xs md:text-sm shadow-inner ${
                    rank.place === 1 
                      ? 'bg-yellow-500/20 text-yellow-800 dark:text-yellow-400' 
                      : rank.place === 2
                        ? 'bg-slate-200/50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        : 'bg-amber-600/10 text-amber-800 dark:text-amber-400'
                  }`}>
                    {rewardValue}
                  </div>
                  {isMe && (
                    <span className="text-[8px] md:text-[9px] text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-extrabold mt-1 block">
                      Siz
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Main leaderboard rankings list */}
      <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm" id="leaderboard-table-container">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Reyting Jadvali</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 mb-6">Tizimning barcha ro'yxatdan o'tgan foydalanuvchilari tartibi</p>

        <div className="space-y-2.5" id="leaderboard-items-list">
          {rankedUsers.map((item, idx) => {
            const isMe = item.user.id === currentUser.id;
            const rankNum = idx + 1;

            const metricDisplay = rankingMetric === 'xp' 
              ? `${item.xp} XP` 
              : rankingMetric === 'mastered' 
                ? `${item.masteredCount} ta` 
                : rankingMetric === 'streak'
                  ? `${item.streakDays} kun`
                  : `${item.totalWords} ta`;

            return (
              <motion.div
                key={item.user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.5) }}
                className={`flex items-center justify-between rounded-2xl p-4 border transition-all ${
                  isMe 
                    ? 'border-indigo-200 dark:border-indigo-900 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs' 
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950/80'
                }`}
                id={`leaderboard-row-${rankNum}`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank position */}
                  <div className="w-6 flex justify-center text-sm font-bold text-slate-400 dark:text-slate-500 font-mono">
                    {rankNum === 1 && <span className="text-yellow-500 font-black">🥇</span>}
                    {rankNum === 2 && <span className="text-slate-400 font-black">🥈</span>}
                    {rankNum === 3 && <span className="text-amber-600 font-black">🥉</span>}
                    {rankNum > 3 && <span>{rankNum}</span>}
                  </div>

                  {/* Avatar & Name */}
                  <span className="text-3xl select-none">{item.user.avatar}</span>
                  <div className="leading-tight">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      {item.user.fullName}
                      {isMe && (
                        <span className="text-[9px] bg-indigo-600 text-white font-extrabold uppercase px-1.5 py-0.5 rounded-md tracking-wider">
                          Siz
                        </span>
                      )}
                    </h4>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">@{item.user.username}</span>
                  </div>
                </div>

                {/* Statistics display */}
                <div className="flex items-center gap-6 text-xs md:text-sm">
                  {/* Subtle stats indicators (shown on larger screens) */}
                  <div className="hidden md:flex items-center gap-4 text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1" title="Lug'atdagi so'zlar">
                      <BookOpen className="h-3.5 w-3.5 text-slate-300 dark:text-slate-700" />
                      <span className="font-semibold font-mono">{item.totalWords}</span>
                    </span>
                    <span className="flex items-center gap-1" title="Yodlangan so'zlar">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-500/80" />
                      <span className="font-semibold font-mono">{item.masteredCount}</span>
                    </span>
                    <span className="flex items-center gap-1" title="Muntazamlik zanjiri">
                      <Flame className="h-3.5 w-3.5 text-orange-400 dark:text-orange-500/80" />
                      <span className="font-semibold font-mono">{item.streakDays}</span>
                    </span>
                  </div>

                  {/* Rating point value */}
                  <div className="text-right">
                    <span className="font-mono font-black text-slate-800 dark:text-slate-200 inline-block px-3 py-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs">
                      {metricDisplay}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dynamic current user status banner */}
      {currentUserRank && (
        <div className="rounded-3xl bg-slate-900 text-white p-6 relative overflow-hidden" id="leaderboard-my-status">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center md:text-left flex-col md:flex-row">
              <span className="text-4xl bg-white/10 p-2.5 rounded-full border border-white/10">{currentUser.avatar}</span>
              <div>
                <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Sizning joriy holatingiz</span>
                <h4 className="text-xl font-bold leading-tight">{currentUser.fullName}</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Liderlar jadvalida <b className="text-white font-bold">{currentUserRank}-o'rindasiz</b>. Cho'qqini zabt etishda davom eting!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl min-w-[80px]">
                <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Ochko</span>
                <span className="text-base font-black font-mono text-yellow-400">
                  {rankedUsers.find(r => r.user.id === currentUser.id)?.xp || 0} XP
                </span>
              </div>
              <div className="text-center bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl min-w-[80px]">
                <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Reyting</span>
                <span className="text-base font-black font-mono text-indigo-300">
                  #{currentUserRank}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

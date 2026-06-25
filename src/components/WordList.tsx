import React, { useState } from 'react';
import { Word, Category } from '../types';
import { Search, Plus, Trash2, Edit2, Volume2, AlertCircle, BookMarked, Check, Star, Filter, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WordListProps {
  words: Word[];
  categories: Category[];
  onAddWordClick: () => void;
  onEditWord: (word: Word) => void;
  onDeleteWord: (wordId: string) => void;
}

export default function WordList({ words, categories, onAddWordClick, onEditWord, onDeleteWord }: WordListProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [selectedStatus, setSelectedStatus] = useState<'barchasi' | 'learning' | 'mastered'>('barchasi');
  const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);

  // Text-To-Speech Engine
  const handleSpeak = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Attempt to find English voice
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Slightly slower for clear learning pronunciation

      utterance.onstart = () => setSpeakingWordId(id);
      utterance.onend = () => setSpeakingWordId(null);
      utterance.onerror = () => setSpeakingWordId(null);

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sizning brauzeringiz matnni ovozli o'qish imkoniyatini qo'llab-quvvatlamaydi.");
    }
  };

  // Filtering Logic
  const filteredWords = words.filter(word => {
    const matchesSearch = 
      word.original.toLowerCase().includes(search.toLowerCase()) ||
      word.translation.toLowerCase().includes(search.toLowerCase()) ||
      (word.example && word.example.toLowerCase().includes(search.toLowerCase())) ||
      (word.notes && word.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'Barchasi' || word.category === selectedCategory;
    const matchesStatus = selectedStatus === 'barchasi' || word.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6" id="word-list-manager">
      {/* Header and Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mening So'zlarim</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Jami <b>{words.length} ta</b> so'z qo'shilgan. Ulardan <b>{words.filter(w => w.status === 'mastered').length} tasi</b> yodlab tugatilgan.
          </p>
        </div>
        <button
          onClick={onAddWordClick}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 font-semibold text-sm shadow-md shadow-indigo-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          id="btn-add-word-top"
        >
          <Plus className="h-4 w-4" />
          Yangi so'z qo'shish
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5" id="filters-container">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-5 w-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="So'zlarni, tarjimalarni yoki misollarni qidirish..."
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 pl-11 pr-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-indigo-100/50 dark:focus:ring-indigo-900/20 text-sm font-medium"
            id="search-input"
          />
        </div>

        {/* Category & Status Filter Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1" id="filter-selectors">
          {/* Category badges selection */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mr-1.5 inline-flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-indigo-500" />
              Guruh:
            </span>
            {['Barchasi', ...categories.map(c => c.name)].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Selection Buttons */}
          <div className="flex items-center gap-1 rounded-2xl bg-slate-50 dark:bg-slate-950 p-1 border border-slate-100 dark:border-slate-800 self-start lg:self-auto">
            <button
              onClick={() => setSelectedStatus('barchasi')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === 'barchasi'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-xs border border-slate-100 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Hammasi
            </button>
            <button
              onClick={() => setSelectedStatus('learning')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === 'learning'
                  ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-xs border border-slate-100 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-amber-600'
              }`}
            >
              O'rganilmoqda
            </button>
            <button
              onClick={() => setSelectedStatus('mastered')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === 'mastered'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-100 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600'
              }`}
            >
              Yodlangan
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Word Cards */}
      <AnimatePresence mode="popLayout">
        {filteredWords.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900"
            id="empty-list-state"
          >
            <BookMarked className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Hech qanday so'z topilmadi</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              Qidiruv shartlariga mos keladigan so'zlar mavjud emas. Lug'atni boyitish uchun yangi so'z kiriting!
            </p>
            <button
              onClick={onAddWordClick}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-400 font-bold px-4 py-2 text-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              So'z qo'shish
            </button>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            id="words-grid"
          >
            {filteredWords.map((word) => (
              <motion.div
                layout
                key={word.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative overflow-hidden rounded-3xl border p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between group ${
                  word.status === 'mastered' 
                    ? 'border-emerald-100 dark:border-emerald-950 bg-gradient-to-br from-white to-emerald-50/10 dark:from-slate-900 dark:to-emerald-950/10' 
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
                id={`word-card-${word.id}`}
              >
                {/* Header info (Category badge & difficulty) */}
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 px-3 py-1 text-[11px] font-bold border border-indigo-100/30 dark:border-indigo-900/30">
                    {word.category}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase border ${
                      word.status === 'mastered' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' 
                        : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50'
                    }`}>
                      {word.status === 'mastered' ? 'Yodlangan' : "O'rganilmoqda"}
                    </span>
                    
                    {/* Difficulty marker */}
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      word.difficulty === 'easy' ? 'bg-emerald-500' :
                      word.difficulty === 'medium' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} title={`Qiyinchilik: ${word.difficulty === 'easy' ? 'Oson' : word.difficulty === 'medium' ? "O'rtacha" : "Qiyin"}`} />
                  </div>
                </div>

                {/* Core Word Information */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-start justify-between gap-1.5">
                    <h4 className="text-2.5xl font-serif italic text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                      {word.original}
                    </h4>
                    
                    {/* Speak Pronunciation */}
                    <button
                      onClick={() => handleSpeak(word.original, word.id)}
                      className={`rounded-xl p-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                        speakingWordId === word.id 
                          ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950 animate-bounce' 
                          : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                      }`}
                      title="Talaffuzini eshitish"
                    >
                      <Volume2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Translation */}
                  <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold tracking-tight">
                    {word.translation}
                  </p>

                  {/* Additional context */}
                  {word.example && (
                    <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/50 italic font-medium leading-relaxed">
                      "{word.example}"
                    </div>
                  )}

                  {word.notes && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      <span className="text-indigo-500 dark:text-indigo-400 font-semibold">Eslatma:</span> {word.notes}
                    </p>
                  )}
                </div>

                {/* Footer status and actions */}
                <div className="mt-6 pt-4 border-t border-slate-100/80 dark:border-slate-800/80 flex items-center justify-between">
                  {/* Progress Indicator */}
                  <div className="flex items-center gap-1.5" title={`Test o'tish streak: ${word.correctStreak}/3`}>
                    <GraduationCap className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${
                            word.correctStreak >= s 
                              ? 'fill-amber-400 text-amber-400' 
                              : 'text-slate-200 fill-slate-100 dark:text-slate-800 dark:fill-slate-850'
                          }`}
                        />
                      ))}
                    </div>
                    {word.status === 'mastered' && (
                      <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 font-bold" />
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditWord(word)}
                      className="rounded-xl p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                      title="Tahrirlash"
                      id={`edit-btn-${word.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteWord(word.id)}
                      className="rounded-xl p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="O'chirish"
                      id={`delete-btn-${word.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

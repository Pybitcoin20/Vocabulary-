import React, { useState, useEffect } from 'react';
import { Word, Category } from '../types';
import { Plus, X, Sparkles, BookOpen, Layers, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddWordFormProps {
  categories: Category[];
  editingWord: Word | null;
  onSave: (wordData: Omit<Word, 'id' | 'createdAt' | 'correctStreak' | 'status'>) => void;
  onCancel: () => void;
  onAddCategory: (categoryName: string) => void;
}

export default function AddWordForm({ categories, editingWord, onSave, onCancel, onAddCategory }: AddWordFormProps) {
  const [original, setOriginal] = useState('');
  const [translation, setTranslation] = useState('');
  const [category, setCategory] = useState('Umumiy');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [example, setExample] = useState('');
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [error, setError] = useState('');

  // Handle setting initial state when editing a word
  useEffect(() => {
    if (editingWord) {
      setOriginal(editingWord.original);
      setTranslation(editingWord.translation);
      setCategory(editingWord.category);
      setExample(editingWord.example || '');
      setNotes(editingWord.notes || '');
      setDifficulty(editingWord.difficulty);
    } else {
      setOriginal('');
      setTranslation('');
      setCategory('Umumiy');
      setExample('');
      setNotes('');
      setDifficulty('medium');
    }
    setError('');
  }, [editingWord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!original.trim()) {
      setError("Iltimos, yangi so'zni kiriting.");
      return;
    }
    if (!translation.trim()) {
      setError("Iltimos, so'zning tarjimasini kiriting.");
      return;
    }

    onSave({
      original: original.trim(),
      translation: translation.trim(),
      category,
      example: example.trim() || undefined,
      notes: notes.trim() || undefined,
      difficulty,
    });
  };

  const handleAddNewCategory = () => {
    if (!newCategoryName.trim()) return;
    const trimmed = newCategoryName.trim();
    
    // Check if category already exists
    const exists = categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      onAddCategory(trimmed);
      setCategory(trimmed);
    } else {
      const match = categories.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
      if (match) setCategory(match.name);
    }

    setNewCategoryName('');
    setIsAddingNewCategory(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl max-w-2xl mx-auto"
      id="add-word-form-container"
    >
      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950 p-2.5 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100" id="form-title">
              {editingWord ? "So'zni tahrirlash" : "Yangi so'z qo'shish"}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {editingWord ? "Mavjud so'z ma'lumotlarini o'zgartiring" : "Lug'atingizni yangi ibora yoki so'z bilan boyiting"}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="rounded-full bg-slate-50 dark:bg-slate-800 p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
          id="form-btn-close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" id="word-form">
        {error && (
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 p-3.5 text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2" id="form-error">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Inputs row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider block">
              Yangi so'z (Masalan, inglizcha) *
            </label>
            <input
              type="text"
              required
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="Masalan: Challenge, Resilient..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20"
              id="input-original"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider block">
              O'zbekcha tarjimasi *
            </label>
            <input
              type="text"
              required
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="Masalan: Qiyinchilik, chaqiriq..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20"
              id="input-translation"
            />
          </div>
        </div>

        {/* Category selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider block">
              Kategoriya (Guruh)
            </label>
            {!isAddingNewCategory && (
              <button
                type="button"
                onClick={() => setIsAddingNewCategory(true)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                id="btn-trigger-new-cat"
              >
                <Plus className="h-3 w-3" />
                Yangi guruh
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isAddingNewCategory ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2"
                id="new-category-input-container"
              >
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Yangi guruh nomi (masalan: Uy, Biznes)..."
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-4 py-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewCategory();
                    }
                  }}
                  id="input-new-cat"
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 shadow-sm transition-all cursor-pointer"
                  id="btn-save-new-cat"
                >
                  <Check className="h-4.5 w-4.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCategory(false)}
                  className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 p-2.5 transition-all cursor-pointer"
                  id="btn-cancel-new-cat"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap gap-2"
                id="categories-selection-list"
              >
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                      category === cat.name
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Difficulty Select */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider block">
            Qiyinchilik darajasi
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['easy', 'medium', 'hard'] as const).map((level) => {
              const label = level === 'easy' ? "Oson" : level === 'medium' ? "O'rtacha" : "Qiyin";
              const activeColor = 
                level === 'easy' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 ring-2 ring-emerald-100 dark:ring-emerald-950/30' :
                level === 'medium' ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-450 ring-2 ring-amber-100 dark:ring-amber-950/30' :
                'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 ring-2 ring-rose-100 dark:ring-rose-950/30';

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`rounded-xl border py-3 text-center text-sm font-semibold transition-all cursor-pointer ${
                    difficulty === level
                      ? activeColor
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Context: Example Sentence */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider block">
              Misol gap (Tavsiya etiladi)
            </label>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Gap kontekstida yodlash samaraliroq</span>
          </div>
          <textarea
            value={example}
            onChange={(e) => setExample(e.target.value)}
            placeholder="Masalan: This test is a challenge for me."
            rows={2}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 resize-none"
            id="input-example"
          />
        </div>

        {/* Notes or Mnemonics */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider block">
            Qo'shimcha eslatmalar yoki assotsiatsiyalar
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Masalan: 'Challenger' kosmik kemasidan eslab qolish..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20"
            id="input-notes"
          />
        </div>

        {/* Actions row */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            id="btn-cancel-form"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-6 py-3 text-sm font-semibold shadow-md shadow-indigo-200 dark:shadow-none transition-all inline-flex items-center gap-1.5 cursor-pointer"
            id="btn-submit-form"
          >
            <Sparkles className="h-4 w-4" />
            {editingWord ? "O'zgarishlarni saqlash" : "Lug'atga qo'shish"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

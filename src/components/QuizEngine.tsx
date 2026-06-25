import React, { useState, useEffect } from 'react';
import { Word, Category, QuizMode, Question, QuizResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, CheckCircle, XCircle, Volume2, Award, ChevronRight, Check, AlertCircle, HelpCircle, BookOpen, Layers } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface QuizEngineProps {
  words: Word[];
  categories: Category[];
  onCompleteQuiz: (score: number, results: QuizResult[], mode: QuizMode, category: string) => void;
  onNavigate: (tab: 'dashboard' | 'words') => void;
}

export default function QuizEngine({ words, categories, onCompleteQuiz, onNavigate }: QuizEngineProps) {
  // Setup State
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Configuration State
  const [selectedMode, setSelectedMode] = useState<QuizMode>('multiple_choice');
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [quizLength, setQuizLength] = useState(10);

  // Active Quiz State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false); // For Flashcards
  
  // Tracking results
  const [results, setResults] = useState<QuizResult[]>([]);
  const [score, setScore] = useState(0);

  // Filter words available for study based on configuration
  const studyPool = words.filter(w => selectedCategory === 'Barchasi' || w.category === selectedCategory);

  // Generate Questions
  const generateQuiz = () => {
    if (studyPool.length === 0) return;

    // Shuffle words
    const shuffledPool = [...studyPool].sort(() => 0.5 - Math.random());
    // Limit to quiz length
    const selectedWords = shuffledPool.slice(0, Math.min(quizLength, shuffledPool.length));

    const generatedQuestions: Question[] = selectedWords.map((word) => {
      if (selectedMode === 'multiple_choice') {
        // Find incorrect options
        const otherWords = words.filter(w => w.id !== word.id);
        const incorrectTranslations = otherWords
          .map(w => w.translation)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        // Pad distractors if vocabulary is tiny
        while (incorrectTranslations.length < 3) {
          incorrectTranslations.push(`Mavhum Tarjima #${incorrectTranslations.length + 1}`);
        }

        const options = [word.translation, ...incorrectTranslations].sort(() => 0.5 - Math.random());

        return {
          word,
          options,
          correctAnswer: word.translation,
        };
      } else {
        // Spelling & Flashcards don't need multiple options
        return {
          word,
          options: [],
          correctAnswer: word.original,
        };
      }
    });

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setScore(0);
    setResults([]);
    setHasAnswered(false);
    setSelectedChoice(null);
    setUserAnswer('');
    setIsFlipped(false);
    setQuizStarted(true);
    setQuizFinished(false);
  };

  // Sound Engine
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Text-to-speech auto-speak on question loading for auditory learning
  useEffect(() => {
    if (quizStarted && !quizFinished && questions[currentIndex]) {
      // Auto speak spelling or flashcard original on load
      if (selectedMode !== 'multiple_choice' || hasAnswered) {
        // We will speak spelling target
      }
    }
  }, [currentIndex, quizStarted, quizFinished, questions]);

  const handleAnswerSubmit = (chosenAnswer: string) => {
    if (hasAnswered) return;

    const currentQuestion = questions[currentIndex];
    let isCorrect = false;

    if (selectedMode === 'multiple_choice') {
      setSelectedChoice(chosenAnswer);
      isCorrect = chosenAnswer === currentQuestion.correctAnswer;
    } else if (selectedMode === 'spelling') {
      isCorrect = chosenAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    }

    // Mark answered
    setHasAnswered(true);
    if (isCorrect) setScore(prev => prev + 1);

    // Save result
    const result: QuizResult = {
      wordId: currentQuestion.word.id,
      wordText: currentQuestion.word.original,
      translation: currentQuestion.word.translation,
      userAnswer: chosenAnswer,
      correct: isCorrect,
    };
    setResults(prev => [...prev, result]);
  };

  const handleFlashcardMark = (isCorrect: boolean) => {
    const currentQuestion = questions[currentIndex];
    
    if (isCorrect) setScore(prev => prev + 1);

    const result: QuizResult = {
      wordId: currentQuestion.word.id,
      wordText: currentQuestion.word.original,
      translation: currentQuestion.word.translation,
      userAnswer: isCorrect ? 'Bilaman' : 'Eslay olmadim',
      correct: isCorrect,
    };
    setResults(prev => [...prev, result]);

    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setSelectedChoice(null);
      setHasAnswered(false);
      setIsFlipped(false);
    } else {
      // Finish Quiz
      setQuizFinished(true);
      const finalScorePct = Math.round((score / questions.length) * 100);
      onCompleteQuiz(finalScorePct, results, selectedMode, selectedCategory);
    }
  };

  const handleSpellingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    handleAnswerSubmit(userAnswer);
  };

  // Warning if not enough words
  const isSetupDisabled = studyPool.length === 0;

  return (
    <div className="max-w-3xl mx-auto" id="quiz-engine-wrapper">
      <AnimatePresence mode="wait">
        
        {/* Step 1: Configuration Screen */}
        {!quizStarted && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl"
            id="quiz-config-card"
          >
            <div className="text-center max-w-md mx-auto mb-8">
              <div className="inline-flex rounded-full bg-indigo-50 dark:bg-indigo-950 p-4 text-indigo-600 dark:text-indigo-400 mb-4 animate-bounce">
                <Award className="h-8 w-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Bilimingizni sinang</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                O'zingiz kiritgan so'zlar bo'yicha interaktiv test topshiring va xotirangizni mustahkamlang.
              </p>
            </div>

            {isSetupDisabled ? (
              <div className="rounded-2xl border border-dashed border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10 p-6 text-center space-y-4">
                <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200">So'zlar yetarli emas</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                  Siz tanlagan filtrda ("<b>{selectedCategory}</b>") so'zlar topilmadi. Test boshlashdan oldin kamida bitta so'z kiriting.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => { setSelectedCategory('Barchasi') }}
                    className="rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Barcha guruhlar
                  </button>
                  <button
                    onClick={() => onNavigate('words')}
                    className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-xs font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    So'z kiritish
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Mode Select */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Test Rejimi</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Multiple Choice */}
                    <button
                      type="button"
                      onClick={() => setSelectedMode('multiple_choice')}
                      className={`flex flex-col items-center p-4 text-center rounded-2xl border transition-all cursor-pointer ${
                        selectedMode === 'multiple_choice'
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/45 text-indigo-900 dark:text-indigo-300 ring-4 ring-indigo-50 dark:ring-indigo-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <HelpCircle className={`h-6 w-6 mb-2 ${selectedMode === 'multiple_choice' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`} />
                      <span className="font-bold text-sm">Variantli test</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">To'g'ri tarjimani tanlash</span>
                    </button>

                    {/* Spelling */}
                    <button
                      type="button"
                      onClick={() => setSelectedMode('spelling')}
                      className={`flex flex-col items-center p-4 text-center rounded-2xl border transition-all cursor-pointer ${
                        selectedMode === 'spelling'
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/45 text-indigo-900 dark:text-indigo-300 ring-4 ring-indigo-50 dark:ring-indigo-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <CheckCircle className={`h-6 w-6 mb-2 ${selectedMode === 'spelling' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`} />
                      <span className="font-bold text-sm">Yozma test</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">So'zni klaviaturada yozish</span>
                    </button>

                    {/* Flashcards */}
                    <button
                      type="button"
                      onClick={() => setSelectedMode('flashcard')}
                      className={`flex flex-col items-center p-4 text-center rounded-2xl border transition-all cursor-pointer ${
                        selectedMode === 'flashcard'
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/45 text-indigo-900 dark:text-indigo-300 ring-4 ring-indigo-50 dark:ring-indigo-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Layers className={`h-6 w-6 mb-2 ${selectedMode === 'flashcard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`} />
                      <span className="font-bold text-sm">Kartochkalar</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Fliplash va o'zi baholash</span>
                    </button>
                  </div>
                </div>

                {/* Category & Length row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Guruh</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                    >
                      <option value="Barchasi" className="dark:bg-slate-900">Barcha so'zlar ({words.length})</option>
                      {categories.map(c => {
                        const count = words.filter(w => w.category === c.name).length;
                        return (
                          <option key={c.id} value={c.name} disabled={count === 0} className="dark:bg-slate-900">
                            {c.name} ({count} ta so'z)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Savollar soni</label>
                    <div className="flex gap-2">
                      {[5, 10, 20].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setQuizLength(num)}
                          disabled={studyPool.length < num && num !== 5}
                          className={`flex-1 rounded-xl border py-3 text-center text-xs font-bold transition-all cursor-pointer ${
                            quizLength === num
                              ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed'
                          }`}
                        >
                          {num} ta
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={generateQuiz}
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-[0.99] hover:scale-[1.01] cursor-pointer"
                  id="btn-start-quiz"
                >
                  <Play className="h-5 w-5 fill-white" />
                  Testni boshlash
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Running Quiz */}
        {quizStarted && !quizFinished && questions.length > 0 && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
            id="active-quiz-container"
          >
            {/* Header / Tracker */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  Rejim: {selectedMode === 'multiple_choice' ? 'Variantli' : selectedMode === 'spelling' ? 'Yozma tahrir' : 'Kartochka'}
                </span>
                <span className="text-slate-800 dark:text-slate-100 text-sm font-bold">
                  Savol {currentIndex + 1} / {questions.length}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-1/2 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>

              {/* End Quiz button */}
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="text-xs font-semibold text-rose-500 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
              >
                Tugatish
              </button>
            </div>

            {/* Core Card Section */}
            {selectedMode === 'flashcard' ? (
              /* --- FLASHCARD STUDY MODE --- */
              <div className="flex flex-col items-center justify-center space-y-6" id="flashcard-box">
                {/* 3D Flip Card */}
                <div className="perspective-1000 w-full max-w-md h-72 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                  <motion.div 
                    className="relative w-full h-full duration-500 transform-style-3d"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Front side */}
                    <div className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg rounded-3xl p-6 flex flex-col justify-between items-center text-center">
                      <div className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider mt-2">
                        Savol kartochkasi
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                          {questions[currentIndex].word.original}
                        </h3>
                        {questions[currentIndex].word.notes && (
                          <p className="text-xs text-slate-400 dark:text-slate-500">Eslatma: {questions[currentIndex].word.notes}</p>
                        )}
                      </div>

                      <div className="mb-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs inline-flex items-center gap-1">
                        Tarjimasini ko'rish uchun bosing
                      </div>
                    </div>

                    {/* Back side */}
                    <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-900 dark:to-indigo-950/15 border border-indigo-100 dark:border-indigo-900/50 shadow-lg rounded-3xl p-6 flex flex-col justify-between items-center text-center rotate-y-180">
                      <div className="text-indigo-500 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mt-2">
                        To'g'ri javob
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-3xl font-extrabold text-indigo-900 dark:text-indigo-200 tracking-tight">
                          {questions[currentIndex].word.translation}
                        </h3>
                        {questions[currentIndex].word.example && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 italic max-w-xs mt-1 bg-white/60 dark:bg-slate-950/40 p-2 rounded-xl border border-indigo-100/50 dark:border-indigo-950/50">
                            "{questions[currentIndex].word.example}"
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Avoid re-flipping
                          handleSpeak(questions[currentIndex].word.original);
                        }}
                        className="mb-2 rounded-full bg-white dark:bg-slate-800 p-2.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-slate-700 shadow-xs transition-colors cursor-pointer"
                      >
                        <Volume2 className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                </div>

                {/* Self Assessment controls */}
                <div className="flex gap-4 w-full max-w-sm justify-center">
                  <button
                    onClick={() => handleFlashcardMark(false)}
                    className="flex-1 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-400 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <XCircle className="h-5 w-5" />
                    Eslay olmadim
                  </button>
                  <button
                    onClick={() => handleFlashcardMark(true)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-100 dark:shadow-none cursor-pointer"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Yodimda qoldi
                  </button>
                </div>
              </div>
            ) : (
              /* --- MULTIPLE CHOICE OR SPELLING MODE --- */
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-6">
                
                {/* Question Prompt */}
                <div className="text-center py-4 space-y-3">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    {selectedMode === 'multiple_choice' ? "Quyidagi so'zning to'g'ri tarjimasini toping:" : "Berilgan tarjimaning aslini (originalini) yozing:"}
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                      {selectedMode === 'multiple_choice' 
                        ? questions[currentIndex].word.original 
                        : questions[currentIndex].word.translation}
                    </h3>
                    <button
                      onClick={() => handleSpeak(
                        selectedMode === 'multiple_choice' 
                          ? questions[currentIndex].word.original 
                          : questions[currentIndex].word.original
                      )}
                      className="rounded-full bg-slate-50 dark:bg-slate-800 p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer"
                      title="Talaffuzni tinglash"
                    >
                      <Volume2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                  {questions[currentIndex].word.notes && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto italic">
                      Eslatma: {questions[currentIndex].word.notes}
                    </p>
                  )}
                </div>

                {/* Question Inputs */}
                {selectedMode === 'multiple_choice' ? (
                  /* Multiple Choice options grid */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="options-choices">
                    {questions[currentIndex].options.map((option, idx) => {
                      const isCorrectAnswer = option === questions[currentIndex].correctAnswer;
                      const isSelected = selectedChoice === option;
                      
                      let btnStyle = "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700";
                      
                      if (hasAnswered) {
                        if (isCorrectAnswer) {
                          btnStyle = "border-emerald-500 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-bold ring-2 ring-emerald-200 dark:ring-emerald-950/50";
                        } else if (isSelected) {
                          btnStyle = "border-rose-500 dark:border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 font-bold ring-2 ring-rose-200 dark:ring-rose-950/50";
                        } else {
                          btnStyle = "border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/10 text-slate-400 dark:text-slate-600 cursor-not-allowed";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={hasAnswered}
                          onClick={() => handleAnswerSubmit(option)}
                          className={`w-full text-left p-4 rounded-2xl border text-sm font-semibold transition-all duration-200 flex items-center justify-between cursor-pointer ${btnStyle}`}
                        >
                          <span>{option}</span>
                          {hasAnswered && isCorrectAnswer && (
                            <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                          )}
                          {hasAnswered && isSelected && !isCorrectAnswer && (
                            <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Spelling text form input */
                  <form onSubmit={handleSpellingSubmit} className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={userAnswer}
                        disabled={hasAnswered}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Inglizcha so'zni kiriting..."
                        autoFocus
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-5 py-4 text-slate-800 dark:text-slate-100 text-lg font-semibold placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 disabled:opacity-75"
                        id="spelling-test-input"
                      />
                      {!hasAnswered && (
                        <button
                          type="submit"
                          disabled={!userAnswer.trim()}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-indigo-600 text-white font-bold text-xs rounded-xl px-4 py-2 hover:bg-indigo-700 transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          Tekshirish
                        </button>
                      )}
                    </div>

                    {/* Reveal feedback on check */}
                    {hasAnswered && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl p-4 border flex items-start gap-3 ${
                          results[results.length - 1]?.correct
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/40 text-rose-800 dark:text-rose-300'
                        }`}
                        id="spelling-feedback"
                      >
                        {results[results.length - 1]?.correct ? (
                          <>
                            <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-extrabold text-sm">To'g'ri javob!</p>
                              <p className="text-xs mt-0.5">Siz to'g'ri yozdingiz. Omadli davom eting.</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-extrabold text-sm">Xato javob!</p>
                              <p className="text-xs mt-1">
                                Siz kiritganingiz: <span className="line-through font-semibold text-rose-900 dark:text-rose-400">{userAnswer}</span>
                              </p>
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                                To'g'ri yozilishi: <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded-lg font-bold">{questions[currentIndex].correctAnswer}</span>
                              </p>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </form>
                )}

                {/* Next button */}
                {hasAnswered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-end pt-2"
                  >
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 text-sm flex items-center gap-1 shadow-md shadow-indigo-100 dark:shadow-none transition-all active:scale-95 cursor-pointer"
                      id="btn-next-question"
                    >
                      Keyingisi
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Finished / Results Screen */}
        {quizStarted && quizFinished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8"
            id="quiz-results-card"
          >
            {/* Visual Header */}
            <div className="text-center max-w-sm mx-auto space-y-4">
              <div className="inline-flex rounded-full bg-indigo-50 dark:bg-indigo-950/40 p-5 text-indigo-600 dark:text-indigo-400 relative">
                <Award className="h-12 w-12" />
                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500 text-[10px] font-bold text-white">
                  100
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Natijalar</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Test yakunlandi! Natijangiz quyidagicha shakllandi.
                </p>
              </div>
              
              {/* Dynamic Rating */}
              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl py-3 px-5 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold block uppercase">Baholash</span>
                <span className="text-xl font-bold text-slate-700 dark:text-slate-200">
                  {Math.round((score / questions.length) * 100) >= 80 ? 'Ajoyib! Mukammal natija 🏆' :
                   Math.round((score / questions.length) * 100) >= 50 ? 'Yaxshi! Yanada harakat qiling 👍' :
                   'Yomon emas, ko\'proq yodlang! 📚'}
                </span>
              </div>
            </div>

            {/* Score Grid Info */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl p-4 border border-indigo-100/30 dark:border-indigo-900/30">
                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 uppercase font-extrabold block">To'g'ri</span>
                <span className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300 block mt-1">{score} ta</span>
              </div>
              <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl p-4 border border-rose-100/30 dark:border-rose-900/30">
                <span className="text-[10px] text-rose-500 dark:text-rose-400 uppercase font-extrabold block">Xato</span>
                <span className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 block mt-1">{questions.length - score} ta</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-extrabold block">Foiz</span>
                <span className="text-2xl font-extrabold text-slate-700 dark:text-slate-300 block mt-1">
                  {Math.round((score / questions.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Detailed Question Review List */}
            <div className="space-y-3.5">
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Xatolar va javoblar tahlili</h3>
              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1" id="review-list">
                {results.map((res, i) => (
                  <div key={i} className={`flex items-start justify-between rounded-xl p-3 text-sm border ${
                    res.correct 
                      ? 'border-emerald-100 dark:border-emerald-950 bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-300' 
                      : 'border-rose-100 dark:border-rose-950 bg-rose-50/20 dark:bg-rose-950/10 text-rose-800 dark:text-rose-300'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">{res.wordText}</span>
                        <span className="text-slate-400 dark:text-slate-600">/</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{res.translation}</span>
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        Siz kiritganingiz: <span className={`font-semibold ${res.correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-450'}`}>{res.userAnswer}</span>
                      </div>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {res.correct ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setQuizStarted(false)}
                className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700 font-semibold py-3.5 text-center transition-all cursor-pointer"
              >
                Mening sahifamga qaytish
              </button>
              <button
                type="button"
                onClick={generateQuiz}
                className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 text-center shadow-lg shadow-indigo-100 dark:shadow-none transition-all cursor-pointer"
              >
                Qayta urinish
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Test cancellation confirm modal */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        title="Testni bekor qilish"
        message="Haqiqatan ham testni bekor qilmoqchimisiz? Natijangiz saqlanmaydi."
        confirmLabel="Bekor qilish"
        cancelLabel="Davom ettirish"
        variant="warning"
        onConfirm={() => {
          setQuizStarted(false);
          setShowCancelConfirm(false);
        }}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
}

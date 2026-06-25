export interface Word {
  id: string;
  original: string;      // The foreign/new word (e.g. English "Challenge")
  translation: string;   // The translation (e.g. Uzbek "Qiyinchilik, chaqiriq")
  category: string;      // Category (e.g. "Fe'llar", "Sayohat", "Umumiy")
  example?: string;      // Optional example sentence
  notes?: string;        // Optional notes or mnemonic
  difficulty: 'easy' | 'medium' | 'hard';
  correctStreak: number; // Streak of correct answers in quiz
  status: 'learning' | 'mastered'; // Status based on memorization streak
  createdAt: string;
  lastTestedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind color class (e.g. "bg-emerald-500")
}

export type QuizMode = 'multiple_choice' | 'spelling' | 'flashcard';

export interface Question {
  word: Word;
  options: string[]; // For multiple choice
  correctAnswer: string;
}

export interface QuizResult {
  wordId: string;
  wordText: string;
  translation: string;
  userAnswer: string;
  correct: boolean;
}

export interface TestHistory {
  id: string;
  date: string;
  totalQuestions: number;
  score: number;
  mode: QuizMode;
  category: string; // "Barchasi" or specific category
}

export interface StudyStats {
  totalWords: number;
  learningCount: number;
  masteredCount: number;
  streakDays: number;
  lastStudyDate?: string;
  totalTestsTaken: number;
  averageScore: number;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  avatar: string; // Avatar seed or index
  createdAt: string;
  passwordHash: string; // Standard password verification representation
}


import { User, Word, Category, TestHistory } from "../types";

export interface SyncUserDataPayload {
  words: Word[];
  categories: Category[];
  history: TestHistory[];
  streak: number;
  lastStudyDate?: string;
}

// Get global list of users from the server
export async function fetchUsersDbFromServer(): Promise<User[] | null> {
  try {
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        localStorage.setItem("yodlash_users_db", JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.error("Failed to fetch users database from server:", err);
  }
  return null;
}

// Upload global list of users to the server
export async function syncUsersDbToServer(users: User[]): Promise<boolean> {
  try {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(users),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to sync users database to server:", err);
    return false;
  }
}

// Get user's vocabulary data from the server
export async function fetchUserDataFromServer(userId: string): Promise<SyncUserDataPayload | null> {
  try {
    const res = await fetch(`/api/sync/${userId}`);
    if (res.ok) {
      const payload = await res.json();
      if (payload && payload.found && payload.data) {
        const data = payload.data as SyncUserDataPayload;
        
        // Save to localStorage so they are available offline
        localStorage.setItem(`yodlash_words_${userId}`, JSON.stringify(data.words || []));
        localStorage.setItem(`yodlash_categories_${userId}`, JSON.stringify(data.categories || []));
        localStorage.setItem(`yodlash_history_${userId}`, JSON.stringify(data.history || []));
        localStorage.setItem(`yodlash_streak_${userId}`, (data.streak ?? 0).toString());
        if (data.lastStudyDate) {
          localStorage.setItem(`yodlash_last_study_${userId}`, data.lastStudyDate);
        } else {
          localStorage.removeItem(`yodlash_last_study_${userId}`);
        }
        
        return data;
      }
    }
  } catch (err) {
    console.error(`Failed to fetch user data for ${userId} from server:`, err);
  }
  return null;
}

// Upload user's vocabulary data to the server
export async function syncUserDataToServer(userId: string, data: SyncUserDataPayload): Promise<boolean> {
  try {
    const res = await fetch(`/api/sync/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.error(`Failed to sync user data for ${userId} to server:`, err);
    return false;
  }
}

// Comprehensive sync utility to send all current local storage data for a user to the server
export async function syncAllLocalDataToServer(userId: string): Promise<boolean> {
  const wordsRaw = localStorage.getItem(`yodlash_words_${userId}`);
  const categoriesRaw = localStorage.getItem(`yodlash_categories_${userId}`);
  const historyRaw = localStorage.getItem(`yodlash_history_${userId}`);
  const streakRaw = localStorage.getItem(`yodlash_streak_${userId}`);
  const lastStudyRaw = localStorage.getItem(`yodlash_last_study_${userId}`);

  const data: SyncUserDataPayload = {
    words: wordsRaw ? JSON.parse(wordsRaw) : [],
    categories: categoriesRaw ? JSON.parse(categoriesRaw) : [],
    history: historyRaw ? JSON.parse(historyRaw) : [],
    streak: streakRaw ? parseInt(streakRaw, 10) : 0,
    lastStudyDate: lastStudyRaw || undefined,
  };

  return syncUserDataToServer(userId, data);
}

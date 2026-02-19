import type { AppState, SessionData, QuizAttempt, PromptAsset, TutorMessage, UserSettings } from "./types";
import { todayISO, isYesterday, isToday } from "./date";

const STORAGE_KEY = "ai-mastery-os";

const defaultState: AppState = {
  streakCount: 0,
  lastSessionDate: "",
  sessionsByDate: {},
  quizAttempts: [],
  promptAssets: [],
  notesByWeek: {},
  settings: {
    startDate: "",
    provider: "openai",
    darkMode: true,
  },
  tutorHistory: [],
};

export function getState(): AppState {
  if (typeof window === "undefined") return { ...defaultState };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...defaultState, ...parsed };
  } catch {
    return { ...defaultState };
  }
}

export function setState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function updateState(updater: (s: AppState) => AppState): AppState {
  const s = getState();
  const next = updater(s);
  setState(next);
  return next;
}

export function saveSession(date: string, session: SessionData): AppState {
  return updateState((s) => {
    const next = { ...s, sessionsByDate: { ...s.sessionsByDate, [date]: session } };
    // Update streak
    if (isToday(date)) {
      if (s.lastSessionDate === "" || isYesterday(s.lastSessionDate)) {
        next.streakCount = s.streakCount + 1;
      } else if (!isToday(s.lastSessionDate)) {
        next.streakCount = 1;
      }
      next.lastSessionDate = date;
    }
    return next;
  });
}

export function saveQuizAttempt(attempt: QuizAttempt): AppState {
  return updateState((s) => ({
    ...s,
    quizAttempts: [...s.quizAttempts, attempt],
  }));
}

export function savePromptAsset(asset: PromptAsset): AppState {
  return updateState((s) => ({
    ...s,
    promptAssets: [...s.promptAssets, asset],
  }));
}

export function saveNote(weekId: number, markdown: string): AppState {
  return updateState((s) => ({
    ...s,
    notesByWeek: { ...s.notesByWeek, [weekId.toString()]: markdown },
  }));
}

export function saveTutorHistory(messages: TutorMessage[]): AppState {
  return updateState((s) => ({
    ...s,
    tutorHistory: messages,
  }));
}

export function saveSettings(settings: UserSettings): AppState {
  return updateState((s) => ({
    ...s,
    settings,
  }));
}

export function resetAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function exportAllData(): string {
  return JSON.stringify(getState(), null, 2);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

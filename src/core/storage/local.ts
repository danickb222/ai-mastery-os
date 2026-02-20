/** Safe localStorage helpers — never throw, never read during SSR. */

export function safeJSONParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return safeJSONParse<T>(raw, fallback);
  } catch {
    return fallback;
  }
}

export function safeWrite<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`[safeWrite] Failed to write key "${key}"`);
  }
}

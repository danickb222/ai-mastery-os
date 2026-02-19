export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function parseISO(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00");
}

export function daysBetween(a: string, b: string): number {
  const da = parseISO(a);
  const db = parseISO(b);
  return Math.floor((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

export function weeksSince(startDate: string): number {
  const days = daysBetween(startDate, todayISO());
  return Math.max(0, Math.floor(days / 7));
}

export function currentWeekId(startDate: string | null): number {
  if (!startDate) return 1;
  const w = weeksSince(startDate) + 1;
  return Math.min(w, 24);
}

export function formatDate(dateStr: string): string {
  const d = parseISO(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isYesterday(dateStr: string): boolean {
  return daysBetween(dateStr, todayISO()) === 1;
}

export function isToday(dateStr: string): boolean {
  return dateStr === todayISO();
}

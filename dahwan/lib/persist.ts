// Small localStorage helpers for remembering the user's inputs and simple
// usage stats across visits. Guarded for SSR/static export: reading during
// build (no `window`) always falls back silently.

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota/private-mode errors — persistence is a nice-to-have
  }
}

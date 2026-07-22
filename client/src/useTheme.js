import { useCallback, useEffect, useLayoutEffect, useState } from "react";

const STORAGE_KEY = "crackin-theme";

const isTheme = (v) => v === "light" || v === "dark";

/**
 * Read the initial theme synchronously so we never flash the wrong palette.
 * Priority: localStorage > system preference > "light".
 */
function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    // localStorage may be blocked (private mode, etc.) — fall through
  }
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Theme management: applies data-theme to <html> on mount before paint,
 * syncs user choice to localStorage, and exposes a toggle.
 */
export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  // Apply before paint to avoid flash.
  useIsoLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Persist on change.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // noop
    }
  }, [theme]);

  // Track system changes only when the user has no explicit preference.
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const onChange = (e) => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (isTheme(stored)) return; // user override wins
      } catch {
        /* noop */
      }
      setTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return { theme, setTheme, toggleTheme };
}
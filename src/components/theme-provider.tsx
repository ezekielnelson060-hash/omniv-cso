"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type ThemePreference = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

const ThemeCtx = createContext<{
  preference: ThemePreference;
  theme: ResolvedTheme;
  setPreference: (t: ThemePreference) => void;
  toggle: () => void;
}>({
  preference: "dark",
  theme: "dark",
  setPreference: () => {},
  toggle: () => {},
});

function resolve(pref: ThemePreference): ResolvedTheme {
  if (pref === "system") {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    }
    return "dark";
  }
  return pref;
}

function apply(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("light", resolved === "light");
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("dark");
  const [theme, setTheme] = useState<ResolvedTheme>("dark");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("omniv-theme") as ThemePreference | null;
      const pref: ThemePreference =
        stored === "light" || stored === "dark" || stored === "system"
          ? stored
          : "dark";
      setPreferenceState(pref);
      const resolved = resolve(pref);
      setTheme(resolved);
      apply(resolved);
    } catch {
      apply("dark");
    }
  }, []);

  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      const resolved = resolve("system");
      setTheme(resolved);
      apply(resolved);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback((t: ThemePreference) => {
    setPreferenceState(t);
    const resolved = resolve(t);
    setTheme(resolved);
    apply(resolved);
    try {
      localStorage.setItem("omniv-theme", t);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setPreference(theme === "dark" ? "light" : "dark");
  }, [theme, setPreference]);

  return (
    <ThemeCtx.Provider value={{ preference, theme, setPreference, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}

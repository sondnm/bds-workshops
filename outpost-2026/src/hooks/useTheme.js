import { useEffect, useState } from "react";

const THEME_KEY = "outpost_theme";

export function useTheme() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      return;
    }
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_KEY, next);
      }
      return next;
    });
  };

  return { theme, toggleTheme };
}

"use client";

import React, { useState, useEffect } from "react";

interface ThemeToggleProps {
  variant?: "icon" | "menu-item";
}

export default function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (storedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  };

  if (!mounted) {
    return variant === "menu-item" ? <div className="h-8 w-full" /> : <div className="w-9 h-9" />;
  }

  if (variant === "menu-item") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          {theme === "dark" ? (
            <svg
              className="w-4 h-4 text-amber-400 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25m-13.5 0H3m15.364-6.364l-1.591 1.591M6.343 17.657l-1.591 1.591m12.728 0l-1.591-1.591M6.343 6.343L4.752 4.752M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-slate-500 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
              />
            </svg>
          )}
          <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
        </div>

        {/* Toggle Switch Pill */}
        <div
          className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${
            theme === "dark" ? "bg-[#005f37]" : "bg-slate-300"
          } flex items-center`}
        >
          <div
            className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transform transition-transform ${
              theme === "dark" ? "translate-x-3.5" : "translate-x-0"
            }`}
          />
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative cursor-pointer flex items-center justify-center"
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="w-5 h-5 text-amber-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25m-13.5 0H3m15.364-6.364l-1.591 1.591M6.343 17.657l-1.591 1.591m12.728 0l-1.591-1.591M6.343 6.343L4.752 4.752M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="w-5 h-5 text-slate-700"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      )}
    </button>
  );
}

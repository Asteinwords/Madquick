'use client';
import { useState, useEffect } from 'react';

export default function DarkModeToggle() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDarkMode(localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches));
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', darkMode);
      localStorage.theme = darkMode ? 'dark' : 'light';
    }
  }, [darkMode, mounted]);

  if (!mounted) return null;

  return (
    <button onClick={() => setDarkMode(!darkMode)} className="flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-200 hover:from-blue-500 to-purple-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
      {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}
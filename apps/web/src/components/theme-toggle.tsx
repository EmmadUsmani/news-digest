import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from './ui/button';

const key = 'news-digest-theme';
function savedTheme() {
  try {
    const value = localStorage.getItem(key);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      const saved = savedTheme();
      const next = saved ? saved === 'dark' : media.matches;
      document.documentElement.classList.toggle('dark', next);
      setDark(next);
    };
    media.addEventListener('change', sync);
    const storage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) sync();
    };
    window.addEventListener('storage', storage);
    sync();
    return () => {
      media.removeEventListener('change', sync);
      window.removeEventListener('storage', storage);
    };
  }, []);
  return (
    <Button
      className="min-h-11 min-w-11 shrink-0 cursor-pointer border-0 text-foreground"
      variant="ghost"
      size="icon"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => {
        const next = !dark;
        try {
          localStorage.setItem(key, next ? 'dark' : 'light');
        } catch {
          /* The current tab still works when storage is unavailable. */
        }
        document.documentElement.classList.toggle('dark', next);
        setDark(next);
      }}
    >
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  );
}

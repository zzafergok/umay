'use client';

import { useCallback } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { CompactControl } from '@/components/shared/compact-control';
import { useMounted } from '@/hooks/use-mounted';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  if (!mounted) {
    return (
      <CompactControl className="w-10 p-0 md:w-9" aria-label="Tema seçici" />
    );
  }

  return (
    <CompactControl
      onClick={toggleTheme}
      className="w-10 p-0 md:w-9"
      aria-label={
        resolvedTheme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'
      }
      title={resolvedTheme === 'dark' ? 'Açık tema' : 'Koyu tema'}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </CompactControl>
  );
}

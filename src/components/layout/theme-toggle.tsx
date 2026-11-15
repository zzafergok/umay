'use client';

import type * as React from 'react';
import { useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { CompactControl } from '@/components/shared/compact-control';
import { useMounted } from '@/hooks/use-mounted';
import { switchThemeWithTransition } from '@/lib/utils/theme-transition';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  const toggleTheme = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
      void switchThemeWithTransition(nextTheme, setTheme, event);
    },
    [resolvedTheme, setTheme],
  );

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
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={resolvedTheme}
          initial={{ y: -16, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 16, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="absolute flex items-center justify-center"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4" aria-hidden="true" />
          )}
        </motion.div>
      </AnimatePresence>
    </CompactControl>
  );
}

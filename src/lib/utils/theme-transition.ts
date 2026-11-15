import type * as React from 'react';
import { flushSync } from 'react-dom';

export type ThemeMode = 'light' | 'dark' | 'system';

function resolveThemeMode(theme: ThemeMode): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function resolveOrigin(event?: React.MouseEvent<HTMLElement>): {
  x: number;
  y: number;
} {
  const hasPointer =
    event !== undefined && (event.clientX !== 0 || event.clientY !== 0);
  if (hasPointer) {
    return { x: event.clientX, y: event.clientY };
  }

  const rect = event?.currentTarget.getBoundingClientRect();
  if (rect) {
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
}

/**
 * Runs a circular View Transition clip-path animation when switching themes,
 * falling back to an immediate switch when unsupported or reduced-motion is active.
 */
export async function switchThemeWithTransition(
  nextTheme: ThemeMode,
  setTheme: (theme: string) => void,
  event?: React.MouseEvent<HTMLElement>,
): Promise<void> {
  if (
    typeof document === 'undefined' ||
    typeof document.startViewTransition !== 'function' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    setTheme(nextTheme);
    return;
  }

  const { x, y } = resolveOrigin(event);
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  const resolved = resolveThemeMode(nextTheme);
  const root = document.documentElement;

  try {
    const transition = document.startViewTransition(() => {
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
      root.style.colorScheme = resolved;
      flushSync(() => {
        setTheme(nextTheme);
      });
    });

    await transition.ready;

    root.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      },
    );
  } catch {
    setTheme(nextTheme);
  }
}

import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-display',
        'text-display-sm',
        'text-title',
        'text-body',
        'text-body-sm',
        'text-caption',
        'text-metric',
        'text-compact',
        'text-2xs',
      ],
      shadow: ['shadow-float'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

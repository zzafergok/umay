'use client';

import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/core/button';
import { TooltipComponent } from '@/components/core/tooltip';
import { cn } from '@/lib/utils';

export interface InfoTooltipProps {
  content: ReactNode;
  ariaLabel?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
  iconClassName?: string;
}

/** Accessible info icon trigger displaying an explanatory tooltip on hover or keyboard focus. */
export function InfoTooltip({
  content,
  ariaLabel = 'Açıklama bilgisi',
  side = 'top',
  align = 'center',
  className,
  iconClassName,
}: InfoTooltipProps) {
  return (
    <TooltipComponent
      content={content}
      side={side}
      align={align}
      delayDuration={150}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={ariaLabel}
        className={cn(
          'text-text-muted hover:bg-surface-sunken hover:text-text size-4 shrink-0 rounded-full p-0',
          className,
        )}
      >
        <Info className={cn('h-3 w-3', iconClassName)} aria-hidden="true" />
      </Button>
    </TooltipComponent>
  );
}

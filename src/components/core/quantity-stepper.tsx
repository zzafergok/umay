'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/core/button';
import { cn } from '@/lib/utils';

export interface QuantityStepperProps {
  value: number;
  unit?: string;
  min?: number;
  step?: number;
  disabled?: boolean;
  isLoading?: boolean;
  onDecrement: () => void;
  onIncrement: () => void;
  decrementLabel?: string;
  incrementLabel?: string;
  className?: string;
}

/**
 * Touch-friendly (>= 44px) quantity stepper with metric tabular-nums readout and long-press repeat.
 */
export function QuantityStepper({
  value,
  unit,
  min = 0,
  disabled = false,
  isLoading = false,
  onDecrement,
  onIncrement,
  decrementLabel = 'Azalt',
  incrementLabel = 'Artır',
  className,
}: QuantityStepperProps) {
  const canDecrement = !disabled && !isLoading && value > min;
  const canIncrement = !disabled && !isLoading;

  const holdTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const didRepeatRef = React.useRef(false);

  const stopHold = React.useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  React.useEffect(() => stopHold, [stopHold]);

  const startHold = (action: () => void, allowed: boolean) => {
    if (!allowed) return;
    stopHold();
    didRepeatRef.current = false;
    holdTimeoutRef.current = setTimeout(() => {
      didRepeatRef.current = true;
      action();
      holdIntervalRef.current = setInterval(action, 110);
    }, 380);
  };

  const handleTap = (action: () => void) => {
    if (didRepeatRef.current) {
      didRepeatRef.current = false;
      return;
    }
    action();
  };

  return (
    <div
      data-slot="quantity-stepper"
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-border bg-surface p-0.5',
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => handleTap(onDecrement)}
        onPointerDown={() => startHold(onDecrement, canDecrement)}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        disabled={!canDecrement}
        aria-label={decrementLabel}
        className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-sm"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </Button>
      <div className="flex min-w-[4rem] items-baseline justify-center gap-1 px-2 text-center">
        <span className="font-heading text-metric tabular-nums text-text">
          {value}
        </span>
        {unit ? (
          <span className="text-caption text-text-muted">{unit}</span>
        ) : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => handleTap(onIncrement)}
        onPointerDown={() => startHold(onIncrement, canIncrement)}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        disabled={!canIncrement}
        aria-label={incrementLabel}
        className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-sm"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

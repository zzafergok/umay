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
 * Touch-friendly (>= 44px) quantity stepper with tabular-nums readout.
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

  return (
    <div
      data-slot="quantity-stepper"
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border border-border bg-background p-0.5',
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onDecrement}
        disabled={!canDecrement}
        aria-label={decrementLabel}
        className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-sm"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </Button>
      <div className="flex min-w-[3.5rem] items-baseline justify-center gap-1 px-2 text-center">
        <span className="text-base font-semibold tabular-nums text-foreground">
          {value}
        </span>
        {unit ? (
          <span className="text-xs text-muted-foreground">{unit}</span>
        ) : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onIncrement}
        disabled={!canIncrement}
        aria-label={incrementLabel}
        className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-sm"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

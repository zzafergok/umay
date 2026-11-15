'use client';

import type { LucideIcon } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/core/button';
import { TooltipComponent } from '@/components/core/tooltip';
import { cn } from '@/lib/utils';

export interface TableActionButtonProps extends Omit<ButtonProps, 'children'> {
  icon: LucideIcon;
  tooltip: string;
  iconClassName?: string;
  tone?: 'default' | 'danger';
}

/** Icon-only table action button wrapped with a descriptive hover/focus tooltip. */
export function TableActionButton({
  icon: Icon,
  tooltip,
  iconClassName,
  tone = 'default',
  className,
  size = 'icon-sm',
  variant = 'ghost',
  type = 'button',
  ...props
}: TableActionButtonProps) {
  return (
    <TooltipComponent content={tooltip} delayDuration={200}>
      <span className="inline-flex">
        <Button
          type={type}
          size={size}
          variant={variant}
          className={cn(
            tone === 'danger' &&
              'text-danger/80 hover:bg-danger-subtle hover:text-danger',
            className,
          )}
          {...props}
        >
          <Icon
            className={cn('h-3.5 w-3.5', iconClassName)}
            aria-hidden="true"
          />
        </Button>
      </span>
    </TooltipComponent>
  );
}

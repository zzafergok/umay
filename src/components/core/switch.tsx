'use client';

import * as React from 'react';
import { Switch as SwitchPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

export interface SwitchProps extends React.ComponentPropsWithoutRef<
  typeof SwitchPrimitive.Root
> {
  size?: 'default' | 'sm';
}

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size = 'default', ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    data-slot="switch"
    data-size={size}
    className={cn(
      'group/switch peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent outline-none transition-colors',
      '',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'aria-invalid:border-danger',
      'data-[state=checked]:bg-accent data-[state=unchecked]:bg-border-strong',
      'data-[size=default]:h-5 data-[size=default]:w-9',
      'data-[size=sm]:h-4 data-[size=sm]:w-7',
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      data-slot="switch-thumb"
      className={cn(
        'pointer-events-none block rounded-full bg-white transition-transform group-data-[state=checked]/switch:bg-on-accent dark:group-data-[state=unchecked]/switch:bg-text',
        'data-[size=default]:size-4 data-[size=sm]:size-3',
        'data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
        'rtl:data-[state=checked]:-translate-x-4',
        'group-data-[size=sm]/switch:data-[state=checked]:translate-x-3 group-data-[size=sm]/switch:rtl:data-[state=checked]:-translate-x-3',
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

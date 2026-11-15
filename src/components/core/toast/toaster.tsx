'use client';

import * as React from 'react';
import { Toast as ToastPrimitive } from '@base-ui/react';
import {
  CheckCircle2Icon,
  InfoIcon,
  AlertTriangleIcon,
  ClockIcon,
  Loader2Icon,
  XIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from './toast-manager';

function ToastIcon({ type }: { type?: string }) {
  switch (type) {
    case 'success':
      return <CheckCircle2Icon className="size-4 shrink-0 text-success" />;
    case 'error':
      return <AlertTriangleIcon className="text-danger size-4 shrink-0" />;
    case 'warning':
      return <ClockIcon className="size-4 shrink-0 text-warning" />;
    case 'loading':
      return (
        <Loader2Icon className="text-text-muted size-4 shrink-0 animate-spin" />
      );
    case 'info':
      return <InfoIcon className="size-4 shrink-0 text-info" />;
    default:
      return null;
  }
}

export function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();
  const visibleToasts = toasts.slice(-1);

  return (
    <>
      {visibleToasts.map((t) => (
        <ToastPrimitive.Root
          key={t.id}
          toast={t}
          data-slot="toast"
          className={cn(
            'group/toast dark:border-border-strong bg-surface-raised text-text shadow-float pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-md border border-border p-4 transition-all duration-150',
            'data-[starting-style]:translate-y-2 data-[starting-style]:opacity-0',
            'data-[ending-style]:translate-y-2 data-[ending-style]:opacity-0',
          )}
        >
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <ToastIcon type={t.type} />
            <div className="grid min-w-0 flex-1 gap-0.5">
              {t.title && (
                <ToastPrimitive.Title
                  data-slot="toast-title"
                  className="text-body-sm text-text font-medium"
                >
                  {t.title}
                </ToastPrimitive.Title>
              )}
              {t.description && (
                <ToastPrimitive.Description
                  data-slot="toast-description"
                  className="text-text-muted text-caption"
                >
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
          </div>
          {t.actionProps && (
            <ToastPrimitive.Action
              data-slot="toast-action"
              {...t.actionProps}
              className={cn(
                'bg-surface text-text hover:bg-surface-sunken focus-visible:ring-offset-surface-raised inline-flex h-8 shrink-0 items-center justify-center rounded-sm border border-border px-2.5 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                t.actionProps.className,
              )}
            />
          )}
          <ToastPrimitive.Close
            data-slot="toast-close"
            aria-label="Kapat"
            className="text-text-muted hover:bg-surface-sunken hover:text-text focus-visible:ring-offset-surface-raised shrink-0 rounded-sm p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <XIcon className="size-4" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
    </>
  );
}

export function Toaster({
  position = 'bottom-right',
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport> & {
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'bottom-center';
}) {
  return (
    <ToastPrimitive.Provider toastManager={toast}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport
          data-slot="toast-viewport"
          className={cn(
            'fixed z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[420px]',
            position === 'bottom-right' &&
              'bottom-[calc(4rem+env(safe-area-inset-bottom))] right-0 md:bottom-4',
            position === 'bottom-left' &&
              'bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 md:bottom-4',
            position === 'top-right' && 'right-0 top-0',
            position === 'top-left' && 'left-0 top-0',
            position === 'top-center' && 'left-1/2 top-0 -translate-x-1/2',
            position === 'bottom-center' &&
              'bottom-[calc(4rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 md:bottom-4',
            className,
          )}
          {...props}
        >
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}

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
      return <AlertTriangleIcon className="size-4 shrink-0 text-danger" />;
    case 'warning':
      return <ClockIcon className="size-4 shrink-0 text-warning" />;
    case 'loading':
      return (
        <Loader2Icon className="size-4 shrink-0 animate-spin text-text-muted" />
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
            'group/toast pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-md border border-border bg-surface-raised p-4 text-text shadow-float transition-all duration-150 dark:border-border-strong',
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
                  className="text-body-sm font-medium text-text"
                >
                  {t.title}
                </ToastPrimitive.Title>
              )}
              {t.description && (
                <ToastPrimitive.Description
                  data-slot="toast-description"
                  className="text-caption text-text-muted"
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
                'inline-flex h-8 shrink-0 items-center justify-center rounded-sm border border-border bg-surface px-2.5 text-caption font-medium text-text transition-colors hover:bg-surface-sunken focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
                t.actionProps.className,
              )}
            />
          )}
          <ToastPrimitive.Close
            data-slot="toast-close"
            aria-label="Kapat"
            className="shrink-0 rounded-sm p-1 text-text-muted transition-colors hover:bg-surface-sunken hover:text-text focus-visible:outline-none"
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

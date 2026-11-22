'use client';

import * as React from 'react';
import { XIcon } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { useComposedRefs } from '@radix-ui/react-compose-refs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/core/button';

export function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

export function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

export function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

export function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-text/35 backdrop-blur-[3px] dark:bg-bg/75',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  );
}

function isPortalledFormControl(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest('[data-radix-popper-content-wrapper]') !== null
  );
}

function isInsideDialogContent(
  target: EventTarget | null,
  content: HTMLElement | null,
): boolean {
  return target instanceof Node && Boolean(content?.contains(target));
}

export interface DialogContentProps extends React.ComponentProps<
  typeof DialogPrimitive.Content
> {
  dismissible?: boolean;
  showCloseButton?: boolean;
  hideCloseButton?: boolean;
  mobilePresentation?: 'center' | 'sheet';
}

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      className,
      children,
      dismissible = true,
      showCloseButton = true,
      hideCloseButton = false,
      mobilePresentation = 'center',
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      style,
      ...props
    },
    ref,
  ) => {
    const shouldShowCloseButton =
      dismissible && !hideCloseButton && showCloseButton;
    const contentRef = React.useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, contentRef);

    const shouldKeepDialogOpen = (target: EventTarget | null): boolean =>
      isPortalledFormControl(target) ||
      isInsideDialogContent(target, contentRef.current);

    const presentationClasses =
      mobilePresentation === 'sheet'
        ? 'inset-x-0 bottom-0 top-auto translate-x-0 translate-y-0 max-h-[94dvh] w-full max-w-full rounded-t-[24px] rounded-b-none gap-2.5 p-3.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:bottom-auto sm:left-[50%] sm:top-[50%] sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100%-2rem)] sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:gap-4 sm:rounded-2xl sm:p-6'
        : 'left-[50%] top-[50%] max-h-[calc(100dvh-2rem)] w-[calc(100%-1.5rem)] max-w-[calc(100%-1.5rem)] translate-x-[-50%] translate-y-[-50%] rounded-2xl sm:w-[calc(100%-2rem)] sm:max-w-lg sm:p-6';

    return (
      <DialogPortal data-slot="dialog-portal">
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={composedRef}
          data-slot="dialog-content"
          style={{
            ...style,
            pointerEvents: 'auto',
          }}
          className={cn(
            'fixed z-50 grid min-w-0 grid-cols-1 gap-3 overflow-y-auto overflow-x-hidden border border-border bg-surface-raised p-4 text-text shadow-float outline-none duration-200 dark:border-border-strong sm:gap-4',
            presentationClasses,
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            className,
          )}
          onEscapeKeyDown={(event) => {
            onEscapeKeyDown?.(event);
            if (!event.defaultPrevented && !dismissible) {
              event.preventDefault();
            }
          }}
          onPointerDownOutside={(event) => {
            onPointerDownOutside?.(event);
            if (
              !event.defaultPrevented &&
              (!dismissible || shouldKeepDialogOpen(event.target))
            ) {
              event.preventDefault();
            }
          }}
          onFocusOutside={(event) => {
            onFocusOutside?.(event);
            if (
              !event.defaultPrevented &&
              (!dismissible || shouldKeepDialogOpen(event.target))
            ) {
              event.preventDefault();
            }
          }}
          onInteractOutside={(event) => {
            onInteractOutside?.(event);
            if (event.defaultPrevented) return;

            if (!dismissible || shouldKeepDialogOpen(event.target)) {
              event.preventDefault();
            }
          }}
          {...props}
        >
          {children}
          {shouldShowCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-sunken hover:text-text focus-visible:outline-none disabled:pointer-events-none sm:right-4 sm:top-4 sm:size-8 sm:rounded-sm [&_svg]:size-4"
            >
              <XIcon />
              <span className="sr-only">Kapat</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

export function DialogHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-1.5 pr-8 text-left', className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="secondary">Vazgeç</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('font-heading text-title text-text', className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-body-sm text-text-muted', className)}
      {...props}
    />
  );
}

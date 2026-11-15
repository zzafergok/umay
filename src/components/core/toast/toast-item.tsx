'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, Clock, Info, Loader2, X } from 'lucide-react';
import { Button } from '@/components/core/button';
import { cn } from '@/lib/utils';
import type { Toast, ToastType } from '@/types';
import { toast } from './toast-observer';

const ToastIcon = ({ type }: { type?: ToastType }) => {
  switch (type) {
    case 'success':
      return <Check className="h-4 w-4 text-success" />;
    case 'error':
      return <AlertTriangle className="text-danger h-4 w-4" />;
    case 'warning':
      return <Clock className="h-4 w-4 text-warning" />;
    case 'loading':
      return <Loader2 className="text-text-muted h-4 w-4 animate-spin" />;
    default:
      return <Info className="h-4 w-4 text-info" />;
  }
};

const getProgressColor = (type?: ToastType): string => {
  switch (type) {
    case 'success':
      return 'bg-success';
    case 'error':
      return 'bg-danger';
    case 'warning':
      return 'bg-warning';
    default:
      return 'bg-accent';
  }
};

export function ToastItem({ t }: { t: Toast }) {
  const totalDuration = t.duration ?? (t.action ? 5000 : 3000);
  const isInfinite = !isFinite(totalDuration as number);

  const [progress, setProgress] = useState(100);
  const remainingRef = useRef(totalDuration as number);
  const startTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timeoutRef.current = setTimeout(
      () => toast.dismiss(t.id),
      remainingRef.current,
    );

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = remainingRef.current - elapsed;
      setProgress(Math.max(0, (remaining / (totalDuration as number)) * 100));
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [t.id, totalDuration]);

  const pauseTimer = useCallback(() => {
    remainingRef.current = Math.max(
      0,
      remainingRef.current - (Date.now() - startTimeRef.current),
    );
    clearTimeout(timeoutRef.current);
    cancelAnimationFrame(rafRef.current);
  }, []);

  const resumeTimer = useCallback(() => startTimer(), [startTimer]);

  useEffect(() => {
    if (isInfinite) return;
    startTimer();
    return () => {
      clearTimeout(timeoutRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isInfinite, startTimer]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      onMouseEnter={isInfinite ? undefined : pauseTimer}
      onMouseLeave={isInfinite ? undefined : resumeTimer}
      className={cn(
        'layout-group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden',
        'dark:border-border-strong bg-surface-raised text-text shadow-float rounded-md border border-border p-4',
      )}
    >
      <div className="mt-0.5 shrink-0">
        <ToastIcon type={t.type} />
      </div>
      <div className="flex-1 space-y-1">
        {t.title && (
          <p className="text-body-sm text-text font-medium">{t.title}</p>
        )}
        {t.description && (
          <p className="text-text-muted text-caption">{t.description}</p>
        )}
        {t.action && (
          <div className="pt-1.5">
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                t.action?.onClick();
                toast.dismiss(t.id);
              }}
            >
              {t.action.label}
            </Button>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => toast.dismiss(t.id)}
        aria-label="Bildirimi kapat"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
      {!isInfinite && (
        <div
          className={cn(
            'absolute bottom-0 left-0 h-[2px]',
            getProgressColor(t.type),
          )}
          style={{ width: `${progress}%` }}
        />
      )}
    </motion.div>
  );
}

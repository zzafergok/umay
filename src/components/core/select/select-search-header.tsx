'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';

interface SelectSearchHeaderProps {
  query: string;
  onQueryChange: (nextQuery: string) => void;
  matchedCount: number;
  totalCount: number;
  placeholder?: string;
  viewportRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * SelectContent üstünde sabitlenen, Radix Select klavye/typeahead çakışmalarından
 * izole edilmiş profesyonel arama başlığı.
 */
export function SelectSearchHeader({
  query,
  onQueryChange,
  matchedCount,
  totalCount,
  placeholder = 'Seçeneklerde ara...',
  viewportRef,
}: SelectSearchHeaderProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      event.stopPropagation();
      const firstVisibleItem = viewportRef.current?.querySelector<HTMLElement>(
        '[data-slot="select-item"]:not([data-search-hidden="true"]):not([data-disabled])',
      );
      firstVisibleItem?.focus();
      return;
    }

    if (event.key === 'Escape' && query.length > 0) {
      event.preventDefault();
      event.stopPropagation();
      onQueryChange('');
      return;
    }

    // Radix Select'in dahili typeahead ve Space/Home/End dinleyicilerinin
    // input odağını çalmasını engelle.
    if (event.key !== 'Escape' && event.key !== 'Tab') {
      event.stopPropagation();
    }
  };

  return (
    <div
      data-slot="select-search-header"
      className="sticky top-0 z-10 border-b border-border/80 bg-surface-raised p-1.5"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="relative flex items-center">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 size-3.5 shrink-0 text-text-muted"
        />
        <Input
          ref={inputRef}
          type="text"
          role="searchbox"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={query}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={(e) => e.stopPropagation()}
          className="h-8 min-h-[32px] pl-8 pr-16 text-xs md:h-8 md:min-h-[32px]"
        />
        <div className="absolute right-1.5 flex items-center gap-1">
          <span
            aria-live="polite"
            className="pointer-events-none font-mono text-2xs tabular-nums text-text-subtle"
          >
            {matchedCount}/{totalCount}
          </span>
          {query.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Aramayı temizle"
              onClick={() => {
                onQueryChange('');
                inputRef.current?.focus({ preventScroll: true });
              }}
              className="size-5 min-h-0 min-w-0 rounded p-0 text-text-muted hover:text-text md:size-5"
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

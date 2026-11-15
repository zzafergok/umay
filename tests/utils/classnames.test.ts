import { describe, expect, it } from 'vitest';
import { buttonVariants } from '@/components/core/button';
import { badgeVariants } from '@/components/core/badge';
import { cn } from '@/lib/utils/classnames';

describe('cn (extendTailwindMerge custom tokens)', () => {
  it('preserves text-on-accent when size sets custom font-size text-body-sm', () => {
    const classes = cn(buttonVariants({ variant: 'primary', size: 'default' }));
    expect(classes).toContain('bg-accent');
    expect(classes).toContain('text-on-accent');
    expect(classes).toContain('text-body-sm');
  });

  it('preserves badge status text color alongside text-caption', () => {
    const defaultBadge = cn(
      badgeVariants({ variant: 'default', size: 'default' }),
    );
    const warningBadge = cn(
      badgeVariants({ variant: 'warning', size: 'default' }),
    );
    const dangerBadge = cn(
      badgeVariants({ variant: 'destructive', size: 'default' }),
    );

    expect(defaultBadge).toContain('text-accent');
    expect(defaultBadge).toContain('text-caption');
    expect(warningBadge).toContain('text-warning');
    expect(warningBadge).toContain('text-caption');
    expect(dangerBadge).toContain('text-danger');
    expect(dangerBadge).toContain('text-caption');
  });

  it('keeps both custom font-size and semantic text-color tokens', () => {
    const heading = cn('font-heading text-title text-text');
    expect(heading).toContain('text-title');
    expect(heading).toContain('text-text');
  });

  it('still deduplicates conflicting custom font sizes or colors', () => {
    expect(cn('text-body-sm text-on-accent', 'text-body')).toBe(
      'text-on-accent text-body',
    );
    expect(cn('text-accent text-caption', 'text-danger')).toBe(
      'text-caption text-danger',
    );
  });
});

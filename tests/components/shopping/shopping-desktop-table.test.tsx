import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ShoppingDesktopTable } from '@/features/routes/auth/shopping/shopping-desktop-table';

describe('ShoppingDesktopTable', () => {
  it('renders bulk selection and sorting as separate buttons', () => {
    const html = renderToStaticMarkup(
      <ShoppingDesktopTable
        entries={[]}
        itemMap={new Map()}
        categoryMap={new Map()}
        currency="TRY"
        headerDoneState={false}
        allPageDone={false}
        isBulkUpdatingDone={false}
        sortBy="done"
        sortOrder="asc"
        onSort={vi.fn()}
        onBulkToggleDone={vi.fn()}
        onToggleDone={vi.fn()}
        onAdjustQty={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const head = html.match(
      /<th[^>]*aria-sort="ascending"[^>]*>(.*?)<\/th>/,
    )?.[1];
    expect(head).toBeDefined();
    expect(head).toContain('role="checkbox"');
    expect(head).toContain('Alındı');
    expect(head?.match(/<button\b/g)).toHaveLength(2);
    expect(head).not.toMatch(/<button\b(?:(?!<\/button>)[\s\S])*<button\b/);
  });
});

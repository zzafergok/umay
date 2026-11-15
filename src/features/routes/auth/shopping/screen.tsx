'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, ShoppingBag, Sparkles } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Link } from '@/components/core/link';
import { cn } from '@/lib/utils';
import { ShoppingAddForm } from './shopping-add-form';
import { ShoppingDeleteDialogs } from './shopping-delete-dialogs';
import { ShoppingEditDialog } from './shopping-edit-dialog';
import { ShoppingListTable } from './shopping-list-table';
import { ShoppingReceiptCard } from './shopping-receipt-card';
import { ShoppingSuggestionsCard } from './shopping-suggestions';
import { ShoppingSummaryStats } from './shopping-summary-stats';
import { useShoppingScreen } from './use-shopping-screen';

type ShoppingMobileView = 'list' | 'add' | 'ai';

function parseShoppingMobileView(raw: string | null): ShoppingMobileView {
  if (raw === 'add' || raw === 'ai' || raw === 'list') return raw;
  return 'list';
}

function getShoppingViewHref(view: ShoppingMobileView): string {
  return view === 'list' ? '/shopping' : `/shopping?view=${view}`;
}

function ShoppingViewSync({
  onSyncView,
}: {
  onSyncView: (view: ShoppingMobileView) => void;
}) {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');

  useEffect(() => {
    onSyncView(parseShoppingMobileView(viewParam));
  }, [onSyncView, viewParam]);

  return null;
}

export function ShoppingScreen() {
  const s = useShoppingScreen();
  const [mobileView, setMobileView] = useState<ShoppingMobileView>('list');

  const handleSelectView = useCallback((view: ShoppingMobileView) => {
    setMobileView(view);
    if (typeof window === 'undefined') return;
    const nextHref = getShoppingViewHref(view);
    const currentHref = `${window.location.pathname}${window.location.search}`;
    if (currentHref !== nextHref) {
      window.history.pushState(null, '', nextHref);
    }
  }, []);

  const listNode = (
    <ShoppingListTable
      list={s.list}
      filteredList={s.filteredList}
      summary={s.summary}
      itemMap={s.itemMap}
      categoryMap={s.categoryMap}
      currency={s.currency}
      isLoading={s.isLoading}
      isClearingDone={s.isClearingDone}
      statusFilter={s.statusFilter}
      priorityFilter={s.priorityFilter}
      searchQuery={s.searchQuery}
      onStatusChange={s.setStatusFilter}
      onPriorityChange={s.setPriorityFilter}
      onSearchChange={s.setSearchQuery}
      onResetFilters={s.resetFilters}
      onToggleDone={s.handleToggleDone}
      onAdjustQty={s.handleAdjustQty}
      onEdit={s.setEditingEntry}
      onDelete={s.requestDelete}
      onClearDone={() => s.setClearDoneOpen(true)}
    />
  );

  const addNode = (
    <ShoppingAddForm
      items={s.items}
      categories={s.categories}
      currency={s.currency}
      onAdd={s.handleAddManual}
    />
  );

  const aiAndSummaryNode = (
    <div className="space-y-4 lg:space-y-6">
      <ShoppingSummaryStats summary={s.summary} currency={s.currency} />
      <ShoppingReceiptCard />
      <ShoppingSuggestionsCard
        suggestions={s.suggestions}
        onAccept={s.handleAcceptSuggestion}
        onAcceptAll={s.handleAcceptAllSuggestions}
      />
    </div>
  );

  const mobileTabs: Array<{
    key: ShoppingMobileView;
    label: string;
    badge?: number;
    Icon: typeof ShoppingBag;
  }> = [
    {
      key: 'list',
      label: 'Liste',
      badge: s.summary.pendingCount,
      Icon: ShoppingBag,
    },
    { key: 'add', label: 'Hızlı Ekle', Icon: Plus },
    {
      key: 'ai',
      label: 'AI & Özet',
      badge: s.suggestions.length > 0 ? s.suggestions.length : undefined,
      Icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-5 lg:space-y-6">
      <Suspense fallback={null}>
        <ShoppingViewSync onSyncView={setMobileView} />
      </Suspense>

      <div className="space-y-4 lg:hidden">
        <nav
          aria-label="Alışveriş mobil görünümleri"
          className="bg-surface-sunken grid grid-cols-3 gap-1 rounded-xl border border-border p-1"
        >
          {mobileTabs.map(({ key, label, badge, Icon }) => {
            const active = mobileView === key;
            return (
              <Link
                key={key}
                href={getShoppingViewHref(key)}
                prefetch={false}
                variant="ghost"
                aria-current={active ? 'page' : undefined}
                onClick={(event) => {
                  if (
                    event.defaultPrevented ||
                    event.button !== 0 ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                  ) {
                    return;
                  }
                  event.preventDefault();
                  handleSelectView(key);
                }}
                className={cn(
                  'min-h-[42px] gap-1.5 rounded-lg px-2 text-xs font-medium',
                  active
                    ? 'bg-surface text-text shadow-xs hover:bg-surface'
                    : 'text-text-muted hover:text-text',
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{label}</span>
                {typeof badge === 'number' && badge > 0 ? (
                  <Badge
                    variant={active ? 'default' : 'secondary'}
                    className="h-4 px-1.5 text-[10px] tabular-nums"
                  >
                    {badge}
                  </Badge>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {mobileView === 'list' && listNode}
        {mobileView === 'add' && addNode}
        {mobileView === 'ai' && aiAndSummaryNode}
      </div>

      <div className="hidden space-y-6 lg:block">
        {aiAndSummaryNode}
        {addNode}
        {listNode}
      </div>

      <ShoppingEditDialog
        entry={s.editingEntry}
        items={s.items}
        categories={s.categories}
        currency={s.currency}
        onClose={() => s.setEditingEntry(null)}
        onSave={s.handleSaveEdit}
      />
      <ShoppingDeleteDialogs
        clearDoneOpen={s.clearDoneOpen}
        onClearDoneOpenChange={s.setClearDoneOpen}
        onConfirmClearDone={s.confirmClearDone}
        summary={s.summary}
      />
    </div>
  );
}

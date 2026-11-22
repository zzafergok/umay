'use client';

import * as React from 'react';
import { ArrowLeft, Plus, ReceiptText, Sparkles, Store } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/core/empty';
import { Link } from '@/components/core/link';
import { PageHeaderMeta } from '@/components/layout';
import { ShoppingDeleteDialogs } from './shopping-delete-dialogs';
import {
  ShoppingAddDialog,
  ShoppingReceiptDialog,
  ShoppingSuggestionsDialog,
} from './shopping-detail-dialogs';
import { ShoppingEditDialog } from './shopping-edit-dialog';
import { ShoppingListTable } from './shopping-list-table';
import { ShoppingSummaryStats } from './shopping-summary-stats';
import { useShoppingScreen } from './use-shopping-screen';

export function ShoppingDetailScreen({ listId }: { listId: string }) {
  const s = useShoppingScreen(listId);
  const [addOpen, setAddOpen] = React.useState(false);
  const [receiptOpen, setReceiptOpen] = React.useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false);

  const storeBadge = s.activeList?.store ? (
    <Badge variant="outline" className="gap-1 text-[11px] font-normal">
      <Store className="h-3 w-3" aria-hidden="true" />
      {s.activeList.store}
    </Badge>
  ) : undefined;

  if (!s.isListsLoading && !s.activeList) {
    return (
      <>
        <PageHeaderMeta title="Liste Bulunamadı" />
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Alışveriş listesi bulunamadı</EmptyTitle>
            <EmptyDescription>
              Bu liste silinmiş veya geçersiz olabilir.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild size="sm" variant="outline">
              <Link href="/shopping">
                <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Listelere Dön
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </>
    );
  }

  const showTopAddButton = !s.isLoading && s.summary.totalCount > 0;

  return (
    <div className="space-y-4">
      <PageHeaderMeta
        title={s.activeList?.name}
        description={s.activeList?.description || undefined}
        badge={storeBadge}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm" className="text-text-muted">
          <Link href="/shopping">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            Listeler
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {s.suggestions.length > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSuggestionsOpen(true)}
            >
              <Sparkles
                className="mr-1.5 h-3.5 w-3.5 text-accent"
                aria-hidden="true"
              />
              <span>Öneriler</span>
              <Badge
                variant="secondary"
                className="ml-1.5 h-4 px-1.5 text-[10px] tabular-nums"
              >
                {s.suggestions.length}
              </Badge>
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setReceiptOpen(true)}
          >
            <ReceiptText className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Fiş Tara (AI)
          </Button>
          {showTopAddButton ? (
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Ürün Ekle
            </Button>
          ) : null}
        </div>
      </div>

      {s.summary.totalCount > 0 ? (
        <ShoppingSummaryStats summary={s.summary} currency={s.currency} />
      ) : null}

      <ShoppingListTable
        entries={s.list}
        summary={s.summary}
        totalFiltered={s.totalFiltered}
        page={s.page}
        pageSize={s.pageSize}
        totalPages={s.totalPages}
        itemMap={s.itemMap}
        categoryMap={s.categoryMap}
        currency={s.currency}
        isLoading={s.isLoading}
        isFetching={s.isFetching}
        isPlaceholderData={s.isPlaceholderData}
        isSearchPending={s.isSearchPending}
        hasActiveFilters={s.hasActiveFilters}
        isClearingDone={s.isClearingDone}
        isBulkUpdatingDone={s.isBulkUpdatingDone}
        isSyncingDoneItems={s.isSyncingDoneItems}
        statusFilter={s.statusFilter}
        priorityFilter={s.priorityFilter}
        searchQuery={s.searchQuery}
        sortBy={s.sortState.sortBy}
        sortOrder={s.sortState.sortOrder}
        onStatusChange={s.setStatusFilter}
        onPriorityChange={s.setPriorityFilter}
        onSearchChange={s.setSearchQuery}
        onSort={s.setSort}
        onPageChange={s.handlePageChange}
        onPageSizeChange={s.handlePageSizeChange}
        onResetFilters={s.resetFilters}
        onToggleDone={s.handleToggleDone}
        onBulkToggleDone={s.handleBulkToggleDone}
        onSyncDoneToInventory={() => s.handleSyncDoneToInventory(listId)}
        onAdjustQty={s.handleAdjustQty}
        onEdit={s.setEditingEntry}
        onDelete={s.requestDelete}
        onClearDone={() => s.setClearDoneOpen(true)}
        onAddClick={() => setAddOpen(true)}
      />

      <ShoppingAddDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        items={s.items}
        categories={s.categories}
        locations={s.locations}
        currency={s.currency}
        onAdd={s.handleAddManual}
      />
      <ShoppingReceiptDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        listId={listId}
      />
      <ShoppingSuggestionsDialog
        open={suggestionsOpen}
        onOpenChange={setSuggestionsOpen}
        suggestions={s.suggestions}
        onAccept={s.handleAcceptSuggestion}
        onAcceptAll={s.handleAcceptAllSuggestions}
      />
      <ShoppingEditDialog
        entry={s.editingEntry}
        items={s.items}
        categories={s.categories}
        locations={s.locations}
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

'use client';

import { ShoppingAddForm } from './shopping-add-form';
import { ShoppingDeleteDialogs } from './shopping-delete-dialogs';
import { ShoppingEditDialog } from './shopping-edit-dialog';
import { ShoppingListTable } from './shopping-list-table';
import { ShoppingReceiptCard } from './shopping-receipt-card';
import { ShoppingSuggestionsCard } from './shopping-suggestions';
import { ShoppingSummaryStats } from './shopping-summary-stats';
import { useShoppingScreen } from './use-shopping-screen';

export function ShoppingScreen() {
  const s = useShoppingScreen();

  return (
    <div className="space-y-6">
      <ShoppingSummaryStats summary={s.summary} currency={s.currency} />
      <ShoppingReceiptCard />
      <ShoppingSuggestionsCard
        suggestions={s.suggestions}
        onAccept={s.handleAcceptSuggestion}
        onAcceptAll={s.handleAcceptAllSuggestions}
      />
      <ShoppingAddForm
        items={s.items}
        categories={s.categories}
        currency={s.currency}
        onAdd={s.handleAddManual}
      />
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
      <ShoppingEditDialog
        entry={s.editingEntry}
        items={s.items}
        categories={s.categories}
        currency={s.currency}
        onClose={() => s.setEditingEntry(null)}
        onSave={s.handleSaveEdit}
      />
      <ShoppingDeleteDialogs
        deleteTarget={s.deleteTarget}
        onCloseDelete={() => s.setDeleteTarget(null)}
        onConfirmDelete={s.confirmDelete}
        clearDoneOpen={s.clearDoneOpen}
        onClearDoneOpenChange={s.setClearDoneOpen}
        onConfirmClearDone={s.confirmClearDone}
        summary={s.summary}
        itemMap={s.itemMap}
        categoryMap={s.categoryMap}
        currency={s.currency}
      />
    </div>
  );
}

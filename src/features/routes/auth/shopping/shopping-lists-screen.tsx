'use client';

import { Plus, Search, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/core/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/core/empty';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/core/input-group';
import { SkeletonCard } from '@/components/core/skeleton';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { ShoppingListCard } from './shopping-list-card';
import { ShoppingListFormDialog } from './shopping-list-form-dialog';
import { useShoppingListsScreen } from './use-shopping-lists-screen';

export function ShoppingListsScreen() {
  const s = useShoppingListsScreen();
  const totalCount = s.lists.length + (s.unassignedItems.length > 0 ? 1 : 0);
  const showTopCreate = !s.isLoading && totalCount > 0;

  const openCreate = () => {
    s.setEditingList(null);
    s.setFormOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Alışveriş listelerini oluştur, market veya ihtiyaca göre düzenle.
        </p>
        {showTopCreate ? (
          <Button
            type="button"
            size="sm"
            onClick={openCreate}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Yeni Liste
          </Button>
        ) : null}
      </div>

      {s.lists.length > 0 ? (
        <InputGroup className="w-full max-w-md">
          <InputGroupAddon align="inline-start">
            <Search className="h-4 w-4 text-text-muted" aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            value={s.search}
            onChange={(e) => s.setSearch(e.target.value)}
            placeholder="Liste veya mağaza ara..."
            className="text-sm"
          />
          {s.search ? (
            <InputGroupAddon align="inline-end">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="h-9 w-9 sm:h-7 sm:w-7"
                onClick={() => s.setSearch('')}
                aria-label="Aramayı temizle"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      ) : null}

      {s.isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : totalCount === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingCart />
            </EmptyMedia>
            <EmptyTitle>Henüz alışveriş listen yok</EmptyTitle>
            <EmptyDescription>
              Market, yapı market veya aylık ihtiyaçların için ilk alışveriş
              listeni oluştur.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Liste Oluştur
            </Button>
          </EmptyContent>
        </Empty>
      ) : s.filteredLists.length === 0 && s.unassignedItems.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Eşleşen liste bulunamadı</EmptyTitle>
            <EmptyDescription>
              &ldquo;{s.search}&rdquo; aramasına uygun alışveriş listesi yok.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {s.filteredLists.map((list) => (
            <ShoppingListCard
              key={list.id}
              list={list}
              items={s.itemsByList.get(list.id) ?? []}
              currency={s.currency}
              onEdit={(target) => {
                s.setEditingList(target);
                s.setFormOpen(true);
              }}
              onDelete={s.setDeleteTarget}
            />
          ))}
          {s.unassignedItems.length > 0 && !s.search.trim() ? (
            <ShoppingListCard
              list={{
                id: 'unassigned',
                name: 'Genel Liste',
                description: 'Önceden eklenmiş listeden bağımsız kalemler',
                createdAt: '',
                updatedAt: '',
              }}
              items={s.unassignedItems}
              currency={s.currency}
              href="/shopping/unassigned"
              readOnlyMeta
            />
          ) : null}
        </div>
      )}

      <ShoppingListFormDialog
        open={s.formOpen}
        onOpenChange={(open) => {
          s.setFormOpen(open);
          if (!open) s.setEditingList(null);
        }}
        editList={s.editingList}
        onSubmit={s.handleSubmitForm}
      />

      <DeleteConfirmationDialog
        open={Boolean(s.deleteTarget)}
        onOpenChange={(open) => {
          if (!open) s.setDeleteTarget(null);
        }}
        entityLabel="Alışveriş Listesi"
        itemName={s.deleteTarget?.name ?? ''}
        itemIcon={<ShoppingCart className="size-4" />}
        details={
          s.deleteTarget
            ? [
                {
                  label: 'Kayıtlı Kalem',
                  value: `${(s.itemsByList.get(s.deleteTarget.id) ?? []).length} ürün`,
                },
              ]
            : undefined
        }
        warning="Bu listeyi sildiğinizde içindeki tüm alışveriş kalemleri de silinir."
        onConfirm={s.handleConfirmDelete}
      />
    </div>
  );
}

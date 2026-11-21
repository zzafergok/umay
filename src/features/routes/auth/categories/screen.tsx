'use client';

import * as React from 'react';
import { Plus, Search, Sparkles, Tags, X } from 'lucide-react';
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
import { toast } from '@/components/core/toast';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { CategoryIcon } from '@/features/inventory/components';
import {
  CATEGORY_PRESET_TEMPLATES,
  type CategoryPresetTemplate,
} from '@/features/inventory/constants';
import type { Category } from '@/features/inventory/types';
import { resolveCategoryColorHex } from '@/features/inventory/utils';
import { useCategoriesQuery, useItemsQuery } from '@/hooks/use-inventory-hooks';
import { inventoryService } from '@/services/inventory-service';
import { useQueryClient } from '@tanstack/react-query';
import { CategoryCard, CategoryFormDialog } from './components';
import type { CategoryDialogState } from './types';

export function CategoriesScreen() {
  const qc = useQueryClient();
  const { data: categories = [], isLoading } = useCategoriesQuery();
  const { data: items = [] } = useItemsQuery();
  const [search, setSearch] = React.useState('');
  const [dialogState, setDialogState] = React.useState<CategoryDialogState>({
    open: false,
    mode: 'create',
  });
  const [deleteTarget, setDeleteTarget] = React.useState<Category | null>(null);

  const filteredCategories = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        (cat.description?.toLowerCase().includes(query) ?? false) ||
        cat.customFields.some((f) => f.label.toLowerCase().includes(query)),
    );
  }, [categories, search]);

  const itemCountByCategory = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.categoryId, (map.get(item.categoryId) ?? 0) + 1);
    }
    return map;
  }, [items]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await inventoryService.deleteCategory(deleteTarget.id);
      await qc.invalidateQueries({ queryKey: ['inventory', 'categories'] });
      toast.success('Kategori silindi.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kategori silinemedi.');
      throw err;
    }
  };

  const deleteCategoryItemCount = deleteTarget
    ? (itemCountByCategory.get(deleteTarget.id) ?? 0)
    : 0;

  const handleQuickCreatePreset = async (preset: CategoryPresetTemplate) => {
    try {
      await inventoryService.createCategory(preset.data);
      await qc.invalidateQueries({ queryKey: ['inventory', 'categories'] });
      toast.success(`"${preset.data.name}" kategorisi eklendi.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kategori eklenemedi.');
    }
  };

  const openCreate = () => setDialogState({ open: true, mode: 'create' });
  const openEdit = (category: Category) =>
    setDialogState({ open: true, mode: 'edit', category });
  const openDuplicate = (category: Category) =>
    setDialogState({ open: true, mode: 'duplicate', category });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Kategorilere özel teknik alanlar, ürün varsayılanları ve takip
          kuralları tanımla.
        </p>
        {!isLoading && categories.length > 0 ? (
          <Button
            onClick={openCreate}
            className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Kategori Ekle
          </Button>
        ) : null}
      </div>

      {categories.length > 0 ? (
        <InputGroup className="w-full max-w-md">
          <InputGroupAddon align="inline-start">
            <Search className="text-text-muted h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kategori veya özel alan ara..."
            className="text-sm"
          />
          {search ? (
            <InputGroupAddon align="inline-end">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="h-9 w-9 sm:h-7 sm:w-7"
                onClick={() => setSearch('')}
                aria-label="Aramayı temizle"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      ) : categories.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Tags />
            </EmptyMedia>
            <EmptyTitle>Henüz kategori yok</EmptyTitle>
            <EmptyDescription>
              Sıfırdan gelişmiş bir kategori oluştur veya hazır şablonlardan tek
              tıkla başla.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORY_PRESET_TEMPLATES.slice(0, 3).map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickCreatePreset(preset)}
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 text-accent" />
                  {preset.data.name}
                </Button>
              ))}
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Özel Kategori Oluştur
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      ) : filteredCategories.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Eşleşen kategori bulunamadı</EmptyTitle>
            <EmptyDescription>
              &ldquo;{search}&rdquo; aramasına uygun kategori veya özel alan
              yok.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              itemCount={itemCountByCategory.get(cat.id) ?? 0}
              onEdit={openEdit}
              onDuplicate={openDuplicate}
              onDelete={(id) =>
                setDeleteTarget(categories.find((c) => c.id === id) ?? null)
              }
            />
          ))}
        </div>
      )}

      <CategoryFormDialog
        dialogState={dialogState}
        onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
      />

      <DeleteConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        entityLabel="Kategori"
        itemName={deleteTarget?.name ?? ''}
        itemIcon={
          deleteTarget ? (
            <CategoryIcon name={deleteTarget.icon} className="size-4" />
          ) : undefined
        }
        itemColor={
          deleteTarget
            ? resolveCategoryColorHex(deleteTarget.colorToken)
            : undefined
        }
        details={
          deleteTarget
            ? [
                {
                  label: 'Bağlı Ürün',
                  value: `${deleteCategoryItemCount} ürün`,
                },
                {
                  label: 'Özel Alan',
                  value: `${deleteTarget.customFields.length} alan`,
                },
              ]
            : undefined
        }
        warning={
          deleteCategoryItemCount > 0
            ? `Bu kategoriye bağlı ${deleteCategoryItemCount} ürün bulunuyor.`
            : undefined
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

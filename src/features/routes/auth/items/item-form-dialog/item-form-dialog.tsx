'use client';

import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/core/tabs';
import { Form, SubmitButton } from '@/components/forms';
import type { Category, Item, Location } from '@/features/inventory/types';
import { ItemBasicTab } from './item-basic-tab';
import { itemFormSchema } from './item-form-schema';
import { ItemPurchaseTab } from './item-purchase-tab';
import { ItemTechnicalTab } from './item-technical-tab';
import { useItemFormDialog } from './use-item-form-dialog';

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  locations: Location[];
  initialBarcode?: string;
  editItem?: Item;
}

function ItemFormBody({
  onOpenChange,
  categories,
  locations,
  initialBarcode,
  editItem,
}: Omit<ItemFormDialogProps, 'open'>) {
  const formState = useItemFormDialog({
    onOpenChange,
    categories,
    locations,
    initialBarcode,
    editItem,
  });

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const locationOptions = locations.map((l) => ({
    value: l.id,
    label: l.path.join('>'),
  }));
  const customFieldCount = formState.activeCategory?.customFields.length ?? 0;

  return (
    <Form
      schema={itemFormSchema}
      methods={formState.methods}
      onSubmit={formState.handleSubmit}
      className="min-w-0 space-y-2.5 sm:space-y-4"
    >
      <Tabs value={formState.activeTab} onValueChange={formState.setActiveTab}>
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 p-1">
          <TabsTrigger
            value="basic"
            className="min-w-0 px-1.5 py-1.5 text-[11px] sm:px-3 sm:text-xs"
          >
            <span className="truncate sm:hidden">1. Temel</span>
            <span className="hidden truncate sm:inline">
              1. Temel &amp; Stok
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="technical"
            className="min-w-0 gap-1 px-1.5 py-1.5 text-[11px] sm:gap-1.5 sm:px-3 sm:text-xs"
          >
            <span className="truncate sm:hidden">2. Teknik</span>
            <span className="hidden truncate sm:inline">
              2. Teknik &amp; Özel Alanlar
            </span>
            {customFieldCount > 0 ? (
              <Badge
                variant="secondary"
                className="shrink-0 px-1 py-0 text-[10px] sm:px-1.5"
              >
                {customFieldCount}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            value="purchase"
            className="min-w-0 px-1.5 py-1.5 text-[11px] sm:px-3 sm:text-xs"
          >
            <span className="truncate sm:hidden">3. Satın Alma</span>
            <span className="hidden truncate sm:inline">
              3. Satın Alma &amp; Tarihler
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="pt-1.5 sm:pt-2">
          <ItemBasicTab
            categoryOptions={categoryOptions}
            locationOptions={locationOptions}
            onCategoryChange={formState.handleCategoryChange}
          />
        </TabsContent>

        <TabsContent value="technical" className="pt-1.5 sm:pt-2">
          <ItemTechnicalTab
            activeCategory={formState.activeCategory}
            customValues={formState.customValues}
            customErrors={formState.customErrors}
            onCustomValueChange={formState.handleCustomValueChange}
            tags={formState.tags}
            onTagsChange={formState.setTags}
          />
        </TabsContent>

        <TabsContent value="purchase" className="pt-1.5 sm:pt-2">
          <ItemPurchaseTab
            activeCategory={formState.activeCategory}
            photos={formState.photos}
            onPhotoUpload={formState.handlePhotoUpload}
            onRemovePhoto={formState.handleRemovePhoto}
          />
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 z-10 grid grid-cols-2 gap-2 border-t border-border bg-surface-raised/95 pt-2.5 backdrop-blur-md sm:static sm:flex sm:justify-end sm:bg-transparent sm:pt-3 sm:backdrop-blur-none">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="w-full sm:w-auto"
        >
          Vazgeç
        </Button>
        <SubmitButton
          size="sm"
          isLoading={formState.saving}
          className="w-full sm:w-auto"
        >
          Kaydet
        </SubmitButton>
      </div>
    </Form>
  );
}

export function ItemFormDialog({
  open,
  onOpenChange,
  categories,
  locations,
  initialBarcode,
  editItem,
}: ItemFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent mobilePresentation="sheet" className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {editItem ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
          </DialogTitle>
        </DialogHeader>
        {open ? (
          <ItemFormBody
            key={`${editItem?.id ?? 'new'}-${initialBarcode ?? ''}`}
            onOpenChange={onOpenChange}
            categories={categories}
            locations={locations}
            initialBarcode={initialBarcode}
            editItem={editItem}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

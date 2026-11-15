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
    label: l.path.join(' > '),
  }));
  const customFieldCount = formState.activeCategory?.customFields.length ?? 0;

  return (
    <Form
      schema={itemFormSchema}
      methods={formState.methods}
      onSubmit={formState.handleSubmit}
      className="space-y-4"
    >
      <Tabs value={formState.activeTab} onValueChange={formState.setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="basic" className="text-xs">
            1. Temel &amp; Stok
          </TabsTrigger>
          <TabsTrigger value="technical" className="gap-1.5 text-xs">
            <span>2. Teknik &amp; Özel Alanlar</span>
            {customFieldCount > 0 ? (
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                {customFieldCount}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="purchase" className="text-xs">
            3. Satın Alma &amp; Tarihler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="pt-2">
          <ItemBasicTab
            categoryOptions={categoryOptions}
            locationOptions={locationOptions}
            onCategoryChange={formState.handleCategoryChange}
          />
        </TabsContent>

        <TabsContent value="technical" className="pt-2">
          <ItemTechnicalTab
            activeCategory={formState.activeCategory}
            customValues={formState.customValues}
            customErrors={formState.customErrors}
            onCustomValueChange={formState.handleCustomValueChange}
            tags={formState.tags}
            onTagsChange={formState.setTags}
          />
        </TabsContent>

        <TabsContent value="purchase" className="pt-2">
          <ItemPurchaseTab
            activeCategory={formState.activeCategory}
            photos={formState.photos}
            onPhotoUpload={formState.handlePhotoUpload}
            onRemovePhoto={formState.handleRemovePhoto}
          />
        </TabsContent>
      </Tabs>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Vazgeç
        </Button>
        <SubmitButton isLoading={formState.saving}>Kaydet</SubmitButton>
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
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
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

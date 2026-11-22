'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/core/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/core/tabs';
import { toast } from '@/components/core/toast';
import { Form, SubmitButton } from '@/components/forms';
import type { CategoryPresetTemplate } from '@/features/inventory/constants';
import type { CategoryInput } from '@/features/inventory/schemas';
import type { CustomFieldDefinition } from '@/features/inventory/types';
import {
  buildCategoryInitialValues,
  categoryFormSchema,
  DEFAULT_CATEGORY_ITEM_CONFIG,
  type CategoryDialogState,
} from '@/features/routes/auth/categories/types';
import { inventoryService } from '@/services/inventory-service';
import { useQueryClient } from '@tanstack/react-query';
import { CategoryAppearancePanel } from './category-appearance-panel';
import { CategoryCustomFieldsTab } from './category-custom-fields-tab';
import { CategoryItemDefaultsPanel } from './category-item-defaults-panel';
import { CategoryLivePreview } from './category-live-preview';
import { CategoryPresetsBar } from './category-presets-bar';

interface CategoryFormDialogProps {
  dialogState: CategoryDialogState;
  onOpenChange: (open: boolean) => void;
}

function CategoryFormBody({
  dialogState,
  onOpenChange,
}: CategoryFormDialogProps) {
  const qc = useQueryClient();
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('general');

  const methods = useForm<CategoryInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: buildCategoryInitialValues(dialogState),
    mode: 'onChange',
  });

  const watchedName = useWatch({ control: methods.control, name: 'name' });
  const watchedDescription = useWatch({
    control: methods.control,
    name: 'description',
  });
  const watchedColor = useWatch({
    control: methods.control,
    name: 'colorToken',
  });
  const watchedIcon = useWatch({ control: methods.control, name: 'icon' });
  const watchedFields =
    useWatch({ control: methods.control, name: 'customFields' }) ?? [];
  const watchedDefaults =
    useWatch({ control: methods.control, name: 'itemDefaults' }) ??
    DEFAULT_CATEGORY_ITEM_CONFIG;

  const applyTemplate = (template: CategoryPresetTemplate) => {
    methods.reset({
      ...template.data,
      itemDefaults: template.data.itemDefaults ?? DEFAULT_CATEGORY_ITEM_CONFIG,
    });
    toast.success(`"${template.data.name}"şablonu uygulandı.`);
  };

  const handleSubmit = async (values: CategoryInput) => {
    setSaving(true);
    try {
      if (dialogState.mode === 'edit' && dialogState.category) {
        await inventoryService.updateCategory(dialogState.category.id, values);
        toast.success('Kategori güncellendi.');
      } else {
        await inventoryService.createCategory(values);
        toast.success('Kategori eklendi.');
      }
      await qc.invalidateQueries({ queryKey: ['inventory', 'categories'] });
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Kategori kaydedilemedi.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {dialogState.mode === 'create' ? (
        <CategoryPresetsBar onApplyTemplate={applyTemplate} />
      ) : null}

      <Form
        schema={categoryFormSchema}
        methods={methods}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-4">
            <TabsTrigger
              value="general"
              className="min-w-0 truncate px-2 py-1.5 text-[11px] sm:text-xs"
            >
              1. Genel &amp; Görünüm
            </TabsTrigger>
            <TabsTrigger
              value="defaults"
              className="min-w-0 truncate px-2 py-1.5 text-[11px] sm:text-xs"
            >
              2. Ürün Ayarları
            </TabsTrigger>
            <TabsTrigger
              value="fields"
              className="min-w-0 truncate px-2 py-1.5 text-[11px] sm:text-xs"
            >
              3. Özel Alanlar ({watchedFields.length})
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="min-w-0 truncate px-2 py-1.5 text-[11px] sm:text-xs"
            >
              4. Önizleme
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="pt-2">
            <CategoryAppearancePanel
              colorToken={watchedColor || 'umay-blue'}
              icon={watchedIcon || 'boxes'}
              onColorChange={(token) =>
                methods.setValue('colorToken', token, { shouldDirty: true })
              }
              onIconChange={(nextIcon) =>
                methods.setValue('icon', nextIcon, { shouldDirty: true })
              }
            />
          </TabsContent>

          <TabsContent value="defaults" className="pt-2">
            <CategoryItemDefaultsPanel
              value={watchedDefaults}
              onChange={(next) =>
                methods.setValue('itemDefaults', next, { shouldDirty: true })
              }
            />
          </TabsContent>

          <TabsContent value="fields" className="pt-2">
            <CategoryCustomFieldsTab
              fields={watchedFields}
              onChange={(nextFields: CustomFieldDefinition[]) =>
                methods.setValue('customFields', nextFields, {
                  shouldDirty: true,
                })
              }
            />
          </TabsContent>

          <TabsContent value="preview" className="pt-2">
            <CategoryLivePreview
              name={watchedName}
              description={watchedDescription}
              colorToken={watchedColor || 'umay-blue'}
              icon={watchedIcon || 'boxes'}
              customFields={watchedFields}
              itemDefaults={watchedDefaults}
            />
          </TabsContent>
        </Tabs>

        <div className="sticky bottom-0 z-10 grid grid-cols-2 gap-2 border-t border-border bg-surface/95 pt-2.5 backdrop-blur sm:static sm:flex sm:justify-end sm:bg-transparent sm:pt-3 sm:backdrop-blur-none">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Vazgeç
          </Button>
          <SubmitButton
            size="sm"
            isLoading={saving}
            className="w-full sm:w-auto"
          >
            {dialogState.mode === 'edit'
              ? 'Değişiklikleri Kaydet'
              : 'Kategoriyi Kaydet'}
          </SubmitButton>
        </div>
      </Form>
    </>
  );
}

export function CategoryFormDialog({
  dialogState,
  onOpenChange,
}: CategoryFormDialogProps) {
  const title =
    dialogState.mode === 'edit'
      ? 'Kategoriyi Düzenle'
      : dialogState.mode === 'duplicate'
        ? 'Kategoriyi Çoğalt'
        : 'Yeni Kategori Ekle';

  return (
    <Dialog open={dialogState.open} onOpenChange={onOpenChange}>
      <DialogContent
        mobilePresentation="sheet"
        className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Kategori görünümünü, varsayılan ürün kurallarını ve ürün bazlı özel
            teknik inputları yapılandırın.
          </DialogDescription>
        </DialogHeader>

        {dialogState.open ? (
          <CategoryFormBody
            key={`${dialogState.mode}-${dialogState.category?.id ?? 'new'}`}
            dialogState={dialogState}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

'use client';

import * as React from 'react';
import { Plus, Tags, Trash2 } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/core/empty';
import { Input } from '@/components/core/input';
import { Label } from '@/components/core/label';
import { Form, SelectField, SubmitButton, TextField } from '@/components/forms';
import { toast } from '@/components/core/toast';
import {
  categoryInputSchema,
  type CategoryInput,
} from '@/features/inventory/schemas';
import type { CustomFieldDefinition } from '@/features/inventory/types';
import {
  useCategoriesQuery,
  useItemsQuery,
} from '@/hooks/use-inventory-hooks';
import { inventoryService } from '@/services/inventory-service';
import { useQueryClient } from '@tanstack/react-query';

const COLOR_OPTIONS = [
  { value: 'tulpar-blue', label: 'Mavi' },
  { value: 'emerald', label: 'Yeşil' },
  { value: 'amber', label: 'Kehribar' },
  { value: 'rose', label: 'Kırmızı' },
  { value: 'violet', label: 'Mor' },
];

const DOT_CLASS: Record<string, string> = {
  'tulpar-blue': 'bg-tulpar-blue',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  violet: 'bg-violet-500',
};

export function CategoriesScreen() {
  const qc = useQueryClient();
  const { data: categories = [], isLoading } = useCategoriesQuery();
  const { data: items = [] } = useItemsQuery();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [customFields, setCustomFields] = React.useState<
    CustomFieldDefinition[]
  >([]);
  const [fieldLabel, setFieldLabel] = React.useState('');

  const addCustomField = () => {
    const trimmed = fieldLabel.trim();
    if (!trimmed) return;
    const key = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    if (!key || customFields.some((f) => f.key === key)) return;
    setCustomFields((prev) => [...prev, { key, label: trimmed, type: 'text' }]);
    setFieldLabel('');
  };

  const handleCreate = async (values: CategoryInput) => {
    setSaving(true);
    try {
      await inventoryService.createCategory({
        ...values,
        customFields,
      });
      await qc.invalidateQueries({ queryKey: ['inventory', 'categories'] });
      toast.success('Kategori eklendi.');
      setCustomFields([]);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kategori eklenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await inventoryService.deleteCategory(id);
      await qc.invalidateQueries({ queryKey: ['inventory', 'categories'] });
      toast.success('Kategori silindi.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kategori silinemedi.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Kategorilere özel teknik alanlar tanımla (uzunluk, konnektör, seri no).
        </p>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Kategori Ekle
        </Button>
      </div>

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
              Mutfak, Elektronik veya Kablo & Aksesuar kategorilerini ekle.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const count = items.filter((i) => i.categoryId === cat.id).length;
            return (
              <Card key={cat.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        DOT_CLASS[cat.colorToken] ?? 'bg-tulpar-blue'
                      }`}
                    />
                    <span>{cat.name}</span>
                  </CardTitle>
                  <Badge variant="outline" className="tabular-nums">
                    {count} ürün
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {cat.customFields.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        Özel alan yok
                      </span>
                    ) : (
                      cat.customFields.map((f) => (
                        <Badge key={f.key} variant="secondary">
                          {f.label}
                        </Badge>
                      ))
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`${cat.name} kategorisini sil`}
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Kategori Ekle</DialogTitle>
          </DialogHeader>
          <Form
            schema={categoryInputSchema}
            defaultValues={{
              name: '',
              colorToken: 'tulpar-blue',
              icon: 'boxes',
              customFields: [],
            }}
            onSubmit={handleCreate}
            className="space-y-4"
          >
            <TextField
              name="name"
              label="Kategori Adı"
              placeholder="Örn. Kablo & Aksesuar"
              required
            />
            <SelectField
              name="colorToken"
              label="Renk Noktası"
              options={COLOR_OPTIONS}
            />
            <div className="space-y-2 rounded-sm border border-border p-3">
              <Label htmlFor="custom-field-input">Özel Alanlar</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-field-input"
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                  placeholder="Örn. Konnektör veya Uzunluk"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomField}
                >
                  Ekle
                </Button>
              </div>
              {customFields.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {customFields.map((f) => (
                    <Badge key={f.key} variant="secondary">
                      {f.label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <SubmitButton isLoading={saving} fullWidth>
              Kaydet
            </SubmitButton>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

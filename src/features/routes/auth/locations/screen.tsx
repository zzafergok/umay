'use client';

import * as React from 'react';
import { FolderTree, MapPin, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
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
import { Form, SelectField, SubmitButton, TextField } from '@/components/forms';
import { toast } from '@/components/core/toast';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import {
  locationInputSchema,
  type LocationInput,
} from '@/features/inventory/schemas';
import type { Location } from '@/features/inventory/types';
import { useItemsQuery, useLocationsQuery } from '@/hooks/use-inventory-hooks';
import { inventoryService } from '@/services/inventory-service';
import { useQueryClient } from '@tanstack/react-query';

export function LocationsScreen() {
  const qc = useQueryClient();
  const { data: locations = [], isLoading } = useLocationsQuery();
  const { data: items = [] } = useItemsQuery();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Location | null>(null);

  const countByLocation = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.locationId, (map.get(item.locationId) ?? 0) + 1);
    }
    return map;
  }, [items]);

  const childCountByLocation = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const loc of locations) {
      if (loc.parentId) {
        map.set(loc.parentId, (map.get(loc.parentId) ?? 0) + 1);
      }
    }
    return map;
  }, [locations]);

  const sortedLocations = React.useMemo(
    () =>
      [...locations].sort((a, b) =>
        a.path.join(' > ').localeCompare(b.path.join(' > '), 'tr'),
      ),
    [locations],
  );

  const parentOptions = React.useMemo(
    () => [
      { value: '__none__', label: 'Kök Konum (Üst Yok)' },
      ...sortedLocations.map((loc) => ({
        value: loc.id,
        label: loc.path.join(' > '),
      })),
    ],
    [sortedLocations],
  );

  const handleCreate = async (values: LocationInput) => {
    setSaving(true);
    try {
      const parentId =
        values.parentId === '__none__' || !values.parentId
          ? null
          : values.parentId;
      await inventoryService.createLocation({ ...values, parentId });
      await qc.invalidateQueries({ queryKey: ['inventory', 'locations'] });
      toast.success('Konum eklendi.');
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Konum eklenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await inventoryService.deleteLocation(deleteTarget.id);
      await qc.invalidateQueries({ queryKey: ['inventory', 'locations'] });
      toast.success('Konum silindi.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Konum silinemedi.');
      throw err;
    }
  };

  const deleteItemCount = deleteTarget
    ? (countByLocation.get(deleteTarget.id) ?? 0)
    : 0;
  const deleteChildCount = deleteTarget
    ? (childCountByLocation.get(deleteTarget.id) ?? 0)
    : 0;
  const deleteWarning =
    deleteChildCount > 0
      ? `Bu konuma bağlı ${deleteChildCount} alt konum bulunuyor. Önce alt konumları taşımalı veya silmelisiniz.`
      : deleteItemCount > 0
        ? `Bu konuma bağlı ${deleteItemCount} ürün bulunuyor.`
        : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Oda, dolap ve çekmece hiyerarşisini yönet.
        </p>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Konum Ekle
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      ) : sortedLocations.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderTree />
            </EmptyMedia>
            <EmptyTitle>Henüz konum yok</EmptyTitle>
            <EmptyDescription>
              Ev, Mutfak veya Çalışma Odası gibi ilk konumunu oluştur.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sortedLocations.map((loc) => {
            const itemCount = countByLocation.get(loc.id) ?? 0;
            return (
              <Card key={loc.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="text-umay-blue h-4 w-4" />
                      <span>{loc.name}</span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {loc.path.join(' > ')}
                    </p>
                  </div>
                  <Badge variant="outline" className="tabular-nums">
                    {itemCount} ürün
                  </Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between pt-2">
                  <span className="truncate text-xs text-muted-foreground">
                    {loc.note || 'Not yok'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`${loc.name} konumunu sil`}
                    onClick={() => setDeleteTarget(loc)}
                  >
                    <Trash2 className="text-text-muted hover:text-danger h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Konum Ekle</DialogTitle>
          </DialogHeader>
          <Form
            schema={locationInputSchema}
            defaultValues={{ name: '', parentId: null, note: '' }}
            onSubmit={handleCreate}
            className="space-y-4"
          >
            <TextField
              name="name"
              label="Konum Adı"
              placeholder="Örn. Üst Dolap 2"
              required
            />
            <SelectField
              name="parentId"
              label="Üst Konum"
              options={parentOptions}
            />
            <TextField
              name="note"
              label="Not (Opsiyonel)"
              placeholder="Örn. Baharatlar ve kuru bakliyat"
            />
            <SubmitButton isLoading={saving} fullWidth>
              Kaydet
            </SubmitButton>
          </Form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDeleteTarget(null);
        }}
        entityLabel="Konum"
        itemName={deleteTarget?.name ?? ''}
        itemIcon={<MapPin className="size-4" />}
        itemColor="rgb(var(--umay-blue))"
        details={
          deleteTarget
            ? [
                { label: 'Konum Yolu', value: deleteTarget.path.join(' > ') },
                { label: 'Bağlı Ürün', value: `${deleteItemCount} ürün` },
              ]
            : undefined
        }
        warning={deleteWarning}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

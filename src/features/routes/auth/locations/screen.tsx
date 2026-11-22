'use client';

import { FolderTree, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/core/empty';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { LocationFormDialog } from './location-form-dialog';
import { useLocationsScreen } from './use-locations-screen';

export function LocationsScreen() {
  const s = useLocationsScreen();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Oda, dolap ve çekmece hiyerarşisini yönet.
        </p>
        {!s.isLoading && s.sortedLocations.length > 0 ? (
          <Button
            onClick={s.openCreateDialog}
            className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Konum Ekle
          </Button>
        ) : null}
      </div>

      {s.isLoading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      ) : s.sortedLocations.length === 0 ? (
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
          <EmptyContent>
            <Button size="sm" onClick={s.openCreateDialog}>
              <Plus className="mr-1.5 h-4 w-4" />
              Konum Ekle
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {s.sortedLocations.map((loc) => {
            const itemCount = s.countByLocation.get(loc.id) ?? 0;
            return (
              <Card key={loc.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="h-4 w-4 shrink-0 text-umay-blue" />
                      <span className="truncate">{loc.name}</span>
                    </CardTitle>
                    <p className="break-words text-xs text-muted-foreground">
                      {loc.path.join('>')}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 tabular-nums">
                    {itemCount} ürün
                  </Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-2 pt-2">
                  <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                    {loc.note || 'Not yok'}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0 text-text-muted hover:bg-surface-sunken hover:text-text sm:h-8 sm:w-8"
                      aria-label={`${loc.name} konumunu düzenle`}
                      onClick={() => s.openEditDialog(loc)}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0 text-danger/80 hover:bg-danger-subtle hover:text-danger sm:h-8 sm:w-8"
                      aria-label={`${loc.name} konumunu sil`}
                      onClick={() => s.setDeleteTarget(loc)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <LocationFormDialog
        open={s.dialogOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            s.closeDialog();
          } else {
            s.openCreateDialog();
          }
        }}
        saving={s.saving}
        editingLocation={s.editingTarget}
        parentOptions={s.parentOptions}
        onSubmit={s.handleSave}
      />

      <DeleteConfirmationDialog
        open={Boolean(s.deleteTarget)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) s.setDeleteTarget(null);
        }}
        entityLabel="Konum"
        itemName={s.deleteTarget?.name ?? ''}
        itemIcon={<MapPin className="size-4" />}
        itemColor="rgb(var(--umay-blue))"
        details={
          s.deleteTarget
            ? [
                { label: 'Konum Yolu', value: s.deleteTarget.path.join('>') },
                { label: 'Bağlı Ürün', value: `${s.deleteItemCount} ürün` },
              ]
            : undefined
        }
        warning={s.deleteWarning}
        onConfirm={s.handleConfirmDelete}
      />
    </div>
  );
}

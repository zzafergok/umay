'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Label } from '@/components/core/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/core/select';
import { toast } from '@/components/core/toast';
import type { Item, LifespanMode } from '@/features/inventory/types';
import { inventoryService } from '@/services/inventory-service';
import { useQueryClient } from '@tanstack/react-query';

interface PartFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Item[];
}

export function PartFormDialog({
  open,
  onOpenChange,
  items,
}: PartFormDialogProps) {
  const qc = useQueryClient();
  const [saving, setSaving] = React.useState(false);
  const [name, setName] = React.useState('');
  const [parentItemId, setParentItemId] = React.useState('__none__');
  const [spareItemId, setSpareItemId] = React.useState('__none__');
  const [mode, setMode] = React.useState<LifespanMode>('time');
  const [days, setDays] = React.useState('180');
  const [usageUnit, setUsageUnit] = React.useState('litre');
  const [usageLimit, setUsageLimit] = React.useState('1000');
  const [installedDate, setInstalledDate] = React.useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [leadDays, setLeadDays] = React.useState('7');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await inventoryService.createPart({
        name: name.trim(),
        parentItemId: parentItemId === '__none__' ? null : parentItemId,
        spareItemId: spareItemId === '__none__' ? null : spareItemId,
        lifespan: {
          mode,
          days: mode === 'time' || mode === 'both' ? Number(days) : undefined,
          usageUnit:
            mode === 'usage' || mode === 'both' ? usageUnit : undefined,
          usageLimit:
            mode === 'usage' || mode === 'both'
              ? Number(usageLimit)
              : undefined,
        },
        installedAt: new Date(`${installedDate}T12:00:00.000Z`).toISOString(),
        usageCurrent: 0,
        reminderLeadDays: Number(leadDays) || 7,
        notes: '',
      });
      await qc.invalidateQueries({ queryKey: ['inventory', 'parts'] });
      toast.success('Ömürlü parça eklendi.');
      setName('');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Parça eklenemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Ömürlü Parça</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="part-name">Parça Adı</Label>
            <Input
              id="part-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn. Su Arıtma Karbon Filtresi"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Ana Ürün</Label>
              <Select value={parentItemId} onValueChange={setParentItemId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Bağımsız</SelectItem>
                  {items.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Stoktaki Yedek</Label>
              <Select value={spareItemId} onValueChange={setSpareItemId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Yedek Bağlı Değil</SelectItem>
                  {items.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name} ({i.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Ömür Modu</Label>
            <Select
              value={mode}
              onValueChange={(v) => {
                if (v === 'time' || v === 'usage' || v === 'both') setMode(v);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Zamana Göre (Gün)</SelectItem>
                <SelectItem value="usage">Kullanıma Göre</SelectItem>
                <SelectItem value="both">İkisi Birden (Hangisi Önce)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(mode === 'time' || mode === 'both') && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="part-days">Ömür (Gün)</Label>
                <Input
                  id="part-days"
                  type="number"
                  min={1}
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="part-lead">Hatırlatma (Gün önce)</Label>
                <Input
                  id="part-lead"
                  type="number"
                  min={0}
                  value={leadDays}
                  onChange={(e) => setLeadDays(e.target.value)}
                />
              </div>
            </div>
          )}

          {(mode === 'usage' || mode === 'both') && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="part-u-limit">Kullanım Limiti</Label>
                <Input
                  id="part-u-limit"
                  type="number"
                  min={1}
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="part-u-unit">Birim</Label>
                <Input
                  id="part-u-unit"
                  value={usageUnit}
                  onChange={(e) => setUsageUnit(e.target.value)}
                  placeholder="litre / baskı / saat"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="part-installed">Takılma Tarihi</Label>
            <Input
              id="part-installed"
              type="date"
              value={installedDate}
              onChange={(e) => setInstalledDate(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Kaydediliyor...' : 'Parçayı Kaydet'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

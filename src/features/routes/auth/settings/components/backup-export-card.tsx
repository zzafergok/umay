'use client';

import * as React from 'react';
import { Activity, Download, FolderTree, Tags } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/card';
import { Link } from '@/components/core/link';
import { toast } from '@/components/core/toast';
import { useItemsQuery } from '@/hooks/use-inventory-hooks';
import { inventoryService } from '@/services/inventory-service';

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function BackupAndExportCard() {
  const { data: items = [] } = useItemsQuery(true);
  const [exporting, setExporting] = React.useState(false);

  const handleExportJson = async () => {
    setExporting(true);
    try {
      const backup = await inventoryService.exportBackup();
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadBlob(
        `umay-yedek-${dateStr}.json`,
        JSON.stringify(backup, null, 2),
        'application/json',
      );
      toast.success('Tam JSON yedek indirildi.');
    } catch {
      toast.error('Yedek alınamadı.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCsv = () => {
    const headers = ['id', 'name', 'type', 'quantity', 'unit', 'minQuantity', 'barcode', 'status'];
    const rows = items.map((i) =>
      [
        i.id,
        `"${i.name.replace(/"/g, '""')}"`,
        i.type,
        i.quantity,
        i.unit,
        i.minQuantity,
        i.barcode ?? '',
        i.status,
      ].join(','),
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadBlob(`umay-urunler-${dateStr}.csv`, csv, 'text/csv;charset=utf-8;');
    toast.success('Ürünler CSV olarak indirildi.');
  };

  return (
    <div className="space-y-6">
      <Card className="border-gunmetal bg-obsidian">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest">
            Hızlı Araçlar
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/locations">
              <FolderTree className="mr-1.5 h-4 w-4" />
              Konumlar
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/categories">
              <Tags className="mr-1.5 h-4 w-4" />
              Kategoriler
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/activity">
              <Activity className="mr-1.5 h-4 w-4" />
              Faaliyet & Bildirimler
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-gunmetal bg-obsidian">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest">
            Veri Yedekleme & Dışa Aktarma
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={items.length === 0}
          >
            <Download className="mr-1.5 h-4 w-4" />
            Ürünleri CSV İndir ({items.length})
          </Button>
          <Button onClick={handleExportJson} disabled={exporting}>
            <Download className="mr-1.5 h-4 w-4" />
            {exporting ? 'Hazırlanıyor...' : 'Tam JSON Yedek Al'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

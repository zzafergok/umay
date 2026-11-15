'use client';

import { CheckCircle2, PackageOpen } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Card, CardContent } from '@/components/core/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/core/empty';
import { Progress } from '@/components/core/progress';
import { StatusPill } from '@/components/core/status-pill';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/core/table';

export function DesignCardsAndTableSection() {
  return (
    <>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          4. Kart Hiyerarşisi (Stok Kartı & Parça Kartı)
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold">Zeytinyağı (1 Lt)</h3>
                <StatusPill tone="low_stock" label="Düşük Stok" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold tabular-nums">
                  1{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    adet
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  Eşik: 2 adet
                </span>
              </div>
              <div className="flex items-center gap-2 truncate text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Mutfak &gt; Kiler • Son hareket: 3 gün önce</span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <Button size="sm">Tüket (-1)</Button>
                <Button size="sm" variant="ghost">
                  Detay
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold">
                  Su Arıtma Karbon Filtre
                </h3>
                <StatusPill tone="due_soon" label="5 gün kaldı" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="font-medium">Kalan Ömür: %8</span>
                  <span className="text-muted-foreground">175 / 180 gün</span>
                </div>
                <Progress value={8} indicatorClassName="bg-amber-500" />
              </div>
              <div className="flex items-center gap-2 truncate text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-tulpar-blue" />
                <span>Su Arıtma Cihazı • Yedek stok: 1 adet</span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <Button size="sm">
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  Değiştirildi
                </Button>
                <Button size="sm" variant="ghost">
                  Geçmiş
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">5. Tablo & Boş Durum</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead>Konum</TableHead>
                <TableHead className="text-right">Miktar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">USB-C 2m Kablo</TableCell>
                <TableCell className="text-muted-foreground">
                  Çalışma Odası &gt; Çekmece
                </TableCell>
                <TableCell className="text-right tabular-nums">4 adet</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageOpen />
            </EmptyMedia>
            <EmptyTitle>Henüz kayıt yok</EmptyTitle>
            <EmptyDescription>
              İlk ürününü ekleyerek ev envanterini oluşturmaya başla.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm">Ürün Ekle</Button>
          </EmptyContent>
        </Empty>
      </section>
    </>
  );
}

'use client';

import * as React from 'react';
import { Boxes, Plus, Wrench } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { Input } from '@/components/core/input';
import { Label } from '@/components/core/label';
import { QuantityStepper } from '@/components/core/quantity-stepper';
import { Skeleton } from '@/components/core/skeleton';
import { Stat } from '@/components/core/stat';
import { StatusPill } from '@/components/core/status-pill';
import { DesignCardsAndTableSection } from './design-cards-section';

const COLOR_TOKENS = [
  { name: 'surface', className: 'bg-background border-border' },
  { name: 'surface-raised', className: 'bg-card border-border' },
  { name: 'accent (tulpar-blue)', className: 'bg-tulpar-blue text-white' },
  { name: 'success', className: 'bg-emerald-500 text-white' },
  { name: 'warning', className: 'bg-amber-500 text-black' },
  { name: 'danger', className: 'bg-red-500 text-white' },
];

export function DesignSystemScreen() {
  const [qty, setQty] = React.useState(3);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6">
      <header className="space-y-2 border-b border-border pb-6">
        <Badge variant="outline">Umay Design System</Badge>
        <h1 className="text-[28px] font-bold tracking-tight">
          Sakin, Bilgi Yoğun, Hızlı Taranabilir
        </h1>
        <p className="text-sm text-muted-foreground">
          Semantik tokenlar, tipografi ölçeği, çekirdek bileşenler, durumlar ve
          Umay kart hiyerarşisi.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Renk Tokenları</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {COLOR_TOKENS.map((token) => (
            <div key={token.name} className="space-y-1.5">
              <div
                className={`h-14 rounded-sm border ${token.className}`}
                aria-hidden="true"
              />
              <p className="font-mono text-xs text-muted-foreground">
                {token.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2. Tipografi Ölçeği</h2>
        <Card>
          <CardContent className="space-y-3 p-5">
            <p className="text-[28px] font-bold leading-tight tabular-nums">
              28px Başlık / 142 Ürün
            </p>
            <p className="text-[20px] font-semibold">
              20px Bölüm Başlığı — Mutfak & Kiler
            </p>
            <p className="text-[16px]">
              16px Gövde Metni — Evin bereketi, kayıt altında.
            </p>
            <p className="text-[14px] text-muted-foreground">
              14px İkincil Metin — Son hareket: 2 saat önce
            </p>
            <p className="text-[12px] uppercase tracking-wider text-muted-foreground">
              12px Etiket — DURUM / KONUM
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          3. Çekirdek Bileşenler & Durumlar
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Butonlar & Stepper</CardTitle>
              <CardDescription>
                Default, disabled, loading ve ≥44px dokunma hedefi
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button>
                <Plus className="mr-1.5 h-4 w-4" />
                Ürün Ekle
              </Button>
              <Button variant="outline">İkincil</Button>
              <Button variant="ghost">Hayalet</Button>
              <Button disabled>Devre Dışı</Button>
              <QuantityStepper
                value={qty}
                unit="adet"
                onDecrement={() => setQty((v) => Math.max(0, v - 1))}
                onIncrement={() => setQty((v) => v + 1)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Durum Rozetleri (Renk + İkon + Metin)
              </CardTitle>
              <CardDescription>Renk körlüğü uyumlu durum dili</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <StatusPill tone="ok" label="İyi Durumda" />
              <StatusPill tone="due_soon" label="Yaklaşıyor" />
              <StatusPill tone="overdue" label="Gecikti" />
              <StatusPill tone="low_stock" label="Düşük Stok" />
              <StatusPill tone="out_of_stock" label="Tükendi" />
              <StatusPill tone="in_repair" label="Tamirde" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Girdi & Hata Durumu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="design-input">Ürün Adı</Label>
                <Input id="design-input" placeholder="Örn. AA Alkalin Pil" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="design-input-err">Hatalı Alan</Label>
                <Input
                  id="design-input-err"
                  aria-invalid="true"
                  className="border-red-500"
                  defaultValue="-2"
                />
                <p className="text-xs text-red-500">
                  Miktar 0 veya pozitif olmalıdır.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                İskelet & Özet Metrikler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Stat
                  label="Toplam Ürün"
                  value={42}
                  icon={<Boxes className="h-4 w-4" />}
                />
                <Stat
                  label="Gecikmiş Parça"
                  value={2}
                  tone="danger"
                  icon={<Wrench className="h-4 w-4" />}
                />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <DesignCardsAndTableSection />
    </div>
  );
}

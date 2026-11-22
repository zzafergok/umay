import { Badge } from '@/components/core/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { Link } from '@/components/core/link';
import { StatusPill } from '@/components/core/status-pill';
import { UmayEmptyIllustration } from '@/components/shared/umay-brand';
import type { AttentionItem } from '../types';

export type { AttentionItem };

export function AttentionListCard({ items }: { items: AttentionItem[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Bugün İlgilenmen Gerekenler</CardTitle>
        <CardDescription>
          Geciken parçalar, kritik stoklar ve yaklaşan SKT / garanti tarihleri
        </CardDescription>
        <CardAction>
          <Badge
            variant={items.length > 0 ? 'warning' : 'success'}
            size="sm"
            className="font-mono tabular-nums"
          >
            {items.length > 0 ? `${items.length} uyarı` : 'Tümü güncel'}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <UmayEmptyIllustration className="h-20 w-20" />
            <p className="text-body-sm text-text-muted">
              Bugün için acil bir aksiyon gerekmiyor.
            </p>
          </div>
        ) : (
          items.map((entry) => (
            <Link
              key={entry.id}
              href={entry.href}
              className="flex min-h-[56px] items-center justify-between gap-3 rounded-md border border-border bg-surface px-3.5 py-2.5 transition-colors duration-150 hover:border-border-strong hover:bg-surface-sunken/50"
            >
              <div className="min-w-0">
                <p className="truncate text-body-sm font-medium text-text">
                  {entry.title}
                </p>
                <p className="truncate text-caption text-text-muted">
                  {entry.subtitle}
                </p>
              </div>
              <StatusPill tone={entry.tone} label={entry.badge} />
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

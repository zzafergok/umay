import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/card';
import { Link } from '@/components/core/link';
import { StatusPill, type StatusTone } from '@/components/core/status-pill';
import { UmayEmptyIllustration } from '@/components/shared/umay-brand';

export interface AttentionItem {
  id: string;
  title: string;
  subtitle: string;
  tone: StatusTone;
  badge: string;
  href: string;
  priority: number;
}

export function AttentionListCard({ items }: { items: AttentionItem[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Bugün ilgilenmen gerekenler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <UmayEmptyIllustration className="h-20 w-20" />
            <p className="text-body-sm text-text-muted">
              Bugün için bir şey yok.
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

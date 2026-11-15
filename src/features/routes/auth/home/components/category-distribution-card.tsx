import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/card';

export interface CategoryDistributionItem {
  id: string;
  name: string;
  count: number;
  percent: number;
  dotColor: string;
}

export function CategoryDistributionCard({
  categories,
}: {
  categories: CategoryDistributionItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kategori dağılımı</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.length === 0 ? (
          <p className="text-body-sm text-text-muted">Henüz veri yok.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-caption">
                <span className="flex min-w-0 items-center gap-2 font-medium text-text">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.dotColor }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{cat.name}</span>
                </span>
                <span className="shrink-0 tabular-nums text-text-muted">
                  {cat.count} (%{cat.percent})
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-200 ease-out"
                  style={{ width: `${cat.percent}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

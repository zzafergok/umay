'use client';

import * as React from 'react';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/card';

interface WorkspaceBoardViewProps {
  lanes: readonly string[];
  placeholder: string;
}

export function WorkspaceBoardView({
  lanes,
  placeholder,
}: WorkspaceBoardViewProps) {
  const [activeLane, setActiveLane] = React.useState(0);
  const currentLane = lanes[activeLane] ?? lanes[0] ?? '';

  return (
    <div className="space-y-4">
      <div className="space-y-3 lg:hidden">
        <div
          role="tablist"
          aria-label="Çalışma alanı sütunları"
          className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-surface-sunken p-1"
        >
          {lanes.map((lane, index) => (
            <Button
              key={lane}
              type="button"
              role="tab"
              aria-selected={activeLane === index}
              size="sm"
              variant={activeLane === index ? 'primary' : 'ghost'}
              className="min-h-[40px] truncate px-2 text-xs"
              onClick={() => setActiveLane(index)}
            >
              {lane}
            </Button>
          ))}
        </div>

        {currentLane ? (
          <Card className="min-h-60 border-border bg-surface">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest">
                {currentLane}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border bg-surface-sunken p-4 text-sm text-text-muted">
                {placeholder}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="hidden gap-4 lg:grid lg:grid-cols-3">
        {lanes.map((lane) => (
          <Card key={lane} className="min-h-72 border-border bg-surface">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest">
                {lane}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border bg-surface-sunken p-4 text-sm text-text-muted">
                {placeholder}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

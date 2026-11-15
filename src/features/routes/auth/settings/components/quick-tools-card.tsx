'use client';

import { Activity, FolderTree, Tags } from 'lucide-react';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { Link } from '@/components/core/link';

export function QuickToolsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hızlı araçlar</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link href="/locations">
            <FolderTree className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Konumlar
          </Link>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href="/categories">
            <Tags className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Kategoriler
          </Link>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href="/activity">
            <Activity className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Faaliyet günlüğü
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

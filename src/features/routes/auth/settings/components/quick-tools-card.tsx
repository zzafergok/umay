'use client';

import {
  Activity,
  FolderTree,
  ScanLine,
  Sparkles,
  Tags,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { Kbd } from '@/components/core/kbd';
import { Link } from '@/components/core/link';
import type { AuthSettingsCopy } from '../types';

interface QuickToolsCardProps {
  copy: AuthSettingsCopy['quickTools'];
}

export function QuickToolsCard({ copy }: QuickToolsCardProps) {
  const tools = [
    { href: '/locations', label: copy.links.locations, Icon: FolderTree },
    { href: '/categories', label: copy.links.categories, Icon: Tags },
    { href: '/parts', label: copy.links.parts, Icon: Wrench },
    { href: '/scan', label: copy.links.scan, Icon: ScanLine },
    { href: '/activity', label: copy.links.activity, Icon: Activity },
  ];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
          <CardTitle>{copy.title}</CardTitle>
        </div>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {tools.map(({ href, label, Icon }) => (
            <Button key={href} asChild variant="secondary" size="sm">
              <Link href={href}>
                <Icon className="mr-1.5 h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </Button>
          ))}
        </div>

        <div className="bg-surface-sunken flex items-center justify-between gap-3 rounded-md border border-border px-3.5 py-2.5">
          <p className="text-text-muted text-caption leading-relaxed">
            {copy.shortcutHint}
          </p>
          <Kbd className="shrink-0">⌘K</Kbd>
        </div>
      </CardContent>
    </Card>
  );
}

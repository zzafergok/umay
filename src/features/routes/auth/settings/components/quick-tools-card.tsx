'use client';

import { Activity, FolderTree, Sparkles, Tags, Wrench } from 'lucide-react';
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
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {tools.map(({ href, label, Icon }) => (
            <Button
              key={href}
              asChild
              variant="secondary"
              size="sm"
              className="min-h-[42px] justify-start sm:min-h-0"
            >
              <Link href={href}>
                <Icon className="mr-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{label}</span>
              </Link>
            </Button>
          ))}
        </div>

        <div className="hidden items-center justify-between gap-3 rounded-md border border-border bg-surface-sunken px-3.5 py-2.5 md:flex">
          <p className="text-caption leading-relaxed text-text-muted">
            {copy.shortcutHint}
          </p>
          <Kbd className="shrink-0">⌘K</Kbd>
        </div>
      </CardContent>
    </Card>
  );
}

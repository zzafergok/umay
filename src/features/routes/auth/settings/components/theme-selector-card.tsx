'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { useMounted } from '@/hooks/use-mounted';

const THEME_OPTIONS = [
  { id: 'light', label: 'Açık', Icon: Sun },
  { id: 'dark', label: 'Koyu', Icon: Moon },
  { id: 'system', label: 'Sistem', Icon: Monitor },
] as const;

export function ThemeSelectorCard() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const activeTheme = mounted ? (theme ?? 'system') : 'system';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Görünüm</CardTitle>
        <CardDescription>
          Umay açık, koyu veya cihazının sistem temasını kullanabilir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          role="radiogroup"
          aria-label="Tema seçimi"
          className="grid grid-cols-3 gap-2"
        >
          {THEME_OPTIONS.map(({ id, label, Icon }) => {
            const isSelected = activeTheme === id;
            return (
              <Button
                key={id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                variant={isSelected ? 'primary' : 'secondary'}
                onClick={() => setTheme(id)}
                className="justify-center gap-2"
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

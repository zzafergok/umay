'use client';

import { Boxes, MapPin, Settings, Wrench } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/core/avatar';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Card, CardContent } from '@/components/core/card';
import { Link } from '@/components/core/link';
import { StatusPill } from '@/components/core/status-pill';
import { LogoutButton } from '@/components/shared/account-actions';
import {
  getDisplayName,
  getUserInitials,
} from '@/components/shared/account-actions/utils';
import { useAuthStore } from '@/stores/use-auth-store';
import type {
  AuthProfileCopy,
  ProfileStats,
  ProfileUserSnapshot,
} from '../types';

interface ProfileOverviewCardProps {
  initialUser: ProfileUserSnapshot;
  stats: ProfileStats;
  copy: AuthProfileCopy['overview'];
}

export function ProfileOverviewCard({
  initialUser,
  stats,
  copy,
}: ProfileOverviewCardProps) {
  const storeUser = useAuthStore((state) => state.user);
  const currentUser =
    storeUser && storeUser.id === initialUser.id
      ? {
          id: storeUser.id,
          email: storeUser.email,
          name: storeUser.name ?? initialUser.name,
          role: storeUser.role === 'admin' ? 'admin' : initialUser.role,
        }
      : initialUser;

  const displayName = getDisplayName(currentUser, currentUser.email);
  const initials = getUserInitials(currentUser);
  const roleLabel =
    currentUser.role === 'admin' ? copy.roleAdmin : copy.roleUser;

  const statItems = [
    { label: copy.statsItems, value: stats.items, Icon: Boxes },
    { label: copy.statsLocations, value: stats.locations, Icon: MapPin },
    { label: copy.statsParts, value: stats.parts, Icon: Wrench },
  ];

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar size="lg" className="shrink-0 border-border">
              <AvatarFallback className="bg-accent-subtle font-heading font-bold text-accent">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-title text-text truncate font-bold">
                  {displayName}
                </h2>
                <StatusPill tone="active" label={copy.activeSession} />
                <Badge variant="secondary">{roleLabel}</Badge>
              </div>
              <p className="text-body-sm text-text-muted truncate">
                {currentUser.email}
              </p>
              <p className="text-text-subtle font-mono text-caption">
                {copy.accountIdLabel}: {currentUser.id}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <Button asChild variant="secondary" size="sm">
              <Link href="/settings">
                <Settings className="mr-1.5 h-4 w-4" aria-hidden="true" />
                <span>{copy.settingsLink}</span>
              </Link>
            </Button>
            <LogoutButton size="sm" variant="outline" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-border pt-5 sm:grid-cols-3">
          {statItems.map(({ label, value, Icon }) => (
            <div
              key={label}
              className="bg-surface-sunken flex items-center gap-3 rounded-md border border-border px-4 py-3"
            >
              <span className="bg-surface flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border">
                <Icon className="text-text-muted h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-text-muted truncate text-caption">{label}</p>
                <p className="font-heading text-title text-text font-bold tabular-nums">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

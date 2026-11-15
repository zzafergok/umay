'use client';

import { useState } from 'react';
import {
  Activity,
  Boxes,
  Check,
  Copy,
  MapPin,
  Settings,
  ShoppingCart,
  Tags,
  Wrench,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/core/avatar';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Card, CardContent } from '@/components/core/card';
import { Link } from '@/components/core/link';
import { StatusPill } from '@/components/core/status-pill';
import { toast } from '@/components/core/toast';
import { LogoutButton } from '@/components/shared/account-actions';
import {
  getDisplayName,
  getUserInitials,
} from '@/components/shared/account-actions/utils';
import { useAuthStore } from '@/stores/use-auth-store';
import type {
  AuthProfileCopy,
  ProfileSessionMeta,
  ProfileStats,
  ProfileUserSnapshot,
} from '../types';

interface ProfileOverviewCardProps {
  initialUser: ProfileUserSnapshot;
  stats: ProfileStats;
  sessionMeta: ProfileSessionMeta;
  copy: AuthProfileCopy['overview'];
}

export function ProfileOverviewCard({
  initialUser,
  stats,
  sessionMeta,
  copy,
}: ProfileOverviewCardProps) {
  const [copiedId, setCopiedId] = useState(false);
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
  const providerLabel = copy.providers[sessionMeta.provider];

  const handleCopyAccountId = async () => {
    try {
      await navigator.clipboard.writeText(currentUser.id);
      setCopiedId(true);
      toast.success(copy.copiedIdMessage);
      window.setTimeout(() => setCopiedId(false), 2000);
    } catch {
      toast.error(copy.copyIdErrorMessage);
    }
  };

  const statItems = [
    { label: copy.statsItems, value: stats.items, Icon: Boxes },
    { label: copy.statsLocations, value: stats.locations, Icon: MapPin },
    { label: copy.statsParts, value: stats.parts, Icon: Wrench },
    { label: copy.statsCategories, value: stats.categories, Icon: Tags },
    { label: copy.statsShopping, value: stats.shopping, Icon: ShoppingCart },
  ];

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4 sm:items-center">
            <Avatar size="lg" className="shrink-0 border-border">
              <AvatarFallback className="bg-accent-subtle font-heading font-bold text-accent">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-title text-text truncate font-bold">
                  {displayName}
                </h2>
                <StatusPill tone="active" label={copy.activeSession} />
                <Badge variant="secondary">{roleLabel}</Badge>
                <Badge variant="outline">{providerLabel}</Badge>
                {sessionMeta.emailVerified !== null && (
                  <Badge
                    variant={sessionMeta.emailVerified ? 'success' : 'warning'}
                  >
                    {sessionMeta.emailVerified
                      ? copy.verifiedBadge
                      : copy.unverifiedBadge}
                  </Badge>
                )}
              </div>
              <p className="text-body-sm text-text-muted truncate">
                {currentUser.email}
              </p>
              <div className="flex items-start gap-2 sm:items-center">
                <span className="text-text-subtle min-w-0 flex-1 break-all font-mono text-caption">
                  {copy.accountIdLabel}: {currentUser.id}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="h-9 w-9 shrink-0 sm:h-7 sm:w-7"
                  onClick={() => void handleCopyAccountId()}
                  aria-label={copy.copyIdLabel}
                  title={copy.copyIdLabel}
                >
                  {copiedId ? (
                    <Check
                      className="h-3.5 w-3.5 text-success"
                      aria-hidden="true"
                    />
                  ) : (
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center lg:shrink-0">
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="min-h-[42px] sm:min-h-0"
            >
              <Link href="/activity">
                <Activity className="mr-1.5 h-4 w-4" aria-hidden="true" />
                <span>{copy.activityLink}</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="min-h-[42px] sm:min-h-0"
            >
              <Link href="/settings">
                <Settings className="mr-1.5 h-4 w-4" aria-hidden="true" />
                <span>{copy.settingsLink}</span>
              </Link>
            </Button>
            <LogoutButton
              size="sm"
              variant="outline"
              className="col-span-2 min-h-[42px] sm:col-span-1 sm:min-h-0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 border-t border-border pt-5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
          {statItems.map(({ label, value, Icon }, index) => (
            <div
              key={label}
              className={`bg-surface-sunken flex min-w-0 items-center gap-3 rounded-md border border-border px-3 py-3 sm:px-4 ${
                index === statItems.length - 1 ? 'col-span-2 sm:col-span-1' : ''
              }`}
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

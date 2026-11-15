'use client';

import { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { toast } from '@/components/core/toast';
import { useCurrentLocale } from '@/components/providers/client-locale-provider';
import { LogoutButton } from '@/components/shared/account-actions';
import { requestFirebasePasswordReset } from '@/lib/firebase/client';
import type { AuthProfileCopy, ProfileSessionMeta } from '../types';

interface ProfileSessionCardProps {
  userEmail: string;
  sessionMeta: ProfileSessionMeta;
  providerLabels: AuthProfileCopy['overview']['providers'];
  copy: AuthProfileCopy['sessionCard'];
}

function formatSessionTimestamp(
  iso: string | undefined,
  locale: string,
  fallback: string,
): string {
  if (!iso) return fallback;
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return fallback;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(parsed));
}

export function ProfileSessionCard({
  userEmail,
  sessionMeta,
  providerLabels,
  copy,
}: ProfileSessionCardProps) {
  const locale = useCurrentLocale();
  const [sendingReset, setSendingReset] = useState(false);

  const handlePasswordReset = async () => {
    if (sessionMeta.provider === 'demo') {
      toast.info(copy.resetPasswordDemoInfo);
      return;
    }
    if (sessionMeta.provider === 'google') {
      toast.info(copy.resetPasswordGoogleInfo);
      return;
    }
    setSendingReset(true);
    try {
      await requestFirebasePasswordReset(userEmail);
      toast.success(copy.resetPasswordSuccess);
    } catch {
      toast.error(copy.resetPasswordError);
    } finally {
      setSendingReset(false);
    }
  };

  const sessionRows = [
    {
      label: copy.sessionStartLabel,
      value: formatSessionTimestamp(
        sessionMeta.sessionIssuedAt,
        locale,
        copy.unknownDate,
      ),
    },
    {
      label: copy.sessionExpiryLabel,
      value: formatSessionTimestamp(
        sessionMeta.sessionExpiresAt,
        locale,
        copy.unknownDate,
      ),
    },
    {
      label: copy.lastSignInLabel,
      value: formatSessionTimestamp(
        sessionMeta.lastSignInAt ?? sessionMeta.sessionIssuedAt,
        locale,
        copy.unknownDate,
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
          <CardTitle>{copy.title}</CardTitle>
        </div>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-surface-sunken space-y-3 rounded-md border border-border p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-text-muted text-caption">{copy.signedInAs}</p>
              <p className="text-body-sm text-text mt-0.5 truncate font-semibold">
                {userEmail}
              </p>
            </div>
            <Badge variant="outline">
              {providerLabels[sessionMeta.provider]}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-2 border-t border-border pt-2.5 sm:grid-cols-3">
            {sessionRows.map((row) => (
              <div key={row.label} className="min-w-0">
                <p className="text-text-muted truncate text-caption">
                  {row.label}
                </p>
                <p className="text-text mt-0.5 truncate text-xs font-medium tabular-nums">
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={sendingReset}
            onClick={() => void handlePasswordReset()}
          >
            <KeyRound className="mr-1.5 h-4 w-4" aria-hidden="true" />
            <span>
              {sendingReset
                ? copy.resetPasswordSending
                : copy.resetPasswordLabel}
            </span>
          </Button>
          <LogoutButton size="sm" variant="outline" />
        </div>
      </CardContent>
    </Card>
  );
}

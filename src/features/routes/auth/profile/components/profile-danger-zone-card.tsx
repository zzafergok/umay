'use client';

import { AlertTriangle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { DeleteAccountButton } from '@/components/shared/account-actions';
import type { AuthProfileCopy } from '../types';

interface ProfileDangerZoneCardProps {
  userEmail: string;
  copy: AuthProfileCopy['dangerZone'];
}

export function ProfileDangerZoneCard({
  userEmail,
  copy,
}: ProfileDangerZoneCardProps) {
  return (
    <Card className="border-danger/35">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-danger" aria-hidden="true" />
          <CardTitle className="text-danger">{copy.title}</CardTitle>
        </div>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-danger/25 bg-danger-subtle/50 p-3.5">
          <p className="text-body-sm leading-relaxed text-text">
            {copy.warning}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <DeleteAccountButton userEmail={userEmail} />
        </div>
      </CardContent>
    </Card>
  );
}

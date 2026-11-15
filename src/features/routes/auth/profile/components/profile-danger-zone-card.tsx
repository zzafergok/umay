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
          <AlertTriangle className="text-danger h-5 w-5" aria-hidden="true" />
          <CardTitle className="text-danger">{copy.title}</CardTitle>
        </div>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-danger/25 bg-danger-subtle/50 rounded-md border p-3.5">
          <p className="text-body-sm text-text leading-relaxed">
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

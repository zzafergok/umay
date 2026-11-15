'use client';

import { ShieldCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { LogoutButton } from '@/components/shared/account-actions';
import type { AuthProfileCopy } from '../types';

interface ProfileSessionCardProps {
  userEmail: string;
  copy: AuthProfileCopy['sessionCard'];
}

export function ProfileSessionCard({
  userEmail,
  copy,
}: ProfileSessionCardProps) {
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
        <div className="bg-surface-sunken rounded-md border border-border p-3.5">
          <p className="text-text-muted text-caption">{copy.signedInAs}</p>
          <p className="text-body-sm text-text mt-0.5 truncate font-semibold">
            {userEmail}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <LogoutButton variant="outline" />
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { ShieldCheck, UserRound } from 'lucide-react';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { Link } from '@/components/core/link';
import {
  DeleteAccountButton,
  LogoutButton,
} from '@/components/shared/account-actions';
import type { AuthSettingsCopy } from '../types';

interface AccountActionsCardProps {
  copy: AuthSettingsCopy;
}

export function AccountActionsCard({ copy }: AccountActionsCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
          <CardTitle>{copy.accountSectionTitle}</CardTitle>
        </div>
        <CardDescription>{copy.accountSectionDescription}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex flex-wrap items-center gap-2.5">
        <Button asChild variant="secondary" size="sm">
          <Link href="/profile">
            <UserRound className="mr-1.5 h-4 w-4" aria-hidden="true" />
            <span>{copy.openProfileLabel}</span>
          </Link>
        </Button>
        <LogoutButton size="sm" variant="outline" />
        <DeleteAccountButton />
      </CardContent>
    </Card>
  );
}

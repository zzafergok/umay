'use client';

import { UserRound } from 'lucide-react';
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
    <Card>
      <CardHeader>
        <CardTitle>{copy.accountSectionTitle}</CardTitle>
        <CardDescription>{copy.accountSectionDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Button asChild variant="secondary">
          <Link href="/profile">
            <UserRound className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>{copy.openProfileLabel}</span>
          </Link>
        </Button>
        <LogoutButton variant="outline" />
        <DeleteAccountButton />
      </CardContent>
    </Card>
  );
}

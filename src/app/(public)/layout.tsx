import { redirect } from 'next/navigation';
import { PublicSessionSync } from '@/components/shared/auth-route-guard';
import { PublicShell } from '@/features/routes/_shared/layouts';
import { getAuthenticatedUser } from '@/lib/auth/request-user';
import { getLastAuthRoute } from '@/lib/auth/session';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();
  if (user) {
    redirect(await getLastAuthRoute());
  }

  return (
    <PublicShell>
      <PublicSessionSync />
      {children}
    </PublicShell>
  );
}

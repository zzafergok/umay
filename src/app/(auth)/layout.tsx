import { redirect } from 'next/navigation';
import { AuthShell } from '@/features/routes/_shared/layouts';
import { getAuthenticatedUser } from '@/lib/auth/request-user';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/');
  }

  return <AuthShell>{children}</AuthShell>;
}

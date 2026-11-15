import { PublicHomeScreen } from '@/features/routes/public/home';
import { parsePublicMobileTabValue } from '@/features/routes/public/home/mobile-tab-routing';
import { createStaticMetadata } from '@/lib/metadata/page-metadata';

export const generateMetadata = createStaticMetadata('publicHome');

interface PublicHomePageProps {
  searchParams?: Promise<{ tab?: string | string[] }>;
}

export default async function PublicHomePage({
  searchParams,
}: PublicHomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialTab =
    parsePublicMobileTabValue(resolvedSearchParams?.tab) ?? 'start';

  return <PublicHomeScreen initialTab={initialTab} />;
}

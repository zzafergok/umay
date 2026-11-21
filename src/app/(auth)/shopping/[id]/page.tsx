import type { Metadata } from 'next';
import { ShoppingDetailScreen } from '@/features/routes/auth/shopping/screen';

export const metadata: Metadata = {
  title: 'Alışveriş Listesi Detayı',
  description: 'Liste içindeki ürünleri takip et, fiş tara ve stoğa aktar.',
};

export default async function ShoppingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ShoppingDetailScreen listId={id} />;
}

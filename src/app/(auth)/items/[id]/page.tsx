import type { Metadata } from 'next';
import { ItemDetailScreen } from '@/features/routes/auth/items/item-detail-screen';

export const metadata: Metadata = {
  title: 'Ürün Detayı',
  description: 'Ürün stok geçmişi, QR etiket ve teknik bilgiler.',
};

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ItemDetailScreen id={id} />;
}

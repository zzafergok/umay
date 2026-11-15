import type { Metadata } from 'next';
import { PartDetailScreen } from '@/features/routes/auth/parts/part-detail-screen';

export const metadata: Metadata = {
  title: 'Parça Detayı',
  description: 'Parça ömür durumu, değişim geçmişi ve maliyet analizi.',
};

export default async function PartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PartDetailScreen id={id} />;
}

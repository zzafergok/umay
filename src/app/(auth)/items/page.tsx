import type { Metadata } from 'next';
import { ItemsScreen } from '@/features/routes/auth/items/items-screen';

export const metadata: Metadata = {
  title: 'Ürünler',
  description: 'Ev envanteri ve stok listesi.',
};

export default function ItemsPage() {
  return <ItemsScreen />;
}

import type { Metadata } from 'next';
import { ShoppingScreen } from '@/features/routes/auth/shopping/screen';

export const metadata: Metadata = {
  title: 'Alışveriş Listesi',
  description: 'Düşük stok ve parça değişimi önerili alışveriş listesi.',
};

export default function ShoppingPage() {
  return <ShoppingScreen />;
}

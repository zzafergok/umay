import type { Metadata } from 'next';
import { ShoppingListsScreen } from '@/features/routes/auth/shopping/shopping-lists-screen';

export const metadata: Metadata = {
  title: 'Alışveriş Listeleri',
  description:
    'Market ve ev ihtiyaçları için alışveriş listelerini oluştur ve yönet.',
};

export default function ShoppingPage() {
  return <ShoppingListsScreen />;
}

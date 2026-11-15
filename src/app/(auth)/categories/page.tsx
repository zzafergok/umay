import type { Metadata } from 'next';
import { CategoriesScreen } from '@/features/routes/auth/categories/screen';

export const metadata: Metadata = {
  title: 'Kategoriler',
  description: 'Özel alan tanımlı envanter kategorileri.',
};

export default function CategoriesPage() {
  return <CategoriesScreen />;
}

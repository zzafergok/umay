import type { Metadata } from 'next';
import { ActivityScreen } from '@/features/routes/auth/activity/screen';

export const metadata: Metadata = {
  title: 'Faaliyet Günlüğü',
  description: 'Stok hareket günlüğü ve envanter işlem geçmişi.',
};

export default function ActivityPage() {
  return <ActivityScreen />;
}

import type { Metadata } from 'next';
import { ActivityScreen } from '@/features/routes/auth/activity/screen';

export const metadata: Metadata = {
  title: 'Faaliyet & Bildirimler',
  description: 'Stok hareket günlüğü ve parça hatırlatmaları.',
};

export default function ActivityPage() {
  return <ActivityScreen />;
}

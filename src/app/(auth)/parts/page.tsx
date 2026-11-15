import type { Metadata } from 'next';
import { PartsScreen } from '@/features/routes/auth/parts/parts-screen';

export const metadata: Metadata = {
  title: 'Ömürlü Parçalar',
  description: 'Filtre, pil ve değiştirilebilir parça ömür takibi.',
};

export default function PartsPage() {
  return <PartsScreen />;
}

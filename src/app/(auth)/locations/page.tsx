import type { Metadata } from 'next';
import { LocationsScreen } from '@/features/routes/auth/locations/screen';

export const metadata: Metadata = {
  title: 'Konumlar',
  description: 'Evdeki oda, dolap ve raf konum ağacı.',
};

export default function LocationsPage() {
  return <LocationsScreen />;
}

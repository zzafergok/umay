import type { Metadata } from 'next';
import { ScanScreen } from '@/features/routes/auth/scan/screen';

export const metadata: Metadata = {
  title: 'Barkod & QR Tara',
  description: 'Kamera ile barkod veya QR kod okutarak hızlı stok işlemi yap.',
};

export default function ScanPage() {
  return <ScanScreen />;
}

import type { Metadata } from 'next';
import { DesignSystemScreen } from '@/features/routes/public/design/screen';

export const metadata: Metadata = {
  title: 'Tasarım Sistemi',
  description: 'Umay tasarım sistemi tokenları, bileşenleri ve kart hiyerarşisi.',
};

export default function DesignPage() {
  return <DesignSystemScreen />;
}

import { AuthProfileScreen } from '@/features/routes/auth/profile';
import { createStaticMetadata } from '@/lib/metadata/page-metadata';

export const generateMetadata = createStaticMetadata('authProfile');

export default function ProfilePage() {
  return <AuthProfileScreen />;
}

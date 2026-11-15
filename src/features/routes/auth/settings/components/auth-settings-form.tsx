'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { toast } from '@/components/core/toast';
import { Form, SubmitButton, TextField } from '@/components/forms';
import {
  useCurrentUserQuery,
  useUpdateProfileMutation,
} from '@/hooks/use-auth-hooks';
import {
  userSettingsSchema,
  type UserSettingsFormData,
} from '@/lib/auth/auth-schema';
import type { AuthSettingsCopy } from '../types';

interface AuthSettingsFormProps {
  copy: AuthSettingsCopy;
}

export function AuthSettingsForm({ copy }: AuthSettingsFormProps) {
  const router = useRouter();
  const { data: userData } = useCurrentUserQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const [loading, setLoading] = useState(false);

  const resolvedName =
    userData?.user?.name?.trim() ||
    userData?.user?.email?.split('@')[0] ||
    copy.displayNamePlaceholder;

  const handleSubmit = async (data: UserSettingsFormData) => {
    setLoading(true);
    try {
      await updateProfileMutation.mutateAsync({ name: data.displayName });
      toast.success(`${data.displayName} için ayarlar güncellendi.`);
      router.refresh();
    } catch {
      toast.error('Ayarlar güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form<UserSettingsFormData>
      key={resolvedName}
      schema={userSettingsSchema}
      defaultValues={{
        displayName: resolvedName,
      }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <TextField
        name="displayName"
        label={copy.displayNameLabel}
        placeholder={copy.displayNamePlaceholder}
        required
      />

      <SubmitButton isLoading={loading}>
        <Save className="mr-2 h-4 w-4" aria-hidden="true" />
        {copy.submitLabel}
      </SubmitButton>
    </Form>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { Input } from '@/components/core/input';
import { Label } from '@/components/core/label';
import { toast } from '@/components/core/toast';
import { Form, SubmitButton, TextField } from '@/components/forms';
import {
  useCurrentUserQuery,
  useUpdateProfileMutation,
} from '@/hooks/use-auth-hooks';
import {
  profileUpdateSchema,
  type ProfileUpdateFormData,
} from '@/lib/auth/auth-schema';
import type { AuthProfileCopy, ProfileUserSnapshot } from '../types';

interface ProfileEditFormProps {
  initialUser: ProfileUserSnapshot;
  copy: AuthProfileCopy['editForm'];
}

export function ProfileEditForm({ initialUser, copy }: ProfileEditFormProps) {
  const router = useRouter();
  const { data } = useCurrentUserQuery();
  const updateProfileMutation = useUpdateProfileMutation();

  const resolvedUser = data?.user ?? initialUser;
  const initialName =
    resolvedUser.name?.trim() || resolvedUser.email.split('@')[0] || '';

  const methods = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: initialName,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    methods.reset({ name: initialName });
  }, [initialName, methods]);

  const handleSubmit = async (formData: ProfileUpdateFormData) => {
    try {
      const updated = await updateProfileMutation.mutateAsync(formData);
      methods.reset({ name: updated.user.name ?? formData.name });
      toast.success(copy.successMessage);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : copy.errorMessage;
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form<ProfileUpdateFormData>
          schema={profileUpdateSchema}
          methods={methods}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <TextField
            name="name"
            label={copy.nameLabel}
            placeholder={copy.namePlaceholder}
            autoComplete="name"
            maxLength={80}
            required
          />

          <div className="space-y-1.5">
            <Label
              htmlFor="profile-email-readonly"
              className="font-mono text-2xs uppercase tracking-wider text-text-muted"
            >
              {copy.emailLabel}
            </Label>
            <Input
              id="profile-email-readonly"
              type="email"
              value={resolvedUser.email}
              disabled
              readOnly
              className="text-xs"
            />
            <p className="text-caption text-text-muted">{copy.emailHint}</p>
          </div>

          <SubmitButton
            isLoading={updateProfileMutation.isPending}
            loadingText={copy.loadingLabel}
            disableIfNoChanges
            className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
            icon={<Save className="h-4 w-4" aria-hidden="true" />}
          >
            {copy.submitLabel}
          </SubmitButton>
        </Form>
      </CardContent>
    </Card>
  );
}

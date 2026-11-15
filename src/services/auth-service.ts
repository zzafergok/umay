import { apiClient } from '@/lib/api';
import type {
  DeleteAccountFormData,
  ProfileUpdateFormData,
} from '@/lib/auth/auth-schema';
import type { AuthUser } from '@/stores/use-auth-store';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface UserResponse {
  user: AuthUser;
}

export interface ProfileUpdateResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export const AUTH_CACHE_STRATEGY = {
  staleTime: 0, // Always fetch fresh auth data
  gcTime: 1000 * 60 * 5, // 5 minutes cache retention
};

export const authService = {
  login: (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  register: (credentials: RegisterCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/register', credentials);
  },

  logout: (): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/logout');
  },

  getCurrentUser: (): Promise<UserResponse> => {
    return apiClient.get<UserResponse>('/auth/me');
  },

  updateProfile: (
    payload: ProfileUpdateFormData,
  ): Promise<ProfileUpdateResponse> => {
    return apiClient.patch<ProfileUpdateResponse>('/auth/me', payload);
  },

  deleteAccount: (
    payload: DeleteAccountFormData,
  ): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>('/auth/account', {
      body: payload,
    });
  },
};

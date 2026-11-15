import type {
  StockMovementType,
  UserSettings,
} from '@/features/inventory/types';

export interface ProfileUserSnapshot {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}

export interface ProfileStats {
  items: number;
  locations: number;
  parts: number;
  categories: number;
  shopping: number;
}

export interface ProfileSessionMeta {
  provider: 'google' | 'password' | 'firebase' | 'demo';
  emailVerified: boolean | null;
  sessionIssuedAt?: string;
  sessionExpiresAt?: string;
  accountCreatedAt?: string;
  lastSignInAt?: string;
}

export interface ProfileRecentMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: StockMovementType;
  delta: number;
  quantityAfter: number;
  reason?: string;
  at: string;
}

export type ProfileSettingsSnapshot = Pick<
  UserSettings,
  'currency' | 'dateFormat'
>;

export interface AuthProfileCopy {
  title: string;
  description: string;
  overview: {
    activeSession: string;
    roleUser: string;
    roleAdmin: string;
    accountIdLabel: string;
    copyIdLabel: string;
    copiedIdMessage: string;
    copyIdErrorMessage: string;
    activityLink: string;
    settingsLink: string;
    statsItems: string;
    statsLocations: string;
    statsParts: string;
    statsCategories: string;
    statsShopping: string;
    verifiedBadge: string;
    unverifiedBadge: string;
    providers: {
      google: string;
      password: string;
      firebase: string;
      demo: string;
    };
  };
  editForm: {
    title: string;
    description: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailHint: string;
    submitLabel: string;
    loadingLabel: string;
    successMessage: string;
    errorMessage: string;
  };
  preferences: {
    title: string;
    description: string;
    currencyLabel: string;
    currencyOptions: {
      TRY: string;
      USD: string;
      EUR: string;
    };
    dateFormatLabel: string;
    dateFormatOptions: {
      'dd.MM.yyyy': string;
      'yyyy-MM-dd': string;
    };
    themeLabel: string;
    themes: {
      light: string;
      dark: string;
      system: string;
    };
    languageLabel: string;
    submitLabel: string;
    loadingLabel: string;
    successMessage: string;
    errorMessage: string;
  };
  sessionCard: {
    title: string;
    description: string;
    signedInAs: string;
    authMethodLabel: string;
    sessionStartLabel: string;
    sessionExpiryLabel: string;
    lastSignInLabel: string;
    unknownDate: string;
    resetPasswordLabel: string;
    resetPasswordSending: string;
    resetPasswordSuccess: string;
    resetPasswordDemoInfo: string;
    resetPasswordGoogleInfo: string;
    resetPasswordError: string;
  };
  recentActivity: {
    title: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
    viewAllLabel: string;
    fallbackItemName: string;
    movementTypes: Record<StockMovementType, string>;
  };
  dangerZone: {
    title: string;
    description: string;
    warning: string;
  };
}

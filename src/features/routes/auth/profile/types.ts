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
}

export interface AuthProfileCopy {
  title: string;
  description: string;
  overview: {
    activeSession: string;
    roleUser: string;
    roleAdmin: string;
    accountIdLabel: string;
    settingsLink: string;
    statsItems: string;
    statsLocations: string;
    statsParts: string;
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
  sessionCard: {
    title: string;
    description: string;
    signedInAs: string;
  };
  dangerZone: {
    title: string;
    description: string;
    warning: string;
  };
}

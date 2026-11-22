import type { UserSettings } from '@/features/inventory/types';

export type SettingsSnapshot = Required<
  Pick<UserSettings, 'currency' | 'dateFormat' | 'defaultUnit' | 'compactMode'>
>;

export type AuthSettingsCopy = {
  title: string;
  description: string;
  cardTitle: string;
  displayNameLabel: string;
  displayNamePlaceholder: string;
  submitLabel: string;
  accountSectionTitle: string;
  accountSectionDescription: string;
  openProfileLabel: string;
  overview: {
    activeConfigTitle: string;
    activeConfigSubtitle: string;
    themeLabel: string;
    languageLabel: string;
    formatLabel: string;
    unitAndDensityLabel: string;
    compactLabel: string;
    detailedLabel: string;
    backToHomeLabel: string;
    themes: {
      light: string;
      dark: string;
      system: string;
    };
  };
  appearance: {
    title: string;
    description: string;
    themeLabel: string;
    themes: {
      light: string;
      dark: string;
      system: string;
    };
    languageLabel: string;
    densityLabel: string;
    densityHint: string;
    densitySaved: string;
    densityError: string;
  };
  inventoryRules: {
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
    defaultUnitLabel: string;
    unitOptions: {
      adet: string;
      kg: string;
      lt: string;
      paket: string;
      kutu: string;
    };
    submitLabel: string;
    loadingLabel: string;
    successMessage: string;
    errorMessage: string;
  };
  quickTools: {
    title: string;
    description: string;
    shortcutHint: string;
    links: {
      locations: string;
      categories: string;
      parts: string;
      activity: string;
    };
  };
};

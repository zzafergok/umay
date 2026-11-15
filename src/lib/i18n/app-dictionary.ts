import type { Locale } from '@/i18n/routing';

export interface AppDictionary {
  app: {
    name: string;
    slogan: string;
    titleSuffix: string;
  };
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    loading: string;
    retry: string;
    close: string;
    confirm: string;
    back: string;
    all: string;
    none: string;
    offlineBanner: string;
    pendingSync: string;
  };
}

const dictionaries: Record<Locale, AppDictionary> = {
  tr: {
    app: {
      name: 'Umay',
      slogan: 'Evin bereketi, kayıt altında.',
      titleSuffix: 'Ev Envanteri',
    },
    common: {
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      edit: 'Düzenle',
      add: 'Ekle',
      search: 'Ara',
      filter: 'Filtrele',
      loading: 'Yükleniyor...',
      retry: 'Tekrar Dene',
      close: 'Kapat',
      confirm: 'Onayla',
      back: 'Geri',
      all: 'Tümü',
      none: 'Yok',
      offlineBanner: 'Çevrimdışısın — son veriler gösteriliyor',
      pendingSync: 'Eşitlenmeyi bekleyen işlem',
    },
  },
  en: {
    app: {
      name: 'Umay',
      slogan: "Your home's abundance, accounted for.",
      titleSuffix: 'Home Inventory',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      retry: 'Retry',
      close: 'Close',
      confirm: 'Confirm',
      back: 'Back',
      all: 'All',
      none: 'None',
      offlineBanner: 'You are offline — showing cached data',
      pendingSync: 'Pending sync actions',
    },
  },
};

export function getAppDictionary(locale: Locale): AppDictionary {
  return dictionaries[locale] ?? dictionaries.tr;
}

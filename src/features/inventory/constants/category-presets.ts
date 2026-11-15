import type { CategoryInput } from '@/features/inventory/schemas';

export interface CategoryPresetTemplate {
  id: string;
  badge: string;
  data: CategoryInput;
}

export const CATEGORY_PRESET_TEMPLATES: CategoryPresetTemplate[] = [
  {
    id: 'cables',
    badge: 'Teknik',
    data: {
      name: 'Kablo & Aksesuar',
      description:
        'Bağlantı kabloları, adaptörler, dönüştürücüler ve şarj uçları.',
      colorToken: 'cat-8',
      icon: 'cable',
      itemDefaults: {
        defaultType: 'component',
        defaultUnit: 'adet',
        defaultMinQuantity: 1,
        trackBrandModel: true,
        trackSerialNumber: false,
        trackPurchase: true,
        trackWarranty: false,
        trackExpiry: false,
      },
      customFields: [
        {
          key: 'konnektor_tipi',
          label: 'Konnektör Tipi',
          type: 'select',
          options: [
            'USB-C',
            'Lightning',
            'HDMI',
            'DisplayPort',
            'USB-A',
            '3.5mm',
          ],
          required: true,
          showInSummary: true,
          helpText: 'Kablo veya adaptörün ana bağlantı ucu',
        },
        {
          key: 'uzunluk',
          label: 'Uzunluk',
          type: 'number',
          unit: 'm',
          min: 0.1,
          max: 100,
          placeholder: 'Örn. 1.5',
          showInSummary: true,
        },
        {
          key: 'guc_kapasitesi',
          label: 'Güç Kapasitesi',
          type: 'number',
          unit: 'W',
          min: 1,
          max: 500,
          placeholder: 'Örn. 100',
        },
        {
          key: 'orgulu_mu',
          label: 'Örgülü Kablo',
          type: 'boolean',
          defaultValue: false,
        },
      ],
    },
  },
  {
    id: 'electronics',
    badge: 'Cihaz',
    data: {
      name: 'Elektronik Cihaz',
      description:
        'Bilgisayar, küçük ev aleti, ses/görüntü ve akıllı cihazlar.',
      colorToken: 'cat-4',
      icon: 'cpu',
      itemDefaults: {
        defaultType: 'durable',
        defaultUnit: 'adet',
        defaultMinQuantity: 1,
        trackBrandModel: true,
        trackSerialNumber: true,
        trackPurchase: true,
        trackWarranty: true,
        trackExpiry: false,
      },
      customFields: [
        {
          key: 'guc_tuketimi',
          label: 'Güç / Voltaj',
          type: 'text',
          placeholder: 'Örn. 220V / 65W',
          showInSummary: true,
        },
        {
          key: 'baglanti_turu',
          label: 'Bağlantı Türü',
          type: 'select',
          options: ['Kablolu', 'Wi-Fi', 'Bluetooth', 'Zigbee', 'USB'],
          showInSummary: true,
        },
        {
          key: 'kilavuz_linki',
          label: 'Kullanım Kılavuzu',
          type: 'url',
          placeholder: 'https://...',
        },
      ],
    },
  },
  {
    id: 'kitchen',
    badge: 'Gıda',
    data: {
      name: 'Mutfak & Kiler',
      description: 'Kuru gıda, soslar, içecekler ve mutfak sarf malzemeleri.',
      colorToken: 'cat-2',
      icon: 'utensils',
      itemDefaults: {
        defaultType: 'consumable',
        defaultUnit: 'paket',
        defaultMinQuantity: 2,
        trackBrandModel: true,
        trackPurchase: true,
        trackExpiry: true,
      },
      customFields: [
        {
          key: 'net_gramaj',
          label: 'Net Miktar',
          type: 'number',
          unit: 'gr',
          min: 1,
          placeholder: 'Örn. 500',
          showInSummary: true,
        },
        {
          key: 'saklama_kosulu',
          label: 'Saklama Koşulu',
          type: 'select',
          options: [
            'Oda Sıcaklığı',
            'Buzdolabı (+4°C)',
            'Derin Dondurucu (-18°C)',
            'Serin & Kuru',
          ],
          defaultValue: 'Serin & Kuru',
          showInSummary: true,
        },
        {
          key: 'acildi_mi',
          label: 'Ambalaj Açıldı mı?',
          type: 'boolean',
          defaultValue: false,
        },
      ],
    },
  },
  {
    id: 'parts',
    badge: 'Bakım',
    data: {
      name: 'Yedek Parça & Bakım',
      description: 'Filtre, conta, pil, ampul ve periyodik değişim parçaları.',
      colorToken: 'cat-7',
      icon: 'wrench',
      itemDefaults: {
        defaultType: 'component',
        defaultUnit: 'adet',
        defaultMinQuantity: 2,
        trackBrandModel: true,
        trackPurchase: true,
      },
      customFields: [
        {
          key: 'uyumlu_cihaz',
          label: 'Uyumlu Cihaz / Model',
          type: 'text',
          required: true,
          placeholder: 'Örn. Dyson V15 / Arıtma Pro',
          showInSummary: true,
        },
        {
          key: 'degisim_periyodu',
          label: 'Önerilen Değişim Süresi',
          type: 'number',
          unit: 'gün',
          min: 1,
          placeholder: 'Örn. 180',
        },
        {
          key: 'orijinal_parca',
          label: 'Orijinal (OEM) Parça',
          type: 'boolean',
          defaultValue: true,
        },
      ],
    },
  },
  {
    id: 'health',
    badge: 'Sağlık',
    data: {
      name: 'Sağlık & Eczane',
      description: 'İlaçlar, vitaminler, ilk yardım ve medikal malzemeler.',
      colorToken: 'cat-6',
      icon: 'pill',
      itemDefaults: {
        defaultType: 'consumable',
        defaultUnit: 'kutu',
        defaultMinQuantity: 1,
        trackBrandModel: true,
        trackPurchase: true,
        trackExpiry: true,
      },
      customFields: [
        {
          key: 'doz_etken',
          label: 'Etken Madde / Doz',
          type: 'text',
          placeholder: 'Örn. 500 mg',
          showInSummary: true,
        },
        {
          key: 'kullanim_amaci',
          label: 'Kullanım Notu',
          type: 'textarea',
          placeholder: 'Günde kaç kez / hangi durumda kullanılır?',
        },
        {
          key: 'receteli_mi',
          label: 'Reçeteli Ürün',
          type: 'boolean',
          defaultValue: false,
        },
      ],
    },
  },
];

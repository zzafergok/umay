import {
  BatteryCharging,
  BookOpen,
  Boxes,
  Cable,
  Camera,
  Cpu,
  Home,
  Layers,
  Package,
  Pill,
  ShieldCheck,
  Shirt,
  Sparkles,
  Utensils,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type {
  CustomFieldType,
  ItemStatus,
  ItemType,
} from '@/features/inventory/types';

export interface CategoryColorOption {
  value: string;
  label: string;
  swatchColor: string;
}

export const CATEGORY_COLOR_OPTIONS: CategoryColorOption[] = [
  {
    value: 'umay-blue',
    label: 'Umay Mavisi',
    swatchColor: 'rgb(var(--accent))',
  },
  { value: 'cat-1', label: 'Terrakota', swatchColor: 'rgb(var(--cat-1))' },
  { value: 'cat-2', label: 'Zeytin Yeşili', swatchColor: 'rgb(var(--cat-2))' },
  { value: 'cat-3', label: 'Camgöbeği', swatchColor: 'rgb(var(--cat-3))' },
  { value: 'cat-4', label: 'Gök Mavisi', swatchColor: 'rgb(var(--cat-4))' },
  { value: 'cat-5', label: 'Lavanta Moru', swatchColor: 'rgb(var(--cat-5))' },
  { value: 'cat-6', label: 'Gül Kurusu', swatchColor: 'rgb(var(--cat-6))' },
  { value: 'cat-7', label: 'Kehribar', swatchColor: 'rgb(var(--cat-7))' },
  { value: 'cat-8', label: 'Arduvaz', swatchColor: 'rgb(var(--cat-8))' },
  { value: 'emerald', label: 'Zümrüt', swatchColor: '#10b981' },
  { value: 'amber', label: 'Altın', swatchColor: '#f59e0b' },
  { value: 'rose', label: 'Kırmızı', swatchColor: '#f43f5e' },
  { value: 'violet', label: 'Mor', swatchColor: '#8b5cf6' },
];

export interface CategoryIconOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { value: 'boxes', label: 'Kutu / Genel', icon: Boxes },
  { value: 'cable', label: 'Kablo', icon: Cable },
  { value: 'cpu', label: 'Elektronik', icon: Cpu },
  { value: 'utensils', label: 'Mutfak', icon: Utensils },
  { value: 'wrench', label: 'Bakım / Parça', icon: Wrench },
  { value: 'pill', label: 'Sağlık', icon: Pill },
  { value: 'home', label: 'Ev Yaşam', icon: Home },
  { value: 'battery', label: 'Enerji / Pil', icon: BatteryCharging },
  { value: 'camera', label: 'Medya / Optik', icon: Camera },
  { value: 'shirt', label: 'Tekstil', icon: Shirt },
  { value: 'book', label: 'Kitap / Evrak', icon: BookOpen },
  { value: 'shield', label: 'Güvenlik', icon: ShieldCheck },
  { value: 'sparkles', label: 'Temizlik', icon: Sparkles },
  { value: 'layers', label: 'Koleksiyon', icon: Layers },
  { value: 'package', label: 'Depo / Paket', icon: Package },
];

export interface CustomFieldTypeOption {
  value: CustomFieldType;
  label: string;
  description: string;
  shortLabel: string;
}

export const CUSTOM_FIELD_TYPE_OPTIONS: CustomFieldTypeOption[] = [
  {
    value: 'text',
    label: 'Kısa Metin',
    shortLabel: 'Metin',
    description: 'Tek satırlık teknik değer, kod veya malzeme',
  },
  {
    value: 'textarea',
    label: 'Uzun Metin',
    shortLabel: 'Açıklama',
    description: 'Çok satırlı uyumluluk veya detay notu',
  },
  {
    value: 'number',
    label: 'Sayı & Birim',
    shortLabel: 'Sayı',
    description: 'Uzunluk, güç, kapasite gibi ölçülebilir değer',
  },
  {
    value: 'select',
    label: 'Açılır Liste',
    shortLabel: 'Liste',
    description: 'Önceden tanımlı seçeneklerden tekli seçim',
  },
  {
    value: 'date',
    label: 'Tarih',
    shortLabel: 'Tarih',
    description: 'Takvim seçicili tarih bilgisi',
  },
  {
    value: 'boolean',
    label: 'Evet / Hayır',
    shortLabel: 'Anahtar',
    description: 'Açık/kapalı özellik anahtarı',
  },
  {
    value: 'url',
    label: 'Bağlantı (URL)',
    shortLabel: 'URL',
    description: 'Kılavuz, datasheet veya ürün sayfası linki',
  },
];

export const ITEM_TYPE_OPTIONS: {
  value: ItemType;
  label: string;
  description: string;
}[] = [
  {
    value: 'durable',
    label: 'Demirbaş',
    description: 'Uzun ömürlü cihaz, alet veya ekipman',
  },
  {
    value: 'consumable',
    label: 'Sarf Malzeme',
    description: 'Zamanla tükenen gıda, temizlik veya malzeme',
  },
  {
    value: 'component',
    label: 'Parça / Aksesuar',
    description: 'Yedek parça, kablo, adaptör veya bileşen',
  },
];

export const ITEM_STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: 'active', label: 'Aktif' },
  { value: 'in_repair', label: 'Tamirde' },
  { value: 'lent', label: 'Ödünç Verildi' },
  { value: 'discarded', label: 'Kullanım Dışı' },
];

export const UNIT_SUGGESTIONS = [
  'adet',
  'paket',
  'kutu',
  'kg',
  'gr',
  'lt',
  'ml',
  'm',
  'çift',
  'set',
] as const;

export const NUMBER_UNIT_SUGGESTIONS = [
  'cm',
  'm',
  'mm',
  'W',
  'V',
  'A',
  'mAh',
  'GB',
  'kg',
  'gr',
  'ml',
  'lt',
  'saat',
] as const;

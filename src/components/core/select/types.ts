import * as React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';

export interface NativeSelectOption {
  disabled?: boolean;
  endAdornment?: React.ReactNode;
  label: React.ReactNode;
  value: string | number;
  searchValue?: string;
}

export type NativeSelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'defaultValue' | 'onChange' | 'value'
> & {
  options?: NativeSelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  searchable?: boolean;
  searchThreshold?: number;
  searchPlaceholder?: string;
};

export interface SelectContentProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Content
> {
  /**
   * Açılır menü içinde arama kutusunu zorunlu açar/kapatır.
   * Belirtilmezse eleman sayısı `searchThreshold` (varsayılan: 4) değerini aştığında otomatik aktifleşir.
   */
  searchable?: boolean;
  /** Arama kutusunun otomatik görünmesi için gereken minimum seçenek eşiği (varsayılan: 4 -> 5+ elemanda aktif). */
  searchThreshold?: number;
  /** Arama kutusu placeholder metni. */
  searchPlaceholder?: string;
  /** Eşleşen sonuç olmadığında gösterilecek metin. */
  emptySearchText?: string;
}

export interface SelectContentProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Content
> {
  /**
   * Açılır menü içinde arama kutusunu zorunlu açar/kapatır.
   * Belirtilmezse eleman sayısı `searchThreshold` (varsayılan: 4) değerini aştığında otomatik aktifleşir.
   */
  searchable?: boolean;
  /** Arama kutusunun otomatik görünmesi için gereken minimum seçenek eşiği (varsayılan: 4 -> 5+ elemanda aktif). */
  searchThreshold?: number;
  /** Arama kutusu placeholder metni. */
  searchPlaceholder?: string;
  /** Eşleşen sonuç olmadığında gösterilecek metin. */
  emptySearchText?: string;
}

export interface SelectItemProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Item
> {
  endAdornment?: React.ReactNode;
  /** Arama eşleşmesinde kullanılacak ek anahtar kelimeler veya metin. */
  searchValue?: string;
}

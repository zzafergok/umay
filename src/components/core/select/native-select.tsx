'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from './select-primitives';
import type { NativeSelectProps } from './types';

/**
 * Form-friendly adapter around Radix Select primitives.
 */
export const NativeSelect = ({
  children,
  className,
  defaultValue,
  disabled,
  id,
  name,
  onChange,
  options: providedOptions,
  required,
  searchable,
  searchThreshold,
  searchPlaceholder,
  value,
  ...props
}: NativeSelectProps) => {
  void props;

  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue === undefined ? undefined : String(defaultValue),
  );
  const selectedValue = value === undefined ? uncontrolledValue : String(value);

  const childOptions = React.Children.toArray(children).flatMap((child) => {
    if (
      !React.isValidElement<React.OptionHTMLAttributes<HTMLOptionElement>>(
        child,
      )
    ) {
      return [];
    }

    return [
      {
        disabled: child.props.disabled,
        endAdornment: undefined,
        label: child.props.children,
        searchValue: undefined,
        value: String(child.props.value ?? ''),
      },
    ];
  });

  const options = providedOptions
    ? providedOptions.map((option) => ({
        ...option,
        value: String(option.value),
      }))
    : childOptions;

  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );

  const handleValueChange = (nextValue: string) => {
    if (value === undefined) {
      setUncontrolledValue(nextValue);
    }

    onChange?.({
      currentTarget: { id, name, value: nextValue },
      target: { id, name, value: nextValue },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  return (
    <Select
      value={selectedValue}
      defaultValue={
        defaultValue === undefined ? undefined : String(defaultValue)
      }
      onValueChange={handleValueChange}
      disabled={disabled}
      name={name}
      required={required}
    >
      <SelectTrigger
        id={id}
        aria-required={required}
        className={cn(
          'rounded-md border-border bg-surface-sunken px-3 py-2 text-body text-text focus:border-accent',
          className,
        )}
      >
        <SelectValue placeholder="Seçiniz">
          {selectedValue ? (selectedOption?.label ?? selectedValue) : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        searchable={searchable}
        searchThreshold={searchThreshold}
        searchPlaceholder={searchPlaceholder}
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            endAdornment={option.endAdornment}
            searchValue={option.searchValue}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
NativeSelect.displayName = 'NativeSelect';

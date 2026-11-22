import type * as React from 'react';

export interface ToolbarTabOption {
  value: string;
  label: string;
}

export interface ToolbarSelectOption {
  value: string;
  label: string;
}

export interface ToolbarSelectFilter {
  key: string;
  value: string;
  placeholder: string;
  ariaLabel: string;
  options: ToolbarSelectOption[];
  widthClass?: string;
  onChange: (value: string) => void;
}

export interface ServerListToolbarProps {
  tabs?: {
    value: string;
    options: ToolbarTabOption[];
    onChange: (value: string) => void;
  };
  search?: {
    value: string;
    placeholder: string;
    ariaLabel: string;
    clearAriaLabel?: string;
    isLoading?: boolean;
    onChange: (value: string) => void;
  };
  filters?: ToolbarSelectFilter[];
  countLabel?: string;
  hasActiveFilters?: boolean;
  resetLabel?: string;
  onResetFilters?: () => void;
  actions?: React.ReactNode;
}

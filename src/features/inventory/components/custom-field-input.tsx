'use client';

import * as React from 'react';
import { AlertCircle, ExternalLink, Link2 } from 'lucide-react';
import { Button } from '@/components/core/button';
import { ModernDatePicker } from '@/components/core/date-picker';
import { Input } from '@/components/core/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/core/input-group';
import { Label } from '@/components/core/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/core/select';
import { Textarea } from '@/components/core/textarea';
import type {
  CustomFieldDefinition,
  CustomFieldValue,
} from '@/features/inventory/types';
import { cn } from '@/lib/utils';
import { CustomFieldBoolean } from './custom-field-boolean';

interface CustomFieldInputProps {
  field: CustomFieldDefinition;
  value: CustomFieldValue | undefined;
  onChange: (next: CustomFieldValue | undefined) => void;
  error?: string;
  idPrefix?: string;
  disabled?: boolean;
}

function parseIsoDate(raw: CustomFieldValue | undefined): Date | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed);
}

function toIsoDate(date: Date | null): string | undefined {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function CustomFieldInput({
  field,
  value,
  onChange,
  error,
  idPrefix = 'cf',
  disabled = false,
}: CustomFieldInputProps) {
  const inputId = `${idPrefix}-${field.key}`;

  if (field.type === 'boolean') {
    return (
      <CustomFieldBoolean
        field={field}
        inputId={inputId}
        value={value}
        onChange={onChange}
        error={error}
        disabled={disabled}
      />
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label
          htmlFor={inputId}
          className="font-mono text-2xs uppercase tracking-wider text-ash"
        >
          {field.label}
          {field.required && <span className="ml-1 text-umay-blue">*</span>}
        </Label>
        {field.type === 'number' &&
        (field.min !== undefined || field.max !== undefined) ? (
          <span className="text-[11px] text-text-subtle">
            {field.min !== undefined ? `Min: ${field.min}` : ''}
            {field.min !== undefined && field.max !== undefined ? '·' : ''}
            {field.max !== undefined ? `Max: ${field.max}` : ''}
          </span>
        ) : null}
      </div>

      {field.type === 'textarea' ? (
        <Textarea
          id={inputId}
          value={value !== undefined ? String(value) : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || `${field.label} giriniz...`}
          disabled={disabled}
          error={error}
          className="min-h-20 text-xs"
        />
      ) : field.type === 'number' ? (
        <InputGroup>
          <InputGroupInput
            id={inputId}
            type="number"
            step="any"
            min={field.min}
            max={field.max}
            value={value !== undefined && value !== '' ? String(value) : ''}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') {
                onChange(undefined);
                return;
              }
              const parsed = Number(raw);
              onChange(Number.isNaN(parsed) ? raw : parsed);
            }}
            placeholder={field.placeholder || '0'}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className="text-xs tabular-nums"
          />
          {field.unit ? (
            <InputGroupAddon align="inline-end">
              <InputGroupText className="rounded-xs bg-surface px-2 py-0.5 text-xs font-medium text-text">
                {field.unit}
              </InputGroupText>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      ) : field.type === 'select' ? (
        <Select
          value={
            value !== undefined && String(value) !== ''
              ? String(value)
              : '__none__'
          }
          onValueChange={(next) =>
            onChange(next === '__none__' ? undefined : next)
          }
          disabled={disabled}
        >
          <SelectTrigger
            id={inputId}
            className={cn('text-xs', error && 'border-danger')}
          >
            <SelectValue placeholder={field.placeholder || 'Seçiniz...'} />
          </SelectTrigger>
          <SelectContent>
            {!field.required && (
              <SelectItem value="__none__" className="text-xs text-text-muted">
                Seçim yok
              </SelectItem>
            )}
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === 'date' ? (
        <ModernDatePicker
          value={parseIsoDate(value)}
          onChange={(date) => onChange(toIsoDate(date))}
          placeholder={field.placeholder || 'Tarih seçiniz'}
          disabled={disabled}
          clearable={!field.required}
          error={Boolean(error)}
          className="text-xs"
        />
      ) : field.type === 'url' ? (
        <div className="flex gap-1.5">
          <InputGroup className="flex-1">
            <InputGroupAddon align="inline-start">
              <Link2 className="h-3.5 w-3.5 text-text-muted" />
            </InputGroupAddon>
            <InputGroupInput
              id={inputId}
              type="url"
              value={value !== undefined ? String(value) : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder || 'https://...'}
              disabled={disabled}
              aria-invalid={Boolean(error)}
              className="text-xs"
            />
          </InputGroup>
          {typeof value === 'string' && value.startsWith('http') ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              asChild
              aria-label={`${field.label} bağlantısını aç`}
            >
              <a href={value} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          ) : null}
        </div>
      ) : (
        <Input
          id={inputId}
          value={value !== undefined ? String(value) : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || `${field.label} giriniz...`}
          disabled={disabled}
          error={error}
          className="text-xs"
        />
      )}

      {field.helpText && !error ? (
        <p className="text-xs text-text-muted">{field.helpText}</p>
      ) : null}
      {error ? (
        <p className="flex items-center gap-1 font-mono text-2xs text-danger">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

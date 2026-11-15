'use client';

import * as React from 'react';
import { Questionnaire as QuestionnairePrimitive } from '@shadcn/react/questionnaire';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export function QuestionnaireChoices({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Choices>) {
  return (
    <QuestionnairePrimitive.Choices
      data-slot="questionnaire-choices"
      className={cn(
        'group/questionnaire-choices grid min-w-0 gap-2',
        className,
      )}
      {...props}
    />
  );
}

export function QuestionnaireChoice({
  children,
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Choice>) {
  return (
    <QuestionnairePrimitive.Choice
      data-slot="questionnaire-choice"
      className={cn(
        'group/questionnaire-choice relative flex min-h-11 cursor-pointer select-none items-start gap-2.5 rounded-md border border-border bg-surface px-3 py-2.5 text-start text-body-sm text-text outline-none transition-colors hover:bg-surface-sunken',
        'has-[>input:focus-visible]:border-accent has-[>input:focus-visible]:ring-2 has-[>input:focus-visible]:ring-accent/25',
        'data-invalid:border-danger',
        'data-checked:border-accent data-checked:bg-accent-subtle',
        'data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <QuestionnairePrimitive.ChoiceInput
        data-slot="questionnaire-choice-input"
        className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
      />
      <span
        aria-hidden="true"
        data-slot="questionnaire-choice-indicator"
        className="rounded-xs group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-checked/questionnaire-choice:border-accent group-data-checked/questionnaire-choice:bg-accent group-data-checked/questionnaire-choice:text-on-accent pointer-events-none relative flex size-4 shrink-0 translate-y-0.5 items-center justify-center border border-border-strong bg-surface-sunken group-data-[type=radio]/questionnaire-choice:rounded-full"
      >
        <span
          data-slot="questionnaire-choice-indicator-dot"
          className="group-data-checked/questionnaire-choice:block hidden size-2 rounded-full bg-on-accent group-data-[type=checkbox]/questionnaire-choice:hidden"
        />
        <Check
          data-slot="questionnaire-choice-indicator-check"
          className="group-data-checked/questionnaire-choice:block hidden size-3.5 group-data-[type=radio]/questionnaire-choice:hidden"
        />
      </span>
      <QuestionnairePrimitive.ChoiceLabel
        data-slot="questionnaire-choice-label"
        className="flex min-w-0 flex-1 flex-col gap-0.5 leading-snug"
      >
        {children}
      </QuestionnairePrimitive.ChoiceLabel>
      <QuestionnairePrimitive.ChoiceShortcut
        data-slot="questionnaire-choice-shortcut"
        className="rounded-xs group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 pointer-events-none ms-auto hidden size-5 shrink-0 translate-y-0.5 items-center justify-center border border-border bg-surface-sunken font-mono text-2xs font-medium leading-none text-text-muted group-data-[shortcut]/questionnaire-choice:inline-flex"
      />
    </QuestionnairePrimitive.Choice>
  );
}

export function QuestionnaireChoiceDescription({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="questionnaire-choice-description"
      className={cn('text-text-muted', className)}
      {...props}
    />
  );
}

export function QuestionnaireInput({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Input>) {
  return (
    <div
      data-slot="questionnaire-input-wrapper"
      className="group/questionnaire-input relative w-full min-w-0"
    >
      <QuestionnairePrimitive.Input
        data-slot="questionnaire-input"
        className={cn(
          'min-h-11 w-full min-w-0 rounded-md border border-border bg-surface-sunken px-3 py-2 text-body text-text outline-none transition-colors',
          'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'aria-invalid:border-danger aria-invalid:ring-danger/30',
          'selection:bg-accent selection:text-on-accent placeholder:text-text-subtle',
          className,
        )}
        {...props}
      />
    </div>
  );
}

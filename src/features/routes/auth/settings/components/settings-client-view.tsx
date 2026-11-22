'use client';

import * as React from 'react';
import type { AuthSettingsCopy, SettingsSnapshot } from '../types';
import { InventoryRulesCard } from './inventory-rules-card';
import { QuickToolsCard } from './quick-tools-card';
import { SettingsOverviewCard } from './settings-overview-card';
import { ThemeSelectorCard } from './theme-selector-card';

interface SettingsClientViewProps {
  initialSettings: SettingsSnapshot;
  copy: AuthSettingsCopy;
}

export function SettingsClientView({
  initialSettings,
  copy,
}: SettingsClientViewProps) {
  const [draftRules, setDraftRules] = React.useState<Pick<
    SettingsSnapshot,
    'currency' | 'dateFormat' | 'defaultUnit'
  > | null>(null);

  return (
    <div className="space-y-6">
      <SettingsOverviewCard
        initialSettings={initialSettings}
        draftRules={draftRules}
        openProfileLabel={copy.openProfileLabel}
        unitOptions={copy.inventoryRules.unitOptions}
        dateFormatOptions={copy.inventoryRules.dateFormatOptions}
        copy={copy.overview}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-6">
          <ThemeSelectorCard
            initialCompactMode={initialSettings.compactMode}
            copy={copy.appearance}
          />
        </div>
        <div className="xl:col-span-6">
          <InventoryRulesCard
            initialSettings={initialSettings}
            onDraftChange={setDraftRules}
            copy={copy.inventoryRules}
          />
        </div>
        <div className="xl:col-span-12">
          <QuickToolsCard copy={copy.quickTools} />
        </div>
      </div>
    </div>
  );
}

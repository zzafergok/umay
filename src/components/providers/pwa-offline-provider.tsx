'use client';

import * as React from 'react';
import { WifiOff } from 'lucide-react';
import { toast } from '@/components/core/toast';
import { flushOfflineMutations } from '@/lib/offline/offline-queue';
import { useQueryClient } from '@tanstack/react-query';

function subscribeOnlineStatus(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot(): boolean {
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  return true;
}

export function PwaOfflineProvider() {
  const qc = useQueryClient();
  const isOnline = React.useSyncExternalStore(
    subscribeOnlineStatus,
    getOnlineSnapshot,
    getServerSnapshot,
  );

  React.useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }

    const onOnline = async () => {
      const count = await flushOfflineMutations().catch(() => 0);
      if (count > 0) {
        toast.success(`${count} çevrimdışı işlem eşitlendi.`);
        await qc.invalidateQueries({ queryKey: ['inventory'] });
      }
    };

    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [qc]);

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 border-b border-info/25 bg-info-subtle px-3 py-1.5 text-caption font-medium text-info"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>Çevrimdışısın — değişiklikler kuyruğa alınıyor.</span>
    </div>
  );
}

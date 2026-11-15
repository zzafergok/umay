'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getPublicMobileTabHref,
  resolvePublicMobileTabFromLocation,
} from '@/features/routes/public/home/mobile-tab-routing';
import type {
  PublicHomeCopy,
  PublicMobileTabKey,
} from '@/features/routes/public/home/types';
import { FaqSection } from './faq-section';
import { FeatureInfoCards } from './feature-info-cards';
import { HomeFooterCta } from './home-footer-cta';
import { HomeHero } from './home-hero';
import { HowItWorksSection } from './how-it-works-section';
import { LifecycleCtaCard } from './lifecycle-cta-card';
import { PublicMobileShellView } from './public-mobile-shell-view';
import { QuickRoutesSection } from './quick-routes-section';

export interface PublicHomeClientProps {
  copy: PublicHomeCopy;
  initialTab?: PublicMobileTabKey;
}

function PublicMobileTabSync({
  onSyncTab,
}: {
  onSyncTab: (tab: PublicMobileTabKey) => void;
}) {
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  useEffect(() => {
    const syncFromLocation = () => {
      onSyncTab(
        resolvePublicMobileTabFromLocation(
          window.location.search,
          window.location.hash,
        ),
      );
    };

    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);

    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
    };
  }, [onSyncTab, searchKey]);

  return null;
}

export function PublicHomeClient({
  copy,
  initialTab = 'start',
}: PublicHomeClientProps) {
  const [mobileTab, setMobileTab] = useState<PublicMobileTabKey>(initialTab);

  const handleSelectMobileTab = useCallback((tab: PublicMobileTabKey) => {
    setMobileTab(tab);
    if (typeof window === 'undefined') return;

    const nextHref = getPublicMobileTabHref(tab, window.location.search);
    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (currentHref !== nextHref) {
      window.history.pushState(null, '', nextHref);
    }
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PublicMobileTabSync onSyncTab={setMobileTab} />
      </Suspense>

      <PublicMobileShellView
        copy={copy}
        activeTab={mobileTab}
        onSelectTab={handleSelectMobileTab}
      />

      <div className="mx-auto hidden w-full max-w-6xl space-y-20 px-6 py-12 lg:block">
        <HomeHero hero={copy.hero} heroPreview={copy.heroPreview} />
        <HowItWorksSection howItWorks={copy.howItWorks} />
        <LifecycleCtaCard
          lifecycleCallout={copy.lifecycleCallout}
          loginLabel={copy.hero.loginAction}
        />
        <FeatureInfoCards featuresSection={copy.featuresSection} />
        <QuickRoutesSection quickRoutesSection={copy.quickRoutesSection} />
        <FaqSection faqSection={copy.faqSection} />
        <HomeFooterCta footerCta={copy.footerCta} />
      </div>
    </>
  );
}

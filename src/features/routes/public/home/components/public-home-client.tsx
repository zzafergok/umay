'use client';

import { HomeHero } from './home-hero';
import { LifecycleCtaCard } from './lifecycle-cta-card';
import { FeatureInfoCards } from './feature-info-cards';
import { QuickRoutesSection } from './quick-routes-section';
import type { PublicHomeCopy } from '../types';

export function PublicHomeClient({ copy }: { copy: PublicHomeCopy }) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-12 px-4 py-8 sm:space-y-16 sm:px-6 lg:px-8">
      {/* 1. Hero Section with Top Badges & Title */}
      <HomeHero badges={copy.badges} hero={copy.hero} />

      {/* 2. Lifecycle Parts Spotlight Callout */}
      <LifecycleCtaCard lifecycleCallout={copy.lifecycleCallout} />

      {/* 3. 6-Card Architectural Feature Grid */}
      <FeatureInfoCards featuresSection={copy.featuresSection} />

      {/* 4. Quick Shell and Route Access Grid */}
      <QuickRoutesSection quickRoutesSection={copy.quickRoutesSection} />
    </div>
  );
}

'use client';

import { HomeHero } from './home-hero';
import { HowItWorksSection } from './how-it-works-section';
import { LifecycleCtaCard } from './lifecycle-cta-card';
import { FeatureInfoCards } from './feature-info-cards';
import { QuickRoutesSection } from './quick-routes-section';
import { FaqSection } from './faq-section';
import { HomeFooterCta } from './home-footer-cta';
import type { PublicHomeCopy } from '../types';

export function PublicHomeClient({ copy }: { copy: PublicHomeCopy }) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-14 px-4 py-6 sm:space-y-20 sm:px-6 sm:py-10 lg:px-8">
      {/* 1. Split Hero + Interactive Live Ledger Preview */}
      <HomeHero
        badges={copy.badges}
        hero={copy.hero}
        heroPreview={copy.heroPreview}
      />

      {/* 2. 3-Step How It Works */}
      <HowItWorksSection howItWorksSection={copy.howItWorksSection} />

      {/* 3. Lifecycle Parts Spotlight + Interactive Demo */}
      <LifecycleCtaCard lifecycleCallout={copy.lifecycleCallout} />

      {/* 4. 6-Card Architectural Feature Grid */}
      <FeatureInfoCards featuresSection={copy.featuresSection} />

      {/* 5. Quick App Surfaces */}
      <QuickRoutesSection quickRoutesSection={copy.quickRoutesSection} />

      {/* 6. FAQ Accordion */}
      <FaqSection faqSection={copy.faqSection} />

      {/* 7. Final CTA & Footer */}
      <HomeFooterCta footerCta={copy.footerCta} />
    </div>
  );
}

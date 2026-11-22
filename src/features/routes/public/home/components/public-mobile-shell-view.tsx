'use client';

import type { MouseEvent } from 'react';
import { ArrowRight, CheckCircle2, LayoutGrid } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Card, CardContent } from '@/components/core/card';
import { Link } from '@/components/core/link';
import { UmayMark } from '@/components/shared/umay-brand';
import {
  getPublicMobileTabHref,
  isPlainTabLinkClick,
  resolvePublicMobileTabFromHash,
} from '@/features/routes/public/home/mobile-tab-routing';
import type {
  PublicHomeCopy,
  PublicMobileTabKey,
} from '@/features/routes/public/home/types';
import { FaqSection } from './faq-section';
import { FeatureInfoCards } from './feature-info-cards';
import { GoogleSignInButton } from './google-signin-button';
import { HeroLivePreview } from './hero-live-preview';
import { HomeFooterCta } from './home-footer-cta';
import { HowItWorksSection } from './how-it-works-section';
import { LifecycleCtaCard } from './lifecycle-cta-card';
import { PublicMobileDock } from './public-mobile-dock';
import { QuickRoutesSection } from './quick-routes-section';

interface PublicMobileShellViewProps {
  copy: PublicHomeCopy;
  activeTab: PublicMobileTabKey;
  onSelectTab: (tab: PublicMobileTabKey) => void;
}

export function PublicMobileShellView({
  copy,
  activeTab,
  onSelectTab,
}: PublicMobileShellViewProps) {
  const handleSelect = (tab: PublicMobileTabKey) => {
    onSelectTab(tab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTabLinkClick = (
    event: MouseEvent<HTMLElement>,
    tab: PublicMobileTabKey,
  ) => {
    if (!isPlainTabLinkClick(event)) return;
    event.preventDefault();
    handleSelect(tab);
  };

  const handleAnchorNav = (href: string) => {
    handleSelect(resolvePublicMobileTabFromHash(href) ?? 'start');
  };

  return (
    <div className="lg:hidden">
      <div className="mx-auto w-full max-w-2xl space-y-6 px-4 pb-28 pt-4 sm:px-6 sm:pt-6">
        {activeTab === 'start' && (
          <div className="space-y-6">
            <Card className="border-border bg-surface">
              <CardContent className="space-y-4 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-sunken">
                      <UmayMark className="h-5 w-5" />
                    </span>
                    <Badge variant="outline">{copy.hero.badge}</Badge>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {copy.mobileShell.screensCountLabel}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold leading-tight tracking-tight text-text">
                    {copy.hero.title}
                  </h1>
                  <p className="text-sm leading-relaxed text-text-muted">
                    {copy.hero.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <GoogleSignInButton
                    label={copy.hero.loginAction}
                    size="lg"
                    className="w-full"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={getPublicMobileTabHref('preview')}
                      prefetch={false}
                      variant="secondary"
                      size="sm"
                      onClick={(event) => handleTabLinkClick(event, 'preview')}
                      className="h-9 justify-between px-3 text-xs"
                    >
                      <span className="truncate">
                        {copy.mobileShell.openPreviewCta}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                    <Link
                      href={getPublicMobileTabHref('screens')}
                      prefetch={false}
                      variant="secondary"
                      size="sm"
                      onClick={(event) => handleTabLinkClick(event, 'screens')}
                      className="h-9 justify-between px-3 text-xs"
                    >
                      <span className="truncate">
                        {copy.mobileShell.openScreensCta}
                      </span>
                      <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                  </div>
                </div>

                <ul className="space-y-1.5 border-t border-border pt-3">
                  {copy.hero.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-text-muted"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <HowItWorksSection howItWorks={copy.howItWorks} />
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-5">
            <HeroLivePreview preview={copy.heroPreview} />
            <LifecycleCtaCard
              lifecycleCallout={copy.lifecycleCallout}
              loginLabel={copy.hero.loginAction}
              hideSignInCta
            />
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-6">
            <FeatureInfoCards featuresSection={copy.featuresSection} />
            <p className="text-center text-xs text-text-muted">
              {copy.mobileShell.featuresExpandHint}
            </p>
            <HomeFooterCta
              footerCta={copy.footerCta}
              onNavigateTab={handleAnchorNav}
            />
          </div>
        )}

        {activeTab === 'screens' && (
          <div className="space-y-6">
            <QuickRoutesSection
              quickRoutesSection={copy.quickRoutesSection}
              onRequireSignIn={() => handleSelect('start')}
            />
            <FaqSection faqSection={copy.faqSection} />
            <HomeFooterCta
              footerCta={copy.footerCta}
              onNavigateTab={handleAnchorNav}
            />
          </div>
        )}
      </div>

      <PublicMobileDock
        activeTab={activeTab}
        mobileShell={copy.mobileShell}
        onSelectTab={handleSelect}
      />
    </div>
  );
}

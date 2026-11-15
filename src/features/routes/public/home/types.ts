export interface FeatureCardItem {
  icon: 'layers' | 'palette' | 'layout' | 'shield' | 'globe' | 'check';
  badge: string;
  title: string;
  description: string;
  points: string[];
}

export interface QuickRouteItem {
  href: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: 'globe' | 'sparkles' | 'user' | 'shield' | 'lock';
}

export interface HeroPreviewItem {
  id: string;
  name: string;
  location: string;
  quantity: number;
  unit: string;
  statusTone?: 'due_soon' | 'low_stock' | 'overdue';
  statusLabel?: string;
}

export interface HeroPreviewTab {
  id: 'today' | 'pantry' | 'parts';
  label: string;
  items: HeroPreviewItem[];
}

export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
  meta: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface PublicHomeCopy {
  badges: string[];
  hero: {
    title: string;
    description: string;
    loginAction: string;
    adminAction: string;
    highlights: Array<{ label: string; value: string }>;
  };
  heroPreview: {
    title: string;
    subtitle: string;
    liveLabel: string;
    tabs: HeroPreviewTab[];
    footerNote: string;
  };
  howItWorksSection: {
    badge: string;
    title: string;
    description: string;
    steps: HowItWorksStep[];
  };
  lifecycleCallout: {
    badge: string;
    title: string;
    description: string;
    features: string[];
    action: string;
    demoPart: {
      name: string;
      appliance: string;
      statusLabel: string;
      remainingPercent: number;
      daysRemaining: number;
      metaLabel: string;
      spareLabel: string;
      spareCount: number;
      replaceAction: string;
      replacedNote: string;
    };
  };
  featuresSection: {
    badge: string;
    title: string;
    description: string;
    cards: FeatureCardItem[];
  };
  quickRoutesSection: {
    badge: string;
    title: string;
    description: string;
    routes: QuickRouteItem[];
  };
  faqSection: {
    badge: string;
    title: string;
    description: string;
    items: FaqItem[];
  };
  footerCta: {
    badge: string;
    title: string;
    description: string;
    loginAction: string;
    adminAction: string;
    copyright: string;
    anchors: Array<{ href: string; label: string }>;
  };
}

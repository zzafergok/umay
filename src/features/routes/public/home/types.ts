export interface HeroAttentionPreviewRow {
  id: string;
  kind: 'part' | 'item';
  title: string;
  subtitle: string;
  status: 'overdue' | 'due_soon' | 'low_stock';
  statusLabel: string;
}

export interface HeroItemPreviewRow {
  id: string;
  name: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  brand: string;
  locationPath: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  targetQuantity: number;
  expiresInDays?: number;
  customFields: Array<{ label: string; value: string }>;
  statusGoodLabel: string;
  statusLowLabel: string;
  statusOutLabel: string;
}

export interface HeroReceiptLineItem {
  id: string;
  name: string;
  quantityText: string;
}

export interface HeroShoppingRow {
  id: string;
  title: string;
  source: 'auto_low_stock' | 'auto_part_due' | 'ai_receipt';
  sourceLabel: string;
  checked: boolean;
}

export interface HeroPreviewData {
  badge: string;
  title: string;
  description: string;
  routeNote: string;
  tabs: {
    home: string;
    items: string;
    shopping: string;
  };
  homeView: {
    statsLabels: {
      totalItems: string;
      lowStock: string;
      dueParts: string;
      openShopping: string;
    };
    attentionTitle: string;
    duePartsBaseCount: number;
    duePartRow: HeroAttentionPreviewRow;
    itemLowFallbackSubtitle: string;
    itemOkBanner: string;
  };
  itemsView: {
    componentRef: string;
    minPrefix: string;
    targetPrefix: string;
    expiryPrefix: string;
    expiryDaysUnit: string;
    detailLabel: string;
    editLabel: string;
    lowStockHint: string;
    rows: HeroItemPreviewRow[];
  };
  shoppingView: {
    receiptCardTitle: string;
    receiptCardBadge: string;
    receiptFileName: string;
    receiptSummary: string;
    receiptAddAction: string;
    receiptAddedAction: string;
    receiptLines: HeroReceiptLineItem[];
    smartSuggestionsTitle: string;
    lowStockSuggestionReason: string;
    duePartSuggestionTitle: string;
    duePartSuggestionReason: string;
    listTitle: string;
    pendingBadge: string;
    boughtBadge: string;
    initialRows: HeroShoppingRow[];
  };
}

export interface HowItWorksStep {
  stepNumber: string;
  title: string;
  description: string;
  moduleTag: string;
}

export type FeatureIconKey =
  'sparkles' | 'wrench' | 'receipt' | 'tags' | 'scan' | 'sliders';

export interface FeatureInfoCardItem {
  id: string;
  title: string;
  description: string;
  badge?: string;
  icon: FeatureIconKey;
  categoryToken: 1 | 2 | 3 | 4 | 5 | 6;
  highlights: string[];
}

export type QuickRouteIconKey =
  | 'dashboard'
  | 'package'
  | 'wrench'
  | 'shopping'
  | 'mapPin'
  | 'tags'
  | 'scan'
  | 'history';

export interface QuickRouteItem {
  id: string;
  title: string;
  description: string;
  icon: QuickRouteIconKey;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export type PublicMobileTabKey = 'start' | 'preview' | 'features' | 'screens';

export interface PublicHomeCopy {
  hero: {
    badge: string;
    title: string;
    description: string;
    loginAction: string;
    exploreAction: string;
    highlights: string[];
  };
  heroPreview: HeroPreviewData;
  howItWorks: {
    badge: string;
    title: string;
    description: string;
    steps: HowItWorksStep[];
  };
  lifecycleCallout: {
    badge: string;
    title: string;
    description: string;
    samplePartName: string;
    sampleParentItem: string;
    spareStockNote: string;
    replaceHint: string;
    dueStatus: string;
    replacedStatus: string;
    remainingDaysLabel: string;
    remainingDueText: string;
    remainingReplacedText: string;
    percentDue: number;
    percentReplaced: number;
    replaceDemoAction: string;
    resetDemoAction: string;
  };
  featuresSection: {
    badge: string;
    title: string;
    description: string;
    cards: FeatureInfoCardItem[];
  };
  quickRoutesSection: {
    badge: string;
    title: string;
    description: string;
    authRequiredBadge: string;
    openAction: string;
    routes: QuickRouteItem[];
  };
  faqSection: {
    badge: string;
    title: string;
    description: string;
    items: FaqItem[];
  };
  footerCta: {
    navLinks: Array<{ label: string; href: string }>;
  };
  mobileShell: {
    navAriaLabel: string;
    tabs: {
      start: string;
      preview: string;
      features: string;
      screens: string;
    };
    openPreviewCta: string;
    openScreensCta: string;
    screensCountLabel: string;
    featuresExpandHint: string;
  };
}

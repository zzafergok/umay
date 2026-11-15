import type { OpenRouterModelsQueryParams } from '@/lib/ai/openrouter';
import type {
  ReceiptAnalysisResult,
  ReceiptLineItem,
} from '@/lib/ai/receipt-analyzer';

export interface ReceiptAssistantProps {
  onApplyItems?: (
    items: ReceiptLineItem[],
    analysis: ReceiptAnalysisResult,
  ) => void | Promise<void>;
  onAnalyzed?: (analysis: ReceiptAnalysisResult) => void;
  applyLabel?: string;
  title?: string;
  description?: string;
  defaultExpanded?: boolean;
  modelQuery?: OpenRouterModelsQueryParams;
  defaultFreeOnly?: boolean;
}

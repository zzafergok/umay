import type { OpenRouterChatCompletionResponse } from '@/lib/ai/openrouter';
import { isRecord } from './normalizers';

export interface ExtractedOpenRouterChoice {
  contentText: string;
  reasoning: string | null;
  refusal: string | null;
  finishReason: string | null;
  nativeFinishReason: string | null;
}

function extractTextFromContent(content: unknown): string {
  if (typeof content === 'string') {
    return content.trim();
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (isRecord(part) && typeof part.text === 'string') {
          return part.text;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n')
      .trim();
  }
  return '';
}

function extractReasoningText(message: Record<string, unknown>): string | null {
  if (typeof message.reasoning === 'string' && message.reasoning.trim()) {
    return message.reasoning.trim();
  }
  if (Array.isArray(message.reasoning_details)) {
    const joined = message.reasoning_details
      .map((entry) =>
        isRecord(entry) && typeof entry.text === 'string'
          ? entry.text.trim()
          : '',
      )
      .filter(Boolean)
      .join('\n');
    return joined || null;
  }
  return null;
}

export function extractFirstChoicePayload(
  response: OpenRouterChatCompletionResponse,
): ExtractedOpenRouterChoice {
  const firstChoice = response.choices?.[0];
  const rawMessage: unknown = firstChoice?.message;
  const message = isRecord(rawMessage) ? rawMessage : undefined;

  const contentText = message ? extractTextFromContent(message.content) : '';
  const reasoning = message ? extractReasoningText(message) : null;
  const refusal =
    message && typeof message.refusal === 'string' && message.refusal.trim()
      ? message.refusal.trim()
      : null;

  return {
    contentText,
    reasoning,
    refusal,
    finishReason: firstChoice?.finish_reason ?? null,
    nativeFinishReason: firstChoice?.native_finish_reason ?? null,
  };
}

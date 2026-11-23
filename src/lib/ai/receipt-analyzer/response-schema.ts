import type { OpenRouterResponseFormat } from '@/lib/ai/openrouter';

/**
 * Fiş analizi için OpenRouter `structured_outputs` (`json_schema`) yanıt formatı.
 * Alan sırası ve zorunlu tipler `RECEIPT_SYSTEM_PROMPT` ile birebir uyumludur.
 */
export const RECEIPT_JSON_RESPONSE_FORMAT: OpenRouterResponseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'receipt_analysis',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: [
        'merchantName',
        'date',
        'time',
        'currency',
        'subtotal',
        'taxTotal',
        'grandTotal',
        'items',
        'rawText',
      ],
      properties: {
        merchantName: { type: ['string', 'null'] },
        date: { type: ['string', 'null'] },
        time: { type: ['string', 'null'] },
        currency: { type: 'string' },
        subtotal: { type: ['number', 'null'] },
        taxTotal: { type: ['number', 'null'] },
        grandTotal: { type: ['number', 'null'] },
        items: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: [
              'name',
              'quantity',
              'unit',
              'unitPrice',
              'totalPrice',
              'vatRate',
            ],
            properties: {
              name: { type: 'string' },
              quantity: { type: 'number' },
              unit: { type: 'string' },
              unitPrice: { type: ['number', 'null'] },
              totalPrice: { type: ['number', 'null'] },
              vatRate: { type: ['number', 'null'] },
            },
          },
        },
        rawText: { type: 'string' },
      },
    },
  },
};

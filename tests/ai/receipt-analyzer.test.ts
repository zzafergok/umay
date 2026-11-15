import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetOpenRouterModelsCache } from '@/lib/ai/openrouter';
import {
  analyzeReceiptImage,
  parseReceiptModelResponse,
} from '@/lib/ai/receipt-analyzer';

const originalEnv = process.env;
const SAMPLE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('Receipt analyzer & resilient response handling', () => {
  beforeEach(() => {
    process.env = { ...originalEnv, OPENROUTER_API_KEY: 'sk-or-test-key' };
    resetOpenRouterModelsCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('accepts snake_case, alternative keys, and numeric confidence without rejecting items', () => {
    const output = JSON.stringify({
      receipt: {
        raw_text: 'BİM MARKET\nYOĞURT 65,50',
        store_name: 'BİM',
        currency: '₺',
        grand_total: '65,50',
        confidence: 0.92,
        line_items: [
          {
            product_name: 'YOGURT 1KG',
            normalized_name: 'Yoğurt 1kg',
            qty: '2',
            unit_price: '32,75',
            total_price: '65,50',
            vat_rate: 150,
          },
        ],
      },
    });

    const parsed = parseReceiptModelResponse(output);
    expect(parsed.parsedFromJson).toBe(true);
    expect(parsed.data.merchantName).toBe('BİM');
    expect(parsed.data.currency).toBe('TRY');
    expect(parsed.data.confidence).toBe('high');
    expect(parsed.data.grandTotal).toBe(65.5);
    expect(parsed.data.items).toHaveLength(1);
    expect(parsed.data.items[0]?.vatRate).toBeNull();
  });

  it('caps OpenRouter models array at 3 per request and preserves raw completion fields', async () => {
    const modelsPayload = {
      data: [1, 2, 3, 4, 5].map((i) => ({
        id: `vendor/vision-${i}:free`,
        name: `Vendor Vision ${i}`,
        context_length: 128000,
        architecture: {
          input_modalities: ['text', 'image'],
          output_modalities: ['text'],
        },
        pricing: { prompt: '0', completion: '0' },
        supported_parameters: ['response_format'],
      })),
    };

    const completionPayload = {
      id: 'gen-abc',
      object: 'chat.completion',
      created: 1794712052,
      model: 'vendor/vision-1:free',
      provider: 'Ant Digital',
      choices: [
        {
          index: 0,
          finish_reason: 'stop',
          native_finish_reason: 'stop',
          message: {
            role: 'assistant',
            content: '```json\n{"rawText": "TEST FİŞ", "items": []}\n```\nEk bilgi.',
            reasoning: 'Reasoning trace from OpenRouter',
            refusal: null,
          },
        },
      ],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 20,
        total_tokens: 70,
        cost: 0,
      },
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(modelsPayload), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(completionPayload), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    vi.stubGlobal('fetch', fetchMock);

    const result = await analyzeReceiptImage({ imageDataUrl: SAMPLE_DATA_URL });

    const [, completionInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    const sentBody = JSON.parse(String(completionInit.body)) as {
      models?: string[];
    };

    expect(sentBody.models?.length).toBeLessThanOrEqual(3);
    expect(result.completionId).toBe('gen-abc');
    expect(result.provider).toBe('Ant Digital');
    expect(result.reasoning).toBe('Reasoning trace from OpenRouter');
    expect(result.finishReason).toBe('stop');
    expect(result.rawResponse).toMatchObject({ id: 'gen-abc' });
  });

  it('falls back to reasoning when content is empty and retries across model batches', async () => {
    const modelsPayload = {
      data: [1, 2, 3, 4].map((i) => ({
        id: `vendor/vision-${i}:free`,
        name: `Vendor Vision ${i}`,
        context_length: 128000,
        architecture: {
          input_modalities: ['text', 'image'],
          output_modalities: ['text'],
        },
        pricing: { prompt: '0', completion: '0' },
        supported_parameters: [],
      })),
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(modelsPayload), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { code: 429, message: 'Rate limit' } }),
          { status: 429, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'gen-fallback',
            object: 'chat.completion',
            created: 1794712099,
            model: 'vendor/vision-4:free',
            choices: [
              {
                index: 0,
                finish_reason: 'length',
                message: {
                  role: 'assistant',
                  content: null,
                  reasoning: '{"rawText":"EKMEK 15 TL","items":[{"name":"EKMEK","totalPrice":15}]}',
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );

    vi.stubGlobal('fetch', fetchMock);

    const result = await analyzeReceiptImage({ imageDataUrl: SAMPLE_DATA_URL });
    expect(result.modelUsed).toBe('vendor/vision-4:free');
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe('EKMEK');
    expect(result.finishReason).toBe('length');
  });
});

describe('Receipt response parser', () => {
  it('parses fenced JSON and normalizes Turkish decimal numbers', () => {
    const modelOutput = `\`\`\`json
{
  "rawText": "MİGROS TİCARET A.Ş.\\nSÜT 1L 49,90\\nTOPLAM 49,90",
  "merchantName": "Migros",
  "date": "2026-11-15",
  "currency": "TRY",
  "grandTotal": "49,90",
  "items": [
    {
      "name": "SÜT 1L",
      "normalizedName": "Süt 1L",
      "quantity": 1,
      "unit": "adet",
      "totalPrice": "49,90",
      "categoryHint": "Gıda"
    }
  ],
  "confidence": "high"
}
\`\`\``;

    const result = parseReceiptModelResponse(modelOutput);
    expect(result.parsedFromJson).toBe(true);
    expect(result.data.merchantName).toBe('Migros');
    expect(result.data.grandTotal).toBe(49.9);
    expect(result.data.items).toHaveLength(1);
    expect(result.data.items[0]?.totalPrice).toBe(49.9);
    expect(result.data.rawText).toContain('MİGROS');
  });

  it('falls back cleanly to rawText when model returns plain text', () => {
    const result = parseReceiptModelResponse('MARKET FİŞİ\nEKMEK 15 TL');
    expect(result.parsedFromJson).toBe(false);
    expect(result.data.confidence).toBe('low');
    expect(result.data.rawText).toBe('MARKET FİŞİ\nEKMEK 15 TL');
    expect(result.data.items).toEqual([]);
  });
});

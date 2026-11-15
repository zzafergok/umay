import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createOpenRouterChatCompletion,
  FALLBACK_FREE_VISION_MODELS,
  getFreeVisionModels,
  isFreeVisionTextModel,
  OpenRouterApiError,
  resetOpenRouterModelsCache,
  resolveDefaultVisionModel,
  type OpenRouterModel,
} from '@/lib/ai/openrouter';
import { parseReceiptModelResponse } from '@/lib/ai/receipt-analyzer';

const originalEnv = process.env;

describe('OpenRouter free vision model filtering', () => {
  it('accepts free vision+text models and rejects paid or text-only models', () => {
    const freeVision: OpenRouterModel = {
      id: 'nvidia/nemotron-3.5-super-vl:free',
      name: 'NVIDIA: Nemotron 3.5 Super VL (free)',
      context_length: 1000000,
      architecture: {
        modality: 'text+image->text',
        input_modalities: ['text', 'image'],
        output_modalities: ['text'],
      },
      pricing: { prompt: '0', completion: '0' },
    };

    const paidVision: OpenRouterModel = {
      ...freeVision,
      id: 'google/gemini-4-hydrogen',
      pricing: { prompt: '0.0000015', completion: '0.0000075' },
    };

    const freeTextOnly: OpenRouterModel = {
      ...freeVision,
      id: 'example/text-only:free',
      architecture: {
        modality: 'text->text',
        input_modalities: ['text'],
        output_modalities: ['text'],
      },
    };

    expect(isFreeVisionTextModel(freeVision)).toBe(true);
    expect(isFreeVisionTextModel(paidVision)).toBe(false);
    expect(isFreeVisionTextModel(freeTextOnly)).toBe(false);
  });

  it('fetches dynamic live vision models and falls back to static list on error', async () => {
    resetOpenRouterModelsCache();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: [
              {
                id: 'vendor/new-dynamic-vision:free',
                name: 'Vendor: New Dynamic Vision (free)',
                context_length: 128000,
                architecture: {
                  input_modalities: ['text', 'image'],
                  output_modalities: ['text'],
                },
                pricing: { prompt: '0', completion: '0' },
                supported_parameters: ['structured_outputs', 'response_format'],
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );

    const live = await getFreeVisionModels(true);
    expect(live.source).toBe('live');
    expect(live.models[0]?.id).toBe('vendor/new-dynamic-vision:free');
    expect(resolveDefaultVisionModel(live.models)).toBe(
      'vendor/new-dynamic-vision:free',
    );

    resetOpenRouterModelsCache();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network unavailable')),
    );

    const fallback = await getFreeVisionModels(true);
    expect(fallback.source).toBe('fallback');
    expect(fallback.models).toEqual(FALLBACK_FREE_VISION_MODELS);
  });
});

describe('OpenRouter chat completions client', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('throws OpenRouterApiError when OPENROUTER_API_KEY is missing', async () => {
    delete process.env.OPENROUTER_API_KEY;

    await expect(
      createOpenRouterChatCompletion({
        model: 'nvidia/nemotron-3.5-super-vl:free',
        messages: [{ role: 'user', content: 'Merhaba' }],
      }),
    ).rejects.toMatchObject({
      name: 'OpenRouterApiError',
      status: 503,
      code: 'missing_api_key',
    });
  });

  it('detects OpenRouter error payload even on HTTP 200 OK', async () => {
    process.env.OPENROUTER_API_KEY = 'sk-or-test-key';

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: 429,
              message: 'Rate limit exceeded',
              metadata: { provider_name: 'DeepInfra' },
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );

    await expect(
      createOpenRouterChatCompletion({
        model: 'nvidia/nemotron-3.5-super-vl:free',
        messages: [{ role: 'user', content: 'Test' }],
      }),
    ).rejects.toBeInstanceOf(OpenRouterApiError);
  });

  it('sends OpenRouter headers and returns typed completion response', async () => {
    process.env.OPENROUTER_API_KEY = 'sk-or-test-key';
    process.env.OPENROUTER_APP_NAME = 'Umay Test';
    process.env.OPENROUTER_SITE_URL = 'https://umay.example.com';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'gen-123',
          object: 'chat.completion',
          created: 1794591958,
          model: 'nvidia/nemotron-3.5-super-vl:free',
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: '{"ok":true}' },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await createOpenRouterChatCompletion({
      model: 'nvidia/nemotron-3.5-super-vl:free',
      messages: [{ role: 'user', content: 'Test' }],
    });

    expect(res.id).toBe('gen-123');
    expect(res.choices[0]?.message.content).toBe('{"ok":true}');

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer sk-or-test-key');
    expect(headers['X-OpenRouter-Title']).toBe('Umay Test');
    expect(headers['HTTP-Referer']).toBe('https://umay.example.com');
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

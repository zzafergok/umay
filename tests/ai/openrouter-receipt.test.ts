import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createOpenRouterChatCompletion,
  fetchOpenRouterModels,
  OpenRouterApiError,
  resetOpenRouterModelsCache,
  type OpenRouterModel,
} from '@/lib/ai/openrouter';
import {
  filterAndSortReceiptModels,
  isFreeOpenRouterModel,
  isVisionTextModel,
  pickDefaultReceiptModelId,
} from '@/lib/ai/receipt-analyzer';

const originalEnv = process.env;

describe('OpenRouter raw models client & app-level catalog filtering', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    resetOpenRouterModelsCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('passes through the raw OpenRouter /models response without filtering or stripping fields', async () => {
    process.env.OPENROUTER_API_KEY = 'sk-or-test-key';
    const rawPayload = {
      data: [
        {
          id: 'inclusionai/ling-3.2-flash:free',
          name: 'inclusionAI: Ling 3.2 Flash (free)',
          context_length: 1048576,
          architecture: {
            input_modalities: ['text', 'image'],
            output_modalities: ['text'],
          },
          pricing: { prompt: '0', completion: '0' },
          endpoints: ['/api/v1/chat/completions'],
          supported_parameters: ['structured_outputs', 'response_format'],
          benchmarks: { artificial_analysis: { intelligence_index: 50 } },
        },
        {
          id: 'google/gemini-4-hydrogen:batch',
          name: 'Google: Gemini 4 Hydrogen (batch)',
          context_length: 1048576,
          architecture: {
            input_modalities: ['text', 'image'],
            output_modalities: ['text'],
          },
          pricing: { prompt: '0.00000075', completion: '0.00000375' },
          endpoints: ['/api/v1/batches'],
        },
      ],
      total_count: 470,
      links: { next: null },
    };

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(rawPayload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = await fetchOpenRouterModels({ forceRefresh: true });
    expect(response).toEqual(rawPayload);
    expect(response.total_count).toBe(470);
    expect(response.data).toHaveLength(2);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://openrouter.ai/api/v1/models');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer sk-or-test-key',
    );
  });

  it('filters vision+chat+free models in app catalog layer while preserving full model objects', () => {
    const freeVisionChat: OpenRouterModel = {
      id: 'nvidia/nemotron-3.5-super-vl:free',
      name: 'NVIDIA: Nemotron 3.5 Super VL (free)',
      context_length: 1000000,
      architecture: {
        modality: 'text+image->text',
        input_modalities: ['text', 'image'],
        output_modalities: ['text'],
      },
      pricing: { prompt: '0', completion: '0' },
      endpoints: ['/api/v1/chat/completions'],
      supported_parameters: ['structured_outputs', 'response_format'],
    };

    const paidBatchOnly: OpenRouterModel = {
      ...freeVisionChat,
      id: 'google/gemini-4-hydrogen:batch',
      pricing: { prompt: '0.0000015', completion: '0.0000075' },
      endpoints: ['/api/v1/batches'],
    };

    const freeTextOnly: OpenRouterModel = {
      ...freeVisionChat,
      id: 'baidu/ernie-5.5-flash-preview:free',
      architecture: {
        modality: 'text->text',
        input_modalities: ['text'],
        output_modalities: ['text'],
      },
    };

    expect(isVisionTextModel(freeVisionChat)).toBe(true);
    expect(isFreeOpenRouterModel(freeVisionChat)).toBe(true);
    expect(isVisionTextModel(paidBatchOnly)).toBe(false);
    expect(isVisionTextModel(freeTextOnly)).toBe(false);

    const catalog = filterAndSortReceiptModels(
      [freeVisionChat, paidBatchOnly, freeTextOnly],
      { freeOnly: true },
    );
    expect(catalog).toEqual([freeVisionChat]);
    expect(pickDefaultReceiptModelId(catalog)).toBe(
      'nvidia/nemotron-3.5-super-vl:free',
    );
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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchOpenRouterModelBySlug,
  fetchOpenRouterModels,
  fetchOpenRouterModelsCount,
  fetchOpenRouterUserModels,
  OpenRouterApiError,
  parseOpenRouterModelsQuery,
  parseOpenRouterUserModelsQuery,
  resetOpenRouterModelsCache,
  type OpenRouterModel,
} from '@/lib/ai/openrouter';
import {
  formatModelPricingLabel,
  isFreeOpenRouterModel,
} from '@/lib/ai/receipt-analyzer';

const originalEnv = process.env;

describe('OpenRouter OpenAPI endpoints & query parsing', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    resetOpenRouterModelsCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('forwards OpenAPI /models query params cleanly and caches by query', async () => {
    const fetchMock = vi.fn().mockImplementation(async () =>
      new Response(
        JSON.stringify({
          data: [],
          total_count: 0,
          links: { next: null },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await fetchOpenRouterModels({
      query: {
        input_modalities: 'text,image',
        output_modalities: 'text',
        sort: 'newest',
        limit: 100,
      },
    });

    const firstUrl = String(fetchMock.mock.calls[0]?.[0] ?? '');
    expect(firstUrl).toContain('/api/v1/models?');
    expect(firstUrl).toContain('input_modalities=text%2Cimage');
    expect(firstUrl).toContain('output_modalities=text');
    expect(firstUrl).toContain('sort=newest');
    expect(firstUrl).toContain('limit=100');

    // Same query hits cache
    await fetchOpenRouterModels({
      query: {
        input_modalities: 'text,image',
        output_modalities: 'text',
        sort: 'newest',
        limit: 100,
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Different query issues a fresh request
    await fetchOpenRouterModels({ query: { q: 'gemma' } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('fetches /model/{author}/{slug} preserving :free suffix and resolves alias data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: 'openai/gpt-4',
            canonical_slug: 'openai/gpt-4',
            name: 'GPT-4',
            context_length: 8192,
            pricing: { prompt: '0.00003', completion: '0.00006' },
            endpoints: ['/api/v1/chat/completions'],
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await fetchOpenRouterModelBySlug('openai', 'gpt-4:free');
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      'https://openrouter.ai/api/v1/model/openai/gpt-4:free',
    );
    expect(res.data.id).toBe('openai/gpt-4');
  });

  it('fetches /models/count with optional output_modalities', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { count: 435 } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await fetchOpenRouterModelsCount({ outputModalities: 'all' });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      'https://openrouter.ai/api/v1/models/count?output_modalities=all',
    );
    expect(res.data.count).toBe(435);
  });

  it('requires API key for /models/user and forwards client/sort query when configured', async () => {
    delete process.env.OPENROUTER_API_KEY;
    await expect(fetchOpenRouterUserModels()).rejects.toThrow(OpenRouterApiError);

    process.env.OPENROUTER_API_KEY = 'sk-or-user-test';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ data: [], total_count: 0, links: { next: null } }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await fetchOpenRouterUserModels({
      query: { client: 'codex', sort: 'most-popular', limit: 50 },
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/models/user?');
    expect(url).toContain('client=codex');
    expect(url).toContain('sort=most-popular');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer sk-or-user-test',
    );
  });

  it('parses URLSearchParams safely and applies PublicPricing.discount', () => {
    const modelsQuery = parseOpenRouterModelsQuery(
      new URLSearchParams('limit=2500&input_modalities=text,image&q=flash&ignored=1'),
    );
    expect(modelsQuery).toEqual({
      limit: 1000,
      input_modalities: 'text,image',
      q: 'flash',
    });

    const userQuery = parseOpenRouterUserModelsQuery(
      new URLSearchParams('offset=-5&limit=20&client=claude_code'),
    );
    expect(userQuery).toEqual({
      offset: 0,
      limit: 20,
      client: 'claude_code',
    });

    const discountedModel: OpenRouterModel = {
      id: 'vendor/discounted:free',
      name: 'Discounted Free',
      context_length: 128000,
      pricing: { prompt: '0.000001', completion: '0.000002', discount: 1 },
    };
    expect(isFreeOpenRouterModel(discountedModel)).toBe(true);
    expect(formatModelPricingLabel(discountedModel.pricing)).toBe('Ücretsiz');

    expect(
      formatModelPricingLabel({
        prompt: '0.000002',
        completion: '0.000004',
        discount: 0.5,
      }),
    ).toBe('$1.00 / $2.00 per 1M');
  });

  it('fetches full list across links.next when limit and offset are omitted', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [{ id: 'a/model-1', name: 'M1', context_length: 1000, pricing: { prompt: '0', completion: '0' } }],
            total_count: 2,
            links: { next: '/api/v1/models?offset=1&limit=1' },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [{ id: 'openrouter/free', name: 'Free Router', context_length: 200000, pricing: { prompt: '0', completion: '0' } }],
            total_count: 2,
            links: { next: null },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    const res = await fetchOpenRouterModels({ forceRefresh: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(res.data).toHaveLength(2);
    expect(res.data.some((m) => isFreeOpenRouterModel(m))).toBe(true);
    expect(res.data[1]?.id).toBe('openrouter/free');

    const hiddenFeeModel: OpenRouterModel = {
      id: 'vendor/zero-prompt-nonzero-image',
      name: 'Image Paid',
      context_length: 8192,
      pricing: { prompt: '0', completion: '0', image: '0.005' },
    };
    expect(isFreeOpenRouterModel(hiddenFeeModel)).toBe(false);
  });
});

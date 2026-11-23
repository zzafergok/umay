import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  resetOpenRouterModelsCache,
  type OpenRouterModel,
} from '@/lib/ai/openrouter';
import { analyzeReceiptImage } from '@/lib/ai/receipt-analyzer';
import { requestBatchCompletion } from '@/lib/ai/receipt-analyzer/batch-request';

const originalEnv = process.env;
const SAMPLE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const makeCompletion = (model: string) => ({
  id: 'gen-1',
  object: 'chat.completion',
  created: 1794712052,
  model,
  choices: [
    {
      index: 0,
      finish_reason: 'stop',
      message: {
        role: 'assistant',
        content: JSON.stringify({
          date: '2026-11-20',
          time: '12:00',
          currency: 'TRY',
          taxTotal: 1,
          subtotal: 10,
          items: [
            {
              name: 'SÜT 1L',
              quantity: 1,
              unit: 'adet',
              unitPrice: 10,
              totalPrice: 10,
              vatRate: 1,
            },
          ],
          rawText: 'MİGROS 20.11.2026',
        }),
      },
    },
  ],
});

describe('Receipt batch request parameter & reasoning handling', () => {
  beforeEach(() => {
    process.env = { ...originalEnv, OPENROUTER_API_KEY: 'sk-or-test-key' };
    resetOpenRouterModelsCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('omits temperature, sets reasoning effort=none, and uses json_schema for Haiku 5.5', async () => {
    const haikuModel: OpenRouterModel = {
      id: 'anthropic/claude-haiku-5.5',
      name: 'Anthropic: Claude Haiku 5.5',
      context_length: 1_000_000,
      architecture: {
        input_modalities: ['text', 'image', 'file'],
        output_modalities: ['text'],
      },
      pricing: { prompt: '0.0000001', completion: '0.0000005' },
      supported_parameters: [
        'include_reasoning',
        'max_tokens',
        'reasoning',
        'reasoning_effort',
        'response_format',
        'structured_outputs',
      ],
      reasoning: {
        mandatory: false,
        supported_efforts: ['max', 'xhigh', 'high', 'medium', 'low', 'none'],
        default_effort: 'medium',
      },
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [haikuModel] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(makeCompletion(haikuModel.id)), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await analyzeReceiptImage({
      imageDataUrl: SAMPLE_DATA_URL,
      modelId: haikuModel.id,
    });

    const [, completionInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    const body = JSON.parse(String(completionInit.body)) as Record<
      string,
      unknown
    >;

    expect(body.temperature).toBeUndefined();
    expect(body.reasoning).toEqual({ effort: 'none' });
    expect(body.response_format).toMatchObject({ type: 'json_schema' });
  });

  it('picks lowest supported effort for mandatory reasoning models', async () => {
    const mandatoryModel: OpenRouterModel = {
      id: 'openai/gpt-5.4-pro',
      name: 'OpenAI: GPT-5.4 Pro',
      context_length: 1_000_000,
      pricing: { prompt: '0.000001', completion: '0.000005' },
      supported_parameters: ['reasoning', 'response_format'],
      reasoning: {
        mandatory: true,
        supported_efforts: ['xhigh', 'high', 'medium'],
        default_effort: 'medium',
      },
    };

    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify(makeCompletion(mandatoryModel.id)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await requestBatchCompletion(
      [mandatoryModel.id],
      { imageDataUrl: SAMPLE_DATA_URL },
      [SAMPLE_DATA_URL],
      new Map([[mandatoryModel.id, mandatoryModel]]),
    );

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.reasoning).toEqual({ effort: 'medium' });
  });

  it('downgrades json_schema to json_object while preserving reasoning on schema 400 error', async () => {
    const model: OpenRouterModel = {
      id: 'qwen/qwen3.5-flash-02-23',
      name: 'Qwen3.5 Flash',
      context_length: 1_000_000,
      pricing: { prompt: '0.000000065', completion: '0.00000026' },
      supported_parameters: [
        'temperature',
        'reasoning',
        'response_format',
        'structured_outputs',
      ],
      reasoning: { mandatory: false },
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: { code: 400, message: 'json_schema is not supported' },
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(makeCompletion(model.id)), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await requestBatchCompletion(
      [model.id],
      { imageDataUrl: SAMPLE_DATA_URL },
      [SAMPLE_DATA_URL],
      new Map([[model.id, model]]),
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [, retryInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    const retryBody = JSON.parse(String(retryInit.body)) as Record<
      string,
      unknown
    >;
    expect(retryBody.response_format).toEqual({ type: 'json_object' });
    expect(retryBody.reasoning).toEqual({ enabled: false });
  });
});

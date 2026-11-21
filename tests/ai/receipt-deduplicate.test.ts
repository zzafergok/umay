import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetOpenRouterModelsCache } from '@/lib/ai/openrouter';
import {
  analyzeReceiptImage,
  deduplicateRawReceiptText,
  deduplicateReceiptItems,
  parseReceiptModelResponse,
  receiptAnalyzeRequestSchema,
  reconcileConsecutiveRunsWithAraToplam,
  resolveReceiptImages,
  type ReceiptLineItem,
} from '@/lib/ai/receipt-analyzer';

const originalEnv = process.env;
const SAMPLE_DATA_URL_1 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const SAMPLE_DATA_URL_2 =
  'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEElEQVR42mP8z8AARIQBAA4wAgH/5b3wAAAAAElFTkSuQmCC';

const item = (
  name: string,
  totalPrice: number,
  overrides: Partial<ReceiptLineItem> = {},
): ReceiptLineItem => ({
  name,
  normalizedName: '',
  quantity: 1,
  unit: 'adet',
  unitPrice: totalPrice,
  totalPrice,
  categoryHint: 'Gıda',
  vatRate: 1,
  ...overrides,
});

describe('receipt multi-image overlap vs genuine repeated items', () => {
  it('accepts both single imageDataUrl and multiple imageDataUrls', () => {
    const sampleImg1 = 'data:image/jpeg;base64,aGVsbG8=';
    const sampleImg2 = 'data:image/png;base64,d29ybGQ=';
    const parsed = receiptAnalyzeRequestSchema.parse({
      imageDataUrls: [sampleImg1, sampleImg2, sampleImg1],
    });
    expect(resolveReceiptImages(parsed)).toEqual([sampleImg1, sampleImg2]);
  });

  it('skips contiguous overlapping photo blocks while keeping genuine repeated items on the receipt as-is', () => {
    const items: ReceiptLineItem[] = [
      item('ULKER PROBIS SAND 75', 26.25, { normalizedName: 'Ülker Probis 75g' }),
      item('ULKER PROBIS SAND 75', 26.25, { normalizedName: 'Ülker Probis 75g' }),
      item('SÜT 1L Y.YAĞLI', 79.8, { quantity: 2, unitPrice: null, categoryHint: null, vatRate: null }),
      item('PİLAVLIK BULGUR 2.5KG', 95, { normalizedName: 'Pilavlık Bulgur 2.5 Kg', unit: 'paket' }),
      item('SUT 1L Y.YAGLI', 79.8, { normalizedName: 'Yarım Yağlı Süt 1L', quantity: 2, unitPrice: 39.9 }),
      item('PILAVLIK BULGUR 2.5KG', 95, { normalizedName: 'Pilavlık Bulgur 2.5 Kg', unit: 'paket' }),
      item('DOMATES EKO KG', 311.87, { normalizedName: 'Domates Eko Kg', quantity: 2.6, unit: 'kg', unitPrice: 119.95 }),
    ];

    const result = deduplicateReceiptItems(items);
    expect(result.deduplicatedCount).toBe(2);
    expect(result.items).toHaveLength(5);
    expect(result.items[0]?.name).toBe('ULKER PROBIS SAND 75');
    expect(result.items[1]?.name).toBe('ULKER PROBIS SAND 75');
    expect(result.items[2]?.normalizedName).toBe('Yarım Yağlı Süt 1L');
    expect(result.items[2]?.unitPrice).toBe(39.9);
    expect(result.items[3]?.name).toBe('PİLAVLIK BULGUR 2.5KG');
    expect(result.items[4]?.name).toBe('DOMATES EKO KG');
  });

  it('deduplicates only overlapping multi-line OCR blocks in rawText and keeps genuine repeated lines', () => {
    const raw = [
      'YUNUS MARKET',
      'ULKER PROBIS SAND 75 *26,25',
      'ULKER PROBIS SAND 75 *26,25',
      'SÜT 1L Y.YAĞLI   *79,80',
      'PİLAVLIK BULGUR  *95,00',
      'SUT 1L Y.YAGLI   *79,80',
      'PILAVLIK BULGUR  *95,00',
      'TOPLAM           *227,30',
    ].join('\n');

    const cleaned = deduplicateRawReceiptText(raw);
    expect(cleaned.split('\n')).toEqual([
      'YUNUS MARKET',
      'ULKER PROBIS SAND 75 *26,25',
      'ULKER PROBIS SAND 75 *26,25',
      'SÜT 1L Y.YAĞLI   *79,80',
      'PİLAVLIK BULGUR  *95,00',
      'TOPLAM           *227,30',
    ]);
  });

  it('recovers completed line items and totals when a long receipt JSON response is truncated', () => {
    const truncatedJson = `{
      "merchantName": "Yunus Market Pursaklar",
      "date": "2026-11-01",
      "currency": "TRY",
      "grandTotal": 10480.68,
      "items": [
        {"name":"TORKU SÜT Y.YAĞLI","normalizedName":"Torku Yarım Yağlı Süt","quantity":2,"unit":"adet","unitPrice":177.45,"totalPrice":354.90,"categoryHint":"Gıda","vatRate":1},
        {"name":"SENSODYNE D.MAC.CLIN","normalizedName":"Sensodyne Diş Macunu","quantity":1,"unit":"adet","unitPrice":367.40,"totalPrice":367.40,"categoryHint":"Kişisel Bakım","vatRate":10},
        {"name":"YARIM KALAN SATIR","normalizedName":"Yarım`;

    const parsed = parseReceiptModelResponse(truncatedJson);
    expect(parsed.parsedFromJson).toBe(true);
    expect(parsed.data.merchantName).toBe('Yunus Market Pursaklar');
    expect(parsed.data.grandTotal).toBe(10480.68);
    expect(parsed.data.items).toHaveLength(2);
  });
});

describe('multi-image reasoning truncation & preferred model isolation', () => {
  beforeEach(() => {
    process.env = { ...originalEnv, OPENROUTER_API_KEY: 'sk-or-test-key' };
    resetOpenRouterModelsCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('retries next batch when reasoning model exhausts tokens without emitting JSON', async () => {
    const modelsPayload = {
      data: [
        {
          id: 'meta/muse-spark-1.2',
          name: 'Meta Muse Spark 1.2',
          context_length: 128000,
          architecture: { input_modalities: ['text', 'image'], output_modalities: ['text'] },
          pricing: { prompt: '0', completion: '0' },
          supported_parameters: ['temperature', 'reasoning', 'response_format'],
        },
        {
          id: 'google/gemini-flash:free',
          name: 'Gemini Flash Free',
          context_length: 1000000,
          architecture: { input_modalities: ['text', 'image'], output_modalities: ['text'] },
          pricing: { prompt: '0', completion: '0' },
          supported_parameters: ['temperature', 'response_format'],
        },
      ],
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(modelsPayload), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'gen-reasoning-truncated',
            object: 'chat.completion',
            created: 1795284500,
            model: 'meta/muse-spark-1.2',
            choices: [{ index: 0, finish_reason: 'length', message: { role: 'assistant', content: null, reasoning: 'Combining rotated...' } }],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'gen-gemini-ok',
            object: 'chat.completion',
            created: 1795284505,
            model: 'google/gemini-flash:free',
            choices: [
              {
                index: 0,
                finish_reason: 'stop',
                message: {
                  role: 'assistant',
                  content: JSON.stringify({
                    merchantName: 'Yunus Market',
                    grandTotal: 190.68,
                    items: [
                      { name: 'DOMATES EKO KG', quantity: 2.6, unit: 'kg', totalPrice: 311.87 },
                      { name: 'SALATALIK KG', quantity: 0.9, unit: 'kg', totalPrice: 81.67 },
                      { name: 'DOMATES EKO KG', quantity: 2.6, unit: 'kg', totalPrice: 311.87 },
                      { name: 'SALATALIK KG', quantity: 0.9, unit: 'kg', totalPrice: 81.67 },
                    ],
                    rawText: 'YUNUS MARKET',
                  }),
                },
              },
            ],
          }),
          { status: 200 },
        ),
      );

    vi.stubGlobal('fetch', fetchMock);

    const result = await analyzeReceiptImage({
      imageDataUrls: [SAMPLE_DATA_URL_1, SAMPLE_DATA_URL_2],
      modelId: 'meta/muse-spark-1.2',
    });

    expect(result.parsedFromJson).toBe(true);
    expect(result.modelUsed).toBe('google/gemini-flash:free');
    expect(result.imageCount).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.deduplicatedCount).toBe(2);
  });

  it('reconciles a +1 optical illusion in a 3+ consecutive identical item run against ARA TOPLAM', () => {
    const probis = {
      name: 'ULKER PROBIS SAND.75',
      normalizedName: 'Ülker Probis Sandviç 75g',
      quantity: 1,
      unit: 'adet',
      unitPrice: 26.25,
      totalPrice: 26.25,
      categoryHint: 'Gıda',
      vatRate: 1,
    };
    const items = [
      { ...probis, name: 'PATOS PARTI ACI SOSL', unitPrice: 94.5, totalPrice: 94.5 },
      probis,
      probis,
      probis,
      probis,
      probis, // 5 instead of 4 (+26.25 optical illusion)
    ];
    const reconciled = reconcileConsecutiveRunsWithAraToplam(
      items,
      'Yunus Market 01.11.2026 15:15 ARA TOPLAM 199.50 TOPKDV 8.78',
    );
    expect(reconciled).toHaveLength(5);
    const sum = Number(
      reconciled.reduce((acc, item) => acc + (item.totalPrice ?? 0), 0).toFixed(2),
    );
    expect(sum).toBe(199.5);
  });
});

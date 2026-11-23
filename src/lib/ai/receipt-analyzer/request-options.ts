import {
  OpenRouterApiError,
  type OpenRouterModel,
  type OpenRouterReasoningConfig,
  type OpenRouterReasoningEffort,
  type OpenRouterResponseFormat,
} from '@/lib/ai/openrouter';
import {
  supportsJsonObject,
  supportsReasoningOutput,
  supportsStructuredOutputs,
} from './model-catalog';
import { RECEIPT_JSON_RESPONSE_FORMAT } from './response-schema';

const MANDATORY_EFFORT_ORDER: readonly OpenRouterReasoningEffort[] = [
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
  'max',
];

export function supportsTemperature(
  batch: string[],
  modelMap: Map<string, OpenRouterModel>,
): boolean {
  return batch.every((id) => {
    const params = modelMap.get(id)?.supported_parameters;
    return (
      !Array.isArray(params) ||
      params.length === 0 ||
      params.includes('temperature')
    );
  });
}

export function pickLowestMandatoryEffort(
  batch: string[],
  modelMap: Map<string, OpenRouterModel>,
): OpenRouterReasoningEffort {
  const mandatoryLists = batch
    .map((id) => modelMap.get(id)?.reasoning)
    .filter((r): r is NonNullable<OpenRouterModel['reasoning']> =>
      Boolean(r?.mandatory),
    )
    .map((r) => r.supported_efforts)
    .filter(
      (e): e is OpenRouterReasoningEffort[] => Array.isArray(e) && e.length > 0,
    );

  if (mandatoryLists.length === 0) return 'low';
  return (
    MANDATORY_EFFORT_ORDER.find((effort) =>
      mandatoryLists.every((list) => list.includes(effort)),
    ) ??
    mandatoryLists[0]![0] ??
    'low'
  );
}

export function buildReasoningConfig(
  batch: string[],
  modelMap: Map<string, OpenRouterModel>,
  anySupportsReasoning: boolean,
): OpenRouterReasoningConfig | undefined {
  if (!anySupportsReasoning) return undefined;

  const hasMandatory = batch.some(
    (id) =>
      modelMap.get(id)?.reasoning?.mandatory === true ||
      id.startsWith('google/gemini-4'),
  );
  if (hasMandatory) {
    return { effort: pickLowestMandatoryEffort(batch, modelMap) };
  }

  const reasoningModels = batch
    .map((id) => modelMap.get(id))
    .filter((m): m is OpenRouterModel =>
      Boolean(m && supportsReasoningOutput(m)),
    );
  const allSupportNoneEffort =
    reasoningModels.length > 0 &&
    reasoningModels.every((m) =>
      m.reasoning?.supported_efforts?.includes('none'),
    );

  return allSupportNoneEffort ? { effort: 'none' } : { enabled: false };
}

export function selectResponseFormat(
  batch: string[],
  modelMap: Map<string, OpenRouterModel>,
): { primary?: OpenRouterResponseFormat; supportsJsonObject: boolean } {
  const allStructured = batch.every((id) => {
    const model = modelMap.get(id);
    return model ? supportsStructuredOutputs(model) : false;
  });
  const allJsonObject = batch.every((id) => {
    const model = modelMap.get(id);
    return model ? supportsJsonObject(model) : false;
  });
  if (allStructured) {
    return {
      primary: RECEIPT_JSON_RESPONSE_FORMAT,
      supportsJsonObject: allJsonObject,
    };
  }
  if (allJsonObject) {
    return { primary: { type: 'json_object' }, supportsJsonObject: true };
  }
  return { primary: undefined, supportsJsonObject: false };
}

export function isRetryableParamError(
  error: unknown,
): error is OpenRouterApiError {
  return (
    error instanceof OpenRouterApiError &&
    (error.status === 400 || error.status === 422)
  );
}

export function isStructuredSchemaError(error: OpenRouterApiError): boolean {
  const msg = error.message.toLowerCase();
  return ['json_schema', 'structured', 'schema'].some((token) =>
    msg.includes(token),
  );
}

export function shouldRetryWithBasicPayload(
  error: OpenRouterApiError,
): boolean {
  const msg = error.message.toLowerCase();
  return [
    'response_format',
    'json_object',
    'structured',
    'reasoning',
    'max_tokens',
    'temperature',
    'parameter',
  ].some((token) => msg.includes(token));
}

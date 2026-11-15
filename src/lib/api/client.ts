import { useAuthStore } from '@/stores/use-auth-store';
import {
  ApiError,
  type ErrorInterceptor,
  type RequestConfig,
  type RequestInterceptor,
  type ResponseInterceptor,
} from './types';

export interface ApiClientOptions {
  baseUrl?: string;
  defaultTimeout?: number;
}

export interface ApiClientInstance {
  useRequestInterceptor: (interceptor: RequestInterceptor) => () => void;
  useResponseInterceptor: (interceptor: ResponseInterceptor) => () => void;
  useErrorInterceptor: (interceptor: ErrorInterceptor) => () => void;
  request: <T>(endpoint: string, config?: RequestConfig) => Promise<T>;
  get: <T>(endpoint: string, config?: RequestConfig) => Promise<T>;
  post: <T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ) => Promise<T>;
  put: <T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ) => Promise<T>;
  patch: <T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ) => Promise<T>;
  delete: <T>(endpoint: string, config?: RequestConfig) => Promise<T>;
}

const DEFAULT_TIMEOUT_MS = 15000;

function registerInterceptor<T>(
  getList: () => T[],
  setList: (next: T[]) => void,
  interceptor: T,
): () => void {
  setList([...getList(), interceptor]);
  return () => {
    setList(getList().filter((item) => item !== interceptor));
  };
}

function buildRequestUrl(
  baseUrl: string,
  endpoint: string,
  params?: RequestConfig['params'],
): string {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedEndpoint =
    normalizedBase.endsWith('/api') && endpoint.startsWith('/api/')
      ? endpoint.slice(4)
      : endpoint;

  let fullUrl = endpoint.startsWith('http')
    ? endpoint
    : `${normalizedBase}${normalizedEndpoint.startsWith('/') ? '' : '/'}${normalizedEndpoint}`;

  if (!params) return fullUrl;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  if (queryString) {
    fullUrl += `${fullUrl.includes('?') ? '&' : '?'}${queryString}`;
  }

  return fullUrl;
}

function serializeRequestBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (typeof body === 'object' && !(body instanceof FormData)) {
    return JSON.stringify(body);
  }
  return body as BodyInit;
}

function normalizeRequestError(error: unknown): Error {
  if (error instanceof ApiError) return error;
  if (error instanceof Error && error.name === 'AbortError') {
    return new ApiError(408, 'Request Timeout', null, 'Request timed out');
  }
  if (error instanceof Error) return error;
  return new Error('An unexpected network error occurred');
}

const defaultRequestInterceptor: RequestInterceptor = (url, config) => {
  const headers = new Headers(config.headers);

  if (!headers.has('Content-Type') && !(config.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (!config.skipAuth) {
    const token = useAuthStore.getState().token;
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return {
    url,
    config: { ...config, headers },
  };
};

const defaultResponseInterceptor: ResponseInterceptor = async (response) => {
  if (response.status === 401) {
    useAuthStore.getState().markUnauthorized();
  }

  if (response.ok) return response;

  let errorData: unknown;
  try {
    errorData = await response.json();
  } catch {
    errorData = await response.text();
  }

  const message =
    typeof errorData === 'object' && errorData && 'message' in errorData
      ? String((errorData as { message: unknown }).message)
      : undefined;

  throw new ApiError(response.status, response.statusText, errorData, message);
};

/** Creates a functional HTTP client with composable request, response, and error interceptors. */
export function createApiClient(
  options: ApiClientOptions = {},
): ApiClientInstance {
  const baseUrl =
    options.baseUrl ?? (process.env.NEXT_PUBLIC_API_URL || '/api');
  const defaultTimeout = options.defaultTimeout ?? DEFAULT_TIMEOUT_MS;

  let requestInterceptors: RequestInterceptor[] = [defaultRequestInterceptor];
  let responseInterceptors: ResponseInterceptor[] = [
    defaultResponseInterceptor,
  ];
  let errorInterceptors: ErrorInterceptor[] = [];

  const useRequestInterceptor = (interceptor: RequestInterceptor) =>
    registerInterceptor(
      () => requestInterceptors,
      (next) => {
        requestInterceptors = next;
      },
      interceptor,
    );

  const useResponseInterceptor = (interceptor: ResponseInterceptor) =>
    registerInterceptor(
      () => responseInterceptors,
      (next) => {
        responseInterceptors = next;
      },
      interceptor,
    );

  const useErrorInterceptor = (interceptor: ErrorInterceptor) =>
    registerInterceptor(
      () => errorInterceptors,
      (next) => {
        errorInterceptors = next;
      },
      interceptor,
    );

  const request = async <T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<T> => {
    let currentUrl = buildRequestUrl(baseUrl, endpoint, config.params);
    let currentConfig: RequestConfig = { ...config };

    for (const interceptor of requestInterceptors) {
      const result = await interceptor(currentUrl, currentConfig);
      currentUrl = result.url;
      currentConfig = result.config;
    }

    const controller = new AbortController();
    const timeout = currentConfig.timeout || defaultTimeout;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const { body, ...customOptions } = currentConfig;
    const fetchOptions: RequestInit = {
      ...customOptions,
      signal: controller.signal,
      body: serializeRequestBody(body),
    };

    try {
      let response = await fetch(currentUrl, fetchOptions);
      clearTimeout(timeoutId);

      for (const interceptor of responseInterceptors) {
        response = await interceptor(response, currentConfig);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      const finalError = normalizeRequestError(error);
      for (const interceptor of errorInterceptors) {
        await interceptor(finalError);
      }

      throw finalError;
    }
  };

  return {
    useRequestInterceptor,
    useResponseInterceptor,
    useErrorInterceptor,
    request,
    get: <T>(endpoint: string, config?: RequestConfig) =>
      request<T>(endpoint, { ...config, method: 'GET' }),
    post: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
      request<T>(endpoint, { ...config, method: 'POST', body }),
    put: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
      request<T>(endpoint, { ...config, method: 'PUT', body }),
    patch: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
      request<T>(endpoint, { ...config, method: 'PATCH', body }),
    delete: <T>(endpoint: string, config?: RequestConfig) =>
      request<T>(endpoint, { ...config, method: 'DELETE' }),
  };
}

export const apiClient = createApiClient();

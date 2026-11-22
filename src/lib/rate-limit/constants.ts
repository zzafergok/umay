import type { RateLimitPolicy, RateLimitPolicyId } from './types';

export const RATE_LIMIT_POLICIES: Record<RateLimitPolicyId, RateLimitPolicy> = {
  auth_login: {
    id: 'auth_login',
    maxRequests: 10,
    windowMs: 60_000,
  },
  auth_register: {
    id: 'auth_register',
    maxRequests: 5,
    windowMs: 60_000,
  },
  ai_receipt_analyze: {
    id: 'ai_receipt_analyze',
    maxRequests: 12,
    windowMs: 60_000,
  },
  ai_receipt_enrich: {
    id: 'ai_receipt_enrich',
    maxRequests: 20,
    windowMs: 60_000,
  },
};

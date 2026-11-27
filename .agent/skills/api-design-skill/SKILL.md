---
name: api-design-skill
description: Design, review, or evolve REST, GraphQL, RPC, event, or webhook contracts that are consistent, secure, observable, and compatible with their consumers. Use when designing new API endpoints, establishing API standards, or reviewing Route Handlers.
---

# API Design Skill

Design predictable, secure, and backward-compatible API contracts.

## 1. Establish Context

Before adding or changing an endpoint, identify consumers (SSR, browser client, mobile, webhook), auth boundaries, idempotency requirements, payload limits, and compatibility obligations.

## 2. REST Resource & Status Conventions

- Use plural nouns for resources (`/api/items`, `/api/items/{id}`), HTTP methods for actions (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), and avoid verb endpoints (`/api/createItem`).
- Apply accurate status codes:
  - `200 OK` (read/update), `201 Created` (create), `204 No Content` (delete)
  - `400 Bad Request` (malformed JSON/query), `401 Unauthorized` (unauthenticated), `403 Forbidden` (unauthorized), `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity` (validation), `429 Too Many Requests`
  - `500 Internal Server Error` (never leak stack traces or DB internals)

## 3. Validation, Error Shape & Pagination

- Validate request params, query strings, and bodies at the boundary with Zod (same rules on client and server).
- Return a consistent machine + human-readable error envelope:

```typescript
export interface ApiErrorResponse {
  error: string; // e.g. "VALIDATION_ERROR"
  message: string; // User-safe localized message
  details?: Record<string, unknown>;
}
```

- List endpoints should bound page sizes (`limit` cap), support cursor or explicit offset pagination (`items`, `hasNext`, `nextCursor`), and return deterministic sort order.

## 4. Next.js Route Handler Order of Operations

```typescript
export async function POST(request: Request) {
  const session = await requireAuth(request); // 1. Authenticate & authorize
  const body = schema.parse(await request.json()); // 2. Validate & narrow input
  const result = await domainService.create(session.uid, body); // 3. Delegate to service
  return NextResponse.json(result, { status: 201 }); // 4. Return minimal safe DTO
}
```

## 5. Compatibility & Security Checklist

- [ ] Auth and ownership/tenant checks enforced server-side (prevent IDOR/BOLA)
- [ ] Additive-only evolution for existing clients (avoid renaming/removing fields silently)
- [ ] Mutation endpoints handle retries safely (`Idempotency-Key` for billing/webhooks)
- [ ] Rate limits and request body size limits enforced on public or expensive routes
- [ ] Response DTOs strip internal fields, secrets, and unnecessary PII

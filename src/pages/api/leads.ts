import type { APIRoute } from 'astro';
import { createResendEmailProviderAdapter } from '../../lib/email-provider.adapter';
import type { LeadDeliveryPort } from '../../lib/lead-delivery.port';
import {
  createLeadFailureResponse,
  LEAD_FIELD_NAMES,
  type LeadField,
  type LeadResponse,
} from '../../lib/lead-response';
import { validateLeadInput, type LeadInput } from '../../lib/lead-validation';
import { createInMemoryRateLimiter, type RateLimiter } from '../../lib/rate-limit';

export const prerender = false;

const DEFAULT_RATE_LIMITER = createInMemoryRateLimiter({ limit: 5, windowMs: 60_000 }, Date.now);

type LeadPostDependencies = {
  delivery: LeadDeliveryPort;
  limiter: RateLimiter;
};

function jsonResponse(response: LeadResponse, status: number, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(response), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

function getInputValue(body: Record<string, unknown>, field: LeadField): string {
  const value = body[field];
  return typeof value === 'string' ? value : '';
}

function toLeadInput(body: Record<string, unknown> | undefined): LeadInput {
  const entries = LEAD_FIELD_NAMES.map(
    (field) => [field, body ? getInputValue(body, field) : ''] as const,
  );
  return Object.fromEntries(entries) as LeadInput;
}

async function parseRequest(request: Request): Promise<Record<string, unknown> | undefined> {
  try {
    const body: unknown = await request.json();
    return body !== null && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

export function createLeadPostHandler({ delivery, limiter }: LeadPostDependencies) {
  return async (request: Request): Promise<Response> => {
    const body = await parseRequest(request);
    const validation = validateLeadInput(toLeadInput(body));

    if (!validation.ok) {
      return jsonResponse(createLeadFailureResponse('invalid', validation.fields), 400);
    }

    const decision = limiter.allow(getClientIp(request));
    if (!decision.allowed) {
      return jsonResponse(createLeadFailureResponse('rate_limited'), 429, {
        'retry-after': String(Math.ceil(decision.retryAfterMs / 1_000)),
      });
    }

    try {
      await delivery.deliver(validation.lead);
      return jsonResponse({ ok: true }, 200);
    } catch {
      return jsonResponse(createLeadFailureResponse('unavailable'), 503);
    }
  };
}

function createDefaultDelivery(): LeadDeliveryPort {
  // Build the concrete adapter lazily, inside `deliver`, so an unconfigured
  // provider only fails once delivery is actually attempted (after
  // validation and rate limiting), not while assembling request
  // dependencies. Otherwise every request — including invalid ones that
  // should get a 400 — would short-circuit into a 503.
  return {
    deliver(lead) {
      return createResendEmailProviderAdapter({
        from: process.env.LEAD_EMAIL_FROM ?? '',
        recipients: (process.env.LEAD_RECIPIENTS ?? '').split(','),
      }).deliver(lead);
    },
  };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    return await createLeadPostHandler({
      delivery: createDefaultDelivery(),
      limiter: DEFAULT_RATE_LIMITER,
    })(request);
  } catch {
    return jsonResponse(createLeadFailureResponse('unavailable'), 503);
  }
};

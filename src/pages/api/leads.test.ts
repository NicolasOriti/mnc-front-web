import type { APIContext } from 'astro';
import { describe, expect, it, vi } from 'vitest';
import type { LeadDeliveryPort } from '../../lib/lead-delivery.port';
import type { RateLimiter } from '../../lib/rate-limit';
import { createLeadPostHandler, POST } from './leads';

function createRequest(body: object): Request {
  return new Request('https://mynutricoach.ar/api/leads', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.10' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/leads', () => {
  it('accepts a valid lead after server validation and delivers it', async () => {
    const deliver = vi.fn().mockResolvedValue(undefined);
    const handler = createLeadPostHandler({
      delivery: { deliver },
      limiter: { allow: () => ({ allowed: true }) },
    });

    const response = await handler(
      createRequest({ name: ' Ana ', email: ' ana@example.com ', phone: ' 11 5555 0101 ', website: '' }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(deliver).toHaveBeenCalledWith({
      name: 'Ana',
      email: 'ana@example.com',
      phone: '11 5555 0101',
    });
  });

  it('returns actionable invalid feedback without calling the delivery provider', async () => {
    const delivery: LeadDeliveryPort = { deliver: vi.fn() };
    const handler = createLeadPostHandler({
      delivery,
      limiter: { allow: () => ({ allowed: true }) },
    });

    const response = await handler(createRequest({ name: '', email: 'invalid', phone: '', website: '' }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      code: 'invalid',
      fields: ['name', 'email', 'phone'],
    });
    expect(delivery.deliver).not.toHaveBeenCalled();
  });

  it('maps rate limiting and delivery failures to safe non-success responses', async () => {
    const rateLimited: RateLimiter = { allow: () => ({ allowed: false, retryAfterMs: 3_000 }) };
    const unavailable: LeadDeliveryPort = { deliver: vi.fn().mockRejectedValue(new Error('provider error')) };
    const validLead = { name: 'Ana', email: 'ana@example.com', phone: '11 5555 0101', website: '' };

    const limitedResponse = await createLeadPostHandler({ delivery: unavailable, limiter: rateLimited })(
      createRequest(validLead),
    );
    const unavailableResponse = await createLeadPostHandler({
      delivery: unavailable,
      limiter: { allow: () => ({ allowed: true }) },
    })(createRequest(validLead));

    expect(limitedResponse.status).toBe(429);
    expect(limitedResponse.headers.get('retry-after')).toBe('3');
    await expect(limitedResponse.json()).resolves.toEqual({ ok: false, code: 'rate_limited' });
    expect(unavailableResponse.status).toBe(503);
    await expect(unavailableResponse.json()).resolves.toEqual({ ok: false, code: 'unavailable' });
  });

  it('validates before touching the delivery provider, even when mail is unconfigured', async () => {
    const originalApiKey = process.env.RESEND_API_KEY;
    const originalFrom = process.env.LEAD_EMAIL_FROM;
    const originalRecipients = process.env.LEAD_RECIPIENTS;
    delete process.env.RESEND_API_KEY;
    delete process.env.LEAD_EMAIL_FROM;
    delete process.env.LEAD_RECIPIENTS;

    try {
      const response = await POST({
        request: createRequest({ name: '', email: 'invalid', phone: '', website: '' }),
      } as unknown as APIContext);

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        ok: false,
        code: 'invalid',
        fields: ['name', 'email', 'phone'],
      });
    } finally {
      if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
      else process.env.RESEND_API_KEY = originalApiKey;
      if (originalFrom === undefined) delete process.env.LEAD_EMAIL_FROM;
      else process.env.LEAD_EMAIL_FROM = originalFrom;
      if (originalRecipients === undefined) delete process.env.LEAD_RECIPIENTS;
      else process.env.LEAD_RECIPIENTS = originalRecipients;
    }
  });
});

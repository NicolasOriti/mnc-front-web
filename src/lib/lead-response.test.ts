import { describe, expect, it } from 'vitest';
import { createLeadFailureResponse } from './lead-response';

describe('createLeadFailureResponse', () => {
  it('returns field names only for invalid submissions', () => {
    expect(createLeadFailureResponse('invalid', ['name', 'email'])).toEqual({
      ok: false,
      code: 'invalid',
      fields: ['name', 'email'],
    });
  });

  it('does not expose fields for rate-limit and delivery failures', () => {
    expect(createLeadFailureResponse('rate_limited')).toEqual({ ok: false, code: 'rate_limited' });
    expect(createLeadFailureResponse('unavailable')).toEqual({ ok: false, code: 'unavailable' });
  });
});

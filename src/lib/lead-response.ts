export const LEAD_FIELD_NAMES = ['name', 'email', 'phone', 'website'] as const;

export type LeadField = (typeof LEAD_FIELD_NAMES)[number];

export type LeadResponse =
  | { ok: true }
  | { ok: false; code: 'invalid'; fields: LeadField[] }
  | { ok: false; code: 'rate_limited' | 'unavailable' };

export function createLeadFailureResponse(
  code: 'invalid',
  fields: LeadField[],
): Extract<LeadResponse, { code: 'invalid' }>;
export function createLeadFailureResponse(
  code: 'rate_limited' | 'unavailable',
): Extract<LeadResponse, { code: 'rate_limited' | 'unavailable' }>;
export function createLeadFailureResponse(
  code: 'invalid' | 'rate_limited' | 'unavailable',
  fields?: LeadField[],
): LeadResponse {
  return code === 'invalid'
    ? { ok: false, code, fields: fields ?? [] }
    : { ok: false, code };
}

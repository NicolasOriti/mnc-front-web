import type { Lead } from './lead-delivery.port';
import type { LeadField } from './lead-response';

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 120;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LeadInput = Lead & { website?: string };

export type LeadValidationResult =
  | { ok: true; lead: Lead }
  | { ok: false; fields: LeadField[] };

export function validateLeadInput(input: LeadInput): LeadValidationResult {
  const lead: Lead = {
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
  };
  const fields: LeadField[] = [];

  if (!lead.name || lead.name.length > MAX_NAME_LENGTH) {
    fields.push('name');
  }

  if (!EMAIL_PATTERN.test(lead.email) || lead.email.length > MAX_EMAIL_LENGTH) {
    fields.push('email');
  }

  if (!lead.phone || lead.phone.length > MAX_PHONE_LENGTH) {
    fields.push('phone');
  }

  if (input.website?.trim()) {
    fields.push('website');
  }

  return fields.length === 0 ? { ok: true, lead } : { ok: false, fields };
}

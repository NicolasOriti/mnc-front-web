import { describe, expect, it } from 'vitest';
import { validateLeadInput } from './lead-validation';

describe('validateLeadInput', () => {
  it('trims and accepts a complete lead with a hidden honeypot left empty', () => {
    expect(
      validateLeadInput({
        name: '  Ana Pérez  ',
        email: ' ana@example.com ',
        phone: ' 11 5555 0101 ',
        website: '',
      }),
    ).toEqual({
      ok: true,
      lead: { name: 'Ana Pérez', email: 'ana@example.com', phone: '11 5555 0101' },
    });
  });

  it('rejects missing fields, invalid email, oversized values, and a completed honeypot', () => {
    expect(
      validateLeadInput({
        name: '',
        email: 'not-an-email',
        phone: 'x'.repeat(121),
        website: 'https://bot.example',
      }),
    ).toEqual({ ok: false, fields: ['name', 'email', 'phone', 'website'] });
  });
});

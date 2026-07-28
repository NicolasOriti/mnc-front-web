import { beforeEach, describe, expect, it, vi } from 'vitest';
const { Resend, send } = vi.hoisted(() => {
  const send = vi.fn();

  class MockResend {
    emails = { send };
  }

  return {
    send,
    Resend: vi.fn(MockResend),
  };
});

vi.mock('resend', () => ({ Resend }));

import {
  createResendEmailProviderAdapter,
  LeadDeliveryUnavailableError,
} from './email-provider.adapter';

describe('createResendEmailProviderAdapter', () => {
  beforeEach(() => {
    send.mockReset();
    Resend.mockClear();
    process.env.RESEND_API_KEY = 're_test_key';
  });

  it('sends a lead only to configured server-side recipients', async () => {
    send.mockResolvedValue({ data: { id: 'email_123' }, error: null });

    const adapter = createResendEmailProviderAdapter({
      from: 'Leads <leads@example.com>',
      recipients: ['owner@example.com', 'team@example.com'],
    });

    await expect(
      adapter.deliver({ name: 'Ana Pérez', email: 'ana@example.com', phone: '11 5555 0101' }),
    ).resolves.toBeUndefined();

    expect(Resend).toHaveBeenCalledWith('re_test_key');
    expect(send).toHaveBeenCalledWith({
      from: 'Leads <leads@example.com>',
      to: ['owner@example.com', 'team@example.com'],
      subject: 'Nueva consulta de Ana Pérez',
      text: 'Nombre: Ana Pérez\nEmail: ana@example.com\nTeléfono: 11 5555 0101',
      html: '<p><strong>Nombre:</strong> Ana Pérez</p><p><strong>Email:</strong> ana@example.com</p><p><strong>Teléfono:</strong> 11 5555 0101</p>',
    });
  });

  it('maps a returned provider error to an unavailable delivery error', async () => {
    send.mockResolvedValue({ data: null, error: { message: 'sender not verified' } });

    const adapter = createResendEmailProviderAdapter({
      from: 'Leads <leads@example.com>',
      recipients: ['owner@example.com'],
    });

    await expect(
      adapter.deliver({ name: 'Ana Pérez', email: 'ana@example.com', phone: '11 5555 0101' }),
    ).rejects.toBeInstanceOf(LeadDeliveryUnavailableError);
  });

  it('escapes lead values before adding them to the email HTML', async () => {
    send.mockResolvedValue({ data: { id: 'email_456' }, error: null });
    const adapter = createResendEmailProviderAdapter({
      from: 'Leads <leads@example.com>',
      recipients: ['owner@example.com'],
    });

    await adapter.deliver({
      name: 'Ana <Pérez>',
      email: 'ana@example.com',
      phone: '11 & 5555',
    });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        html: '<p><strong>Nombre:</strong> Ana &lt;Pérez&gt;</p><p><strong>Email:</strong> ana@example.com</p><p><strong>Teléfono:</strong> 11 &amp; 5555</p>',
      }),
    );
  });

  it('rejects missing server-only delivery configuration before attempting delivery', () => {
    expect(() =>
      createResendEmailProviderAdapter({ from: '', recipients: [] }),
    ).toThrow(LeadDeliveryUnavailableError);
    expect(Resend).not.toHaveBeenCalled();
  });
});

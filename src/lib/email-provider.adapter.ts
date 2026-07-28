import { Resend } from 'resend';
import type { Lead, LeadDeliveryPort } from './lead-delivery.port';

export class LeadDeliveryUnavailableError extends Error {
  constructor() {
    super('Lead delivery provider is not configured.');
  }
}

export class UnconfiguredEmailProviderAdapter implements LeadDeliveryPort {
  async deliver(lead: Lead): Promise<void> {
    void lead;
    throw new LeadDeliveryUnavailableError();
  }
}

export type ResendEmailProviderConfig = {
  from: string;
  recipients: string[];
};

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => HTML_ENTITIES[character]);
}

export function createResendEmailProviderAdapter(
  config: ResendEmailProviderConfig,
): LeadDeliveryPort {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = config.from.trim();
  const recipients = config.recipients.map((recipient) => recipient.trim()).filter(Boolean);

  if (!apiKey || !from || recipients.length === 0) {
    throw new LeadDeliveryUnavailableError();
  }

  const resend = new Resend(apiKey);

  return {
    async deliver(lead) {
      const response = await resend.emails.send({
        from,
        to: recipients,
        subject: `Nueva consulta de ${lead.name}`,
        text: `Nombre: ${lead.name}\nEmail: ${lead.email}\nTeléfono: ${lead.phone}`,
        html: `<p><strong>Nombre:</strong> ${escapeHtml(lead.name)}</p><p><strong>Email:</strong> ${escapeHtml(lead.email)}</p><p><strong>Teléfono:</strong> ${escapeHtml(lead.phone)}</p>`,
      });

      if (response.error) {
        throw new LeadDeliveryUnavailableError();
      }
    },
  };
}

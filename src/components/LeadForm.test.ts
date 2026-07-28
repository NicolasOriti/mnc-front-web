import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import LeadForm from './LeadForm.astro';

describe('LeadForm', () => {
  it('renders required, labelled consultation fields and a submit action', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LeadForm);

    expect(html).toContain('for="lead-name"');
    expect(html).toContain('name="name"');
    expect(html).toContain('type="email"');
    expect(html).toContain('name="phone"');
    expect(html).toContain('required');
    expect(html).toContain('Enviar consulta');
  });

  it('keeps the honeypot hidden and never renders mail configuration', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LeadForm);

    expect(html).toContain('name="website"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toMatch(/RESEND_API_KEY|LEAD_RECIPIENTS|LEAD_EMAIL_FROM/);
  });
});

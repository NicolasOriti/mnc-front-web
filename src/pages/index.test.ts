import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import HomePage from './index.astro';

describe('public landing', () => {
  it('addresses nutritionists in Argentina with a consultation CTA', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HomePage, {
      request: new Request('https://mynutricoach.ar/'),
    });

    expect(html).toContain('Nutricionistas de Argentina');
    expect(html).toContain('Solicitar una consulta');
    expect(html).toContain('Acompañamiento entre consultas, bajo tu criterio profesional.');
  });

  it('keeps the public scope free of prices and clinical promises', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HomePage, {
      request: new Request('https://mynutricoach.ar/'),
    });

    expect(html).not.toMatch(/\$|precio|diagnostic|tratamiento|cura/i);
    expect(html).not.toContain('Paciente real');
  });

  it('publishes crawlable Spanish metadata without a WhatsApp claim', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HomePage, {
      request: new Request('https://mynutricoach.ar/'),
    });

    expect(html).toContain('<html lang="es-AR">');
    expect(html).toContain('<link rel="canonical" href="https://mynutricoach.ar/">');
    expect(html).toContain('application/ld+json');
    expect(html).toContain('"@type":"Organization"');
    expect(html).not.toMatch(/whatsapp/i);
  });
});

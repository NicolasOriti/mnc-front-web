import type { APIContext } from 'astro';
import { describe, expect, it } from 'vitest';
import { GET } from './sitemap-index.xml';

describe('sitemap-index.xml', () => {
  it('indexes only the public landing URL', async () => {
    const response = await GET({
      request: new Request('https://mynutricoach.ar/sitemap-index.xml'),
    } as unknown as APIContext);

    const body = await response.text();

    expect(response.headers.get('content-type')).toContain('application/xml');
    expect(body).toContain('<loc>https://mynutricoach.ar/</loc>');
    expect(body).not.toContain('/api/leads');
  });
});

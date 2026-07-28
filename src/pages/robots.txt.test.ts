import type { APIContext } from 'astro';
import { describe, expect, it } from 'vitest';
import { GET } from './robots.txt';

describe('robots.txt', () => {
  it('allows public crawling and points crawlers at the configured sitemap', async () => {
    const response = await GET({
      request: new Request('https://mynutricoach.ar/robots.txt'),
    } as unknown as APIContext);

    expect(response.headers.get('content-type')).toContain('text/plain');
    expect(await response.text()).toBe(
      'User-agent: *\nAllow: /\nSitemap: https://mynutricoach.ar/sitemap-index.xml\n',
    );
  });
});

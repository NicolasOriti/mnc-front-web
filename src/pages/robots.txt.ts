import type { APIContext } from 'astro';
import { getPublicEnvironment } from '../lib/env';

export function GET({ request }: APIContext): Response {
  const { siteUrl } = getPublicEnvironment(import.meta.env, new URL(request.url));
  const sitemapUrl = new URL('/sitemap-index.xml', siteUrl);

  return new Response(`User-agent: *\nAllow: /\nSitemap: ${sitemapUrl.href}\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

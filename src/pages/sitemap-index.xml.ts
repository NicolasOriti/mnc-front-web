import type { APIContext } from 'astro';
import { getPublicEnvironment } from '../lib/env';

export function GET({ request }: APIContext): Response {
  const { siteUrl } = getPublicEnvironment(import.meta.env, new URL(request.url));
  const landingUrl = new URL('/', siteUrl);
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${landingUrl.href}</loc></url></urlset>`;

  return new Response(body, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}

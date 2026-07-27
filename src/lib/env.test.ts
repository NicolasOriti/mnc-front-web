import { describe, expect, it } from 'vitest';
import { getPublicEnvironment } from './env';

describe('getPublicEnvironment', () => {
  const fallbackSiteUrl = new URL('https://mynutricoach.ar/');

  it('uses configured public URLs and enables WhatsApp only with an explicit true flag', () => {
    const environment = getPublicEnvironment(
      {
        PUBLIC_SITE_URL: 'https://www.mynutricoach.ar',
        PUBLIC_LOGIN_URL: 'https://app.mynutricoach.ar/login',
        PUBLIC_WHATSAPP_READY: 'true',
      },
      fallbackSiteUrl,
    );

    expect(environment.siteUrl.href).toBe('https://www.mynutricoach.ar/');
    expect(environment.loginUrl?.href).toBe('https://app.mynutricoach.ar/login');
    expect(environment.whatsAppReady).toBe(true);
  });

  it('uses the request URL and hides an unusable login URL', () => {
    const environment = getPublicEnvironment(
      {
        PUBLIC_LOGIN_URL: 'javascript:alert(1)',
        PUBLIC_WHATSAPP_READY: 'TRUE',
      },
      fallbackSiteUrl,
    );

    expect(environment.siteUrl.href).toBe('https://mynutricoach.ar/');
    expect(environment.loginUrl).toBeUndefined();
    expect(environment.whatsAppReady).toBe(false);
  });
});

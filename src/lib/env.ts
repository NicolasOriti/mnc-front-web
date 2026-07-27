export type PublicEnvironmentSource = Record<string, string | undefined>;

export type PublicEnvironment = {
  loginUrl?: URL;
  siteUrl: URL;
  whatsAppReady: boolean;
};

function parseHttpUrl(value: string | undefined): URL | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : undefined;
  } catch {
    return undefined;
  }
}

export function getPublicEnvironment(
  source: PublicEnvironmentSource,
  fallbackSiteUrl: URL,
): PublicEnvironment {
  return {
    siteUrl: parseHttpUrl(source.PUBLIC_SITE_URL) ?? fallbackSiteUrl,
    loginUrl: parseHttpUrl(source.PUBLIC_LOGIN_URL),
    whatsAppReady: source.PUBLIC_WHATSAPP_READY === 'true',
  };
}

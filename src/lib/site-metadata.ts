export function createStructuredData(siteUrl: URL) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', name: 'MyNutriCoach', url: siteUrl.origin },
      { '@type': 'WebSite', name: 'MyNutriCoach', url: siteUrl.origin },
    ],
  };
}

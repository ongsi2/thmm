import type { MetadataRoute } from 'next';

const HOST = 'https://thmm.kr';

const PATHS = [
  '/',
  '/portfolio',
  '/portfolio/admin-console',
  '/portfolio/bdb-grid',
  '/portfolio/cicd',
  '/portfolio/grandbaie',
  '/portfolio/log-viewer',
  '/portfolio/ohmybaby',
  '/portfolio/redis-session',
  '/portfolio/sso-provider',
  '/portfolio/techtrade-migration',
  '/portfolio/tls-upgrade',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PATHS.flatMap((path) => {
    const koUrl = `${HOST}${path}`;
    const enPath = path === '/' ? '/en' : `/en${path}`;
    const enUrl = `${HOST}${enPath}`;
    const alternates = {
      languages: {
        ko: koUrl,
        en: enUrl,
      },
    };
    return [
      { url: koUrl, lastModified: now, alternates },
      { url: enUrl, lastModified: now, alternates },
    ];
  });
}

import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/posts';

const HOST = 'https://thmm.kr';

/** ko/en 양쪽에 존재하는 경로 — hreflang 상호 링크를 붙인다. */
const BILINGUAL_PATHS = [
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

  const bilingual = BILINGUAL_PATHS.flatMap((path) => {
    const koUrl = `${HOST}${path}`;
    const enPath = path === '/' ? '/en' : `/en${path}`;
    const enUrl = `${HOST}${enPath}`;
    const alternates = { languages: { ko: koUrl, en: enUrl } };
    return [
      { url: koUrl, lastModified: now, alternates },
      { url: enUrl, lastModified: now, alternates },
    ];
  });

  // 블로그는 한국어 전용이라 en 짝이 없다 → alternates를 붙이지 않는다.
  const posts = getPublishedPosts();
  const blog: MetadataRoute.Sitemap = [
    {
      url: `${HOST}/blog`,
      // 목록의 최신성은 가장 최근 글 기준
      lastModified: posts[0] ? new Date(posts[0].date) : now,
    },
    ...posts.map((post) => ({
      url: `${HOST}/blog/${post.slug}`,
      lastModified: new Date(post.date),
    })),
  ];

  return [...bilingual, ...blog];
}

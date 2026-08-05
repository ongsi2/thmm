import { getPublishedPosts } from '@/lib/posts';

const SITE_URL = 'https://thmm.kr';
const TITLE = 'THMM — 신성무';
const DESCRIPTION = '실무에서 만난 문제와 해결 과정을 짧게 정리한 기술 노트와 메모.';

/** XML 텍스트 노드에 그대로 넣으면 안 되는 문자들. 제목·요약은 사용자가 쓴 자유 텍스트다. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** RFC 822 — RSS 2.0의 pubDate 형식. 날짜만 있으므로 KST 자정 기준으로 찍는다. */
function toRfc822(date: string): string {
  return new Date(`${date}T00:00:00+09:00`).toUTCString();
}

export async function GET() {
  const posts = getPublishedPosts();
  const lastBuild = posts[0] ? toRfc822(posts[0].date) : new Date().toUTCString();

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      const categories = post.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join('\n');
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escapeXml(post.summary)}</description>`,
        `      <pubDate>${toRfc822(post.date)}</pubDate>`,
        categories,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(TITLE)}</title>
    <link>${SITE_URL}/blog</link>
    <description>${escapeXml(DESCRIPTION)}</description>
    <language>ko-kr</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      // 글은 자주 안 바뀌지만 새 글이 하루씩 늦게 보이면 곤란하니 짧게 잡는다.
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

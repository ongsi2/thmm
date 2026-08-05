import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import {
  formatPostDate,
  getPost,
  getPublishedPosts,
  getRelatedPosts,
  type PostType,
} from '@/lib/posts';

const BLOG_LOCALE = 'ko';
const SITE_URL = 'https://thmm.kr';

const typeBadge: Record<PostType, { label: string; className: string }> = {
  note: {
    label: 'NOTE',
    className:
      'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] border-[var(--color-accent)]/30',
  },
  link: {
    label: 'MEMO',
    className:
      'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border-[var(--color-secondary)]/30',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (locale !== BLOG_LOCALE) return {};

  const post = await getPost(slug);
  if (!post) return {};

  const url = `/blog/${post.slug}`;
  return {
    title: `${post.title} | THMM`,
    description: post.summary,
    keywords: post.tags,
    // draft는 발행 전 미리보기용이라 색인되면 안 된다.
    robots: post.draft ? { index: false, follow: false } : undefined,
    alternates: { canonical: url },
    openGraph: {
      locale: 'ko_KR',
      title: post.title,
      description: post.summary,
      type: 'article',
      url,
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (locale !== BLOG_LOCALE) notFound();

  const post = await getPost(slug);
  if (!post) notFound();

  const t = await getTranslations('blog');
  const related = getRelatedPosts(post);
  const badge = typeBadge[post.type];

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: 'ko-KR',
    keywords: post.tags.join(', '),
    author: { '@type': 'Person', name: '신성무', url: SITE_URL },
    publisher: { '@type': 'Person', name: '신성무', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article>
        <header className="px-6 pt-32 pb-10 md:pt-40 md:pb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-light)] via-white to-[var(--color-accent-light)]/20" />
          <div className="max-w-3xl mx-auto relative z-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)] spring"
            >
              <span aria-hidden>←</span>
              <span>{t('backToList')}</span>
            </Link>

            <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 mb-5">
              <span
                className={`px-2 py-0.5 border rounded-md font-mono text-[10px] font-semibold tracking-[0.15em] ${badge.className}`}
              >
                {badge.label}
              </span>
              {post.draft && (
                <span className="px-2 py-0.5 border border-amber-300 bg-amber-50 text-amber-700 rounded-md font-mono text-[10px] font-semibold tracking-[0.15em]">
                  DRAFT
                </span>
              )}
              <time dateTime={post.date} className="font-mono text-xs text-[var(--color-text-muted)]">
                {formatPostDate(post.date)}
              </time>
              <span className="text-[var(--color-border)]" aria-hidden>
                ·
              </span>
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                {post.readingMinutes}
                {t('readingSuffix')}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.2] tracking-tight text-[var(--color-primary)] text-wrap-balance mb-5">
              {post.title}
            </h1>
            <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">{post.summary}</p>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 border border-[var(--color-border)] bg-white font-mono text-xs text-[var(--color-text-muted)] rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="px-6 pb-20 md:pb-28 border-t border-[var(--color-border)] pt-12 md:pt-16">
          <div
            className="prose-thmm max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </div>
      </article>

      {related.length > 0 && (
        <section className="px-6 py-16 md:py-20 border-t border-[var(--color-border)] bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold tracking-tight text-[var(--color-primary)] mb-6">
              {t('relatedHeading')}
            </h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/blog/${r.slug}`}
                    className="group block h-full p-5 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-2xl hover:border-[var(--color-accent)]/40 hover:shadow-md spring"
                  >
                    <p className="font-mono text-[10px] font-semibold text-[var(--color-text-muted)] tracking-wider mb-2">
                      {formatPostDate(r.date)}
                    </p>
                    <p className="font-bold text-[var(--color-primary)] leading-snug mb-1.5 group-hover:text-[var(--color-accent)] spring">
                      {r.title}
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed line-clamp-2">
                      {r.summary}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}

export function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

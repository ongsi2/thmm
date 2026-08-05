import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getPublishedPosts } from '@/lib/posts';
import PostList from './_components/PostList';

/** 블로그는 한국어 전용. en 로케일에서는 라우트 자체를 노출하지 않는다. */
const BLOG_LOCALE = 'ko';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== BLOG_LOCALE) return {};

  const t = await getTranslations({ locale, namespace: 'meta.blogIndex' });
  return {
    title: t('title'),
    description: t('description'),
    // ko 전용이므로 hreflang 대체 언어를 내보내지 않는다.
    alternates: {
      canonical: '/blog',
      types: { 'application/rss+xml': `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thmm.kr'}/rss.xml` },
    },
    openGraph: {
      locale: 'ko_KR',
      title: t('title'),
      description: t('description'),
      type: 'website',
      url: '/blog',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function BlogIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== BLOG_LOCALE) notFound();

  const posts = getPublishedPosts();
  const t = await getTranslations('blog');

  return (
    <main>
      <section className="px-6 pt-32 pb-10 md:pt-40 md:pb-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-light)] via-white to-[var(--color-accent-light)]/30" />
        <div className="absolute top-24 right-[10%] w-80 h-80 rounded-full bg-[var(--color-accent)]/[0.05] blur-3xl animate-float" />
        <div className="max-w-3xl mx-auto relative z-10">
          <p className="text-sm font-mono font-medium text-[var(--color-accent)] tracking-wider mb-4">
            {t('eyebrow')}
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight text-[var(--color-primary)] text-wrap-balance mb-6">
            {t('headingLine1')}
            <br />
            <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] bg-clip-text text-transparent">
              {t('headingLine2')}
            </span>
          </h1>
          <p className="text-lg text-[var(--color-text-muted)] leading-relaxed max-w-2xl mb-6">
            {t('lead')}
          </p>
          <a
            href="/rss.xml"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-accent)] spring"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <circle cx="3.5" cy="12.5" r="1.8" />
              <path d="M2 6.6V9a5.4 5.4 0 015.4 5.4h2.4C9.8 10.1 6.3 6.6 2 6.6z" />
              <path d="M2 2v2.4c5.6 0 10.1 4.5 10.1 10.1H14.5C14.5 8 8.9 2 2 2z" />
            </svg>
            RSS
          </a>
        </div>
      </section>

      <section className="px-6 pb-24 md:pb-32">
        <div className="max-w-3xl mx-auto">
          <PostList
            posts={posts}
            labels={{
              all: t('filterAll'),
              note: t('filterNote'),
              link: t('filterLink'),
              empty: t('empty'),
              readingSuffix: t('readingSuffix'),
            }}
          />
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { casesByOrganization } from './_components/cases';

type Locale = 'ko' | 'en';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.portfolioIndex' });
  const path = '/portfolio';
  const canonical = locale === 'ko' ? path : `/en${path}`;
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical,
      languages: {
        'ko-KR': path,
        'en-US': `/en${path}`,
        'x-default': path,
      },
    },
    openGraph: {
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      alternateLocale: locale === 'ko' ? 'en_US' : 'ko_KR',
      title: t('title'),
      description: t('description'),
      type: 'website',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function PortfolioIndex() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('projects.index');
  const tLabels = await getTranslations('projects.labels');
  const groups = casesByOrganization();

  return (
    <main>
      <section className="px-6 pt-32 pb-12 md:pt-40 md:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-light)] via-white to-[var(--color-accent-light)]/30" />
        <div className="absolute top-24 right-[10%] w-80 h-80 rounded-full bg-[var(--color-accent)]/[0.05] blur-3xl animate-float" />
        <div className="max-w-5xl mx-auto relative z-10">
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
          <p className="text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed max-w-3xl">
            {t('lead')}
          </p>
        </div>
      </section>

      <section className="px-6 pb-24 md:pb-32">
        <div className="max-w-5xl mx-auto space-y-14">
          {groups.map(({ org, items }, gIdx) => {
            const orgContent = org.i18n[locale];
            return (
              <div key={org.id}>
                <div className="mb-6 pb-5 border-b border-[var(--color-border)]">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--color-text-muted)]">
                      {String(gIdx + 1).padStart(2, '0')} / {tLabels('organization')}
                    </span>
                    {org.current && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                        <span className="text-[10px] font-semibold text-[var(--color-accent-dark)] tracking-wider uppercase">
                          {tLabels('currentBadge')}
                        </span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-primary)] mb-2">
                    <span>{orgContent.system}</span>
                    <span className="ml-3 text-base md:text-lg font-medium text-[var(--color-text-muted)]">
                      @ {orgContent.company}
                    </span>
                  </h2>
                  <p className="font-mono text-xs text-[var(--color-text-muted)] mb-3">
                    {orgContent.period} · {orgContent.role}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-3xl">
                    {orgContent.intro}
                  </p>
                </div>

                <div className="space-y-4">
                  {items.map((c, i) => {
                    const caseContent = c.i18n[locale];
                    return (
                      <Link
                        key={c.slug}
                        href={`/portfolio/${c.slug}`}
                        className="group block relative bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden hover:border-[var(--color-accent)]/50 hover:shadow-xl shadow-black/5 spring"
                      >
                        <div className="grid md:grid-cols-[auto_1fr_auto] items-stretch">
                          <div className="hidden md:flex flex-col items-center justify-center px-8 py-10 bg-[var(--color-bg-light)] border-r border-[var(--color-border)] min-w-[140px] group-hover:bg-[var(--color-accent)]/[0.04] spring">
                            <span className="text-[11px] font-mono font-semibold text-[var(--color-text-muted)] tracking-[0.2em] uppercase mb-2">
                              {tLabels('case')}
                            </span>
                            <span className="text-4xl font-bold font-mono text-[var(--color-primary)] group-hover:text-[var(--color-accent)] spring">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <div className="p-7 md:p-9">
                            <p className="text-[11px] font-mono font-semibold text-[var(--color-accent)] tracking-[0.2em] uppercase mb-3">
                              {c.category}
                            </p>
                            <h3 className="text-2xl md:text-[26px] font-bold text-[var(--color-primary)] leading-snug mb-3 group-hover:text-[var(--color-accent)] spring text-wrap-balance">
                              {caseContent.title}
                            </h3>
                            <p className="text-[var(--color-text-muted)] leading-relaxed mb-5 max-w-2xl">
                              {caseContent.summary}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {c.stack.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2.5 py-1 border border-[var(--color-border)] bg-[var(--color-bg-light)] font-mono text-xs font-medium rounded-md"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="hidden md:flex flex-col items-end justify-between p-9 border-l border-[var(--color-border)] min-w-[180px]">
                            <div className="text-right">
                              <p className="text-[11px] font-mono font-semibold text-[var(--color-text-muted)] tracking-[0.2em] uppercase mb-2">
                                {tLabels('outcome')}
                              </p>
                              <p className="text-sm font-bold text-[var(--color-accent)] leading-snug">
                                {caseContent.outcome}
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-sm font-mono font-semibold text-[var(--color-primary)] group-hover:text-[var(--color-accent)] group-hover:translate-x-1 spring">
                              {tLabels('read')} <span aria-hidden>→</span>
                            </span>
                          </div>
                          <div className="md:hidden px-7 pb-7 flex items-center justify-between">
                            <p className="text-xs font-mono font-semibold text-[var(--color-accent)]">
                              {caseContent.outcome}
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-sm font-mono font-semibold text-[var(--color-primary)] group-hover:text-[var(--color-accent)] spring">
                              {tLabels('read')} <span aria-hidden>→</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

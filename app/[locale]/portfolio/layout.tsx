import SiteNavigation from '@/app/_components/SiteNavigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import LanguageToggle from '@/app/_components/LanguageToggle';

export default async function PortfolioLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const tNav = await getTranslations('nav');
  const tFooter = await getTranslations('footer');
  // 블로그는 한국어 전용 — en에서는 라우트가 404라 링크를 숨긴다.
  const showBlog = (await getLocale()) === 'ko';

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg-light)] noise-overlay">
      <SiteNavigation logo={
        <Link
            href="/"
            className="text-lg font-bold tracking-tight text-[var(--color-primary)] hover:text-[var(--color-accent)] spring"
          >
            THMM
          </Link>
      }>
            <Link
              href="/#experience"
              className="relative py-1 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] spring"
            >
              {tNav('experience')}
            </Link>
            <Link
              href="/#projects"
              className="relative py-1 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] spring"
            >
              {tNav('projects')}
            </Link>
            <Link
              href="/portfolio"
              className="relative py-1 text-[var(--color-accent)]"
            >
              {tNav('caseStudies')}
              <span className="absolute -bottom-0.5 left-0 h-[2px] w-full bg-[var(--color-accent)] rounded-full" />
            </Link>
            {showBlog && (
              <Link
                href="/blog"
                className="relative py-1 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] spring"
              >
                {tNav('blog')}
              </Link>
            )}
            <LanguageToggle />
      </SiteNavigation>
      {children}
      <footer className="py-10 text-center border-t border-[var(--color-border)]">
        <p className="text-[var(--color-text-muted)] text-xs">{tFooter('text')}</p>
      </footer>
    </div>
  );
}

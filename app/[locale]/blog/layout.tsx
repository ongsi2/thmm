import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function BlogLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const tNav = await getTranslations('nav');
  const tFooter = await getTranslations('footer');

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg-light)] noise-overlay">
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-[var(--color-primary)] hover:text-[var(--color-accent)] spring"
          >
            THMM
          </Link>
          <div className="flex gap-5 sm:gap-8 text-sm font-medium">
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
              className="relative py-1 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] spring"
            >
              {tNav('caseStudies')}
            </Link>
            {/* 블로그는 한국어 전용이라 언어 토글을 두지 않는다 (en에서는 이 라우트가 404) */}
            <Link href="/blog" className="relative py-1 text-[var(--color-accent)]">
              {tNav('blog')}
              <span className="absolute -bottom-0.5 left-0 h-[2px] w-full bg-[var(--color-accent)] rounded-full" />
            </Link>
          </div>
        </div>
      </nav>
      {children}
      <footer className="py-10 text-center border-t border-[var(--color-border)]">
        <p className="text-[var(--color-text-muted)] text-xs">{tFooter('text')}</p>
      </footer>
    </div>
  );
}

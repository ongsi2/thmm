import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import LanguageToggle from '@/app/_components/LanguageToggle';

const siteUrl = 'https://thmm.kr';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: '케이스 스터디 | 신성무 포트폴리오',
    template: '%s | 신성무 포트폴리오',
  },
  description:
    '레거시 환경에서 CI/CD, 세션 클러스터링, TLS 업그레이드 등 실제 운영 문제를 해결한 백엔드 케이스 스터디 모음.',
  alternates: {
    canonical: `${siteUrl}/portfolio`,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: `${siteUrl}/portfolio`,
    siteName: 'THMM Portfolio',
    title: '케이스 스터디 | 신성무 포트폴리오',
    description:
      '레거시 환경에서 CI/CD, 세션 클러스터링, TLS 업그레이드 등 실제 운영 문제를 해결한 백엔드 케이스 스터디 모음.',
    images: [`${siteUrl}/og-image.jpg`],
  },
};

export default async function PortfolioLayout({
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
              className="relative py-1 text-[var(--color-accent)]"
            >
              {tNav('caseStudies')}
              <span className="absolute -bottom-0.5 left-0 h-[2px] w-full bg-[var(--color-accent)] rounded-full" />
            </Link>
            <LanguageToggle />
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

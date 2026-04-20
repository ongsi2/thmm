import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { projects, ProjectCard } from '../../../_components/projects-data';

export const metadata = {
  title: 'Demo B · Featured + All | THMM',
  robots: { index: false, follow: false },
};

export default async function ProjectsDemoB() {
  const locale = (await getLocale()) as 'ko' | 'en';
  const featured = projects.filter((p) => p.featured);
  const total = projects.length;

  return (
    <main className="min-h-[100dvh] bg-[var(--color-bg-light)]">
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-[var(--color-primary)] hover:text-[var(--color-accent)] spring"
          >
            THMM
          </Link>
          <div className="flex gap-4 text-sm font-medium">
            <Link
              href="/demo/projects-a"
              className="px-2.5 py-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-primary)] spring"
            >
              Demo A
            </Link>
            <span className="px-2.5 py-1 rounded-md bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30 font-mono text-xs">
              Demo B · Featured
            </span>
            <Link
              href="/demo/projects-c"
              className="px-2.5 py-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-primary)] spring"
            >
              Demo C
            </Link>
            <Link
              href="/#projects"
              className="px-2.5 py-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-primary)] spring"
            >
              ↩ 현재
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 md:pt-40 pb-24 md:pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-mono font-medium text-[var(--color-accent)] tracking-wider mb-3">
                FEATURED PROJECTS · DEMO B
              </p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">대표 프로젝트</h2>
              <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                히어로에는 대표 3개만 큼직하게. 나머지는 별도 페이지로 분리해서 히어로가 터지지 않게
                유지합니다.
              </p>
            </div>
            <Link
              href="/demo/projects-b"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white font-semibold text-sm rounded-xl hover:shadow-md hover:scale-[1.02] active:scale-[0.98] spring"
            >
              전체 프로젝트 보기 ({total}){' '}
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-4">
            {featured.map((p) => (
              <ProjectCard key={p.slug} project={p} locale={locale} size="featured" />
            ))}
          </div>

          <div className="mt-16 p-6 md:p-8 bg-white border border-dashed border-[var(--color-border)] rounded-2xl text-center">
            <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-[var(--color-text-muted)] uppercase mb-2">
              Note
            </p>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xl mx-auto">
              "전체 프로젝트 보기" 버튼은 별도의{' '}
              <code className="font-mono text-xs bg-[var(--color-bg-light)] border border-[var(--color-border)] px-1.5 py-0.5 rounded">
                /projects
              </code>{' '}
              페이지로 연결 (현재는 이 데모 자체로 대체). 케이스 스터디의{' '}
              <code className="font-mono text-xs bg-[var(--color-bg-light)] border border-[var(--color-border)] px-1.5 py-0.5 rounded">
                /portfolio
              </code>{' '}
              구조와 동일한 패턴이라 확장성·일관성이 좋습니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

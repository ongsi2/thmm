import Link from 'next/link';
import { projects, ProjectCard } from '../../_components/projects-data';

export const metadata = {
  title: 'Demo A · Grid | THMM',
  robots: { index: false, follow: false },
};

export default function ProjectsDemoA() {
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
            <span className="px-2.5 py-1 rounded-md bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30 font-mono text-xs">
              Demo A · Grid
            </span>
            <Link
              href="/demo/projects-b"
              className="px-2.5 py-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-primary)] spring"
            >
              Demo B
            </Link>
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
          <div className="mb-12">
            <p className="text-sm font-mono font-medium text-[var(--color-accent)] tracking-wider mb-3">
              PROJECTS · DEMO A
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              운영 환경에서 바로 활용 가능한 프로젝트들
            </h2>
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">
              자동 스크롤 제거. 한 화면에 모든 프로젝트가 그리드로 정렬돼 스캔이 쉽습니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {projects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

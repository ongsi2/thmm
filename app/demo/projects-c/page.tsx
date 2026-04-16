import Link from 'next/link';
import ProjectsList from '../../_components/ProjectsList';

export const metadata = {
  title: 'Demo C · List | THMM',
  robots: { index: false, follow: false },
};

export default function ProjectsDemoC() {
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
          <div className="flex gap-3 text-sm font-medium">
            <Link
              href="/demo/projects-a"
              className="px-2.5 py-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-primary)] spring"
            >
              Demo A
            </Link>
            <Link
              href="/demo/projects-b"
              className="px-2.5 py-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-primary)] spring"
            >
              Demo B
            </Link>
            <span className="px-2.5 py-1 rounded-md bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30 font-mono text-xs">
              Demo C · List
            </span>
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <p className="text-sm font-mono font-medium text-[var(--color-accent)] tracking-wider mb-3">
              PROJECTS · DEMO C
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">프로젝트 라이브러리</h2>
            <p className="mt-4 text-sm text-[var(--color-text-muted)] leading-relaxed">
              기본은 한 줄 요약. 클릭하면 상세 설명과 기술 스택, 방문 링크가 펼쳐집니다. 여러 개를 동시에
              열어 비교할 수도 있어요.
            </p>
          </div>

          <ProjectsList />
        </div>
      </section>
    </main>
  );
}

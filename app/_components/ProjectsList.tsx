'use client';

import { useEffect, useRef, useState } from 'react';
import { projects, type Project, type ProjectCTA } from './projects-data';

function Cta({ cta }: { cta: ProjectCTA }) {
  const base =
    'inline-flex items-center justify-center gap-1.5 px-4 py-2 font-semibold text-sm rounded-xl spring hover:shadow-md hover:scale-[1.02] active:scale-[0.98]';
  const classes =
    cta.variant === 'accent'
      ? `${base} bg-[var(--color-accent)] text-white shadow-sm shadow-emerald-500/20`
      : cta.variant === 'ghost'
      ? `${base} bg-white text-[var(--color-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent)]`
      : `${base} bg-[var(--color-primary)] text-white`;
  if (!cta.href)
    return <span className={`${classes} opacity-60 pointer-events-none`}>{cta.label}</span>;
  return (
    <a href={cta.href} target="_blank" rel="noopener noreferrer" className={classes}>
      {cta.label} <span aria-hidden>→</span>
    </a>
  );
}

const toneBadge: Record<Project['badge']['tone'], string> = {
  main: 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white',
  secondary: 'bg-[var(--color-secondary)] text-white',
  amber: 'bg-amber-600 text-white',
  purple: 'bg-purple-500 text-white',
};

function ProjectRow({
  project,
  isOpen,
  onToggle,
}: {
  project: Project;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const primaryTags = project.tags.slice(0, 3);

  return (
    <li className={`relative transition-colors ${isOpen ? 'bg-white' : 'hover:bg-white/60'}`}>
      {isOpen && (
        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-accent)] rounded-r-full" />
      )}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-4 md:px-6 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span
          className={`shrink-0 px-2.5 py-0.5 text-[11px] font-semibold rounded-md ${toneBadge[project.badge.tone]}`}
        >
          {project.badge.text}
        </span>

        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-4 gap-y-1">
          <h3 className="text-base md:text-lg font-bold text-[var(--color-primary)]">
            {project.title}
          </h3>
          <div className="hidden md:flex flex-wrap gap-1.5">
            {primaryTags.map((t) => (
              <span key={t} className="font-mono text-[11px] text-[var(--color-text-muted)]">
                {t}
              </span>
            ))}
            {project.tags.length > primaryTags.length && (
              <span className="font-mono text-[11px] text-[var(--color-text-muted)]/70">
                +{project.tags.length - primaryTags.length}
              </span>
            )}
          </div>
        </div>

        <svg
          className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform spring ${
            isOpen ? 'rotate-180' : ''
          }`}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <CollapsePanel isOpen={isOpen}>
        <div className="px-4 md:px-6 pb-6 pt-1 grid md:grid-cols-[1fr_auto] gap-6 items-start">
          <div className="space-y-4">
            <p className="text-sm md:text-[15px] leading-relaxed text-[var(--color-text)]">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 border border-[var(--color-border)] bg-[var(--color-bg-light)] font-mono text-xs font-medium rounded-md"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap md:flex-col gap-2 md:items-stretch">
            {project.ctas.map((cta) => (
              <Cta key={cta.label} cta={cta} />
            ))}
          </div>
        </div>
      </CollapsePanel>
    </li>
  );
}

function CollapsePanel({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  // isOpen 변경 시: 다음 프레임에 목표 높이로 전환 (현재 상태 페인트 보장)
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      setHeight(isOpen ? el.scrollHeight : 0);
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  // 열린 동안 내부 콘텐츠 크기 변하면 (창 리사이즈 등) 높이 재측정
  useEffect(() => {
    if (!isOpen) return;
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setHeight(el.scrollHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen]);

  return (
    <div
      className="overflow-hidden transition-[height] duration-300 ease-out"
      style={{ height: `${height}px` }}
      aria-hidden={!isOpen}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
}

export default function ProjectsList() {
  const [openSet, setOpenSet] = useState<Set<string>>(new Set());
  const toggle = (slug: string) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const allOpen = openSet.size === projects.length;
  const toggleAll = () => {
    if (allOpen) setOpenSet(new Set());
    else setOpenSet(new Set(projects.map((p) => p.slug)));
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="font-mono text-[11px] font-semibold text-[var(--color-text-muted)] tracking-[0.2em] uppercase">
          {projects.length} Projects
        </p>
        <button
          onClick={toggleAll}
          className="font-mono text-[11px] font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-dark)] tracking-wider uppercase spring"
        >
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      <ul className="bg-white/40 border border-[var(--color-border)] rounded-2xl divide-y divide-[var(--color-border)] overflow-hidden shadow-sm">
        {projects.map((p) => (
          <ProjectRow
            key={p.slug}
            project={p}
            isOpen={openSet.has(p.slug)}
            onToggle={() => toggle(p.slug)}
          />
        ))}
      </ul>
    </>
  );
}

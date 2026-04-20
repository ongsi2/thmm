import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { ReactNode } from 'react';
import type { CaseInfo, Organization } from './cases';
import { organizations } from './cases';

type Locale = 'ko' | 'en';

type HeroProps = {
  organization: Organization;
  category: string;
  title: string;
  subtitle: string;
  meta: { label: string; value: string; hint?: string }[];
  stack: string[];
};

export async function CaseHero({ organization, category, title, subtitle, meta, stack }: HeroProps) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('projects.caseShell');
  const tLabels = await getTranslations('projects.labels');
  const org = organization.i18n[locale];
  return (
    <section className="px-6 pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-light)] via-white to-[var(--color-accent-light)]/20" />
      <div className="absolute top-24 right-[8%] w-72 h-72 rounded-full bg-[var(--color-accent)]/[0.05] blur-3xl" />
      <div className="max-w-4xl mx-auto w-full relative z-10">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)] spring"
        >
          <span aria-hidden>←</span>
          <span>{t('backToAll')}</span>
        </Link>

        <div className="mt-14 mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
          {organization.current && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/25 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
              <span className="text-[10px] font-semibold text-[var(--color-accent-dark)] tracking-[0.15em] uppercase">
                {tLabels('currentBadge')}
              </span>
            </span>
          )}
          <span className="font-semibold text-[var(--color-primary)]">
            {org.system}
          </span>
          <span className="text-[var(--color-border)]" aria-hidden>
            /
          </span>
          <span className="text-[var(--color-text-muted)]">
            {org.company}
          </span>
          <span className="hidden sm:inline text-[var(--color-border)]" aria-hidden>
            ·
          </span>
          <span className="font-mono text-[11px] text-[var(--color-text-muted)]">
            {org.period}
          </span>
        </div>

        <p className="text-xs font-mono font-semibold text-[var(--color-accent)] tracking-[0.2em] uppercase mb-5">
          {category}
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.15] tracking-tight text-[var(--color-primary)] mb-6 text-wrap-balance">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed max-w-3xl">
          {subtitle}
        </p>

        <dl className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--color-border)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          {meta.map((m) => (
            <div key={m.label} className="bg-white p-5">
              <dt className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-[0.15em] uppercase mb-2">
                {m.label}
              </dt>
              <dd className="text-lg font-bold text-[var(--color-primary)] leading-tight">
                {m.value}
              </dd>
              {m.hint && (
                <p className="mt-1.5 text-[11px] text-[var(--color-text-muted)] font-mono leading-relaxed">
                  {m.hint}
                </p>
              )}
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {stack.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 border border-[var(--color-border)] bg-white font-mono text-xs font-medium rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

type SectionProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
  accent?: 'problem' | 'approach' | 'process' | 'outcome';
};

const accentColors = {
  problem: 'bg-rose-500',
  approach: 'bg-[var(--color-secondary)]',
  process: 'bg-amber-500',
  outcome: 'bg-[var(--color-accent)]',
};

export function CaseSection({ eyebrow, title, children, accent = 'problem' }: SectionProps) {
  return (
    <section className="px-6 py-16 md:py-24 border-t border-[var(--color-border)]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className={`w-2 h-2 rounded-full ${accentColors[accent]}`} />
          <p className="text-xs font-mono font-semibold text-[var(--color-text-muted)] tracking-[0.2em] uppercase">
            {eyebrow}
          </p>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-primary)] mb-10 text-wrap-balance">
          {title}
        </h2>
        <div className="space-y-6 text-[var(--color-text)] leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
}

type InsightListProps = {
  items: { title: string; detail?: string }[];
  variant?: 'problem' | 'outcome';
};

export function InsightList({ items, variant = 'problem' }: InsightListProps) {
  const isOutcome = variant === 'outcome';
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li
          key={item.title}
          className={`relative pl-6 py-4 pr-5 rounded-xl border ${
            isOutcome
              ? 'bg-[var(--color-accent)]/[0.04] border-[var(--color-accent)]/25'
              : 'bg-white border-[var(--color-border)]'
          }`}
        >
          <span
            className={`absolute left-3 top-[22px] w-1.5 h-1.5 rounded-full ${
              isOutcome ? 'bg-[var(--color-accent)]' : 'bg-rose-400'
            }`}
          />
          <p className="font-semibold text-[var(--color-primary)] leading-snug">
            {item.title}
          </p>
          {item.detail && (
            <p className="mt-2 text-sm text-[var(--color-text-muted)] leading-relaxed">
              {item.detail}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

type StepsProps = {
  steps: { title: string; body: ReactNode }[];
};

export function ProcessSteps({ steps }: StepsProps) {
  return (
    <ol className="space-y-8">
      {steps.map((step, i) => (
        <li key={step.title} className="grid grid-cols-[auto_1fr] gap-5">
          <div className="flex flex-col items-center">
            <span className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-white font-mono text-sm font-semibold flex items-center justify-center shadow-sm">
              {String(i + 1).padStart(2, '0')}
            </span>
            {i < steps.length - 1 && (
              <span className="flex-1 w-[2px] bg-[var(--color-border)] mt-2 min-h-[2rem]" />
            )}
          </div>
          <div className="pb-2">
            <h3 className="text-xl font-bold text-[var(--color-primary)] mb-3 leading-snug">
              {step.title}
            </h3>
            <div className="text-[var(--color-text-muted)] leading-relaxed space-y-3">
              {step.body}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export async function OtherCases({ current, all }: { current: string; all: CaseInfo[] }) {
  const locale = (await getLocale()) as Locale;
  const others = all.filter((c) => c.slug !== current);
  return (
    <section className="px-6 py-16 md:py-24 border-t border-[var(--color-border)] bg-white">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-mono font-semibold text-[var(--color-text-muted)] tracking-[0.2em] uppercase mb-3">
          MORE
        </p>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-primary)] mb-8">
          다른 케이스 살펴보기
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {others.map((c) => {
            const org = organizations[c.organizationId];
            const orgContent = org.i18n[locale];
            const caseContent = c.i18n[locale];
            return (
              <Link
                key={c.slug}
                href={`/portfolio/${c.slug}`}
                className="group block p-6 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-2xl hover:border-[var(--color-accent)]/40 hover:shadow-md spring"
              >
                <p className="text-[10px] font-mono font-semibold text-[var(--color-text-muted)] tracking-wider uppercase mb-2">
                  {orgContent.system}
                </p>
                <p className="text-[10px] font-mono font-semibold text-[var(--color-accent)] tracking-wider uppercase mb-2">
                  {c.category}
                </p>
                <h3 className="text-lg font-bold text-[var(--color-primary)] mb-2 group-hover:text-[var(--color-accent)] spring">
                  {caseContent.title}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {caseContent.summary}
                </p>
                <span className="inline-flex items-center gap-1 mt-4 text-xs font-mono font-medium text-[var(--color-accent)]">
                  자세히 보기 <span aria-hidden>→</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

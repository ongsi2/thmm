export type PipelineStep = {
  label: string;
  sub?: string;
  tone?: 'neutral' | 'accent' | 'muted';
  badge?: string;
};

export type PipelineGroup = {
  title?: string;
  steps: PipelineStep[];
};

type Props = {
  groups: PipelineGroup[];
};

function StepBox({ step }: { step: PipelineStep }) {
  const tone = step.tone ?? 'neutral';
  const toneClass =
    tone === 'accent'
      ? 'bg-[var(--color-accent-light)] border-[var(--color-accent)]/40 text-[var(--color-primary)]'
      : tone === 'muted'
      ? 'bg-[var(--color-bg-light)] border-[var(--color-border)] text-[var(--color-text-muted)]'
      : 'bg-white border-[var(--color-border)] text-[var(--color-primary)]';
  return (
    <div
      className={`relative flex-1 min-w-[120px] p-3 border rounded-xl text-center shadow-sm ${toneClass}`}
    >
      {step.badge && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full border border-[var(--color-accent)]/30 bg-white text-[9px] font-mono font-semibold text-[var(--color-accent)] tracking-wider uppercase">
          {step.badge}
        </span>
      )}
      <p className="font-semibold text-sm leading-snug">{step.label}</p>
      {step.sub && (
        <p className="mt-1 text-[11px] font-mono text-[var(--color-text-muted)] leading-snug">
          {step.sub}
        </p>
      )}
    </div>
  );
}

function Arrow() {
  return (
    <svg
      className="shrink-0 w-5 h-5 text-[var(--color-text-muted)] rotate-90 md:rotate-0"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M2 8h11M10 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Pipeline({ groups }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {groups.map((group, gi) => (
        <div key={gi} className="space-y-3">
          {group.title && (
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
              <p className="font-mono text-[10px] font-semibold text-[var(--color-text-muted)] tracking-[0.2em] uppercase">
                {group.title}
              </p>
            </div>
          )}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {group.steps.map((step, si) => (
              <div key={si} className="flex md:flex-1 flex-col md:flex-row items-center gap-3">
                <StepBox step={step} />
                {si < group.steps.length - 1 && <Arrow />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

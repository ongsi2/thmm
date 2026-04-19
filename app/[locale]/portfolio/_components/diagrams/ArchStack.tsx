export type ArchBox = {
  title: string;
  subtitle?: string;
  bullets?: string[];
  tone?: 'neutral' | 'danger' | 'accent';
};

export type ArchEdge = { label?: string };

type Props = {
  boxes: ArchBox[];
  edges?: ArchEdge[];
};

export function ArchStack({ boxes, edges = [] }: Props) {
  const toneClass = (t: ArchBox['tone']) => {
    if (t === 'danger') return 'bg-rose-50 border-rose-200 text-rose-950';
    if (t === 'accent')
      return 'bg-[var(--color-accent-light)] border-[var(--color-accent)]/30 text-[var(--color-primary)]';
    return 'bg-white border-[var(--color-border)] text-[var(--color-primary)]';
  };

  return (
    <div className="flex flex-col items-stretch gap-0">
      {boxes.map((box, i) => (
        <div key={i} className="flex flex-col items-stretch">
          <div className={`border rounded-xl p-4 text-center shadow-sm ${toneClass(box.tone)}`}>
            <p className="font-bold leading-snug">{box.title}</p>
            {box.subtitle && (
              <p className="text-[11px] font-mono text-[var(--color-text-muted)] mt-1">
                {box.subtitle}
              </p>
            )}
            {box.bullets && (
              <ul className="mt-3 space-y-1 text-xs text-left inline-block">
                {box.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-[6px] w-1 h-1 rounded-full bg-current opacity-70 flex-shrink-0" />
                    <span className="leading-snug">{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {i < boxes.length - 1 && (
            <div className="flex flex-col items-center py-3">
              <span className="w-[2px] h-5 bg-[var(--color-border)]" />
              {edges[i]?.label && (
                <span className="mt-1 mb-1 px-2 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded">
                  {edges[i].label}
                </span>
              )}
              <span className="w-[2px] h-5 bg-[var(--color-border)]" />
              <svg className="w-4 h-4 text-[var(--color-text-muted)]" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M8 2v11M8 13l-4-4M8 13l4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

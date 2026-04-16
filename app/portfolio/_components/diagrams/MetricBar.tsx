export type MetricRow = {
  label: string;
  value: number;
  display: string;
  tone?: 'neutral' | 'danger' | 'accent';
};

type Props = {
  rows: MetricRow[];
  caption?: string;
  unit?: string;
};

export function MetricBar({ rows, caption, unit }: Props) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="p-6 bg-white border border-[var(--color-border)] rounded-2xl shadow-sm">
      {caption && (
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--color-border)]">
          <p className="font-mono text-[11px] font-semibold text-[var(--color-text-muted)] tracking-[0.2em] uppercase">
            {caption}
          </p>
          {unit && (
            <p className="font-mono text-[11px] text-[var(--color-text-muted)]">{unit}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {rows.map((row) => {
          const pct = (row.value / max) * 100;
          const tone = row.tone ?? 'neutral';
          const barClass =
            tone === 'danger'
              ? 'bg-rose-400'
              : tone === 'accent'
              ? 'bg-[var(--color-accent)]'
              : 'bg-[var(--color-text-muted)]';
          const valueClass =
            tone === 'danger'
              ? 'text-rose-600'
              : tone === 'accent'
              ? 'text-[var(--color-accent-dark)]'
              : 'text-[var(--color-primary)]';
          return (
            <div key={row.label}>
              <div className="flex items-baseline justify-between mb-1.5">
                <p className="font-mono text-xs font-semibold text-[var(--color-text-muted)] tracking-wider uppercase">
                  {row.label}
                </p>
                <p className={`font-bold font-mono text-sm ${valueClass}`}>{row.display}</p>
              </div>
              <div className="relative h-2.5 rounded-full bg-[var(--color-bg-light)] overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full ${barClass}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

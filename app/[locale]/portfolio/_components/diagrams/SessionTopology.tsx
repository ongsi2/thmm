type Variant = 'before' | 'after';

type Props = {
  variant: Variant;
  wasNames?: string[];
};

export function SessionTopology({ variant, wasNames = ['WAS 1', 'WAS 2', 'WAS 3'] }: Props) {
  const isBefore = variant === 'before';
  const accent = isBefore
    ? 'text-rose-600 border-rose-200'
    : 'text-[var(--color-accent)] border-[var(--color-accent)]/30';
  const label = isBefore ? 'BEFORE' : 'AFTER';
  const caption = isBefore ? '세션 격리 · 재기동 시 유실' : '세션 공유 · 무중단 재기동';

  return (
    <div className={`p-6 bg-white border rounded-2xl shadow-sm ${accent}`}>
      <div className={`flex items-center justify-between mb-5 pb-3 border-b ${isBefore ? 'border-rose-100' : 'border-[var(--color-accent)]/20'}`}>
        <p className={`font-mono text-[11px] font-semibold tracking-[0.2em] ${isBefore ? 'text-rose-600' : 'text-[var(--color-accent)]'}`}>
          {label}
        </p>
        <p className={`font-mono text-[11px] ${isBefore ? 'text-rose-400' : 'text-[var(--color-accent-dark)]'}`}>
          {caption}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {wasNames.map((n) => (
          <div
            key={n}
            className={`p-3 rounded-lg text-center ${
              isBefore
                ? 'bg-rose-50 border border-rose-200'
                : 'bg-white border border-[var(--color-border)]'
            }`}
          >
            <p className="font-bold text-[var(--color-primary)] text-sm leading-tight">{n}</p>
            {isBefore && (
              <div className="mt-2 px-1.5 py-0.5 rounded border border-rose-200 bg-white text-[10px] font-mono text-rose-600">
                session
              </div>
            )}
          </div>
        ))}
      </div>

      {isBefore ? (
        <p className="mt-5 text-center text-xs text-rose-600">
          ✕ WAS 간 세션 공유 없음
        </p>
      ) : (
        <>
          <svg
            className="w-full my-1 text-[var(--color-accent)]"
            height="40"
            viewBox="0 0 300 40"
            preserveAspectRatio="none"
            aria-hidden
          >
            <line x1="50" y1="0" x2="50" y2="18" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <line x1="150" y1="0" x2="150" y2="18" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <line x1="250" y1="0" x2="250" y2="18" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <line x1="50" y1="18" x2="250" y2="18" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <line x1="150" y1="18" x2="150" y2="34" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <polyline
              points="144,30 150,38 156,30"
              stroke="currentColor"
              fill="none"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="p-4 rounded-lg bg-[var(--color-accent-light)] border border-[var(--color-accent)]/30 text-center">
            <p className="font-bold text-[var(--color-primary)]">Redis</p>
            <p className="text-[10px] font-mono text-[var(--color-accent-dark)] mt-1 tracking-wider">
              SHARED SESSION STORE
            </p>
          </div>
        </>
      )}
    </div>
  );
}

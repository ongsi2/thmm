export type SsoFlowStep = {
  direction: 'forward' | 'backward' | 'internal-right';
  label: string;
  sub?: string;
  note?: string;
};

type Props = {
  actorLeft: string;
  actorLeftRole?: string;
  actorRight: string;
  actorRightRole?: string;
  steps: SsoFlowStep[];
};

function Arrow({ direction }: { direction: SsoFlowStep['direction'] }) {
  if (direction === 'internal-right') {
    return (
      <svg className="w-4 h-4 text-[var(--color-accent)]" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="3" fill="currentColor" opacity="0.2" />
        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      </svg>
    );
  }
  const flip = direction === 'backward';
  return (
    <svg
      className={`w-full h-4 text-[var(--color-primary)] ${flip ? 'rotate-180' : ''}`}
      viewBox="0 0 80 16"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line x1="0" y1="8" x2="74" y2="8" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <polyline
        points="68,4 76,8 68,12"
        stroke="currentColor"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function SsoFlow({ actorLeft, actorLeftRole, actorRight, actorRightRole, steps }: Props) {
  return (
    <div className="p-6 bg-white border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-[1fr_80px_1fr] gap-3 pb-4 border-b border-[var(--color-border)]">
        <div className="p-3 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-xl text-center">
          {actorLeftRole && (
            <p className="font-mono text-[10px] font-semibold text-[var(--color-text-muted)] tracking-[0.2em] uppercase mb-1">
              {actorLeftRole}
            </p>
          )}
          <p className="font-bold text-[var(--color-primary)]">{actorLeft}</p>
        </div>
        <div />
        <div className="p-3 bg-[var(--color-accent-light)] border border-[var(--color-accent)]/30 rounded-xl text-center">
          {actorRightRole && (
            <p className="font-mono text-[10px] font-semibold text-[var(--color-accent)] tracking-[0.2em] uppercase mb-1">
              {actorRightRole}
            </p>
          )}
          <p className="font-bold text-[var(--color-primary)]">{actorRight}</p>
        </div>
      </div>

      <ol className="divide-y divide-[var(--color-border)]">
        {steps.map((step, i) => {
          const num = i + 1;
          const fromLeft = step.direction === 'forward';
          const fromRight = step.direction === 'backward';
          const internal = step.direction === 'internal-right';

          return (
            <li key={i} className="grid grid-cols-[1fr_80px_1fr] gap-3 items-center py-4">
              {/* Left cell */}
              {fromLeft ? (
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-primary)] text-white font-mono text-[10px] font-semibold shrink-0">
                      {num}
                    </span>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-[var(--color-primary)] leading-tight">
                        {step.label}
                      </p>
                      {step.sub && (
                        <p className="font-mono text-[11px] text-[var(--color-text-muted)] leading-tight mt-0.5">
                          {step.sub}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div />
              )}

              {/* Middle arrow */}
              <div className="flex flex-col items-center gap-1">
                {internal ? (
                  <Arrow direction="internal-right" />
                ) : (
                  <Arrow direction={step.direction} />
                )}
              </div>

              {/* Right cell */}
              {fromRight ? (
                <div className="text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--color-accent-light)] border border-[var(--color-accent)]/30 rounded-lg">
                    <div className="text-left">
                      <p className="font-semibold text-sm text-[var(--color-primary)] leading-tight">
                        {step.label}
                      </p>
                      {step.sub && (
                        <p className="font-mono text-[11px] text-[var(--color-text-muted)] leading-tight mt-0.5">
                          {step.sub}
                        </p>
                      )}
                    </div>
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-accent)] text-white font-mono text-[10px] font-semibold shrink-0">
                      {num}
                    </span>
                  </div>
                </div>
              ) : internal ? (
                <div className="text-left">
                  <div className="inline-flex items-start gap-2 px-3 py-2 bg-white border border-dashed border-[var(--color-accent)]/40 rounded-lg">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent-dark)] font-mono text-[10px] font-semibold shrink-0 border border-[var(--color-accent)]/40">
                      {num}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-[var(--color-primary)] leading-tight">
                        {step.label}
                      </p>
                      {step.sub && (
                        <p className="font-mono text-[11px] text-[var(--color-text-muted)] leading-tight mt-0.5">
                          {step.sub}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

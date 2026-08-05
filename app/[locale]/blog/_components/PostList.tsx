'use client';

import { useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { PostMeta, PostType } from '@/lib/posts';

type Filter = 'all' | PostType;

const typeBadge: Record<PostType, { label: string; className: string }> = {
  note: {
    label: 'NOTE',
    className: 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] border-[var(--color-accent)]/30',
  },
  link: {
    label: 'MEMO',
    className: 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border-[var(--color-secondary)]/30',
  },
};

function formatDate(date: string) {
  const [y, m, d] = date.split('-');
  return `${y}.${m}.${d}`;
}

export default function PostList({
  posts,
  labels,
}: {
  posts: PostMeta[];
  labels: { all: string; note: string; link: string; empty: string; readingSuffix: string };
}) {
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(
    () => ({
      all: posts.length,
      note: posts.filter((p) => p.type === 'note').length,
      link: posts.filter((p) => p.type === 'link').length,
    }),
    [posts]
  );

  const visible = filter === 'all' ? posts : posts.filter((p) => p.type === filter);

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: labels.all },
    { key: 'note', label: labels.note },
    { key: 'link', label: labels.link },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-8" role="tablist" aria-label={labels.all}>
        {tabs.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-full border font-mono text-xs font-semibold tracking-wider spring ${
                active
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'bg-white text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:text-[var(--color-primary)]'
              }`}
            >
              {tab.label}
              <span className={active ? 'ml-1.5 opacity-70' : 'ml-1.5 opacity-50'}>
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-[var(--color-text-muted)]">{labels.empty}</p>
      ) : (
        <ul className="space-y-4">
          {visible.map((post) => {
            const badge = typeBadge[post.type];
            return (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block bg-white border border-[var(--color-border)] rounded-2xl p-6 md:p-7 hover:border-[var(--color-accent)]/50 hover:shadow-lg shadow-black/5 spring"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
                    <span
                      className={`px-2 py-0.5 border rounded-md font-mono text-[10px] font-semibold tracking-[0.15em] ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    <time
                      dateTime={post.date}
                      className="font-mono text-xs text-[var(--color-text-muted)]"
                    >
                      {formatDate(post.date)}
                    </time>
                    <span className="text-[var(--color-border)]" aria-hidden>
                      ·
                    </span>
                    <span className="font-mono text-xs text-[var(--color-text-muted)]">
                      {post.readingMinutes}
                      {labels.readingSuffix}
                    </span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-[var(--color-primary)] leading-snug mb-2 group-hover:text-[var(--color-accent)] spring text-wrap-balance">
                    {post.title}
                  </h2>
                  <p className="text-sm md:text-[15px] text-[var(--color-text-muted)] leading-relaxed mb-4">
                    {post.summary}
                  </p>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 border border-[var(--color-border)] bg-[var(--color-bg-light)] font-mono text-[11px] text-[var(--color-text-muted)] rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

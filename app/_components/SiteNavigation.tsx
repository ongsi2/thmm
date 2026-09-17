'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useLocale } from 'next-intl';

/** A disclosure navigation, not a modal: Tab can continue into the page. */
export default function SiteNavigation({ logo, children }: { logo: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const korean = useLocale() === 'ko';

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !navRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  return (
    <nav
      ref={navRef}
      aria-label={korean ? '주 메뉴' : 'Main navigation'}
      className="fixed inset-x-0 top-0 z-50 max-h-[100dvh] overflow-y-auto border-b border-black/[0.06] bg-white/95 backdrop-blur-xl lg:overflow-visible lg:bg-white/70"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          setOpen(false);
          toggleRef.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 px-6 py-3 lg:flex-nowrap lg:py-4 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-emerald-700">
        <div className="shrink-0" onClick={() => setOpen(false)}>{logo}</div>
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 text-sm font-semibold text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 lg:hidden"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d={open ? 'M5 5l10 10M15 5L5 15' : 'M3 5h14M3 10h14M3 15h14'} />
          </svg>
          {korean ? (open ? '메뉴 닫기' : '메뉴') : (open ? 'Close menu' : 'Menu')}
        </button>
        <div
          id={panelId}
          className={`${open ? 'flex' : 'hidden'} mt-3 w-full flex-col items-start gap-1 border-t border-[var(--color-border)] pt-3 text-sm font-medium lg:mt-0 lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-6 lg:border-0 lg:pt-0 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center lg:[&_a]:min-h-0`}
          onClick={(event) => {
            if (event.target instanceof Element && event.target.closest('a')) setOpen(false);
          }}
        >
          {children}
        </div>
      </div>
    </nav>
  );
}

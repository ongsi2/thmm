'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

const LOCALES = [
  { code: 'ko' as const, label: 'KO', aria: '한국어로 보기' },
  { code: 'en' as const, label: 'EN', aria: 'View in English' },
];

export default function LanguageToggle() {
  const currentLocale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="text-[var(--color-border)]">│</span>
      {LOCALES.map((loc) => {
        const isActive = loc.code === currentLocale;
        return (
          <Link
            key={loc.code}
            href={pathname}
            locale={loc.code}
            aria-label={loc.aria}
            aria-current={isActive ? 'true' : undefined}
            hrefLang={loc.code}
            className={`relative py-1 spring text-sm font-semibold ${
              isActive
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'
            }`}
          >
            {loc.label}
          </Link>
        );
      })}
    </div>
  );
}

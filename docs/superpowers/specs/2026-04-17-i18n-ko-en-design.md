# Design: Korean/English Bilingual Support (`/` + `/en`)

**Date:** 2026-04-17
**Branch:** `feat/i18n-en`
**Status:** Approved — ready for implementation plan

## Goal

Add English (`/en`) alongside existing Korean (`/`) across the entire portfolio site — main page, projects list, and all 8 case studies — so overseas recruiters and clients can read the same content in English via a clearly-shareable URL.

Korean remains the default at `/` with no redirect; English lives under the `/en` prefix. A `KO / EN` toggle in the top nav switches between the current page's locales.

## Non-Goals (YAGNI)

- Third-language support (ja, zh, etc.) — leave room structurally but do not build.
- Browser-language auto-detection / geolocation redirects.
- Cookie or localStorage persistence of language choice — URL is the only state.
- Locale-specific date/number formatting — current content has at most "year · months," hardcoded strings are fine.
- RTL support.
- Translation management systems (Crowdin, Lokalise) — 8 case studies do not warrant it.
- Refactoring existing Korean case study prose — translation scope only.

## Architecture

### Routing strategy

`next-intl` with **as-needed locale prefix**:
- `ko` is the default locale and has **no URL prefix** — preserves existing SEO / backlinks on `thmm.kr/`.
- `en` is the only prefixed locale.

| URL | Content |
| --- | --- |
| `/` | Korean home |
| `/en` | English home |
| `/portfolio/cicd` | Korean CI/CD case study |
| `/en/portfolio/cicd` | English CI/CD case study |

### File layout

```
app/
├── [locale]/              # new segment — all pages move under here
│   ├── layout.tsx
│   ├── page.tsx           # home (uses JSON messages)
│   ├── portfolio/
│   │   ├── page.tsx       # index (uses JSON messages)
│   │   ├── cicd/
│   │   │   ├── page.tsx          # thin wrapper, branches on locale
│   │   │   ├── content.ko.tsx    # existing Korean body
│   │   │   └── content.en.tsx    # new English body
│   │   ├── grandbaie/ (same pattern)
│   │   ├── log-viewer/
│   │   ├── ohmybaby/
│   │   ├── redis-session/
│   │   ├── sso-provider/
│   │   ├── techtrade-migration/
│   │   └── tls-upgrade/
│   └── demo/...
├── _components/           # locale-agnostic shared components
├── globals.css
└── sitemap.ts             # updated to emit both ko and en URLs with alternates

middleware.ts              # next-intl middleware (as-needed prefix)
i18n/
├── request.ts             # getRequestConfig — loads messages per locale
└── routing.ts             # defineRouting — locales=['ko','en'], defaultLocale='ko'
messages/
├── ko.json
└── en.json
```

### Content split (hybrid)

**In `messages/{ko,en}.json`** (structural / short strings):
- Navigation labels (`Home`, `Experience`, `Projects`, `About`, `Case Studies`, `KO`, `EN`)
- Hero section (eyebrow, headline, paragraphs, CTA buttons)
- Experience section — all 5 company cards (names, tenure, role, bullets, tech tags)
- About section — philosophy bullets, checklist items, tech-stack card labels, contact block
- Footer
- `ProjectsList` card titles / descriptions / tags
- Portfolio index page prose
- Shared case-study labels (`재직중`, `Problem`, `Solution`, `Outcome`, section headers, etc.)

**In per-locale JSX files** (long-form prose mixed with code/diagrams):
- Each of the 8 case-study bodies: `content.ko.tsx` and `content.en.tsx`.
- Each case study's `page.tsx` is a thin wrapper that imports the right content file based on `locale` param.
- Diagrams, code blocks, and structural JSX components are shared; only the prose differs.

### Language toggle UI

- **Location:** top nav, to the right of the existing `Case Studies` link, separated by a vertical divider.
- **Visual:** `│  KO  EN` — plain text toggle.
  - Active locale: `text-[var(--color-accent)]` + semibold.
  - Inactive locale: `text-[var(--color-text-muted)]`, hover to `text-[var(--color-primary)]` with existing `spring` transition.
- **Mobile:** shown as-is. Two 2-char labels fit without layout issues.
- **Accessibility:**
  - `aria-label="한국어로 보기"` / `"View in English"` on each link.
  - Active link has `aria-current="true"`.
  - Include `hreflang="ko"` / `hreflang="en"` on anchors.
- **Behavior:**
  - Implemented with `next-intl`'s `Link` + `useLocale()` / `usePathname()`.
  - Clicking the other locale keeps the current pathname and swaps only the locale segment (e.g. `/portfolio/cicd` ↔ `/en/portfolio/cicd`).
  - No cookie, no localStorage — URL is the only state.

## SEO

### Metadata (`generateMetadata` per route)

Each page returns locale-aware metadata:

```ts
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.<page>' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: locale === 'ko' ? '/<path>' : `/${locale}/<path>`,
      languages: {
        'ko-KR': '/<path>',
        'en-US': `/en/<path>`,
        'x-default': '/<path>',
      },
    },
    openGraph: {
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      alternateLocale: locale === 'ko' ? 'en_US' : 'ko_KR',
      title: t('title'),
      description: t('description'),
    },
  };
}
```

- `x-default` points to Korean (primary market).
- `alternates.languages` produces `hreflang` links automatically.

### Sitemap (`app/sitemap.ts`)

Regenerate to emit every page twice (once per locale) with `alternates.languages` linking them:

```ts
{ url: '/', lastModified: ..., alternates: { languages: { en: '/en' } } }
{ url: '/portfolio/cicd', ..., alternates: { languages: { en: '/en/portfolio/cicd' } } }
// ... all pages × 2 locales
```

### `<html lang>`

Set dynamically in `[locale]/layout.tsx`: `<html lang={locale}>`. Consumed by screen readers, translation tools, and crawlers.

### Robots / indexing

- `robots.txt`: unchanged.
- No `noindex` — ship English only after all pages are translated.

## Translation Approach

### Principles

- **Tone:** formal, professional — target reader is an overseas recruiter or client.
- **Institution names:** use the official English name, with Korean (and romanized acronym if applicable) in parentheses on first mention.
  - e.g. `Korea Institute of Marine Science & Technology Promotion (해양수산과학기술진흥원, KIMST)`
  - e.g. `Korea Press Foundation (한국언론진흥재단, KPF)`
- **Product / domain terms:** keep original + brief gloss on first mention.
  - e.g. `Badabom — KIMST's marine R&D knowledge portal`
  - e.g. `GAIS (Government Advertising Integrated Support System)`
- **Technical terms:** unchanged — `SSO`, `CI/CD`, `Jenkins`, etc.

### Cross-validation workflow

For each long-form section (case study body, experience bullet, about paragraph):

1. Read the Korean source section and extract intent.
2. Draft English prose.
3. Mentally back-translate (en → ko) and compare against the original for drift.
4. Verify factual content is preserved: numbers, technology names, causal relationships, outcomes.
5. Flag anything ambiguous in the Korean source for user clarification rather than guessing.

### Review cadence

- **Infrastructure commit (scaffolding):** land first, no translations yet.
- **Main-page translation:** one pass → user review.
- **Case studies:** one case per commit → user review after each, before moving to the next. This prevents cascading terminology inconsistencies across 8 long files.

### Deployment strategy

- Do not ship partially translated English until all 8 case studies + main page are done.
- If a placeholder is needed mid-work, prefer disabling the `/en` route in middleware over showing half-Korean English pages.

## Git Strategy

- **Branch:** `feat/i18n-en` (already created off `main`).
- **`main` is untouched** throughout the work — user can `git checkout main` at any moment to return to the current production state.
- **Commit granularity:**
  1. `chore(i18n): scaffold next-intl with [locale] routing`
  2. `feat(i18n): translate nav + hero section to English`
  3. `feat(i18n): translate experience section`
  4. `feat(i18n): translate about + footer`
  5. `feat(i18n): translate projects list + portfolio index`
  6. `feat(i18n): translate <case-study> to English` — one commit per case study (×8)
  7. `feat(i18n): add sitemap + hreflang metadata`
  8. `docs(i18n): update README with i18n notes` (if warranted)
- **Rules:**
  - Every commit must pass `tsc` and `next build` locally.
  - No force push, no amend, no rebase of shared history.
  - No direct commits to `main`.
  - No merging `main` into `feat/i18n-en` without explicit user approval (only when conflict resolution is necessary).
- **Rollback paths:**
  - Full revert: `git checkout main` — instant return to current state.
  - Partial: `git revert <sha>` on any specific commit (granularity above makes this feasible).
- **Remote:** push to `origin/feat/i18n-en` only when the user wants an off-machine backup. Not required for work to proceed.

## Open Risks / Things to Watch

- **`'use client'` in existing `app/page.tsx`:** current home is a client component because of scroll observers and active-section state. `next-intl` supports both server and client translation; the home page will keep its client behavior but consume translations via `useTranslations`. Verify during scaffolding that client-side message delivery works without hydration warnings.
- **Case study page sizes vary widely** (222 → 469 lines). The larger ones (`log-viewer`, `techtrade-migration`) will need careful sectional review to keep narrative flow.
- **Proper noun consistency across case studies:** the first-mention-gloss rule needs to be tracked — a case study may be the user's entry point, so each study gets its own first mention of shared institutions. Maintain a small glossary in this spec's sibling (or in the plan) as translations progress.
- **Existing copy may have implicit subjects / omitted connectives** (Korean style) that require adding explicit subjects in English. Flag cases where meaning is genuinely ambiguous rather than guessing.

## Success Criteria

- All existing Korean pages load unchanged at their current URLs (`/`, `/portfolio/*`, `/demo/*`).
- Every Korean page has a matching English page at `/en/...` with faithful, professional-tone translation.
- `hreflang` tags present on all pages, sitemap lists both locales, `<html lang>` is correct per page.
- Language toggle in nav switches between the two without losing the current pathname.
- Lighthouse / DOM inspection shows no console errors, no hydration mismatches, no broken links between locales.
- `main` branch is unchanged throughout the work; `git checkout main` returns to the exact current production state.

# 설계 문서: 한국어/영어 이중 언어 지원 (`/` + `/en`)

**작성일:** 2026-04-17
**브랜치:** `feat/i18n-en`
**상태:** 승인 완료 — 구현 계획 수립 단계로 진행

## 목표

기존 한국어(`/`) 사이트 전체 — 메인 페이지, 프로젝트 리스트, 8개 케이스 스터디 — 에 영문판(`/en`)을 추가한다. 해외 채용담당자와 클라이언트가 공유 가능한 고유 URL로 동일 콘텐츠를 영어로 읽을 수 있게 한다.

한국어는 `/` 기본 locale 로 **리다이렉트 없이** 유지, 영어는 `/en` prefix 아래 배치. 상단 네비의 `KO / EN` 토글로 현재 페이지의 locale 을 전환한다.

## Non-Goals (YAGNI)

- 3번째 언어 지원(일본어·중국어 등) — 구조적으로 확장 여지는 두되 지금 구현하지 않음.
- 브라우저 언어 자동 감지 / 지역 기반 리다이렉트.
- 쿠키 · localStorage 로 언어 선택 기억 — URL 자체가 유일한 상태.
- locale 별 날짜 · 숫자 포맷팅 — 현재 콘텐츠는 "연도 · 개월" 수준이라 하드코딩으로 충분.
- RTL 대응.
- 번역 관리 시스템(Crowdin, Lokalise) 도입 — 8개 케이스 규모로는 과잉.
- 기존 한국어 케이스 스터디 본문 개선 · 리팩터 — 번역 스코프 외.

## 아키텍처

### 라우팅 전략

`next-intl` 의 **as-needed locale prefix** 모드:
- `ko` 가 기본 locale 이며 **URL prefix 없음** — 기존 `thmm.kr/` 색인 · 백링크 SEO 그대로 유지.
- `en` 만 prefix 붙는 유일한 locale.

| URL | 콘텐츠 |
| --- | --- |
| `/` | 한국어 홈 |
| `/en` | 영문 홈 |
| `/portfolio/cicd` | 한국어 CI/CD 케이스 스터디 |
| `/en/portfolio/cicd` | 영문 CI/CD 케이스 스터디 |

### 파일 구조

```
app/
├── [locale]/              # 신규 세그먼트 — 모든 페이지를 이 아래로 이동
│   ├── layout.tsx
│   ├── page.tsx           # 홈 (JSON messages 사용)
│   ├── portfolio/
│   │   ├── page.tsx       # 인덱스 (JSON messages 사용)
│   │   ├── cicd/
│   │   │   ├── page.tsx          # locale 로 분기하는 얇은 래퍼
│   │   │   ├── content.ko.tsx    # 기존 한국어 본문
│   │   │   └── content.en.tsx    # 신규 영문 본문
│   │   ├── grandbaie/ (동일 패턴)
│   │   ├── log-viewer/
│   │   ├── ohmybaby/
│   │   ├── redis-session/
│   │   ├── sso-provider/
│   │   ├── techtrade-migration/
│   │   └── tls-upgrade/
│   └── demo/...
├── _components/           # locale 무관 공용 컴포넌트
├── globals.css
└── sitemap.ts             # 한/영 URL 모두 발행 + alternates 연결

proxy.ts                   # next-intl 미들웨어 (Next.js 16에서 middleware.ts → proxy.ts 로 변경)
i18n/
├── request.ts             # getRequestConfig — locale별 messages 로드
└── routing.ts             # defineRouting — locales=['ko','en'], defaultLocale='ko'
messages/
├── ko.json
└── en.json
```

### 콘텐츠 분리 (하이브리드)

**`messages/{ko,en}.json` 에 넣을 것** (구조적 · 짧은 문구):
- 네비게이션 라벨 (`Home`, `Experience`, `Projects`, `About`, `Case Studies`, `KO`, `EN`)
- Hero 섹션 (eyebrow, 헤드라인, 문단, CTA 버튼)
- Experience 섹션 — 5개 회사 카드 전체 (회사명, 기간, 역할, 불릿, 기술태그)
- About 섹션 — 철학 불릿, 체크리스트, Tech Stack 카드 라벨, 연락처 블록
- Footer
- `ProjectsList` 카드 제목 · 설명 · 태그
- 포트폴리오 인덱스 페이지 문구
- 케이스 스터디 공용 라벨 (`재직중`, `Problem`, `Solution`, `Outcome`, 섹션 헤더 등)

**locale 별 JSX 파일에 넣을 것** (긴 산문 + 코드 · 다이어그램 혼재):
- 8개 케이스 스터디 본문: 각각 `content.ko.tsx` / `content.en.tsx` 파일로 분리.
- 각 케이스의 `page.tsx` 는 `locale` 파라미터에 따라 해당 content 파일을 임포트하는 얇은 래퍼.
- 다이어그램, 코드 블록, 구조 JSX 컴포넌트는 양측에서 공유 — 산문만 locale 별로 다름.

### 언어 전환 UI

- **위치**: 상단 네비의 기존 `Case Studies` 링크 오른쪽, 수직 구분선으로 시각적 분리.
- **시각**: `│  KO  EN` — 텍스트 토글.
  - 활성 locale: `text-[var(--color-accent)]` + semibold.
  - 비활성 locale: `text-[var(--color-text-muted)]`, 호버 시 `text-[var(--color-primary)]` + 기존 `spring` 트랜지션.
- **모바일**: 그대로 노출. 2글자 라벨 두 개는 공간 문제 없음.
- **접근성**:
  - 각 링크에 `aria-label="한국어로 보기"` / `"View in English"`.
  - 활성 링크는 `aria-current="true"`.
  - 앵커에 `hreflang="ko"` / `hreflang="en"` 속성.
- **동작**:
  - `next-intl` 의 `Link` + `useLocale()` / `usePathname()` 조합으로 구현.
  - 다른 locale 클릭 시 현재 pathname 유지하면서 locale 세그먼트만 교체 (예: `/portfolio/cicd` ↔ `/en/portfolio/cicd`).
  - 쿠키 · localStorage 없음 — URL 이 유일한 상태.

## SEO

### 메타데이터 (라우트별 `generateMetadata`)

각 페이지에서 locale-aware 메타데이터 반환:

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

- `x-default` 는 한국어로 (주 시장이 한국).
- `alternates.languages` 가 `hreflang` 링크를 자동 생성.

### Sitemap (`app/sitemap.ts`)

모든 페이지를 locale 당 한 번씩(총 2회) 발행, `alternates.languages` 로 양측 연결:

```ts
{ url: '/', lastModified: ..., alternates: { languages: { en: '/en' } } }
{ url: '/portfolio/cicd', ..., alternates: { languages: { en: '/en/portfolio/cicd' } } }
// ... 전체 페이지 × 2 locale
```

### `<html lang>`

`[locale]/layout.tsx` 에서 동적 설정: `<html lang={locale}>`. 스크린리더, 번역 도구, 검색 크롤러가 모두 사용.

### Robots / 색인

- `robots.txt`: 변경 없음.
- `noindex` 사용 안 함 — 모든 페이지 번역 완료 후에만 영문판 배포.

## 번역 방침

### 원칙

- **톤**: 격식 있는 프로페셔널 톤 — 독자는 해외 채용담당자 · 클라이언트 가정.
- **기관명**: 공식 영문명 사용 + 첫 등장 시 괄호로 한국어(및 약자) 병기.
  - 예: `Korea Institute of Marine Science & Technology Promotion (해양수산과학기술진흥원, KIMST)`
  - 예: `Korea Press Foundation (한국언론진흥재단, KPF)`
- **제품 · 도메인 용어**: 원어 유지 + 첫 등장 시 간단한 영문 설명.
  - 예: `Badabom — KIMST's marine R&D knowledge portal`
  - 예: `GAIS (Government Advertising Integrated Support System)`
- **기술 용어**: 변경 없음 — `SSO`, `CI/CD`, `Jenkins` 등.

### 교차 검증 워크플로우

긴 산문 섹션(케이스 스터디 본문, Experience 불릿, About 문단)마다:

1. 한국어 원문 섹션 읽고 의도 추출.
2. 영문 초안 작성.
3. 역번역(en → ko) 으로 원문과 비교해 의미 drift 확인.
4. 사실 관계 보존 확인: 수치, 기술명, 인과관계, 결과.
5. 한국어 원문이 모호한 지점은 추측하지 않고 사용자에게 확인 요청.

### 리뷰 주기

- **인프라 커밋 (scaffolding)**: 번역 없이 먼저 랜딩.
- **메인 페이지 번역**: 1회 작업 → 사용자 리뷰.
- **케이스 스터디**: 케이스당 커밋 하나 → 다음 케이스 들어가기 전 사용자 리뷰. 8개 장문 파일에 걸쳐 용어 일관성 문제가 누적되는 것을 방지.

### 배포 전략

- 8개 케이스 스터디 + 메인 페이지 번역이 모두 완료되기 전엔 영문판 배포하지 않음.
- 작업 도중 placeholder 가 필요하면 반쪽 영문 페이지를 노출하지 말고 미들웨어에서 `/en` 라우트 자체를 비활성화.

## Git 전략

- **브랜치**: `feat/i18n-en` (이미 `main` 에서 분기 생성됨).
- **`main` 은 작업 내내 건드리지 않음** — 언제든 `git checkout main` 으로 현재 운영 상태 즉시 복귀 가능.
- **커밋 단위**:
  1. `chore(i18n): scaffold next-intl with [locale] routing`
  2. `feat(i18n): translate nav + hero section to English`
  3. `feat(i18n): translate experience section`
  4. `feat(i18n): translate about + footer`
  5. `feat(i18n): translate projects list + portfolio index`
  6. `feat(i18n): translate <case-study> to English` — 케이스당 커밋 하나 (×8)
  7. `feat(i18n): add sitemap + hreflang metadata`
  8. `docs(i18n): update README with i18n notes` (필요 시)
- **규칙**:
  - 모든 커밋은 `tsc` + `next build` 통과 상태에서만 생성.
  - force push, amend, 공유된 히스토리 rebase 금지.
  - `main` 직접 커밋 금지.
  - 명시적 승인 없이 `main` 을 `feat/i18n-en` 에 merge 금지 (충돌 해결이 필요한 순간에만).
- **롤백 경로**:
  - 전체 되돌리기: `git checkout main` — 즉시 현재 상태 복귀.
  - 부분: 특정 커밋에 대해 `git revert <sha>` (위 커밋 단위가 세분화되어 있어 실용적).
- **원격**: `origin/feat/i18n-en` 푸시는 사용자가 오프머신 백업을 원할 때만. 작업 진행에 필수 아님.

## 열린 리스크 / 주의점

- **기존 `app/page.tsx` 의 `'use client'`**: 현재 홈은 스크롤 옵저버 · 활성 섹션 state 때문에 클라이언트 컴포넌트. `next-intl` 은 서버·클라이언트 번역 모두 지원하므로 홈은 `useTranslations` 를 사용하며 기존 클라이언트 동작 유지. 스캐폴딩 단계에서 hydration 경고 없이 클라이언트 메시지 전달이 잘 되는지 검증 필요.
- **케이스 스터디 크기 편차가 큼** (222 ~ 469 줄). 큰 쪽(`log-viewer`, `techtrade-migration`)은 내러티브 흐름 유지를 위해 섹션 단위 리뷰가 더 신중해야 함.
- **케이스 간 고유명사 일관성**: 사용자가 특정 케이스로 먼저 진입할 수 있으므로 각 케이스마다 공용 기관의 "첫 등장 병기" 규칙이 독립 적용됨. 번역 진행하면서 이 spec 의 형제 문서 또는 플랜에 용어집(glossary) 을 별도로 관리.
- **한국어 원문의 암묵적 주어 · 생략된 접속사**: 영문으로 옮기면서 명시적 주어 · 연결어를 보충해야 하는 경우 다수. 진짜 의미가 모호한 경우만 추측 없이 사용자에게 확인.

## 성공 기준

- 기존 한국어 페이지 모두가 기존 URL(`/`, `/portfolio/*`, `/demo/*`)에서 변경 없이 로드됨.
- 모든 한국어 페이지에 대응하는 영문 페이지가 `/en/...` 에 존재하며 프로페셔널 톤으로 충실히 번역됨.
- 모든 페이지에 `hreflang` 태그 존재, sitemap 에 양쪽 locale 수록, 페이지별 `<html lang>` 정확.
- 네비의 언어 토글이 현재 pathname 을 잃지 않고 locale 전환.
- Lighthouse · DOM 검사에서 콘솔 에러, hydration mismatch, locale 간 끊어진 링크 없음.
- 작업 내내 `main` 브랜치 변경 없음 — `git checkout main` 시 현재 운영 상태 정확히 복원.

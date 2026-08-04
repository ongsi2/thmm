import type { ReactNode } from 'react';

type Locale = 'ko' | 'en';

export type ProjectCTA = {
  label: string;
  href?: string;
  variant?: 'primary' | 'accent' | 'ghost';
};

type LocalizedProjectContent = {
  title: string;
  badgeText: string;
  description: ReactNode;
  ctas: ProjectCTA[];
};

export type Project = {
  slug: string;
  badgeTone: 'main' | 'secondary' | 'amber' | 'purple';
  tags: string[];
  featured?: boolean; // used by demo B
  accentBorder?: boolean; // ENG-SPARKLING 원본처럼
  i18n: Record<Locale, LocalizedProjectContent>;
};

const mono = (s: string) => (
  <span className="font-mono font-semibold text-[var(--color-accent)]">{s}</span>
);

export const projects: Project[] = [
  {
    slug: 'ohmybaby',
    badgeTone: 'main',
    accentBorder: true,
    featured: true,
    tags: ['Next.js 16', 'Supabase', 'Framer Motion', 'Tailwind CSS 4'],
    i18n: {
      ko: {
        title: '오마이베이비',
        badgeText: 'MAIN',
        description: (
          <>
            AI 이름 추천과 이상형 월드컵 방식을 결합해 가족이 함께 아기 이름을 고를 수 있는 웹 서비스.{' '}
            {mono('카카오 로그인')} 기반 인증과 한자 뜻풀이·오행 분석 등 한국 작명 문화를 반영했습니다.
          </>
        ),
        ctas: [{ label: '사이트 방문', href: 'https://ohmybaby.kr', variant: 'accent' }],
      },
      en: {
        title: 'Ohmybaby',
        badgeText: 'MAIN',
        description: (
          <>
            A web service combining AI name suggestions with tournament-style voting so families
            can choose a baby's name together. Built on {mono('Kakao Login')}-based authentication
            and reflects Korean naming culture — Hanja meaning lookup, Ohaeng (Five-Element)
            analysis, and more.
          </>
        ),
        ctas: [{ label: 'Visit Site', href: 'https://ohmybaby.kr', variant: 'accent' }],
      },
    },
  },
  {
    slug: 'dumdum',
    badgeTone: 'amber',
    featured: true,
    tags: ['Astro', 'Next.js', 'Tailwind CSS', 'Vercel', 'SEO'],
    i18n: {
      ko: {
        title: '덤덤 웹스튜디오',
        badgeText: '외주 · 운영중',
        description: (
          <>
            홈페이지 제작 외주를 받는 스튜디오 사이트이자, 제 영업 창구입니다. 계약 전에{' '}
            {mono('실제 동작하는 시안')}을 먼저 만들어 보여주는 방식으로 일하고, 산후조리원·치과·필라테스·
            법무법인 등 업종별 시안 16건을 갤러리로 공개해 두었습니다. 그랑베이가 여기서 시작된 첫 사례입니다.
          </>
        ),
        ctas: [{ label: '사이트 방문', href: 'https://dumdum.kr', variant: 'accent' }],
      },
      en: {
        title: 'Dumdum Web Studio',
        badgeText: 'Client Work · Live',
        description: (
          <>
            My web-studio site and the front door for client work. I lead with a{' '}
            {mono('working prototype')} before any contract is signed, and the gallery publishes 16
            industry-specific concepts — postpartum care, dental, pilates, law firms, and more.
            Grand-Baie was the first project that came out of this.
          </>
        ),
        ctas: [{ label: 'Visit Site', href: 'https://dumdum.kr', variant: 'accent' }],
      },
    },
  },
  {
    slug: 'grandbaie',
    badgeTone: 'amber',
    featured: true,
    tags: ['Astro 6', 'Tailwind CSS 4', 'Kakao Map', 'Vercel'],
    i18n: {
      ko: {
        title: '그랑베이 산후조리원',
        badgeText: '외주 · 운영중',
        description: (
          <>
            안양 소재 프리미엄 산후조리원의 반응형 홈페이지. {mono('Astro 6')} 기반 정적 사이트로,
            스크롤 기반 프레임 애니메이션 히어로, {mono('카카오맵')} 연동, 시설/프로그램/식단/스파 등 9개
            페이지를 호텔급 고급 브랜딩 컨셉으로 구현했습니다.
          </>
        ),
        ctas: [{ label: '사이트 방문', href: 'https://grandbaie.co.kr', variant: 'primary' }],
      },
      en: {
        title: 'Grand-Baie Postpartum Care',
        badgeText: 'Client · Live',
        description: (
          <>
            A responsive site for a premium postpartum care center in Anyang, built as a static
            site on {mono('Astro 6')}. Features a scroll-driven frame-animation hero,{' '}
            {mono('Kakao Map')} integration, and nine pages (facilities, programs, meals, spa, and
            more) designed around a hotel-grade luxury brand concept.
          </>
        ),
        ctas: [{ label: 'Visit Site', href: 'https://grandbaie.co.kr', variant: 'primary' }],
      },
    },
  },
  {
    slug: 'im-so-cute',
    badgeTone: 'purple',
    tags: ['Apps in Toss', 'Vite', 'React', 'TDS Mobile', 'Supabase'],
    i18n: {
      ko: {
        title: '난귀여워',
        badgeText: '앱인토스 · 출시',
        description: (
          <>
            주어진 문장을 최대한 귀엽게 읽으면 정확도·음정·표현력·귀여움 4항목으로 점수를 매기고, 피드에
            올려 서로 좋아요를 누르는 토스 미니앱. 토스 로그인 없이 {mono('익명 인증 + anonymous_key')}로
            기기가 바뀌어도 본인 기록을 찾게 했고, localStorage를 1차 저장소로 두는 dual-write 구조라
            네트워크가 끊겨도 화면이 멈추지 않습니다. 앱인토스 바이브코딩 챌린지 출품작.
          </>
        ),
        ctas: [{ label: '토스 앱에서 이용', variant: 'ghost' }],
      },
      en: {
        title: 'ImCute',
        badgeText: 'Apps in Toss · Live',
        description: (
          <>
            A Toss mini-app: read a given line as cutely as you can, get scored on four axes
            (accuracy, pitch, expression, cuteness), then post it to a feed where people like each
            other's takes. {mono('Anonymous auth + anonymous_key')} links a user across devices
            without a Toss login, and a localStorage-first dual-write keeps the UI responsive even
            when the network drops. Submitted to the Apps in Toss vibe-coding challenge.
          </>
        ),
        ctas: [{ label: 'Available inside Toss', variant: 'ghost' }],
      },
    },
  },
  {
    slug: 'tickereats',
    badgeTone: 'purple',
    tags: ['Apps in Toss', 'Vite', 'React', '키움 REST API', 'Vercel Functions'],
    i18n: {
      ko: {
        title: '오늘뭐먹주',
        badgeText: '앱인토스 · 출시',
        description: (
          <>
            내가 고른 종목이 오늘 움직인 만큼, 그러니까 {mono('1주 변동액')}이 그날의 메뉴 예산이 되는
            미니앱. 키움 REST API로 시세를 받아 6개 예산 밴드로 나누고, 시간대에 맞는 세션(모닝·점심·오후·
            저녁·야식) 메뉴를 추천한 뒤 카카오 로컬 API로 근처 식당까지 이어줍니다. 전 화면 무스크롤 설계.
          </>
        ),
        ctas: [{ label: '토스 앱에서 이용', variant: 'ghost' }],
      },
      en: {
        title: 'TickerEats',
        badgeText: 'Apps in Toss · Live',
        description: (
          <>
            Your lunch budget is however much your pick moved today — the{' '}
            {mono('per-share daily change')}. Quotes come from the Kiwoom REST API, get bucketed
            into six budget bands, and drive a menu suggestion for the current session (morning,
            lunch, afternoon, dinner, late-night), which then hands off to the Kakao Local API for
            nearby restaurants. Every screen fits without scrolling.
          </>
        ),
        ctas: [{ label: 'Available inside Toss', variant: 'ghost' }],
      },
    },
  },
  {
    slug: 'bakbak',
    badgeTone: 'purple',
    tags: ['Apps in Toss', 'Vite', 'React 18', 'Supabase RLS', 'TDS Mobile'],
    i18n: {
      ko: {
        title: '박박',
        badgeText: '앱인토스 · 출시',
        description: (
          <>
            수박을 키워서 친구와 나눠 먹는 미니앱. Supabase 익명 인증 위에 전용 스키마를 따로 두고,
            상태 전이를 전부 {mono('RPC + RLS')}로 감싸 클라이언트가 진행도를 직접 쓰지 못하고 서버 함수를
            통해서만 올라가도록 했습니다.
          </>
        ),
        ctas: [{ label: '토스 앱에서 이용', variant: 'ghost' }],
      },
      en: {
        title: 'Bakbak',
        badgeText: 'Apps in Toss · Live',
        description: (
          <>
            Grow a watermelon, then split it with friends. Built on Supabase anonymous auth with a
            dedicated schema, where every state transition goes through {mono('RPC + RLS')} — the
            client can never write progress directly, only ask a server function to advance it.
          </>
        ),
        ctas: [{ label: 'Available inside Toss', variant: 'ghost' }],
      },
    },
  },
  {
    slug: 'eng-sparkling',
    badgeTone: 'secondary',
    featured: true,
    tags: ['Next.js 15', 'TypeScript', 'OpenAI API', 'Supabase', 'Tailwind CSS', 'Docker'],
    i18n: {
      ko: {
        title: 'ENG-SPARKLING',
        badgeText: '운영중',
        description: (
          <>
            수능/내신 영어 지문을 입력하면 {mono('GPT-4o-mini')}가 12가지 유형의 문제를 자동 생성해주는
            서비스입니다. {mono('Supabase')} 기반 인증과 코인 시스템으로 무료 체험부터 유료 사용까지
            자연스럽게 이어지도록 구성했습니다.
          </>
        ),
        ctas: [{ label: 'Live Demo', href: 'https://thmm.kr/eng-sparkling', variant: 'primary' }],
      },
      en: {
        title: 'ENG-SPARKLING',
        badgeText: 'Live',
        description: (
          <>
            Paste a Korean high-school English passage and {mono('GPT-4o-mini')} auto-generates
            12 question types. A {mono('Supabase')} authentication stack plus a credit system
            smoothly transitions users from free trial to paid usage.
          </>
        ),
        ctas: [{ label: 'Live Demo', href: 'https://thmm.kr/eng-sparkling', variant: 'primary' }],
      },
    },
  },
  {
    slug: 'flash-coupon',
    badgeTone: 'secondary',
    tags: ['NestJS', 'TypeScript', 'Redis', 'PostgreSQL', 'Next.js', 'Docker'],
    i18n: {
      ko: {
        title: 'Flash Coupon',
        badgeText: '운영중',
        description: (
          <>
            다량의 쿠폰 발급/사용 요청을 {mono('Redis')}로 버퍼링하고 {mono('PostgreSQL')}로 영속화하여
            안정성을 확보한 서비스.
          </>
        ),
        ctas: [
          { label: 'Live Demo', href: 'https://thmm.kr/flash-coupon', variant: 'primary' },
          { label: 'API Docs', href: 'https://thmm.kr/api/docs', variant: 'ghost' },
        ],
      },
      en: {
        title: 'Flash Coupon',
        badgeText: 'Live',
        description: (
          <>
            A coupon service that buffers bursts of issuance and redemption with {mono('Redis')}{' '}
            and persists them to {mono('PostgreSQL')} for reliability under load.
          </>
        ),
        ctas: [
          { label: 'Live Demo', href: 'https://thmm.kr/flash-coupon', variant: 'primary' },
          { label: 'API Docs', href: 'https://thmm.kr/api/docs', variant: 'ghost' },
        ],
      },
    },
  },
];

const toneClass: Record<Project['badgeTone'], string> = {
  main: 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white',
  secondary: 'bg-[var(--color-secondary)] text-white',
  amber: 'bg-amber-600 text-white',
  purple: 'bg-purple-500 text-white',
};

function Cta({ cta }: { cta: ProjectCTA }) {
  const base =
    'block text-center px-4 py-2.5 font-semibold text-sm rounded-xl spring hover:shadow-md hover:scale-[1.02] active:scale-[0.98]';
  const classes =
    cta.variant === 'accent'
      ? `${base} bg-[var(--color-accent)] text-white shadow-sm shadow-emerald-500/20`
      : cta.variant === 'ghost'
      ? `${base} bg-white text-[var(--color-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent)]`
      : `${base} bg-[var(--color-primary)] text-white`;
  if (!cta.href) return <span className={`${classes} opacity-60 pointer-events-none`}>{cta.label}</span>;
  return (
    <a href={cta.href} target="_blank" rel="noopener noreferrer" className={`${classes} flex-1`}>
      {cta.label}
    </a>
  );
}

function TechTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2.5 py-1 border border-[var(--color-border)] bg-[var(--color-bg-light)] font-mono text-xs font-medium rounded-md">
      {children}
    </span>
  );
}

export function ProjectCard({
  project,
  locale,
  size = 'regular',
}: {
  project: Project;
  locale: Locale;
  size?: 'regular' | 'featured';
}) {
  const content = project.i18n[locale];
  const borderClass = project.accentBorder
    ? 'border-[var(--color-accent)]/30'
    : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/40';
  const padding = size === 'featured' ? 'p-8' : 'p-7';
  const titleSize = size === 'featured' ? 'text-xl' : 'text-lg';
  return (
    <div className={`relative bg-white border ${borderClass} ${padding} h-full rounded-2xl hover:shadow-lg spring`}>
      <div
        className={`absolute -top-2.5 left-5 px-3 py-0.5 text-xs font-semibold rounded-md ${toneClass[project.badgeTone]}`}
      >
        {content.badgeText}
      </div>
      <div className="space-y-5 h-full flex flex-col">
        <div className="flex-1 space-y-3">
          <h3 className={`${titleSize} font-bold`}>{content.title}</h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
            {content.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <TechTag key={tag}>{tag}</TechTag>
            ))}
          </div>
        </div>
        <div className={content.ctas.length > 1 ? 'flex gap-3' : ''}>
          {content.ctas.map((cta) => (
            <Cta key={cta.label} cta={cta} />
          ))}
        </div>
      </div>
    </div>
  );
}

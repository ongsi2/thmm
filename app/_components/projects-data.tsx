import type { ReactNode } from 'react';

export type ProjectCTA = {
  label: string;
  href?: string;
  variant?: 'primary' | 'accent' | 'ghost';
};

export type Project = {
  slug: string;
  title: string;
  badge: { text: string; tone: 'main' | 'secondary' | 'amber' | 'purple' };
  description: ReactNode;
  tags: string[];
  ctas: ProjectCTA[];
  featured?: boolean; // used by demo B
  accentBorder?: boolean; // ENG-SPARKLING 원본처럼
};

const mono = (s: string) => (
  <span className="font-mono font-semibold text-[var(--color-accent)]">{s}</span>
);

const monoPlain = (s: string) => <span className="font-mono font-semibold">{s}</span>;

export const projects: Project[] = [
  {
    slug: 'ohmybaby',
    title: '오마이베이비',
    badge: { text: 'MAIN', tone: 'main' },
    accentBorder: true,
    featured: true,
    description: (
      <>
        AI 이름 추천과 이상형 월드컵 방식을 결합해 가족이 함께 아기 이름을 고를 수 있는 웹 서비스.{' '}
        {mono('카카오 로그인')} 기반 인증과 한자 뜻풀이·오행 분석 등 한국 작명 문화를 반영했습니다.
      </>
    ),
    tags: ['Next.js 16', 'Supabase', 'Framer Motion', 'Tailwind CSS 4'],
    ctas: [{ label: '사이트 방문', href: 'https://ohmybaby.kr', variant: 'accent' }],
  },
  {
    slug: 'grandbaie',
    title: '그랑베이 산후조리원',
    badge: { text: '외주 · 운영중', tone: 'amber' },
    featured: true,
    description: (
      <>
        안양 소재 프리미엄 산후조리원의 반응형 홈페이지. {mono('Astro 6')} 기반 정적 사이트로,
        스크롤 기반 프레임 애니메이션 히어로, {mono('카카오맵')} 연동, 시설/프로그램/식단/스파 등 9개
        페이지를 호텔급 고급 브랜딩 컨셉으로 구현했습니다.
      </>
    ),
    tags: ['Astro 6', 'Tailwind CSS 4', 'Kakao Map', 'Vercel'],
    ctas: [{ label: '사이트 방문', href: 'https://grandbaie.co.kr', variant: 'primary' }],
  },
  {
    slug: 'eng-sparkling',
    title: 'ENG-SPARKLING',
    badge: { text: '운영중', tone: 'secondary' },
    featured: true,
    description: (
      <>
        수능/내신 영어 지문을 입력하면 {mono('GPT-4o-mini')}가 12가지 유형의 문제를 자동 생성해주는
        서비스입니다. {mono('Supabase')} 기반 인증과 코인 시스템으로 무료 체험부터 유료 사용까지
        자연스럽게 이어지도록 구성했습니다.
      </>
    ),
    tags: ['Next.js 15', 'TypeScript', 'OpenAI API', 'Supabase', 'Tailwind CSS', 'Docker'],
    ctas: [{ label: 'Live Demo', href: 'https://thmm.kr/eng-sparkling', variant: 'primary' }],
  },
  {
    slug: 'flash-coupon',
    title: 'Flash Coupon',
    badge: { text: '운영중', tone: 'secondary' },
    description: (
      <>
        다량의 쿠폰 발급/사용 요청을 {mono('Redis')}로 버퍼링하고 {mono('PostgreSQL')}로 영속화하여
        안정성을 확보한 서비스.
      </>
    ),
    tags: ['NestJS', 'TypeScript', 'Redis', 'PostgreSQL', 'Next.js', 'Docker'],
    ctas: [
      { label: 'Live Demo', href: 'https://thmm.kr/flash-coupon', variant: 'primary' },
      { label: 'API Docs', href: 'https://thmm.kr/api/docs', variant: 'ghost' },
    ],
  },
  {
    slug: 'jwt-auth',
    title: 'JWT Auth System',
    badge: { text: '운영중', tone: 'secondary' },
    description: (
      <>
        Spring Boot 기반 JWT 인증 시스템. {monoPlain('Redis 블랙리스트')}와{' '}
        {monoPlain('Dual Token 정책')}으로 보안을 강화하고, 관리자 기능으로 사용자 세션을 실시간
        제어합니다.
      </>
    ),
    tags: ['Spring Boot', 'Spring Security', 'JJWT', 'Redis', 'PostgreSQL', 'Docker'],
    ctas: [{ label: 'Live Demo', href: 'https://thmm.kr/springboot-jwt', variant: 'primary' }],
  },
];

const toneClass: Record<Project['badge']['tone'], string> = {
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

export function ProjectCard({ project, size = 'regular' }: { project: Project; size?: 'regular' | 'featured' }) {
  const borderClass = project.accentBorder
    ? 'border-[var(--color-accent)]/30'
    : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/40';
  const padding = size === 'featured' ? 'p-8' : 'p-7';
  const titleSize = size === 'featured' ? 'text-xl' : 'text-lg';
  return (
    <div className={`relative bg-white border ${borderClass} ${padding} h-full rounded-2xl hover:shadow-lg spring`}>
      <div
        className={`absolute -top-2.5 left-5 px-3 py-0.5 text-xs font-semibold rounded-md ${toneClass[project.badge.tone]}`}
      >
        {project.badge.text}
      </div>
      <div className="space-y-5 h-full flex flex-col">
        <div className="flex-1 space-y-3">
          <h3 className={`${titleSize} font-bold`}>{project.title}</h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <TechTag key={tag}>{tag}</TechTag>
            ))}
          </div>
        </div>
        <div className={project.ctas.length > 1 ? 'flex gap-3' : ''}>
          {project.ctas.map((cta) => (
            <Cta key={cta.label} cta={cta} />
          ))}
        </div>
      </div>
    </div>
  );
}

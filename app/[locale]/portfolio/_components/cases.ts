type Locale = 'ko' | 'en';

export type Organization = {
  id: string;
  current?: boolean;
  i18n: Record<Locale, {
    system: string;
    company: string;
    period: string;
    role: string;
    intro: string;
  }>;
};

export const organizations: Record<string, Organization> = {
  'kimst-bdbis': {
    id: 'kimst-bdbis',
    current: true,
    i18n: {
      ko: {
        system: '바다봄',
        company: '해양수산과학기술진흥원',
        period: '2026.01 - 현재',
        role: '프리랜서 · 개발자',
        intro:
          '해양수산 R&D 통합정보시스템(바다봄) 운영 및 확장. 타사이트 SSO 연동, 로그뷰어 등 운영 편의 도구 제작, 외부 시스템(OTT 기술거래)을 바다봄으로 이관하는 등의 업무를 수행.',
      },
      en: {
        system: 'Badabom',
        company: 'Korea Institute of Marine Science & Technology Promotion (KIMST)',
        period: 'Jan 2026 - Present',
        role: 'Freelance · Developer',
        intro:
          "Operating and extending Badabom, KIMST's integrated marine R&D information system. Work includes SSO integration with partner sites, building operational tooling like a live log viewer, and migrating external systems (OTT technology-trade) into Badabom.",
      },
    },
  },
  'personal': {
    id: 'personal',
    i18n: {
      ko: {
        system: '프리랜서 · 사이드 프로젝트',
        company: '개인',
        period: '2025 - 현재',
        role: '기획 · 디자인 · 개발',
        intro:
          '직접 기획하거나 클라이언트에게 제안해서 시작한 프로젝트들. 컨셉부터 디자인, 개발, 배포까지 전 과정을 직접 수행.',
      },
      en: {
        system: 'Freelance · Side Projects',
        company: 'Independent',
        period: '2025 - Present',
        role: 'Product · Design · Development',
        intro:
          'Projects I initiated on my own or pitched to clients. I own the full cycle — concept, design, development, and deployment.',
      },
    },
  },
  'kpf-issga': {
    id: 'kpf-issga',
    i18n: {
      ko: {
        system: '정부광고통합지원시스템',
        company: '한국언론진흥재단',
        period: '2020.08 - 2025.12 (5년 4개월)',
        role: '프리랜서 · PL/AA',
        intro:
          '정부광고 통합지원 플랫폼을 PL/AA 역할로 운영. CI/CD 구축, 세션 클러스터링, TLS 업그레이드 등 인프라·보안·배포 자동화 작업을 담당.',
      },
      en: {
        system: 'GAIS — Government Advertising Integrated Support System',
        company: 'Korea Press Foundation (KPF)',
        period: 'Aug 2020 - Dec 2025 (5y 4m)',
        role: 'Freelance · PL/AA',
        intro:
          'Operated the government-advertising integrated support platform as PL/AA. Scope covered CI/CD build-out, session clustering, TLS upgrades, and infra/security/deploy automation.',
      },
    },
  },
};

export type CaseInfo = {
  slug: string;
  organizationId: keyof typeof organizations;
  category: string;
  stack: string[];
  i18n: Record<Locale, {
    title: string;
    summary: string;
    outcome: string;
  }>;
};

export const cases: CaseInfo[] = [
  {
    slug: 'sso-provider',
    organizationId: 'kimst-bdbis',
    category: 'AUTH / SSO',
    stack: [
      'Spring MVC',
      'iBATIS',
      'UUID Token',
      'DB 세션 저장소',
      'CORS',
      '전자정부 프레임워크',
    ],
    i18n: {
      ko: {
        title: '외부 사이트용 SSO Provider 구축',
        summary:
          'OTT 등 외부 기관 사이트에서 바다봄 계정으로 로그인하도록 Provider를 직접 구현했습니다. 일회용 UUID 토큰을 DB에 저장해 다중 WAS를 지원하고, CI(개인 공통 식별자) 기반으로 양쪽 계정을 자동 매핑합니다.',
        outcome: '외부 사이트 SSO 통합 · 계정 자동 매핑',
      },
      en: {
        title: 'Building an SSO Provider for Partner Sites',
        summary:
          'Implemented an SSO Provider so external partner sites (e.g., OTT) could sign in with Badabom accounts. Single-use UUID tokens stored in the database support multiple WAS nodes, and CI (Connecting Information) auto-maps accounts across both sides.',
        outcome: 'External SSO integration · Auto account mapping',
      },
    },
  },
  {
    slug: 'log-viewer',
    organizationId: 'kimst-bdbis',
    category: 'DEVOPS / OBSERVABILITY',
    stack: [
      'Spring MVC',
      'Server-Sent Events',
      'RandomAccessFile',
      'Proxy Token',
      'JEUS',
      '전자정부 프레임워크',
    ],
    i18n: {
      ko: {
        title: 'SSE + Cross-WAS 실시간 로그 뷰어',
        summary:
          'WAS는 대전 IDC에 있는데, 망분리 정책상 그 서버에 붙을 수 있는 PC가 부산 사무실에만 있었습니다. 그래서 로그 한 번 보려면 사실상 부산으로 가야 하는 구조였어요. 관리자 웹 안에 SSE 기반 뷰어를 만들고, 두 개 WAS 노드 로그까지 Cross-WAS 릴레이로 한 화면에서 보이도록 구성했습니다.',
        outcome: '부산 의존 제거 · 멀티 노드 통합',
      },
      en: {
        title: 'SSE + Cross-WAS Real-Time Log Viewer',
        summary:
          'The WAS lived in the Daejeon IDC, but network-segregation policy meant only Busan-office PCs could reach it — so pulling a log effectively meant flying to Busan. I built an SSE-based viewer inside the admin web and added a cross-WAS relay so logs from both WAS nodes stream into a single screen.',
        outcome: 'Removed Busan dependency · Unified multi-node view',
      },
    },
  },
  {
    slug: 'techtrade-migration',
    organizationId: 'kimst-bdbis',
    category: 'LEGACY MIGRATION',
    stack: [
      'Spring MVC 4.3',
      'eGovFrame 3.9',
      'iBATIS 2.0',
      'PostgreSQL',
      'Oracle',
      'JSP',
      'rMateGridH5',
    ],
    i18n: {
      ko: {
        title: 'OTT 기술거래 시스템을 바다봄으로 이관',
        summary:
          'Oracle + MyBatis 기반의 OTT 기술거래 플랫폼을 PostgreSQL + iBATIS 환경으로 옮겼습니다. 87개 URL, 34개 JSP, 80여 개 SQL과 14개 테이블을 재작성했습니다.',
        outcome: '87 URL · 80+ SQL 이관',
      },
      en: {
        title: 'Migrating the OTT Technology-Trade System into Badabom',
        summary:
          'Moved an Oracle + MyBatis technology-trade platform (OTT) onto PostgreSQL + iBATIS. Rewrote 87 URLs, 34 JSPs, 80+ SQL queries, and 14 tables.',
        outcome: '87 URLs · 80+ SQL migrated',
      },
    },
  },
  {
    slug: 'cicd',
    organizationId: 'kpf-issga',
    category: 'CI/CD',
    stack: ['Jenkins', 'GitLab', 'Docker', 'Maven', 'Declarative Pipeline'],
    i18n: {
      ko: {
        title: '빌드·배포 프로세스 자동화',
        summary:
          '전부 수동으로 하던 빌드·배포를 Jenkins + GitLab Webhook 기반으로 자동화해서, 배포 시간을 15~20분에서 4분대로 줄였습니다.',
        outcome: '배포 시간 80% 단축',
      },
      en: {
        title: 'Automating the Build and Deploy Pipeline',
        summary:
          'Replaced a fully manual build-and-deploy workflow with a Jenkins + GitLab Webhook pipeline, cutting deploy time from 15–20 min down to around 4 min.',
        outcome: '80% deploy-time reduction',
      },
    },
  },
  {
    slug: 'redis-session',
    organizationId: 'kpf-issga',
    category: 'INFRA / SESSION',
    stack: ['Redis', 'Spring Session', 'Docker', '전자정부 프레임워크', 'JEUS'],
    i18n: {
      ko: {
        title: 'Redis 기반 세션 클러스터링',
        summary:
          'JEUS Standard에서는 세션 클러스터링 기능을 못 써서, Redis를 외부 세션 저장소로 두고 우회했습니다. 덕분에 WAS 순차 재기동이 가능해졌습니다.',
        outcome: '무중단 배포 가능',
      },
      en: {
        title: 'Redis-Backed Session Clustering',
        summary:
          "JEUS Standard doesn't support native session clustering, so I put Redis in front as an external session store. That unlocked rolling restarts across WAS nodes.",
        outcome: 'Zero-downtime deploys enabled',
      },
    },
  },
  {
    slug: 'tls-upgrade',
    organizationId: 'kpf-issga',
    category: 'SECURITY / NETWORK',
    stack: ['Nginx', 'WebtoB', 'JEUS', 'TLS 1.2/1.3', 'Reverse Proxy'],
    i18n: {
      ko: {
        title: 'Nginx 리버스 프록시로 TLS 1.3 적용',
        summary:
          'WebtoB 공용 SSL을 건드리기 부담스러워서, 앞단에 Nginx를 세우고 거기서 TLS를 종단하도록 바꿨습니다. 기존 서비스는 영향 없이 TLS 1.3으로 올렸습니다.',
        outcome: 'TLS 1.3 적용 · 영향 최소화',
      },
      en: {
        title: 'Applying TLS 1.3 via an Nginx Reverse Proxy',
        summary:
          "Touching the shared WebtoB SSL felt risky, so I put Nginx in front and terminated TLS there instead. Existing services kept running untouched while TLS 1.3 was rolled out.",
        outcome: 'TLS 1.3 live · minimal impact',
      },
    },
  },
  {
    slug: 'grandbaie',
    organizationId: 'personal',
    category: 'CLIENT WORK / WEB',
    stack: ['Astro 6', 'Tailwind CSS 4', 'Canvas API', 'Kakao Map', 'Vercel'],
    i18n: {
      ko: {
        title: '산후조리원 홈페이지 리뉴얼 제안 → 제작',
        summary:
          '아내가 입소한 조리원의 홈페이지가 오래돼 보여서 직접 UI 샘플을 만들어 제안했습니다. 192프레임 스크롤 애니메이션, 카카오맵, SEO까지 갖춘 Astro 정적 사이트를 제작해서 실제 운영 도메인으로 배포했습니다.',
        outcome: 'grandbaie.co.kr 운영중',
      },
      en: {
        title: 'Pitched and Built a Postpartum Care Center Site Renewal',
        summary:
          "My wife had stayed at a postpartum care center whose website felt dated, so I mocked up a UI sample and pitched it myself. I built an Astro static site with a 192-frame scroll animation, Kakao Map, and SEO — then shipped it to their production domain.",
        outcome: 'Live at grandbaie.co.kr',
      },
    },
  },
  {
    slug: 'ohmybaby',
    organizationId: 'personal',
    category: 'SIDE PROJECT / AI',
    stack: ['Next.js 16', 'GPT-4o', 'Supabase', 'Kakao OAuth', 'Framer Motion'],
    i18n: {
      ko: {
        title: 'AI 작명 + 이상형 월드컵으로 가족이 함께 고르는 아기 이름',
        summary:
          '기존 작명 서비스가 혼자 쓰는 구조여서, 가족이 같이 참여할 수 있는 방식을 만들었습니다. GPT-4o가 사주·오행 맞춰 이름을 추천하면, 이상형 월드컵으로 가족이 투표해서 최종 이름을 고릅니다.',
        outcome: 'ohmybaby.kr 운영중',
      },
      en: {
        title: 'Family-Driven Baby Naming with AI + Tournament-Style Voting',
        summary:
          "Existing naming services are designed for solo use, so I built a way for the whole family to join in. GPT-4o suggests names aligned with Saju (birth-chart) and Ohaeng (Five-Element) rules, and the family votes tournament-style to pick the final name.",
        outcome: 'Live at ohmybaby.kr',
      },
    },
  },
];

export function casesByOrganization() {
  const order = Object.values(organizations).sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    return 0;
  });
  return order.map((org) => ({
    org,
    items: cases.filter((c) => c.organizationId === org.id),
  }));
}

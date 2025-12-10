export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#home" className="text-xl font-bold tracking-tight">
            THMM
          </a>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#home" className="text-slate-600 hover:text-slate-900 transition">
              Home
            </a>
            <a href="#projects" className="text-slate-600 hover:text-slate-900 transition">
              Projects
            </a>
            <a href="#about" className="text-slate-600 hover:text-slate-900 transition">
              About
            </a>
            <a href="#contact" className="text-slate-600 hover:text-slate-900 transition">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="min-h-screen flex items-center px-6 pt-24"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1.2fr,1fr] gap-12 items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-sm">
              Portfolio 2024
              <span className="text-slate-200">Developer · Builder · Problem Solver</span>
            </p>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
              안녕하세요 개발자 신성무입니다.
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              실서비스 운영을 염두에 둔 백엔드/프론트엔드 개발을 좋아합니다.
              빠르게 실험하고, 안정적으로 배포하며, 데이터로 개선점을 찾는 과정을 즐깁니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#projects"
                className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold shadow-md hover:-translate-y-0.5 transition"
              >
                프로젝트 보기
              </a>
              <a
                href="#contact"
                className="px-5 py-3 rounded-xl border border-slate-300 font-semibold hover:border-slate-900 hover:-translate-y-0.5 transition"
              >
                함께 이야기하기
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: '실서비스 구축', value: '3+' },
                { label: '주요 스택', value: 'NestJS · Next.js' },
                { label: '관심사', value: '분산 처리 · DX' },
                { label: '배포 경험', value: 'Docker · Nginx' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-white/80 shadow-sm border border-slate-200/60 p-4"
                >
                  <div className="text-2xl font-bold">{item.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-200 to-white blur-2xl opacity-80" />
            <div className="relative rounded-3xl bg-white shadow-xl border border-slate-100 p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">대표 프로젝트</p>
                  <p className="text-xl font-bold">Flash Coupon</p>
                </div>
                <span className="px-3 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                  Live
                </span>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">⚡</span>
                  <p>동시 다발 쿠폰 발급/사용 트래픽을 견디도록 Redis + MySQL 기반으로 설계</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">🧭</span>
                  <p>쿠폰 발급/사용 플로우를 명확히 시각화하고 관리 UI 제공</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">🛠️</span>
                  <p>Docker · Nginx로 멀티 서비스 배포, Swagger로 API 문서화</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['NestJS', 'Redis', 'MySQL', 'Next.js', 'Docker'].map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-700 font-semibold"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://thmm.kr/flash-coupon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 font-semibold hover:underline"
                >
                  데모 보기
                </a>
                <a
                  href="https://thmm.kr/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:underline"
                >
                  API 문서
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section
        id="projects"
        className="px-6 py-20"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.2em]">
              Projects
            </p>
            <h2 className="text-4xl font-bold tracking-tight">최근 작업</h2>
            <p className="text-slate-600">
              운영 환경에서 바로 활용 가능한 프로젝트들을 만들고 있습니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:-translate-y-1 transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">Flash Coupon</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-slate-900 text-white font-semibold">
                  메인
                </span>
              </div>
              <p className="text-slate-600 mb-6">
                다량의 쿠폰 발급/사용 요청을 Redis로 버퍼링하고 MySQL로 영속화하여 안정성을 확보한 서비스.
                Next.js 기반 프론트로 쿠폰 발급 플로우를 한눈에 관리합니다.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {['NestJS', 'TypeScript', 'Redis', 'MySQL', 'Next.js', 'Docker', 'Nginx'].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-sm font-semibold">
                <a
                  href="https://thmm.kr/flash-coupon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 hover:underline"
                >
                  Live Demo
                </a>
                <a
                  href="https://thmm.kr/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:underline"
                >
                  API Docs
                </a>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">프론트/백엔드 레포 분리 운영</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:-translate-y-1 transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">JWT Auth System</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-600 text-white font-semibold">
                  Live
                </span>
              </div>
              <p className="text-slate-600 mb-6">
                Spring Boot 기반 JWT 인증 시스템. Redis 블랙리스트와 Dual Token 정책으로 보안을 강화하고,
                관리자 기능으로 사용자 세션을 실시간 제어합니다.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {['Spring Boot', 'Spring Security', 'JJWT', 'Redis', 'PostgreSQL', 'Docker'].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-sm font-semibold">
                <a
                  href="https://thmm.kr/springboot-jwt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 hover:underline"
                >
                  Live Demo
                </a>
                <a
                  href="https://github.com/thmm-kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:underline"
                >
                  GitHub
                </a>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">Redis 블랙리스트 · RBAC</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="px-6 py-20 bg-white"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1.1fr,0.9fr] gap-12 items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.2em]">
              About
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              사용자 경험과 안정성을 함께 챙기는 풀스택 개발자
            </h2>
            <p className="text-slate-600 leading-relaxed">
              실시간 이벤트, 관리자 UI, 배포 자동화까지 한 흐름으로 고민합니다.
              작은 기능도 모니터링 · 로그 · 문서화를 함께 묶어두어 팀과 사용자 모두 안심할 수 있게 만드는 것을 목표로 합니다.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'API 문서화 & Swagger',
                'Redis 캐시/큐로 성능 튜닝',
                'Docker · Nginx로 다중 서비스 배포',
                '프론트엔드 상태/폼 관리',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-slate-700">
                  <span className="text-emerald-600">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-200">Work Style</p>
                <p className="text-xl font-bold">신성무</p>
              </div>
              <div className="px-3 py-1 text-xs rounded-full bg-white/15 text-white border border-white/20">
                Builder
              </div>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-slate-100">
              <p>문제 정의 → 빠른 MVP → 로그/지표로 개선 사이클을 돌리는 것을 선호합니다.</p>
              <p>팀과 함께 쓰기 좋은 코드(명확한 인터페이스, 문서, 예제)를 목표로 합니다.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Backend', value: 'NestJS · Express · Redis · MySQL' },
                { label: 'Frontend', value: 'Next.js · React · Tailwind' },
                { label: 'Infra', value: 'Docker · Nginx · PM2' },
                { label: 'Collab', value: 'Swagger · REST · GitHub Actions' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-2xl bg-white/10 border border-white/15">
                  <p className="text-xs text-slate-200">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="px-6 py-20"
      >
        <div className="max-w-5xl mx-auto rounded-3xl bg-slate-900 text-white p-10 md:p-14 shadow-xl">
          <div className="grid md:grid-cols-[1.1fr,0.9fr] gap-10 items-center">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                Contact
              </p>
              <h2 className="text-3xl font-bold leading-tight">
                새로운 시도, 함께 만들어볼까요?
              </h2>
              <p className="text-slate-200">
                협업, 프리랜스, 스터디 제안 모두 환영합니다. 편하게 연락 주세요.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <a
                href="mailto:ssm218@naver.com"
                className="w-full px-4 py-3 rounded-2xl bg-white text-slate-900 font-semibold text-center hover:-translate-y-0.5 transition"
              >
                이메일 보내기
              </a>
              <a
                href="https://github.com/thmm-kr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-3 rounded-2xl border border-white/30 font-semibold text-center hover:-translate-y-0.5 transition"
              >
                GitHub 살펴보기
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-slate-500 text-sm">
        © 2024 THMM. Crafted with TypeScript & Next.js.
      </footer>
    </main>
  );
}


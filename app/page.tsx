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
            <a href="#experience" className="text-slate-600 hover:text-slate-900 transition">
              Experience
            </a>
            <a href="#projects" className="text-slate-600 hover:text-slate-900 transition">
              Projects
            </a>
            <a href="#about" className="text-slate-600 hover:text-slate-900 transition">
              About
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="min-h-screen flex items-center px-6 pt-24"
      >
        <div className="max-w-5xl mx-auto">
          <div className="space-y-8">
            {/* Profile Header with Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-lg ring-4 ring-white">
                <img
                  src="/ssm_photo.jpg"
                  alt="신성무"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">신성무</h2>
                <p className="text-slate-600">Backend Developer · PL/AA</p>
                <a
                  href="mailto:ongsya@gmail.com"
                  className="text-sm text-slate-500 hover:text-slate-900 transition inline-flex items-center gap-1 mt-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  ongsya@gmail.com
                </a>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                안녕하세요,<br />개발자 신성무입니다.
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
                약 10년간 공공 SI, 게임, 물류 등 다양한 분야에서 개발을 수행했습니다.<br />
                현재는 한국언론진흥재단에서 PL/AA로 프로젝트를 리딩하며,<br />
                서비스의 안정성과 운영 효율성을 높이는 데 집중하고 있습니다.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3">
                <a
                  href="#experience"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-slate-800 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  경력 보기
                </a>
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-300 font-semibold hover:border-slate-900 hover:bg-slate-50 hover:-translate-y-1 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  프로젝트 보기
                </a>
                <a
                  href="/resume.pdf"
                  download
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-600 text-emerald-600 font-semibold hover:bg-emerald-600 hover:text-white hover:-translate-y-1 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  이력서 다운로드
                </a>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl">
                {[
                  { label: '총 경력', value: '10년' },
                  { label: '현재 역할', value: 'PL/AA' },
                  { label: '주요 스택', value: 'Java · Spring' },
                  { label: '인프라', value: 'NCP · Jenkins' },
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
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section
        id="experience"
        className="px-6 py-20 bg-slate-100/40"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.2em]">
              Experience
            </p>
            <h2 className="text-4xl font-bold tracking-tight">실무 경력</h2>
            <p className="text-slate-600">
              약 10년간 공공 SI, 게임, 물류 등 다양한 분야에서 백엔드/프론트엔드 개발을 수행했습니다.
            </p>
          </div>

          <div className="space-y-6">
            {/* 한국언론진흥재단 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ring-2 ring-emerald-500/20">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">한국언론진흥재단</h3>
                  <p className="text-slate-600 mt-1">프리랜서 · PL/AA</p>
                  <p className="text-sm text-slate-500 mt-1">2020.08 - 현재 (4년 4개월)</p>
                </div>
                <span className="px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold w-fit">
                  재직중
                </span>
              </div>
              <div className="space-y-3 text-slate-700">
                <p className="font-semibold text-slate-900">정부광고통합지원시스템</p>
                <ul className="space-y-2 text-sm leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>Jenkins 기반 CI/CD 파이프라인 구축 (배포 시간 30분 → 5분 단축)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>NCP 활용 고가용성 인프라 구축 (세션 클러스터링, 무중단 배포)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>실시간 모니터링/알림 체계 구축 및 장애 대응</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>BizTalk 카카오 알림톡, ePapyrus PDF 솔루션 연계 개발</span>
                  </li>
                </ul>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['Java', 'Spring', 'Oracle', 'NCP', 'Jenkins', 'WebtoB', 'JEUS'].map((tech) => (
                    <span key={tech} className="px-3 py-1 rounded-full bg-white border border-slate-300 text-xs font-semibold text-slate-700">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 아이티파트너스 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">아이티파트너스</h3>
                  <p className="text-slate-600 mt-1">정규직 · 개발자</p>
                  <p className="text-sm text-slate-500 mt-1">2017.10 - 2020.07 (2년 9개월)</p>
                </div>
              </div>
              <div className="space-y-3 text-slate-700">
                <p className="font-semibold text-slate-900">공공기관 SI 프로젝트 (한국과학기술연구원, 농림식품기술평가원 등)</p>
                <ul className="space-y-2 text-sm leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>레거시 시스템 현대화 (T-Form → Nexacro 플랫폼 전환)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>연구물품 재고 및 입출고 관리 시스템 구축 (수기 관리 → DB화)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>RESTful API 기반 내부 ERP 연동 모듈 개발</span>
                  </li>
                </ul>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['Java', 'Spring', 'Nexacro', 'Oracle', 'RESTful API'].map((tech) => (
                    <span key={tech} className="px-3 py-1 rounded-full bg-white border border-slate-300 text-xs font-semibold text-slate-700">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 큐로드 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">주식회사 큐로드</h3>
                  <p className="text-slate-600 mt-1">계약직 · 개발자</p>
                  <p className="text-sm text-slate-500 mt-1">2015.11 (1개월)</p>
                </div>
              </div>
              <div className="space-y-3 text-slate-700">
                <ul className="space-y-2 text-sm leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>QA 검수 시스템 개발 (테스트 결과 입력 → 검증 → 승인 프로세스)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>고객센터 문의 접수 및 이메일 답변 처리 시스템 구축</span>
                  </li>
                </ul>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['Java', 'Spring', 'MySQL'].map((tech) => (
                    <span key={tech} className="px-3 py-1 rounded-full bg-white border border-slate-300 text-xs font-semibold text-slate-700">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* NHN엔터테인먼트 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">NHN엔터테인먼트</h3>
                  <p className="text-slate-600 mt-1">정규직 · 개발자</p>
                  <p className="text-sm text-slate-500 mt-1">2012.12 - 2014.12 (2년)</p>
                </div>
              </div>
              <div className="space-y-3 text-slate-700">
                <p className="font-semibold text-slate-900">게임 운영 서비스 (위닝일레븐온라인2, 풋볼데이 등)</p>
                <ul className="space-y-2 text-sm leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>게임 포털/이벤트 페이지 개발 및 운영</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>jQuery/Ajax 비동기 UI 구현으로 로딩 속도 개선</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>운영자용 게임 관리 콘솔(CMS) 개발 (쿠폰/상품 지급 기능)</span>
                  </li>
                </ul>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['Java', 'Spring', 'MySQL', 'jQuery', 'Ajax'].map((tech) => (
                    <span key={tech} className="px-3 py-1 rounded-full bg-white border border-slate-300 text-xs font-semibold text-slate-700">
                      {tech}
                    </span>
                  ))}
                </div>
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
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://thmm.kr/flash-coupon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 hover:shadow-lg transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Live Demo
                </a>
                <a
                  href="https://thmm.kr/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border-2 border-slate-300 font-semibold hover:border-slate-900 hover:bg-slate-50 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  API Docs
                </a>
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
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://thmm.kr/springboot-jwt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 hover:shadow-lg transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Live Demo
                </a>

                <a
                  href="https://thmm.kr/springboot-jwt/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border-2 border-slate-300 font-semibold hover:border-slate-900 hover:bg-slate-50 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  API Docs
                </a>
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
                Full-Stack
              </div>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-slate-100">
              <p>
                저는 완벽한 설계를 먼저 그리기보다는, 문제를 빠르게 정의하고 작동하는 MVP를 만들어보는 쪽을 선호합니다.
                일단 돌아가는 코드를 만들고 나면, 로그와 모니터링 지표를 통해 병목 지점과 개선 방향이 명확하게 보입니다.
                사용자 피드백과 실제 데이터를 기반으로 조금씩 개선해 나가는 사이클이 결국 더 탄탄한 결과물을 만든다고 생각합니다.
              </p>
              <p>
                혼자 잘 짜는 것보다 팀과 함께 읽기 좋은 코드를 만드는 게 더 중요하다고 믿습니다.
                다른 개발자가 코드를 봤을 때 빠르게 이해할 수 있도록, 인터페이스를 명확하게 설계하고 문서화를 충실히 하려고 노력합니다.
                실용적인 예제 코드를 함께 남겨두면 새로운 팀원이 합류했을 때도 빠르게 이해하고 확장할 수 있습니다.
              </p>
              <p>
                코드 리뷰나 페어 프로그래밍을 통해 더 나은 방법을 배우고 공유하는 과정을 중요하게 생각합니다.
                서로의 코드를 보면서 개선점을 찾아가고, 그 과정에서 팀 전체의 코드 품질이 향상되는 것을 경험했기 때문에,
                이런 협업 문화를 만들고 유지하는 데 적극적으로 기여하고 싶습니다.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Backend', value: 'Java · Spring Boot · Node.js' },
                { label: 'Frontend', value: 'HTML · CSS · JavaScript · jQuery' },
                { label: 'Database', value: 'Oracle · MySQL · PostgreSQL · Redis' },
                { label: 'Infra', value: 'NCP · AWS · OCI' },
                { label: 'CI/CD', value: 'GitLab · Jenkins · Git' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-2xl bg-white/10 border border-white/15">
                  <p className="text-xs text-slate-200">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section >

      <footer className="py-10 text-center text-slate-500 text-sm">
        © 2024 THMM. Crafted with TypeScript & Next.js.
      </footer>
    </main >
  );
}

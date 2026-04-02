'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function Home() {
  const [activeSection, setActiveSection] = useState('home');
  const [isPaused, setIsPaused] = useState(false);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const animRef = useRef<number>(0);

  // Projects 자동 스크롤 (JS transform 기반)
  useEffect(() => {
    const container = marqueeRef.current;
    if (!container) return;

    const animate = () => {
      if (!isPaused) {
        offsetRef.current += 0.5;
        const halfWidth = container.scrollWidth / 2;
        if (offsetRef.current >= halfWidth) {
          offsetRef.current -= halfWidth;
        }
        container.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPaused]);

  const scrollByCard = useCallback((direction: number) => {
    const cardWidth = 444; // 420px + 24px gap
    offsetRef.current += cardWidth * direction;
    const container = marqueeRef.current;
    if (container) {
      const halfWidth = container.scrollWidth / 2;
      if (offsetRef.current >= halfWidth) offsetRef.current -= halfWidth;
      if (offsetRef.current < 0) offsetRef.current += halfWidth;
      container.style.transform = `translateX(-${offsetRef.current}px)`;
    }
  }, []);

  // IntersectionObserver for scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // 섹션 스크롤 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    ['home', 'experience', 'projects', 'about'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const sections = [
    { id: 'home', label: 'Home' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'about', label: 'About' },
  ];

  // 불릿 리스트 아이템 컴포넌트
  const BulletItem = ({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) => (
    <li className="flex items-start gap-3">
      <span
        className={`w-1.5 h-1.5 rounded-full mt-[9px] flex-shrink-0 ${
          accent ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-text-muted)]'
        }`}
      />
      <span>{children}</span>
    </li>
  );

  // 기술 태그 컴포넌트
  const TechTag = ({ children, hoverable = false }: { children: React.ReactNode; hoverable?: boolean }) => (
    <span
      className={`px-2.5 py-1 border border-[var(--color-border)] bg-[var(--color-bg-off)] font-mono text-xs font-medium rounded-md ${
        hoverable ? 'hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-light)] spring' : ''
      }`}
    >
      {children}
    </span>
  );

  return (
    <main className="min-h-[100dvh] bg-[var(--color-bg-light)] noise-overlay">
      {/* Side Navigation */}
      <nav className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-40">
        <ul className="space-y-4">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group flex items-center gap-3"
              >
                <span
                  className={`text-xs font-semibold transition-all duration-300 ${
                    activeSection === section.id
                      ? 'opacity-100 text-[var(--color-accent)]'
                      : 'opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)]'
                  }`}
                >
                  {section.label}
                </span>
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    activeSection === section.id
                      ? 'w-10 h-[3px] bg-[var(--color-accent)]'
                      : 'w-6 h-[3px] bg-[var(--color-border)] group-hover:bg-[var(--color-text-muted)] group-hover:w-8'
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Navigation - Glass */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a
            href="#home"
            className="text-lg font-bold tracking-tight text-[var(--color-primary)] hover:text-[var(--color-accent)] spring"
          >
            THMM
          </a>
          <div className="flex gap-8 text-sm font-medium">
            {sections.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`relative py-1 spring ${
                  activeSection === item.id
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-[2px] bg-[var(--color-accent)] rounded-full spring ${
                    activeSection === item.id ? 'w-full' : 'w-0'
                  }`}
                />
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-[100dvh] flex items-center px-6 pt-24 pb-20 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-light)] via-white to-[var(--color-accent-light)]/20"></div>
        <div className="absolute top-32 right-[10%] w-80 h-80 rounded-full bg-[var(--color-accent)]/[0.04] blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-[5%] w-64 h-64 rounded-full bg-[var(--color-secondary)]/[0.03] blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>

        <div className="max-w-5xl mx-auto w-full relative z-10">
          <div className="space-y-10">
            <div className="space-y-6 animate-fadeInUp">
              <p className="text-sm font-mono font-medium text-[var(--color-accent)] tracking-wider">FULLSTACK DEVELOPER</p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-wrap-balance">
                안녕하세요,
                <br />
                <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] bg-clip-text text-transparent">
                  개발자
                </span>{' '}
                신성무입니다.
              </h1>

              <div className="max-w-2xl space-y-3">
                <p className="text-lg md:text-xl leading-relaxed font-medium text-[var(--color-text)]">
                  약 10년간 공공 SI, 게임, 물류 등 다양한 분야에서 개발을 수행했습니다.
                </p>
                <p className="text-base md:text-lg text-[var(--color-text-muted)] leading-relaxed">
                  현재는 해양수산과학기술진흥원에서 바다봄 홈페이지 운영 및 시스템 연동 업무를 담당하고 있습니다.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 animate-fadeInUp" style={{ animationDelay: '0.2s', opacity: 0 }}>
              <a
                href="#experience"
                className="px-7 py-3.5 bg-[var(--color-primary)] text-white font-semibold rounded-xl shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] spring"
              >
                경력 보기
              </a>
              <a
                href="#projects"
                className="px-7 py-3.5 bg-white text-[var(--color-primary)] font-semibold border border-[var(--color-border)] rounded-xl shadow-sm hover:shadow-md hover:border-[var(--color-accent)] hover:scale-[1.02] active:scale-[0.98] spring"
              >
                프로젝트 보기
              </a>
              <a
                href="/resume.pdf"
                download
                className="px-7 py-3.5 bg-[var(--color-accent)] text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] spring"
              >
                이력서 다운로드
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="px-6 py-24 md:py-32 bg-white relative">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 reveal">
            <p className="text-sm font-mono font-medium text-[var(--color-accent)] tracking-wider mb-3">EXPERIENCE</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">약 10년간의 실무 경력</h2>
          </div>

          <div className="space-y-6 relative before:absolute before:left-[11px] before:top-0 before:bottom-0 before:w-[2px] before:bg-[var(--color-border)]">

            {/* 해양수산과학기술진흥원 */}
            <div className="relative pl-12 reveal">
              <div className="absolute left-0 top-8 w-[24px] h-[24px] rounded-full bg-[var(--color-accent)] border-4 border-white shadow-md shadow-emerald-500/20"></div>
              <div className="bg-[var(--color-bg-light)] border border-[var(--color-accent)]/30 p-7 rounded-2xl shadow-sm hover:shadow-md spring">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-[var(--color-accent)] text-white text-xs font-semibold rounded-md mb-3">
                      재직중
                    </span>
                    <h3 className="text-xl font-bold text-[var(--color-primary)] mb-1">해양수산과학기술진흥원</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">프리랜서 · 개발자</p>
                    <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">2026.01 - 현재</p>
                  </div>
                </div>

                <div className="border-l-[3px] border-[var(--color-accent)]/30 pl-5 mb-5">
                  <p className="font-semibold text-base mb-3">바다봄 홈페이지 운영</p>
                  <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                    <BulletItem accent>타사이트와의 SSO 연동 개발</BulletItem>
                    <BulletItem accent>실시간 로그뷰어 개발</BulletItem>
                    <BulletItem accent>기술거래 사이트 마이그레이션 작업</BulletItem>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['Java', 'Spring', 'SSO', 'PostgreSQL', 'Docker'].map((tech) => (
                    <TechTag key={tech} hoverable>{tech}</TechTag>
                  ))}
                </div>
              </div>
            </div>

            {/* 한국언론진흥재단 */}
            <div className="relative pl-12 reveal">
              <div className="absolute left-0 top-8 w-[24px] h-[24px] rounded-full bg-white border-[3px] border-[var(--color-border)] shadow-sm"></div>
              <div className="bg-white border border-[var(--color-border)] p-7 rounded-2xl hover:border-[var(--color-accent)]/40 hover:shadow-md spring">
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-[var(--color-primary)] mb-1">한국언론진흥재단</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">프리랜서 · PL/AA</p>
                  <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">2020.08 - 2025.12 (5년 4개월)</p>
                </div>

                <div className="border-l-[3px] border-[var(--color-border)] pl-5 mb-5">
                  <p className="font-semibold text-base mb-3">정부광고통합지원시스템</p>
                  <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                    <BulletItem>Jenkins 기반 CI/CD 파이프라인 구축 (배포 시간 30분 → 5분 단축)</BulletItem>
                    <BulletItem>NCP 활용 고가용성 인프라 구축 (세션 클러스터링, 무중단 배포)</BulletItem>
                    <BulletItem>실시간 모니터링/알림 체계 구축 및 장애 대응</BulletItem>
                    <BulletItem>BizTalk 카카오 알림톡, ePapyrus PDF 솔루션 연계 개발</BulletItem>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['Java', 'Spring', 'Oracle', 'NCP', 'Jenkins', 'WebtoB', 'JEUS'].map((tech) => (
                    <TechTag key={tech}>{tech}</TechTag>
                  ))}
                </div>
              </div>
            </div>

            {/* 아이티파트너스 */}
            <div className="relative pl-12 reveal">
              <div className="absolute left-0 top-8 w-[24px] h-[24px] rounded-full bg-white border-[3px] border-[var(--color-border)] shadow-sm"></div>
              <div className="bg-white border border-[var(--color-border)] p-7 rounded-2xl hover:border-[var(--color-accent)]/40 hover:shadow-md spring">
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-[var(--color-primary)] mb-1">아이티파트너스</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">정규직 · 개발자</p>
                  <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">2017.10 - 2020.07 (2년 9개월)</p>
                </div>

                <div className="border-l-[3px] border-[var(--color-border)] pl-5 mb-5">
                  <p className="font-semibold text-base mb-3">공공기관 SI 프로젝트 (한국과학기술연구원, 농림식품기술평가원 등)</p>
                  <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                    <BulletItem>레거시 시스템 현대화 (T-Form → Nexacro 플랫폼 전환)</BulletItem>
                    <BulletItem>연구물품 재고 및 입출고 관리 시스템 구축 (수기 관리 → DB화)</BulletItem>
                    <BulletItem>RESTful API 기반 내부 ERP 연동 모듈 개발</BulletItem>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['Java', 'Spring', 'Nexacro', 'Oracle', 'RESTful API'].map((tech) => (
                    <TechTag key={tech}>{tech}</TechTag>
                  ))}
                </div>
              </div>
            </div>

            {/* 크레비즈, 큐로드 */}
            <div className="relative pl-12 reveal">
              <div className="absolute left-0 top-8 w-[24px] h-[24px] rounded-full bg-white border-[3px] border-[var(--color-border)] shadow-sm"></div>
              <div className="bg-white border border-[var(--color-border)] p-7 rounded-2xl hover:border-[var(--color-accent)]/40 hover:shadow-md spring">
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-[var(--color-primary)] mb-1">크레비즈, 큐로드</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">프리랜서 · 정규직 혼합</p>
                  <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">2014.12 - 2015.11 (1년)</p>
                </div>

                <div className="space-y-5 mb-5">
                  <div className="border-l-[3px] border-[var(--color-border)] pl-5">
                    <p className="font-semibold text-base mb-1">크레비즈</p>
                    <p className="text-xs text-[var(--color-text-muted)] mb-3">ERP 물류 모듈 및 대시보드 개발</p>
                    <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                      <BulletItem>부품 입출고, 재고, 출하 등의 관리 기능 통합 개발</BulletItem>
                      <BulletItem>재고 출하 요청 데이터를 ERP 테이블과 실시간 연동</BulletItem>
                      <BulletItem>실시간 재고 현황 및 입출고 이력 조회 대시보드 구현 (Highchart)</BulletItem>
                      <BulletItem>Excel 업로드 기능으로 보고서 작성 시간 약 70% 단축</BulletItem>
                    </ul>
                  </div>

                  <div className="border-l-[3px] border-[var(--color-border)] pl-5">
                    <p className="font-semibold text-base mb-1">큐로드</p>
                    <p className="text-xs text-[var(--color-text-muted)] mb-3">고객 문의 및 QA 검수 시스템 개발</p>
                    <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                      <BulletItem>QA 업체의 테스트 결과 입력 → 검증 → 승인 기능 개발</BulletItem>
                      <BulletItem>고객센터 문의 접수 및 이메일 답변 처리 시스템 구축</BulletItem>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['Java', 'Spring', 'MySQL', 'Highchart', 'Excel API'].map((tech) => (
                    <TechTag key={tech}>{tech}</TechTag>
                  ))}
                </div>
              </div>
            </div>

            {/* NHN엔터테인먼트 */}
            <div className="relative pl-12 reveal">
              <div className="absolute left-0 top-8 w-[24px] h-[24px] rounded-full bg-white border-[3px] border-[var(--color-border)] shadow-sm"></div>
              <div className="bg-white border border-[var(--color-border)] p-7 rounded-2xl hover:border-[var(--color-accent)]/40 hover:shadow-md spring">
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-[var(--color-primary)] mb-1">NHN엔터테인먼트</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">정규직 · 개발자</p>
                  <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">2012.12 - 2014.12 (2년)</p>
                </div>

                <div className="border-l-[3px] border-[var(--color-border)] pl-5 mb-5">
                  <p className="font-semibold text-base mb-3">게임 운영 서비스 (위닝일레븐온라인2, 풋볼데이 등)</p>
                  <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                    <BulletItem>게임 포털/이벤트 페이지 개발 및 운영</BulletItem>
                    <BulletItem>jQuery/Ajax 비동기 UI 구현으로 로딩 속도 개선</BulletItem>
                    <BulletItem>운영자용 게임 관리 콘솔(CMS) 개발 (쿠폰/상품 지급 기능)</BulletItem>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['Java', 'Spring', 'MySQL', 'jQuery', 'Ajax'].map((tech) => (
                    <TechTag key={tech}>{tech}</TechTag>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 md:py-32 bg-[var(--color-bg-light)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-12 reveal">
            <p className="text-sm font-mono font-medium text-[var(--color-accent)] tracking-wider mb-3">PROJECTS</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">운영 환경에서 바로 활용 가능한 프로젝트들</h2>
          </div>

          {/* Auto-scrolling marquee - JS transform 기반 + 화살표 */}
          <div
            className="relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--color-bg-light)] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--color-bg-light)] to-transparent z-10 pointer-events-none"></div>

            {/* Arrow buttons */}
            <button
              onClick={() => scrollByCard(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-[var(--color-border)] shadow-md flex items-center justify-center hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95 spring"
            >
              <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scrollByCard(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-[var(--color-border)] shadow-md flex items-center justify-center hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95 spring"
            >
              <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div ref={marqueeRef} className="flex gap-6 pb-6 pt-4 w-max">
            {[0, 1].map((setIndex) => (
              <div key={setIndex} className="flex gap-6 flex-shrink-0">
                {/* ENG-SPARKLING */}
                <div className="flex-shrink-0 w-[85vw] sm:w-[380px] md:w-[420px]">
                  <div className="relative bg-white border border-[var(--color-accent)]/30 p-7 h-full rounded-2xl shadow-sm hover:shadow-lg spring group">
                    <div className="absolute -top-2.5 left-5 px-3 py-0.5 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white text-xs font-semibold rounded-md">
                      MAIN
                    </div>
                    <div className="space-y-5 h-full flex flex-col">
                      <div className="flex-1 space-y-3">
                        <h3 className="text-lg font-bold">ENG-SPARKLING</h3>
                        <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                          수능/내신 영어 지문을 입력하면 <span className="font-mono font-semibold text-[var(--color-accent)]">GPT-4o-mini</span>가 12가지 유형의 문제를 자동 생성.{' '}
                          <span className="font-mono font-semibold text-[var(--color-accent)]">Supabase</span> 기반 인증 + 코인 시스템과{' '}
                          <span className="font-mono font-semibold text-[var(--color-accent)]">토스페이먼츠</span> 결제 연동까지 구현한 풀스택 서비스.
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {['Next.js 15', 'TypeScript', 'OpenAI API', 'Supabase', 'Tailwind CSS', 'Docker'].map((tag) => (
                            <TechTag key={tag}>{tag}</TechTag>
                          ))}
                        </div>
                      </div>
                      <a href="https://thmm.kr/eng-sparkling" target="_blank" rel="noopener noreferrer" className="block text-center px-4 py-2.5 bg-[var(--color-accent)] text-white font-semibold text-sm rounded-xl shadow-sm shadow-emerald-500/20 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] spring">
                        Live Demo
                      </a>
                    </div>
                  </div>
                </div>

                {/* Flash Coupon */}
                <div className="flex-shrink-0 w-[85vw] sm:w-[380px] md:w-[420px]">
                  <div className="relative bg-white border border-[var(--color-border)] p-7 h-full rounded-2xl hover:border-[var(--color-accent)]/40 hover:shadow-lg spring">
                    <div className="absolute -top-2.5 left-5 px-3 py-0.5 bg-[var(--color-secondary)] text-white text-xs font-semibold rounded-md">
                      운영중
                    </div>
                    <div className="space-y-5 h-full flex flex-col">
                      <div className="flex-1 space-y-3">
                        <h3 className="text-lg font-bold">Flash Coupon</h3>
                        <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                          다량의 쿠폰 발급/사용 요청을 <span className="font-mono font-semibold text-[var(--color-accent)]">Redis</span>로 버퍼링하고{' '}
                          <span className="font-mono font-semibold text-[var(--color-accent)]">PostgreSQL</span>로 영속화하여 안정성을 확보한 서비스.
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {['NestJS', 'TypeScript', 'Redis', 'PostgreSQL', 'Next.js', 'Docker'].map((tag) => (
                            <TechTag key={tag}>{tag}</TechTag>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <a href="https://thmm.kr/flash-coupon" target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-4 py-2.5 bg-[var(--color-primary)] text-white font-semibold text-sm rounded-xl hover:shadow-md hover:scale-[1.02] active:scale-[0.98] spring">
                          Live Demo
                        </a>
                        <a href="https://thmm.kr/api/docs" target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-4 py-2.5 bg-white text-[var(--color-primary)] font-semibold text-sm border border-[var(--color-border)] rounded-xl hover:border-[var(--color-accent)] hover:shadow-md hover:scale-[1.02] active:scale-[0.98] spring">
                          API Docs
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* JWT Auth System */}
                <div className="flex-shrink-0 w-[85vw] sm:w-[380px] md:w-[420px]">
                  <div className="relative bg-white border border-[var(--color-border)] p-7 h-full rounded-2xl hover:border-[var(--color-accent)]/40 hover:shadow-lg spring">
                    <div className="absolute -top-2.5 left-5 px-3 py-0.5 bg-[var(--color-secondary)] text-white text-xs font-semibold rounded-md">
                      운영중
                    </div>
                    <div className="space-y-5 h-full flex flex-col">
                      <div className="flex-1 space-y-3">
                        <h3 className="text-lg font-bold">JWT Auth System</h3>
                        <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                          Spring Boot 기반 JWT 인증 시스템. <span className="font-mono font-semibold">Redis 블랙리스트</span>와{' '}
                          <span className="font-mono font-semibold">Dual Token 정책</span>으로 보안을 강화하고, 관리자 기능으로 사용자 세션을 실시간 제어합니다.
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {['Spring Boot', 'Spring Security', 'JJWT', 'Redis', 'PostgreSQL', 'Docker'].map((tag) => (
                            <TechTag key={tag}>{tag}</TechTag>
                          ))}
                        </div>
                      </div>
                      <a href="https://thmm.kr/springboot-jwt" target="_blank" rel="noopener noreferrer" className="block text-center px-4 py-2.5 bg-[var(--color-primary)] text-white font-semibold text-sm rounded-xl hover:shadow-md hover:scale-[1.02] active:scale-[0.98] spring">
                        Live Demo
                      </a>
                    </div>
                  </div>
                </div>

                {/* 그랑베이 산후조리원 */}
                <div className="flex-shrink-0 w-[85vw] sm:w-[380px] md:w-[420px]">
                  <div className="relative bg-white border border-[var(--color-border)] p-7 h-full rounded-2xl hover:border-[var(--color-accent)]/40 hover:shadow-lg spring">
                    <div className="absolute -top-2.5 left-5 px-3 py-0.5 bg-amber-600 text-white text-xs font-semibold rounded-md">
                      외주
                    </div>
                    <div className="space-y-5 h-full flex flex-col">
                      <div className="flex-1 space-y-3">
                        <h3 className="text-lg font-bold">그랑베이 산후조리원</h3>
                        <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                          안양 소재 프리미엄 산후조리원의 반응형 홈페이지. <span className="font-mono font-semibold text-[var(--color-accent)]">Astro 6</span> 기반 정적 사이트로,
                          스크롤 기반 프레임 애니메이션 히어로, <span className="font-mono font-semibold text-[var(--color-accent)]">카카오맵</span> 연동,
                          시설/프로그램/식단/스파 등 9개 페이지를 호텔급 고급 브랜딩 컨셉으로 구현했습니다.
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {['Astro 6', 'Tailwind CSS 4', 'Kakao Map', 'Vercel'].map((tag) => (
                            <TechTag key={tag}>{tag}</TechTag>
                          ))}
                        </div>
                      </div>
                      <a href="https://astro-fawn-nu.vercel.app/" target="_blank" rel="noopener noreferrer" className="block text-center px-4 py-2.5 bg-[var(--color-primary)] text-white font-semibold text-sm rounded-xl hover:shadow-md hover:scale-[1.02] active:scale-[0.98] spring">
                        Live Demo
                      </a>
                    </div>
                  </div>
                </div>

                {/* ohmybaby 자리 - 연구 완료 후 추가 */}
              </div>
            ))}
          </div>

            <p className={`text-center text-xs mt-2 spring ${isPaused ? 'opacity-60 text-[var(--color-accent)]' : 'opacity-30 text-[var(--color-text-muted)]'}`}>
              {isPaused ? '일시정지 — 화살표로 이동' : '마우스를 올리면 멈춥니다'}
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-6 py-24 md:py-32 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 reveal">
            <p className="text-sm font-mono font-medium text-[var(--color-accent)] tracking-wider mb-3">ABOUT</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">사용자 경험과 안정성을 함께 챙기는 풀스택 개발자</h2>
          </div>

          <div className="grid md:grid-cols-[1.2fr,0.8fr] gap-10 items-start">
            {/* Philosophy */}
            <div className="space-y-8 reveal">
              <div className="space-y-5">
                {[
                  { text: '완벽한 설계보다 빠르게 작동하는 MVP를 먼저 만듭니다.', sub: '돌아가는 코드가 있어야 병목과 개선점이 보이기 때문입니다.' },
                  { text: '팀이 읽기 좋은 코드가 좋은 코드라고 믿습니다.', sub: '명확한 인터페이스와 문서화로 누구나 빠르게 이해할 수 있도록 합니다.' },
                  { text: '코드 리뷰와 페어 프로그래밍으로 함께 더 나은 방법을 찾는 과정을 즐깁니다.', sub: '서로 배우며 성장하는 팀을 지향합니다.' },
                  { text: 'AI를 적극 활용하여 개발 생산성을 높입니다.', sub: 'Claude Code, Cursor 등 AI 도구를 실무에 접목해 핵심 로직에 집중합니다.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <span className="w-1 h-full min-h-[3rem] bg-[var(--color-accent)]/20 rounded-full flex-shrink-0"></span>
                    <div>
                      <p className="text-base font-semibold text-[var(--color-text)] leading-relaxed">{item.text}</p>
                      <p className="text-sm text-[var(--color-text-muted)] mt-1">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5">
                {['API 문서화 & Swagger', 'Redis 캐시/큐로 성능 튜닝', 'Docker · Nginx로 다중 서비스 배포', 'AI 도구 활용 개발'].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-[var(--color-text)] bg-[var(--color-bg-light)] px-3.5 py-2.5 rounded-lg">
                    <span className="w-4 h-4 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"></span>
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack Card */}
            <div className="bg-[var(--color-bg-light)] border border-[var(--color-border)] p-7 rounded-2xl reveal">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Developer</p>
                    <p className="text-xl font-bold">신성무</p>
                  </div>
                  <span className="px-2.5 py-1 border border-[var(--color-accent)]/40 text-[var(--color-accent)] text-xs font-semibold rounded-md bg-[var(--color-accent)]/5">
                    FULL-STACK
                  </span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: 'Backend', value: 'Java · Spring Boot · Node.js' },
                    { label: 'Frontend', value: 'HTML · CSS · JavaScript · jQuery' },
                    { label: 'Database', value: 'Oracle · MySQL · PostgreSQL · Redis' },
                    { label: 'Infra', value: 'NCP · AWS · OCI' },
                    { label: 'CI/CD', value: 'GitLab · Jenkins · Git' },
                    { label: 'AI Tools', value: 'Claude Code · Cursor · ChatGPT' },
                  ].map((item) => (
                    <div key={item.label} className="bg-white border border-[var(--color-border)] p-3 rounded-xl hover:border-[var(--color-accent)]/40 spring">
                      <p className="text-xs text-[var(--color-text-muted)] mb-0.5">{item.label}</p>
                      <p className="font-mono text-sm font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">CONTACT</p>
                  <a
                    href="mailto:ongsya@gmail.com"
                    className="font-mono text-sm font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-2 spring"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    ongsya@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center border-t border-[var(--color-border)]">
        <p className="text-[var(--color-text-muted)] text-xs">&copy; 2026 THMM. Crafted with TypeScript & Next.js</p>
      </footer>
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [activeProject, setActiveProject] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const totalProjects = 4; // 전체 프로젝트 수

  useEffect(() => {
    const container = document.getElementById('projects-scroll');
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = 500 + 32; // 카드 너비 + gap
      const index = Math.round(scrollLeft / cardWidth);
      setActiveProject(Math.min(index, totalProjects - 1));
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 페이지 섹션 스크롤 감지
  useEffect(() => {
    const handlePageScroll = () => {
      const sections = ['home', 'experience', 'projects', 'about'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (section) {
          const { offsetTop, offsetHeight } = section;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handlePageScroll);
    handlePageScroll(); // 초기 실행
    return () => window.removeEventListener('scroll', handlePageScroll);
  }, []);

  const sections = [
    { id: 'home', label: 'Home' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'about', label: 'About' },
  ];

  return (
    <main className="min-h-screen bg-[var(--color-bg-light)]">
      {/* Page Section Navigation - 오른쪽 고정 */}
      <nav className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-50">
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
                  className={`block transition-all duration-300 ${
                    activeSection === section.id
                      ? 'w-12 h-1 bg-[var(--color-accent)]'
                      : 'w-8 h-1 bg-[var(--color-border)] group-hover:bg-[var(--color-text-muted)] group-hover:w-10'
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b-2 border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a
            href="#home"
            className="text-xl font-bold text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors"
          >
            THMM
          </a>
          <div className="flex gap-8 text-sm font-semibold">
            {[
              { href: '#home', label: 'Home' },
              { href: '#experience', label: 'Experience' },
              { href: '#projects', label: 'Projects' },
              { href: '#about', label: 'About' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-accent)] group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center px-6 pt-24 pb-20 relative overflow-hidden bg-gradient-to-b from-white via-[var(--color-bg-off)] to-white">
        {/* Background decoration - 더 은은하게 */}
        <div className="absolute top-20 right-10 w-72 h-72 border-2 border-[var(--color-accent)] opacity-10 rotate-12"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 border-2 border-[var(--color-secondary)] opacity-5 -rotate-6"></div>

        <div className="max-w-5xl mx-auto w-full relative z-10">
          <div className="space-y-10">
            {/* Main headline */}
            <div className="space-y-6 animate-fadeInUp">
              <div className="space-y-3">
                <h1 className="text-6xl md:text-7xl font-black leading-tight tracking-tight">
                  안녕하세요,
                  <br />
                  <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] bg-clip-text text-transparent">
                    개발자
                  </span>{' '}
                  신성무입니다.
                </h1>
              </div>

              <div className="max-w-3xl space-y-4">
                <p className="text-xl leading-relaxed font-medium text-[var(--color-text)]">
                  약 10년간 공공 SI, 게임, 물류 등 다양한 분야에서 개발을 수행했습니다.
                </p>
                <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
                  현재는 한국언론진흥재단에서 PL/AA로 프로젝트를 리딩하며, 서비스의 안정성과 운영 효율성을 높이는 데 집중하고 있습니다.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 animate-fadeInUp" style={{ animationDelay: '0.2s', opacity: 0 }}>
              <a
                href="#experience"
                className="px-8 py-4 bg-[var(--color-primary)] text-white font-bold border-2 border-[var(--color-primary)] shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                경력 보기
              </a>
              <a
                href="#projects"
                className="px-8 py-4 bg-white text-[var(--color-primary)] font-bold border-2 border-[var(--color-primary)] shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                프로젝트 보기
              </a>
              <a
                href="/resume.pdf"
                download
                className="px-8 py-4 bg-[var(--color-accent)] text-white font-bold border-2 border-[var(--color-accent)] shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                이력서 다운로드
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="px-6 py-32 bg-[var(--color-bg-soft)] relative">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-1 bg-[var(--color-accent)]"></div>
              <h2 className="text-5xl font-black">Experience</h2>
            </div>
            <p className="text-xl text-[var(--color-text-muted)] ml-16">약 10년간의 실무 경력</p>
          </div>

          {/* Timeline - 세로 배치 */}
          <div className="space-y-8 relative before:absolute before:left-6 before:top-0 before:bottom-0 before:w-0.5 before:bg-[var(--color-border)]">
            {/* 한국언론진흥재단 */}
            <div className="relative pl-16">
              <div className="absolute left-4 top-6 w-5 h-5 rounded-full bg-[var(--color-accent)] border-4 border-white shadow-md"></div>
              <div className="bg-white border-2 border-[var(--color-accent)] p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div>
                    <div className="inline-block px-3 py-1 bg-[var(--color-accent)] text-white text-xs font-bold mb-3">
                      재직중
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-2">한국언론진흥재단</h3>
                    <p className="text-[var(--color-text-muted)] mb-1">프리랜서 · PL/AA</p>
                    <p className="text-sm text-[var(--color-text-muted)] font-mono">2020.08 - 현재 (5년 4개월)</p>
                  </div>
                </div>

                <div className="border-l-4 border-[var(--color-accent-light)] pl-6 mb-6">
                  <p className="font-bold text-lg mb-3">정부광고통합지원시스템</p>
                  <ul className="space-y-2 text-[var(--color-text-muted)]">
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--color-accent)] mt-1.5">•</span>
                      <span>Jenkins 기반 CI/CD 파이프라인 구축 (배포 시간 30분 → 5분 단축)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--color-accent)] mt-1.5">•</span>
                      <span>NCP 활용 고가용성 인프라 구축 (세션 클러스터링, 무중단 배포)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--color-accent)] mt-1.5">•</span>
                      <span>실시간 모니터링/알림 체계 구축 및 장애 대응</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--color-accent)] mt-1.5">•</span>
                      <span>BizTalk 카카오 알림톡, ePapyrus PDF 솔루션 연계 개발</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Java', 'Spring', 'Oracle', 'NCP', 'Jenkins', 'WebtoB', 'JEUS'].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 border border-[var(--color-border)] bg-[var(--color-bg-off)] font-mono text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-light)] transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 아이티파트너스 */}
            <div className="relative pl-16">
              <div className="absolute left-4 top-6 w-5 h-5 rounded-full bg-white border-4 border-[var(--color-border)] shadow-md"></div>
              <div className="bg-white border-2 border-[var(--color-border)] p-8 hover:border-[var(--color-accent)] hover:shadow-lg transition-all duration-300">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-2">아이티파트너스</h3>
                  <p className="text-[var(--color-text-muted)] mb-1">정규직 · 개발자</p>
                  <p className="text-sm text-[var(--color-text-muted)] font-mono">2017.10 - 2020.07 (2년 9개월)</p>
                </div>

                <div className="mb-6">
                  <p className="font-bold mb-3">공공기관 SI 프로젝트 (한국과학기술연구원, 농림식품기술평가원 등)</p>
                  <ul className="space-y-2 text-[var(--color-text-muted)]">
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--color-text-muted)] mt-1.5">•</span>
                      <span>레거시 시스템 현대화 (T-Form → Nexacro 플랫폼 전환)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--color-text-muted)] mt-1.5">•</span>
                      <span>연구물품 재고 및 입출고 관리 시스템 구축 (수기 관리 → DB화)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--color-text-muted)] mt-1.5">•</span>
                      <span>RESTful API 기반 내부 ERP 연동 모듈 개발</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Java', 'Spring', 'Nexacro', 'Oracle', 'RESTful API'].map((tech) => (
                    <span key={tech} className="px-3 py-1 border border-[var(--color-border)] bg-[var(--color-bg-off)] font-mono text-xs font-semibold text-[var(--color-text)]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 큐로드 */}
            <div className="relative pl-16">
              <div className="absolute left-4 top-6 w-5 h-5 rounded-full bg-white border-4 border-[var(--color-border)] shadow-md"></div>
              <div className="bg-white border-2 border-[var(--color-border)] p-8 hover:border-[var(--color-accent)] hover:shadow-lg transition-all duration-300">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-2">주식회사 큐로드</h3>
                  <p className="text-[var(--color-text-muted)] mb-1">계약직 · 개발자</p>
                  <p className="text-sm text-[var(--color-text-muted)] font-mono">2015.11 (1개월)</p>
                </div>

                <div className="mb-6">
                  <ul className="space-y-2 text-[var(--color-text-muted)]">
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--color-text-muted)] mt-1.5">•</span>
                      <span>QA 검수 시스템 개발 (테스트 결과 입력 → 검증 → 승인 프로세스)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--color-text-muted)] mt-1.5">•</span>
                      <span>고객센터 문의 접수 및 이메일 답변 처리 시스템 구축</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Java', 'Spring', 'MySQL'].map((tech) => (
                    <span key={tech} className="px-3 py-1 border border-[var(--color-border)] bg-[var(--color-bg-off)] font-mono text-xs font-semibold text-[var(--color-text)]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* NHN엔터테인먼트 */}
            <div className="relative pl-16">
              <div className="absolute left-4 top-6 w-5 h-5 rounded-full bg-white border-4 border-[var(--color-border)] shadow-md"></div>
              <div className="bg-white border-2 border-[var(--color-border)] p-8 hover:border-[var(--color-accent)] hover:shadow-lg transition-all duration-300">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-2">NHN엔터테인먼트</h3>
                  <p className="text-[var(--color-text-muted)] mb-1">정규직 · 개발자</p>
                  <p className="text-sm text-[var(--color-text-muted)] font-mono">2012.12 - 2014.12 (2년)</p>
                </div>

                <div className="mb-6">
                  <p className="font-bold mb-3">게임 운영 서비스 (위닝일레븐온라인2, 풋볼데이 등)</p>
                  <ul className="space-y-2 text-[var(--color-text-muted)]">
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--color-text-muted)] mt-1.5">•</span>
                      <span>게임 포털/이벤트 페이지 개발 및 운영</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--color-text-muted)] mt-1.5">•</span>
                      <span>jQuery/Ajax 비동기 UI 구현으로 로딩 속도 개선</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--color-text-muted)] mt-1.5">•</span>
                      <span>운영자용 게임 관리 콘솔(CMS) 개발 (쿠폰/상품 지급 기능)</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Java', 'Spring', 'MySQL', 'jQuery', 'Ajax'].map((tech) => (
                    <span key={tech} className="px-3 py-1 border border-[var(--color-border)] bg-[var(--color-bg-off)] font-mono text-xs font-semibold text-[var(--color-text)]">
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
      <section id="projects" className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-1 bg-[var(--color-accent)]"></div>
              <h2 className="text-5xl font-black">Projects</h2>
            </div>
            <p className="text-xl text-[var(--color-text-muted)] ml-16">운영 환경에서 바로 활용 가능한 프로젝트들</p>
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div className="relative max-w-7xl mx-auto px-6">
          {/* Left Arrow */}
          <button
            onClick={() => {
              const container = document.getElementById('projects-scroll');
              if (container) container.scrollBy({ left: -520, behavior: 'smooth' });
            }}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-white border-2 border-[var(--color-border)] shadow-lg hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-all"
            aria-label="이전 프로젝트"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => {
              const container = document.getElementById('projects-scroll');
              if (container) container.scrollBy({ left: 520, behavior: 'smooth' });
            }}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-white border-2 border-[var(--color-border)] shadow-lg hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-all"
            aria-label="다음 프로젝트"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div id="projects-scroll" className="flex gap-6 md:gap-8 overflow-x-auto pb-8 pt-6 -mx-6 px-6 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="w-2 flex-shrink-0"></div>

            {/* ENG-SPARKLING Card */}
            <div className="flex-shrink-0 w-[85vw] sm:w-[450px] md:w-[500px] snap-start">
              <div className="relative border-2 border-[var(--color-accent)] bg-white p-8 h-full hover:shadow-xl transition-all duration-300 shadow-lg">
                <div className="absolute -top-3 left-6 px-4 py-1 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white text-xs font-bold">
                  MAIN
                </div>

                <div className="space-y-6 h-full flex flex-col">
                  <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-bold">ENG-SPARKLING</h3>
                    <p className="text-base leading-relaxed text-[var(--color-text-muted)]">
                      수능/내신 영어 지문을 입력하면 <span className="font-mono font-semibold text-[var(--color-accent)]">GPT-4o-mini</span>가 12가지 유형의 문제를 자동 생성.{' '}
                      <span className="font-mono font-semibold text-[var(--color-accent)]">Supabase</span> 기반 인증 + 코인 시스템과{' '}
                      <span className="font-mono font-semibold text-[var(--color-accent)]">토스페이먼츠</span> 결제 연동까지 구현한 풀스택 서비스.
                    </p>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-2">
                      {['Next.js 15', 'TypeScript', 'OpenAI API', 'Supabase', 'Tailwind CSS', 'Docker'].map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 border border-[var(--color-border)] bg-[var(--color-bg-off)] font-mono text-xs font-semibold hover:border-[var(--color-accent)] transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Button */}
                  <div>
                    <a
                      href="https://thmm.kr/eng-sparkling"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center px-4 py-3 bg-[var(--color-accent)] text-white font-semibold text-sm border-2 border-[var(--color-accent)] hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      Live Demo
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Flash Coupon Card */}
            <div className="flex-shrink-0 w-[85vw] sm:w-[450px] md:w-[500px] snap-start">
              <div className="relative border-2 border-[var(--color-border)] bg-white p-8 h-full hover:border-[var(--color-accent)] hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-3 left-6 px-4 py-1 bg-[var(--color-secondary)] text-white text-xs font-bold">
                  운영중
                </div>

                <div className="space-y-6 h-full flex flex-col">
                  <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-bold">Flash Coupon</h3>
                    <p className="text-base leading-relaxed text-[var(--color-text-muted)]">
                      다량의 쿠폰 발급/사용 요청을 <span className="font-mono font-semibold text-[var(--color-accent)]">Redis</span>로 버퍼링하고{' '}
                      <span className="font-mono font-semibold text-[var(--color-accent)]">PostgreSQL</span>로 영속화하여 안정성을 확보한 서비스.
                    </p>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-2">
                      {['NestJS', 'TypeScript', 'Redis', 'PostgreSQL', 'Next.js', 'Docker'].map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 border border-[var(--color-border)] bg-[var(--color-bg-off)] font-mono text-xs font-semibold hover:border-[var(--color-accent)] transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <a
                      href="https://thmm.kr/flash-coupon"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-4 py-3 bg-[var(--color-primary)] text-white font-semibold text-sm border-2 border-[var(--color-primary)] hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      Live Demo
                    </a>
                    <a
                      href="https://thmm.kr/api/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-4 py-3 bg-white text-[var(--color-primary)] font-semibold text-sm border-2 border-[var(--color-primary)] hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      API Docs
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* JWT Auth System Card */}
            <div className="flex-shrink-0 w-[85vw] sm:w-[450px] md:w-[500px] snap-start">
              <div className="relative border-2 border-[var(--color-border)] bg-white p-8 h-full hover:border-[var(--color-accent)] hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-3 left-6 px-4 py-1 bg-[var(--color-secondary)] text-white text-xs font-bold">
                  운영중
                </div>

                <div className="space-y-6 h-full flex flex-col">
                  <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-bold">JWT Auth System</h3>
                    <p className="text-base leading-relaxed text-[var(--color-text-muted)]">
                      Spring Boot 기반 JWT 인증 시스템. <span className="font-mono font-semibold">Redis 블랙리스트</span>와{' '}
                      <span className="font-mono font-semibold">Dual Token 정책</span>으로 보안을 강화하고, 관리자 기능으로 사용자 세션을 실시간 제어합니다.
                    </p>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-2">
                      {['Spring Boot', 'Spring Security', 'JJWT', 'Redis', 'PostgreSQL', 'Docker'].map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 border border-[var(--color-border)] bg-[var(--color-bg-off)] font-mono text-xs font-semibold hover:border-[var(--color-accent)] transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Button */}
                  <div>
                    <a
                      href="https://thmm.kr/springboot-jwt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center px-4 py-3 bg-[var(--color-primary)] text-white font-semibold text-sm border-2 border-[var(--color-primary)] hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      Live Demo
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Chat Service Card */}
            <div className="flex-shrink-0 w-[85vw] sm:w-[450px] md:w-[500px] snap-start">
              <div className="relative border-2 border-[var(--color-border)] bg-white p-8 h-full hover:border-[var(--color-accent)] hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-3 left-6 px-4 py-1 bg-purple-600 text-white text-xs font-bold">
                  개발중
                </div>

                <div className="space-y-6 h-full flex flex-col">
                  <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-bold">Real-time Chat Service</h3>
                    <p className="text-base leading-relaxed text-[var(--color-text-muted)]">
                      WebSocket 기반 실시간 채팅 서비스.
                      <span className="font-mono font-semibold">Redis Pub/Sub</span>으로 다중 서버 환경에서의 메시지 동기화를 구현했습니다.
                    </p>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-2">
                      {['Node.js', 'Socket.io', 'Redis', 'MongoDB', 'Vue.js'].map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 border border-[var(--color-border)] bg-[var(--color-bg-off)] font-mono text-xs font-semibold hover:border-[var(--color-accent)] transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Button */}
                  <div>
                    <button
                      disabled
                      className="block w-full text-center px-4 py-3 bg-gray-300 text-gray-500 font-semibold text-sm border-2 border-gray-300 cursor-not-allowed"
                    >
                      In Development
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-8 flex-shrink-0"></div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center items-center gap-2 mt-8">
            {Array.from({ length: totalProjects }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const container = document.getElementById('projects-scroll');
                  if (container) {
                    const cardWidth = 500 + 32; // 카드 너비 + gap
                    container.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
                  }
                }}
                className={`transition-all duration-300 ${
                  activeProject === index
                    ? 'w-8 h-2 bg-[var(--color-accent)]'
                    : 'w-2 h-2 bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]'
                }`}
                aria-label={`프로젝트 ${index + 1}로 이동`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-6 py-32 bg-[var(--color-bg-soft)]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-1 bg-[var(--color-accent)]"></div>
              <h2 className="text-5xl font-black">About</h2>
            </div>
            <p className="text-xl text-[var(--color-text-muted)] ml-16">사용자 경험과 안정성을 함께 챙기는 풀스택 개발자</p>
          </div>

          <div className="grid md:grid-cols-[1.2fr,0.8fr] gap-12 items-start">
            {/* Philosophy */}
            <div className="space-y-8">
              <div className="border-l-4 border-[var(--color-accent)] pl-6 space-y-4">
                <p className="text-lg leading-relaxed text-[var(--color-text)]">
                  완벽한 설계보다 <span className="font-semibold">빠르게 작동하는 MVP</span>를 먼저 만드는 편입니다. 돌아가는 코드가 있어야 로그와 지표를 통해 병목과 개선점이 보이기 때문입니다.
                </p>
                <p className="text-lg leading-relaxed text-[var(--color-text)]">
                  혼자 잘 짜는 것보다 <span className="font-semibold">팀이 읽기 좋은 코드</span>가 더 중요하다고 믿습니다. 명확한 인터페이스 설계와 문서화로 누구나 빠르게 이해할 수 있는 코드를 지향합니다.
                </p>
                <p className="text-lg leading-relaxed text-[var(--color-text)]">
                  코드 리뷰와 페어 프로그래밍을 통해 <span className="font-semibold">더 나은 방법을 함께 찾아가는 과정</span>을 즐깁니다. 서로 배우며 팀 전체의 코드 품질이 높아지는 경험을 해왔습니다.
                </p>
              </div>

              {/* Skills */}
              <div className="grid sm:grid-cols-2 gap-3">
                {['API 문서화 & Swagger', 'Redis 캐시/큐로 성능 튜닝', 'Docker · Nginx로 다중 서비스 배포', '프론트엔드 상태/폼 관리'].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-[var(--color-text)]">
                    <span className="text-[var(--color-accent)] mt-1">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="border-2 border-[var(--color-border)] bg-white p-8 shadow-lg">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-[var(--color-border)] pb-4">
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)]">Developer</p>
                    <p className="text-2xl font-bold">신성무</p>
                  </div>
                  <div className="px-3 py-1 border border-[var(--color-accent)] text-[var(--color-accent)] text-xs font-bold">
                    FULL-STACK
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Backend', value: 'Java · Spring Boot · Node.js' },
                    { label: 'Frontend', value: 'HTML · CSS · JavaScript · jQuery' },
                    { label: 'Database', value: 'Oracle · MySQL · PostgreSQL · Redis' },
                    { label: 'Infra', value: 'NCP · AWS · OCI' },
                    { label: 'CI/CD', value: 'GitLab · Jenkins · Git' },
                  ].map((item) => (
                    <div key={item.label} className="border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-off)] transition-colors">
                      <p className="text-xs text-[var(--color-text-muted)] mb-1">{item.label}</p>
                      <p className="font-mono text-sm font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t-2 border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">CONTACT</p>
                  <a
                    href="mailto:ongsya@gmail.com"
                    className="font-mono font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-2"
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
      <footer className="py-12 text-center bg-white border-t-2 border-[var(--color-border)]">
        <p className="text-[var(--color-text-muted)] text-sm">© 2024 THMM. Crafted with TypeScript & Next.js</p>
      </footer>
    </main>
  );
}

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ProjectsList from '../_components/ProjectsList';

export default function Home() {
  const [activeSection, setActiveSection] = useState('home');
  const tNav = useTranslations('nav');
  const tHero = useTranslations('hero');
  const tExp = useTranslations('experience');

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
    { id: 'home', label: tNav('home') },
    { id: 'experience', label: tNav('experience') },
    { id: 'projects', label: tNav('projects') },
    { id: 'about', label: tNav('about') },
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
          <div className="flex gap-5 sm:gap-8 text-sm font-medium">
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
            <Link
              href="/portfolio"
              className="relative py-1 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] spring"
            >
              {tNav('caseStudies')}
            </Link>
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
              <p className="text-sm font-mono font-medium text-[var(--color-accent)] tracking-wider">{tHero('eyebrow')}</p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-wrap-balance">
                {tHero('greeting')}
                <br />
                <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] bg-clip-text text-transparent">
                  {tHero('roleHighlight')}
                </span>{' '}
                {tHero('roleSuffix')}
              </h1>

              <div className="max-w-2xl space-y-3">
                <p className="text-lg md:text-xl leading-relaxed font-medium text-[var(--color-text)]">
                  {tHero('lead')}
                </p>
                <p className="text-base md:text-lg text-[var(--color-text-muted)] leading-relaxed">
                  {tHero('sub')}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 animate-fadeInUp" style={{ animationDelay: '0.2s', opacity: 0 }}>
              <a
                href="#experience"
                className="px-7 py-3.5 bg-[var(--color-primary)] text-white font-semibold rounded-xl shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] spring"
              >
                {tHero('ctaExperience')}
              </a>
              <a
                href="#projects"
                className="px-7 py-3.5 bg-white text-[var(--color-primary)] font-semibold border border-[var(--color-border)] rounded-xl shadow-sm hover:shadow-md hover:border-[var(--color-accent)] hover:scale-[1.02] active:scale-[0.98] spring"
              >
                {tHero('ctaProjects')}
              </a>
              <Link
                href="/portfolio"
                className="px-7 py-3.5 bg-white text-[var(--color-accent)] font-semibold border border-[var(--color-accent)]/40 rounded-xl shadow-sm hover:shadow-md hover:bg-[var(--color-accent-light)] hover:scale-[1.02] active:scale-[0.98] spring inline-flex items-center gap-2"
              >
                <span>{tHero('ctaCaseStudies')}</span>
                <span aria-hidden>→</span>
              </Link>
              <a
                href="/resume.pdf"
                download
                className="px-7 py-3.5 bg-[var(--color-accent)] text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] spring"
              >
                {tHero('ctaResume')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="px-6 py-24 md:py-32 bg-white relative">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 reveal">
            <p className="text-sm font-mono font-medium text-[var(--color-accent)] tracking-wider mb-3">{tExp('eyebrow')}</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{tExp('heading')}</h2>
          </div>

          <div className="space-y-6 relative before:absolute before:left-[11px] before:top-0 before:bottom-0 before:w-[2px] before:bg-[var(--color-border)]">

            {/* 해양수산과학기술진흥원 */}
            <div className="relative pl-12 reveal">
              <div className="absolute left-0 top-8 w-[24px] h-[24px] rounded-full bg-[var(--color-accent)] border-4 border-white shadow-md shadow-emerald-500/20"></div>
              <div className="bg-[var(--color-bg-light)] border border-[var(--color-accent)]/30 p-7 rounded-2xl shadow-sm hover:shadow-md spring">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-[var(--color-accent)] text-white text-xs font-semibold rounded-md mb-3">
                      {tExp('currentBadge')}
                    </span>
                    <h3 className="text-xl font-bold text-[var(--color-primary)] mb-1">{tExp('kimst.name')}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{tExp('kimst.role')}</p>
                    <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">{tExp('kimst.tenure')}</p>
                  </div>
                </div>

                <div className="border-l-[3px] border-[var(--color-accent)]/30 pl-5 mb-5">
                  <p className="font-semibold text-base mb-3">{tExp('kimst.projectTitle')}</p>
                  <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                    {(tExp.raw('kimst.bullets') as string[]).map((bullet, idx) => (
                      <BulletItem accent key={idx}>{bullet}</BulletItem>
                    ))}
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
                  <h3 className="text-xl font-bold text-[var(--color-primary)] mb-1">{tExp('kpf.name')}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">{tExp('kpf.role')}</p>
                  <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">{tExp('kpf.tenure')}</p>
                </div>

                <div className="border-l-[3px] border-[var(--color-border)] pl-5 mb-5">
                  <p className="font-semibold text-base mb-3">{tExp('kpf.projectTitle')}</p>
                  <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                    {(tExp.raw('kpf.bullets') as string[]).map((bullet, idx) => (
                      <BulletItem key={idx}>{bullet}</BulletItem>
                    ))}
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
                  <h3 className="text-xl font-bold text-[var(--color-primary)] mb-1">{tExp('itpartners.name')}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">{tExp('itpartners.role')}</p>
                  <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">{tExp('itpartners.tenure')}</p>
                </div>

                <div className="border-l-[3px] border-[var(--color-border)] pl-5 mb-5">
                  <p className="font-semibold text-base mb-3">{tExp('itpartners.projectTitle')}</p>
                  <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                    {(tExp.raw('itpartners.bullets') as string[]).map((bullet, idx) => (
                      <BulletItem key={idx}>{bullet}</BulletItem>
                    ))}
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
                  <h3 className="text-xl font-bold text-[var(--color-primary)] mb-1">{tExp('crebiz.name')}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">{tExp('crebiz.role')}</p>
                  <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">{tExp('crebiz.tenure')}</p>
                </div>

                <div className="space-y-5 mb-5">
                  <div className="border-l-[3px] border-[var(--color-border)] pl-5">
                    <p className="font-semibold text-base mb-1">{tExp('crebiz.crebizTitle')}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mb-3">{tExp('crebiz.crebizSubtitle')}</p>
                    <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                      {(tExp.raw('crebiz.crebizBullets') as string[]).map((bullet, idx) => (
                        <BulletItem key={idx}>{bullet}</BulletItem>
                      ))}
                    </ul>
                  </div>

                  <div className="border-l-[3px] border-[var(--color-border)] pl-5">
                    <p className="font-semibold text-base mb-1">{tExp('crebiz.qloadTitle')}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mb-3">{tExp('crebiz.qloadSubtitle')}</p>
                    <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                      {(tExp.raw('crebiz.qloadBullets') as string[]).map((bullet, idx) => (
                        <BulletItem key={idx}>{bullet}</BulletItem>
                      ))}
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
                  <h3 className="text-xl font-bold text-[var(--color-primary)] mb-1">{tExp('nhn.name')}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">{tExp('nhn.role')}</p>
                  <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">{tExp('nhn.tenure')}</p>
                </div>

                <div className="border-l-[3px] border-[var(--color-border)] pl-5 mb-5">
                  <p className="font-semibold text-base mb-3">{tExp('nhn.projectTitle')}</p>
                  <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                    {(tExp.raw('nhn.bullets') as string[]).map((bullet, idx) => (
                      <BulletItem key={idx}>{bullet}</BulletItem>
                    ))}
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

          <div className="reveal">
            <ProjectsList />
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

          <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-10 items-start">
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

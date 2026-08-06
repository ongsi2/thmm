import CodeBlock from '../_components/CodeBlock';
import { cases, organizations } from '../_components/cases';
import {
  CaseHero,
  CaseSection,
  InsightList,
  ProcessSteps,
  OtherCases,
} from '../_components/CaseShell';
import { Pipeline } from '../_components/diagrams/Pipeline';

const scrollAnimationCode = `const TOTAL_FRAMES = 192;
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

// 192개 WebP 프레임을 순서대로 프리로드
function preloadFrames() {
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = '/assets/frames/frame_' + String(i + 1).padStart(4, '0') + '.webp';
    frames[i] = img;
  }
}

// 부드러운 보간 (lerp) — 스크롤 위치에 따라 프레임 전환
function animate() {
  if (Math.abs(currentFrame - targetFrame) < 0.5) {
    currentFrame = targetFrame;
    drawFrame(Math.round(currentFrame));
    return;
  }
  currentFrame += (targetFrame - currentFrame) * 0.15;
  drawFrame(Math.round(currentFrame));
  requestAnimationFrame(animate);
}

// 스크롤 진행률 → 목표 프레임 매핑
function onScroll() {
  const progress = Math.max(0, Math.min(1, scrolled / scrollRange));
  targetFrame = Math.round(progress * (TOTAL_FRAMES - 1));
}`;

export default function GrandbaieContentKo() {
  return (
    <main>
      <CaseHero
        organization={organizations['personal']}
        category="CLIENT WORK / WEB"
        title="산후조리원 홈페이지 리뉴얼 제안 → 제작"
        subtitle="아내가 산후조리원에 입소했을 때 홈페이지를 둘러봤는데, 시설은 프리미엄인데 웹사이트가 그 느낌을 못 따라가고 있었다. UI 샘플을 직접 만들어서 조리원 측에 제안했고, 실제 사이트 제작까지 이어졌다."
        meta={[
          { label: '제안 방식', value: 'UI 샘플 선제안', hint: '직접 만들어서 보여줌' },
          { label: '페이지 수', value: '8페이지', hint: 'home · facility · program 등' },
          { label: '핵심 기술', value: '스크롤 애니메이션', hint: '192프레임 Canvas' },
          { label: '결과', value: '운영중', hint: 'grandbaie.co.kr' },
        ]}
        stack={['Astro 6', 'Tailwind CSS 4', 'Canvas API', 'Kakao Map', 'Vercel', 'Schema.org']}
      />

      <CaseSection
        eyebrow="Background"
        title="아내가 입소한 조리원의 홈페이지가 좀 아쉬워서"
        accent="approach"
      >
        <p>
          아내가 조리원에 입소했을 때 홈페이지를 한번 훑어봤는데, 시설은 분명 괜찮은 곳인데 홈페이지가
          그 분위기를 제대로 담고 있지 못하고 있었다. 디자인도 좀 오래된 느낌이었고, 모바일에서는
          레이아웃이 깨지는 곳도 더러 있었고.
        </p>
        <p>
          말로만 "리뉴얼 하면 좋을 것 같다" 하면 와닿지 않을 거라 생각해서,{' '}
          <strong>UI 샘플을 직접 만들어서 조리원 측에 보여줬다</strong>. 샘플을 보고 바로 긍정적인
          반응이 와서, 그대로 실제 개발로 이어졌다.
        </p>
        <InsightList
          items={[
            {
              title: '시설 대비 홈페이지 퀄리티가 낮았음',
              detail:
                '실제 시설은 깔끔한데 홈페이지가 그 인상을 못 따라가고 있었다. 예비 맘이 검색해서 처음 보는 게 이 홈페이지인데, 첫인상이 아쉬우면 방문 상담까지 이어지기 어렵다.',
            },
            {
              title: '모바일 대응 미흡',
              detail:
                '산후조리원을 알아보는 예비 맘 대부분은 모바일로 검색한다. 그런데 기존 사이트는 모바일에서 레이아웃이 깨지는 부분이 있었다.',
            },
            {
              title: '검색 노출(SEO) 기반 없음',
              detail:
                'Schema.org 마크업이나 OG 태그 같은 기본적인 SEO 세팅이 안 돼 있어서, 검색엔진에 제대로 된 정보가 노출되기 어려운 상태였다.',
            },
          ]}
        />
      </CaseSection>

      <CaseSection
        eyebrow="Design Direction"
        title="호텔급 프리미엄 컨셉"
        accent="approach"
      >
        <p>
          산후조리원을 고르는 예비 맘 입장에서 생각해봤다. 검색해서 홈페이지를 열었을 때
          첫인상이 &quot;여기 괜찮아 보인다&quot;여야 방문 상담으로 이어진다. 그래서 <strong>호텔 웹사이트
          수준의 프리미엄 느낌</strong>을 컨셉으로 잡았다.
        </p>
        <p>
          컬러 팔레트는 cream/espresso/gold 조합으로 따뜻하면서도 고급스러운 톤을 만들었고,
          Pretendard 폰트로 깔끔한 타이포그래피를 유지했다. 전체적으로 &quot;이 조리원, 꼼꼼하게
          관리하는 곳이구나&quot;라는 신뢰감이 느껴지는 방향으로 디자인했다.
        </p>

        <div className="mt-8">
          <Pipeline
            groups={[
              {
                title: 'Workflow',
                steps: [
                  { label: '제안', sub: 'UI 샘플 직접 제작' },
                  { label: 'UI 샘플', sub: '디자인 시안 공유' },
                  { label: '승인', sub: '조리원 측 긍정 반응', tone: 'accent' },
                  { label: '기획', sub: '8페이지 구조 설계', tone: 'accent' },
                  { label: '구현', sub: 'Astro + Tailwind', tone: 'accent' },
                  { label: '배포', sub: 'Vercel · 커스텀 도메인', tone: 'accent' },
                  { label: '인수인계', sub: '클라이언트 전달' },
                ],
              },
            ]}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-8">
          {[
            { t: 'cream / espresso / gold', d: '따뜻하면서도 고급스러운 호텔급 컬러 팔레트' },
            { t: '검색 → 첫인상 → 방문 상담', d: '예비 맘의 의사결정 흐름에 맞춘 페이지 구성' },
            { t: 'Pretendard 폰트', d: '깔끔한 타이포그래피로 신뢰감 확보' },
          ].map((s) => (
            <div key={s.t} className="p-4 bg-white border border-[var(--color-border)] rounded-xl">
              <p className="font-mono text-xs font-semibold text-[var(--color-accent)] tracking-wider mb-1">
                {s.t}
              </p>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </CaseSection>

      <CaseSection eyebrow="Process" title="구현" accent="process">
        <ProcessSteps
          steps={[
            {
              title: 'Astro 6 정적 사이트 — 왜 Astro?',
              body: (
                <p>
                  산후조리원 홈페이지에는 CMS도 로그인도 필요 없다. 콘텐츠가 바뀔 일이 거의 없는
                  정적 사이트인 만큼, <strong>빌드 타임에 HTML을 다 만들어 두고 CDN에서 서빙</strong>하는
                  Astro가 딱 맞았다. JavaScript 번들이 거의 없어서 로딩이 빠르고, SSG 기반이라
                  SEO도 자연스럽게 좋다. Tailwind CSS 4와 조합해서 디자인 시스템 없이도 일관된
                  스타일을 빠르게 잡았다.
                </p>
              ),
            },
            {
              title: '192프레임 스크롤 애니메이션 — Canvas + lerp',
              body: (
                <>
                  <p>
                    히어로 섹션에서 스크롤하면 조리원 내부를 걸어 다니는 듯한 느낌을 주고 싶었다.
                    192개의 WebP 프레임을 미리 로드해 두고, 스크롤 진행률에 따라 Canvas에 프레임을
                    그리는 방식이다. 단순히 프레임을 바꾸기만 하면 뚝뚝 끊기는데, <strong>lerp 보간</strong>을
                    걸어서 현재 프레임이 목표 프레임을 부드럽게 쫓아가도록 했다.
                    cover-fit 로직으로 어떤 해상도에서든 Canvas가 화면을 꽉 채우게 처리했고.
                  </p>
                  <CodeBlock filename="hero-scroll-animation.js" language="javascript" code={scrollAnimationCode} />
                </>
              ),
            },
            {
              title: '카카오맵 연동 + fallback UI',
              body: (
                <p>
                  오시는 길 페이지에 카카오맵을 넣었는데, API 키 만료나 네트워크 오류 같은 상황에서
                  지도가 안 뜨면 난감하니까 <strong>fallback UI</strong>를 같이 만들었다. 지도 로드에
                  실패하면 주소 텍스트와 카카오맵 링크 버튼이 대신 보여서, 사용자가 어떤 상황에서든
                  위치 정보를 확인할 수 있도록 했다.
                </p>
              ),
            },
            {
              title: 'SEO — Schema.org, 사이트맵, GA4, Search Console',
              body: (
                <p>
                  산후조리원은 지역 검색이 핵심이다. <strong>Schema.org JSON-LD로
                  MedicalBusiness 타입</strong> 구조화 데이터를 넣어서 검색엔진이 업종·주소·전화번호를
                  제대로 파악하도록 했고, OG 태그로 카카오톡이나 SNS 공유 시 미리보기도 깔끔하게
                  나오도록 세팅했다. sitemap.xml 자동 생성, GA4 연동, 네이버·구글 Search Console
                  인증까지 기본적인 SEO 인프라를 전부 갖췄다.
                </p>
              ),
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Outcome" title="결과" accent="outcome">
        <InsightList
          variant="outcome"
          items={[
            {
              title: 'grandbaie.co.kr 실제 운영중',
              detail:
                'Vercel에 배포하고 커스텀 도메인을 연결해서 실제 운영 사이트로 전환했다. 조리원 측에서 바로 사용할 수 있도록 인수인계까지 완료.',
            },
            {
              title: '능동적 제안으로 시작한 프로젝트',
              detail:
                '클라이언트가 요청한 게 아니라 직접 기회를 발견하고, UI 샘플을 만들어서 제안한 프로젝트다. 단순 개발 실력이 아니라 "이걸 왜 해야 하는지"를 먼저 보여주고 설득하는 과정이 들어간 경험.',
            },
            {
              title: '기획부터 배포까지 전 과정 1인 수행',
              detail:
                '디자인 컨셉 잡기, 페이지 구조 설계, 스크롤 애니메이션 구현, SEO 세팅, Vercel 배포, 도메인 연결, 인수인계까지 전부 혼자 했다.',
            },
            {
              title: '이후 B2B 외주 제안의 기반',
              detail:
                '이 경험이 "직접 제안해서 프로젝트를 만들어내는" 패턴의 시작점이 됐다. 이후 다른 업종 사이트 외주 제안으로도 이어지는 기반이 된 프로젝트.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="grandbaie" all={cases} />
    </main>
  );
}

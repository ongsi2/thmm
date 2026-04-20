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

// Preload 192 WebP frames in order
function preloadFrames() {
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = '/assets/frames/frame_' + String(i + 1).padStart(4, '0') + '.webp';
    frames[i] = img;
  }
}

// Smooth interpolation (lerp) — transition frames based on scroll position
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

// Map scroll progress to target frame
function onScroll() {
  const progress = Math.max(0, Math.min(1, scrolled / scrollRange));
  targetFrame = Math.round(progress * (TOTAL_FRAMES - 1));
}`;

export default function GrandbaieContentEn() {
  return (
    <main>
      <CaseHero
        organization={organizations['personal']}
        category="CLIENT WORK / WEB"
        title="Pitched and Built a Postpartum Care Center Site Renewal"
        subtitle="While my wife was staying at a postpartum care center (산후조리원) in Anyang, I looked through their website — the facility itself was premium, but the site wasn't matching that feel. I built a UI sample on my own, pitched it to the center, and it turned into the actual production site."
        meta={[
          { label: 'Pitch style', value: 'Unsolicited UI sample', hint: 'Built and shown up front' },
          { label: 'Pages', value: '8 pages', hint: 'home · facility · program · etc.' },
          { label: 'Core technique', value: 'Scroll animation', hint: '192-frame Canvas' },
          { label: 'Outcome', value: 'Live in production', hint: 'grandbaie.co.kr' },
        ]}
        stack={['Astro 6', 'Tailwind CSS 4', 'Canvas API', 'Kakao Map', 'Vercel', 'Schema.org']}
      />

      <CaseSection
        eyebrow="Background"
        title="My wife's postpartum center website felt a step behind the facility itself"
        accent="approach"
      >
        <p>
          When my wife checked into the postpartum care center, I took a look through their website.
          The facility itself was clearly a nice place, but the site wasn't capturing that atmosphere.
          The design felt dated, and on mobile there were spots where the layout was breaking.
        </p>
        <p>
          I figured that just saying "a renewal would be a good idea" wouldn't really land, so{' '}
          <strong>I built a UI sample on my own and showed it to the center</strong>. The response to
          the sample was positive right away, and it moved straight into actual development.
        </p>
        <InsightList
          items={[
            {
              title: 'Site quality lagged behind the actual facility',
              detail:
                'The facility itself was polished, but the website wasn\'t living up to that impression. For expecting mothers, this website is the first thing they see when searching, and if the first impression is underwhelming it\'s hard to turn that into an on-site consultation.',
            },
            {
              title: 'Weak mobile support',
              detail:
                'Most expecting mothers researching postpartum care centers are searching on mobile. But the existing site had places where the layout broke on mobile.',
            },
            {
              title: 'No foundation for search visibility (SEO)',
              detail:
                'Basic SEO setup — Schema.org markup, OG tags — wasn\'t in place, so search engines had no good way to pick up proper information about the center.',
            },
          ]}
        />
      </CaseSection>

      <CaseSection
        eyebrow="Design Direction"
        title="A hotel-grade premium concept"
        accent="approach"
      >
        <p>
          I put myself in the shoes of an expecting mother choosing a postpartum center. When they
          search and land on the website, the first impression needs to say &quot;this place looks
          good&quot; for it to lead to an on-site consultation. So I set the concept as a{' '}
          <strong>premium feel on par with a hotel website</strong>.
        </p>
        <p>
          For the color palette, I went with a cream/espresso/gold combination to get a warm yet
          upscale tone, and kept typography clean using the Pretendard font. Overall, I designed it
          in a direction that conveys the sense of &quot;this is a center that takes care of the
          details.&quot;
        </p>

        <div className="mt-8">
          <Pipeline
            groups={[
              {
                title: 'Workflow',
                steps: [
                  { label: 'Pitch', sub: 'Built UI sample myself' },
                  { label: 'UI sample', sub: 'Shared design mock-up' },
                  { label: 'Approval', sub: 'Positive response from center', tone: 'accent' },
                  { label: 'Planning', sub: '8-page structure', tone: 'accent' },
                  { label: 'Build', sub: 'Astro + Tailwind', tone: 'accent' },
                  { label: 'Deploy', sub: 'Vercel · custom domain', tone: 'accent' },
                  { label: 'Handover', sub: 'Delivered to client' },
                ],
              },
            ]}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-8">
          {[
            { t: 'cream / espresso / gold', d: 'Warm yet upscale, hotel-grade color palette' },
            { t: 'Search → first impression → consultation', d: 'Page flow designed around the expecting mother\'s decision journey' },
            { t: 'Pretendard font', d: 'Clean typography to establish trust' },
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

      <CaseSection eyebrow="Process" title="Implementation" accent="process">
        <ProcessSteps
          steps={[
            {
              title: 'Astro 6 static site — why Astro?',
              body: (
                <p>
                  A postpartum care center website doesn't need a CMS or logins. Since it's a static
                  site where content barely changes, Astro — which{' '}
                  <strong>builds all the HTML at build time and serves from a CDN</strong> — was a
                  perfect fit. The JavaScript bundle is almost non-existent so loading is fast, and
                  being SSG-based, SEO comes along naturally. Combined with Tailwind CSS 4, I could
                  nail down a consistent style quickly without setting up a design system.
                </p>
              ),
            },
            {
              title: '192-frame scroll animation — Canvas + lerp',
              body: (
                <>
                  <p>
                    In the hero section, I wanted to give the feeling of walking through the center's
                    interior as you scroll. I preload 192 WebP frames and draw the appropriate frame
                    on a Canvas based on scroll progress. If you simply swap frames, it stutters — so
                    I applied <strong>lerp interpolation</strong> to make the current frame smoothly
                    chase the target frame. I also handled cover-fit logic so that the Canvas fills
                    the screen at any resolution.
                  </p>
                  <CodeBlock filename="hero-scroll-animation.js" language="javascript" code={scrollAnimationCode} />
                </>
              ),
            },
            {
              title: 'Kakao Map integration + fallback UI',
              body: (
                <p>
                  I added Kakao Map to the directions page, but if the map fails to load — expired
                  API key, network error, etc. — it would be a problem, so I built a{' '}
                  <strong>fallback UI</strong> alongside it. If the map fails to load, the address
                  text and a Kakao Map link button appear in its place, so users can still check the
                  location information no matter what.
                </p>
              ),
            },
            {
              title: 'SEO — Schema.org, sitemap, GA4, Search Console',
              body: (
                <p>
                  Local search is critical for postpartum care centers. I added{' '}
                  <strong>structured data with Schema.org JSON-LD using the MedicalBusiness type</strong>{' '}
                  so search engines can properly pick up the business category, address, and phone
                  number, and set up OG tags so previews render cleanly when shared on KakaoTalk or
                  social media. Automatic sitemap.xml generation, GA4 integration, and Naver/Google
                  Search Console verification — all the basic SEO infrastructure is in place.
                </p>
              ),
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Outcome" title="Results" accent="outcome">
        <InsightList
          variant="outcome"
          items={[
            {
              title: 'grandbaie.co.kr live in production',
              detail:
                'Deployed to Vercel with a custom domain connected, and handed over as the live production site. Handover was completed so the center could take it over and run with it directly.',
            },
            {
              title: 'A project that started from a proactive pitch',
              detail:
                'This wasn\'t a client request — I spotted the opportunity myself, built a UI sample, and pitched it. The experience went beyond raw development skill: it included the work of first showing and convincing someone "why this needs to happen."',
            },
            {
              title: 'Solo end-to-end, from planning through deployment',
              detail:
                'Design concept, page structure, scroll animation implementation, SEO setup, Vercel deployment, domain connection, handover — I did all of it on my own.',
            },
            {
              title: 'Foundation for later B2B outbound pitches',
              detail:
                'This experience became the starting point for a pattern of "creating projects by pitching directly." It became the foundation that led to outbound pitches for sites in other industries as well.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="grandbaie" all={cases} />
    </main>
  );
}

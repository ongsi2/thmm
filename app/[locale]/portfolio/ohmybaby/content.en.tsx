import { cases, organizations } from '../_components/cases';
import {
  CaseHero,
  CaseSection,
  InsightList,
  ProcessSteps,
  OtherCases,
} from '../_components/CaseShell';
import { Pipeline } from '../_components/diagrams/Pipeline';

export default function OhmybabyContentEn() {
  return (
    <main>
      <CaseHero
        organization={organizations['personal']}
        category="SIDE PROJECT / AI"
        title="AI naming plus tournament-style voting — so the whole family picks the baby's name together"
        subtitle="I tried a few baby-naming services and they all turned out to be single-player tools. Naming a baby is something families do together, though. So I built a service where GPT-4o recommends names based on Saju (Korean birth-chart) and Ohaeng (Five-Element analysis), and the family votes through a bracket-style tournament to land on the final name."
        meta={[
          { label: 'Core idea', value: 'AI + family vote', hint: 'AI recommends, family chooses' },
          { label: 'AI model', value: 'GPT-4o', hint: 'Ohaeng, Saju and Hanja analysis' },
          { label: 'Family participation', value: 'Bracket voting', hint: 'Vote via shared link' },
          { label: 'Current status', value: 'Live', hint: 'ohmybaby.kr' },
        ]}
        stack={['Next.js 16', 'GPT-4o', 'Supabase', 'Kakao OAuth', 'Framer Motion', 'Tailwind CSS 4']}
      />

      <CaseSection
        eyebrow="Background"
        title="Shouldn't a baby's name be something the whole family picks together?"
        accent="approach"
      >
        <p>
          When the time came to name a baby, I tried out a few naming services. Some used AI to suggest names,
          others applied traditional Korean naming rules — but after using them all, one shortcoming kept coming up.
          They were all <strong>"single-player tools"</strong>.
        </p>
        <p>
          In real life, naming a baby isn't something you do alone. Mom and Dad weigh the candidates,
          show them to the grandparents, who say "hmm, not quite...", and then aunts and uncles chime in too.
          The name only settles once <strong>the whole family's opinions come together</strong>, but
          existing services ended at "one person gets an AI suggestion, screenshots it, and drops it in a KakaoTalk group chat."
        </p>
        <p>
          So I thought — what if we keep the AI-generated names, but layer on a{' '}
          <strong>tournament-style voting (bracket voting)</strong> format? Compare candidate names head-to-head in 1v1 matchups,
          let each family member vote, then tally the results to land on the final name. AI recommends, family chooses.
        </p>
        <InsightList
          items={[
            {
              title: 'Existing naming services are all single-player',
              detail:
                'Whether AI-driven or tradition-based, every tool delivers results to one person at a time. None of them had a way to gather opinions from the rest of the family.',
            },
            {
              title: 'Naming is supposed to be a family event',
              detail:
                'In Korean culture, not just parents but grandparents and relatives weigh in — and no service was built to accommodate that.',
            },
            {
              title: 'The only way to share candidates was a KakaoTalk screenshot',
              detail:
                'To show AI-suggested names to the family, taking a screenshot and dropping it into the group chat was the only option.',
            },
          ]}
        />
      </CaseSection>

      <CaseSection
        eyebrow="Approach"
        title="AI suggestions + tournament-style voting = a family-participatory naming service"
        accent="approach"
      >
        <p>
          The structure is simple. Create a project, enter the baby's details, and GPT-4o suggests names.
          Open a bracket-style tournament with those candidates, share the link with the family, and each person votes.
          As the votes roll in, the family's favorite name naturally rises to the top.
        </p>

        <div className="mt-8">
          <Pipeline
            groups={[
              {
                title: 'User flow',
                steps: [
                  { label: 'Create project', sub: '4-step wizard', tone: 'neutral' },
                  { label: 'AI name suggestions', sub: 'GPT-4o', tone: 'accent', badge: 'AI' },
                  { label: 'Edit candidates', sub: 'Add / remove', tone: 'neutral' },
                  { label: 'Share bracket', sub: 'Kakao link', tone: 'accent' },
                  { label: 'Family votes', sub: 'Tournament', tone: 'neutral' },
                  { label: 'Result postcard', sub: '印章 seal design', tone: 'accent' },
                ],
              },
            ]}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-8">
          {[
            {
              t: 'Why GPT-4o',
              d: 'Korean naming is a domain that demands knowledge of Ohaeng (Five-Element analysis), Saju (birth-chart), and Hanja (Chinese characters used in Korean naming). GPT-4o was the best fit for injecting those rules through prompting.',
            },
            {
              t: 'Why bracket voting',
              d: '1v1 comparisons are more fun than plain ranking, and the tournament structure naturally whittles the candidates down round by round.',
            },
            {
              t: 'Why Kakao sharing',
              d: 'In Korea, the family group chat is KakaoTalk. One link drops people straight into voting, so the barrier to entry is almost zero.',
            },
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
              title: 'GPT-4o prompt design — teaching the AI the rules of Korean naming',
              body: (
                <>
                  <p>
                    Korean traditional naming has a surprising number of rules. The generative and destructive cycles
                    of the Five Elements (木火土金水 — Wood, Fire, Earth, Metal, Water), the Saju Palja birth-chart
                    calculated from the baby's birth date and time, and the real-world usage frequency of each
                    Hanja character that maps to a given syllable. I baked all of that into the system prompt so
                    GPT-4o would produce names that feel like they came from an actual Korean naming studio.
                  </p>
                  <p>
                    One thing I spent extra effort on was filtering out the Hanja that GPT naturally gravitates
                    toward (like 瑞 or 睿). Models reach for these characters often, but they're rarely used in real
                    Korean naming. I explicitly banned those, and locked the output format to JSON to keep parsing
                    stable. The prompt itself is core service logic so I'm not publishing it here, but the overall
                    direction is "structure Korean naming rules into a rule list, state forbidden patterns explicitly,
                    enforce a JSON schema."
                  </p>
                </>
              ),
            },
            {
              title: 'Bracket engine — a client-side tournament',
              body: (
                <>
                  <p>
                    A tournament bracket that supports 4, 8, 16, and 32 entrants runs on the client.
                    The candidate names get randomly shuffled into a bracket, and each round is a 1v1 comparison
                    where picking one advances it to the next round.
                  </p>
                  <p>
                    Once the share link goes out via KakaoTalk, family and friends can jump straight into voting.
                    Each person's votes are stored in Supabase, and the project owner can see the aggregated results.
                    The free plan supports up to 10 voters per project.
                  </p>
                </>
              ),
            },
            {
              title: 'Hanja meanings + Ohaeng data',
              body: (
                <>
                  <p>
                    I mapped Hanja variants for 40+ Korean surnames. For example, even the surname "Kim"
                    can be written with different Hanja like 金 or 金海, and each variant has a different
                    stroke count and Ohaeng (Five-Element) attribute. Without that dataset, there's no way
                    to give GPT-4o concrete instructions like "this surname's element is Metal, so pick
                    generatively compatible Water or Wood Hanja."
                  </p>
                  <p>
                    On the results screen, each syllable's Ohaeng is color-coded. Wood is green, Fire is red,
                    Earth is yellow, and so on — so the elemental composition of the name is readable at a glance.
                  </p>
                </>
              ),
            },
            {
              title: 'Kakao login + sharing — designed for virality',
              body: (
                <>
                  <p>
                    Kakao OAuth is wired into Supabase Auth. Since most Korean users already have a Kakao account,
                    the login friction is minimal, and sharing the voting link as a KakaoTalk message turns
                    the product naturally viral.
                  </p>
                  <p>
                    When voting ends, a postcard-style result card is generated, complete with an 印章 (seal) design.
                    That card is also shareable via KakaoTalk, so families can use it to announce, "Here's the name we picked!"
                  </p>
                </>
              ),
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Outcome" title="Outcome" accent="outcome">
        <InsightList
          variant="outcome"
          items={[
            {
              title: 'ohmybaby.kr is live',
              detail:
                'A side project I took solo from planning through AI integration, UX design, and deployment. It is running as a real service today.',
            },
            {
              title: 'Translating Korean naming culture into AI prompts',
              detail:
                'The biggest takeaway was turning domain knowledge — Ohaeng generative/destructive relationships, Saju analysis, and filtering of Hanja actually used in real naming — into prompt engineering. I learned that "what you forbid the AI from doing" matters more than "what you tell it to do."',
            },
            {
              title: 'End-to-end experience: planning, design, build, deploy',
              detail:
                'Stacking Next.js 16 + Supabase + GPT-4o + Kakao OAuth full-stack on my own gave me experience with auth, billing design, AI integration, and social sharing inside a single project.',
            },
            {
              title: 'Next up: activate the Pro plan, expand marketing channels',
              detail:
                'The Free/Pro tier structure — gated on AI suggestion count (free: 3) and vote-participant count (free: 10) — is already designed. The plan is to collect user feedback, turn on the Pro tier, and broaden marketing channels through parenting communities.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="ohmybaby" all={cases} />
    </main>
  );
}

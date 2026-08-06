import { cases, organizations } from '../_components/cases';
import {
  CaseHero,
  CaseSection,
  InsightList,
  ProcessSteps,
  OtherCases,
} from '../_components/CaseShell';
import { Pipeline } from '../_components/diagrams/Pipeline';

export default function OhmybabyContentKo() {
  return (
    <main>
      <CaseHero
        organization={organizations['personal']}
        category="SIDE PROJECT / AI"
        title="AI 작명 + 이상형 월드컵으로 가족이 함께 고르는 아기 이름"
        subtitle="작명 서비스를 몇 개 써봤는데, 결국 혼자 쓰는 도구더라고. 이름은 가족이 같이 고르는 건데. GPT-4o가 사주·오행 맞춰서 이름을 추천하면, 이상형 월드컵으로 가족이 투표해서 최종 이름을 정하는 서비스를 만들었다."
        meta={[
          { label: '핵심 아이디어', value: 'AI + 가족 투표', hint: '추천은 AI, 선택은 가족' },
          { label: 'AI 모델', value: 'GPT-4o', hint: '오행·사주·한자 분석' },
          { label: '가족 참여', value: '이상형 월드컵', hint: '링크 공유로 투표' },
          { label: '현재 상태', value: '운영중', hint: 'ohmybaby.kr' },
        ]}
        stack={['Next.js 16', 'GPT-4o', 'Supabase', 'Kakao OAuth', 'Framer Motion', 'Tailwind CSS 4']}
      />

      <CaseSection
        eyebrow="Background"
        title="아기 이름은 가족이 같이 골라야 하지 않나?"
        accent="approach"
      >
        <p>
          아기 이름을 지을 일이 생겨서 작명 서비스를 몇 개 써봤다. AI가 이름을 추천해주는 곳도 있고,
          전통 작명 규칙을 적용해주는 곳도 있었는데 — 다 써보고 나니까 공통적으로 아쉬운 게 있었다.
          전부 <strong>"혼자 쓰는 도구"</strong>였다.
        </p>
        <p>
          현실에서 아기 이름 짓기는 혼자 하는 일이 아니거든요. 엄마 아빠가 후보를 놓고 고민하고,
          할머니 할아버지한테 보여드리면 "이건 좀..." 하시고, 이모 삼촌도 한마디씩 보태고.
          결국 이름은 <strong>가족 전체의 의견이 모여야</strong> 정해지는 건데, 기존 서비스는
          한 사람이 AI한테 이름 받아서 캡처해서 카톡에 올리면 끝이었다.
        </p>
        <p>
          그래서 생각한 게 — AI가 이름을 추천하는 건 그대로 두되, 거기에{' '}
          <strong>이상형 월드컵</strong> 방식을 붙이면 어떨까. 후보 이름을 1:1 토너먼트로 비교하면서
          가족이 각자 투표하고, 결과를 모아서 최종 이름을 정하는 것이다. 추천은 AI가, 선택은 가족이.
        </p>
        <InsightList
          items={[
            {
              title: '기존 작명 서비스는 전부 1인용',
              detail:
                'AI 추천이든 전통 작명이든, 한 사람이 혼자 결과를 받아보는 구조. 가족 의견을 모으는 기능이 없었다.',
            },
            {
              title: '이름 짓기는 원래 가족 행사',
              detail:
                '부모뿐 아니라 조부모, 친척까지 의견을 내는 게 한국 문화인데, 그걸 수용하는 서비스가 없었다.',
            },
            {
              title: '후보를 공유하는 방법이 카톡 캡처밖에 없음',
              detail:
                'AI가 추천한 이름을 가족한테 보여주려면 스크린샷 찍어서 단톡방에 올리는 게 유일한 방법이었다.',
            },
          ]}
        />
      </CaseSection>

      <CaseSection
        eyebrow="Approach"
        title="AI 추천 + 이상형 월드컵 = 가족 참여형 작명"
        accent="approach"
      >
        <p>
          구조는 단순한다. 프로젝트를 만들어서 아기 정보를 입력하면 GPT-4o가 이름을 추천하고,
          그 후보들로 이상형 월드컵을 열어서 가족한테 링크를 공유하면 각자 투표한다.
          투표 결과가 모이면 가족이 가장 좋아하는 이름이 자연스럽게 올라오는 구조다.
        </p>

        <div className="mt-8">
          <Pipeline
            groups={[
              {
                title: '사용자 흐름',
                steps: [
                  { label: '프로젝트 생성', sub: '4단계 위자드', tone: 'neutral' },
                  { label: 'AI 이름 추천', sub: 'GPT-4o', tone: 'accent', badge: 'AI' },
                  { label: '후보 편집', sub: '추가/삭제', tone: 'neutral' },
                  { label: '월드컵 공유', sub: '카카오 링크', tone: 'accent' },
                  { label: '가족 투표', sub: '토너먼트', tone: 'neutral' },
                  { label: '결과 엽서', sub: '印章 씰 디자인', tone: 'accent' },
                ],
              },
            ]}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-8">
          {[
            {
              t: 'GPT-4o를 쓴 이유',
              d: '한국 작명은 오행, 사주, 한자 지식이 필요한 도메인. 프롬프트로 규칙을 주입하기 가장 적합한 모델이었다.',
            },
            {
              t: '이상형 월드컵 방식',
              d: '단순 순위 매기기보다 1:1 비교가 더 재밌고, 토너먼트 구조라 자연스럽게 후보가 줄어든다.',
            },
            {
              t: '카카오 공유',
              d: '한국에서 가족 단톡방 = 카카오톡. 링크 하나로 투표 참여가 되니까 진입 장벽이 거의 없다.',
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

      <CaseSection eyebrow="Process" title="구현" accent="process">
        <ProcessSteps
          steps={[
            {
              title: 'GPT-4o 프롬프트 설계 — 한국 작명 규칙을 AI에게 가르치기',
              body: (
                <>
                  <p>
                    한국 전통 작명에는 규칙이 꽤 많다. 오행(木火土金水)의 상생·상극 관계,
                    아기의 생년월일시로 계산하는 사주팔자, 각 글자에 매칭하는 한자의 실제 사용 빈도까지.
                    이걸 시스템 프롬프트에 녹여서 GPT-4o가 "진짜 작명소에서 나올 법한" 이름을
                    추천하도록 설계했다.
                  </p>
                  <p>
                    특히 신경 쓴 부분은 GPT가 좋아하는 한자(瑞, 睿 같은)를 걸러내는 것이었다.
                    모델이 자주 쓰지만 실제 한국 작명에서는 거의 안 쓰는 한자들이 있거든요.
                    그런 걸 명시적으로 금지하고, 출력 포맷도 JSON으로 고정해서 파싱 안정성을 확보했다.
                    프롬프트 자체는 서비스 핵심 로직이라 여기에 공개하진 않지만, 접근 방향은
                    "한국 전통 작명 규칙을 규칙 목록으로 구조화 → 금지 패턴 명시 → JSON 스키마 강제"다.
                  </p>
                </>
              ),
            },
            {
              title: '이상형 월드컵 엔진 — 클라이언트 사이드 토너먼트',
              body: (
                <>
                  <p>
                    4/8/16/32강을 지원하는 토너먼트 브래킷을 클라이언트에서 관리한다.
                    후보 이름들을 랜덤으로 셔플해서 대진표를 짜고, 라운드마다 1:1 비교로
                    하나를 선택하면 다음 라운드로 진행되는 구조다.
                  </p>
                  <p>
                    카카오톡으로 공유 링크를 보내면 가족이나 친구가 바로 투표에 참여할 수 있다.
                    각자의 투표 결과는 Supabase에 저장되고, 프로젝트 오너는 전체 투표 현황을 볼 수 있다.
                    무료 플랜에서는 투표 참여를 10명까지 받을 수 있다.
                  </p>
                </>
              ),
            },
            {
              title: '한자 뜻풀이 + 오행 데이터',
              body: (
                <>
                  <p>
                    40개 이상의 한국 성씨에 대해 한자 변형(variants)을 매핑했다.
                    예를 들어 '김'이라도 金, 金海 등 다양한 한자가 있을 수 있고,
                    각 한자의 획수와 오행 속성이 다른다. 이 데이터가 있어야
                    GPT-4o 프롬프트에 "이 성의 오행은 金이니까 상생하는 水·木 계열 한자를 써라"
                    같은 구체적인 지시를 줄 수 있었다.
                  </p>
                  <p>
                    이름 결과 화면에서는 각 글자의 오행을 색상으로 구분해서 보여준다.
                    木은 초록, 火는 빨강, 土는 노랑 식으로 — 한눈에 오행 배치를 확인할 수 있도록요.
                  </p>
                </>
              ),
            },
            {
              title: '카카오 로그인 + 공유 — 바이럴 설계',
              body: (
                <>
                  <p>
                    Supabase Auth에 카카오 OAuth를 연동했다. 한국 사용자 대부분이 카카오 계정을
                    갖고 있으니까 로그인 허들이 낮고, 투표 링크 공유도 카카오톡 메시지로 보내면
                    자연스럽게 바이럴이 된다.
                  </p>
                  <p>
                    투표가 끝나면 엽서 스타일의 결과 카드가 생성되는데, 여기에 印章(도장) 씰
                    디자인을 넣었다. 이것도 카카오톡으로 공유할 수 있어서,
                    "우리 아기 이름 이걸로 정했어!" 하고 알리는 용도로 쓸 수 있다.
                  </p>
                </>
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
              title: 'ohmybaby.kr 운영중',
              detail:
                '기획부터 AI 연동, 사용자 경험 설계, 배포까지 혼자 진행한 사이드 프로젝트다. 실제 서비스로 운영하고 있다.',
            },
            {
              title: '한국 작명 문화를 AI 프롬프트에 녹인 경험',
              detail:
                '오행 상생/상극, 사주팔자 분석, 실제 작명에서 쓰는 한자 필터링 같은 도메인 지식을 프롬프트 엔지니어링으로 풀어낸 과정이 가장 큰 수확이었다. "AI한테 뭘 시키느냐"보다 "뭘 하지 말라고 하느냐"가 더 중요하다는 걸 배웠다.',
            },
            {
              title: '기획 → 설계 → 개발 → 배포 전 과정 경험',
              detail:
                'Next.js 16 + Supabase + GPT-4o + Kakao OAuth 조합으로 풀스택을 혼자 구성하면서, 인증·결제 설계·AI 연동·소셜 공유까지 한 프로젝트 안에서 다뤄본 경험이 쌓였다.',
            },
            {
              title: '향후: Pro 플랜 활성화, 마케팅 채널 확대',
              detail:
                'AI 이름 추천 횟수 제한(무료 3회)과 투표 참여 인원 제한(무료 10명) 기반의 Free/Pro 티어 구조는 이미 설계돼 있다. 사용자 피드백을 모아서 Pro 플랜을 활성화하고, 육아 커뮤니티 중심으로 마케팅 채널을 넓힐 계획이다.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="ohmybaby" all={cases} />
    </main>
  );
}

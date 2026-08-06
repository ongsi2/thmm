import CodeBlock from '../_components/CodeBlock';
import { cases, organizations } from '../_components/cases';
import {
  CaseHero,
  CaseSection,
  InsightList,
  ProcessSteps,
  OtherCases,
} from '../_components/CaseShell';
import { SessionTopology } from '../_components/diagrams/SessionTopology';

const dockerCmd = `# Redis 설치 (7.4.2)
docker pull redis:7.4.2

# 컨테이너 실행
docker run -d \\
  --name redis \\
  --restart unless-stopped \\
  -p 6379:6379 \\
  -v /data/redis:/data \\
  redis:7.4.2 redis-server --requirepass "your-password"`;

const redisProps = `# redis.properties
redis.host     = your.redis.host
redis.port     = 6379
redis.password = your-password
redis.database = 0`;

const pomXml = `<!-- pom.xml - Spring Session + Redis 의존성 -->
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
    <version>2.7.0</version>
</dependency>
<dependency>
    <groupId>org.springframework.data</groupId>
    <artifactId>spring-data-redis</artifactId>
    <version>2.7.0</version>
</dependency>
<dependency>
    <groupId>io.lettuce</groupId>
    <artifactId>lettuce-core</artifactId>
    <version>6.2.0.RELEASE</version>
</dependency>`;

const contextXml = `<!-- context-redis.xml - Redis 연결/직렬화/세션 구성 -->
<bean id="redisConnectionFactory"
      class="org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory">
    <property name="hostName" value="\${redis.host}"/>
    <property name="port"     value="\${redis.port}"/>
    <property name="password" value="\${redis.password}"/>
    <property name="database" value="\${redis.database}"/>
</bean>

<bean class="org.springframework.session.data.redis.config.annotation.web.http.RedisHttpSessionConfiguration">
    <property name="maxInactiveIntervalInSeconds" value="1800"/>
</bean>`;

export default function RedisSessionContentKo() {
  return (
    <main>
      <CaseHero
        organization={organizations['kpf-issga']}
        category="INFRA / SESSION"
        title="Redis 기반 세션 클러스터링"
        subtitle="JEUS Standard Edition에서는 세션 클러스터링 기능을 쓸 수 없어서, Redis를 외부 세션 저장소로 두고 우회했다. 그 결과 레거시 환경에서도 WAS 순차 재기동이 가능해졌다."
        meta={[
          { label: '핵심 효과', value: '무중단 배포', hint: 'WAS 순차 재기동 가능' },
          { label: '세션 지연', value: '밀리초', hint: 'UX 영향 없음' },
          { label: '프레임워크', value: '전자정부 3.x', hint: 'Spring Session 네이티브' },
          { label: '인프라', value: 'Redis 7.4', hint: 'Docker 컨테이너' },
        ]}
        stack={[
          'Redis 7.4',
          'Spring Session',
          'Spring Data Redis',
          'Lettuce',
          'JEUS (Standard)',
          'Docker',
          '전자정부 프레임워크',
        ]}
      />

      <CaseSection eyebrow="Problem" title="WAS 하나만 재기동해도 로그인·입력이 날아감" accent="problem">
        <p>
          WAS가 여러 대 있는데 세션은 서버마다 제각각 들고 있는 구조였다. 그래서 서버 한 대만 재기동해도 거기
          붙어 있던 사용자는 로그아웃됐고, 뭔가 작성 중이었다면 그 내용도 그대로 날아갔다. JEUS가 세션 클러스터링
          기능을 지원하긴 하지만 Enterprise 라이선스에만 들어 있었고, 우리 쪽 환경은 Standard라 공식 경로로는 해결할
          방법이 없었다.
        </p>
        <InsightList
          items={[
            {
              title: '재기동하면 로그인·입력 데이터가 날아감',
              detail: '새로고침 한 번에 작성하던 내용이 통째로 사라지는 경험을 사용자가 자주 겪음',
            },
            {
              title: '무중단 배포가 불가능',
              detail: '세션을 지키려고 배포를 미루거나, 반대로 세션 단절을 감수하고 배포해야 하는 상황 반복',
            },
            {
              title: '라이선스로는 풀 수 없음',
              detail: '세션 클러스터링은 JEUS Enterprise에만 포함된 기능, Standard에서는 사용 불가',
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Approach" title="Redis 외부 세션 저장소로 우회" accent="approach">
        <p>
          라이선스 업그레이드는 비용이 크니까, 대신 애플리케이션 쪽에서 세션을 외부 저장소로 빼내는 방향을 골랐다.
          Spring Session이 Redis와 바로 붙어 있어 코드는 건드리지 않고 설정만 추가하면 됐고, Redis는 응답이 밀리초
          단위라 사용자 경험에도 영향이 거의 없을 거라고 봤다.
        </p>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <SessionTopology variant="before" />
          <SessionTopology variant="after" />
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-6">
          {[
            { t: '빠른 응답', d: '세션 조회/저장이 밀리초 단위라 UX에 영향 없음' },
            { t: '기존 코드 유지', d: 'Spring Session이 Redis와 기본 통합 — 설정만 추가' },
            { t: '가벼운 운영', d: 'Docker로 설치, TTL 자동 관리, 구조가 단순함' },
          ].map((s) => (
            <div
              key={s.t}
              className="p-4 bg-white border border-[var(--color-border)] rounded-xl"
            >
              <p className="font-mono text-xs font-semibold text-[var(--color-accent)] tracking-wider mb-1">
                {s.t}
              </p>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </CaseSection>

      <CaseSection eyebrow="Process" title="구현 단계" accent="process">
        <ProcessSteps
          steps={[
            {
              title: 'Redis 띄우기',
              body: (
                <>
                  <p>
                    공용 Docker 호스트에 Redis 7.4 컨테이너를 올렸다. 비밀번호, 영속 볼륨, 자동 재시작 정책을 같이
                    설정했고, 애플리케이션에서 쓸 호스트·포트·패스워드는 프로퍼티 파일로 분리했다.
                  </p>
                  <CodeBlock filename="install-redis.sh" language="bash" code={dockerCmd} />
                  <CodeBlock filename="redis.properties" language="properties" code={redisProps} />
                </>
              ),
            },
            {
              title: 'Spring Session 의존성 추가',
              body: (
                <>
                  <p>
                    전자정부 프레임워크 프로젝트의 pom.xml에 Spring Session / Spring Data Redis / Lettuce를
                    추가했다. 서블릿 세션을 외부 저장소로 위임하기 위한 준비 단계다.
                  </p>
                  <CodeBlock filename="pom.xml" language="xml" code={pomXml} />
                </>
              ),
            },
            {
              title: 'Redis 연결·세션 매핑 설정',
              body: (
                <>
                  <p>
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">context-redis.xml</code>에 LettuceConnectionFactory와 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">RedisHttpSessionConfiguration</code>을
                    선언했다. HTTP 세션이 자동으로 Redis에 저장되도록 매핑한 거라, 애플리케이션 코드 수정은 없다.
                  </p>
                  <CodeBlock filename="context-redis.xml" language="xml" code={contextXml} />
                </>
              ),
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Outcome" title="결과와 배운 것" accent="outcome">
        <InsightList
          variant="outcome"
          items={[
            {
              title: '무중단 배포가 가능해짐',
              detail:
                'WAS를 순차 재기동해도 세션이 유지된다. 긴급 패치나 테스트 적용도 서비스 중단 없이 돌릴 수 있게 됐다.',
            },
            {
              title: '로그인 끊김 문제 해결',
              detail:
                '장애, 재배포, 장시간 운영 상황에서도 로그인이 끊기거나 입력 데이터가 날아가는 일이 없어졌다.',
            },
            {
              title: '라이선스 한계를 외부 저장소로 우회',
              detail:
                '상위 라이선스를 구매하지 않고도 세션 클러스터링을 구현했다. 플랫폼 제약이 있어도 아키텍처로 돌아갈 길이 있다는 걸 직접 경험했다.',
            },
            {
              title: '다음부터는 호환성부터 확인',
              detail:
                '전자정부 프레임워크 버전이 낮아서 Spring Session·Redis 호환성 확인에 시간이 생각보다 많이 들었다. 앞으로는 호환성부터 먼저 검증하고 진행할 계획이다.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="redis-session" all={cases} />
    </main>
  );
}

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

const dockerCmd = `# Install Redis (7.4.2)
docker pull redis:7.4.2

# Run the container
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

const pomXml = `<!-- pom.xml - Spring Session + Redis dependencies -->
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

const contextXml = `<!-- context-redis.xml - Redis connection, serialization, and session config -->
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

export default function RedisSessionContentEn() {
  return (
    <main>
      <CaseHero
        organization={organizations['kpf-issga']}
        category="INFRA / SESSION"
        title="Redis-based session clustering"
        subtitle="JEUS Standard Edition does not support session clustering, so I routed around the limitation by putting Redis in front as an external session store. The result: rolling restarts of WAS nodes became possible even on a legacy stack."
        meta={[
          { label: 'Core impact', value: 'Zero-downtime deploys', hint: 'Rolling WAS restarts enabled' },
          { label: 'Session latency', value: 'Milliseconds', hint: 'No perceivable UX impact' },
          { label: 'Framework', value: 'eGovFrame 3.x', hint: 'Native Spring Session support' },
          { label: 'Infrastructure', value: 'Redis 7.4', hint: 'Docker container' },
        ]}
        stack={[
          'Redis 7.4',
          'Spring Session',
          'Spring Data Redis',
          'Lettuce',
          'JEUS (Standard)',
          'Docker',
          'eGovFrame',
        ]}
      />

      <CaseSection eyebrow="Problem" title="Restarting a single WAS wiped out logins and in-progress input" accent="problem">
        <p>
          The setup had multiple WAS nodes, but each one held its own sessions independently. Restarting even a single
          node logged out every user pinned to it, and any form they were filling out was lost along with it.
          JEUS does offer session clustering, but only in the Enterprise license — our environment was Standard,
          so there was no official path to fix it.
        </p>
        <InsightList
          items={[
            {
              title: 'Restarts wiped out logins and form input',
              detail: 'Users routinely lost what they were typing with a single refresh',
            },
            {
              title: 'Zero-downtime deploys were impossible',
              detail: 'Either defer releases to protect sessions, or accept session drops to ship — a constant trade-off',
            },
            {
              title: 'No licensing path to a fix',
              detail: 'Session clustering ships only with JEUS Enterprise; unavailable on Standard',
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Approach" title="Route around it with an external Redis session store" accent="approach">
        <p>
          A license upgrade would have been expensive, so instead I moved sessions out of the application and
          into an external store. Spring Session integrates with Redis out of the box, so no application code
          had to change — only configuration. And because Redis responds in milliseconds, I expected almost
          no user-facing impact.
        </p>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <SessionTopology variant="before" />
          <SessionTopology variant="after" />
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-6">
          {[
            { t: 'Fast responses', d: 'Session reads and writes run in milliseconds — no UX impact' },
            { t: 'Code stays as-is', d: 'Spring Session integrates with Redis natively — config-only change' },
            { t: 'Lightweight ops', d: 'Installed via Docker, TTL managed automatically, simple topology' },
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

      <CaseSection eyebrow="Process" title="Implementation steps" accent="process">
        <ProcessSteps
          steps={[
            {
              title: 'Stand up Redis',
              body: (
                <>
                  <p>
                    I ran Redis 7.4 in a container on a shared Docker host, wiring up a password, a persistent
                    volume, and an auto-restart policy. The host, port, and password used by the application
                    were extracted into a separate properties file.
                  </p>
                  <CodeBlock filename="install-redis.sh" language="bash" code={dockerCmd} />
                  <CodeBlock filename="redis.properties" language="properties" code={redisProps} />
                </>
              ),
            },
            {
              title: 'Add Spring Session dependencies',
              body: (
                <>
                  <p>
                    I added Spring Session, Spring Data Redis, and Lettuce to the eGovFrame project&apos;s
                    pom.xml. This is the groundwork for delegating servlet sessions to an external store.
                  </p>
                  <CodeBlock filename="pom.xml" language="xml" code={pomXml} />
                </>
              ),
            },
            {
              title: 'Wire up the Redis connection and session mapping',
              body: (
                <>
                  <p>
                    In <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">context-redis.xml</code> I declared a LettuceConnectionFactory and <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">RedisHttpSessionConfiguration</code>.
                    That maps the HTTP session to Redis automatically, so no application code had to change.
                  </p>
                  <CodeBlock filename="context-redis.xml" language="xml" code={contextXml} />
                </>
              ),
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Outcome" title="Results and takeaways" accent="outcome">
        <InsightList
          variant="outcome"
          items={[
            {
              title: 'Zero-downtime deploys unlocked',
              detail:
                'Rolling WAS restarts now preserve sessions. Hotfixes and test rollouts can ship without taking the service offline.',
            },
            {
              title: 'Login drops eliminated',
              detail:
                'Under failover, redeploys, and long-running operation, users no longer get kicked out or lose form input.',
            },
            {
              title: 'Worked around the license ceiling with an external store',
              detail:
                'I delivered session clustering without buying the higher license tier — a firsthand lesson that platform constraints can often be solved at the architecture layer.',
            },
            {
              title: 'Next time, verify compatibility up front',
              detail:
                'Because the eGovFrame version was older, validating Spring Session and Redis compatibility took more time than expected. Going forward, I will pin down compatibility before I start.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="redis-session" all={cases} />
    </main>
  );
}

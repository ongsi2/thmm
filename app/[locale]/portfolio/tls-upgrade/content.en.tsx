import CodeBlock from '../_components/CodeBlock';
import { cases, organizations } from '../_components/cases';
import {
  CaseHero,
  CaseSection,
  InsightList,
  ProcessSteps,
  OtherCases,
} from '../_components/CaseShell';
import { ArchStack } from '../_components/diagrams/ArchStack';

const nginxConf = `# /etc/nginx/conf.d/ssl_proxy.conf
server {
    listen       443 ssl;
    server_name  devtest.goad.or.kr;

    ssl_certificate      /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key  /etc/nginx/ssl/private.key;
    ssl_protocols        TLSv1.2 TLSv1.3;

    location / {
        proxy_pass         http://127.0.0.1:8099;
        proxy_set_header   Host               $host;
        proxy_set_header   X-Real-IP          $remote_addr;
        proxy_set_header   X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto  $scheme;
    }
}`;

const webtobConf = `# WebtoB http.m — switch from 443 to the internal port
v_issga_dev_test_ssl
    DOCROOT       = "/kpf_data/docroot/issga_dev_test",
    HOSTNAME      = "devtest.goad.or.kr",
    HOSTALIAS     = "10.30.10.12,175.45.222.244",
    # PORT        = "443",     # previous: external 443 listener
    PORT          = "8099",    # new: internal port that Nginx forwards to
    SSLFLAG       = Y,
    SSLNAME       = "ssl_issga",
    ServiceOrder  = "ext,uri",
    ERRORDOCUMENT = "400,401,403,404,405,406,503",
    METHOD        = "GET, POST, HEAD, -OPTIONS",
    LOGGING       = "acc_issga_dev_test",
    ERRORLOG      = "err_issga_dev_test",
    NodeName      = "tmax"`;

export default function TlsUpgradeContentEn() {
  return (
    <main>
      <CaseHero
        organization={organizations['kpf-issga']}
        category="SECURITY / NETWORK"
        title="Rolling out TLS 1.3 with an Nginx reverse proxy"
        subtitle="Touching the shared WebtoB SSL configuration felt too risky, so I placed Nginx in front as a reverse proxy and terminated TLS there. TLS 1.3 was rolled out without impacting the existing ERP integrations."
        meta={[
          { label: 'Applied TLS', value: '1.0/1.1 → 1.3', hint: 'Meets the security audit requirement' },
          { label: 'Strategy', value: 'SSL Termination', hint: 'Nginx reverse proxy' },
          { label: 'Shared SSL impact', value: 'None', hint: 'WebtoB configuration untouched' },
          { label: 'Per-domain control', value: 'Enabled', hint: 'Independent TLS policies' },
        ]}
        stack={['Nginx', 'WebtoB', 'JEUS (WAS)', 'TLS 1.2/1.3', 'Reverse Proxy', 'SSL Termination']}
      />

      <CaseSection eyebrow="Problem" title="The audit flagged TLS, but the only knob was shared SSL" accent="problem">
        <p>
          During a security audit at the Korea Press Foundation (KPF), the GAIS (Government Advertising Integrated Support System)
          platform was flagged for still serving TLS 1.0/1.1. The seemingly easiest path was to bump the TLS version at the cloud WAF,
          but doing so could break the API traffic between the platform and internal ERP systems, so I could not raise it right away.
          The other lever was WebtoB's shared SSL configuration, which was even trickier — several JEUS containers shared the same SSL
          settings, so a global change would ripple across every connected development server. It was the classic "fix one thing,
          break everything else" setup.
        </p>
        <InsightList
          items={[
            {
              title: 'Audit flagged TLS 1.0/1.1',
              detail: 'Production services had to be raised to TLS 1.2 or above',
            },
            {
              title: 'Changing the WAF needed ERP API compatibility checks first',
              detail: 'API traffic with internal systems had to be validated before flipping the switch',
            },
            {
              title: 'WebtoB shared SSL had a wide blast radius',
              detail: 'Multiple JEUS containers shared the same SSL settings — a global change risked a full outage',
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Approach" title="SSL termination via an Nginx reverse proxy" accent="approach">
        <p>
          Instead of touching the global configuration, I placed Nginx in front as a reverse proxy and used it as the{' '}
          <strong>SSL termination</strong> point. The client ↔ Nginx leg runs TLS 1.2/1.3, while the Nginx ↔ WebtoB leg runs
          over internal HTTP (port 8099). This satisfies the security requirement while leaving the existing WebtoB/JEUS stack
          untouched.
        </p>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-rose-200 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-rose-100">
              <p className="font-mono text-[11px] font-semibold text-rose-600 tracking-[0.2em]">
                AS-IS
              </p>
              <p className="font-mono text-[11px] text-rose-400">TLS 1.0/1.1</p>
            </div>
            <ArchStack
              boxes={[
                { title: 'Client (Browser)', tone: 'neutral' },
                {
                  title: 'WebtoB',
                  subtitle: 'Web Server',
                  bullets: ['TLS 1.0/1.1', 'Flagged for security weakness'],
                  tone: 'danger',
                },
                { title: 'JEUS (WAS)', subtitle: 'Enterprise Application', bullets: ['ERP Logic'] },
              ]}
              edges={[{ label: 'HTTPS / 443' }, { label: 'Internal' }]}
            />
          </div>

          <div className="p-6 bg-white border border-[var(--color-accent)]/30 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--color-accent)]/20">
              <p className="font-mono text-[11px] font-semibold text-[var(--color-accent)] tracking-[0.2em]">
                TO-BE
              </p>
              <p className="font-mono text-[11px] text-[var(--color-accent-dark)]">
                TLS 1.2 / 1.3
              </p>
            </div>
            <ArchStack
              boxes={[
                { title: 'Client (Browser)' },
                {
                  title: 'Nginx',
                  subtitle: 'Reverse Proxy',
                  bullets: ['SSL Termination', 'ssl_protocols TLSv1.2 TLSv1.3'],
                  tone: 'accent',
                },
                {
                  title: 'WebtoB',
                  subtitle: 'Web Server',
                  bullets: ['Existing shared SSL config preserved'],
                },
                { title: 'JEUS (WAS)', subtitle: 'Enterprise Application', bullets: ['ERP Logic'] },
              ]}
              edges={[
                { label: 'HTTPS / 443' },
                { label: 'HTTP / 8099' },
                { label: 'Internal' },
              ]}
            />
          </div>
        </div>

        <p className="text-sm text-[var(--color-text-muted)] mt-6 leading-relaxed">
          Because WebtoB shares a single SSL configuration across multiple JEUS containers, any global TLS change that breaks
          internal API traffic impacts every connected development server at once. Putting Nginx in front isolates that risk and
          also makes it easy to manage TLS policies per domain.
        </p>
      </CaseSection>

      <CaseSection eyebrow="Process" title="Implementation steps" accent="process">
        <ProcessSteps
          steps={[
            {
              title: 'Install Nginx and configure SSL/TLS',
              body: (
                <>
                  <p>
                    I installed Nginx on the target server and defined the certificate paths, TLS versions, and proxy
                    forwarding headers in <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">ssl_proxy.conf</code>. I left only
                    TLSv1.2 and TLSv1.3 under <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">ssl_protocols</code>,
                    so the weaker earlier versions are rejected outright.
                  </p>
                  <CodeBlock filename="ssl_proxy.conf" language="nginx" code={nginxConf} />
                </>
              ),
            },
            {
              title: 'Switch the WebtoB http.m listener port',
              body: (
                <>
                  <p>
                    The WebtoB virtual server that used to listen on 443 directly was switched to the internal port (8099) that
                    Nginx forwards to. Nginx handles TLS termination while WebtoB's shared SSL configuration stays in place —
                    a clean separation of responsibilities.
                  </p>
                  <CodeBlock filename="http.m" language="config" code={webtobConf} />
                </>
              ),
            },
            {
              title: 'Roll out per domain, then validate the ERP APIs',
              body: (
                <p>
                  I raised the TLS version on a test domain first, verified that the main internal ERP APIs (query, create,
                  update) still worked end-to-end, and once everything checked out, completed the TLS 1.3 rollout on the
                  production servers.
                </p>
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
              title: 'TLS 1.3 rolled out without affecting existing services',
              detail:
                "By moving TLS termination up to the Nginx layer instead of touching WebtoB's shared SSL configuration, the audit requirement (TLS 1.2 or higher) was satisfied with no impact on existing services.",
            },
            {
              title: 'TLS policies now managed independently per domain',
              detail:
                'When a specific domain needs a different cipher suite or certificate — or needs to be tested in isolation — I can now do that without touching any of the other services.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="tls-upgrade" all={cases} />
    </main>
  );
}

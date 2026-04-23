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

const webtobConf = `# WebtoB http.m — 443에서 내부 포트로 변경
v_issga_dev_test_ssl
    DOCROOT       = "/kpf_data/docroot/issga_dev_test",
    HOSTNAME      = "devtest.goad.or.kr",
    HOSTALIAS     = "10.30.10.12,175.45.222.244",
    # PORT        = "443",     # 기존: 외부 443 수신
    PORT          = "8099",    # 변경: Nginx가 프록시로 전달하는 내부 포트
    SSLFLAG       = Y,
    SSLNAME       = "ssl_issga",
    ServiceOrder  = "ext,uri",
    ERRORDOCUMENT = "400,401,403,404,405,406,503",
    METHOD        = "GET, POST, HEAD, -OPTIONS",
    LOGGING       = "acc_issga_dev_test",
    ERRORLOG      = "err_issga_dev_test",
    NodeName      = "tmax"`;

export default function TlsUpgradeContentKo() {
  return (
    <main>
      <CaseHero
        organization={organizations['kpf-issga']}
        category="SECURITY / NETWORK"
        title="Nginx 리버스 프록시로 TLS 1.3 적용"
        subtitle="공용 WebtoB SSL 설정을 건드리기 부담스러워서, 앞단에 Nginx를 세우고 거기서 TLS를 종단하도록 구조를 바꿨습니다. 기존 ERP 연동에 영향 없이 TLS 1.3을 적용했습니다."
        meta={[
          { label: '적용 TLS', value: '1.0/1.1 → 1.3', hint: '보안 감사 요구 충족' },
          { label: '전략', value: 'SSL Termination', hint: 'Nginx 리버스 프록시' },
          { label: '공용 SSL 영향', value: '없음', hint: 'WebtoB 설정 그대로' },
          { label: '도메인별 제어', value: '가능', hint: '독립 TLS 정책' },
        ]}
        stack={['Nginx', 'WebtoB', 'JEUS (WAS)', 'TLS 1.2/1.3', 'Reverse Proxy', 'SSL Termination']}
      />

      <CaseSection eyebrow="Problem" title="TLS 지적은 받았는데, 건드릴 곳이 공용 SSL 뿐이었음" accent="problem">
        <p>
          보안 감사에서 "TLS 1.0/1.1을 아직 쓰고 있다"는 지적을 받았습니다. 한 눈에 가장 쉬워 보이는 경로는
          클라우드 WAF에서 TLS 버전을 바꾸는 거였는데, 이걸 건드리면 내부 ERP와의 API 통신에 영향이 갈 수 있어서
          바로 못 올리는 상황이었습니다. 다른 한쪽에는 WebtoB 공용 SSL이 있었는데 이게 더 까다로웠어요 — 여러 JEUS
          컨테이너가 같은 SSL 설정을 공유하고 있어서, 전역으로 바꾸면 연결된 개발 서버들까지 전부 영향권에
          들어갑니다. "이거 고치려다 다른 거 다 깨지는" 전형적인 구조였습니다.
        </p>
        <InsightList
          items={[
            {
              title: '보안 감사에서 TLS 1.0/1.1 지적',
              detail: '운영 서비스의 TLS 버전을 1.2 이상으로 올려야 함',
            },
            {
              title: 'WAF에서 바꾸면 ERP API 영향 확인 필요',
              detail: '내부 시스템과의 API 통신 호환성을 먼저 검증해야 하는 상황',
            },
            {
              title: 'WebtoB 공용 SSL은 범위가 큼',
              detail: '여러 JEUS 컨테이너가 같은 SSL 설정을 공유 — 전역 변경은 전체 장애 위험',
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Approach" title="Nginx 리버스 프록시 기반 SSL Termination" accent="approach">
        <p>
          전역 설정을 건드리는 대신 Nginx를 리버스 프록시로 세워서 <strong>SSL Termination</strong> 지점으로
          썼습니다. 클라이언트 ↔ Nginx 구간은 TLS 1.2/1.3으로, Nginx ↔ WebtoB 구간은 내부 HTTP(8099)로
          구성했습니다. 보안 요구사항은 충족하면서 기존 WebtoB/JEUS 구조는 그대로 두는 접근입니다.
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
                  bullets: ['TLS 1.0/1.1', '보안 취약점 지적'],
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
                  bullets: ['기존 공용 SSL 설정 유지'],
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
          WebtoB가 여러 JEUS 컨테이너와 하나의 SSL 설정을 공유하다 보니, TLS를 전역으로 바꿀 때 내부 API 통신에
          문제가 생기면 연결된 개발 서버 전체가 영향을 받습니다. Nginx를 앞단에 두면 그 리스크를 격리할 수 있고,
          도메인별로 TLS 정책을 따로 관리하기도 편합니다.
        </p>
      </CaseSection>

      <CaseSection eyebrow="Process" title="구현 단계" accent="process">
        <ProcessSteps
          steps={[
            {
              title: 'Nginx 설치 및 SSL/TLS 설정',
              body: (
                <>
                  <p>
                    대상 서버에 Nginx를 설치하고 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">ssl_proxy.conf</code>에
                    인증서 경로·TLS 버전·프록시 전달 헤더를 정의했습니다. <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">ssl_protocols</code>에는
                    TLSv1.2·TLSv1.3만 남겨, 취약한 이전 버전은 아예 받지 않도록 했습니다.
                  </p>
                  <CodeBlock filename="ssl_proxy.conf" language="nginx" code={nginxConf} />
                </>
              ),
            },
            {
              title: 'WebtoB http.m 수신 포트 변경',
              body: (
                <>
                  <p>
                    기존에 443으로 직접 받던 WebtoB 가상 서버의 포트를, Nginx가 프록시로 넘겨주는 내부 포트(8099)로
                    바꿨습니다. SSL 종단은 Nginx가 맡고, WebtoB의 공용 SSL 설정은 그대로 두는 역할 분리 구조입니다.
                  </p>
                  <CodeBlock filename="http.m" language="config" code={webtobConf} />
                </>
              ),
            },
            {
              title: '도메인별 적용 후 ERP API 검증',
              body: (
                <p>
                  테스트 도메인부터 TLS 버전을 올린 뒤 내부 ERP 주요 API(조회·등록·수정)가 정상 동작하는지 확인했고,
                  문제 없는 걸 확인한 다음 운영 서버에 TLS 1.3 적용을 완료했습니다.
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
              title: '기존 서비스 영향 없이 TLS 1.3 적용',
              detail:
                'WebtoB 공용 SSL 설정을 건드리지 않고 Nginx 계층에서 TLS를 종단하는 구조로 바꿔, 보안 감사 요구(TLS 1.2 이상)는 충족하면서 기존 서비스에는 영향이 없었습니다.',
            },
            {
              title: '도메인별로 TLS 정책을 따로 관리 가능',
              detail:
                '특정 도메인만 암호화 스위트나 인증서를 바꾸거나 테스트해야 할 때, 다른 서비스를 건드리지 않고 작업할 수 있는 구조가 됐습니다.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="tls-upgrade" all={cases} />
    </main>
  );
}

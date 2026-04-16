import type { Metadata } from 'next';
import CodeBlock from '../_components/CodeBlock';
import { cases, organizations } from '../_components/cases';
import {
  CaseHero,
  CaseSection,
  InsightList,
  ProcessSteps,
  OtherCases,
} from '../_components/CaseShell';
import { SsoFlow } from '../_components/diagrams/SsoFlow';

export const metadata: Metadata = {
  title: '외부 사이트용 SSO Provider 구축',
  description:
    'OTT 등 외부 기관 사이트에서 바다봄 계정으로 로그인하도록 Provider를 직접 구현. 일회용 UUID 토큰을 DB에 저장해 다중 WAS를 지원하고, CI 기반으로 양쪽 계정을 자동 매핑한 케이스 스터디.',
  alternates: { canonical: 'https://thmm.kr/portfolio/sso-provider' },
};

const generateTokenCode = `// SsoController.java - 다중 WAS 대응을 위해 DB에 토큰 저장
public String generateToken(String userId, String userName, String email) {
    // 주기적으로 만료 토큰 정리 (10회 생성마다)
    if (tokenGenerationCount.incrementAndGet() >= CLEANUP_INTERVAL) {
        cleanupExpiredTokens();
        tokenGenerationCount.set(0);
    }

    String token = UUID.randomUUID().toString().replace("-", "");
    long expireTime = System.currentTimeMillis() + TOKEN_EXPIRE_MS; // 1분

    Map<String, Object> params = new HashMap<>();
    params.put("token", token);
    params.put("userId", userId);
    params.put("expireTime", expireTime);
    ssoMappingDAO.insertToken(params);  // ← 메모리가 아닌 DB 저장 = 다중 WAS 공유

    return token;
}`;

const ciResolveCode = `// CI(개인 공통 식별자) 기반 사용자 ID 결정
// - OTT 기존회원(SSO_USER_MAPPING 존재): OTT ID 반환 (양쪽 계정 연결)
// - 신규회원: 바다봄 ID 그대로 반환
public String resolveUserIdByCi(String encryptedCi, String badabomUserId) {
    if (StringUtils.isBlank(encryptedCi)) return badabomUserId;

    try {
        String decryptedCi = CryptoUtil.decrypt(encryptedCi);
        if (StringUtils.isBlank(decryptedCi)) return badabomUserId;

        // 매핑 테이블에서 OTT ID 조회
        String ottUserId = ssoMappingDAO.selectOttUserIdByCi(decryptedCi);
        if (StringUtils.isNotBlank(ottUserId)) {
            log.info("[SSO] OTT 기존회원 발견 - CI 매핑: {} -> {}", badabomUserId, ottUserId);
            return ottUserId;
        }
        return badabomUserId;
    } catch (Exception e) {
        log.error("[SSO] CI 기반 ID 결정 오류, 바다봄 ID fallback", e);
        return badabomUserId;
    }
}`;

const verifyCode = `// 토큰 검증 API - OTT가 호출, 일회용 소비
@RequestMapping(value = "/sso/verify.do", method = {GET, POST})
@ResponseBody
public Map<String, Object> verify(HttpServletRequest request, HttpServletResponse response) {
    // CORS 허용
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    Map<String, Object> result = new HashMap<>();
    String token = request.getParameter("token");

    if (StringUtils.isBlank(token)) {
        result.put("success", false);
        result.put("message", "토큰이 필요합니다.");
        return result;
    }

    // DB에서 토큰 조회 (만료 체크 포함)
    String userId = ssoMappingDAO.selectTokenUserId(token);

    if (StringUtils.isBlank(userId)) {
        result.put("success", false);
        result.put("message", "유효하지 않은 토큰입니다.");
        return result;
    }

    // 일회용: 검증 후 즉시 삭제 (재사용 방지)
    ssoMappingDAO.deleteToken(token);

    result.put("success", true);
    result.put("userId", userId);
    return result;
}`;

const redirectWhitelistCode = `// 허용된 redirect_uri 도메인만 토큰 발급
private static final String[] ALLOWED_DOMAINS = {
    "localhost:3000",       // 테스트용
    "ofris.kimst.re.kr",    // OTT 운영
    "192.168.40.36:8000"    // OTT 내부망 테스트
};

private boolean isAllowedRedirectUri(String redirectUri) {
    for (String allowed : ALLOWED_DOMAINS) {
        if (redirectUri.contains(allowed)) return true;
    }
    return false;
}

// /sso/login.do 진입 시 검증
if (!isAllowedRedirectUri(redirectUri)) {
    log.warn("[SSO] 허용되지 않은 redirect_uri: {}", redirectUri);
    response.sendError(HttpServletResponse.SC_FORBIDDEN, "허용되지 않은 redirect_uri");
    return;
}`;

export default function SsoProviderCase() {
  return (
    <main>
      <CaseHero
        organization={organizations['kimst-bdbis']}
        category="AUTH / SSO"
        title="외부 사이트용 SSO Provider 구축"
        subtitle="이관 후에도 남아 있는 OTT 사이트에서 바다봄 계정으로 로그인할 수 있도록 Provider를 직접 만들었습니다. 일회용 UUID 토큰을 DB에 저장해 다중 WAS에서도 흔들림 없이 동작하게 하고, CI 기반 매핑으로 양쪽 사이트에 이미 흩어져 있던 계정을 자동으로 연결했습니다."
        meta={[
          { label: '통합 대상', value: 'OTT 등 외부', hint: '기관 사이트' },
          { label: '토큰', value: 'UUID + DB', hint: '일회용 · 1분 만료' },
          { label: '다중 WAS', value: '지원', hint: 'DB 기반 공유 저장' },
          { label: '계정 매핑', value: 'CI 기반', hint: '기존회원 자동 연결' },
        ]}
        stack={[
          'Spring MVC',
          'iBATIS',
          'UUID Token',
          'DB 세션 저장소',
          'CORS',
          'SHA · 개인 CI 복호화',
          '전자정부 프레임워크',
        ]}
      />

      <CaseSection eyebrow="Problem" title="이관 후에도 남는 OTT 사이트, 그리고 흩어진 계정들" accent="problem">
        <p>
          OTT 기술거래 시스템의 기능 일부는 바다봄으로 이관됐지만, OTT 사이트 자체는 별도로 남아서 운영이 계속
          됐습니다. 그 OTT에서 <strong>바다봄 계정</strong>으로 로그인할 수 있어야 한다는 요구가 붙었는데, 상용 SSO
          솔루션을 따로 도입하기엔 비용·일정 부담이 컸습니다.
        </p>
        <p>
          게다가 두 사이트엔 이미 같은 사람이 각자 다른 ID로 가입해 있는 경우가 많았습니다. 시스템상으로는 서로
          다른 계정으로 보이지만, CI(개인 공통 식별자) 기준으로는 사실 동일인입니다. 로그인을 연결한다면 이 "같은
          사람인데 계정이 쪼개져 있는" 상황도 같이 해결해줘야 했습니다.
        </p>
        <InsightList
          items={[
            {
              title: '외부 사이트에서 바다봄 인증을 재사용해야 함',
              detail:
                '이관 후에도 OTT 사이트는 따로 살아 있어서, 거기서 바다봄 계정으로 바로 로그인할 수 있는 경로가 있어야 했습니다.',
            },
            {
              title: '같은 사람이 양쪽에 별도 계정으로 존재',
              detail:
                'OTT와 바다봄에 각각 가입한 사용자는 CI로는 동일인이지만 ID가 달랐습니다. 같은 사람인데 계정이 쪼개져 보이지 않도록 매핑해야 했습니다.',
            },
            {
              title: '메모리 기반 토큰은 다중 WAS에서 깨짐',
              detail:
                '로드밸런서 때문에 로그인한 WAS와 verify를 받는 WAS가 달라질 수 있어서, 메모리 Map으로 토큰을 보관하면 다른 노드에서는 "없는 토큰"이 돼 버립니다.',
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Approach" title="경량 Provider 직접 구현 — UUID + DB + CI 매핑" accent="approach">
        <p>
          상용 솔루션을 도입하기엔 과했고, 연동 대상도 당분간은 OTT 한 곳이라 <strong>경량 Provider</strong>를
          직접 만드는 쪽이 더 맞았습니다. 형태는 OAuth2 Implicit과 비슷하게 — 바다봄에서 로그인이 끝나면{' '}
          <strong>일회용 UUID 토큰</strong>을 redirect URL에 붙여 돌려주고, OTT가 그 토큰을 verify 엔드포인트로
          확인하면 즉시 소비해서 재사용을 막는 흐름입니다.
        </p>
        <p>
          토큰을 세션이나 메모리에 두지 않고 <strong>DB 테이블</strong>에 저장한 게 핵심입니다. 이렇게 하면 어느
          WAS에서 발급해도 다른 WAS에서 verify가 가능하니까 다중 WAS 환경에서 깨지지 않습니다. 계정 매핑은{' '}
          <strong>CI 기반</strong>으로 처리해서, OTT에 기존 계정이 있으면 자동으로 그 ID를 반환하고, 없으면 바다봄
          ID로 새로 이어지도록 했습니다. 사용자는 "어느 쪽 계정이 맞는 거지?" 고민 없이 자연스럽게 넘어갈 수
          있습니다.
        </p>

        <div className="mt-8">
          <SsoFlow
            actorLeft="OTT"
            actorLeftRole="External Site"
            actorRight="바다봄"
            actorRightRole="SSO Provider"
            steps={[
              {
                direction: 'forward',
                label: '/sso/login.do',
                sub: '?redirect_uri=https://ott/...',
              },
              {
                direction: 'internal-right',
                label: 'redirect_uri 화이트리스트 검증',
                sub: 'ALLOWED_DOMAINS 포함 여부',
              },
              {
                direction: 'backward',
                label: '로그인 페이지 렌더',
                sub: '세션에 redirect_uri 보관',
              },
              {
                direction: 'forward',
                label: 'POST 로그인',
                sub: 'ID / PW 인증',
              },
              {
                direction: 'internal-right',
                label: 'CI로 OTT 기존회원 조회',
                sub: 'resolveUserIdByCi()',
              },
              {
                direction: 'internal-right',
                label: 'UUID 토큰 DB INSERT',
                sub: 'SSO_USER_TOKEN · 1분 만료',
              },
              {
                direction: 'backward',
                label: 'redirect(token=xxx)',
                sub: 'redirect_uri?token=...',
              },
              {
                direction: 'forward',
                label: '/sso/verify.do?token=xxx',
                sub: 'OTT 백엔드에서 호출',
              },
              {
                direction: 'internal-right',
                label: '토큰 SELECT + DELETE',
                sub: '일회용 소비 (재사용 차단)',
              },
              {
                direction: 'backward',
                label: '{ success: true, userId }',
                sub: 'JSON 응답',
              },
            ]}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-8">
          {[
            { t: '다중 WAS', d: 'DB 저장소라 어느 노드에서 발급해도 검증 가능' },
            { t: '계정 매핑', d: 'CI로 OTT/바다봄 계정 연결 — 중복 생성 방지' },
            { t: '피싱 방지', d: 'redirect_uri 화이트리스트 + 일회용 토큰' },
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

      <CaseSection eyebrow="Process" title="구현 단계" accent="process">
        <ProcessSteps
          steps={[
            {
              title: 'DB 기반 토큰 저장소 설계',
              body: (
                <>
                  <p>
                    토큰을 메모리 Map에 두면 WAS가 두 대 이상일 때 발급/검증 노드가 달라 "없는 토큰"이 됩니다.{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      SSO_USER_TOKEN
                    </code>{' '}
                    테이블에 토큰·userId·만료시각을 저장해, 모든 WAS가 같은 저장소를 참조하도록 구성했습니다. 10회
                    발급마다 만료 토큰을 정리하는 경량 GC도 같이 넣었습니다.
                  </p>
                  <CodeBlock filename="SsoController.java" language="java" code={generateTokenCode} />
                </>
              ),
            },
            {
              title: 'CI 기반 OTT ↔ 바다봄 계정 매핑',
              body: (
                <>
                  <p>
                    같은 사람이 양쪽 사이트에 별도 가입돼 있는 경우, CI(개인 공통 식별자)로 동일인을 찾을 수
                    있습니다. 바다봄의 암호화된 CI를 복호화해 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      SSO_USER_MAPPING
                    </code>에서 OTT ID를 조회, 매핑이 있으면 OTT ID를, 없으면 바다봄 ID를 그대로 반환합니다.
                    매핑이 없어도 로그인이 실패하지 않도록 fallback 처리를 두어, 신규 회원에게도 매끄럽게 동작하도록
                    했습니다.
                  </p>
                  <CodeBlock filename="SsoController.java" language="java" code={ciResolveCode} />
                </>
              ),
            },
            {
              title: '일회용 검증 + CORS',
              body: (
                <>
                  <p>
                    OTT가 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      /sso/verify.do
                    </code>로 토큰을 확인하면, 검증 즉시 DB에서 토큰을 삭제해 재사용을 막습니다. 외부 도메인에서
                    호출되므로 CORS 헤더도 같이 내려줬습니다.
                  </p>
                  <CodeBlock filename="SsoController.java" language="java" code={verifyCode} />
                </>
              ),
            },
            {
              title: 'redirect_uri 화이트리스트 + 로깅',
              body: (
                <>
                  <p>
                    토큰 탈취·피싱 대응으로 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      redirect_uri
                    </code>는 사전에 등록된 도메인만 허용했습니다. 미허용 도메인은 403으로 거부되고, 시도 기록은
                    warn 로그로 남겨 이후 감사에 활용합니다.
                  </p>
                  <CodeBlock filename="SsoController.java" language="java" code={redirectWhitelistCode} />
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
              title: '외부 사이트와의 SSO 통합 완료',
              detail:
                'OTT에서 바다봄 계정으로 로그인 후 토큰을 받아 OTT 세션을 생성하는 흐름이 다중 WAS 환경에서도 안정적으로 동작합니다.',
            },
            {
              title: '양쪽 사이트 계정이 CI로 자동 연결',
              detail:
                '기존 OTT 회원이 바다봄에 별도 가입해도 CI 매핑으로 동일 사용자로 인식됩니다. 사용자 입장에서 계정이 쪼개져 보이는 혼란이 사라졌습니다.',
            },
            {
              title: '세션이 아닌 DB에 토큰을 두는 패턴 습득',
              detail:
                '다중 WAS 환경에서 세션/메모리 기반 상태 공유가 깨지는 문제는 Redis 세션 클러스터링 때도 마주친 패턴입니다. "공유가 필요한 상태는 외부 저장소로" 원칙을 다시 확인했습니다.',
            },
            {
              title: 'redirect_uri는 무조건 화이트리스트',
              detail:
                '문자열 일치 기반의 contains 체크는 간단해 보여도 취약할 수 있어, 실제 배포 시에는 host·scheme 파싱을 더 엄격하게 다듬을 여지가 있습니다. 다음 반복에서는 URL 파서를 사용해 검증 로직을 더 타이트하게 만들 예정입니다.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="sso-provider" all={cases} />
    </main>
  );
}

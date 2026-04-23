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

const generateTokenCode = `// SsoController.java - stores tokens in the DB so multiple WAS nodes stay in sync
public String generateToken(String userId, String userName, String email) {
    // Periodically clean up expired tokens (every 10 issuances)
    if (tokenGenerationCount.incrementAndGet() >= CLEANUP_INTERVAL) {
        cleanupExpiredTokens();
        tokenGenerationCount.set(0);
    }

    String token = UUID.randomUUID().toString().replace("-", "");
    long expireTime = System.currentTimeMillis() + TOKEN_EXPIRE_MS; // 1 minute

    Map<String, Object> params = new HashMap<>();
    params.put("token", token);
    params.put("userId", userId);
    params.put("expireTime", expireTime);
    ssoMappingDAO.insertToken(params);  // stored in the DB rather than memory = shared across multiple WAS nodes

    return token;
}`;

const ciResolveCode = `// Resolves the user ID from the CI (Connecting Information — Korea's national personal identifier)
// - Existing OTT member (row exists in SSO_USER_MAPPING): returns the OTT ID (links the two accounts)
// - New member: returns the Badabom ID as-is
public String resolveUserIdByCi(String encryptedCi, String badabomUserId) {
    if (StringUtils.isBlank(encryptedCi)) return badabomUserId;

    try {
        String decryptedCi = CryptoUtil.decrypt(encryptedCi);
        if (StringUtils.isBlank(decryptedCi)) return badabomUserId;

        // Look up the OTT ID in the mapping table
        String ottUserId = ssoMappingDAO.selectOttUserIdByCi(decryptedCi);
        if (StringUtils.isNotBlank(ottUserId)) {
            log.info("[SSO] Existing OTT member found - CI mapping: {} -> {}", badabomUserId, ottUserId);
            return ottUserId;
        }
        return badabomUserId;
    } catch (Exception e) {
        log.error("[SSO] CI-based ID resolution failed, falling back to Badabom ID", e);
        return badabomUserId;
    }
}`;

const verifyCode = `// Token verification API - called by OTT, single-use consumption
@RequestMapping(value = "/sso/verify.do", method = {GET, POST})
@ResponseBody
public Map<String, Object> verify(HttpServletRequest request, HttpServletResponse response) {
    // Allow CORS
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    Map<String, Object> result = new HashMap<>();
    String token = request.getParameter("token");

    if (StringUtils.isBlank(token)) {
        result.put("success", false);
        result.put("message", "Token is required.");
        return result;
    }

    // Look up the token in the DB (includes expiry check)
    String userId = ssoMappingDAO.selectTokenUserId(token);

    if (StringUtils.isBlank(userId)) {
        result.put("success", false);
        result.put("message", "Invalid token.");
        return result;
    }

    // Single-use: delete immediately after verification (prevents reuse)
    ssoMappingDAO.deleteToken(token);

    result.put("success", true);
    result.put("userId", userId);
    return result;
}`;

const redirectWhitelistCode = `// Only issue tokens to allow-listed redirect_uri domains
private static final String[] ALLOWED_DOMAINS = {
    "localhost:3000",       // for testing
    "ofris.kimst.re.kr",    // OTT production
    "192.168.40.36:8000"    // OTT internal-network testing
};

private boolean isAllowedRedirectUri(String redirectUri) {
    for (String allowed : ALLOWED_DOMAINS) {
        if (redirectUri.contains(allowed)) return true;
    }
    return false;
}

// Validate on entry to /sso/login.do
if (!isAllowedRedirectUri(redirectUri)) {
    log.warn("[SSO] Disallowed redirect_uri: {}", redirectUri);
    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Disallowed redirect_uri");
    return;
}`;

export default function SsoProviderContentEn() {
  return (
    <main>
      <CaseHero
        organization={organizations['kimst-bdbis']}
        category="AUTH / SSO"
        title="Building an SSO Provider for external sites"
        subtitle="Even after migration, the OTT (Online Technology Transfer) technology-trade site still needed to let users sign in with Badabom accounts, so I built a Provider from scratch. Single-use UUID tokens are stored in the DB so everything keeps working across multiple WAS nodes, and CI-based mapping automatically reconnects accounts that were already scattered across both sites."
        meta={[
          { label: 'Integration target', value: 'OTT and similar', hint: 'External partner sites' },
          { label: 'Token', value: 'UUID + DB', hint: 'Single-use · 1 min expiry' },
          { label: 'Multi-WAS', value: 'Supported', hint: 'DB-backed shared store' },
          { label: 'Account mapping', value: 'CI-based', hint: 'Existing members auto-linked' },
        ]}
        stack={[
          'Spring MVC',
          'iBATIS',
          'UUID Token',
          'DB session store',
          'CORS',
          'SHA · personal CI decryption',
          'eGovFrame',
        ]}
      />

      <CaseSection eyebrow="Problem" title="An OTT site that outlived migration, and scattered accounts" accent="problem">
        <p>
          Part of the OTT (Online Technology Transfer) technology-trade system's functionality was migrated into Badabom, but the OTT site itself remained live and continued
          operating on its own. A new requirement came in: users had to be able to sign in there with their{' '}
          <strong>Badabom account</strong>. Bringing in a commercial SSO solution just for this would have been too expensive and too slow.
        </p>
        <p>
          On top of that, the same person had often signed up on both sites under different IDs. The system saw them as
          separate accounts, but by CI (Connecting Information — Korea's national personal identifier), they were the
          same individual. If I was going to connect the logins, I had to solve the "same person, split accounts"
          situation at the same time.
        </p>
        <InsightList
          items={[
            {
              title: 'External site needs to reuse Badabom authentication',
              detail:
                'Even after migration, the OTT site stayed alive on its own, so there had to be a path to sign in there with a Badabom account.',
            },
            {
              title: 'The same person exists as separate accounts on both sites',
              detail:
                'A user who had signed up separately on OTT and Badabom was the same individual by CI but had different IDs. I had to map them so the account would not look split to that user.',
            },
            {
              title: 'In-memory tokens break across multiple WAS nodes',
              detail:
                'Because of the load balancer, the WAS that handled login and the WAS that received verify could be different, so keeping tokens in an in-memory Map meant "unknown token" on the other node.',
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Approach" title="Build a lightweight Provider in-house — UUID + DB + CI mapping" accent="approach">
        <p>
          A commercial solution was overkill, and for now the only integration target was OTT, so it made more sense to
          build a <strong>lightweight Provider</strong> myself. The shape is close to OAuth2 Implicit — once login
          finishes on Badabom, I attach a <strong>single-use UUID token</strong> to the redirect URL and hand it back,
          and when OTT checks that token against the verify endpoint it gets consumed immediately so it cannot be
          replayed.
        </p>
        <p>
          The key choice was storing tokens in a <strong>DB table</strong> rather than a session or memory. That way a
          token issued on any WAS can be verified from any other WAS, so nothing breaks in a multi-WAS environment. I
          handled account mapping <strong>based on CI</strong>: if the user already has an account on OTT, the
          existing OTT ID is returned automatically; if not, the flow continues with the Badabom ID. From the user's
          side, there is no "wait, which account am I supposed to use?" moment — it just flows through.
        </p>

        <div className="mt-8">
          <SsoFlow
            actorLeft="OTT"
            actorLeftRole="External Site"
            actorRight="Badabom"
            actorRightRole="SSO Provider"
            steps={[
              {
                direction: 'forward',
                label: '/sso/login.do',
                sub: '?redirect_uri=https://ott/...',
              },
              {
                direction: 'internal-right',
                label: 'Validate redirect_uri against allow-list',
                sub: 'Contained in ALLOWED_DOMAINS?',
              },
              {
                direction: 'backward',
                label: 'Render login page',
                sub: 'Keep redirect_uri in session',
              },
              {
                direction: 'forward',
                label: 'POST login',
                sub: 'ID / PW authentication',
              },
              {
                direction: 'internal-right',
                label: 'Look up existing OTT member by CI',
                sub: 'resolveUserIdByCi()',
              },
              {
                direction: 'internal-right',
                label: 'INSERT UUID token into DB',
                sub: 'SSO_USER_TOKEN · 1 min expiry',
              },
              {
                direction: 'backward',
                label: 'redirect(token=xxx)',
                sub: 'redirect_uri?token=...',
              },
              {
                direction: 'forward',
                label: '/sso/verify.do?token=xxx',
                sub: 'Called from OTT backend',
              },
              {
                direction: 'internal-right',
                label: 'Token SELECT + DELETE',
                sub: 'Single-use consumption (blocks reuse)',
              },
              {
                direction: 'backward',
                label: '{ success: true, userId }',
                sub: 'JSON response',
              },
            ]}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-8">
          {[
            { t: 'Multi-WAS', d: 'DB-backed store means verification works from any node, regardless of where the token was issued' },
            { t: 'Account mapping', d: 'Links OTT and Badabom accounts via CI — prevents duplicate-account creation' },
            { t: 'Phishing defense', d: 'redirect_uri allow-list + single-use tokens' },
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

      <CaseSection eyebrow="Process" title="Implementation steps" accent="process">
        <ProcessSteps
          steps={[
            {
              title: 'Designed a DB-backed token store',
              body: (
                <>
                  <p>
                    If tokens live in an in-memory Map, having two or more WAS nodes means the issuing and verifying
                    nodes can differ, turning the token into "unknown." I stored the token, userId, and expiry time in
                    a{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      SSO_USER_TOKEN
                    </code>{' '}
                    table so every WAS node references the same store. I also added a lightweight GC that sweeps
                    expired tokens every 10 issuances.
                  </p>
                  <CodeBlock filename="SsoController.java" language="java" code={generateTokenCode} />
                </>
              ),
            },
            {
              title: 'CI-based OTT ↔ Badabom account mapping',
              body: (
                <>
                  <p>
                    When the same person has signed up separately on both sites, CI (Connecting Information — Korea's
                    national personal identifier) can identify them as the same individual. I decrypt the encrypted CI
                    stored on Badabom, look up the OTT ID in{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      SSO_USER_MAPPING
                    </code>, and return the OTT ID if a mapping exists; otherwise I return the Badabom ID as-is. A
                    fallback makes sure login never fails when no mapping is found, so the flow is smooth for new
                    members too.
                  </p>
                  <CodeBlock filename="SsoController.java" language="java" code={ciResolveCode} />
                </>
              ),
            },
            {
              title: 'Single-use verification + CORS',
              body: (
                <>
                  <p>
                    When OTT checks a token via{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      /sso/verify.do
                    </code>, I delete the token from the DB immediately after verification to block reuse. Because the
                    call comes from an external domain, I also send back the necessary CORS headers.
                  </p>
                  <CodeBlock filename="SsoController.java" language="java" code={verifyCode} />
                </>
              ),
            },
            {
              title: 'redirect_uri allow-list + logging',
              body: (
                <>
                  <p>
                    To defend against token theft and phishing, I only allow pre-registered domains for{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      redirect_uri
                    </code>. Disallowed domains are rejected with 403, and the attempt is recorded as a warn log so it
                    can be used for later auditing.
                  </p>
                  <CodeBlock filename="SsoController.java" language="java" code={redirectWhitelistCode} />
                </>
              ),
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Outcome" title="Results and lessons" accent="outcome">
        <InsightList
          variant="outcome"
          items={[
            {
              title: 'SSO integration with the external site is complete',
              detail:
                'The flow — signing in on OTT with a Badabom account, receiving a token, and creating an OTT session — runs reliably even in a multi-WAS environment.',
            },
            {
              title: 'Accounts on both sites are automatically linked by CI',
              detail:
                'Even when an existing OTT member separately signed up on Badabom, CI mapping recognizes them as the same user. From the user\'s side, the confusion of seeing their account as split simply disappeared.',
            },
            {
              title: 'Learned the "tokens in DB, not session" pattern',
              detail:
                'The problem of shared state breaking in a multi-WAS environment is exactly the one I ran into with Redis session clustering. This reinforced the principle: "shared state belongs in an external store."',
            },
            {
              title: 'redirect_uri must always be allow-listed',
              detail:
                'A contains-based string match looks simple but can be fragile, so for real deployments there is room to tighten host and scheme parsing. In the next iteration I plan to use a URL parser to make the validation logic stricter.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="sso-provider" all={cases} />
    </main>
  );
}

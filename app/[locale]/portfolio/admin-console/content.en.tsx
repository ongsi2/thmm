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

const sitemeshCode = `<!-- sitemesh3.xml — the 106 /adm mappings are never touched -->
<!-- adminConsole.jsp was converted *in place* into the child decorator,
     so every existing mapping now points at the child. Remaps: 0 lines. -->
<mapping path="/adm/techTrade/**"  decorator="/WEB-INF/jsp/decorators/adminConsole.jsp"/>
<mapping path="/adm/techCert/**"   decorator="/WEB-INF/jsp/decorators/adminConsole.jsp"/>
<mapping path="/adm/stupIvst/**"   decorator="/WEB-INF/jsp/decorators/adminConsole.jsp"/>
<!-- … ~100 more lines, unchanged … -->

<!-- The only addition: the shell URL. The shell must not be decorated. -->
<mapping path="/adm/console/**" exclude="true"/>`;

const shellCode = `<%-- adminShell.jsp — the parent shell, loaded once per popup lifetime --%>
<div class="adc-shell">
    <header class="adc-topbar">…system name · user · logout · close window…</header>
    <div class="adc-layout">
        <nav class="adc-side">
            <%-- Every anchor needs target="adcFrame". Miss one and that link
                 navigates the whole popup, and the shell disappears. --%>
            <a class="adc-home" href="<c:url value='/adm/dashboard/view.do'/>" target="adcFrame">
                Admin dashboard
            </a>
            <c:forEach var="it" items="\${items}">
                <a href="\${itUrl}" target="adcFrame" data-mid="\${it.webMenuId}">\${it.webMenuNm}</a>
            </c:forEach>
        </nav>
        <iframe id="adcFrame" name="adcFrame" title="Admin content"></iframe>
    </div>
</div>

<style>
/* Guard against the iframe collapsing to its 150px default — break this
   chain anywhere and the content pane goes flat. */
.adc-shell  { height: 100vh; display: flex; flex-direction: column; }
.adc-layout { flex: 1 1 auto; min-height: 0; display: flex; }
#adcFrame   { flex: 1 1 auto; min-width: 0; width: 100%; height: 100%; border: 0; }
</style>`;

const navSyncCode = `// Active-menu highlight — on every iframe load, read the menu IDs the child already computed.
// Server-side EL cannot do this: the parent URL is pinned at /adm/console no matter what the
// child shows. Because load fires every time, navigation that bypasses the sidebar (module tabs,
// post-save redirects, browser back) re-syncs automatically.
var frame = document.getElementById('adcFrame');

frame.addEventListener('load', function () {
    var ids = null;
    try { ids = frame.contentWindow.adcMenuIds || null; }
    catch (e) { /* cross-origin — the frame navigated away to login */ }

    // Record the current path so F5 can restore it (same-origin only)
    try {
        var loc = frame.contentWindow.location;
        if (loc && /^\\/adm\\//.test(loc.pathname)) {
            sessionStorage.setItem('adcLastPath', loc.pathname + (loc.search || ''));
        }
        // Permission-denied fallback — when the interceptor bounces a request outside /adm,
        // the whole public site used to load inside the iframe. Return to the dashboard
        // instead, with a 30s loop guard so a denied account cannot bounce forever.
        if (loc && loc.pathname && !/^\\/adm\\//.test(loc.pathname)
                && loc.pathname.indexOf('/login') !== 0) {
            var last = parseInt(sessionStorage.getItem('adcDenyTs') || '0', 10);
            if (new Date().getTime() - last > 30000) {
                sessionStorage.setItem('adcDenyTs', String(new Date().getTime()));
                frame.src = contextPath + '/adm/dashboard/view.do';
                alert('You do not have access to that menu.\\nReturning to the admin dashboard.');
                return;
            }
        }
    } catch (e) {}

    highlightSidebar(ids && ids.lv2, ids && ids.lv3);
});`;

const bounceCode = `// Child decorator — the recovery path for when a console screen opens as the TOP window.
// After a session-expiry re-login, or from a bookmark or a pasted URL, the bare content
// renders full-browser with no shell. Do not steal that window into the console (the tab
// the user logged in from stays on the main site); send it to main with a restore hint.
if (window.self === window.top && location.pathname.indexOf('/adm/accessDenied') === -1) {
    fetch(contextPath + '/auth/check.do', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(function (r) { return r.text(); })
        .then(function (t) {
            // Not logged in? Do nothing. Bouncing *before* the interceptor's auto-submitting
            // login form fires would delete the login flow entirely (observed in testing).
            if (t.indexOf('true') === -1) return;
            var adcPath = location.pathname;
            if (contextPath && adcPath.indexOf(contextPath) === 0) {
                adcPath = adcPath.slice(contextPath.length);
            }
            location.replace(contextPath + '/main/view.do?adcReturn='
                + encodeURIComponent(adcPath + location.search));
        })
        .catch(function () {});
}
// Note: the access-denied screen renders in place even at top level — bouncing it to main
// made adcReturn restore a "re-enter console → denied again" loop (caught in a pre-deploy audit).`;

export default function AdminConsoleContentEn() {
  return (
    <main>
      <CaseHero
        organization={organizations['kimst-bdbis']}
        category="LEGACY UI / ARCHITECTURE"
        title="Wrapping 106 Admin Screens in a Console Shell Without Touching Them"
        subtitle="The admin menu had to become a separate-window console, but every sidebar click re-rendered the topbar and reloaded a pile of heavy assets. Rewriting ~100 /adm screens was not an option. So I converted the SiteMesh decorator in place into a child decorator — every existing mapping followed automatically — kept the shell resident in the parent, and swapped only the iframe body."
        meta={[
          { label: 'Reused', value: '106 mappings', hint: '0 remaps · in-place conversion' },
          { label: 'Screens rewritten', value: '0', hint: '/adm bodies untouched' },
          { label: 'Full sweep', value: '225 screens', hint: 'every /adm view.do, live' },
          { label: 'Menus migrated', value: '35 / 35', hint: 'entire admin menu tree' },
        ]}
        stack={[
          'SiteMesh 3',
          'JSP',
          'iframe',
          'Spring MVC',
          'AuthenticInterceptor',
          'SessionTimer',
          'eGovFrame',
        ]}
      />

      <CaseSection
        eyebrow="Problem"
        title="Every menu click re-rendered the topbar along with everything else"
        accent="problem"
      >
        <p>
          The request from the client contact was short: open the admin menu in a separate window,
          and handle session timeout and window closing while you are at it. So the first version put
          a console — sidebar plus topbar — inside that window, wrapping the existing{' '}
          <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
            /adm
          </code>{' '}
          pages in a single SiteMesh decorator. It got the console look with no screen rewrites.
        </p>
        <p>
          Using it exposed the flaw. Because the decorator wrapped <em>every page in full</em>, each
          sidebar click re-rendered the topbar and sidebar and reloaded the couple dozen head assets.
          Admin screens carry grids, charts, maps, and a large-file uploader, so navigation was
          noticeably heavy — and since the sidebar was rebuilt each time, its accordion state did not
          survive either.
        </p>
        <p>
          The fix was obvious: load the topbar and sidebar once, keep them resident, and swap only the
          body. The catch is that <strong>doing that normally means rewriting your screens</strong>.
          There were 183 content JSPs under{' '}
          <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
            /adm
          </code>
          , and 166 of them were full pages with their own{' '}
          <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
            &lt;html&gt;
          </code>
          . Rewriting was never on the table.
        </p>
        <InsightList
          items={[
            {
              title: 'A menu click meant a full page load',
              detail:
                'With the decorator wrapping every page, the topbar, sidebar, and 29 head assets reloaded on each navigation. On screens carrying grids, charts, and maps that lands as felt latency.',
            },
            {
              title: '183 JSPs would have needed rewriting',
              detail:
                'Of the 183 /adm content JSPs, 166 were structured as full pages. Reworking them to emit body-only content was a project in itself.',
            },
            {
              title: 'Remapping 106 entries makes one missed line an incident',
              detail:
                'Moving sitemesh mappings to a new decorator one by one means a single omission renders that page as a shell inside a shell — doubled topbar, two session timers, heavy JS loaded twice.',
            },
            {
              title: 'The risk sat at the boundaries, not in the screens',
              detail:
                'Adding another iframe layer endangered a handful of frame boundaries, not the 106 screens: the vendor uploader, login/permission bounces, authorization registration for the new URL, and re-entry from the main GNB.',
            },
          ]}
        />
      </CaseSection>

      <CaseSection
        eyebrow="Approach"
        title="Convert in place instead of remapping, so the mappings follow on their own"
        accent="approach"
      >
        <p>
          The pivotal decision was this: <strong>do not move</strong> the 106 mappings to a new child
          decorator — <strong>convert the existing decorator in place</strong>. Strip out the topbar,
          sidebar, and session scripts, leave body rendering, and all 106 mappings now point at the
          child by definition. The category of &quot;mapping we forgot&quot; stops existing. The only
          addition was one line for the shell URL.
        </p>
        <p>
          After that it became a question of <strong>what lives where</strong>. The parent shell owns
          the topbar, sidebar, and session watchdog; the child owns the head assets and the body. One
          pleasant surprise: session monitoring got <em>more</em> robust, because the parent never
          reloads on iframe navigation, so its timer is never interrupted. The flip side is that the
          child must <em>never</em> duplicate{' '}
          <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
            window.close()
          </code>{' '}
          or the timers — inside an iframe{' '}
          <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
            window.close()
          </code>{' '}
          is a no-op, so a copy there means logout silently fails to close the parent popup.
        </p>
        <p>
          Before starting I defined <strong>four blocking conditions</strong>: if any of them failed
          in a proof of concept, the work would not proceed. Does the vendor large-file uploader still
          work inside a frame? Do all three login/permission bounce paths escape the iframe to the
          top window? Does skipping authorization registration for the new shell URL leave it
          fail-open? Does clicking the admin menu in the main GNB replace the entire popup? A full
          sweep for frame-hostile code (
          <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
            top
          </code>
          /
          <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
            parent
          </code>
          /
          <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
            window.name
          </code>
          ) found zero hits inside the{' '}
          <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
            /adm
          </code>{' '}
          tree itself — all the risk really was at the edges.
        </p>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-[var(--color-border)] rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--color-border)]">
              <p className="font-mono text-[11px] font-semibold text-[var(--color-text-muted)] tracking-[0.2em]">
                BEFORE
              </p>
              <p className="font-mono text-[11px] text-[var(--color-text-muted)]">full reload per click</p>
            </div>
            <ArchStack
              boxes={[
                { title: 'Separate window (admWin)', subtitle: 'window.open' },
                {
                  title: 'adminConsole.jsp',
                  subtitle: 'one decorator',
                  bullets: ['topbar + sidebar', '29 head assets', 'session timer'],
                  tone: 'danger',
                },
                {
                  title: '/adm page body',
                  subtitle: '183 JSPs',
                  bullets: ['menu click = re-render everything'],
                },
              ]}
              edges={[{ label: 'full page navigation' }, { label: 'sitemesh:write body' }]}
            />
          </div>

          <div className="p-6 bg-white border border-[var(--color-accent)]/30 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--color-accent)]/20">
              <p className="font-mono text-[11px] font-semibold text-[var(--color-accent)] tracking-[0.2em]">
                AFTER
              </p>
              <p className="font-mono text-[11px] text-[var(--color-accent-dark)]">shell resident · body swaps</p>
            </div>
            <ArchStack
              boxes={[
                {
                  title: 'adminShell.jsp (parent)',
                  subtitle: 'once per popup lifetime',
                  bullets: ['topbar + sidebar', 'session watchdog (uninterrupted)', 'assets = jQuery only'],
                  tone: 'accent',
                },
                {
                  title: 'iframe#adcFrame',
                  subtitle: 'target="adcFrame"',
                  bullets: ['only the body changes'],
                },
                {
                  title: 'adminConsole.jsp (child)',
                  subtitle: 'existing 106 mappings point here',
                  bullets: ['head assets + body', 'topbar/sidebar removed', 'exposes adcMenuIds'],
                  tone: 'accent',
                },
              ]}
              edges={[{ label: 'sidebar click' }, { label: 'in-place conversion' }]}
            />
          </div>
        </div>
      </CaseSection>

      <CaseSection eyebrow="Process" title="How it was built" accent="process">
        <ProcessSteps
          steps={[
            {
              title: 'Convert the decorator rather than move the mappings',
              body: (
                <>
                  <p>
                    The most dangerous option was remapping 106 entries to a new decorator. Miss one
                    line and you get a shell inside a shell — and that page looks basically fine,
                    just with a doubled topbar, which is exactly the kind of thing review misses.
                    Converting the existing decorator instead meant not a single mapping changed; the
                    only addition was one exclude line for the shell URL.
                  </p>
                  <CodeBlock filename="sitemesh3.xml" language="xml" code={sitemeshCode} />
                </>
              ),
            },
            {
              title: 'The parent shell — anchor targets and the height chain',
              body: (
                <>
                  <p>
                    Two things in the shell are easy to get wrong. First, every sidebar anchor needs{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      target=&quot;adcFrame&quot;
                    </code>
                    ; miss one and that link navigates the whole popup, taking the shell with it.
                    Second, the iframe collapses to its 150px default unless the{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      100vh → flex:1 + min-height:0 → height:100%
                    </code>{' '}
                    chain holds end to end. Parent and child each keep exactly one scroller, which
                    also removed the old double scrollbar.
                  </p>
                  <CodeBlock filename="adminShell.jsp" language="html" code={shellCode} />
                </>
              ),
            },
            {
              title: 'Syncing the active menu — and why server-side EL cannot',
              body: (
                <>
                  <p>
                    Previously the server computed the active menu from the current URL. Under the
                    shell that breaks: the parent URL is pinned at{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      /adm/console
                    </code>
                    , so it cannot know what the child is showing. Instead the child decorator exposes
                    the menu IDs it already computed as{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      window.adcMenuIds
                    </code>
                    , and the parent reads them on every iframe{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      load
                    </code>
                    . Since load fires unconditionally, module tabs, post-save redirects, and browser
                    back all re-sync for free. The breadcrumb is assembled purely from DOM text nodes,
                    so there is no injection surface.
                  </p>
                  <CodeBlock filename="adminShell.jsp" language="javascript" code={navSyncCode} />
                </>
              ),
            },
            {
              title: 'Frame boundaries — three login and permission bounce paths',
              body: (
                <p>
                  This was the hardest part. Authentication failure takes three different code paths,
                  each navigating differently: unauthenticated submits a form, authenticated-but-
                  unauthorized uses{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                    location.href
                  </code>
                  , and concurrent-session eviction in production is a plain 302. Inside an iframe all
                  three wedge a login screen into the content pane. They were handled with{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                    target=&quot;_top&quot;
                  </code>{' '}
                  on the form,{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                    (window.top !== self ? window.top : window).location
                  </code>
                  , and an escalation branch respectively. What mattered most is that these files are
                  shared and load for <strong>every user, admin or not</strong>. So every change was
                  wrapped in a guard that is a no-op outside a frame, keeping non-framed behaviour
                  byte-for-byte identical.
                </p>
              ),
            },
            {
              title: 'The recovery path when a screen opens at top level',
              body: (
                <>
                  <p>
                    After a session expires and the user logs back in — or arrives via a bookmark or a
                    pasted URL — the console body renders full-browser with no shell. Rather than
                    stealing that window into the console, it goes to the main site carrying a restore
                    hint, and the main header revives the console popup.
                  </p>
                  <p>
                    Two incidents came out of this. The first version bounced without checking login
                    state, so it fired <em>before</em> the interceptor&apos;s auto-submitting login
                    form could run — deleting the login flow entirely. The second bounced the
                    access-denied screen too, producing a &quot;re-enter console → denied again →
                    bounce&quot; loop. Both are now explicit exceptions.
                  </p>
                  <CodeBlock filename="adminConsole.jsp" language="javascript" code={bounceCode} />
                </>
              ),
            },
            {
              title: 'Sweeping all 225 screens',
              body: (
                <p>
                  A structural change like this cannot end at &quot;seems to work.&quot; If one screen
                  escapes the console, the user just sees that one menu as broken. So I walked all 225{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                    view.do
                  </code>{' '}
                  screens under{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                    /adm
                  </code>{' '}
                  in a real browser and measured whether each stayed inside the console. That turned up
                  a missing sitemesh mapping line, a statistics screen whose scroll tracking never
                  fired, unstyled action buttons, and more — none of which review would have caught.
                  The sweep was split into ranges and run as parallel Claude Code agents.
                </p>
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
              title: 'The architecture changed with zero screens rewritten',
              detail:
                'Not one of the 183 JSP bodies was edited. Converting the decorator in place carried all 106 mappings along, and the genuinely new code was one shell plus one mapping line. On legacy systems, most of the design work turned out to be deciding what you can avoid touching, not what you get to build.',
            },
            {
              title: 'Session monitoring got more robust, not less',
              detail:
                'The parent shell never reloads on iframe navigation, so the inactivity timer runs uninterrupted — previously it restarted on every page change. The absolute condition was never duplicating window.close() or the timers into the child.',
            },
            {
              title: 'The risk lived at the boundaries, not in the screen count',
              detail:
                'The pre-work judgement was that the danger sat in four boundary seams rather than the 106 reused pages, and every incident did in fact happen there. Sweeping the codebase for frame-hostile code first, and confirming the /adm tree was clean, is what justified proceeding at all.',
            },
            {
              title: 'A full sweep caught defects review structurally cannot',
              detail:
                'Walking 225 screens in a real browser surfaced a single missing mapping line, scroll tracking that silently never fired on one screen, and lost button styling — none visible from reading code. For structural changes, automating the exhaustive walk was simply the cheapest option.',
            },
            {
              title: 'A separate window is not a security control — and I said so',
              detail:
                'The request specified a separate window, so that is what shipped. But research showed the government standard is an integrated left-LNB console, and a popup window buys exactly zero security. If security is the actual goal, host separation is the answer. I honoured the request and documented that fact alongside it.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="admin-console" all={cases} />
    </main>
  );
}

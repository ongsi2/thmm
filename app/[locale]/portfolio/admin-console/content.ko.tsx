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

const sitemeshCode = `<!-- sitemesh3.xml — 106개 /adm 매핑은 손대지 않는다 -->
<!-- adminConsole.jsp를 "그 자리에서" 자식 데코로 개조했으므로,
     기존 매핑이 자동으로 자식 데코를 가리킨다. 리맵 = 0줄. -->
<mapping path="/adm/techTrade/**"  decorator="/WEB-INF/jsp/decorators/adminConsole.jsp"/>
<mapping path="/adm/techCert/**"   decorator="/WEB-INF/jsp/decorators/adminConsole.jsp"/>
<mapping path="/adm/stupIvst/**"   decorator="/WEB-INF/jsp/decorators/adminConsole.jsp"/>
<!-- … 이하 100여 줄 그대로 … -->

<!-- 새로 추가한 것은 셸 URL 한 줄뿐. 셸은 데코를 타면 안 되므로 exclude. -->
<mapping path="/adm/console/**" exclude="true"/>`;

const shellCode = `<%-- adminShell.jsp — 팝업 생애 1회만 로드되는 부모 셸 --%>
<div class="adc-shell">
    <header class="adc-topbar">…시스템명 · 사용자 · 로그아웃 · 창닫기…</header>
    <div class="adc-layout">
        <nav class="adc-side">
            <%-- 모든 앵커 target="adcFrame" — 하나라도 누락되면
                 팝업 최상위가 통째로 이동해 셸이 사라지는 회귀 --%>
            <a class="adc-home" href="<c:url value='/adm/dashboard/view.do'/>" target="adcFrame">
                관리자 대시보드
            </a>
            <c:forEach var="it" items="\${items}">
                <a href="\${itUrl}" target="adcFrame" data-mid="\${it.webMenuId}">\${it.webMenuNm}</a>
            </c:forEach>
        </nav>
        <iframe id="adcFrame" name="adcFrame" title="관리자 본문"></iframe>
    </div>
</div>

<style>
/* iframe 기본 높이 150px 붕괴 방지 — 이 체인이 끊기면 본문이 납작해진다 */
.adc-shell  { height: 100vh; display: flex; flex-direction: column; }
.adc-layout { flex: 1 1 auto; min-height: 0; display: flex; }
#adcFrame   { flex: 1 1 auto; min-width: 0; width: 100%; height: 100%; border: 0; }
</style>`;

const navSyncCode = `// 활성 메뉴 하이라이트 — iframe load 마다 자식이 계산해 둔 메뉴 ID를 읽는다.
// 서버 EL로는 불가능: 부모 URL은 /adm/console 고정이라 자식이 뭘 보든 안 바뀐다.
// 사이드바 밖 내비(전용탭 · 저장 후 리다이렉트 · 뒤로가기)도 load가 매번 발화해 자동 재동기화.
var frame = document.getElementById('adcFrame');

frame.addEventListener('load', function () {
    var ids = null;
    try { ids = frame.contentWindow.adcMenuIds || null; }
    catch (e) { /* 크로스오리진 — 로그인 화면으로 이탈한 경우 */ }

    // F5 복원용 현재 경로 기록 (동일 오리진일 때만)
    try {
        var loc = frame.contentWindow.location;
        if (loc && /^\\/adm\\//.test(loc.pathname)) {
            sessionStorage.setItem('adcLastPath', loc.pathname + (loc.search || ''));
        }
        // 권한 거부 폴백 — 인터셉터가 /adm 밖으로 돌려보내면 iframe에 메인사이트가
        // 통째로 실리던 것을 대시보드 복귀로 교체. 30초 루프가드로 무한복귀 방지.
        if (loc && loc.pathname && !/^\\/adm\\//.test(loc.pathname)
                && loc.pathname.indexOf('/login') !== 0) {
            var last = parseInt(sessionStorage.getItem('adcDenyTs') || '0', 10);
            if (new Date().getTime() - last > 30000) {
                sessionStorage.setItem('adcDenyTs', String(new Date().getTime()));
                frame.src = contextPath + '/adm/dashboard/view.do';
                alert('접근 권한이 없는 메뉴입니다.\\n관리자 대시보드로 이동합니다.');
                return;
            }
        }
    } catch (e) {}

    highlightSidebar(ids && ids.lv2, ids && ids.lv3);
});`;

const bounceCode = `// 자식 데코 — 콘솔 화면이 "최상위 창"으로 열린 경우의 복구 경로.
// 세션 만료 후 재로그인, 북마크, URL 직접 입력이면 셸 없는 생 본문이 브라우저 전체에 뜬다.
// 이 창을 콘솔로 뺏지 않고(로그인한 창은 메인 유지) 메인으로 보내며 복원 힌트를 붙인다.
if (window.self === window.top && location.pathname.indexOf('/adm/accessDenied') === -1) {
    fetch(contextPath + '/auth/check.do', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(function (r) { return r.text(); })
        .then(function (t) {
            // 비로그인이면 아무것도 안 함 — 인터셉터의 로그인 유도 폼이 자동 제출되기 전에
            // 튀어버리면 로그인 동선 자체가 사라진다(실측으로 확인한 사고).
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
// ※ 권한거부 안내 화면은 최상위에서도 그 자리에 표시 — 메인으로 바운스하면
//   adcReturn 복원이 "콘솔 재진입 → 재거부" 순환을 만든다(배포 사전감사에서 발견).`;

export default function AdminConsoleContentKo() {
  return (
    <main>
      <CaseHero
        organization={organizations['kimst-bdbis']}
        category="LEGACY UI / ARCHITECTURE"
        title="관리자 화면 106개를 안 건드리고 콘솔 셸로 감싸기"
        subtitle="관리자 메뉴를 별도창 콘솔로 바꿔야 했는데, 사이드바 클릭마다 상단바와 무거운 리소스가 통째로 다시 그려졌다. 그렇다고 /adm 화면 100여 개를 재작성할 수는 없었고. SiteMesh 데코레이터를 그 자리에서 자식용으로 개조해 기존 매핑이 자동으로 따라오게 하고, 셸은 부모에 상주시켜 iframe 본문만 바꾸는 구조로 갔다."
        meta={[
          { label: '재사용', value: '106 매핑', hint: '리맵 0줄 · in-place 개조' },
          { label: '화면 재작성', value: '0건', hint: '/adm 본문 무수정' },
          { label: '전수 스윕', value: '225면', hint: '/adm view.do 실측 순회' },
          { label: '메뉴 편입', value: '35 / 35', hint: '관리자 메뉴 전량' },
        ]}
        stack={[
          'SiteMesh 3',
          'JSP',
          'iframe',
          'Spring MVC',
          'AuthenticInterceptor',
          'SessionTimer',
          '전자정부 프레임워크',
        ]}
      />

      <CaseSection
        eyebrow="Problem"
        title="메뉴 한 번 누를 때마다 상단바까지 통째로 다시 그려졌다"
        accent="problem"
      >
        <p>
          담당자 요구는 짧았다 — &ldquo;관리자 메뉴는 별도창으로 열리게, 세션 타임아웃이랑 창 닫기 처리도
          같이.&rdquo; 그래서 먼저 별도창 안에 사이드바 + 상단바를 가진 콘솔을 만들고, 기존 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">/adm</code>{' '}
          페이지를 SiteMesh 데코레이터 하나로 감싸는 방식으로 올렸다. 화면 재작성 없이 콘솔 모양을 얻는
          데는 성공했다.
        </p>
        <p>
          그런데 쓰다 보니 문제가 드러났다. 데코레이터가 <em>매 페이지를 통째로</em> 감싸는 구조라,
          사이드바에서 메뉴를 하나 누를 때마다 상단바·사이드바가 다시 그려지고 head에 걸린 리소스 수십 종이
          매번 재로드됐다. 관리자 화면은 그리드·차트·지도·대용량 업로더까지 얹혀 있어서, 화면 전환이
          체감될 만큼 무거웠다. 사이드바가 매번 새로 그려지니 아코디언 펼침 상태도 유지되지 않았고.
        </p>
        <p>
          답은 명확했다. 상단바와 사이드바는 한 번만 로드해서 상주시키고 본문만 바꾸면 된다. 문제는{' '}
          <strong>그걸 하려면 보통 화면을 다시 써야 한다</strong>는 것이었다. <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">/adm</code>{' '}
          아래에는 콘텐츠 JSP가 183개 있고 그중 166개가 자기 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">&lt;html&gt;</code>을
          가진 풀페이지였다. 재작성은 선택지가 아니었다.
        </p>
        <InsightList
          items={[
            {
              title: '메뉴 클릭 = 전체 페이지 로드',
              detail:
                '데코가 매 페이지를 감싸니 상단바·사이드바·head 리소스 29종이 전환마다 재로드됐다. 그리드·차트·지도가 얹힌 화면에서는 그대로 체감 지연이 된다.',
            },
            {
              title: '재작성 대상이 183개 JSP',
              detail:
                '/adm 콘텐츠 JSP 183개 중 166개가 풀페이지 구조. 본문만 떼어내도록 손보는 것 자체가 별도 프로젝트 규모였다.',
            },
            {
              title: '106개 매핑을 리맵하면 1줄 누락이 곧 사고',
              detail:
                'sitemesh 매핑을 새 데코로 하나씩 옮기는 방식은, 한 줄만 빠뜨려도 그 페이지가 셸 안에 셸로 뜬다 — 상단바 2겹, 세션 타이머 2중, 무거운 JS 2회 로드.',
            },
            {
              title: '경계 접합부에 리스크가 집중',
              detail:
                'iframe을 한 겹 더 넣으면 위험한 곳은 106개 화면이 아니라 프레임 경계 몇 곳이었다. 벤더 업로더, 로그인/권한 이탈, 신규 URL 인가 등록, 메인 GNB 재진입.',
            },
          ]}
        />
      </CaseSection>

      <CaseSection
        eyebrow="Approach"
        title="리맵 대신 in-place 개조 — 매핑이 알아서 따라오게"
        accent="approach"
      >
        <p>
          핵심 판단은 여기였다. 106개 매핑을 새 자식 데코로 <strong>옮기지 않고</strong>, 기존
          데코레이터를 <strong>그 자리에서 자식용으로 개조</strong>했다. 상단바·사이드바·세션
          스크립트를 떼어내고 본문 렌더링만 남기니, 기존 106개 매핑이 자동으로 자식 데코를 가리키게 된다.
          누락될 매핑이라는 개념 자체가 사라졌다. 새로 추가한 건 셸 URL 매핑 한 줄뿐이다.
        </p>
        <p>
          그다음은 <strong>어디에 무엇을 두느냐</strong>의 문제였다. 부모 셸에는 상단바·사이드바와
          세션 워치독을, 자식에는 head 리소스와 본문을 뒀다. 흥미로운 건 세션 감시가 오히려 튼튼해졌다는
          점이다 — 부모는 iframe 내비게이션에 재로드되지 않으니 타이머가 끊기지 않는다. 반대로 자식에는{' '}
          <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
            window.close()
          </code>
          나 타이머를 <em>절대 복제하지 않는 것</em>이 중요했다. iframe에서 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">window.close()</code>는
          no-op이라, 복제해 두면 로그아웃 시 부모 팝업이 안 닫히는 치명적 회귀가 난다.
        </p>
        <p>
          착수 전에 <strong>차단 조건 4건</strong>을 먼저 정의했다. 하나라도 PoC에서 실패하면 진행하지
          않는다는 기준이었다. 벤더 대용량 업로더가 프레임 안에서 동작하는지, 로그인·권한 이탈 3갈래가
          iframe을 탈출해 최상위로 올라가는지, 신규 셸 URL을 인가 테이블에 등록하지 않으면 fail-open이
          되는지, 메인 GNB에서 관리자 메뉴를 다시 눌렀을 때 팝업이 통째로 바뀌지 않는지. 실제로 코드에서
          프레임 적대 코드를 전수 조사(<code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">top</code>/<code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">parent</code>/<code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">window.name</code>)해
          보니 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">/adm</code> 트리
          자체는 0건이었고, 리스크는 전부 경계에 몰려 있었다.
        </p>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-[var(--color-border)] rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--color-border)]">
              <p className="font-mono text-[11px] font-semibold text-[var(--color-text-muted)] tracking-[0.2em]">
                BEFORE
              </p>
              <p className="font-mono text-[11px] text-[var(--color-text-muted)]">클릭마다 전체 재로드</p>
            </div>
            <ArchStack
              boxes={[
                { title: '별도창 (admWin)', subtitle: 'window.open' },
                {
                  title: 'adminConsole.jsp',
                  subtitle: '데코레이터 1개',
                  bullets: ['상단바 + 사이드바', 'head 리소스 29종', '세션 타이머'],
                  tone: 'danger',
                },
                {
                  title: '/adm 페이지 본문',
                  subtitle: '183 JSP',
                  bullets: ['메뉴 클릭 = 전부 재렌더'],
                },
              ]}
              edges={[{ label: '전체 페이지 이동' }, { label: 'sitemesh:write body' }]}
            />
          </div>

          <div className="p-6 bg-white border border-[var(--color-accent)]/30 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--color-accent)]/20">
              <p className="font-mono text-[11px] font-semibold text-[var(--color-accent)] tracking-[0.2em]">
                AFTER
              </p>
              <p className="font-mono text-[11px] text-[var(--color-accent-dark)]">셸 상주 · 본문만 교체</p>
            </div>
            <ArchStack
              boxes={[
                {
                  title: 'adminShell.jsp (부모)',
                  subtitle: '팝업 생애 1회',
                  bullets: ['상단바 + 사이드바', '세션 워치독 (안 끊김)', '리소스 = jQuery만'],
                  tone: 'accent',
                },
                {
                  title: 'iframe#adcFrame',
                  subtitle: 'target="adcFrame"',
                  bullets: ['본문만 교체'],
                },
                {
                  title: 'adminConsole.jsp (자식)',
                  subtitle: '기존 106 매핑이 그대로 가리킴',
                  bullets: ['head 리소스 + 본문', '상단바/사이드바 제거', 'adcMenuIds 노출'],
                  tone: 'accent',
                },
              ]}
              edges={[{ label: '사이드바 클릭' }, { label: 'in-place 개조' }]}
            />
          </div>
        </div>
      </CaseSection>

      <CaseSection eyebrow="Process" title="구현 단계" accent="process">
        <ProcessSteps
          steps={[
            {
              title: '매핑을 옮기지 않고 데코를 개조',
              body: (
                <>
                  <p>
                    가장 위험한 선택지가 &ldquo;106개 매핑을 새 데코로 리맵&rdquo;이었다. 한 줄만
                    빠뜨려도 셸-in-셸이 되는데, 그 페이지는 겉보기엔 멀쩡하고 상단바만 두 겹으로 보인다
                    — 리뷰에서 놓치기 딱 좋은 형태다. 대신 기존 데코를 자식용으로 개조하니 매핑은 한 줄도
                    건드리지 않았고, 추가한 건 셸 URL exclude 한 줄이 전부였다.
                  </p>
                  <CodeBlock filename="sitemesh3.xml" language="xml" code={sitemeshCode} />
                </>
              ),
            },
            {
              title: '부모 셸 — 앵커 target과 높이 체인',
              body: (
                <>
                  <p>
                    셸에서 실수하기 쉬운 게 두 가지였다. 하나는 사이드바 앵커의{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      target=&quot;adcFrame&quot;
                    </code>{' '}
                    — 하나라도 빠지면 그 링크가 팝업 최상위를 통째로 이동시켜 셸이 사라진다. 다른 하나는{' '}
                    iframe의 기본 높이 150px 붕괴다. <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      100vh → flex:1 + min-height:0 → height:100%
                    </code>{' '}
                    체인이 한 군데라도 끊기면 본문이 납작해진다. 스크롤러도 부모·자식 각각 하나씩만 두어
                    이중 스크롤바를 없앴다.
                  </p>
                  <CodeBlock filename="adminShell.jsp" language="html" code={shellCode} />
                </>
              ),
            },
            {
              title: '활성 메뉴 동기화 — 서버 EL이 안 되는 이유',
              body: (
                <>
                  <p>
                    기존에는 서버에서 현재 URL로 활성 메뉴를 계산해 표시했다. 그런데 셸 구조에서는 부모
                    URL이 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">/adm/console</code>에
                    고정되어 있어서, 자식이 무슨 화면을 보든 부모는 알 수가 없다. 그래서 자식 데코가 이미
                    계산해 둔 메뉴 ID를 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">window.adcMenuIds</code>로
                    노출하고, 부모가 iframe <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">load</code>{' '}
                    이벤트마다 읽어 사이드바를 갱신한다. load는 매번 발화하니까 전용탭 이동이나 저장 후
                    리다이렉트, 뒤로가기까지 자동으로 재동기화된다. 브레드크럼은 DOM 텍스트 노드로만
                    조립해 주입 여지를 없앴다.
                  </p>
                  <CodeBlock filename="adminShell.jsp" language="javascript" code={navSyncCode} />
                </>
              ),
            },
            {
              title: '프레임 경계 — 로그인·권한 이탈 3갈래',
              body: (
                <p>
                  제일 까다로운 부분이었다. 인증 실패는 코드 경로가 세 갈래인데 각각 다른 방식으로
                  이동한다. 미인증은 폼 제출, 인증-무권한은 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">location.href</code>,
                  운영 환경의 동시세션 축출은 순수 302. 이게 iframe 안에서 일어나면 로그인 화면이 본문
                  자리에 끼어 들어간다. 각각 폼{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                    target=&quot;_top&quot;
                  </code>
                  , <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                    (window.top !== self ? window.top : window).location
                  </code>
                  , 상승 분기로 처리했다. 중요한 건 이 파일들이 <strong>비관리자 포함 전 사용자</strong>가
                  로드하는 공유 파일이라는 점이었다. 그래서 모든 수정을 프레임이 아닐 때 no-op이 되는
                  가드로 감싸, 비프레임 동작이 바이트 단위로 그대로이도록 했다.
                </p>
              ),
            },
            {
              title: '최상위 창으로 열렸을 때의 복구 경로',
              body: (
                <>
                  <p>
                    세션이 만료돼 재로그인하거나, 북마크·URL 직접 입력으로 들어오면 콘솔 본문이 셸 없이
                    브라우저 전체에 뜬다. 이 창을 콘솔로 뺏지 않고(로그인한 창은 메인 유지) 메인으로
                    보내면서 복원 힌트를 붙여, 메인 헤더가 콘솔 팝업을 되살리도록 했다.
                  </p>
                  <p>
                    여기서 사고가 두 번 났다. 처음엔 로그인 여부를 안 보고 무조건 바운스했더니, 인터셉터가
                    내려주는 로그인 유도 폼이 자동 제출되기 <em>전에</em> 튀어버려 로그인 동선 자체가
                    사라졌다. 다음엔 권한 거부 안내 화면까지 바운스시켰다가 &ldquo;콘솔 재진입 → 재거부
                    → 다시 바운스&rdquo; 순환이 생겼고. 둘 다 예외 조건을 명시해 막았다.
                  </p>
                  <CodeBlock filename="adminConsole.jsp" language="javascript" code={bounceCode} />
                </>
              ),
            },
            {
              title: '225면 전수 스윕',
              body: (
                <p>
                  구조 전환은 &ldquo;대충 되는 것 같다&rdquo;로 끝낼 수 없었다. 화면 하나가 콘솔 밖으로
                  튀어도 사용자에겐 그 메뉴만 고장 난 것처럼 보이거든요. 그래서 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">/adm</code>{' '}
                  아래 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">view.do</code> 225면을
                  실브라우저로 전수 순회하며 콘솔 이탈 여부를 실측했다. 결과로 sitemesh 매핑 누락 한 줄,
                  통계 화면의 스크롤 추적 미발화, 액션 버튼 무스타일 등이 줄줄이 나왔다 — 리뷰만으로는
                  절대 안 나왔을 것들이다. 이 순회는 Claude Code 병렬 에이전트로 구간을 나눠 돌렸다.
                </p>
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
              title: '화면 재작성 0건으로 구조를 바꿈',
              detail:
                '183개 JSP 중 한 개도 본문을 고치지 않았다. 데코를 in-place로 개조한 덕분에 106개 매핑이 그대로 따라왔고, 새로 쓴 건 셸 하나와 매핑 한 줄이다. 레거시에서 구조를 바꿀 때는 "무엇을 새로 만드느냐"보다 "무엇을 안 건드리고 갈 수 있느냐"가 설계의 대부분이었다.',
            },
            {
              title: '세션 감시가 오히려 튼튼해짐',
              detail:
                '부모 셸은 iframe 내비게이션에 재로드되지 않으니 무활동 타이머가 중간에 끊기지 않는다. 전환 전에는 페이지를 옮길 때마다 타이머가 새로 시작됐는데, 그게 없어졌다. 대신 자식에 window.close()나 타이머를 복제하지 않는 게 절대 조건이었다.',
            },
            {
              title: '리스크는 화면 수가 아니라 경계에 있었다',
              detail:
                '착수 전 판단이 "재사용 106페이지가 아니라 경계 접합부 4곳이 위험하다"였고, 실제로 사고는 전부 거기서 났다. 프레임 적대 코드를 전수 조사해 /adm 트리가 깨끗하다는 걸 먼저 확인한 게 진행 여부를 가른 근거였다.',
            },
            {
              title: '전수 스윕이 리뷰를 대체할 수 없는 결함을 잡았다',
              detail:
                '225면 실브라우저 순회에서 나온 건 매핑 누락 한 줄, 특정 화면의 스크롤 추적 미발화, 버튼 스타일 유실처럼 코드만 봐서는 안 보이는 것들이었다. 구조를 바꿀 때는 전수 순회를 자동화해 두는 게 결국 제일 싸게 먹혔다.',
            },
            {
              title: '별도창은 보안 조치가 아니다 — 그건 명확히 했다',
              detail:
                '요구가 별도창이라 그렇게 갔지만, 리서치 결과 정부 표준은 좌측 LNB 통합 콘솔이었고 별도창 자체의 보안 이득은 0이다. 보안이 목적이면 호스트 분리가 맞다. 요구는 그대로 수용하되 그 사실은 문서로 남겨 두었다.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="admin-console" all={cases} />
    </main>
  );
}

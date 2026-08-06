import CodeBlock from '../_components/CodeBlock';
import { cases, organizations } from '../_components/cases';
import {
  CaseHero,
  CaseSection,
  InsightList,
  ProcessSteps,
  OtherCases,
} from '../_components/CaseShell';
import { MetricBar } from '../_components/diagrams/MetricBar';
import { Pipeline } from '../_components/diagrams/Pipeline';

const beforeCode = `// 전환 전 — 화면마다 반복되던 코드. 목록 하나에 이게 통째로 들어감
function drawList(list, totalCnt) {
    var html = '';
    for (var i = 0; i < list.length; i++) {
        var r = list[i];
        var no = totalCnt - ((pageNo - 1) * PER_PAGE) - i;   // 역순 번호 — 오프셋 실수 잦은 지점
        html += '<tr onclick="goDetail(\\'' + r.techSn + '\\')">'
             +  '<td>' + no + '</td>'
             +  '<td class="tit">' + esc(r.techNm) + '</td>'   // esc() 빼먹으면 그대로 XSS
             +  '<td>' + (r.regDt || '').substring(0, 10) + '</td>'
             +  '<td>' + badge(r.aprvYn) + '</td>'
             +  '</tr>';
    }
    $('#listBody').html(html || '<tr><td colspan="4">조회된 데이터가 없습니다.</td></tr>');
    drawPaging(totalCnt, pageNo);   // 페이지네비 마크업도 화면마다 사본
    $('#totCnt').text(totalCnt);
}

// + 엑셀 내보내기용 aoa 조립 (화면 라벨과 따로 관리 → 컬럼 추가하면 한쪽만 바뀜)
// + 정렬/필터는 대부분 미구현. 필요하면 그 화면에만 또 손으로.`;

const declCode = `// 전환 후 — 같은 화면. 선언 한 덩어리로 수렴하고, 서버 엔드포인트는 그대로
var grid = new BdbGrid('#techGrid', {
    url: '/adm/techTrade/techInfo/data.do',   // 기존 엔드포인트 그대로
    form: '#listForm',                        // 이 폼을 serialize해서 전송
    envelope: 'listTotal',                    // 응답 봉투 계열만 지정
    paging: 'server',
    perPage: 10,
    caption: '기술정보 목록',                  // 접근성 캡션(sr-only)
    rowKey: 'techSn',
    totalEl: '#totCnt',
    columns: [
        { title: '번호',   type: 'rownum', width: 64 },
        { title: '기술명', field: 'techNm', type: 'title', width: '32%', sortable: true,
          href: function (r) { return '/adm/techTrade/techInfo/edit/view.do?techSn=' + r.techSn; } },
        { title: '등록일', field: 'regDt', type: 'date', format: 'YYYY-MM-DD', width: 110 },
        { title: '승인',   field: 'aprvYn', type: 'badge', width: 96,
          badge: { 'Y': 'ok', 'N': 'no' } }
    ],
    excel: { fileName: '기술정보' }           // 화면 라벨 = 엑셀 라벨, 동기화 불필요
});

$('#searchBtn').on('click', function () { grid.reload(); });`;

const envelopeCode = `// 봉투(envelope) 프리셋 — 레거시 응답 형태를 서버 수정 없이 흡수하는 지점
var ENVELOPES = {
    // {response:{list, totalCnt}} — 서버 페이징 표준
    listTotal: function (res) {
        var r = (res && res.response) || {};
        var list = r.list || [];
        return {
            list: list,
            totalCnt: (r.totalCnt !== undefined && r.totalCnt !== null)
                ? Number(r.totalCnt) : list.length
        };
    },
    // {response:[...]} — response 자체가 배열인 계열(전체 로드 화면)
    array: function (res) {
        var arr = (res && res.response) || [];
        if (!isArray(arr)) arr = [];
        return { list: arr, totalCnt: arr.length };
    }
};

BdbGrid.prototype._parse = function (res) {
    var env = this.opts.envelope;
    var fn = (typeof env === 'function') ? env : ENVELOPES[env];  // 세 번째 계열은 함수로 직접
    if (!fn) fn = ENVELOPES.listTotal;
    var out = fn(res) || {};
    return {
        list: out.list || [],
        totalCnt: (out.totalCnt != null) ? Number(out.totalCnt)
                                         : (out.list ? out.list.length : 0)
    };
};`;

const staleCode = `// 스테일 응답 폐기 — 검색을 빠르게 여러 번 누를 때 역전 응답이 화면을 덮는 문제
var reqId = ++this._req;   // 이 요청이 최신인 동안만 렌더

$.ajax(ajax).done(function (res) {
    if (reqId !== self._req) return;        // 더 새 요청이 나갔다 → 이 응답은 버림
    var out = self._parse(res);
    if (o.transform) out.list = o.transform(out.list, self) || out.list;  // 파생필드 훅
    if (o.tree) out.list = self._treeFlatten(out.list);                   // 트리 DFS 평탄화
    self._resetEdit();                       // 새 데이터 = 편집 상태 초기화
    if (o.paging === 'client') {
        self._all = out.list;
        self._resetSort();                   // 새 데이터 = 새 원본 순서
        self.total = out.totalCnt;
        self._clientPage(page);
    } else {
        self.total = out.totalCnt;
        self._render(out.list);
    }
});`;

export default function BdbGridContentKo() {
  return (
    <main>
      <CaseHero
        organization={organizations['kimst-bdbis']}
        category="FRONTEND / COMPONENT"
        title="상용 그리드를 걷어내고 자체 그리드 컴포넌트로 대체"
        subtitle="관리자 목록 화면마다 렌더 루프와 페이징 계산을 손으로 쓰고 있었고, 나머지는 서버당 라이선스가 붙는 상용 그리드에 묶여 있었다. 기존 응답 계약을 그대로 흡수하는 자체 그리드를 만들어, 서버 코드를 한 줄도 안 고치고 80여 면을 옮겼다."
        meta={[
          { label: '전환 범위', value: '80+ 면', hint: '목록 · 편집 · 검색팝업' },
          { label: '서버 변경', value: '0건', hint: '컨트롤러 · 응답 JSON 불변' },
          { label: '코드 순감', value: '-733줄', hint: '초기 6면 실측' },
          { label: '회귀', value: '0건', hint: '스펙 127 · 배터리 39면' },
        ]}
        stack={[
          'Vanilla JS (ES5)',
          'jQuery 3',
          'SheetJS',
          'Web Worker',
          'SiteMesh 데코레이터',
          'KWCAG 2.2',
          '전자정부 프레임워크',
        ]}
      />

      <CaseSection
        eyebrow="Problem"
        title="같은 코드를 화면 수만큼 복사해 두고, 나머지는 라이선스에 묶여 있었다"
        accent="problem"
      >
        <p>
          바다봄 관리자에는 목록 화면이 수십 개 있다. 그런데 그리드가 하나로 통일돼 있지 않았다. 크게
          두 갈래였다. 하나는 <strong>손으로 쓴 테이블</strong> — 화면마다 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">for</code>{' '}
          루프로 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">&lt;tr&gt;</code> 문자열을
          이어 붙이고, 페이지네비 마크업을 복사하고, 역순 번호 오프셋을 직접 계산하고, 엑셀용 배열을 따로
          조립했다. 다른 하나는 <strong>상용 그리드</strong> — 기능은 되지만 서버(IP)당 라이선스에 도메인
          제한이 붙고, 미갱신 환경에서는 개발 화면에 트라이얼 워터마크가 떴다.
        </p>
        <p>
          문제는 라인 수가 아니라 <em>버그가 생길 수 있는 표면적</em>이었다. 페이징 오프셋, XSS
          이스케이프, 엑셀 라벨 동기화 — 실수하기 쉬운 코드가 화면 수만큼 사본으로 존재하니까, 한 곳에서
          발견한 버그를 나머지에서도 똑같이 찾아 고쳐야 했다. 컬럼을 하나 추가하면 화면 코드와 엑셀
          조립 코드를 양쪽 다 고쳐야 했고, 한쪽만 고치는 사고가 실제로 났다.
        </p>
        <CodeBlock filename="admTechInfoList.jsp — 전환 전" language="javascript" code={beforeCode} />
        <InsightList
          items={[
            {
              title: '렌더 로직이 화면 수만큼 복사돼 있음',
              detail:
                '목록 하나당 렌더 루프 + 페이지네비 마크업 + 총건수 갱신 + 엑셀 aoa 조립이 세트로 들어갔다. 같은 버그를 화면 수만큼 고쳐야 하는 구조.',
            },
            {
              title: 'XSS 이스케이프가 개발자 기억에 의존',
              detail:
                '문자열로 tr을 조립하니 esc() 호출을 빼먹으면 그대로 뚫린다. 리뷰로 잡아야 하는 항목이 화면마다 반복됐다.',
            },
            {
              title: '상용 그리드는 서버당 라이선스 + 도메인 제한',
              detail:
                '서버를 늘리거나 도메인을 추가할 때마다 라이선스를 다시 따져야 했고, 개발 환경에서는 트라이얼 워터마크가 화면에 노출됐다.',
            },
            {
              title: '정렬·필터·엑셀이 화면마다 제각각',
              detail:
                '어떤 화면은 정렬이 되고 어떤 화면은 안 됐다. 사용자 입장에서 "여긴 왜 안 되냐"는 문의가 반복됐지만, 손으로 붙이자니 또 사본이 늘어나는 딜레마.',
            },
          ]}
        />
      </CaseSection>

      <CaseSection
        eyebrow="Approach"
        title="서버를 안 고치는 걸 제1 제약으로 두고 설계"
        accent="approach"
      >
        <p>
          상용 그리드를 새로 사거나 오픈소스 그리드를 얹는 선택지도 있었다. 그런데 둘 다 대개{' '}
          <strong>응답 포맷을 그리드에 맞추라</strong>고 요구한다. iBATIS + JSP 레거시 위에서 컨트롤러
          수십 개의 응답 JSON을 손대는 건, 이 시스템에서 감당할 만한 리스크가 아니었다. 그래서 제1
          제약을 <strong>"서버 코드 0줄 수정"</strong>으로 박고 시작했다.
        </p>
        <p>
          먼저 관리자 목록 ajax 계약을 전수 조사해서 실제로 쓰이는 응답 형태가 몇 계열인지 셌다. 세
          계열이었다. 그래서 그리드에 <strong>봉투(envelope) 프리셋</strong>이라는 얇은 어댑터 층을 두고,
          화면에서는 계열 이름만 지정하게 했다. 벗어나는 화면은 함수를 직접 넘기면 되고. 이 층 하나
          덕분에 서버는 자기 응답을 그대로 내려주면 된다.
        </p>
        <p>
          도입에 앞서 상용·오픈소스 그리드 14종의 기능을 갭 분석해서, "우리가 실제로 쓰는 기능"과 "카탈로그에만
          있는 기능"을 갈랐다. 그 결과를 P0~P2 로드맵으로 만들어 정렬·페이징 같은 필수부터 채우고, 편집
          모드와 가상 스크롤은 뒤로 미뤘다. 처음부터 전부 만들려 했으면 못 끝냈을 것이다.
        </p>
        <p>
          배포 방식도 레거시에 맞췄다. 빌드 도구 없이 JS 한 개와 CSS 한 개로 끝내고, 관리자 콘솔
          데코레이터가 이 둘을 전 화면에 전역 로드하게 했다. 컴포넌트를 한 번 개선하면 WAR 재빌드 없이{' '}
          <strong>모든 그리드에 동시에 반영</strong>된다.
        </p>

        <div className="mt-8">
          <Pipeline
            groups={[
              {
                title: 'LOAD',
                steps: [
                  { label: 'ajax 응답', sub: '레거시 JSON 그대로', tone: 'muted' },
                  { label: '봉투 해석', sub: 'envelope', tone: 'accent', badge: '어댑터' },
                  { label: 'transform', sub: '파생 필드 훅' },
                ],
              },
              {
                title: 'DERIVE → RENDER',
                steps: [
                  { label: 'filter', sub: 'quickFilter · filterRow' },
                  { label: 'sort', sub: '클라 전체 / 서버 page' },
                  { label: 'window', sub: '가상 스크롤 구간' },
                  { label: 'render', sub: 'keyed 재조정', tone: 'accent' },
                ],
              },
            ]}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-8">
          {[
            { t: '봉투 어댑터', d: '응답 3계열을 그리드가 흡수 — 컨트롤러·SQL 무변경' },
            { t: '무빌드 배포', d: 'JS/CSS 복사만으로 반영, 데코가 전 화면 로드' },
            { t: '갭 분석 우선', d: '그리드 14종 조사 후 P0~P2로 우선순위 — 전부 만들지 않음' },
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
              title: '컬럼 선언으로 수렴시키기',
              body: (
                <>
                  <p>
                    화면이 하는 일은 결국 "이 URL을 이 폼으로 조회해서, 이 컬럼들을 이렇게 그린다" 하나다.
                    그래서 렌더 루프·페이지네비·빈/에러/로딩 상태·총건수 갱신·엑셀 조립을 전부 모듈이 만들고,
                    화면에는 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">columns</code>{' '}
                    선언만 남겼다. 기본 렌더러는 전부 이스케이프를 거치니까 XSS가 개발자 기억에서
                    컴포넌트 계약으로 옮겨갔다. 엑셀 라벨도 컬럼 제목을 그대로 쓰므로 따로 동기화할 게
                    없다.
                  </p>
                  <CodeBlock filename="admTechInfoList.jsp — 전환 후" language="javascript" code={declCode} />
                </>
              ),
            },
            {
              title: '봉투 어댑터 — 서버를 안 고치는 지점',
              body: (
                <>
                  <p>
                    관리자 목록의 ajax 응답을 전수 조사해 보니 실제로는 세 계열이었다.{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      {'{response:{list,totalCnt}}'}
                    </code>{' '}
                    표준형, <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      {'{response:[...]}'}
                    </code>{' '}
                    배열형, 그리고 나머지 소수. 앞의 둘은 프리셋으로 두고 나머지는 함수를 직접 넘기게 했다.
                    "봉투 해석"과 "데이터 전처리"는 일부러 다른 훅으로 갈랐다 — 섞어 두면 응답 형태가
                    바뀔 때 파생 필드 로직까지 같이 깨지니까요.
                  </p>
                  <CodeBlock filename="bdbGrid.js" language="javascript" code={envelopeCode} />
                </>
              ),
            },
            {
              title: '스테일 응답 폐기 · 편집/정렬 상태 리셋',
              body: (
                <>
                  <p>
                    실무에서 실제로 터지는 건 화려한 기능이 아니라 이런 것들이다. 검색 버튼을 빠르게 두 번
                    누르면 먼저 보낸 요청이 나중에 도착해 화면을 덮는다. 요청마다 시퀀스를 매겨서 최신이
                    아니면 응답을 버리도록 했다. 같은 맥락으로, 새 데이터가 들어오면 편집 상태와 정렬
                    기준을 초기화한다 — 클라이언트 페이징의 페이지 전환은 ajax를 타지 않으므로 그때는
                    편집 상태를 유지하고.
                  </p>
                  <CodeBlock filename="bdbGrid.js" language="javascript" code={staleCode} />
                </>
              ),
            },
            {
              title: '읽기에서 편집까지 — rMate 퇴역의 조건',
              body: (
                <p>
                  목록만 대체해서는 상용 그리드를 못 걷어낸다. 남는 건 항상 편집 화면이거든요. 그래서
                  인라인 에디터, C/U/D dirty 추적, 일괄 저장 payload 파생, Undo/Redo, 엑셀 붙여넣기, 틀고정,
                  컬럼 표시/숨김, 그룹핑·트리까지 컴포넌트 안으로 넣었다. 상용 제품에서는 대개 상위
                  라이선스 티어에 있는 기능들이다. 여기까지 오고 나서야 편집 화면들을 옮길 수 있었다.
                </p>
              ),
            },
            {
              title: '접근성 — 읽기는 표, 편집만 위젯',
              body: (
                <p>
                  공공 사이트라 웹 접근성이 통과 조건이다. 읽기 전용 목록은 굳이 위젯화하지 않고{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                    caption
                  </code>{' '}
                  +{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                    th scope
                  </code>{' '}
                  정적 표 시맨틱을 유지해 스크린리더의 네이티브 표 탐색을 그대로 쓰게 했고, 편집 화면만{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                    role=&quot;grid&quot;
                  </code>{' '}
                  + 로빙 tabindex로 갔다. 정렬 상태는 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">aria-sort</code>,
                  조회·검증 결과는 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">aria-live</code>로
                  안내한다. 전부 위젯으로 만드는 게 더 그럴싸해 보이지만, 읽기 목록에서는 오히려 손해였다.
                </p>
              ),
            },
            {
              title: '회귀 안전망 — 스펙 러너와 클릭 배터리',
              body: (
                <p>
                  이 컴포넌트는 데코레이터를 통해 전 관리자 화면에 로드된다. 즉 컴포넌트 버그 하나가 전
                  화면 장애다. 그래서 상설 스펙 러너를 붙여 어서션을 쌓고, 실브라우저로 화면을 순회하며
                  클릭하는 배터리를 따로 돌렸다. 버전을 크게 올린 뒤에도 배터리 회귀 0을 확인하고 나서
                  다음 전환 배치로 넘어가는 식으로 진행했다. 대량 전환은 Claude Code 병렬 에이전트로
                  배치를 나눠 돌리고, 적대적 코드리뷰를 별도 에이전트로 붙여 교차 검증했다.
                </p>
              ),
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Outcome" title="결과와 배운 것" accent="outcome">
        <div className="mb-8">
          <MetricBar
            caption="전환 묶음별 코드 순감 (초기 6면 실측)"
            unit="줄"
            rows={[
              { label: '기술정보 · 상담거래 · 홍보관', value: 408, display: '-408', tone: 'accent' },
              { label: '기술전시 3면 (video · event · cmrcl)', value: 325, display: '-325', tone: 'accent' },
              { label: '합계', value: 733, display: '-733 (995 삭제 / 262 추가)', tone: 'accent' },
            ]}
          />
        </div>
        <InsightList
          variant="outcome"
          items={[
            {
              title: '서버를 한 줄도 안 고치고 프론트만 교체',
              detail:
                '컨트롤러·엔드포인트·응답 JSON을 그대로 두고 화면만 옮겼다. 백엔드 리스크가 0이라 배치를 나눠 점진적으로 밀 수 있었고, 문제가 생기면 그 화면만 되돌리면 됐다. 이게 없었으면 이 규모를 운영 중인 시스템에서 시도하지 못했을 것이다.',
            },
            {
              title: '버그 표면적이 화면 수 × N에서 1로',
              detail:
                '페이징 오프셋, XSS 이스케이프, 엑셀 라벨 동기화처럼 실수 잦은 코드가 컴포넌트 한 곳으로 모였다. 라인 수 감소(-733줄)보다 이쪽이 실제 이득이었다 — 한 번 고치면 전 화면에 반영되니까요.',
            },
            {
              title: '라이선스·워터마크 의존 제거',
              detail:
                '서버 증설이나 도메인 추가 때 라이선스를 다시 따질 일이 없어졌고, 개발 환경 화면에서 트라이얼 워터마크가 사라졌다. 오픈소스 그리드의 방치나 상용 제품의 라이선스 정책 변경에 흔들리지 않는 통제권도 같이 얻었다.',
            },
            {
              title: '"전부 만들지 않기"가 핵심이었음',
              detail:
                '그리드 14종 갭 분석에서 얻은 건 기능 목록이 아니라 "우리가 안 쓰는 기능"의 목록이었다. 카탈로그를 다 따라갔으면 지금도 못 끝냈을 것이다. 실제로 쓰는 것부터 P0로 채우고 나머지는 필요할 때 붙였다.',
            },
            {
              title: '남은 것도 정직하게',
              detail:
                '아직 미전환인 수제 표가 남아 있고, 공용 검색팝업 등 일부는 상용 그리드를 그대로 쓴다. 동일 UX라 급하지 않아 신규·수정 시점에 점진 전환하는 쪽으로 뒀다. 인핸서(툴팁·컬럼 리사이즈)는 미전환 표에도 자동 적용되게 해서 그 사이 격차를 줄였다.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="bdb-grid" all={cases} />
    </main>
  );
}

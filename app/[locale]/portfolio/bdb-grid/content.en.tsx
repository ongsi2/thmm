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

const beforeCode = `// Before — repeated on every screen. Each list carried the whole block.
function drawList(list, totalCnt) {
    var html = '';
    for (var i = 0; i < list.length; i++) {
        var r = list[i];
        var no = totalCnt - ((pageNo - 1) * PER_PAGE) - i;   // descending row no — easy to get wrong
        html += '<tr onclick="goDetail(\\'' + r.techSn + '\\')">'
             +  '<td>' + no + '</td>'
             +  '<td class="tit">' + esc(r.techNm) + '</td>'   // forget esc() and it is an XSS hole
             +  '<td>' + (r.regDt || '').substring(0, 10) + '</td>'
             +  '<td>' + badge(r.aprvYn) + '</td>'
             +  '</tr>';
    }
    $('#listBody').html(html || '<tr><td colspan="4">No results.</td></tr>');
    drawPaging(totalCnt, pageNo);   // pagination markup copied per screen too
    $('#totCnt').text(totalCnt);
}

// + a separate array-of-arrays builder for Excel export (labels tracked apart from the
//   on-screen headers, so adding a column meant editing both — and people edited one)
// + sorting/filtering mostly unimplemented; adding it meant another hand-written copy`;

const declCode = `// After — same screen. It collapses into one declaration, and the endpoint is untouched.
var grid = new BdbGrid('#techGrid', {
    url: '/adm/techTrade/techInfo/data.do',   // existing endpoint, unchanged
    form: '#listForm',                        // serialize this form as the request
    envelope: 'listTotal',                    // just name the response shape
    paging: 'server',
    perPage: 10,
    caption: 'Technology listings',           // accessibility caption (sr-only)
    rowKey: 'techSn',
    totalEl: '#totCnt',
    columns: [
        { title: 'No.',      type: 'rownum', width: 64 },
        { title: 'Title',    field: 'techNm', type: 'title', width: '32%', sortable: true,
          href: function (r) { return '/adm/techTrade/techInfo/edit/view.do?techSn=' + r.techSn; } },
        { title: 'Created',  field: 'regDt', type: 'date', format: 'YYYY-MM-DD', width: 110 },
        { title: 'Approved', field: 'aprvYn', type: 'badge', width: 96,
          badge: { 'Y': 'ok', 'N': 'no' } }
    ],
    excel: { fileName: 'tech-info' }          // Excel labels = column titles, nothing to sync
});

$('#searchBtn').on('click', function () { grid.reload(); });`;

const envelopeCode = `// Envelope presets — the one place that absorbs legacy response shapes, so the server never moves
var ENVELOPES = {
    // {response:{list, totalCnt}} — the server-paging standard
    listTotal: function (res) {
        var r = (res && res.response) || {};
        var list = r.list || [];
        return {
            list: list,
            totalCnt: (r.totalCnt !== undefined && r.totalCnt !== null)
                ? Number(r.totalCnt) : list.length
        };
    },
    // {response:[...]} — response is the array itself (full-load screens)
    array: function (res) {
        var arr = (res && res.response) || [];
        if (!isArray(arr)) arr = [];
        return { list: arr, totalCnt: arr.length };
    }
};

BdbGrid.prototype._parse = function (res) {
    var env = this.opts.envelope;
    var fn = (typeof env === 'function') ? env : ENVELOPES[env];  // third shape: pass a function
    if (!fn) fn = ENVELOPES.listTotal;
    var out = fn(res) || {};
    return {
        list: out.list || [],
        totalCnt: (out.totalCnt != null) ? Number(out.totalCnt)
                                         : (out.list ? out.list.length : 0)
    };
};`;

const staleCode = `// Discarding stale responses — hit search twice quickly and the older reply can land last
var reqId = ++this._req;   // render only while this request is still the newest

$.ajax(ajax).done(function (res) {
    if (reqId !== self._req) return;        // a newer request went out — drop this reply
    var out = self._parse(res);
    if (o.transform) out.list = o.transform(out.list, self) || out.list;  // derived-field hook
    if (o.tree) out.list = self._treeFlatten(out.list);                   // tree: DFS flatten
    self._resetEdit();                       // new data means edit state resets
    if (o.paging === 'client') {
        self._all = out.list;
        self._resetSort();                   // new data means a new original order
        self.total = out.totalCnt;
        self._clientPage(page);
    } else {
        self.total = out.totalCnt;
        self._render(out.list);
    }
});`;

export default function BdbGridContentEn() {
  return (
    <main>
      <CaseHero
        organization={organizations['kimst-bdbis']}
        category="FRONTEND / COMPONENT"
        title="Replacing a Commercial Data Grid With an In-House Component"
        subtitle="Every admin list screen hand-rolled its own render loop and paging math, and the rest were locked to a commercial grid licensed per server. I built an in-house grid that absorbs the existing response contracts as-is, then moved roughly 80 screens onto it without changing a single line of server code."
        meta={[
          { label: 'Scope', value: '80+ screens', hint: 'lists · editors · picker modals' },
          { label: 'Server changes', value: '0', hint: 'controllers · JSON untouched' },
          { label: 'Net code', value: '-733 lines', hint: 'measured on first 6 screens' },
          { label: 'Regressions', value: '0', hint: '127 specs · 39-screen battery' },
        ]}
        stack={[
          'Vanilla JS (ES5)',
          'jQuery 3',
          'SheetJS',
          'Web Worker',
          'SiteMesh decorator',
          'KWCAG 2.2',
          'eGovFrame',
        ]}
      />

      <CaseSection
        eyebrow="Problem"
        title="The same code copied once per screen — and the rest tied to a license"
        accent="problem"
      >
        <p>
          Badabom&apos;s admin has dozens of list screens, and no single grid behind them. There were
          essentially two camps. One was <strong>hand-written tables</strong>: each screen built{' '}
          <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
            &lt;tr&gt;
          </code>{' '}
          strings in a{' '}
          <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
            for
          </code>{' '}
          loop, copied the pagination markup, computed the descending row-number offset by hand, and
          assembled a separate array for Excel export. The other was a{' '}
          <strong>commercial grid</strong> — functional, but licensed per server (IP) with a domain
          cap, and any environment on a lapsed license showed a trial watermark on screen.
        </p>
        <p>
          The real cost was not line count but <em>bug surface area</em>. Paging offsets, XSS
          escaping, Excel-label drift — the exact code people get wrong existed as one copy per
          screen. A bug found in one place had to be hunted down in all the others. Add a column and
          you had to edit both the screen code and the Excel builder; someone editing only one of
          them did actually happen.
        </p>
        <CodeBlock filename="admTechInfoList.jsp — before" language="javascript" code={beforeCode} />
        <InsightList
          items={[
            {
              title: 'Render logic duplicated once per screen',
              detail:
                'Each list shipped a render loop, pagination markup, total-count update, and Excel assembly as a set. Fixing one bug meant fixing it as many times as there were screens.',
            },
            {
              title: 'XSS escaping depended on the developer remembering',
              detail:
                'Building rows as strings means a missing esc() call is a live hole. That review item repeated on every screen.',
            },
            {
              title: 'Commercial grid: per-server license plus a domain cap',
              detail:
                'Adding a server or a domain meant re-running the license math, and dev environments showed the trial watermark right in the UI.',
            },
            {
              title: 'Sorting, filtering, and export were inconsistent',
              detail:
                'Some screens sorted, some did not, and users kept asking why. Adding it by hand only produced more copies — a dilemma the component was meant to end.',
            },
          ]}
        />
      </CaseSection>

      <CaseSection
        eyebrow="Approach"
        title="Designing around one hard constraint: do not touch the server"
        accent="approach"
      >
        <p>
          Buying another commercial grid or adopting an open-source one were both on the table. But
          both typically ask you to <strong>reshape your responses to fit the grid</strong>. On an
          iBATIS + JSP legacy stack, rewriting the response JSON of dozens of controllers is not a
          risk this system could absorb. So I fixed the first constraint up front:{' '}
          <strong>zero lines of server code changed</strong>.
        </p>
        <p>
          I started by cataloguing the admin list ajax contracts to count how many response shapes
          were actually in use. Three. So the grid got a thin adapter layer —{' '}
          <strong>envelope presets</strong> — and screens just name their shape; anything unusual
          passes a function instead. That one layer means the server keeps returning exactly what it
          already returns.
        </p>
        <p>
          Before building, I ran a gap analysis across 14 commercial and open-source grids to
          separate &quot;features we actually use&quot; from &quot;features that only exist in the
          brochure.&quot; That became a P0–P2 roadmap: sorting and paging first, edit mode and
          virtual scrolling deferred. Trying to build everything up front would never have shipped.
        </p>
        <p>
          Delivery matched the legacy stack too: no build tooling, one JS file and one CSS file, with
          the admin console decorator loading both globally. Improve the component once and it lands{' '}
          <strong>on every grid at the same time</strong>, with no WAR rebuild.
        </p>

        <div className="mt-8">
          <Pipeline
            groups={[
              {
                title: 'LOAD',
                steps: [
                  { label: 'ajax response', sub: 'legacy JSON as-is', tone: 'muted' },
                  { label: 'envelope', sub: 'shape adapter', tone: 'accent', badge: 'adapter' },
                  { label: 'transform', sub: 'derived-field hook' },
                ],
              },
              {
                title: 'DERIVE → RENDER',
                steps: [
                  { label: 'filter', sub: 'quickFilter · filterRow' },
                  { label: 'sort', sub: 'client all / server page' },
                  { label: 'window', sub: 'virtual scroll slice' },
                  { label: 'render', sub: 'keyed reconciliation', tone: 'accent' },
                ],
              },
            ]}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-8">
          {[
            { t: 'Envelope adapter', d: 'Grid absorbs 3 response shapes — controllers and SQL untouched' },
            { t: 'No-build deploy', d: 'Copy JS/CSS; the decorator loads it on every screen' },
            { t: 'Gap analysis first', d: '14 grids surveyed, then P0–P2 priorities — not everything got built' },
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

      <CaseSection eyebrow="Process" title="How it was built" accent="process">
        <ProcessSteps
          steps={[
            {
              title: 'Collapsing screens into a column declaration',
              body: (
                <>
                  <p>
                    What a screen actually does is one sentence: query this URL with this form, and
                    draw these columns. So the module took over the render loop, pagination,
                    empty/error/loading states, total-count updates, and Excel assembly — leaving
                    only a{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      columns
                    </code>{' '}
                    declaration on the page. Every default renderer escapes, which moved XSS from
                    &quot;the developer remembered&quot; to a component contract. Excel labels reuse
                    the column titles, so there is nothing left to keep in sync.
                  </p>
                  <CodeBlock filename="admTechInfoList.jsp — after" language="javascript" code={declCode} />
                </>
              ),
            },
            {
              title: 'The envelope adapter — where the server stays untouched',
              body: (
                <>
                  <p>
                    Surveying the admin list responses turned up three families: the standard{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      {'{response:{list,totalCnt}}'}
                    </code>
                    , the array form{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      {'{response:[...]}'}
                    </code>
                    , and a small tail. The first two became presets; the tail passes a function. I
                    deliberately kept &quot;interpreting the envelope&quot; and &quot;preprocessing
                    the data&quot; as separate hooks — merge them and a change in response shape
                    breaks your derived-field logic along with it.
                  </p>
                  <CodeBlock filename="bdbGrid.js" language="javascript" code={envelopeCode} />
                </>
              ),
            },
            {
              title: 'Discarding stale responses, resetting edit and sort state',
              body: (
                <>
                  <p>
                    What actually breaks in production is never the flashy feature. Click search
                    twice quickly and the earlier request can arrive last, overwriting the screen
                    with older data. Each request carries a sequence number, and anything that is no
                    longer the newest gets dropped. In the same spirit, new data resets edit state
                    and sort order — while client-side page switches, which never hit ajax, keep the
                    edit state intact.
                  </p>
                  <CodeBlock filename="bdbGrid.js" language="javascript" code={staleCode} />
                </>
              ),
            },
            {
              title: 'From read-only to editing — the condition for retiring the commercial grid',
              body: (
                <p>
                  Replacing only the lists never retires a commercial grid; what is left is always the
                  editors. So inline editors, C/U/D dirty tracking, derived bulk-save payloads,
                  undo/redo, Excel paste, frozen columns, column show/hide, grouping and tree views
                  all moved into the component — features that usually sit in a higher license tier
                  on commercial products. Only after that could the editing screens migrate.
                </p>
              ),
            },
            {
              title: 'Accessibility — tables for reading, widgets only for editing',
              body: (
                <p>
                  This is a public-sector site, so web accessibility is a gate, not a nice-to-have.
                  Read-only lists deliberately stay static-table semantics —{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                    caption
                  </code>{' '}
                  plus{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                    th scope
                  </code>{' '}
                  — so screen readers keep their native table navigation, and only editing screens
                  become{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                    role=&quot;grid&quot;
                  </code>{' '}
                  with roving tabindex. Sort state is announced via{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                    aria-sort
                  </code>
                  , query and validation results via{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                    aria-live
                  </code>
                  . Widgetizing everything looks more impressive, but for read-only lists it is a net
                  loss.
                </p>
              ),
            },
            {
              title: 'A regression net: spec runner plus click battery',
              body: (
                <p>
                  The decorator loads this component on every admin screen, which means one component
                  bug is a site-wide outage. So I kept a standing spec runner accumulating assertions
                  and ran a separate battery that walks real screens in a real browser and clicks
                  through them. Each migration batch only proceeded after confirming zero battery
                  regressions following a major version bump. Bulk migrations ran as parallel Claude
                  Code agent batches, with adversarial code review assigned to separate agents as a
                  cross-check.
                </p>
              ),
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Outcome" title="Results and takeaways" accent="outcome">
        <div className="mb-8">
          <MetricBar
            caption="Net code reduction per migration batch (first 6 screens, measured)"
            unit="lines"
            rows={[
              { label: 'tech info · deals · showcase', value: 408, display: '-408', tone: 'accent' },
              { label: 'exhibition ×3 (video · event · cmrcl)', value: 325, display: '-325', tone: 'accent' },
              { label: 'total', value: 733, display: '-733 (995 removed / 262 added)', tone: 'accent' },
            ]}
          />
        </div>
        <InsightList
          variant="outcome"
          items={[
            {
              title: 'Front end swapped with zero server changes',
              detail:
                'Controllers, endpoints, and response JSON stayed exactly as they were. With backend risk at zero I could push the migration in batches and roll back a single screen if something went wrong. Without that property, this scale of change on a live system would not have been attempted.',
            },
            {
              title: 'Bug surface went from screens × N down to one',
              detail:
                'Paging offsets, XSS escaping, Excel-label sync — the error-prone code now lives in one component. That mattered more than the -733 lines: fix it once and every screen gets the fix.',
            },
            {
              title: 'License and watermark dependency removed',
              detail:
                'Adding a server or a domain no longer triggers a license recalculation, and the trial watermark is gone from dev environments. It also bought control: neither an abandoned open-source grid nor a vendor license policy change can move this stack now.',
            },
            {
              title: 'The key was deciding what not to build',
              detail:
                'What the 14-grid gap analysis produced was not a feature list but a list of features we do not use. Chasing the full brochure would still be unfinished today. P0 covered what was genuinely in use; the rest got added when something actually needed it.',
            },
            {
              title: 'What is still outstanding, honestly',
              detail:
                'Hand-written tables remain on some screens, and a few shared picker modals still run the commercial grid. The UX is identical, so those are being converted opportunistically when the screen is next touched. Meanwhile the enhancers (tooltips, column resize) apply to unconverted tables too, which narrows the gap in the interim.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="bdb-grid" all={cases} />
    </main>
  );
}

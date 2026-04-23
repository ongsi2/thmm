import CodeBlock from '../_components/CodeBlock';
import { cases, organizations } from '../_components/cases';
import {
  CaseHero,
  CaseSection,
  InsightList,
  ProcessSteps,
  OtherCases,
} from '../_components/CaseShell';
import { Pipeline } from '../_components/diagrams/Pipeline';

const oracleDockerSetup = `# 1) Spin up a local Oracle XE container — used to restore the original OTT dmp
docker run -d --name ott-ora \\
    -p 1521:1521 \\
    -e ORACLE_PASSWORD=*** \\
    -v ./dump:/opt/oracle/dump \\
    gvenzl/oracle-xe:21-slim

# 2) Copy the dump received from OTT into the container, then import with impdp
docker cp OTT_TECH_INFO_20260201.dmp ott-ora:/opt/oracle/dump/
docker exec -it ott-ora bash -c '\\
    sqlplus / as sysdba <<SQL
      CREATE DIRECTORY dump_dir AS \\'/opt/oracle/dump\\';
      GRANT READ, WRITE ON DIRECTORY dump_dir TO system;
SQL
    impdp system/*** directory=dump_dir \\
        dumpfile=OTT_TECH_INFO_20260201.dmp \\
        schemas=TT \\
        remap_tablespace=USERS:TT'

# 3) Local PostgreSQL — used to replicate the Badabom schema
docker run -d --name bdb-pg -p 5432:5432 \\
    -e POSTGRES_DB=bdb -e POSTGRES_USER=badabom -e POSTGRES_PASSWORD=*** \\
    postgres:15-alpine

# 4) Apply the prepared schema DDL
docker exec -i bdb-pg psql -U badabom -d bdb < docs/sql/00_DEPLOY_ALL_TECHTRADE.sql`;

const migrateScript = `#!/usr/bin/env python3
"""OTT Oracle -> Badabom PostgreSQL data migration (migrate_tech_info.py)

The tricky spots:
  - The body summary is stored in Oracle as three split columns (tech_summary_1/2/3)
    -> merged into a single tt_tech_info.tech_summary, with NULL propagation handled
  - Oracle CLOB: the cursor returns a LOB locator -> use .read() to get a string
  - Leftover KSC5601 Korean text -> re-encode to UTF-8
  - For 1:N tables, migrate parent -> child in FK order
  - ON CONFLICT DO UPDATE keeps it rerun-safe (restart from the failure point and integrity holds)
"""
import cx_Oracle, psycopg2
from psycopg2.extras import execute_values

ora = cx_Oracle.connect('tt/***@localhost:1521/XEPDB1', encoding='UTF-8')
pg  = psycopg2.connect(host='localhost', dbname='bdb',
                       user='badabom', password='***')

SELECT_TECH_INFO = """
    SELECT tech_sn, tech_nm, org_nm,
           /* Combine the three split columns on the Oracle side before fetching */
           CASE
               WHEN tech_summary_3 IS NOT NULL
                   THEN tech_summary_1 || tech_summary_2 || tech_summary_3
               WHEN tech_summary_2 IS NOT NULL
                   THEN tech_summary_1 || tech_summary_2
               ELSE tech_summary_1
           END                                                AS tech_summary,
           NVL(view_cnt, 0)                                   AS view_cnt,
           TO_CHAR(rgst_dt, 'YYYY-MM-DD HH24:MI:SS')          AS rgst_dt,
           rgsr_id
      FROM tech_info
     WHERE NVL(del_yn, 'N') = 'N'
"""

UPSERT = """
    INSERT INTO bdb.tt_tech_info
        (tech_sn, tech_nm, org_nm, tech_summary, view_cnt, rgst_dt, rgsr_id)
    VALUES %s
    ON CONFLICT (tech_sn) DO UPDATE
        SET tech_nm      = EXCLUDED.tech_nm,
            org_nm       = EXCLUDED.org_nm,
            tech_summary = EXCLUDED.tech_summary,
            view_cnt     = EXCLUDED.view_cnt
"""

def clob_to_str(v):
    return v.read() if hasattr(v, 'read') else v

with ora.cursor() as ocur, pg.cursor() as pcur:
    ocur.execute(SELECT_TECH_INFO)
    batch, inserted = [], 0
    for row in ocur:
        batch.append(tuple(clob_to_str(c) for c in row))
        if len(batch) >= 500:
            execute_values(pcur, UPSERT, batch); inserted += len(batch); batch.clear()
    if batch:
        execute_values(pcur, UPSERT, batch); inserted += len(batch)
    pg.commit()
    print(f"tt_tech_info: {inserted} rows UPSERTed")`;

const approvalWorkflow = `// Approve / reject service: state check -> main table UPDATE -> history INSERT -> notification
// Wrap the whole thing in a single transaction so any mid-flight exception rolls back cleanly

@Service("admTechInfoMngService")
public class AdmTechInfoMngServiceImpl extends EgovAbstractServiceImpl
        implements AdmTechInfoMngService {

    @Resource private AdmTechInfoMngDAO    dao;
    @Resource private TtTechInfoHistoryDAO historyDAO;
    @Resource private NotificationService  notificationService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void approveTechInfo(TtTechInfoVO vo, String operatorId) throws Exception {

        // 1) Load current state + validate the state transition (state machine)
        TtTechInfoVO current = dao.selectTechInfoBySn(vo.getTechSn());
        if (current == null) {
            throw new EgovBizException("Technology does not exist, techSn=" + vo.getTechSn());
        }
        validateStateTransition(current.getApproveYn(), vo.getApproveYn());

        // 2) Update the main table (updt_dt / uptr_id set automatically)
        vo.setUptrId(operatorId);
        vo.setUpdtDt(new Timestamp(System.currentTimeMillis()));
        dao.updateTechInfoApproveState(vo);

        // 3) Record the change in the history table (for audit tracing)
        TtTechInfoHistoryVO history = new TtTechInfoHistoryVO();
        history.setTechSn(vo.getTechSn());
        history.setPrevApproveYn(current.getApproveYn());
        history.setNextApproveYn(vo.getApproveYn());
        history.setRejectReason(vo.getRejectReason());
        history.setOperatorId(operatorId);
        historyDAO.insertApprovalHistory(history);

        // 4) On approval, notify the submitter — the approval itself stays even if the notification fails
        //    (rolling back on a notification failure would revert the approval state and create operational confusion)
        if ("Y".equals(vo.getApproveYn())) {
            try {
                notificationService.notifyTechApproved(
                        current.getRgsrId(), current.getTechNm());
            } catch (Exception e) {
                log.warn("Notification send failed techSn=" + vo.getTechSn(), e);
            }
        }
    }

    /**
     * State transition rules
     *   N (new)        -> Y (approved) | E (rejected)
     *   Y (approved)   -> A (retired)          * cannot revert to rejected
     *   E (rejected)   -> Y (approved) | N (re-review)
     *   A (retired)    -> Y (approved)
     */
    private static final Map<String, Set<String>> TRANSITIONS = Map.of(
            "N", Set.of("Y", "E"),
            "Y", Set.of("A"),
            "E", Set.of("Y", "N"),
            "A", Set.of("Y")
    );

    private void validateStateTransition(String from, String to) {
        Set<String> allowed = TRANSITIONS.getOrDefault(from, Collections.emptySet());
        if (!allowed.contains(to)) {
            throw new IllegalStateException(
                    String.format("Transition not allowed: %s -> %s", from, to));
        }
    }
}`;

const agentBrief = `# Claude Code parallel agents brief (5 running concurrently)
# -> Each verifies the migration result independently from a different angle, then I cross-check the outputs

Agent 1 — SCOPE
  Inputs: TECHTRADE_MIGRATION_SCOPE.md + current source
  Task: Are all 8 in-scope tables / 87 URLs implemented?
        Did any out-of-scope items (external APIs, CONNECT BY statistics, etc.) slip in by accident?

Agent 2 — DB
  Inputs: DDL scripts + the actual PostgreSQL schema + real row counts
  Task: Do the 14 tables match on columns, types, and constraints? Cross-check against real data (14,695 rows)

Agent 3 — SQL mappers
  Inputs: Badabom_*.xml 80+ statements
  Task: Parameter/result classes, bindings, IN clauses, date formats, CDATA usage
        — are there any iBATIS 2.0 syntax violations? Any Oracle-syntax leftovers?

Agent 4 — Controller / JSP
  Inputs: 7 Controllers + 34 JSPs
  Task: URL mappings and missing screen flows, approval-workflow state transitions, file-upload paths

Agent 5 — Common codes
  Inputs: st_com_cd real registered-row count + SQL reference locations
  Task: Do all 100+ rows across 7 groups exist in the DB? Do the codes referenced by SQL exist in the DB?

# After execution the main session cross-checks each agent's report
#   -> Look for the "Agent N claims X, Agent M says something different" pattern
#   -> Separated 3 false positives; fixed 3 real bugs (missing tt_tech_video column, etc.)`;

export default function TechtradeMigrationContentEn() {
  return (
    <main>
      <CaseHero
        organization={organizations['kimst-bdbis']}
        category="LEGACY MIGRATION"
        title="Migrating the OTT technology-transfer system into Badabom"
        subtitle="I moved the external technology-transfer platform OTT (Online Technology Transfer), built on Oracle + MyBatis, into Badabom, which runs on PostgreSQL + iBATIS. The migration rewrote 87 URLs, 34 JSPs, 80+ SQL statements, and 14 tables."
        meta={[
          { label: 'URLs migrated', value: '87', hint: '50 user / 37 admin' },
          { label: 'DB', value: '14 tables', hint: 'Oracle -> PostgreSQL' },
          { label: 'SQL rewrites', value: '80+ statements', hint: 'iBATIS 2.0' },
          { label: 'JSP', value: '34 pages', hint: 'rMateGridH5 pattern' },
        ]}
        stack={[
          'Spring MVC 4.3',
          'eGovFrame 3.9',
          'iBATIS 2.0',
          'PostgreSQL',
          'Oracle',
          'JSP',
          'rMateGridH5',
          'Sitemesh 3',
        ]}
      />

      <CaseSection
        eyebrow="Problem"
        title="Move an Oracle + MyBatis external system into a PostgreSQL + iBATIS environment"
        accent="problem"
      >
        <p>
          The technology-trade platform OTT ran on Oracle + MyBatis 3.x, while the destination — Badabom, operated by
          the Korea Institute of Marine Science &amp; Technology Promotion (KIMST) — is the e-government standard
          PostgreSQL + iBATIS 2.0 stack. On paper they look like adjacent families, but in practice the differences
          run through the DB engine, the persistence framework, and even the UI rendering model — far more than
          copy-paste can handle. iBATIS 2.0 in particular is a legacy almost nobody uses outside of public-sector
          work, and a lot of the syntax I was used to in MyBatis 3.x simply does not exist — so I had to rediscover
          the workaround patterns for each case.
        </p>
        <InsightList
          items={[
            {
              title: 'DB engine swap — Oracle -> PostgreSQL',
              detail:
                'Lots of Oracle-only syntax and built-ins: ROWNUM, CONNECT BY, NVL, DECODE, PIVOT, and so on. Paging, string concatenation, and date comparisons all had to be rewritten across the board.',
            },
            {
              title: 'Persistence framework downgrade — MyBatis 3.x -> iBATIS 2.0',
              detail:
                'Parameter notation, dynamic tags, and type annotations are all different. Constructs that simply do not exist in iBATIS (<foreach>, <where>) need workaround patterns.',
            },
            {
              title: 'Large migration surface',
              detail:
                '7 Controllers + 150+ methods, 34 JSPs, 80+ SQL statements, 14 DB tables, and 100+ common-code rows.',
            },
            {
              title: 'In-scope vs out-of-scope had to be nailed down first',
              detail:
                'External-API dependencies (KIPRIS, Excel bulk upload), live streaming, and statistics queries (CONNECT BY) were excluded. The scope boundary had to be written down explicitly before I started.',
            },
          ]}
        />
      </CaseSection>

      <CaseSection
        eyebrow="Approach"
        title="Scope lock -> local env + data migration -> app-layer conversion -> parallel verification"
        accent="approach"
      >
        <p>
          Instead of touching the production DB, I ran every experiment through a{' '}
          <strong>local Docker pipeline</strong>. A Python script automated the data cleanup so every run was safe to
          retry, and for the final pass I used <strong>five parallel Claude Code sub-agents</strong> to cross-verify
          the result — covering the blind spots of any single auditor.
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { t: 'Environment', d: 'Docker Oracle + PG running side by side' },
            { t: 'Data migration', d: 'Python UPSERT + batching' },
            { t: 'App layer', d: 'Schema, SQL, iBATIS, UI' },
            { t: 'Parallel verification', d: '5 Claude Code agents' },
          ].map((s) => (
            <div
              key={s.t}
              className="p-4 bg-white border border-[var(--color-border)] rounded-xl"
            >
              <p className="font-mono text-xs font-semibold text-[var(--color-accent)] tracking-wider mb-1">
                {s.t}
              </p>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {s.d}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Pipeline
            groups={[
              {
                title: 'Source — OTT (External)',
                steps: [
                  { label: 'Oracle Dump', sub: 'OTT_TECH_INFO.dmp' },
                  { label: 'Oracle XE', sub: 'Docker · impdp restore', tone: 'muted' },
                ],
              },
              {
                title: 'Transform — Python migration script',
                steps: [
                  { label: 'CLOB read()', sub: 'LOB locator -> text', badge: '01', tone: 'accent' },
                  { label: 'KSC5601 -> UTF-8', sub: 'Korean re-encoding', badge: '02', tone: 'accent' },
                  { label: 'Merge summary_1/2/3', sub: 'Into a single column', badge: '03', tone: 'accent' },
                  { label: 'UPSERT batch of 500', sub: 'ON CONFLICT DO UPDATE', badge: '04', tone: 'accent' },
                ],
              },
              {
                title: 'Destination — Badabom',
                steps: [
                  { label: 'PostgreSQL', sub: 'Docker · local verification', tone: 'muted' },
                  { label: 'Badabom production DB', sub: '14 tables · real-DB integrity passed' },
                ],
              },
            ]}
          />
        </div>
      </CaseSection>

      <CaseSection eyebrow="Process" title="Implementation steps" accent="process">
        <ProcessSteps
          steps={[
            {
              title: 'OTT source analysis + migration scope lock-in',
              body: (
                <p>
                  I walked through the five areas — technology info, consultation, registration, My Page, and
                  admin — building a feature inventory, then wrote down what was in scope and what was not in a
                  single table. External-API dependencies (KIPRIS, Excel bulk upload), Oracle-only statistics
                  (CONNECT BY), and live streaming were all pinned as out-of-scope up front, so the boundary would
                  not shift mid-work.
                </p>
              ),
            },
            {
              title: 'Running Oracle + PostgreSQL side by side locally (Docker)',
              body: (
                <>
                  <p>
                    To avoid touching the production DB, I restored the original OTT dmp into Docker Oracle XE with{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">impdp</code>,
                    and spun up a matching Badabom schema in a PostgreSQL container, so the whole migration
                    pipeline could be replayed locally as many times as needed. I wrapped the setup in
                    docker-compose so any other developer could bring the environment up with a single{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">docker compose up</code>.
                  </p>
                  <CodeBlock filename="setup-migration-env.sh" language="bash" code={oracleDockerSetup} />
                </>
              ),
            },
            {
              title: 'Data cleanup + migration via a Python script',
              body: (
                <>
                  <p>
                    There was plenty of <strong>data cleanup</strong> that DDL alone could not handle. The body
                    summary was split across three OTT columns (tech_summary_1/2/3) and had to be merged into
                    Badabom&apos;s single column; Oracle CLOB fields returned LOB locators from the cursor so I had
                    to call <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">.read()</code> to
                    convert them to strings; and leftover KSC5601 Korean text had to be re-encoded to UTF-8. I
                    wrapped all of this into a Python script that batched 500 rows at a time and used the{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">ON CONFLICT DO UPDATE</code>{' '}
                    upsert pattern, so that stopping and rerunning it would never break integrity.
                  </p>
                  <CodeBlock filename="migrate_tech_info.py" language="python" code={migrateScript} />
                </>
              ),
            },
            {
              title: 'Application-layer conversion (schema, SQL, UI)',
              body: (
                <p>
                  The DDL for the 14 tables was made rerun-safe with an{' '}
                  <strong>IF NOT EXISTS / ON CONFLICT DO NOTHING</strong> combination, and for hot lookups I steered
                  the planner toward index-only scans via <strong>partial indexes</strong> (with a WHERE clause) and{' '}
                  <strong>INCLUDE columns</strong>. For the SQL, I first wrote down the substitution rules — ROWNUM
                  -&gt; LIMIT/OFFSET, NVL -&gt; COALESCE, DECODE -&gt; CASE WHEN, CONNECT BY -&gt; recursive CTE —
                  and only then converted the 80+ statements in one sweep. iBATIS 2.0 has no{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">&lt;foreach&gt;</code>,
                  so I worked around it with{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">&lt;iterate&gt; + #prop[]#</code>,
                  and the{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">&lt;=</code> operator
                  breaks the XML parser, so I wrapped those in CDATA. On the UI side I converted OTT&apos;s
                  server-rendered{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">&lt;table&gt;</code>{' '}
                  into Badabom&apos;s rMateGridH5 Ajax-JSON pattern — splitting each URL into{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">/list/view.do</code> (HTML) and{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">/list/data.do</code> (JSON),
                  and rewriting all 34 JSPs into the same consistent shape.
                </p>
              ),
            },
            {
              title: 'Approval workflow + history tracking (@Transactional)',
              body: (
                <>
                  <p>
                    Rather than stop at plain CRUD, I added a <strong>state machine</strong> covering registration
                    -&gt; review -&gt; approved / rejected / retired, along with
                    <strong> history-table-based audit tracing</strong>. The main-table UPDATE and the history
                    INSERT share a single transaction so any mid-flight failure rolls back, while{' '}
                    <strong>notifications live outside the transaction boundary</strong> on purpose — isolated in a
                    try/catch so that a failed notification never reverts an approval.
                  </p>
                  <CodeBlock
                    filename="AdmTechInfoMngServiceImpl.java"
                    language="java"
                    code={approvalWorkflow}
                  />
                </>
              ),
            },
            {
              title: 'Cross-verification with five parallel Claude Code agents',
              body: (
                <>
                  <p>
                    When one person sweeps 80+ SQL statements, 34 JSPs, and 87 URLs, something is going to slip
                    through. So I ran <strong>five Claude Code sub-agents in parallel</strong>, each with a
                    different angle — scope, DB, SQL mappers, Controller/JSP, common codes — doing independent
                    verification, and then in the main session I collected the reports and zeroed in only on the
                    points where the agents disagreed with each other.
                  </p>
                  <CodeBlock filename="verification-agents.md" language="markdown" code={agentBrief} />
                  <p>
                    That pass caught three real DDL mismatches (a missing column in tt_tech_video, a schema
                    mismatch in tt_last_event, a missing uptr_id SET in the updateAdmVideo SQL) <em>before</em> the
                    production deploy, and the cross-check also let me separate out three false positives that a
                    single agent had flagged. The 14,695-row real-data cross-check came out fully consistent.
                    Verification that would have taken me at least half a day alone was done in tens of minutes.
                  </p>
                </>
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
              title: '87 URLs, 34 JSPs, 80+ SQL, 14 tables migrated',
              detail:
                'All user features (technology info, consultation, registration, My Page) and admin features (technology info, promotion hall, video hall, tech briefings, consultation/trade, demand, announcements) migrated. Build and real-DB integrity both pass.',
            },
            {
              title: 'Approval workflow + history tracking unified the admin tools',
              detail:
                'Instead of stopping at CRUD migration, I bundled state-transition validation with the history INSERT in the same transaction, so an admin can control the full technology-transfer lifecycle from a single screen.',
            },
            {
              title: 'Established a Claude Code multi-agent verification pipeline',
              detail:
                'Five angles — scope, DB, SQL mappers, Controller, common codes — split across parallel sub-agents doing independent verification, then cross-checked in the main session. Three DDL mismatches caught before deploy, three false positives separated out. Reused afterward for security audits and larger refactors.',
            },
            {
              title: 'A local Docker pipeline gave every experiment room to fail safely',
              detail:
                'Oracle XE and PostgreSQL containers running side by side locally meant I could rerun the migration logic as many times as I needed without putting load or risk on the production DB. The Python migration script is also UPSERT-based, so it is safe to run again.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="techtrade-migration" all={cases} />
    </main>
  );
}

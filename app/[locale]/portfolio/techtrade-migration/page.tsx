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
import { Pipeline } from '../_components/diagrams/Pipeline';

export const metadata: Metadata = {
  title: 'OTT 기술거래 시스템을 바다봄으로 이관',
  description:
    'Oracle + MyBatis 기반의 OTT 기술거래 플랫폼을 PostgreSQL + iBATIS 환경인 바다봄으로 이관. 87개 URL, 34개 JSP, 80+ SQL, 14개 테이블을 재작성한 레거시 마이그레이션 케이스 스터디.',
  alternates: { canonical: 'https://thmm.kr/portfolio/techtrade-migration' },
};

const oracleDockerSetup = `# 1) 로컬에 Oracle XE 컨테이너 기동 — OTT 원본 dmp 복원용
docker run -d --name ott-ora \\
    -p 1521:1521 \\
    -e ORACLE_PASSWORD=*** \\
    -v ./dump:/opt/oracle/dump \\
    gvenzl/oracle-xe:21-slim

# 2) OTT 에서 받은 덤프를 컨테이너로 복사 후 impdp 로 임포트
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

# 3) 로컬 PostgreSQL — 바다봄 스키마 복제용
docker run -d --name bdb-pg -p 5432:5432 \\
    -e POSTGRES_DB=bdb -e POSTGRES_USER=badabom -e POSTGRES_PASSWORD=*** \\
    postgres:15-alpine

# 4) 준비된 스키마 DDL 적용
docker exec -i bdb-pg psql -U badabom -d bdb < docs/sql/00_DEPLOY_ALL_TECHTRADE.sql`;

const migrateScript = `#!/usr/bin/env python3
"""OTT Oracle → 바다봄 PostgreSQL 데이터 이관 (migrate_tech_info.py)

까다로웠던 지점:
  - 본문 요약이 Oracle 에 3분할(tech_summary_1/2/3) 저장
    → 단일 tt_tech_info.tech_summary 로 NULL 전파 처리하며 통합
  - Oracle CLOB 은 cursor 가 LOB locator 를 반환 → .read() 로 문자열 변환
  - 한글 KSC5601 잔재 → UTF-8 재인코딩
  - 1:N 테이블은 FK 순서 맞춰 부모 → 자식 순으로 이관
  - ON CONFLICT DO UPDATE 로 재실행 안전 (실패 지점부터 다시 돌려도 정합성 유지)
"""
import cx_Oracle, psycopg2
from psycopg2.extras import execute_values

ora = cx_Oracle.connect('tt/***@localhost:1521/XEPDB1', encoding='UTF-8')
pg  = psycopg2.connect(host='localhost', dbname='bdb',
                       user='badabom', password='***')

SELECT_TECH_INFO = """
    SELECT tech_sn, tech_nm, org_nm,
           /* Oracle 측에서 3분할 컬럼을 먼저 합쳐서 내려받음 */
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
    print(f"tt_tech_info: {inserted}건 UPSERT 완료")`;

const approvalWorkflow = `// 승인/반려 서비스: 상태검증 → 본 테이블 UPDATE → 이력 INSERT → 알림 발송
// 전체를 단일 트랜잭션으로 묶어, 중간에 예외가 나도 깔끔히 롤백

@Service("admTechInfoMngService")
public class AdmTechInfoMngServiceImpl extends EgovAbstractServiceImpl
        implements AdmTechInfoMngService {

    @Resource private AdmTechInfoMngDAO    dao;
    @Resource private TtTechInfoHistoryDAO historyDAO;
    @Resource private NotificationService  notificationService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void approveTechInfo(TtTechInfoVO vo, String operatorId) throws Exception {

        // 1) 현재 상태 조회 + 상태 전이 유효성 검증 (state machine)
        TtTechInfoVO current = dao.selectTechInfoBySn(vo.getTechSn());
        if (current == null) {
            throw new EgovBizException("존재하지 않는 기술 techSn=" + vo.getTechSn());
        }
        validateStateTransition(current.getApproveYn(), vo.getApproveYn());

        // 2) 본 테이블 상태 변경 (updt_dt / uptr_id 자동 세팅)
        vo.setUptrId(operatorId);
        vo.setUpdtDt(new Timestamp(System.currentTimeMillis()));
        dao.updateTechInfoApproveState(vo);

        // 3) 이력 테이블에 변경 기록 (감사 추적용)
        TtTechInfoHistoryVO history = new TtTechInfoHistoryVO();
        history.setTechSn(vo.getTechSn());
        history.setPrevApproveYn(current.getApproveYn());
        history.setNextApproveYn(vo.getApproveYn());
        history.setRejectReason(vo.getRejectReason());
        history.setOperatorId(operatorId);
        historyDAO.insertApprovalHistory(history);

        // 4) 승인 완료 시 등록자에게 알림 — 실패해도 승인 자체는 유지
        //    (알림 실패로 롤백되면 승인 상태가 되돌아가 운영상 혼란)
        if ("Y".equals(vo.getApproveYn())) {
            try {
                notificationService.notifyTechApproved(
                        current.getRgsrId(), current.getTechNm());
            } catch (Exception e) {
                log.warn("알림 발송 실패 techSn=" + vo.getTechSn(), e);
            }
        }
    }

    /**
     * 상태 전이 규칙
     *   N(신규)    → Y(승인) | E(반려)
     *   Y(승인)    → A(사용중지)          ※ 반려로 되돌리지는 못함
     *   E(반려)    → Y(승인) | N(재검토)
     *   A(사용중지) → Y(승인)
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
                    String.format("상태 전이 불가: %s → %s", from, to));
        }
    }
}`;

const agentBrief = `# Claude Code 병렬 에이전트 지시서 (5개 동시 실행)
# → 서로 다른 관점에서 이관 결과를 독립 검증, 결과를 교차 대조

Agent 1 — SCOPE
  입력: TECHTRADE_MIGRATION_SCOPE.md + 현재 소스
  과제: 이관 대상 8 테이블 / 87 URL 이 모두 구현됐는가.
        제외 대상(외부 API, CONNECT BY 통계 등)이 실수로 섞여 들어갔는가.

Agent 2 — DB
  입력: DDL 스크립트 + 실제 PostgreSQL 스키마 + 실데이터 행 수
  과제: 14 테이블의 컬럼·타입·제약조건 일치 여부, 실데이터 대조 (14,695건)

Agent 3 — SQL 매퍼
  입력: Badabom_*.xml 80+ 구문
  과제: 파라미터/결과 클래스·바인딩·IN 절·날짜 포맷·CDATA 사용
        — iBATIS 2.0 문법 위반이 있는가. Oracle 문법 잔재가 있는가.

Agent 4 — Controller/JSP
  입력: Controller 7개 + JSP 34개
  과제: URL 매핑과 화면 흐름 누락, 승인 워크플로우 상태 전이, 파일 업로드 경로

Agent 5 — 공통코드
  입력: st_com_cd 실제 등록 건수 + SQL 참조 위치
  과제: 7그룹 100+건 모두 DB에 존재하는가. SQL이 참조하는 코드가 DB에 있는가.

# 실행 후 메인 세션에서 각 Agent 리포트를 교차검증
#   → "Agent N이 X라고 주장, Agent M이 다르게 말함" 패턴 찾기
#   → 거짓양성(FP) 3건 구분, 실제 버그 3건 수정 (tt_tech_video 컬럼 누락 등)`;

export default function TechTradeMigrationCase() {
  return (
    <main>
      <CaseHero
        organization={organizations['kimst-bdbis']}
        category="LEGACY MIGRATION"
        title="OTT 기술거래 시스템을 바다봄으로 이관"
        subtitle="Oracle + MyBatis 기반의 외부 기술거래 플랫폼(OTT)을 PostgreSQL + iBATIS 환경인 바다봄으로 옮겼습니다. 87개 URL, 34개 JSP, 80여 개 SQL, 14개 테이블을 재작성한 이관 작업입니다."
        meta={[
          { label: '이관 URL', value: '87개', hint: '사용자 50 / 관리자 37' },
          { label: 'DB', value: '14 테이블', hint: 'Oracle → PostgreSQL' },
          { label: 'SQL 재작성', value: '80+ 구문', hint: 'iBATIS 2.0' },
          { label: 'JSP', value: '34개', hint: 'rMateGridH5 패턴' },
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
        title="Oracle·MyBatis 기반 외부 시스템을 PostgreSQL·iBATIS 환경으로"
        accent="problem"
      >
        <p>
          기술거래 플랫폼(OTT)은 Oracle + MyBatis 3.x 조합의 외부 시스템이었는데, 옮겨 갈 바다봄은 전자정부 표준인
          PostgreSQL + iBATIS 2.0 환경이었습니다. 이름만 보면 비슷한 계열이지만, 실제로는 단순 복사 붙여넣기로
          붙지 않는 차이가 DB 엔진부터 영속성 프레임워크, UI 렌더링 방식까지 전반에 깔려 있었습니다. 특히 iBATIS
          2.0은 바깥에선 거의 안 쓰는 레거시라, MyBatis 3.x에서 익숙했던 문법 중 상당수가 그냥 없습니다 — 거기에
          맞춰 우회 패턴을 다시 찾아야 했습니다.
        </p>
        <InsightList
          items={[
            {
              title: 'DB 엔진 전환 — Oracle → PostgreSQL',
              detail:
                'ROWNUM·CONNECT BY·NVL·DECODE·PIVOT 등 Oracle 전용 문법과 내장 함수가 다수. 페이징·문자열 결합·날짜 비교 구문을 전면 재작성 필요.',
            },
            {
              title: '영속성 프레임워크 다운그레이드 — MyBatis 3.x → iBATIS 2.0',
              detail:
                '파라미터 표기·동적 태그·타입 어노테이션 전부 다름. iBATIS에 아예 없는 문법(<foreach>, <where>)은 우회 패턴 필요.',
            },
            {
              title: '이관 범위 대규모',
              detail:
                'Controller 7개 + 150+ 메서드, JSP 34개, SQL 80+ 구문, DB 테이블 14개, 공통코드 100+건.',
            },
            {
              title: '이관 대상과 제외 대상 정리 필요',
              detail:
                '외부 API 의존(KIPRIS, Excel 일괄등록), 라이브 스트리밍, 통계(CONNECT BY) 등은 제외. 범위 경계를 먼저 명문화해야 했음.',
            },
          ]}
        />
      </CaseSection>

      <CaseSection
        eyebrow="Approach"
        title="범위 확정 → 로컬 환경 + 데이터 이관 → 앱 레이어 변환 → 병렬 검증"
        accent="approach"
      >
        <p>
          운영 DB에 직접 붙지 않고 <strong>로컬 Docker 파이프라인</strong>에서 모든 실험을 돌렸습니다.
          Python 스크립트로 데이터 정제까지 자동화해 재실행 안전성을 확보했고, 마지막 검증은 Claude Code의{' '}
          <strong>병렬 서브에이전트 5개</strong>로 교차검증해 단일 감사자의 놓침을 보완했습니다.
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { t: '환경 구성', d: 'Docker Oracle + PG 동시 기동' },
            { t: '데이터 이관', d: 'Python UPSERT + 배치' },
            { t: '앱 레이어', d: '스키마 · SQL · iBATIS · UI' },
            { t: '병렬 검증', d: 'Claude Code 에이전트 5개' },
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
                  { label: 'Oracle XE', sub: 'Docker · impdp 복원', tone: 'muted' },
                ],
              },
              {
                title: 'Transform — Python 이관 스크립트',
                steps: [
                  { label: 'CLOB read()', sub: 'LOB locator → text', badge: '01', tone: 'accent' },
                  { label: 'KSC5601 → UTF-8', sub: '한글 재인코딩', badge: '02', tone: 'accent' },
                  { label: 'summary_1/2/3 통합', sub: '단일 컬럼 병합', badge: '03', tone: 'accent' },
                  { label: 'UPSERT 500 배치', sub: 'ON CONFLICT DO UPDATE', badge: '04', tone: 'accent' },
                ],
              },
              {
                title: 'Destination — 바다봄',
                steps: [
                  { label: 'PostgreSQL', sub: 'Docker · 로컬 검증', tone: 'muted' },
                  { label: '바다봄 운영 DB', sub: '14 테이블 · 실DB 정합성 통과' },
                ],
              },
            ]}
          />
        </div>
      </CaseSection>

      <CaseSection eyebrow="Process" title="구현 단계" accent="process">
        <ProcessSteps
          steps={[
            {
              title: 'OTT 소스 분석 + 이관 범위 확정',
              body: (
                <p>
                  기술정보·상담·등록·마이페이지·관리자 다섯 영역을 훑으며 기능 인벤토리를 만들고, 이관 대상과 제외
                  대상을 표로 명문화했습니다. 외부 API 의존(KIPRIS, Excel 일괄등록)과 Oracle 전용 통계(CONNECT
                  BY), 라이브 스트리밍 등은 초반에 제외로 확정해서 작업 중간에 범위가 흔들리지 않도록 했습니다.
                </p>
              ),
            },
            {
              title: '로컬 Oracle + PostgreSQL 동시 기동 (Docker)',
              body: (
                <>
                  <p>
                    운영 DB에 직접 붙지 않기 위해, OTT 원본 dmp는 Docker Oracle XE에 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">impdp</code>로
                    복원하고, 바다봄 쪽은 PostgreSQL 컨테이너로 동일 스키마를 띄워 이관 파이프라인을 로컬에서 반복
                    실험할 수 있게 구성했습니다. 같은 과정을 docker-compose로 한 벌 묶어 둬서 다른 개발자도{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">docker compose up</code>{' '}
                    한 번으로 환경을 띄울 수 있게 했습니다.
                  </p>
                  <CodeBlock filename="setup-migration-env.sh" language="bash" code={oracleDockerSetup} />
                </>
              ),
            },
            {
              title: 'Python 스크립트로 데이터 정제 + 이관',
              body: (
                <>
                  <p>
                    DDL만으로 해결되지 않는 <strong>데이터 정제</strong> 작업이 많았습니다. 본문 요약이 OTT 에는
                    세 개 컬럼(tech_summary_1/2/3)에 쪼개져 있어서 바다봄의 단일 컬럼으로 통합해야 했고, Oracle
                    CLOB 필드는 cursor가 LOB locator를 반환해서 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">.read()</code>로 문자열 변환이 필요했고,
                    한글 KSC5601 잔재도 UTF-8로 재인코딩해야 했습니다. Python 스크립트로 전부 묶어 500건 배치 +{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">ON CONFLICT DO UPDATE</code> upsert 패턴으로, 중단 후 재실행해도 정합성이 깨지지 않도록
                    만들었습니다.
                  </p>
                  <CodeBlock filename="migrate_tech_info.py" language="python" code={migrateScript} />
                </>
              ),
            },
            {
              title: '애플리케이션 레이어 변환 (스키마 · SQL · UI)',
              body: (
                <p>
                  14개 테이블 DDL은 <strong>IF NOT EXISTS / ON CONFLICT DO NOTHING</strong> 조합으로 재실행 안전하게
                  만들고, 자주 쓰는 조회에는 <strong>partial index</strong>(WHERE 절 포함)와 <strong>INCLUDE 절</strong>로
                  index-only scan을 유도했습니다. SQL은 ROWNUM→LIMIT/OFFSET, NVL→COALESCE, DECODE→CASE WHEN,
                  CONNECT BY→재귀 CTE 같은 치환 규칙을 먼저 표로 정리한 뒤 80여 구문을 일괄 변환. iBATIS 2.0에서는{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">&lt;foreach&gt;</code>가 없어{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">&lt;iterate&gt; + #prop[]#</code>로 우회하고,{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">&lt;=</code> 연산자는 XML 파서가 깨뜨려서 CDATA로 감쌌습니다. UI는 OTT의 서버렌더{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">&lt;table&gt;</code>을 바다봄의 rMateGridH5 Ajax-JSON 패턴으로 전환 — URL을{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">/list/view.do</code>(HTML)와{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">/list/data.do</code>(JSON)로 분리해 34개 JSP 전체를 일관된 구조로 다시 작성했습니다.
                </p>
              ),
            },
            {
              title: '승인 워크플로우 + 이력 추적 (@Transactional)',
              body: (
                <>
                  <p>
                    단순 CRUD에 머무르지 않고 등록 → 검토 → 승인/반려/사용중지 <strong>상태 전이(state machine)</strong>와
                    <strong> 이력 테이블 기반 감사 추적</strong>을 붙였습니다. 본 테이블 UPDATE와 이력 INSERT는 같은
                    트랜잭션으로 묶어 중간 실패 시 롤백되도록 구성했고, 반대로 <strong>알림 발송은 트랜잭션 밖 개념</strong>이라
                    의도적으로 try/catch로 격리 — 알림 실패가 승인 상태를 되돌리지 않도록 했습니다.
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
              title: 'Claude Code 5개 병렬 에이전트로 교차검증',
              body: (
                <>
                  <p>
                    80+ SQL, 34 JSP, 87 URL을 혼자서 훑으면 반드시 놓치는 곳이 생깁니다. 그래서{' '}
                    <strong>Claude Code의 서브에이전트 5개를 병렬로</strong> 띄워 각각 다른 관점(스코프·DB·SQL 매퍼·
                    Controller/JSP·공통코드)으로 독립 검증을 돌리고, 메인 세션에서 리포트를 모아 서로 다른 주장을
                    하는 지점만 골라냈습니다.
                  </p>
                  <CodeBlock filename="verification-agents.md" language="markdown" code={agentBrief} />
                  <p>
                    이 과정에서 실제 DDL 불일치 3건(tt_tech_video 컬럼 누락, tt_last_event 스키마 불일치,
                    updateAdmVideo SQL의 uptr_id SET 누락)을 운영 배포 <em>전에</em> 잡아냈고, 단일 에이전트의
                    거짓양성 3건도 교차검증으로 구분했습니다. 14,695건 실데이터 대조도 전부 일치. 혼자서는 반나절은
                    더 걸렸을 검증이 수십 분에 끝났습니다.
                  </p>
                </>
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
              title: '87 URL · 34 JSP · 80+ SQL · 14 테이블 이관 완료',
              detail:
                '사용자 기능(기술정보·상담·등록·마이페이지)과 관리자 기능(기술정보·홍보관·영상관·설명회·상담/거래·수요·공고) 전부 이관. 빌드/실DB 정합성 모두 통과.',
            },
            {
              title: '승인 워크플로우 + 이력 추적으로 관리자 도구 통합',
              detail:
                '단순 CRUD 이관에 그치지 않고 상태 전이 검증과 이력 INSERT를 같은 트랜잭션에 묶어, 관리자가 한 화면에서 기술거래 전체 라이프사이클을 제어할 수 있게 구성.',
            },
            {
              title: 'Claude Code 멀티 에이전트 검증 파이프라인 정립',
              detail:
                '스코프·DB·SQL 매퍼·Controller·공통코드 다섯 관점을 병렬 서브에이전트로 나눠 독립 검증 → 메인 세션 교차 대조. 배포 전에 DDL 불일치 3건을 사전에 발견, 거짓양성 3건도 구분. 이후 보안 감사·대형 리팩토링에 재사용.',
            },
            {
              title: '로컬 Docker 파이프라인으로 반복 실험 안전성 확보',
              detail:
                'Oracle XE + PostgreSQL 컨테이너를 로컬에서 동시 기동해 운영 DB에 부하·리스크 없이 이관 로직을 반복 실험. Python 이관 스크립트도 UPSERT 기반으로 재실행 안전하게 설계.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="techtrade-migration" all={cases} />
    </main>
  );
}

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
import { ArchStack } from '../_components/diagrams/ArchStack';

export const metadata: Metadata = {
  title: 'SSE + Cross-WAS 실시간 로그 뷰어',
  description:
    '운영팀이 매번 SSH로 붙어 tail -f 하던 흐름을 SSE 기반 웹 뷰어로 옮기고, Cross-WAS SSE 릴레이로 접속한 노드와 무관하게 다른 WAS 로그까지 한 화면에서 조회되도록 구성한 케이스 스터디.',
  alternates: { canonical: 'https://thmm.kr/portfolio/log-viewer' },
};

const sseLocalCode = `// SSE 로컬 파일 스트리밍 — 연결 1회로 서버가 push
response.setContentType("text/event-stream");
response.setCharacterEncoding("UTF-8");
response.setHeader("Cache-Control", "no-cache");
response.setHeader("Connection", "keep-alive");
response.setHeader("X-Accel-Buffering", "no"); // Nginx 프록시 버퍼링 방지
response.flushBuffer();

PrintWriter writer = response.getWriter();
long position = lastPosition;
long startTime = System.currentTimeMillis();
long maxDuration = 10 * 60 * 1000L; // 10분 타임아웃
int idleCount = 0;

while (!writer.checkError()) {
    if (System.currentTimeMillis() - startTime > maxDuration) {
        writer.write("event: timeout\\ndata: {\\"message\\":\\"10분 경과로 연결이 종료됩니다.\\"}\\n\\n");
        writer.flush();
        break;
    }

    long fileLength = file.length();
    if (fileLength > position) {
        Map<String, Object> data = readLogForward(file, position, level, keyword);
        List<?> lines = (List<?>) data.get("lines");
        position = ((Number) data.get("position")).longValue();
        if (!lines.isEmpty()) {
            writer.write("event: log\\ndata: ");
            writer.write(objectMapper.writeValueAsString(data));
            writer.write("\\n\\n");
            writer.flush();
        }
        idleCount = 0;
    } else if (fileLength < position) {
        position = 0; // 로그 rotation 감지 → 처음부터 다시
    } else {
        idleCount++;
        if (idleCount >= 30) {  // 30초 idle → heartbeat
            writer.write(": heartbeat\\n\\n");
            writer.flush();
            idleCount = 0;
        }
    }
    Thread.sleep(1000);
}`;

const crossWasRelayCode = `// Cross-WAS SSE 릴레이 — 원격 WAS stream.do로 장기 연결, 받는 대로 클라이언트에 중계
private void relayRemoteStream(PrintWriter writer, String wasNode,
        String fileName, long lastPosition, String level, String keyword) {
    HttpURLConnection conn = null;
    try {
        String nodeUrl = getProperty("server.log." + wasNode + ".url");
        String token   = getProperty("server.log.proxy.token");

        String urlStr = nodeUrl + "/adm/sys/log/stream.do"
                + "?fileName=" + URLEncoder.encode(fileName, "UTF-8")
                + "&lastPosition=" + lastPosition
                + "&level=" + URLEncoder.encode(level, "UTF-8")
                + "&keyword=" + URLEncoder.encode(keyword, "UTF-8");

        conn = (HttpURLConnection) new URL(urlStr).openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty(PROXY_TOKEN_HEADER, token); // 내부 WAS 간 인증
        conn.setRequestProperty("Accept", "text/event-stream");
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(0); // SSE 장기 연결 - 읽기 타임아웃 없음

        // SSE 이벤트 라인을 그대로 중계 — 빈 줄에서 flush
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(conn.getInputStream(), UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null && !writer.checkError()) {
                writer.write(line + "\\n");
                if (line.isEmpty()) writer.flush();
            }
        }
    } catch (Exception e) {
        writer.write("event: error\\ndata: {\\"message\\":\\"원격 스트리밍 오류\\"}\\n\\n");
        writer.flush();
    } finally {
        if (conn != null) conn.disconnect();
    }
}`;

const tailReadCode = `// 파일 끝에서 역순으로 읽기 — 대용량 로그에도 전체 로딩 없이 뒤에서 N줄만
private Map<String, Object> readLogTail(File file, long fromOffset,
        int lineCount, String level, String keyword) throws Exception {
    List<String> resultLines = new ArrayList<>();

    try (RandomAccessFile raf = new RandomAccessFile(file, "r")) {
        long fileLength = raf.length();
        long readEnd = (fromOffset > 0 && fromOffset < fileLength) ? fromOffset : fileLength;

        // 필터링 시 더 큰 윈도우를 읽음 (필터 후 lineCount 남을 때까지)
        boolean filtering = !"ALL".equalsIgnoreCase(level) || StringUtils.isNotBlank(keyword);
        int bufferSize = Math.min((int)(readEnd), filtering ? 1024 * 512 : 1024 * 64);
        long readStart = Math.max(0, readEnd - bufferSize);

        byte[] buffer = new byte[(int)(readEnd - readStart)];
        raf.seek(readStart);
        raf.readFully(buffer);

        String[] allLines = new String(buffer, UTF_8).split("\\\\r?\\\\n");
        for (int i = allLines.length - 1; i >= 0 && resultLines.size() < lineCount; i--) {
            String line = allLines[i];
            if (StringUtils.isBlank(line)) continue;
            if (filterLevel && !line.toUpperCase().contains(levelUpper)) continue;
            if (filterKeyword && !line.toLowerCase().contains(keywordLower)) continue;
            resultLines.add(line);
        }
    }
    return result; // lines + offset(hasMore 계산용) + fileSize
}`;

const securityCode = `// 다중 인증 레이어 — 내부 프록시 / 관리자 권한 / IP / 비밀번호
private ModelAndView checkSecurity(HttpServletRequest request) {
    // 1) 내부 WAS 간 통신은 프록시 토큰만 있으면 통과
    String proxyToken = request.getHeader(PROXY_TOKEN_HEADER);
    if (StringUtils.isNotBlank(proxyToken)) {
        String configToken = getProperty("server.log.proxy.token");
        if (proxyToken.equals(configToken)) return null;
        return jsonForm.modelAndViewJson("403", "유효하지 않은 프록시 토큰", null);
    }

    // 2) 외부 사용자는 관리자 권한 확인
    if (!isAdminLoggedIn()) {
        return jsonForm.modelAndViewJson("403", "관리자 로그인 필요", null);
    }
    // 3) IP 화이트리스트 (옵션)
    if (!isAllowedIp(request)) {
        return jsonForm.modelAndViewJson("403", "허용되지 않은 IP", null);
    }
    // 4) 2차 비밀번호 인증 (뷰어 진입 시 별도 모달)
    if (!isAuthenticated(request)) {
        return jsonForm.modelAndViewJson("401", "인증 필요", null);
    }
    return null;
}`;

export default function LogViewerCase() {
  return (
    <main>
      <CaseHero
        organization={organizations['kimst-bdbis']}
        category="DEVOPS / OBSERVABILITY"
        title="SSE + Cross-WAS 실시간 로그 뷰어"
        subtitle="WAS는 대전 IDC에 있는데, 망분리 정책상 그 서버에 붙을 수 있는 PC가 부산 사무실에만 있었습니다. 그래서 로그 한 번 보려면 사실상 부산까지 가야 하는 구조였어요. 웹에서 실시간으로 WAS 로그를 볼 수 있게 뷰어를 만들었고, 두 개 노드에 분산된 로그까지 한 화면에서 보이도록 Cross-WAS 릴레이를 붙였습니다."
        meta={[
          { label: '접근 제약', value: '부산 PC ONLY', hint: '대전 WAS → 부산 PC 한정' },
          { label: '전송 방식', value: 'SSE', hint: '폴링 대비 access log 깨끗' },
          { label: '멀티 노드', value: 'Cross-WAS 릴레이', hint: '접속 WAS와 무관' },
          { label: '인증', value: '4-레이어', hint: '관리자 · IP · PW · 내부 토큰' },
        ]}
        stack={[
          'Spring MVC',
          'Server-Sent Events',
          'RandomAccessFile',
          'HttpURLConnection',
          'Proxy Token',
          'JEUS (2 노드)',
          '전자정부 프레임워크',
        ]}
      />

      <CaseSection
        eyebrow="Problem"
        title="로그 한 번 보려면 부산까지 가야 하는 구조"
        accent="problem"
      >
        <p>
          WAS는 <strong>대전 IDC</strong>에 있습니다. 그 서버에 붙을 수 있는 PC가 망분리 정책상{' '}
          <strong>부산 사무실 한 곳</strong>으로 한정돼 있었어요. 그러니까 "부산 사무실까지 이동해서 → 지정된 PC에
          앉아서 → 거기서 대전 WAS에 SSH" 하는 경로가 공식적으로 유일한 접근 방법이었습니다. 서울에서 작업하다 로그를
          봐야 하면 선택지가 둘 — 부산까지 다녀오거나, 부산에 있는 사람에게 "지금 이 시점 로그 좀 찍어서 보내주세요"
          하고 부탁하거나. 장애라도 나면 분 단위로 의사결정이 필요한데, 그 사이에 "부산 PC 앞에 누구 있나요"
          메신저가 먼저 돌아가야 하는 상황이었습니다.
        </p>
        <p>
          거기에 WAS가 두 노드로 나뉘어 있어서, 같은 시간대 장애의 원인을 추적하려면 두 서버의 로그를 교차로 봐야
          했습니다. 부산 PC에서 SSH 창 두 개 열고 대전 WAS 1/2를 번갈아 확인하는 게 기본 루틴이었고, 서울에서
          원격으로 부탁하는 흐름이 반복됐습니다.
        </p>
        <p>
          처음엔 단순 폴링으로 tail을 흉내내는 뷰어를 검토했는데, 이번에는 <em>로그 뷰어 자체가 access 로그를
          엄청나게 쌓아</em> 원래 보려던 로그를 덮는 역설이 생겼습니다. 전체 로그 파일을 매 요청마다 통째로
          읽기에는 용량도 너무 컸고요.
        </p>
        <InsightList
          items={[
            {
              title: '대전 WAS에 붙을 수 있는 PC가 부산에만',
              detail:
                '망 분리 정책상 서울·대전에서 바로 SSH를 붙을 수 없는 구조. 로그를 보려면 부산까지 가거나 부산 담당자에게 매번 부탁해야 했습니다.',
            },
            {
              title: '멀티 WAS 노드 교차 확인',
              detail:
                'WAS가 두 대로 나뉘어서 한쪽만 봐서는 원인을 모를 때가 많음. 부산 PC에서 SSH 창 두 개 띄워 WAS 1/2를 번갈아 보는 게 기본 세팅.',
            },
            {
              title: '폴링 방식은 access log 오염',
              detail:
                '짧은 주기 폴링으로 tail을 흉내내면 뷰어 HTTP 요청이 끝없이 access log에 쌓여, 본 로그를 덮어버리는 노이즈원이 됨.',
            },
            {
              title: '대용량 파일을 매번 통째로 읽을 수 없음',
              detail:
                '수십 MB ~ GB 단위 로그가 쌓이는 환경이라, 매 요청마다 전체 로딩은 메모리·응답 모두 터짐. 파일 꼬리 윈도우만 정확히 읽을 방법이 필요.',
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Approach" title="관리자 웹 안으로 끌어오기 — SSE + Cross-WAS 릴레이" accent="approach">
        <p>
          핵심 아이디어는 단순합니다. 서버에 붙을 수 있는 유일한 경로는 바다봄 <strong>관리자 웹 관리 기능</strong>
          이니까, 로그 뷰어도 그 안에 만들자는 거였습니다. 관리자 웹은 이미 바다봄 내부 망에서 동작하고 있어 기존
          접근 경로를 그대로 쓸 수 있었고, 관리자는 서울·부산 어디서든 로그인만 되면 쓸 수 있었습니다.
        </p>
        <p>
          실시간성은 <strong>SSE(Server-Sent Events)</strong>로 확보했습니다. 폴링을 쓰면 뷰어가 오히려 로그 노이즈
          원이 되니까, 장기 연결 하나로 서버가 push하는 방식이 맞았어요. 멀티 노드 문제는 <strong>Cross-WAS SSE
          릴레이</strong>로 풀었습니다 — 내가 접속한 노드가 WAS 1인데 WAS 2의 로그를 보고 싶으면, WAS 1이 WAS 2의
          stream.do에 SSE로 붙어 받은 이벤트를 그대로 클라이언트에 중계합니다. 사용자는 노드 스위치만 누르면
          되고, 어느 쪽에 붙었는지 신경 쓸 필요가 없습니다.
        </p>
        <p>
          대용량 로그 파일 처리는 <strong>RandomAccessFile</strong>로 끝에서 역순으로 읽어 메모리 부담 없이 꼬리
          N줄만 뽑도록 했습니다. 로그 rotation이 일어나면 파일 길이가 줄어드니까, 그걸 감지해서 position을 0으로
          리셋하는 처리도 같이.
        </p>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-[var(--color-border)] rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--color-border)]">
              <p className="font-mono text-[11px] font-semibold text-[var(--color-text-muted)] tracking-[0.2em]">
                LOCAL READ
              </p>
              <p className="font-mono text-[11px] text-[var(--color-text-muted)]">접속 WAS = 대상</p>
            </div>
            <ArchStack
              boxes={[
                { title: 'Admin Browser', subtitle: 'EventSource' },
                {
                  title: 'WAS 1',
                  subtitle: '/adm/sys/log/stream.do',
                  bullets: ['SSE 연결 수립', 'readLogForward 루프'],
                  tone: 'accent',
                },
                {
                  title: 'log file (WAS 1)',
                  subtitle: '/logs/badabom.log',
                  bullets: ['RandomAccessFile', '꼬리부터 읽기'],
                },
              ]}
              edges={[{ label: 'SSE · 1회 연결' }, { label: 'File I/O' }]}
            />
          </div>

          <div className="p-6 bg-white border border-[var(--color-accent)]/30 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--color-accent)]/20">
              <p className="font-mono text-[11px] font-semibold text-[var(--color-accent)] tracking-[0.2em]">
                CROSS-WAS RELAY
              </p>
              <p className="font-mono text-[11px] text-[var(--color-accent-dark)]">접속 WAS ≠ 대상</p>
            </div>
            <ArchStack
              boxes={[
                { title: 'Admin Browser', subtitle: 'EventSource' },
                {
                  title: 'WAS 1',
                  subtitle: '/adm/sys/log/stream.do',
                  bullets: ['wasNode=2 감지', '원격 stream.do 연결'],
                  tone: 'accent',
                },
                {
                  title: 'WAS 2',
                  subtitle: '/adm/sys/log/stream.do',
                  bullets: ['PROXY_TOKEN 검증', 'SSE 스트림 송신'],
                  tone: 'accent',
                },
                {
                  title: 'log file (WAS 2)',
                  subtitle: '/logs/badabom.log',
                  bullets: ['RandomAccessFile'],
                },
              ]}
              edges={[
                { label: 'SSE · 1회 연결' },
                { label: 'SSE 릴레이 · 내부 토큰' },
                { label: 'File I/O' },
              ]}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-8">
          {[
            { t: 'SSE 선택 이유', d: '폴링 대비 access log 깨끗 — 뷰어가 로그 노이즈원이 되지 않음' },
            { t: 'Cross-WAS', d: '접속한 노드가 아닌 WAS 로그도 한 화면에서 — SSH 분산 부담 제거' },
            { t: 'Windowed Tail', d: 'RandomAccessFile로 끝에서 N바이트만 읽기 — 대용량 안전' },
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
              title: 'SSE 스트림 — 10분 타임아웃 + heartbeat',
              body: (
                <>
                  <p>
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      text/event-stream
                    </code>{' '}
                    헤더로 SSE 응답을 열고, 1초 주기로 파일 변경을 체크해 새 라인을 push합니다. 오래된 좀비 연결이
                    남지 않도록 10분 타임아웃을 걸고, 30초 idle일 때는 주석 한 줄짜리 heartbeat를 흘려 중간 프록시가
                    연결을 끊지 않도록 했습니다. 파일 크기가 줄면 rotation으로 간주하고 position을 0으로 리셋합니다.
                  </p>
                  <CodeBlock filename="AdmServerLogController.java" language="java" code={sseLocalCode} />
                </>
              ),
            },
            {
              title: 'Cross-WAS SSE 릴레이',
              body: (
                <>
                  <p>
                    대상 노드가 다른 WAS면 현재 WAS가 그 노드의 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      stream.do
                    </code>에 SSE 클라이언트로 붙어, 받는 라인을 그대로 출력 스트림에 중계합니다. 핵심은{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      setReadTimeout(0)
                    </code>{' '}
                    — SSE 장기 연결이라 읽기 타임아웃을 무제한으로 두고, 내부 WAS 간 인증은 별도 프록시 토큰 헤더로
                    처리합니다. 릴레이 쪽은 폴링이 아니라 장기 SSE 연결이라 트래픽/요청 수도 최소화됩니다.
                  </p>
                  <CodeBlock
                    filename="AdmServerLogController.java"
                    language="java"
                    code={crossWasRelayCode}
                  />
                </>
              ),
            },
            {
              title: '대용량 로그 꼬리 읽기 (RandomAccessFile)',
              body: (
                <>
                  <p>
                    파일 전체를 메모리에 올리지 않고, <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      RandomAccessFile
                    </code>로 끝부분 N바이트만 읽어 역순으로 라인을 뽑습니다. 레벨·키워드 필터링이 걸리면 필터 후
                    남는 줄이 요청한 수에 도달할 때까지 더 큰 윈도우(512KB)를 읽도록 자동 확장합니다. 이어보기는{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      offset
                    </code>을 반환해 프론트에서 무한 스크롤로 연결합니다.
                  </p>
                  <CodeBlock filename="AdmServerLogController.java" language="java" code={tailReadCode} />
                </>
              ),
            },
            {
              title: '다중 인증 — 내부 프록시 / 관리자 / IP / 비밀번호',
              body: (
                <>
                  <p>
                    로그는 민감 정보를 포함할 수 있어 접근 통제를 겹쳐 두었습니다. 내부 WAS 간 통신은 프록시 토큰으로
                    가볍게 통과시키고, 외부 사용자는 관리자 권한 + IP 화이트리스트 + 2차 비밀번호를 모두 통과해야
                    합니다. 이 중 하나라도 실패하면 바로 403/401로 차단됩니다.
                  </p>
                  <CodeBlock filename="AdmServerLogController.java" language="java" code={securityCode} />
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
              title: '"부산까지 가야 하는" 제약이 사라짐',
              detail:
                '장애 조사를 할 때 "부산 PC 앞에 누구 있나요"를 묻지 않아도 되는 구조가 됐습니다. 서울에서 작업 중이어도 관리자 로그인만 하면 바로 실시간 로그를 붙여 볼 수 있어서, 대응 속도가 체감될 만큼 빨라졌습니다.',
            },
            {
              title: '두 노드를 한 화면에서 교차 확인',
              detail:
                'Cross-WAS 릴레이 덕분에 접속한 노드와 무관하게 대상 WAS를 고를 수 있어, "내가 어느 노드에 붙었지?"를 고민할 필요가 없어졌습니다. 나중에 3노드 이상으로 확장돼도 같은 패턴으로 붙일 수 있습니다.',
            },
            {
              title: 'SSE가 운영 관점에서도 맞는 선택이었음',
              detail:
                '폴링으로 갔으면 로그 뷰어가 access log를 끝없이 쌓아 본 로그를 덮는 역설이 생길 뻔했습니다. 장기 연결 한 번이면 되는 SSE의 장점을 "기능" 관점 말고 "운영 로그를 어지럽히지 않는" 관점에서 체감한 사례였습니다.',
            },
            {
              title: '지금은 tail-only, 이후 로드맵',
              detail:
                '중앙 로그 수집(ELK/Loki 등)이 도입되면 이 뷰어의 역할 일부는 대체될 수 있습니다. 다만 그때까지의 "부산 의존"을 확실히 줄였다는 점만으로도 값어치는 있었다고 봅니다. 중앙 수집이 들어오더라도 운영자가 WAS에 바로 붙어서 보고 싶을 때 쓸 수 있는 경로로는 그대로 남을 수 있습니다.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="log-viewer" all={cases} />
    </main>
  );
}

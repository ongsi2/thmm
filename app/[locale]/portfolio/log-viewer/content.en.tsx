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

const sseLocalCode = `// SSE local file streaming — server pushes over a single connection
response.setContentType("text/event-stream");
response.setCharacterEncoding("UTF-8");
response.setHeader("Cache-Control", "no-cache");
response.setHeader("Connection", "keep-alive");
response.setHeader("X-Accel-Buffering", "no"); // Prevent Nginx proxy buffering
response.flushBuffer();

PrintWriter writer = response.getWriter();
long position = lastPosition;
long startTime = System.currentTimeMillis();
long maxDuration = 10 * 60 * 1000L; // 10-minute timeout
int idleCount = 0;

while (!writer.checkError()) {
    if (System.currentTimeMillis() - startTime > maxDuration) {
        writer.write("event: timeout\\ndata: {\\"message\\":\\"Connection closing after 10 minutes.\\"}\\n\\n");
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
        position = 0; // Log rotation detected → restart from the beginning
    } else {
        idleCount++;
        if (idleCount >= 30) {  // 30s idle → heartbeat
            writer.write(": heartbeat\\n\\n");
            writer.flush();
            idleCount = 0;
        }
    }
    Thread.sleep(1000);
}`;

const crossWasRelayCode = `// Cross-WAS SSE relay — long-lived connection to the remote WAS's stream.do, forwarded line by line
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
        conn.setRequestProperty(PROXY_TOKEN_HEADER, token); // Auth between internal WAS nodes
        conn.setRequestProperty("Accept", "text/event-stream");
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(0); // SSE long connection — no read timeout

        // Forward SSE event lines verbatim — flush on blank lines
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(conn.getInputStream(), UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null && !writer.checkError()) {
                writer.write(line + "\\n");
                if (line.isEmpty()) writer.flush();
            }
        }
    } catch (Exception e) {
        writer.write("event: error\\ndata: {\\"message\\":\\"Remote streaming error\\"}\\n\\n");
        writer.flush();
    } finally {
        if (conn != null) conn.disconnect();
    }
}`;

const tailReadCode = `// Read the file tail in reverse — pull only the last N lines without loading the whole thing
private Map<String, Object> readLogTail(File file, long fromOffset,
        int lineCount, String level, String keyword) throws Exception {
    List<String> resultLines = new ArrayList<>();

    try (RandomAccessFile raf = new RandomAccessFile(file, "r")) {
        long fileLength = raf.length();
        long readEnd = (fromOffset > 0 && fromOffset < fileLength) ? fromOffset : fileLength;

        // When filtering, read a larger window (until lineCount lines remain after filter)
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
    return result; // lines + offset (for hasMore calc) + fileSize
}`;

const securityCode = `// Layered auth — internal proxy / admin role / IP / password
private ModelAndView checkSecurity(HttpServletRequest request) {
    // 1) Internal WAS-to-WAS traffic passes with just the proxy token
    String proxyToken = request.getHeader(PROXY_TOKEN_HEADER);
    if (StringUtils.isNotBlank(proxyToken)) {
        String configToken = getProperty("server.log.proxy.token");
        if (proxyToken.equals(configToken)) return null;
        return jsonForm.modelAndViewJson("403", "Invalid proxy token", null);
    }

    // 2) External users must be logged in as admin
    if (!isAdminLoggedIn()) {
        return jsonForm.modelAndViewJson("403", "Admin login required", null);
    }
    // 3) IP whitelist (optional)
    if (!isAllowedIp(request)) {
        return jsonForm.modelAndViewJson("403", "IP not allowed", null);
    }
    // 4) Secondary password auth (separate modal on viewer entry)
    if (!isAuthenticated(request)) {
        return jsonForm.modelAndViewJson("401", "Authentication required", null);
    }
    return null;
}`;

export default function LogViewerContentEn() {
  return (
    <main>
      <CaseHero
        organization={organizations['kimst-bdbis']}
        category="DEVOPS / OBSERVABILITY"
        title="SSE + Cross-WAS Real-time Log Viewer"
        subtitle="The WAS was in the Daejeon IDC, but network segregation policy meant the only PCs that could reach it were at the Busan office. So checking a log basically required making the trip down to Busan. I built a viewer that streams WAS logs in real time over the web, and added a Cross-WAS relay so logs across the two nodes all show up in a single screen."
        meta={[
          { label: 'Access constraint', value: 'Busan PC ONLY', hint: 'Daejeon WAS → Busan PC only' },
          { label: 'Transport', value: 'SSE', hint: 'Cleaner access logs than polling' },
          { label: 'Multi-node', value: 'Cross-WAS relay', hint: 'Independent of connected WAS' },
          { label: 'Auth', value: '4-layer', hint: 'Admin / IP / PW / internal token' },
        ]}
        stack={[
          'Spring MVC',
          'Server-Sent Events',
          'RandomAccessFile',
          'HttpURLConnection',
          'Proxy Token',
          'JEUS (2 nodes)',
          'eGovFrame',
        ]}
      />

      <CaseSection
        eyebrow="Problem"
        title="Checking a log meant going to Busan"
        accent="problem"
      >
        <p>
          The WAS lives in the <strong>Daejeon IDC</strong>. Under the network segregation policy, the only PCs allowed to
          connect to it were at <strong>a single Busan office</strong>. That made the official access path literally "travel
          to the Busan office → sit at a designated PC → SSH into the Daejeon WAS from there." If I was working in Seoul
          and needed to see a log, my options were two — take the trip down to Busan, or ping someone in Busan to
          "please grab me the logs for this exact window." When an incident hit, decisions had to happen minute by minute,
          but before anything could move, a messenger thread asking "who's in front of the Busan PC right now?" had to
          go around first.
        </p>
        <p>
          On top of that, the WAS was split across two nodes, so tracing the cause of an incident often meant
          cross-checking both servers. Opening two SSH windows on the Busan PC and flipping between Daejeon WAS 1 and
          WAS 2 was the default routine, and asking Busan for a remote favor was the other half of the loop.
        </p>
        <p>
          At first I considered a simple polling-based viewer that mimicked tail, but this time <em>the log viewer itself
          would pile up so many access log entries</em> that it would drown the original logs it was meant to show.
          Reading the whole log file on every request wasn't an option either — the files were simply too large.
        </p>
        <InsightList
          items={[
            {
              title: 'Only Busan PCs could reach the Daejeon WAS',
              detail:
                'Network segregation blocked direct SSH from Seoul or Daejeon. To see a log, someone had to go to Busan, or ask the Busan staffer every single time.',
            },
            {
              title: 'Cross-checking multi-WAS nodes',
              detail:
                'With the WAS split across two boxes, looking at just one often wasn\'t enough. Two SSH windows on the Busan PC, flipping between WAS 1 and WAS 2, was the baseline setup.',
            },
            {
              title: 'Polling pollutes the access log',
              detail:
                'A short-interval polling loop mimicking tail would flood the access log with endless viewer requests — the viewer itself becomes a noise source that buries the real logs.',
            },
            {
              title: 'Can\'t read a huge file end-to-end every request',
              detail:
                'Log files running tens of MB to GB meant loading the whole thing per request would blow up both memory and response time. I needed a way to read only the exact tail window.',
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Approach" title="Pull it into the admin web — SSE + Cross-WAS relay" accent="approach">
        <p>
          The core idea was simple. The only pre-approved path to the server ran through the Badabom{' '}
          <strong>admin web management tools</strong>, so the log viewer should live inside that too. The admin web
          already operated within Badabom's internal network, so existing access paths were reusable, and admins could
          use it from Seoul or Busan as long as they could log in.
        </p>
        <p>
          Real-time delivery was handled with <strong>SSE (Server-Sent Events)</strong>. Polling would have turned the
          viewer into a log-noise source, so a single long-lived connection with the server pushing data was the right
          fit. The multi-node problem was solved with a <strong>Cross-WAS SSE relay</strong> — if I'm connected to WAS 1
          but want to see WAS 2's logs, WAS 1 opens its own SSE connection to WAS 2's stream.do and forwards every event
          it receives straight back to the client. The user just flips a node switch and doesn't need to care which node
          they landed on.
        </p>
        <p>
          For large log files I used <strong>RandomAccessFile</strong> to read from the end in reverse, pulling only the
          tail N lines without any memory pressure. When log rotation shrinks the file length, the code detects that and
          resets position to 0 as well.
        </p>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-[var(--color-border)] rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--color-border)]">
              <p className="font-mono text-[11px] font-semibold text-[var(--color-text-muted)] tracking-[0.2em]">
                LOCAL READ
              </p>
              <p className="font-mono text-[11px] text-[var(--color-text-muted)]">Connected WAS = target</p>
            </div>
            <ArchStack
              boxes={[
                { title: 'Admin Browser', subtitle: 'EventSource' },
                {
                  title: 'WAS 1',
                  subtitle: '/adm/sys/log/stream.do',
                  bullets: ['SSE connection opened', 'readLogForward loop'],
                  tone: 'accent',
                },
                {
                  title: 'log file (WAS 1)',
                  subtitle: '/logs/badabom.log',
                  bullets: ['RandomAccessFile', 'Read from the tail'],
                },
              ]}
              edges={[{ label: 'SSE · single connection' }, { label: 'File I/O' }]}
            />
          </div>

          <div className="p-6 bg-white border border-[var(--color-accent)]/30 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--color-accent)]/20">
              <p className="font-mono text-[11px] font-semibold text-[var(--color-accent)] tracking-[0.2em]">
                CROSS-WAS RELAY
              </p>
              <p className="font-mono text-[11px] text-[var(--color-accent-dark)]">Connected WAS ≠ target</p>
            </div>
            <ArchStack
              boxes={[
                { title: 'Admin Browser', subtitle: 'EventSource' },
                {
                  title: 'WAS 1',
                  subtitle: '/adm/sys/log/stream.do',
                  bullets: ['Detect wasNode=2', 'Open remote stream.do'],
                  tone: 'accent',
                },
                {
                  title: 'WAS 2',
                  subtitle: '/adm/sys/log/stream.do',
                  bullets: ['PROXY_TOKEN validation', 'Send SSE stream'],
                  tone: 'accent',
                },
                {
                  title: 'log file (WAS 2)',
                  subtitle: '/logs/badabom.log',
                  bullets: ['RandomAccessFile'],
                },
              ]}
              edges={[
                { label: 'SSE · single connection' },
                { label: 'SSE relay · internal token' },
                { label: 'File I/O' },
              ]}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-8">
          {[
            { t: 'Why SSE', d: 'Cleaner access logs than polling — the viewer itself stops being a noise source' },
            { t: 'Cross-WAS', d: 'See logs of a WAS you\'re not even connected to, all on one screen — no SSH juggling' },
            { t: 'Windowed Tail', d: 'Read only the last N bytes with RandomAccessFile — safe for huge files' },
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
              title: 'SSE stream — 10-minute timeout + heartbeat',
              body: (
                <>
                  <p>
                    I open the SSE response with the{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      text/event-stream
                    </code>{' '}
                    header and check for file changes every second to push new lines. A 10-minute timeout prevents stale
                    zombie connections from hanging around, and a single-line comment heartbeat is emitted on 30 seconds
                    of idle so intermediate proxies don't tear the connection down. If the file size shrinks, I treat it
                    as a rotation and reset position to 0.
                  </p>
                  <CodeBlock filename="AdmServerLogController.java" language="java" code={sseLocalCode} />
                </>
              ),
            },
            {
              title: 'Cross-WAS SSE relay',
              body: (
                <>
                  <p>
                    When the target node is a different WAS, the current WAS attaches to that node's{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      stream.do
                    </code>
                    {' '}as an SSE client and forwards each line straight to its own output stream. The key is{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      setReadTimeout(0)
                    </code>{' '}
                    — because SSE is a long-lived connection, the read timeout is unlimited, and auth between internal
                    WAS nodes is handled via a dedicated proxy token header. Since the relay is a long SSE connection
                    rather than polling, traffic and request counts stay minimal too.
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
              title: 'Reading large log tails (RandomAccessFile)',
              body: (
                <>
                  <p>
                    Instead of loading the whole file into memory, I use{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      RandomAccessFile
                    </code>{' '}
                    to read the last N bytes and pull lines in reverse order. When level or keyword filters are applied,
                    the window auto-expands to a larger buffer (512KB) until enough post-filter lines reach the requested
                    count. Continuation is wired up with an{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">
                      offset
                    </code>{' '}
                    returned to the client, which the frontend uses to drive infinite scroll.
                  </p>
                  <CodeBlock filename="AdmServerLogController.java" language="java" code={tailReadCode} />
                </>
              ),
            },
            {
              title: 'Layered auth — internal proxy / admin / IP / password',
              body: (
                <>
                  <p>
                    Logs can contain sensitive data, so access control is stacked. Internal WAS-to-WAS traffic passes
                    lightly with just a proxy token, while external users must clear admin role + IP whitelist +
                    secondary password, all four. Failing any one of them returns 403/401 immediately.
                  </p>
                  <CodeBlock filename="AdmServerLogController.java" language="java" code={securityCode} />
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
              title: 'The "trip to Busan" constraint is gone',
              detail:
                'Incident triage no longer starts with "is anyone at the Busan PC right now?" Even when I\'m working from Seoul, a single admin login gets me streaming logs in real time, and the response speed shift is visibly faster.',
            },
            {
              title: 'Cross-checking both nodes on one screen',
              detail:
                'Thanks to the Cross-WAS relay, the target WAS can be picked independently of which node the user connected to, so "which node am I on again?" simply stops being a question. If this scales out to 3+ nodes later, the same pattern plugs right in.',
            },
            {
              title: 'SSE was the right call from an ops perspective too',
              detail:
                'If I had gone with polling, the log viewer would have piled access log entries endlessly and buried the real logs — the very paradox I was trying to avoid. This project made me feel the value of SSE not just as a "feature" choice but as "don\'t pollute the operator\'s logs."',
            },
            {
              title: 'Currently tail-only; roadmap ahead',
              detail:
                'When central log aggregation (ELK/Loki and friends) lands, parts of this viewer\'s role could be absorbed by that. Even so, meaningfully cutting the "Busan dependency" until then was worth it on its own. And even after central aggregation arrives, this stays useful as the direct-to-WAS path operators can still reach for when they want to see raw logs at the source.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="log-viewer" all={cases} />
    </main>
  );
}

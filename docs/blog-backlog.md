# 블로그 글감 백로그

`docs/writing-style.md` 의 발행 기준 — **"이걸 검색해서 들어올 사람이 있나?"** — 을 통과한 것만 적는다.
쓰고 나면 지우지 말고 `✅ 2026-08-07` 처럼 발행일을 붙인다. 뭘 이미 다뤘는지가 다음 글감을 정한다.

두 축으로 나눈다.

- **A. 한국 특화** — JEUS·WebtoB·eGovFrame·전자정부표준처럼 **국내에서만 쓰는데 한국어 자료가 벤더 문서뿐인** 주제.
  검색량은 적지만 경쟁이 거의 없고, 막힌 사람에게는 대체재가 없다. 지금 케이스 스터디에 유입이 붙는 이유도 이것이다.
- **B. 일반** — 프레임워크·언어·도구. 검색량은 크지만 경쟁도 크다. **직접 겪은 삽질**이 있을 때만 쓴다.
  공식 문서 요약은 안 쓴다(기준 위반).

우선순위는 `직접 겪었나 × 한국어 자료가 없나` 로 매긴다. 둘 다 O 면 최우선.

---

## A. 한국 특화 — 우선순위 높음

이 영역은 **겪어본 사람이 쓴 글 자체가 거의 없다.** 가장 강한 카드.

| 주제 | 타깃 검색어 | 근거 | 타입 |
|---|---|---|:-:|
| JEUS Standard에서 세션 클러스터링이 안 될 때 | `JEUS 세션 클러스터링`, `JEUS Standard 라이선스 제한` | 실제로 Redis 외부 저장소로 우회. 케이스 스터디 있음 | note |
| WebtoB 공용 SSL을 안 건드리고 TLS 1.3 적용하기 | `WebtoB TLS 1.3`, `WebtoB SSL 설정` | Nginx 앞단 종단으로 해결. 다중 JEUS 컨테이너 공유 문제 포함 | note |
| iBATIS 2.0에는 없는 MyBatis 3 문법, 뭘로 대체하나 | `iBATIS 2.0 MyBatis 차이`, `iBATIS dynamic SQL` | 87 URL 이관하며 우회 패턴 정립 | note |
| Oracle 전용 SQL을 PostgreSQL로 옮길 때 걸리는 것들 | `ROWNUM PostgreSQL`, `CONNECT BY 대체`, `DECODE PostgreSQL` | 80+ SQL 재작성 실측 | note |
| SiteMesh 데코레이터를 리맵하지 않고 개조하는 법 | `SiteMesh3 데코레이터`, `sitemesh 매핑` | 106 매핑 무수정 재사용 | note |
| eGovFrame에서 상용 그리드 걷어내기 | `전자정부 프레임워크 그리드`, `rMate 대체` | 80여 면 전환 | note |
| ~~운영은 SVN, 개발은 Git — 두 개를 같이 쓰는 법~~ | — | | ✅ 2026-08-06 |
| 망분리 환경에서 서버 로그 보는 현실적인 방법 | `망분리 로그 확인`, `SSE 실시간 로그` | 부산 의존 제거 사례 | note |
| KWCAG 2.2 — 표를 위젯으로 만들면 오히려 손해인 이유 | `KWCAG 웹접근성 grid`, `aria-sort 접근성` | 읽기=표 / 편집=위젯 이원 전략 | note |
| 공공기관 웹취약점 점검 지적사항 실제로 조치하기 | `웹취약점 조치`, `시큐어코딩 점검 사유서` | 375건 조치 경험 | note |

## A-2. 앱인토스 / 국내 플랫폼

한국어 자료가 공식 문서뿐이고, **검수 반려 같은 실전 정보는 아예 없다.**

| 주제 | 타깃 검색어 | 타입 |
|---|---|:-:|
| ~~앱인토스 검수 반려 사유~~ | — | ✅ 2026-08-05 |
| 앱인토스 미니앱에 Supabase 익명 인증 붙이기 | `앱인토스 Supabase`, `미니앱 익명 로그인` | note |
| TDS를 안 쓰면 검수에서 걸리는 이유 | `토스 디자인 시스템 검수`, `TDS mobile` | link |
| 미니앱에서 localStorage 우선 dual-write 패턴 | `미니앱 오프라인 대응` | note |
| 키움 REST API로 시세 받아오기 (모의 → 실전 전환) | `키움 REST API`, `키움 오픈API 토큰` | note |
| 카카오 로컬 API 키워드 장소검색 실사용 메모 | `카카오 로컬 API 장소검색` | link |

## B. 일반 — 직접 겪은 것만

| 주제 | 타깃 검색어 | 근거 | 타입 |
|---|---|---|:-:|
| ~~Next.js Docker standalone 안 써도 되는 경우~~ | — | | ✅ 2026-08-06 |
| `ssh -i` 는 그 키만 쓰겠다는 뜻이 아니다 | `ssh IdentitiesOnly`, `ssh -i 키 안 먹힘` | GitHub Actions 배포에서 실제로 물릴 뻔함 | note |
| GitHub Actions에서 known_hosts 제대로 넣기 | `known_hosts GitHub Actions`, `Host key verification failed` | 비표준 포트일 때 `[host]:port` 형식 함정 | note |
| compose가 소유한 컨테이너를 docker run으로 갈아치우면 | `docker compose 컨테이너 교체`, `compose up 꼬임` | 배포 스크립트를 두 번 갈아엎음 | note |
| 한국어 존댓말→평서체 일괄 변환이 어려운 이유 | `한글 종성 자바스크립트`, `한글 어미 변환` | 받침 ㅆ/ㅂ 판별, 습니다 충돌. 실제 스크립트 있음 | note |
| Next.js 16 `[locale]` 세그먼트에서 OG 이미지가 안 잡힐 때 | `next.js opengraph-image 안됨` | OZRAY에서 겪음 | note |
| Astro 스크롤 프레임 애니메이션 용량 줄이기 | `Astro canvas 스크롤 애니메이션` | 8.7MB → 감량 과제 | note |
| DKIM selector 모르고 DNS 옮기면 메일이 스팸된다 | `DKIM selector 확인`, `DNS 이전 메일` | 실제로 사고 직전에 멈춤 | note |
| gray-matter의 `date` 를 그대로 쓰면 하루가 밀린다 | `gray-matter date timezone` | 이 블로그 만들며 겪음 | link |

## C. 아직 안 겪은 것 — 쓰려면 먼저 해봐야 함

써두되 **경험 없이는 쓰지 않는다.** 기준 위반이다.

- Spring Boot 3 / Java 21 가상 스레드 — 실무 적용 후
- PostgreSQL 파티셔닝 · 인덱스 튜닝 — 실측 후
- Vercel AI Gateway, MCP 서버 직접 만들기 — 붙여본 뒤

---

## 쓰는 순서 제안

1. **A 그룹부터.** 경쟁이 없어서 같은 노력 대비 유입이 가장 빨리 붙는다.
2. A 하나 쓰고 B 하나 쓰는 식으로 섞는다. A만 쓰면 독자층이 공공 SI로 좁아진다.
3. 케이스 스터디와 겹치는 주제는 **짧게, 다른 각도로** 쓴다.
   케이스 스터디는 "내가 이걸 했다", 블로그는 "이거 이렇게 하면 된다".
   같은 소재라도 독자가 다르다.

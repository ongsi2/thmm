---
title: Next.js를 Docker로 배포할 때 standalone을 안 써도 되는 경우
date: 2026-08-06
type: note
summary: 런타임 이미지에 .next와 public만 넣고도 앱이 도는 이유, 그리고 그게 언제 깨지는지. 소스를 안 넣었는데 i18n 메시지가 나오는 게 우연이 아니다.
tags: [Next.js, Docker, 배포]
---

Next.js를 컨테이너에 올릴 때 흔히 `output: 'standalone'`을 켜라고 한다. 맞는 조언이지만,
안 켜고도 잘 도는 구성이 있다. 이 사이트가 그렇게 돌아가고 있어서 왜 되는지 정리해 둔다.

## 런타임 스테이지에 뭘 넣고 있나

멀티스테이지 빌드의 두 번째 스테이지가 이것만 복사한다.

```dockerfile
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
```

`app/`, `messages/`, `i18n/` 같은 소스는 안 들어간다. 그런데 다국어 메시지도 나오고
페이지 본문도 멀쩡히 뜬다. 처음 보면 좀 이상하다.

## 이유: 서버 컴포넌트는 이미 번들돼 있다

App Router에서 서버 컴포넌트는 빌드 시점에 `.next/server/` 아래 청크로 컴파일된다.
소스 파일은 런타임에 다시 읽히지 않는다. `next start`가 필요로 하는 건 `.next`,
`public`, 설정 파일, 그리고 `node_modules`뿐이다.

`next-intl` 설정이 이렇게 생겼는데,

```ts
messages: (await import(`../messages/${locale}.json`)).default,
```

템플릿 리터럴이지만 **디렉토리가 정적으로 결정된다.** 번들러가 `messages/` 아래 후보를
전부 포함하는 컨텍스트 모듈을 만들어 준다. 그러니까 JSON도 청크 안으로 들어간다.
확인은 간단하다.

```bash
grep -rl "포트폴리오" .next/server | head
# .next/server/chunks/ssr/messages_ko_json_aa72aef8._.js
```

파일이 나오면 번들에 들어간 것이고, 소스를 이미지에 안 넣어도 된다.

## 그럼 언제 깨지나

**런타임에 `fs`로 파일을 읽는 순간 깨진다.** 이 블로그가 정확히 그 케이스다.
마크다운을 `content/posts/`에서 읽는데, 이건 번들 대상이 아니라 진짜 디스크 접근이다.
게다가 `next-intl` 미들웨어를 쓰면 라우트가 대부분 동적(`ƒ`)으로 잡혀서, 빌드 때가 아니라
**요청 때** 파일을 읽는다.

빌드 출력에서 라우트 앞 기호를 보면 된다.

| 기호 | 의미 | fs 접근 시점 |
|:-:|---|---|
| `○` | 정적 프리렌더 | 빌드 때만 — 이미지에 파일 없어도 됨 |
| `ƒ` | 요청 시 서버 렌더 | 요청마다 — **이미지에 파일이 있어야 함** |

그래서 한 줄을 추가했다.

```dockerfile
COPY --from=builder /app/content ./content
```

`public/`처럼 정적으로 서빙되는 것도 아니고, 번들에 딸려 들어가지도 않는다.
명시적으로 넣는 수밖에 없다.

## 덤: 중복 `-p` 플래그

`package.json`의 start 스크립트가 이미 포트를 박고 있는데 Dockerfile에서 또 준다.

```json
{ "scripts": { "start": "next start -p 5000" } }
```

```dockerfile
CMD ["npm", "start", "--", "-p", "3002"]
```

최종 명령은 `next start -p 5000 -p 3002`가 된다. 충돌처럼 보이지만
**뒤쪽이 이긴다.** 직접 확인해 보면 된다.

```
$ npm start -- -p 3902
   - Local:  http://localhost:3902
 ✓ Ready in 1008ms
```

`EXPOSE`와 맞는지 헷갈릴 때가 있는데, 헷갈리면 그냥 띄워서 로그를 보는 게 제일 빠르다.

## 정리

- 서버 컴포넌트·i18n 메시지처럼 **번들되는 것**은 소스를 이미지에 안 넣어도 된다
- **런타임에 디스크를 읽는 것**은 반드시 복사해야 한다. 라우트가 `ƒ`면 더더욱
- 애매하면 `grep -rl "아는 문자열" .next/server`로 번들 포함 여부를 직접 확인한다

standalone을 쓰면 이런 걸 안 따져도 되니까 새로 만든다면 그쪽이 낫다.
다만 이미 도는 구성을 굳이 갈아엎을 이유는 없고, 왜 되는지는 알고 있어야 한다.

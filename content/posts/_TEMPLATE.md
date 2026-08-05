---
title: 제목을 여기에
date: 2026-01-01
type: note
summary: 목록과 검색 결과에 뜨는 한두 문장. 이게 사실상 메타 description이라 대충 쓰면 손해다.
tags: [태그1, 태그2]
draft: true
---

`_`로 시작하는 파일은 글로 잡히지 않는다. 새 글은 이 파일을 복사해서 쓴다.

```bash
cp content/posts/_TEMPLATE.md content/posts/2026-08-06-슬러그.md
```

## frontmatter 규칙

| 필드 | 필수 | 설명 |
|---|:-:|---|
| `title` | O | 글 제목. `<h1>`으로 자동 렌더되므로 본문에 `#` 다시 쓰지 말 것 |
| `date` | O | `YYYY-MM-DD`. 정렬 기준 |
| `type` | O | `note`(기술 노트) 또는 `link`(소식·메모) |
| `summary` | O | 목록·OG·RSS에 그대로 쓰인다 |
| `tags` | | 배열. 관련 글 추천에 쓰인다 |
| `draft` | | `true`면 목록·sitemap·RSS에서 빠진다. URL 직접 접근은 됨 |

파일명이 곧 URL이다. `2026-08-06-jeus-session.md` → `/blog/2026-08-06-jeus-session`.
영문·숫자·하이픈만 쓸 것 (한글 슬러그는 막아뒀다).

## 본문에서 쓸 수 있는 것

GFM 전부 — 표, 체크박스, 취소선, 각주. 코드 블록은 언어를 적으면 하이라이팅된다.

```java
public class Example {
    // 주석은 흐리게 처리된다
    private static final String NAME = "badabom";
}
```

`##` 이하 heading에는 앵커 링크가 자동으로 붙는다.

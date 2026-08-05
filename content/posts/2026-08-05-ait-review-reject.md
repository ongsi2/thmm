---
title: 앱인토스 검수에서 반려당한 이유가 코드가 아니었던 건
date: 2026-08-05
type: link
summary: 미니앱 검수 반려 사유가 brand.icon 빈 문자열과 displayName 불일치. 제출 전에 granite.config.ts와 콘솔 등록값을 1:1로 맞춰보는 게 사실상 필수 절차다.
tags: [앱인토스, 미니앱, 검수]
---

토스 앱인토스에 미니앱을 올리면서 한 번 반려당했는데, 사유가 기능이나 코드가 아니었다.

- `brand.icon`이 빈 문자열
- `brand.displayName`이 `"귀여워"`인데 콘솔 등록명은 `"난귀여워"`

둘 다 `granite.config.ts` 한 파일 안에 있고, 콘솔 화면 열어서 눈으로 비교하면
30초면 잡히는 것들이다. 그걸 안 해서 검수 사이클을 한 번 더 돌았다.

```ts
export default defineConfig({
  appName: 'im-so-cute',        // 콘솔 등록 식별자와 100% 일치. 첫 등록 후 수정 불가
  brand: {
    displayName: '난귀여워',     // 콘솔 등록명과 글자 단위로 일치
    primaryColor: '#FF91D5',
    icon: 'https://static.toss.im/appsintoss/.../....png',  // 업로드 후 받은 CDN URL
  },
});
```

특히 `appName`은 **콘솔에 처음 등록하고 나면 못 고친다.** 폴더명과 다르게 잡아 놓고
나중에 헷갈리는 경우가 있는데(내 경우 폴더는 `share-watermelon`, appName은 `bakbak`),
config에 주석으로 박아두는 편이 안전하다.

그래서 제출 전 체크리스트에 이 세 줄을 고정으로 넣었다.

- [ ] `appName` == 콘솔 등록 식별자
- [ ] `brand.displayName` == 콘솔 등록명 (띄어쓰기까지)
- [ ] `brand.icon` == 콘솔에 업로드한 아이콘의 CDN URL (빈 문자열 아님)

검수는 사람이 본다. 기능이 아무리 멀쩡해도 이름이 안 맞으면 그 지점에서 멈춘다.

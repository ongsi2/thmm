---
title: 앱인토스 검수에서 반려당한 이유가 코드가 아니었던 건
date: 2026-08-05
type: link
summary: 3주짜리 미니앱이 이름 두 글자 때문에 멈췄다. granite.config.ts와 콘솔 등록값을 눈으로 대조하는 30초를 안 써서 검수 사이클을 한 번 더 돌았다.
tags: [앱인토스, 미니앱, 검수]
---

검수 반려 메일이 왔다.

3주를 쏟은 앱이었다. 녹음, 채점, 피드, 공유까지 다 붙였고 테스트도 돌렸다.

사유를 열었다. 코드 얘기는 한 줄도 없었다.

이름이 틀렸다고 했다.

## 뭐가 틀렸나

`granite.config.ts`의 `brand.displayName`이 `"귀여워"`였다. 콘솔에 등록한 이름은 `"난귀여워"`. 한 글자.

`brand.icon`은 빈 문자열이었다. 아이콘을 업로드해서 CDN URL을 받아놓고, 그걸 코드에 박는 걸 잊었다.

둘 다 같은 파일 안에 있다. 콘솔 화면을 옆에 띄우고 눈으로 훑으면 30초다. 그걸 안 해서 사이클을 한 번 더 돌았다.

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

## `appName`은 더 무섭다

`displayName`은 틀려도 고치면 그만이다. `appName`은 **콘솔에 처음 등록하고 나면 못 바꾼다.**

폴더명과 다르게 잡아놓고 나중에 헷갈리는 경우가 있다. 내 경우 폴더는 `share-watermelon`인데 `appName`은 `bakbak`이다.

지금은 기억한다. 반 년 뒤의 나는 아니다. 그래서 config에 주석으로 박아뒀다.

## 제출 전 30초

체크리스트에 이 세 줄을 고정으로 넣었다.

- [ ] `appName` == 콘솔 등록 식별자
- [ ] `brand.displayName` == 콘솔 등록명 (띄어쓰기까지)
- [ ] `brand.icon` == 업로드한 아이콘의 CDN URL (빈 문자열 아님)

검수는 사람이 본다. 기능이 아무리 멀쩡해도 이름이 안 맞으면 거기서 멈춘다.

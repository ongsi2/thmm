// 케이스 스터디 ko 본문의 존댓말 → 평서체 변환.
// 코드 리터럴(const X = `...`;) 구간은 실제 소스라 절대 건드리지 않는다.
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const DIR = 'app/[locale]/portfolio';

// 한글 음절의 종성이 ㅆ 인가 (됐/갔/났/뒀/봤/썼… = 과거형 축약)
// 종성 인덱스 20 == ㅆ
const jong = (ch) => {
  const code = ch.charCodeAt(0) - 0xac00;
  return code >= 0 && code <= 11171 ? code % 28 : -1;
};
const hasSsang = (ch) => jong(ch) === 20; // ㅆ — 과거형 축약 (됐/갔/뒀)
const hasBieup = (ch) => jong(ch) === 17; // ㅂ — 합니다/뜹니다/뚫립니다 형태

// 종성 ㅂ 을 ㄴ 으로 갈아끼운다. 합→한, 뜹→뜬, 립→린
const bieupToNieun = (ch) =>
  String.fromCharCode(ch.charCodeAt(0) - 0xac00 - 17 + 4 + 0xac00);

const RULES = [
  // 과거형(종성 ㅆ) + 습니다/어요 → 다.  됐습니다→됐다, 사라졌어요→사라졌다
  [
    /([가-힣])(습니다|어요)/g,
    (m, ch, tail) => (hasSsang(ch) ? ch + '다' : m),
  ],
  // 과거형 어간 + 습니다
  [/(했|았|었|였)습니다/g, '$1다'],
  // 존재사 · 형용사
  [/(있|없|같|좋|많|적|낫|맞|옳|짙|옅|늦|이르)습니다/g, '$1다'],
  // 부정
  [/않습니다/g, '않는다'],
  [/못합니다/g, '못한다'],
  // 하다 · 되다 · 이다
  [/합니다/g, '한다'],
  [/됩니다/g, '된다'],
  [/겁니다/g, '것이다'],
  // ── 입니다 ──────────────────────────────────────────────────────────
  // 대부분은 조사(명사+입니다)지만 동사 활용도 섞인다. 전수 조사 결과
  // 이 문서들에서 동사는 '보입니다' 하나뿐이라 먼저 빼고 간다.
  [/보입니다/g, '보인다'],
  // 조사: 앞 명사에 받침이 있으면 '이다', 없으면 '다'.
  // 붕괴입니다 → 붕괴다 (O) / 붕괴이다 (X),  조건입니다 → 조건이다 (O)
  [
    /([가-힣])입니다/g,
    (m, ch) => (jong(ch) === 0 ? ch + '다' : ch + '이다'),
  ],
  [/([0-9])입니다/g, '$1이다'],
  [/(["'”])입니다/g, '$1다'],
  // ㅂ니다 일반형: 종성 ㅂ 을 ㄴ 으로 바꾸고 니다 → 다
  // 합니다→한다, 뜹니다→뜬다, 뚫립니다→뚫린다, 아닙니다→아닌다(X) 는 아래서 별도 처리
  [/아닙니다/g, '아니다'],
  [
    /([가-힣])니다/g,
    // '습'은 그 자체가 받침 ㅂ이라 여기 걸리면 '받습니다 → 받슨다'가 된다.
    // 습니다는 아래 전용 규칙에서 처리하므로 여기선 건너뛴다.
    (m, ch) => (ch !== '습' && hasBieup(ch) ? bieupToNieun(ch) + '다' : m),
  ],
  // ㅂ불규칙 형용사
  [/(어렵|쉽|가깝|무겁|가볍|좁|넓|밉|춥|덥)습니다/g, '$1다'],
  // 받침 있는 동사 어간 + 습니다 → 는다
  [/(덮|막|뽑|닫|믿|숨|씻|참|맡|묻|받|붙|남|먹|얻|잡|찾|앉|늘|줄|읽|씹|엮)습니다/g, '$1는다'],
  // 요체
  [/(했|았|었|였)어요/g, '$1다'],
  [/있어요/g, '있다'],
  [/없어요/g, '없다'],
  [/아니에요/g, '아니다'],
  [/(하|되|드|나|가|오)네요/g, '$1다'],
  [/거죠/g, '것이다'],
  [/([가-힣])예요/g, '$1다'],
  [/([가-힣])죠(?=[.,\s])/g, '$1다'],
  // 연결어미 존댓말: ~고요 / ~는데요 / ~지요
  [/고요(?=[.,\s])/g, '고'],
  [/는데요(?=[.,\s])/g, '는데'],
  [/지요(?=[.,\s])/g, '지'],
];

const files = [
  ...fs.readdirSync(DIR).map((d) => path.join(DIR, d, 'content.ko.tsx')),
  // 케이스 요약·조직 소개는 목록 페이지와 "다른 케이스" 카드에 그대로 나온다.
  // 본문만 바꾸고 여길 빼면 같은 페이지 안에서 어미가 갈린다.
  path.join(DIR, '_components', 'cases.ts'),
  'app/_components/projects-data.tsx',
  // messages/ko.json 은 제외 — 히어로 인사·신념·UI 안내라 전부 직접 화법이다.
].filter((p) => fs.existsSync(p));

let totalChanged = 0;
const leftovers = {};

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');

  // 코드 리터럴 구간 좌표 수집
  const code = [...src.matchAll(/const\s+\w+\s*=\s*`[\s\S]*?`;/g)].map((m) => [
    m.index,
    m.index + m[0].length,
  ]);
  const inCode = (i) => code.some(([s, e]) => i >= s && i < e);

  // 코드 구간을 자리표시자로 빼두고 본문만 변환
  let out = '';
  let cursor = 0;
  let changed = 0;
  const segments = [];
  for (const [s, e] of code) {
    segments.push([cursor, s, false]);
    segments.push([s, e, true]);
    cursor = e;
  }
  segments.push([cursor, src.length, false]);

  // 존댓말 흔적 개수 — 변환 전후를 비교해 실제 변경 건수를 센다.
  const politeCount = (s) => (s.match(/[가-힣](니다|어요|예요|에요|네요|고요|는데요|지요|죠)/g) || []).length;

  for (const [s, e, isCode] of segments) {
    let chunk = src.slice(s, e);
    if (!isCode) {
      const before = politeCount(chunk);
      // 치환은 한 번만. 이전 구현은 m.replace(re, ...) 로 두 번 걸어서
      // lookahead 규칙(죠 뒤에 문장부호)이 잘린 조각에선 매칭에 실패했다.
      for (const [re, to] of RULES) chunk = chunk.replace(re, to);
      changed += before - politeCount(chunk);
    }
    out += chunk;
  }

  // 남은 존댓말 (본문 한정)
  const codeAfter = [...out.matchAll(/const\s+\w+\s*=\s*`[\s\S]*?`;/g)].map((m) => [
    m.index,
    m.index + m[0].length,
  ]);
  const inCodeAfter = (i) => codeAfter.some(([s, e]) => i >= s && i < e);
  for (const m of out.matchAll(/[가-힣]{1,5}(니다|어요|예요|에요|세요|네요|고요|는데요|지요|죠)/g)) {
    if (inCodeAfter(m.index)) continue;
    leftovers[m[0]] = (leftovers[m[0]] || 0) + 1;
  }

  if (APPLY && changed) fs.writeFileSync(file, out);
  totalChanged += changed;
  console.log(`  ${changed.toString().padStart(3)}건  ${path.basename(path.dirname(file))}`);
}

console.log(`\n총 ${totalChanged}건 변환${APPLY ? ' (적용됨)' : ' (미적용 · dry-run)'}`);
const left = Object.entries(leftovers).sort((a, b) => b[1] - a[1]);
if (left.length) {
  console.log(`\n=== 규칙으로 못 잡은 것 ${left.length}종 ===`);
  left.forEach(([k, v]) => console.log(`  ${String(v).padStart(2)} ${k}`));
} else {
  console.log('\n남은 존댓말 없음');
}

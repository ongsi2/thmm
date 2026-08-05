// 서버 전용 모듈. node:fs를 쓰므로 클라이언트 컴포넌트에서 import하면 빌드가 깨진다.
// 목록 필터 같은 클라이언트 UI에는 여기서 얻은 결과를 props로 내려보낼 것.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

/**
 * 글 종류. 목록에서 필터 탭으로 쓰이고, 상세 페이지 배지에도 노출된다.
 * - note   : 실무 트러블슈팅 · 구현 기록 (케이스 스터디의 짧은 버전)
 * - link   : 읽은 것 · 업계 소식 · 새 도구 메모
 */
export const POST_TYPES = ['note', 'link'] as const;
export type PostType = (typeof POST_TYPES)[number];

export type PostMeta = {
  slug: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  type: PostType;
  summary: string;
  tags: string[];
  /** 목록·상세에 표시할 대략적인 읽기 시간(분) */
  readingMinutes: number;
  /** true면 목록·sitemap·RSS 어디에도 안 나온다. 직접 URL 접근만 가능. */
  draft: boolean;
};

export type Post = PostMeta & {
  /** 렌더된 본문 HTML */
  html: string;
};

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

/** `_`로 시작하는 파일(_TEMPLATE.md 등)은 글이 아니라 보조 파일로 본다. */
function isPostFile(filename: string) {
  return filename.endsWith('.md') && !filename.startsWith('_');
}

function assertPostType(value: unknown, slug: string): PostType {
  if (typeof value === 'string' && (POST_TYPES as readonly string[]).includes(value)) {
    return value as PostType;
  }
  throw new Error(
    `[posts] "${slug}" 의 frontmatter type이 올바르지 않습니다. ` +
      `${POST_TYPES.join(' | ')} 중 하나여야 합니다 (받은 값: ${JSON.stringify(value)})`
  );
}

/**
 * gray-matter는 `date: 2026-08-06` 을 Date 객체로 파싱한다. 그런데 Date로 두면
 * 서버 타임존에 따라 하루가 밀려 보이는 사고가 나므로, 항상 UTC 기준 YYYY-MM-DD
 * 문자열로 정규화해서 들고 다닌다.
 */
function normalizeDate(value: unknown, slug: string): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  throw new Error(
    `[posts] "${slug}" 의 frontmatter date가 없거나 형식이 틀렸습니다. YYYY-MM-DD 형태여야 합니다.`
  );
}

function requireString(value: unknown, field: string, slug: string): string {
  if (typeof value === 'string' && value.trim() !== '') return value.trim();
  throw new Error(`[posts] "${slug}" 의 frontmatter ${field}가 비어 있습니다.`);
}

/** 한글은 공백으로 단어를 세면 과소평가돼서, 공백 제거 글자 수 기준으로 잡는다. */
function estimateReadingMinutes(markdown: string): number {
  const chars = markdown.replace(/\s/g, '').length;
  return Math.max(1, Math.round(chars / 500));
}

async function renderMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: { className: ['heading-anchor'] },
    })
    // ignoreMissing: 등록 안 된 언어(예: ```text)가 와도 빌드를 깨지 않고 그냥 넘긴다.
    .use(rehypeHighlight, { detect: false, ignoreMissing: true })
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}

function readPostFile(slug: string) {
  const fullPath = path.join(POSTS_DIR, `${slug}.md`);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(raw);

  const meta: PostMeta = {
    slug,
    title: requireString(data.title, 'title', slug),
    date: normalizeDate(data.date, slug),
    type: assertPostType(data.type, slug),
    summary: requireString(data.summary, 'summary', slug),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingMinutes: estimateReadingMinutes(content),
    draft: data.draft === true,
  };

  return { meta, content };
}

/**
 * 공개된 글 목록을 최신순으로. draft는 제외한다.
 * 목록·sitemap·RSS 전부 이 함수를 통해서만 글을 가져온다 — draft가 새는 경로를 하나로 묶기 위해서.
 */
export function getPublishedPosts(): PostMeta[] {
  // 디렉토리가 통째로 없는 건 "글이 아직 없음"이 아니라 배포 사고다.
  // (Dockerfile에서 content/ COPY가 빠진 경우) 조용히 빈 목록을 돌려주면
  // 블로그만 텅 빈 채로 200이 나가서 원인 찾는 데 한참 걸린다. 그래서 터뜨린다.
  if (!fs.existsSync(POSTS_DIR)) {
    throw new Error(
      `[posts] 글 디렉토리가 없습니다: ${POSTS_DIR}\n` +
        `배포 이미지에 content/ 가 복사됐는지 확인하세요 (Dockerfile의 COPY --from=builder /app/content).`
    );
  }

  return fs
    .readdirSync(POSTS_DIR)
    .filter(isPostFile)
    .map((filename) => readPostFile(filename.replace(/\.md$/, '')).meta)
    .filter((meta) => !meta.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug < b.slug ? 1 : -1));
}

/** 상세 페이지용. draft여도 직접 URL로는 열린다(발행 전 미리보기 용도). 없으면 null. */
export async function getPost(slug: string): Promise<Post | null> {
  // 경로 조작 방어 — slug는 파일명 한 조각이어야 한다.
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  if (!fs.existsSync(path.join(POSTS_DIR, `${slug}.md`))) return null;

  const { meta, content } = readPostFile(slug);
  return { ...meta, html: await renderMarkdown(content) };
}

/** 같은 태그를 공유하는 최근 글. 태그가 겹치는 게 없으면 최신 글로 채운다. */
export function getRelatedPosts(current: PostMeta, limit = 3): PostMeta[] {
  const others = getPublishedPosts().filter((p) => p.slug !== current.slug);
  const scored = others
    .map((p) => ({ post: p, shared: p.tags.filter((t) => current.tags.includes(t)).length }))
    .sort((a, b) => b.shared - a.shared);

  return scored.slice(0, limit).map((s) => s.post);
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getPublishedPosts()) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function formatPostDate(date: string): string {
  const [y, m, d] = date.split('-');
  return `${y}.${m}.${d}`;
}

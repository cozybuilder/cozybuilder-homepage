// lib/program-screen-story — 공개 표시 판정(resolveScreenStories)과
// 관리자 저장 검증(parseScreenStoriesField).
// 실행: npm test  (node 내장 테스트 러너 · 별도 의존성 없음)

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  COZYRENT_LEGACY_SCREEN_STORIES,
  COZYRENT_LEGACY_SLUG,
  firstMissingTitleIndex,
  isScreenStoryUsed,
  MAX_SCREEN_STORIES,
  parseScreenStoriesField,
  resolveScreenStories,
  resolveScreenStoryItems,
  serializeScreenStoryRows,
  type ScreenStory,
  type ScreenStoryRow,
} from "../lib/program-screen-story.ts";
import { normalizeProgramLandingContent } from "../lib/program-landing.ts";

const img = (n: number) => Array.from({ length: n }, (_, i) => `/image/s${i}.jpg`);
const story = (n: number): ScreenStory[] =>
  Array.from({ length: n }, (_, i) => ({ title: `화면 ${i + 1}`, description: `설명 ${i + 1}` }));

/* ── 공개 표시 판정 ───────────────────────────────────────────── */

test("완전한 story 가 있으면 story UI 를 쓴다", () => {
  const r = resolveScreenStories({ slug: "anything", images: img(8), stories: story(8) });
  assert.equal(r?.length, 8);
  assert.equal(r?.[0].title, "화면 1");
  assert.equal(r?.[7].title, "화면 8");
});

test("story 가 없으면 null — 호출부가 기존 gallery 로 떨어진다", () => {
  assert.equal(resolveScreenStories({ slug: "other", images: img(4), stories: [] }), null);
  assert.equal(resolveScreenStories({ slug: "other", images: img(4), stories: null }), null);
  assert.equal(resolveScreenStories({ slug: "other", images: img(4) }), null);
});

test("개수가 어긋나면 story UI 를 쓰지 않는다", () => {
  assert.equal(resolveScreenStories({ slug: "other", images: img(8), stories: story(7) }), null);
  assert.equal(resolveScreenStories({ slug: "other", images: img(7), stories: story(8) }), null);
});

test("제목이 하나라도 비면 story UI 를 쓰지 않는다", () => {
  const broken = story(3);
  broken[1] = { title: "", description: "설명" };
  assert.equal(resolveScreenStories({ slug: "other", images: img(3), stories: broken }), null);
});

test("이미지가 0장이면 섹션 자체가 없다", () => {
  assert.equal(resolveScreenStories({ slug: COZYRENT_LEGACY_SLUG, images: [], stories: [] }), null);
});

test("코지임대 레거시: 정식 story 가 없고 이미지가 6장이면 fallback 을 쓴다", () => {
  const r = resolveScreenStories({ slug: COZYRENT_LEGACY_SLUG, images: img(6), stories: [] });
  assert.equal(r?.length, 6);
  assert.equal(r?.[0].title, "홈 화면");
  assert.equal(r?.[5].title, "지출 관리");
  assert.deepEqual(r, COZYRENT_LEGACY_SCREEN_STORIES.map((s) => ({ ...s })));
});

test("코지임대 레거시: 저장된 story 가 생기면 그쪽이 우선한다", () => {
  const saved = story(8);
  const r = resolveScreenStories({ slug: COZYRENT_LEGACY_SLUG, images: img(8), stories: saved });
  assert.equal(r?.length, 8);
  assert.equal(r?.[0].title, "화면 1"); // fallback("홈 화면") 이 아니다
});

test("코지임대 레거시: 이미지 개수가 6이 아니면 fallback 을 쓰지 않는다", () => {
  assert.equal(resolveScreenStories({ slug: COZYRENT_LEGACY_SLUG, images: img(8), stories: [] }), null);
  assert.equal(resolveScreenStories({ slug: COZYRENT_LEGACY_SLUG, images: img(5), stories: [] }), null);
});

test("다른 프로그램은 등록 전까지 아무 변화가 없다", () => {
  assert.equal(resolveScreenStories({ slug: "r", images: img(6), stories: [] }), null);
  assert.equal(resolveScreenStories({ slug: undefined, images: img(6), stories: [] }), null);
});

test("반환값은 복사본이라 레거시 상수를 호출부가 바꿀 수 없다", () => {
  const r = resolveScreenStories({ slug: COZYRENT_LEGACY_SLUG, images: img(6), stories: [] })!;
  r[0].title = "오염";
  assert.equal(COZYRENT_LEGACY_SCREEN_STORIES[0].title, "홈 화면");
});

/* ── 관리자 저장 검증 ─────────────────────────────────────────── */

test("저장: 이미지 8 + 설명 8 → 통과", () => {
  const r = parseScreenStoriesField(JSON.stringify(story(8)), 8);
  assert.equal(r.ok, true);
  assert.equal(r.ok && r.stories.length, 8);
  assert.equal(r.ok && r.stories[7].title, "화면 8");
});

test("저장: 이미지 8 + 설명 7 → 실패하고 개수를 알려준다", () => {
  const r = parseScreenStoriesField(JSON.stringify(story(7)), 8);
  assert.equal(r.ok, false);
  assert.match(r.ok ? "" : r.error, /이미지 8개 \/ 설명 7개/);
});

test("저장: 제목이 빠지면 몇 번째인지 알려준다", () => {
  const rows = story(4);
  rows[3] = { title: "   ", description: "설명" };
  const r = parseScreenStoriesField(JSON.stringify(rows), 4);
  assert.equal(r.ok, false);
  assert.equal(r.ok ? "" : r.error, "실제 화면 4번의 제목을 입력해주세요.");
});

test("저장: story 미사용(빈 값)은 기존 프로그램 호환으로 허용한다", () => {
  for (const raw of ["", "   ", "[]"]) {
    const r = parseScreenStoriesField(raw, 6);
    assert.equal(r.ok, true, `입력: ${JSON.stringify(raw)}`);
    assert.deepEqual(r.ok && r.stories, []);
  }
});

test("저장: 읽을 수 없는 입력은 조용히 넘어가지 않는다", () => {
  const bad = parseScreenStoriesField("{not json", 2);
  assert.equal(bad.ok, false);
  const notArray = parseScreenStoriesField(JSON.stringify({ title: "x" }), 1);
  assert.equal(notArray.ok, false);
});

test("저장: 제목·설명의 앞뒤 공백을 정리한다", () => {
  const r = parseScreenStoriesField(
    JSON.stringify([{ title: "  홈 화면 ", description: "  설명  " }]),
    1
  );
  assert.equal(r.ok, true);
  assert.deepEqual(r.ok && r.stories, [{ title: "홈 화면", description: "설명" }]);
});

test("저장: 설명은 없어도 되고, 문자열이 아닌 값은 빈 문자열이 된다", () => {
  const r = parseScreenStoriesField(JSON.stringify([{ title: "홈" }, { title: "호실", description: 7 }]), 2);
  assert.equal(r.ok, true);
  assert.deepEqual(r.ok && r.stories, [
    { title: "홈", description: "" },
    { title: "호실", description: "" },
  ]);
});

test("저장 후 공개 판정으로 이어진다: 8개 저장 → 8 step story UI", () => {
  const parsed = parseScreenStoriesField(JSON.stringify(story(8)), 8);
  assert.equal(parsed.ok, true);
  const resolved = resolveScreenStories({
    slug: COZYRENT_LEGACY_SLUG,
    images: img(8),
    stories: parsed.ok ? parsed.stories : [],
  });
  assert.equal(resolved?.length, 8);
  assert.deepEqual(
    resolved?.map((s) => s.title),
    story(8).map((s) => s.title)
  );
});

/* ── 레거시 저장 회귀 (검수 지적) ─────────────────────────────── */
// 기존에 screenshots 만 쓰던 프로그램이 관리자에 들어오면 이미지 수만큼 행이 생긴다.
// 이걸 "story 사용 중" 으로 보면 다른 필드 하나 고치려다 제목을 전부 입력해야 저장된다.

const rowsOf = (n: number, titles: string[] = [], descs: string[] = []): ScreenStoryRow[] =>
  Array.from({ length: n }, (_, i) => ({
    image: `/image/g${i}.jpg`,
    title: titles[i] ?? "",
    description: descs[i] ?? "",
  }));

test("회귀1: 이미지 5장 + 제목·설명 전부 비어 있으면 story 미사용 → 저장 허용", () => {
  const rows = rowsOf(5);
  assert.equal(isScreenStoryUsed(rows), false);

  const out = serializeScreenStoryRows(rows);
  assert.equal(out.stories, "", "hidden screen_stories 는 빈 문자열이어야 한다");
  assert.equal(out.images.split("\n").length, 5, "이미지는 그대로 저장된다");

  // 서버도 통과해야 한다 — 기존 ScreenshotGallery 프로그램이 막히지 않는다.
  const r = parseScreenStoriesField(out.stories, 5);
  assert.equal(r.ok, true);
  assert.deepEqual(r.ok && r.stories, []);

  // 경고도 뜨지 않는다.
  assert.equal(firstMissingTitleIndex(rows), -1);
});

test("회귀2: 첫 행에 제목만 넣으면 story 사용 → 나머지 빈 제목 때문에 저장 차단", () => {
  const rows = rowsOf(5, ["홈"]);
  assert.equal(isScreenStoryUsed(rows), true);
  assert.equal(firstMissingTitleIndex(rows), 1, "2번째 행부터 제목이 없다");

  const out = serializeScreenStoryRows(rows);
  assert.notEqual(out.stories, "");
  const r = parseScreenStoriesField(out.stories, 5);
  assert.equal(r.ok, false);
  assert.equal(r.ok ? "" : r.error, "실제 화면 2번의 제목을 입력해주세요.");
});

test("회귀2-b: 설명만 입력해도 story 사용으로 본다", () => {
  const rows = rowsOf(3, [], ["설명만 있음"]);
  assert.equal(isScreenStoryUsed(rows), true);
  assert.equal(firstMissingTitleIndex(rows), 0);
});

test("회귀3: 이미지 5장 + 제목 5개 → 저장 PASS", () => {
  const rows = rowsOf(5, ["a", "b", "c", "d", "e"]);
  const out = serializeScreenStoryRows(rows);
  const r = parseScreenStoriesField(out.stories, out.images.split("\n").length);
  assert.equal(r.ok, true);
  assert.equal(r.ok && r.stories.length, 5);
  assert.equal(firstMissingTitleIndex(rows), -1);
});

test("회귀4: 코지임대 legacy fallback 6개는 story 사용 상태로 그대로 저장된다", () => {
  const rows: ScreenStoryRow[] = COZYRENT_LEGACY_SCREEN_STORIES.map((s, i) => ({
    image: `/image/landingpage/cozyrent/${i}.jpg`,
    title: s.title,
    description: s.description,
  }));
  assert.equal(isScreenStoryUsed(rows), true, "fallback 이 채워져 오므로 사용 상태다");
  assert.equal(firstMissingTitleIndex(rows), -1);

  const out = serializeScreenStoryRows(rows);
  const r = parseScreenStoriesField(out.stories, 6);
  assert.equal(r.ok, true);
  assert.equal(r.ok && r.stories.length, 6);
  assert.equal(r.ok && r.stories[0].title, "홈 화면");
  assert.equal(r.ok && r.stories[5].title, "지출 관리");
});

test("회귀5: 이미지만 바꾼 기존 프로그램은 제목 입력을 강요받지 않는다", () => {
  const before = rowsOf(3);
  const after = [...before, { image: "/image/new.jpg", title: "", description: "" }];
  const out = serializeScreenStoryRows(after);
  assert.equal(out.stories, "");
  assert.equal(out.images.split("\n").length, 4);
  assert.equal(parseScreenStoriesField(out.stories, 4).ok, true);
});

test("이미지가 없는 행은 양쪽 직렬화에서 함께 제외된다", () => {
  const rows: ScreenStoryRow[] = [
    { image: "/a.jpg", title: "A", description: "" },
    { image: "   ", title: "버려질 제목", description: "버려질 설명" },
    { image: "/b.jpg", title: "B", description: "" },
  ];
  const out = serializeScreenStoryRows(rows);
  assert.deepEqual(out.images.split("\n"), ["/a.jpg", "/b.jpg"]);
  assert.deepEqual(JSON.parse(out.stories).map((s: ScreenStory) => s.title), ["A", "B"]);
  assert.equal(parseScreenStoriesField(out.stories, 2).ok, true);
});

test("행이 하나도 없으면 두 값 모두 비어 있다", () => {
  const out = serializeScreenStoryRows([]);
  assert.equal(out.images, "");
  assert.equal(out.stories, "");
  assert.equal(parseScreenStoriesField(out.stories, 0).ok, true);
});

/* ── 노출(visible) + 20개 상한 ────────────────────────────────── */

const vStory = (n: number, hidden: number[] = []): ScreenStory[] =>
  Array.from({ length: n }, (_, i) => ({
    title: `화면 ${i + 1}`,
    description: `설명 ${i + 1}`,
    ...(hidden.includes(i) ? { visible: false as const } : {}),
  }));

test("상한: MAX_SCREEN_STORIES 는 20 이다", () => {
  assert.equal(MAX_SCREEN_STORIES, 20);
});

test("1. 이미지 20 + 설명 20 → 저장 PASS", () => {
  const rows = Array.from({ length: 20 }, (_, i) => ({
    image: `/i${i}.jpg`,
    title: `화면 ${i + 1}`,
    description: "",
  }));
  const out = serializeScreenStoryRows(rows);
  const r = parseScreenStoriesField(out.stories, 20);
  assert.equal(r.ok, true);
  assert.equal(r.ok && r.stories.length, 20);
  const norm = normalizeProgramLandingContent({ screenStories: r.ok ? r.stories : [] });
  assert.equal(norm?.screenStories?.length, 20);
});

test("2. 21개는 서버에서 막는다 (조용히 20개로 깎지 않는다)", () => {
  const r = parseScreenStoriesField(JSON.stringify(vStory(21)), 21);
  assert.equal(r.ok, false);
  assert.match(r.ok ? "" : r.error, /최대 20개/);
  assert.equal(parseScreenStoriesField(JSON.stringify(vStory(20)), 21).ok, false);
});

test("3. visible 이 없는 기존 데이터는 전부 노출로 취급한다", () => {
  const stories = vStory(5);
  assert.ok(stories.every((s) => s.visible === undefined));
  const r = resolveScreenStoryItems({ slug: "x", images: img(5), stories });
  assert.equal(r.mode, "story");
  assert.equal(r.mode === "story" && r.items.length, 5);
});

test("4. visible false 3개 / true 5개 → 공개는 5개만", () => {
  const r = resolveScreenStoryItems({ slug: "x", images: img(8), stories: vStory(8, [1, 3, 6]) });
  assert.equal(r.mode, "story");
  assert.deepEqual(r.mode === "story" ? r.items.map((i) => i.title) : [], [
    "화면 1",
    "화면 3",
    "화면 5",
    "화면 6",
    "화면 8",
  ]);
});

test("5. 노출 결과는 원본 순서를 유지하고 이미지 짝이 정확하다", () => {
  const r = resolveScreenStoryItems({ slug: "x", images: img(8), stories: vStory(8, [1, 3, 6]) });
  assert.equal(r.mode, "story");
  assert.deepEqual(r.mode === "story" ? r.items.map((i) => i.image) : [], [
    "/image/s0.jpg",
    "/image/s2.jpg",
    "/image/s4.jpg",
    "/image/s5.jpg",
    "/image/s7.jpg",
  ]);
});

test("6. 20개 중 10개만 체크 → 공개 10개", () => {
  const hidden = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const r = resolveScreenStoryItems({ slug: "x", images: img(20), stories: vStory(20, hidden) });
  assert.equal(r.mode, "story");
  assert.equal(r.mode === "story" && r.items.length, 10);
  assert.deepEqual(
    r.mode === "story" ? r.items.map((i) => i.title) : [],
    [1, 3, 5, 7, 9, 11, 13, 15, 17, 19].map((n) => `화면 ${n}`)
  );
});

test("7. 정식 stories 8개가 모두 unchecked 면 섹션을 숨긴다 (gallery 로 떨어지지 않는다)", () => {
  const r = resolveScreenStoryItems({
    slug: "x",
    images: img(8),
    stories: vStory(8, [0, 1, 2, 3, 4, 5, 6, 7]),
  });
  assert.equal(r.mode, "hidden");
});

test("8. screenshots-only 레거시는 체크박스 기본값 때문에 story 로 전환되지 않는다", () => {
  const rows: ScreenStoryRow[] = Array.from({ length: 5 }, (_, i) => ({
    image: `/g${i}.jpg`,
    title: "",
    description: "",
    visible: undefined,
  }));
  assert.equal(isScreenStoryUsed(rows), false);
  assert.equal(serializeScreenStoryRows(rows).stories, "");
  assert.equal(parseScreenStoriesField("", 5).ok, true);
  assert.equal(resolveScreenStoryItems({ slug: "g", images: img(5), stories: [] }).mode, "gallery");
});

test("8-b. 레거시 행의 노출을 실제로 끄면 story 설정으로 본다", () => {
  const rows: ScreenStoryRow[] = Array.from({ length: 3 }, (_, i) => ({
    image: `/g${i}.jpg`,
    title: "",
    description: "",
  }));
  rows[1].visible = false;
  assert.equal(isScreenStoryUsed(rows), true);
  assert.equal(firstMissingTitleIndex(rows), 0, "제목이 없으니 저장 전에 알려준다");
  rows[1].visible = undefined;
  assert.equal(isScreenStoryUsed(rows), false);
});

test("9. 코지임대 fallback 6개는 전부 노출로 취급한다", () => {
  const r = resolveScreenStoryItems({ slug: COZYRENT_LEGACY_SLUG, images: img(6), stories: [] });
  assert.equal(r.mode, "story");
  assert.equal(r.mode === "story" && r.items.length, 6);
  assert.ok(COZYRENT_LEGACY_SCREEN_STORIES.every((s) => s.visible === undefined));
});

test("10. visible=false 행도 이미지·제목·설명이 보존되고 관리자에서 복원된다", () => {
  const rows: ScreenStoryRow[] = [
    { image: "/a.jpg", title: "A", description: "설명 A" },
    { image: "/b.jpg", title: "B", description: "설명 B", visible: false },
    { image: "/c.jpg", title: "C", description: "설명 C" },
  ];
  const out = serializeScreenStoryRows(rows);
  assert.deepEqual(out.images.split(String.fromCharCode(10)), ["/a.jpg", "/b.jpg", "/c.jpg"]);
  const parsed = parseScreenStoriesField(out.stories, 3);
  assert.equal(parsed.ok, true);
  const saved = normalizeProgramLandingContent({
    screenStories: parsed.ok ? parsed.stories : [],
  })?.screenStories;
  assert.equal(saved?.length, 3);
  assert.deepEqual(saved?.[1], { title: "B", description: "설명 B", visible: false });
  assert.equal(saved?.[0].visible, undefined);
  const r = resolveScreenStoryItems({
    slug: "x",
    images: ["/a.jpg", "/b.jpg", "/c.jpg"],
    stories: saved,
  });
  assert.equal(r.mode === "story" && r.items.length, 2);
});

test("11. ↑↓ 이동은 image/title/description/visible 네 값을 한 행으로 옮긴다", () => {
  const move = (rows: ScreenStoryRow[], i: number, dir: -1 | 1) => {
    const j = i + dir;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  };
  const rows: ScreenStoryRow[] = [
    { image: "/a.jpg", title: "A", description: "da", visible: false },
    { image: "/b.jpg", title: "B", description: "db" },
  ];
  const moved = move(rows, 0, 1);
  assert.deepEqual(moved[1], { image: "/a.jpg", title: "A", description: "da", visible: false });
  assert.deepEqual(moved[0], { image: "/b.jpg", title: "B", description: "db" });
  const out = serializeScreenStoryRows(moved);
  assert.deepEqual(out.images.split(String.fromCharCode(10)), ["/b.jpg", "/a.jpg"]);
  assert.deepEqual(JSON.parse(out.stories), [
    { title: "B", description: "db" },
    { title: "A", description: "da", visible: false },
  ]);
});

test("정규화: 21개를 넣어도 20개로 자른다(서버가 먼저 막지만 마지막 방어선)", () => {
  const c = normalizeProgramLandingContent({ screenStories: vStory(21) });
  assert.equal(c?.screenStories?.length, 20);
});

test("정규화: visible 은 false 만 보존하고 true/누락은 적지 않는다", () => {
  const c = normalizeProgramLandingContent({
    screenStories: [
      { title: "a", description: "", visible: true },
      { title: "b", description: "", visible: false },
      { title: "c", description: "" },
      { title: "d", description: "", visible: "no" },
    ],
  });
  assert.deepEqual(c?.screenStories, [
    { title: "a", description: "" },
    { title: "b", description: "", visible: false },
    { title: "c", description: "" },
    { title: "d", description: "" },
  ]);
});

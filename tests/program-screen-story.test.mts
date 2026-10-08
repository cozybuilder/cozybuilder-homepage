// lib/program-screen-story — 공개 표시 판정(resolveScreenStories)과
// 관리자 저장 검증(parseScreenStoriesField).
// 실행: npm test  (node 내장 테스트 러너 · 별도 의존성 없음)

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  COZYRENT_LEGACY_SCREEN_STORIES,
  COZYRENT_LEGACY_SLUG,
  parseScreenStoriesField,
  resolveScreenStories,
  type ScreenStory,
} from "../lib/program-screen-story.ts";

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

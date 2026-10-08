// lib/program-landing 정규화 — screenStories 확장과 기존 v1 회귀.
// 실행: npm test  (node 내장 테스트 러너 · 별도 의존성 없음)

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeProgramLandingContent,
  parseProgramLandingContent,
  type ProgramLandingContentV1,
} from "../lib/program-landing.ts";

test("screenStories: 제목·설명을 순서 그대로 보존한다", () => {
  const c = normalizeProgramLandingContent({
    screenStories: [
      { title: "홈 화면", description: "건물 현황을 봅니다." },
      { title: "호실 관리", description: "층별 호실을 봅니다." },
    ],
  });
  assert.deepEqual(c?.screenStories, [
    { title: "홈 화면", description: "건물 현황을 봅니다." },
    { title: "호실 관리", description: "층별 호실을 봅니다." },
  ]);
});

test("screenStories: version 은 1 그대로다(migration 없음)", () => {
  const c = normalizeProgramLandingContent({ screenStories: [{ title: "a", description: "" }] });
  assert.equal(c?.version, 1);
});

test("screenStories: 앞뒤 공백을 자르고 길이 상한을 적용한다", () => {
  const c = normalizeProgramLandingContent({
    screenStories: [{ title: "  홈 화면  ", description: "  설명  " }],
  });
  assert.deepEqual(c?.screenStories, [{ title: "홈 화면", description: "설명" }]);

  const long = normalizeProgramLandingContent({
    screenStories: [{ title: "가".repeat(500), description: "나".repeat(900) }],
  });
  assert.equal(long?.screenStories?.[0].title.length, 120); // short
  assert.equal(long?.screenStories?.[0].description.length, 300); // medium
});

test("screenStories: 설명은 비어 있어도 된다", () => {
  const c = normalizeProgramLandingContent({ screenStories: [{ title: "홈 화면" }] });
  assert.deepEqual(c?.screenStories, [{ title: "홈 화면", description: "" }]);
});

test("screenStories: malformed 값은 조용히 걸러지고 페이지가 깨지지 않는다", () => {
  const c = normalizeProgramLandingContent({
    screenStories: [
      { title: "정상", description: "ok" },
      null,
      "문자열",
      42,
      [],
      { description: "제목 없음" }, // 제목 없는 항목은 화면으로 세지 않는다
      { title: 123, description: {} }, // 문자열이 아닌 값
    ],
  });
  assert.deepEqual(c?.screenStories, [{ title: "정상", description: "ok" }]);
});

test("screenStories: 배열이 아니면 무시한다", () => {
  for (const bad of ["x", 1, {}, true, null]) {
    const c = normalizeProgramLandingContent({ hero: { headline: "h" }, screenStories: bad });
    assert.equal(c?.screenStories, undefined, `입력: ${JSON.stringify(bad)}`);
    assert.equal(c?.hero?.headline, "h");
  }
});

test("screenStories: 반복 항목 상한(20개)을 넘기지 않는다", () => {
  const many = Array.from({ length: 30 }, (_, i) => ({ title: `화면 ${i}`, description: "" }));
  const c = normalizeProgramLandingContent({ screenStories: many });
  assert.equal(c?.screenStories?.length, 20);
});

test("회귀: screenStories 가 없는 기존 v1 payload 는 결과가 동일하다", () => {
  const legacy = {
    version: 1,
    hero: { headline: "핵심", subheadline: "한 줄", note: "메모" },
    problems: [{ title: "문제", description: "설명" }],
    benefits: [{ title: "가치", description: "설명" }],
    audiences: ["임대인"],
    proofStats: [{ value: "11", label: "호실" }],
    makerStory: { title: "만든 이유", body: "본문" },
    testimonials: [{ quote: "좋아요", displayName: "코지", meta: "임대인" }],
    offer: { title: "이용", headline: "무료", body: "본문", lines: ["7일 체험"] },
    faqs: [{ question: "질문", answer: "답" }],
    finalCta: { title: "지금", body: "시작" },
  };
  const before = normalizeProgramLandingContent(legacy);
  assert.equal(before?.screenStories, undefined);
  // 같은 입력을 다시 통과시켜도 동일 — 정규화는 멱등이어야 한다.
  assert.deepEqual(normalizeProgramLandingContent(before), before);
});

test("screenStories 는 다른 랜딩 섹션과 함께 저장돼도 서로를 지우지 않는다", () => {
  const c = normalizeProgramLandingContent({
    hero: { headline: "핵심" },
    faqs: [{ question: "q", answer: "a" }],
    screenStories: [{ title: "홈 화면", description: "설명" }],
  });
  assert.equal(c?.hero?.headline, "핵심");
  assert.equal(c?.faqs?.length, 1);
  assert.equal(c?.screenStories?.length, 1);
});

test("병합: screenStories 만 바꿔도 hero/FAQ 가 보존된다 (saveProgram 병합과 동일 구성)", () => {
  const existing = normalizeProgramLandingContent({
    hero: { headline: "핵심", subheadline: "한 줄" },
    faqs: [{ question: "q", answer: "a" }],
    screenStories: [{ title: "옛 화면", description: "옛 설명" }],
  }) as ProgramLandingContentV1;

  const merged = normalizeProgramLandingContent({
    ...existing,
    version: 1,
    screenStories: [{ title: "새 화면", description: "새 설명" }],
  });

  assert.equal(merged?.hero?.headline, "핵심");
  assert.equal(merged?.hero?.subheadline, "한 줄");
  assert.deepEqual(merged?.faqs, [{ question: "q", answer: "a" }]);
  assert.deepEqual(merged?.screenStories, [{ title: "새 화면", description: "새 설명" }]);
});

test("병합: hero 만 바꿔도 screenStories 가 보존된다", () => {
  // ProgramLandingFields 는 screenStories 를 모르므로 hero 만 담아 보낸다.
  const fromLandingEditor = { version: 1, hero: { headline: "바뀐 핵심" } };
  const keptStories = [{ title: "홈 화면", description: "설명" }];

  const merged = normalizeProgramLandingContent({
    ...fromLandingEditor,
    version: 1,
    screenStories: keptStories,
  });

  assert.equal(merged?.hero?.headline, "바뀐 핵심");
  assert.deepEqual(merged?.screenStories, keptStories);
});

test("빈 screenStories 만 있으면 저장할 내용이 없으므로 null", () => {
  assert.equal(normalizeProgramLandingContent({ screenStories: [] }), null);
  assert.equal(normalizeProgramLandingContent({ screenStories: [{ description: "제목없음" }] }), null);
});

test("parseProgramLandingContent 는 screenStories 를 포함한 JSON 을 읽는다", () => {
  const r = parseProgramLandingContent(
    JSON.stringify({ version: 1, screenStories: [{ title: "홈", description: "d" }] })
  );
  assert.equal(r.ok, true);
  assert.equal(r.ok && r.content?.screenStories?.length, 1);
});

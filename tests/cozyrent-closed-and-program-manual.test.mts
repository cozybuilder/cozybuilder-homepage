// 코지임대 사전신청 종료(COZYRENT_PRELAUNCH §16) · 프로그램 상세 사용 설명서 버튼(PROGRAM_OPERATING_MODEL §10).
// 실행: npm test  (node 내장 테스트 러너 · 별도 의존성 없음)

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getLandingConfig } from "../lib/landingpage/config.ts";
import { androidPackageOf, programManualFor } from "../lib/program-manual.ts";
import { POST } from "../app/api/cozyrent/preregister/route.ts";

const ROOT = join(import.meta.dirname, "..");
const PLAY = "https://play.google.com/store/apps/details?id=com.cozybuilder.cozyrent";

test("사전신청 API는 본문을 읽지 않고 410 closed로 거절한다", async () => {
  const res = await POST();
  assert.equal(res.status, 410);
  assert.deepEqual(await res.json(), { ok: false, error: "closed" });
});

test("코지임대 랜딩은 종료 상태이고 지금 신청을 권하는 문구가 없다", () => {
  const c = getLandingConfig("cozyrent");
  assert.ok(c?.closed);
  assert.equal(c.closed.label, "사전신청 종료");
  const visible = JSON.stringify({
    meta: c.meta.description,
    hero: [c.hero.eyebrow, c.hero.sub],
    finalCta: c.finalCta.descLines,
  });
  assert.doesNotMatch(visible, /진행 중|사전신청하고|받아보세요/);
  // 기존 신청자 혜택 안내는 남는다(신규 신청·자동 지급 약속 없음).
  assert.match(JSON.stringify(c.closed.lines), /이미 신청하신 분/);
});

test("종료 상태 렌더러는 모든 신청 CTA를 클릭 불가 표시로 바꾼다", () => {
  const r = readFileSync(join(ROOT, "components/landingpage/LandingRenderer.tsx"), "utf8");
  // 상단·히어로·마지막 CTA 세 곳 모두 closed 분기 안에서만 #apply 링크를 그린다.
  assert.equal((r.match(/href="#apply"/g) ?? []).length, 3);
  assert.equal((r.match(/<ClosedCta/g) ?? []).length, 3);
  assert.match(r, /closed \? \(\s*<div className="card p-8 text-center sm:p-10" data-apply-closed/);
  const bar = readFileSync(join(ROOT, "components/landingpage/MobileCtaBar.tsx"), "utf8");
  assert.match(bar, /closed \? \(\s*<button\s+type="button"\s+disabled/);
  assert.match(r, /<MobileCtaBar label=\{closed \? closed\.label : config\.hero\.cta\} closed=\{Boolean\(closed\)\} \/>/);
});

test("사용 설명서 버튼은 코지임대 Play 패키지에만 붙고 웹 보기 하나다", () => {
  assert.equal(androidPackageOf(PLAY), "com.cozybuilder.cozyrent");
  const card = programManualFor({ type: "mobile", playStoreUrl: PLAY, deployStatus: "released" });
  assert.deepEqual(card, {
    title: "코지임대 사용 설명서",
    label: "사용 설명서 보기",
    href: "/manual/cozyrent/index.html",
  });
  assert.ok(programManualFor({ type: "mobile", playStoreUrl: PLAY, deployStatus: null }));
});

test("다른 프로그램·Play 버튼이 없는 상태에는 버튼이 없다", () => {
  const other = "https://play.google.com/store/apps/details?id=com.example.gratitude";
  assert.equal(programManualFor({ type: "mobile", playStoreUrl: other }), null);
  assert.equal(programManualFor({ type: "web", playStoreUrl: PLAY }), null);
  assert.equal(programManualFor({ type: "mobile", playStoreUrl: "" }), null);
  assert.equal(programManualFor({ type: "mobile", playStoreUrl: PLAY, deployStatus: "preregistration" }), null);
  assert.equal(programManualFor({ type: "mobile", playStoreUrl: PLAY, deployStatus: "preparing" }), null);
  assert.equal(androidPackageOf("https://evil.example/store/apps/details?id=com.cozybuilder.cozyrent"), null);
  assert.equal(androidPackageOf("not a url"), null);
});

test("프로그램 상세: 사용 설명서는 뒤로가기 행 오른쪽 하나 · Play 버튼 아래 카드 없음", () => {
  const page = readFileSync(join(ROOT, "app/programs/[slug]/page.tsx"), "utf8");
  // 상단 행 — 대상이면 뒤로가기 → 사용 설명서 버튼(같은 flex 행 · 양 끝 정렬), 아니면 종전 그대로 뒤로가기만.
  assert.match(
    page,
    /\{manual \? \(\s*<div className="flex items-center justify-between gap-3">\s*<BackButton href="\/programs" label="프로그램 목록" \/>\s*<ProgramManualButton manual=\{manual\} \/>\s*<\/div>\s*\) : \(\s*<BackButton href="\/programs" label="프로그램 목록" \/>\s*\)\}/,
  );
  assert.equal((page.match(/<ProgramManualButton/g) ?? []).length, 1);
  assert.doesNotMatch(page, /ProgramManualCardView/);
  // 버튼: 책 아이콘 + 라벨 · 새 탭 · 다운로드 속성 없음.
  const btn = page.slice(page.indexOf("function ProgramManualButton"), page.indexOf("/** 무료 구독 안내"));
  assert.match(btn, /target="_blank"/);
  assert.match(btn, /rel="noopener"/);
  assert.match(btn, /<svg[\s\S]*aria-hidden[\s\S]*<\/svg>\s*\{manual\.label\}\s*<\/a>/);
  assert.doesNotMatch(btn, /download/);
  // 대비 강조(#74 최종): 강조색 배경·테두리 · hover · 키보드 focus 링 · 크기(h-11·text-sm)는 그대로.
  assert.match(btn, /bg-\[var\(--accent\)\]\/15 /);
  // 테두리는 ring-1(전역 `* { border-color }`가 border 색 유틸리티를 덮는다).
  assert.match(btn, /ring-1 ring-\[var\(--accent\)\]\/60/);
  assert.match(btn, /hover:ring-\[var\(--accent\)\]/);
  assert.doesNotMatch(btn, /className="[^"]* border /);
  assert.match(btn, /hover:bg-\[var\(--accent\)\]\/25/);
  assert.match(btn, /focus-visible:ring-2 focus-visible:ring-\[var\(--accent\)\]/);
  assert.match(btn, /inline-flex h-11 [^"]*px-4 text-sm /);
  assert.doesNotMatch(btn, /bg-white\/5/);
  // 히어로: Google Play 버튼 → 기존 안내문이 그대로 한 묶음이고, 그 뒤에 사용 설명서가 없다.
  const hero = page.slice(page.indexOf("── HERO"), page.indexOf("── 문제 공감"));
  const iBtn = hero.indexOf("<ProgramPrimaryAction ctx={ctx} variant=\"full\" />");
  const iSub = hero.indexOf("<WebSubscribeNote");
  const iNote = hero.indexOf("{L.hero.note}");
  assert.ok(iBtn > 0 && iSub > iBtn && iNote > iSub, JSON.stringify({ iBtn, iSub, iNote }));
  assert.doesNotMatch(hero, /manual/);
  assert.match(hero.slice(iNote), /^\{L\.hero\.note\}\s*<\/p>\s*\)\}\s*<\/section>/);
});

// 코지임대 웹 매뉴얼 공개 — 웹 보기만 있고 PDF는 공개하지 않는다(코지 2026-10-28 · COZYRENT_PRELAUNCH §16 · PROGRAM_OPERATING_MODEL §10).
// 실행: npm test  (node 내장 테스트 러너 · 별도 의존성 없음)

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { getLandingConfig } from "../lib/landingpage/config.ts";

const ROOT = join(import.meta.dirname, "..");
const PUBLIC = join(ROOT, "public");
const MANUAL_DIR = join(PUBLIC, "manual", "cozyrent");
const manual = getLandingConfig("cozyrent")?.manual;
const local = (href: string) => join(PUBLIC, ...href.split("/").filter(Boolean));
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

test("코지임대 랜딩 매뉴얼은 웹 보기 하나만 있다", () => {
  assert.ok(manual, "cozyrent manual 설정 없음");
  assert.equal(manual.web.href, "/manual/cozyrent/index.html");
  assert.ok(existsSync(local(manual.web.href)), "웹 매뉴얼 없음");
  assert.doesNotMatch(JSON.stringify(manual), /\.pdf|PDF|download/i);
});

test("공개 폴더에 PDF가 없다(직접 URL 다운로드 차단)", () => {
  const pdfs = walk(PUBLIC).filter((p) => /\.pdf$/i.test(p));
  assert.deepEqual(pdfs, []);
  assert.equal(existsSync(join(MANUAL_DIR, "cozyrent-user-manual.pdf")), false);
});

test("랜딩·프로그램 상세 소스에 PDF 다운로드 링크가 없다", () => {
  for (const f of [
    "components/landingpage/LandingRenderer.tsx",
    "app/programs/[slug]/page.tsx",
    "lib/program-manual.ts",
    "lib/landingpage/config.ts",
  ]) {
    const src = readFileSync(join(ROOT, f), "utf8");
    assert.doesNotMatch(src, /\.pdf["'`]/i, f);
    assert.doesNotMatch(src, /\sdownload[\s=>]/, f);
  }
});

test("웹 매뉴얼의 그림은 모두 같은 폴더에 있고 외부 자원을 부르지 않는다", () => {
  const html = readFileSync(join(MANUAL_DIR, "index.html"), "utf8");
  const srcs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(srcs.length > 300, `그림 수 ${srcs.length}`);
  for (const s of srcs) {
    assert.match(s, /^img\/[\w.-]+\.webp$/, s);
    assert.ok(existsSync(join(MANUAL_DIR, ...s.split("/"))), `그림 없음: ${s}`);
  }
  assert.doesNotMatch(html, /<(script|link)[^>]+(src|href)="https?:/i);
  assert.doesNotMatch(html, /\.\.\/assets\//);
  assert.doesNotMatch(html, /href="[^"]*\.pdf"/i);
});

test("웹 매뉴얼 목차·본문 내부 링크는 모두 있는 제목으로 간다", () => {
  const html = readFileSync(join(MANUAL_DIR, "index.html"), "utf8");
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const hrefs = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => decodeURIComponent(m[1]));
  assert.ok(hrefs.length > 200, `내부 링크 ${hrefs.length}`);
  assert.deepEqual([...new Set(hrefs.filter((h) => !ids.has(h)))], []);
});

test("공개 웹 매뉴얼에 검토용 표기·내부 추적 표식이 없다", () => {
  const text = readFileSync(join(MANUAL_DIR, "index.html"), "utf8").replace(/<[^>]+>/g, " ");
  assert.doesNotMatch(text, /검토용|공개 전/);
  assert.doesNotMatch(text, /BUILD_HEAD|versionCode|routeGate|steps\.json|SCREENSHOT_INDEX/);
});

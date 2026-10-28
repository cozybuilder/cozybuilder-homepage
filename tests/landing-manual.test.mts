// 랜딩 사용자 매뉴얼 진입 — 설정이 가리키는 정적 산출물이 실제로 있고, 서로 맞는지 확인한다.
// 실행: npm test  (node 내장 테스트 러너 · 별도 의존성 없음)

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { getLandingConfig } from "../lib/landingpage/config.ts";

const PUBLIC = join(import.meta.dirname, "..", "public");
const manual = getLandingConfig("cozyrent")?.manual;
const local = (href: string) => join(PUBLIC, ...href.split("/").filter(Boolean));

test("코지임대 랜딩에 매뉴얼 보기·PDF 다운로드가 있다", () => {
  assert.ok(manual, "cozyrent manual 설정 없음");
  assert.equal(manual.web.label, "사용자 매뉴얼 보기");
  assert.ok(manual.pdfs.length >= 1);
  assert.ok(manual.pdfs.every((p) => p.label.includes("PDF")));
});

test("매뉴얼 경로는 public/manual/cozyrent 아래 실제 파일이다", () => {
  assert.ok(manual);
  for (const href of [manual.web.href, ...manual.pdfs.map((p) => p.href)]) {
    assert.match(href, /^\/manual\/cozyrent\/[\w.-]+$/);
    assert.ok(existsSync(local(href)), `없음: ${href}`);
  }
});

test("PDF 크기 표기는 실제 파일 크기와 같다", () => {
  assert.ok(manual);
  for (const p of manual.pdfs) {
    const mb = (statSync(local(p.href)).size / 1024 / 1024).toFixed(1);
    assert.equal(p.size, `${mb}MB`, p.href);
    assert.equal(readFileSync(local(p.href)).subarray(0, 5).toString("latin1"), "%PDF-");
  }
});

test("웹 매뉴얼의 그림은 모두 같은 폴더에 있고 외부 자원을 부르지 않는다", () => {
  assert.ok(manual);
  const html = readFileSync(local(manual.web.href), "utf8");
  const dir = local(manual.web.href).replace(/[\\/][^\\/]+$/, "");
  const srcs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(srcs.length > 300, `그림 수 ${srcs.length}`);
  for (const s of srcs) {
    assert.match(s, /^img\/[\w.-]+\.webp$/, s);
    assert.ok(existsSync(join(dir, ...s.split("/"))), `그림 없음: ${s}`);
  }
  assert.doesNotMatch(html, /<(script|link)[^>]+(src|href)="https?:/i);
  assert.doesNotMatch(html, /\.\.\/assets\//);
});

test("웹 매뉴얼 본문에 내부 추적 표식이 없다", () => {
  assert.ok(manual);
  const text = readFileSync(local(manual.web.href), "utf8").replace(/<[^>]+>/g, " ");
  assert.doesNotMatch(text, /BUILD_HEAD|versionCode|routeGate|steps\.json|SCREENSHOT_INDEX/);
});

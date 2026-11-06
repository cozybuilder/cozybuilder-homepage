// 코지임대 계정 삭제 안내(Google Play 계정 삭제 정책 URL).
// 2026-11-05: #74 임시 안내(cozyrent Issue #79 · VC80 배포 전까지)를 정리한 뒤의 확정 동작을 본다 — VC80 프로덕션 100%·필수 업데이트 최소 80
//  (cozyrent docs/qa/VC80_MIN80_2026-11-02.md) · 매뉴얼 §18.5 임시 안내는 VC82판부터 없음(cozyrent docs/manual/README.md).
// 실행: npm test  (node 내장 테스트 러너 · 별도 의존성 없음)

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const src = readFileSync(join(ROOT, "app/cozyrent/delete-account/page.tsx"), "utf8");
/** 화면에 나가는 부분만(주석 제거) — 고객 문구 검사용. */
const visible = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const MANUAL = readFileSync(join(ROOT, "public/manual/cozyrent/index.html"), "utf8");
const DELETE_URL = "https://cozybuilder.co.kr/cozyrent/delete-account";

test("앱에서 탈퇴가 끝나지 않은 사용자도 이메일 요청(2번)을 쓰도록 안내한다", () => {
  assert.match(visible, /2\. 앱을 사용할 수 없거나 앱에서 탈퇴가 끝나지 않는 경우/);
  assert.match(visible, /「회원탈퇴를 처리하지 못했어요」 안내가 나오고 탈퇴가 끝나지 않았다면 아래 방법으로 삭제를 요청할 수 있습니다/);
  // VC80 배포 전 임시 문단(「지금 Google Play에 배포된 앱 버전에서는 …」)은 정리됐다 — 2번 안내만으로 같은 길을 연다.
  assert.doesNotMatch(visible, /data-delete-temp-notice/);
  assert.doesNotMatch(visible, /현재 앱 버전 안내|지금 Google Play에 배포된 앱 버전에서는/);
  // 정상 완료와 구별한다.
  assert.match(visible, /탈퇴가 정상으로 끝나면 앱이 다시 시작되어 로그인 화면이 나타나며, 따로 요청할 필요가 없습니다/);
});

test("기존 이메일 요청·본인 확인·삭제 범위·구독 해지 안내는 그대로다", () => {
  assert.match(src, /const MAIL_SUBJECT = "\[코지임대 계정 삭제 요청\]";/);
  assert.match(src, /mailto:\$\{siteConfig\.contactEmail\}\?subject=\$\{encodeURIComponent\(MAIL_SUBJECT\)\}&body=\$\{encodeURIComponent\(MAIL_BODY\)\}/);
  assert.match(visible, /본인 확인을 위해 <strong className="text-foreground">가입한 이메일 주소에서<\/strong> 보내주세요\. 확인 후 처리합니다\./);
  assert.match(src, /const PLAY_SUBSCRIPTIONS_URL = "https:\/\/play\.google\.com\/store\/account\/subscriptions";/);
  assert.match(visible, /Google Play 구독은 자동으로 해지되지 않습니다\./);
  for (const h of ["3. 삭제되는 데이터와 보존되는 기록", "4. Google Play 구독은 별도로 해지해야 합니다", "5. 예상 처리 절차", "6. 문의"]) {
    assert.ok(visible.includes(h), h);
  }
});

test("고객 문구에 내부 오류코드·기술 설명이 없다", () => {
  for (const banned of [/device_unidentified/, /installationId/, /\b409\b/, /#79/, /VC7\d|VC8\d/, /Edge Function/i]) {
    assert.doesNotMatch(visible, banned);
  }
});

test("웹 매뉴얼 §18.5는 임시 안내 없이 탈퇴 실패 안내·구독 해지 안내를 담고 내부 표기가 없다", () => {
  const text = MANUAL.replace(/<[^>]+>/g, " ");
  assert.doesNotMatch(text, /현재 버전 임시 안내/); // VC80 배포 전 임시 상자 — VC82판부터 없음
  assert.match(text, /「회원탈퇴를 처리하지 못했어요\. 잠시 후 다시 시도해 주세요\.」가 표시됩니다/);
  assert.match(text, /계정은 아직 삭제되지 않았습니다/);
  assert.match(text, /스토어 구독은 탈퇴만으로 해지되지 않으므로 스토어의 구독 관리 화면에서 따로 해지해 주세요/);
  // 매뉴얼이 계정 삭제 페이지로 연결한다면 그 주소는 이 공개 주소다.
  for (const m of MANUAL.matchAll(/<a href="([^"]*delete-account[^"]*)"/g)) assert.equal(m[1], DELETE_URL);
  for (const banned of [/device_unidentified/, /installationId/, /Issue #79/, /VC80/]) assert.doesNotMatch(text, banned);
});

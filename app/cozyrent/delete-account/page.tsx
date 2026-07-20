import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { siteConfig } from "@/lib/site";

// 코지임대(CozyRent) 계정 삭제 안내 — Google Play 계정 삭제 정책용 영구 공개 URL.
// 앱 내부 회원탈퇴(설정 > 계정 > 회원탈퇴)가 1차 경로이며, 앱을 쓸 수 없는 경우의 검증된 요청 절차를 함께 안내한다.
export const metadata: Metadata = {
  title: "코지임대 계정 삭제",
  description: "코지임대(CozyRent) 계정 삭제 방법과 처리되는 데이터 안내.",
};

const EFFECTIVE_DATE = "2026년 7월 21일";
const PLAY_SUBSCRIPTIONS_URL = "https://play.google.com/store/account/subscriptions";

// 앱 없이 요청할 때 쓰는 메일 템플릿 — 민감정보(비밀번호·OTP·구매토큰·계약 데이터) 자동 첨부 없음.
const MAIL_SUBJECT = "[코지임대 계정 삭제 요청]";
const MAIL_BODY = [
  "코지임대 계정 삭제를 요청합니다.",
  "",
  "- 가입에 사용한 이메일:",
  "- 로그인 방식(Google / 이메일 중 택1):",
  "",
  "※ 본인 확인을 위해 위 가입 이메일에서 보내주세요.",
  "※ 비밀번호·인증번호(OTP)·결제 토큰·계약/임대 데이터는 적지 마세요(필요하지 않습니다).",
].join("\n");

export default function CozyrentDeleteAccountPage() {
  const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(MAIL_SUBJECT)}&body=${encodeURIComponent(MAIL_BODY)}`;

  return (
    <div className="container-page py-20">
      <PageHeader eyebrow="코지임대 · 계정" title="계정 삭제" description="코지임대(CozyRent) 계정을 삭제하는 방법입니다." />

      <div className="mx-auto mt-12 max-w-3xl space-y-10 leading-relaxed text-[--muted]">
        <p className="text-sm text-[--muted-2]">최종 수정일: {EFFECTIVE_DATE}</p>

        <section>
          <h2 className="text-xl font-semibold text-foreground">1. 앱에서 바로 삭제하기 (권장)</h2>
          <p className="mt-3">
            코지임대 앱에서 <strong className="text-foreground">설정 &gt; 계정 &gt; 회원탈퇴</strong>를 선택하면 계정을 직접 삭제할 수 있습니다.
            안내와 확인 단계를 거친 뒤 서버 계정과 관련 데이터가 삭제되며, 이 기기의 임대관리 데이터는 유지/삭제를 직접 선택할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. 앱을 사용할 수 없는 경우</h2>
          <p className="mt-3">
            앱을 설치·실행할 수 없다면 아래 방법으로 삭제를 요청할 수 있습니다.
          </p>
          <p className="mt-3">
            <a
              href={mailto}
              className="inline-block rounded-lg bg-[--accent] px-5 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
            >
              이메일로 삭제 요청하기
            </a>
          </p>
          <p className="mt-4">요청 시 필요한 최소 정보:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>가입에 사용한 이메일 주소</li>
            <li>로그인 방식(Google 또는 이메일)</li>
          </ul>
          <p className="mt-3">
            본인 확인을 위해 <strong className="text-foreground">가입한 이메일 주소에서</strong> 보내주세요. 확인 후 처리합니다.
          </p>
          <p className="mt-3 rounded-lg border border-[--border] bg-[--surface]/40 px-4 py-3 text-sm">
            <strong className="text-foreground">보안 안내:</strong> 비밀번호·인증번호(OTP)·결제 토큰·계약이나 임대 데이터는 요청 메일에 적지 마세요. 계정 삭제에 필요하지 않으며, 요청하지도 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. 삭제되는 데이터와 보존되는 기록</h2>
          <p className="mt-3">계정 삭제 시 처리 내용:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li><strong className="text-foreground">삭제:</strong> 서버에 저장된 계정 식별 정보, 로그인·세션 정보, 구독 이용권한(entitlement) 정보, 서버 백업(이용한 경우).</li>
            <li><strong className="text-foreground">기기 내 임대관리 데이터:</strong> 앱에서 유지/삭제를 직접 선택합니다(웹 요청의 경우 기기 데이터는 앱에서 직접 삭제).</li>
            <li>
              <strong className="text-foreground">보존될 수 있는 기록:</strong> 결제·거래·환불 관련 기록 등 관련 법령상 보존이 필요한 최소 정보는, 개인 식별을 최소화한 형태로 법정 보존기간 동안 보관될 수 있습니다.
              또한 무료체험 재지급 방지를 위한 최소한의 식별 불가능한 근거가 보존될 수 있습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Google Play 구독은 별도로 해지해야 합니다</h2>
          <p className="mt-3">
            계정을 삭제해도 <strong className="text-foreground">Google Play 구독은 자동으로 해지되지 않습니다.</strong> 유료 구독 중이라면 계정 삭제와 별개로 Google Play에서 직접 해지해 주세요.
          </p>
          <p className="mt-3">
            <a
              href={PLAY_SUBSCRIPTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[--accent] hover:underline"
            >
              Google Play 정기결제(구독) 관리 열기 →
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. 예상 처리 절차</h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5">
            <li>요청 접수 및 본인(가입 이메일) 확인</li>
            <li>서버 계정·관련 데이터 삭제 처리</li>
            <li>법령상 보존 대상 기록은 식별 최소화 형태로 분리 보존</li>
            <li>처리 완료 안내</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. 문의</h2>
          <p className="mt-3">
            계정 삭제 문의:{" "}
            <a href={`mailto:${siteConfig.contactEmail}`} className="text-[--accent] hover:underline">
              {siteConfig.contactEmail}
            </a>
          </p>
          <p className="mt-2 text-sm text-[--muted-2]">
            개인정보 처리에 대한 자세한 내용은{" "}
            <Link href="/cozyrent/privacy" className="text-[--accent] hover:underline">코지임대 개인정보처리방침</Link>을 확인해 주세요.
          </p>
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { siteConfig } from "@/lib/site";

// 코지임대(CozyRent) 전용 이용약관. 공용 /terms(CozyBuilder 일반 — 결제/구독 미제공 명시)와 분리.
// 코지임대는 40일 무료체험 + Google Play 구독을 제공하므로 별도 라우트로 소유.
export const metadata: Metadata = {
  title: "코지임대 이용약관",
  description: "코지임대(CozyRent) 서비스 이용약관 — 40일 무료체험 및 구독 정책 포함.",
};

const EFFECTIVE_DATE = "2026년 7월 21일";

export default function CozyrentTermsPage() {
  return (
    <div className="container-page py-20">
      <PageHeader eyebrow="코지임대 · Legal" title="이용약관" description="코지임대(CozyRent) 서비스에 적용됩니다." />

      <div className="mx-auto mt-12 max-w-3xl space-y-10 leading-relaxed text-[--muted]">
        <p className="text-sm text-[--muted-2]">시행일: {EFFECTIVE_DATE}</p>

        <p>
          본 약관은 <strong className="text-foreground">코지임대(CozyRent)</strong> 모바일 앱(이하 &ldquo;서비스&rdquo;) 이용에 적용됩니다.
          CozyBuilder의 <Link href="/terms" className="text-[--accent] hover:underline">공용 이용약관</Link>은 코지임대에 적용되지 않으며, 코지임대에는 본 약관이 우선합니다.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-foreground">1. 서비스 정의</h2>
          <p className="mt-3">
            코지임대는 건물주·임대인이 건물·호실·계약·납부·수선 등 임대관리를 모바일에서 처리할 수 있도록 돕는 앱입니다. 운영자는 {siteConfig.companyName}(대표 {siteConfig.representative})입니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. 가입 및 계정</h2>
          <p className="mt-3">
            이용자는 Google 로그인 또는 이메일 인증(OTP)으로 가입·로그인합니다. 계정 정보는 정확해야 하며, 이용자는 자신의 계정 관리에 책임을 집니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. 무료체험 (40일)</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>회원가입 완료 시 베이직 플랜 기준 <strong className="text-foreground">40일 무료체험</strong>을 제공합니다.</li>
            <li>계정당 최초 1회 제공하며, 탈퇴 후 재가입·재설치·기기 변경 시 재지급하지 않습니다.</li>
            <li><strong className="text-foreground">결제수단을 등록하지 않습니다.</strong></li>
            <li>체험 종료 후 <strong className="text-foreground">자동으로 결제되지 않습니다.</strong></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. 무료체험 권한과 종료 후 이용</h2>
          <p className="mt-3">무료체험 중에는 베이직 플랜과 동일한 한도로 이용할 수 있습니다: 건물 1개, 호실 20개.</p>
          <p className="mt-3">체험이 종료되고 구독하지 않은 경우:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>홈 화면과 오늘 할 일 등 현황 <strong className="text-foreground">열람은 계속 가능</strong>합니다.</li>
            <li>이미 저장된 <strong className="text-foreground">데이터는 삭제되지 않습니다.</strong></li>
            <li>신규 등록·수정·납부·수선·입주·퇴실 등 <strong className="text-foreground">업무 처리는 제한</strong>됩니다.</li>
            <li>구독하면 기존 데이터와 기능이 즉시 정상 복구됩니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. 구독 플랜</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>베이직: 월 6,900원 — 건물 1개 · 호실 20개</li>
            <li>스탠다드: 월 12,900원 — 건물 3개 · 호실 60개</li>
            <li>프리미엄: 월 24,900원 — 무제한</li>
          </ul>
          <p className="mt-3">위 건물·호실 수량은 1차 출시 기준 한도이며, 정책·요금은 변경될 수 있고 변경 시 사전 고지합니다.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. 결제·자동 갱신·해지·환불</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>구독 결제는 <strong className="text-foreground">Google Play 정기결제</strong>로 이루어집니다.</li>
            <li>구독은 각 결제 주기마다 <strong className="text-foreground">자동 갱신</strong>되며, 청구 시점과 금액은 Google Play 및 선택한 플랜을 따릅니다.</li>
            <li>해지는 <strong className="text-foreground">Google Play 스토어 &gt; 정기결제(구독)</strong>에서 언제든지 할 수 있습니다.</li>
            <li>해지하더라도 <strong className="text-foreground">이미 결제된 기간의 만료일까지는 정상 이용</strong>할 수 있으며, 만료 후에는 미구독(홈 전용) 상태가 됩니다.</li>
            <li>환불·취소는 <strong className="text-foreground">Google Play의 환불 정책 및 관련 법령</strong>에 따릅니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. 플랜 변경</h2>
          <p className="mt-3">
            상위 플랜으로 변경 시 즉시 상위 한도가 적용되며, 하위 플랜으로 변경 시 다음 결제 주기부터 적용될 수 있습니다. 구체적 적용 시점은 Google Play의 정기결제 변경 방식을 따릅니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">8. 서비스 장애·점검</h2>
          <p className="mt-3">
            운영자는 서비스 점검·개선을 위해 서비스의 전부 또는 일부를 일시 중단할 수 있으며, 중요한 경우 사전 또는 사후에 안내합니다. 코지임대는 오프라인 우선으로 설계되어 네트워크가 없어도 핵심 기능이 동작합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">9. 데이터 백업과 이용자 책임</h2>
          <p className="mt-3">
            임대관리 데이터는 기본적으로 이용자의 기기에 저장됩니다. 이용자는 앱의 백업 기능을 이용해 데이터를 스스로 백업·보관할 책임이 있으며, 기기 분실·초기화·앱 삭제 등으로 인한 로컬 데이터 손실에 대해 운영자는 책임지지 않습니다(관련 법령이 정한 경우 제외).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">10. 금지행위</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>서비스의 정상 운영을 방해하거나 부정한 방법으로 이용하는 행위</li>
            <li>타인의 계정·정보를 도용하거나 권한 없이 접근하는 행위</li>
            <li>법령 또는 본 약관을 위반하는 행위</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">11. 계정 정지·해지</h2>
          <p className="mt-3">
            이용자가 본 약관 또는 관련 법령을 위반하는 경우 운영자는 사전 또는 사후 통지와 함께 이용을 제한하거나 계정을 정지·해지할 수 있습니다. 이용자는 언제든지 이용을 중단하고 계정 삭제를 요청할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">12. 서비스 변경·종료</h2>
          <p className="mt-3">
            운영자는 서비스의 내용을 변경하거나 종료할 수 있으며, 종료 시 합리적인 기간을 두어 사전 고지하고 데이터 백업·이전 방법을 안내합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">13. 책임의 제한</h2>
          <p className="mt-3">
            운영자는 관련 법령이 허용하는 범위에서, 서비스 이용으로 발생한 간접·부수적 손해에 대해 책임을 제한할 수 있습니다. 다만 운영자의 고의 또는 중대한 과실로 인한 손해는 제외합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">14. 준거법 및 분쟁 처리</h2>
          <p className="mt-3">
            본 약관은 대한민국 법령에 따라 해석되며, 서비스 이용과 관련한 분쟁은 관련 법령이 정한 절차와 관할에 따릅니다. 분쟁이 발생하면 이용자와 운영자는 성실히 협의하여 해결하도록 노력합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">15. 문의 및 시행</h2>
          <p className="mt-3">
            문의:{" "}
            <a href={`mailto:${siteConfig.contactEmail}`} className="text-[--accent] hover:underline">
              {siteConfig.contactEmail}
            </a>
          </p>
          <p className="mt-2">본 약관은 {EFFECTIVE_DATE}부터 시행합니다.</p>
          <p className="mt-2 text-sm text-[--muted-2]">
            코지임대 개인정보처리방침은{" "}
            <Link href="/cozyrent/privacy" className="text-[--accent] hover:underline">여기</Link>에서 확인할 수 있습니다.
          </p>
        </section>
      </div>
    </div>
  );
}

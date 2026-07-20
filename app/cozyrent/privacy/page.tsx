import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { siteConfig } from "@/lib/site";

// 코지임대(CozyRent) 전용 개인정보처리방침. 공용 /privacy(CozyBuilder 일반)와 분리된 서비스별 문서.
export const metadata: Metadata = {
  title: "코지임대 개인정보처리방침",
  description: "코지임대(CozyRent) 서비스의 개인정보 수집·이용·보관 방침.",
};

const EFFECTIVE_DATE = "2026년 7월 21일";

export default function CozyrentPrivacyPage() {
  return (
    <div className="container-page py-20">
      <PageHeader eyebrow="코지임대 · Legal" title="개인정보처리방침" description="코지임대(CozyRent) 서비스에 적용됩니다." />

      <div className="mx-auto mt-12 max-w-3xl space-y-10 leading-relaxed text-[--muted]">
        <p className="text-sm text-[--muted-2]">시행일: {EFFECTIVE_DATE}</p>

        <p>
          본 방침은 <strong className="text-foreground">코지임대(CozyRent)</strong> 모바일 앱(이하 &ldquo;서비스&rdquo;)에만
          적용됩니다. CozyBuilder의 다른 서비스에는 각 서비스의 방침 또는{" "}
          <Link href="/privacy" className="text-[--accent] hover:underline">공용 개인정보처리방침</Link>이 적용됩니다.
          운영자는 이용자의 개인정보를 중요하게 생각하며, 아래와 같이 수집·이용·보관합니다.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-foreground">1. 서비스와 운영자</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>서비스명: 코지임대 / CozyRent (Android 앱)</li>
            <li>운영자(사업자): {siteConfig.companyName}</li>
            <li>대표자: {siteConfig.representative}</li>
            <li>사업자등록번호: {siteConfig.businessNumber}</li>
            <li>
              개인정보 보호 문의:{" "}
              <a href={`mailto:${siteConfig.contactEmail}`} className="text-[--accent] hover:underline">
                {siteConfig.contactEmail}
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. 수집하는 개인정보 항목</h2>
          <p className="mt-3">서비스 제공에 필요한 최소한의 정보만 수집합니다.</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Google 로그인 이용 시: Google 계정 식별자 및 이메일 주소</li>
            <li>이메일 인증(OTP) 로그인 이용 시: 이메일 주소</li>
            <li>서버 내부 사용자 식별자(회원 구분용 ID)</li>
            <li>구독·결제 검증에 필요한 Google Play 구매 정보(구매 토큰 등) — 구독 권한 확인 목적에 한해 처리하며, 원문은 이용자에게 노출하지 않습니다.</li>
            <li>고객지원 문의 시: 이용자가 문의 메일에 직접 적은 내용과 앱 버전·기기 종류 등 최소 기술정보(문제 진단용, 이용자가 확인 후 발송).</li>
          </ul>
          <p className="mt-3">
            서비스는 <strong className="text-foreground">주민등록번호, 전화번호, 위치정보를 수집하지 않습니다.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. 임대관리 데이터와 저장 위치</h2>
          <p className="mt-3">
            이용자가 입력하는 임대관리 데이터(건물, 호실, 계약, 임차인, 납부 기록, 수선·하자 기록, 백업 데이터 등)는
            원칙적으로 <strong className="text-foreground">이용자의 기기 내부 저장소(로컬 SQLite)에 저장</strong>되며, 별도의 서버 자동 업로드 없이 기기에 보관됩니다.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li><strong className="text-foreground">기기(로컬):</strong> 임대관리 데이터 원본, 앱 설정, 백업 파일 내보내기 대상.</li>
            <li><strong className="text-foreground">서버:</strong> 로그인·인증에 필요한 계정 식별 정보, 구독·이용권한(entitlement) 확인 정보. 클라우드 백업 기능을 이용하는 경우에 한해 백업 데이터가 서버에 저장될 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. 수집·이용 목적</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>회원 인증 및 로그인 세션 유지</li>
            <li>임대관리 데이터의 저장·백업·복구</li>
            <li>무료체험·구독 이용권한(플랜 한도 포함) 확인</li>
            <li>고객지원 및 문의 응대</li>
            <li>서비스 안정성 확보 및 오류 진단</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. 결제 및 처리 위탁(수탁자)</h2>
          <p className="mt-3">
            구독 결제는 <strong className="text-foreground">Google Play 결제(Google Play Billing)</strong>를 통해 이루어지며, 결제 수단 정보는 Google이 처리하고 서비스는 이를 저장하지 않습니다.
            서비스 운영을 위해 아래 처리자를 이용합니다.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li><strong className="text-foreground">Supabase:</strong> 인증(로그인), 서버 데이터베이스, 서버 기능 처리.</li>
            <li><strong className="text-foreground">Google:</strong> Google 로그인 인증, Google Play를 통한 구독 결제 및 결제 검증.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. 개인정보의 국외 이전</h2>
          <p className="mt-3">
            위 처리자(Supabase, Google)는 해외 사업자로서, 이용자의 계정·구독 관련 정보가 국외의 서버 인프라에서 처리·보관될 수 있습니다.
            각 처리자의 데이터 처리 위치와 보호 정책은 해당 사업자의 정책을 따르며, 임대관리 데이터 원본은 이용자의 기기에 로컬 저장되어 국외로 이전되지 않습니다(클라우드 백업 이용 시 제외).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. 보유 및 이용기간</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>계정·인증 정보: 회원 자격을 유지하는 동안 보관하며, 탈퇴·삭제 요청 시 지체 없이 파기합니다.</li>
            <li>구독·결제 검증 기록: 관련 법령상 보존이 필요한 결제·거래 기록은 해당 법령이 정한 기간 동안 보존할 수 있습니다.</li>
            <li>기기 내 임대관리 데이터: 이용자가 앱에서 직접 관리·삭제하며, 앱 삭제 시 기기에서 제거됩니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">8. 계정 탈퇴·삭제 시 처리</h2>
          <p className="mt-3">
            이용자는 고객지원 이메일(<a href={`mailto:${siteConfig.contactEmail}`} className="text-[--accent] hover:underline">{siteConfig.contactEmail}</a>)로 계정 삭제를 요청할 수 있습니다.
            요청 시 서버에 저장된 계정 식별 정보와 구독 관련 정보를 파기하며, 관련 법령상 보존이 필요한 결제·거래 기록은 그 기간 동안 예외적으로 보존합니다.
            기기 내 로컬 데이터는 앱 삭제 또는 앱 내 데이터 초기화로 제거할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">9. 이용자의 권리</h2>
          <p className="mt-3">
            이용자는 자신의 개인정보에 대해 열람·정정·삭제·처리정지를 요청할 수 있으며, 고객지원 이메일을 통해 행사할 수 있습니다.
            서비스는 요청을 확인 후 관련 법령에 따라 지체 없이 처리합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">10. 아동의 개인정보</h2>
          <p className="mt-3">
            코지임대는 건물·임대를 관리하는 성인 이용자를 대상으로 하며, 만 14세 미만 아동을 대상으로 하지 않습니다. 아동의 개인정보를 알면서 수집하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">11. 변경 고지</h2>
          <p className="mt-3">
            본 방침이 변경되는 경우 시행일과 변경 내용을 본 페이지에 게시하여 고지합니다. 중요한 변경은 앱 또는 이메일을 통해 별도 안내할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">12. 문의</h2>
          <p className="mt-3">
            개인정보 관련 문의:{" "}
            <a href={`mailto:${siteConfig.contactEmail}`} className="text-[--accent] hover:underline">
              {siteConfig.contactEmail}
            </a>
          </p>
          <p className="mt-2 text-sm text-[--muted-2]">
            코지임대 이용약관은{" "}
            <Link href="/cozyrent/terms" className="text-[--accent] hover:underline">여기</Link>에서 확인할 수 있습니다.
          </p>
        </section>
      </div>
    </div>
  );
}

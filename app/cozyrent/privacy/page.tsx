import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { siteConfig } from "@/lib/site";

// 코지임대(CozyRent) 전용 개인정보처리방침. 공용 /privacy(CozyBuilder 일반)와 분리된 서비스별 문서.
// 2026-09-22 개정: 실제 제품의 데이터 흐름(로그인 계정 서버 자동백업 · 기기 등록 정보 · Sentry 오류 진단)과
// 문구를 일치시켰다. 근거는 cozyrent 저장소의 코드·결정문(D-159B 서버 자동백업 · D-188 오류추적 · D-186 prod 환경)이며,
// 여기에는 실제로 처리하는 사실만 적는다(구현되지 않은 자동 삭제·보장성 표현은 쓰지 않는다).
export const metadata: Metadata = {
  title: "코지임대 개인정보처리방침",
  description: "코지임대(CozyRent) 서비스의 개인정보 수집·이용·보관 방침.",
};

const EFFECTIVE_DATE = "2026년 9월 22일";
const PREVIOUS_EFFECTIVE_DATE = "2026년 7월 21일";

export default function CozyrentPrivacyPage() {
  return (
    <div className="container-page py-20">
      <PageHeader eyebrow="코지임대 · Legal" title="개인정보처리방침" description="코지임대(CozyRent) 서비스에 적용됩니다." />

      <div className="mx-auto mt-12 max-w-3xl space-y-10 leading-relaxed text-[--muted]">
        <p className="text-sm text-[--muted-2]">
          시행일: {EFFECTIVE_DATE} (최초 시행 {PREVIOUS_EFFECTIVE_DATE} · 이번 개정에서 서버 자동 백업, 기기 등록 정보, 오류 진단 정보의 처리 내용을 실제 서비스 동작에 맞게 구체화했습니다.)
        </p>

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
            <li>Google 로그인 이용 시: Google 계정 식별자 및 이메일 주소. Google이 로그인 시 함께 제공하는 기본 프로필 정보(이름·프로필 사진 URL)가 인증 처리자의 계정 정보에 함께 저장될 수 있으며, 서비스 기능에는 사용하지 않습니다.</li>
            <li>이메일 인증(OTP) 로그인 이용 시: 이메일 주소</li>
            <li>서버 내부 사용자 식별자(회원 구분용 ID)</li>
            <li>
              구독·결제 검증에 필요한 Google Play 구매 정보(구매 토큰, 상품·플랜, 구독 상태·만료 시점) — 구독 권한 확인 목적에 한해 처리하며, 원문은 이용자에게 노출하지 않습니다. 결제 수단(카드) 정보는 수집하지 않습니다.
            </li>
            <li>
              기기 등록 정보(1계정 1활성 휴대폰 관리용): 앱이 설치 시 임의로 생성한 설치 식별자(기기 하드웨어 식별자가 아님), 기기 표시 이름(이용자가 기기 설정에서 지정한 기기 이름이 있으면 그 이름, 없으면 제조사·모델명), 플랫폼, 등록·최근 사용 시각. IMEI·일련번호·광고 ID는 사용하지 않습니다.
            </li>
            <li>
              오류·진단 정보(앱 안정성 확보): 오류 종류와 발생 위치(스택 정보), 앱 버전·빌드 식별자, 운영체제 버전·기기 모델, 미리 정해진 화면·동작 식별자. 이름·이메일·전화번호·주소·금액·메모·사진·인증 토큰 등 이용자 데이터 원문은 전송하지 않도록 앱에서 차단합니다(제5조 Sentry 참조).
            </li>
            <li>고객지원 문의 시: 이용자가 문의 메일에 직접 적은 내용과 앱 버전·기기 종류 등 최소 기술정보(문제 진단용, 이용자가 확인 후 발송).</li>
          </ul>
          <p className="mt-3">
            서비스는 <strong className="text-foreground">이용자 본인의 주민등록번호, 전화번호, 위치정보를 수집하지 않습니다.</strong> 회원가입·로그인·본인 확인에 전화번호를 사용하지 않습니다.
            다만 이용자가 임대관리 목적으로 직접 입력하는 임차인·거래처 등 제3자의 연락처는 제3조의 임대관리 데이터로서 저장·백업됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. 임대관리 데이터의 저장·자동 백업</h2>
          <p className="mt-3">
            이용자가 입력하는 임대관리 데이터는 <strong className="text-foreground">이용자의 기기 내부 저장소(로컬 SQLite)에 저장</strong>되며, 앱은 이 데이터를 1차 원본으로 사용합니다.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">로그인한 계정의 임대관리 데이터는 데이터 보호와 기기 변경 시 복원을 위해 서버에 자동으로 백업됩니다.</strong>{" "}
            자동 백업은 로그인 상태에서 데이터가 변경되면 자동으로 실행되며(별도의 백업 버튼이나 켜기/끄기 설정은 없습니다), 무료체험·유료 구독·구독 만료 상태와 관계없이 로그인한 모든 이용자에게 동일하게 적용됩니다.
            로그아웃하면 자동 백업이 중지되고, 계정을 삭제하면 서버에 저장된 백업도 삭제됩니다(제8조). 자동 백업 상태는 앱의 설정 &gt; 데이터 관리에서 확인할 수 있습니다.
          </p>
          <p className="mt-3">자동 백업에 포함되는 데이터 범주:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>건물·호실 정보(건물명, 주소, 준공일, 주차 등)와 이용자가 입력한 건물 소유자 연락처</li>
            <li>계약 정보(보증금·임대료·관리비·기간·납부일, 특약 메모 등)</li>
            <li>임차인·공동거주자 정보(이름, 전화번호, 생년월일, 비상연락처, 메모 등 이용자가 입력한 항목)</li>
            <li>입금·출금·미납·보증금 반환·퇴실 정산 기록</li>
            <li>지출, 수선·하자, 시설·점검 기록과 메모</li>
            <li>거래처·업체·중개업소 연락처(상호, 담당자, 전화번호)</li>
            <li>입주·시설·하자·수리·퇴실·점검 사진</li>
            <li>앱 사용에 필요한 일부 설정값</li>
          </ul>
          <p className="mt-3">
            위 데이터에는 <strong className="text-foreground">이용자가 직접 입력한 임차인·거래처 등 제3자의 개인정보가 포함될 수 있습니다.</strong> 이용자는 그 정보를 임대관리 목적 범위에서 관련 법령에 맞게 처리해야 하며, 운영자는 이용자의 백업 데이터를 이용자 계정의 보관·복원 목적 외로 이용하지 않습니다.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li><strong className="text-foreground">기기(로컬):</strong> 임대관리 데이터 원본, 앱 설정, 사진 파일, 백업 파일 내보내기 대상.</li>
            <li>
              <strong className="text-foreground">서버:</strong> 로그인·인증에 필요한 계정 식별 정보, 구독·이용권한(entitlement) 확인 정보, 기기 등록 정보, 그리고 위 자동 백업 데이터(임대관리 데이터 스냅샷과 사진).
              백업 데이터는 이용자 계정 전용의 비공개 저장 공간에 보관되며, 서버는 백업 파일의 경로·크기·해시 등 관리용 메타정보를 기록하고 백업 내용을 이용자 계정의 복원 목적으로만 처리합니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. 수집·이용 목적</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>회원 인증 및 로그인 세션 유지</li>
            <li>임대관리 데이터의 저장, 서버 자동 백업, 기기 변경 시 복원</li>
            <li>1계정 1활성 휴대폰 정책에 따른 기기 등록·전환 관리</li>
            <li>무료체험·구독 이용권한(플랜 한도 포함) 확인 및 무료체험 중복 지급 방지</li>
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
            <li>
              <strong className="text-foreground">Supabase:</strong> 인증(로그인), 서버 데이터베이스, 서버 기능 처리, 자동 백업 데이터(임대관리 데이터 스냅샷·사진)의 저장.
              서비스의 운영 프로젝트는 대한민국(서울) 리전의 인프라를 사용합니다.
            </li>
            <li>
              <strong className="text-foreground">Google:</strong> Google 로그인 인증, Google Play를 통한 구독 결제, Google Play 개발자 API를 통한 구매 정보(구매 토큰) 검증.
            </li>
            <li>
              <strong className="text-foreground">Sentry:</strong> 앱 오류·비정상 종료 진단 정보의 수집·분석. 앱은 개인정보 자동 첨부를 끄고(사용자 식별·요청 정보 미전송), 이용자 데이터 원문이 오류 정보에 포함되지 않도록 전송 전에 제거합니다. 화면 녹화·세션 재생·성능 추적 기능은 사용하지 않습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. 개인정보의 국외 이전</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">임대관리 데이터와 자동 백업(사진 포함):</strong> 임대관리 데이터 원본은 이용자의 기기에 저장되고, 서버 자동 백업 사본(사진 포함)은 대한민국(서울) 리전의 Supabase 인프라에 저장됩니다. Supabase는 해외 사업자이며, 인증·운영 로그 등 부속 정보의 처리 위치는 해당 사업자의 정책을 따릅니다.
            </li>
            <li>
              <strong className="text-foreground">Google 로그인·Google Play 결제 정보:</strong> Google 계정 식별자·이메일과 구매 토큰 검증 정보는 Google의 국외 서버에서 처리될 수 있습니다.
            </li>
            <li>
              <strong className="text-foreground">오류·진단 정보:</strong> Sentry의 유럽연합(독일) 리전 서버에서 처리됩니다. 여기에는 이용자 식별정보와 임대관리 데이터 원문이 포함되지 않도록 앱에서 차단합니다.
            </li>
          </ul>
          <p className="mt-3">각 처리자의 데이터 처리 위치와 보호 정책은 해당 사업자의 정책을 따릅니다.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. 보유 및 이용기간</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>계정·인증 정보, 기기 등록 정보: 회원 자격을 유지하는 동안 보관하며, 탈퇴 시 삭제합니다.</li>
            <li>
              서버 자동 백업 데이터: 계정이 유지되는 동안 계정당 최신 백업 스냅샷 3개를 보관하고 이전 스냅샷은 순차 삭제합니다. 백업에 포함된 사진 파일은 계정 안에서 내용(해시) 기준으로 보관되므로 이전 스냅샷에만 남아 있던 사진 파일은 계정이 유지되는 동안 서버에 남을 수 있습니다. 구독 만료 여부와 무관하게 보관하며, 탈퇴 시 백업 스냅샷과 사진 파일을 함께 삭제합니다.
              향후 장기 미이용 계정의 백업 보관기간을 제한하는 경우 시행 전에 본 방침에 고지합니다.
            </li>
            <li>
              구독·결제 검증 기록: 회계·환불·부정 사용 대조를 위해 필요한 최소 기록은 탈퇴 후 개인 식별 정보를 제거한 형태로 보존하며, 관련 법령상 보존이 필요한 결제·거래 기록은 해당 법령이 정한 기간 동안 보존할 수 있습니다.
            </li>
            <li>
              무료체험 중복 지급 방지 근거: 탈퇴 시 로그인 식별자(Google 계정 식별자 등)와 이메일을 서버가 보관하는 비밀키로 계산한 일방향 해시(HMAC-SHA256) 값으로 변환하여 탈퇴 시각·무료체험 이용 시각과 함께 보존합니다. 해시 값에서 원문을 되돌릴 수는 없으나 같은 이메일·식별자를 다시 해시하면 대조할 수 있으므로 가명정보로서 개인정보에 해당할 수 있습니다. 무료체험 중복 지급 방지 목적이 존속하는 동안 보존하며 현재 별도 삭제 기한을 두지 않습니다.
            </li>
            <li>오류·진단 정보: 처리자(Sentry)가 정한 보관 기간 동안 보관되며 그 기간이 지나면 처리자 정책에 따라 삭제됩니다.</li>
            <li>기기 내 임대관리 데이터: 이용자가 앱에서 직접 관리·삭제하며, 앱 삭제 시 기기에서 제거됩니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">8. 계정 탈퇴·삭제 시 처리</h2>
          <p className="mt-3">
            이용자는 앱에서 <strong className="text-foreground">설정 &gt; 데이터 및 계정 삭제 &gt; 회원탈퇴</strong>를 통해 계정을 직접 삭제할 수 있으며, 앱을 사용할 수 없는 경우 고객지원 이메일(
            <a href={`mailto:${siteConfig.contactEmail}`} className="text-[--accent] hover:underline">{siteConfig.contactEmail}</a>)로 삭제를 요청할 수 있습니다.
            절차는 <Link href="/cozyrent/delete-account" className="text-[--accent] hover:underline">코지임대 계정 삭제 안내</Link>에서 확인할 수 있습니다.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li><strong className="text-foreground">삭제:</strong> 서버에 저장된 계정 식별 정보, 로그인·세션 정보, 구독 이용권한 정보, 기기 등록 정보, 서버 자동 백업 데이터(임대관리 데이터 스냅샷과 사진).</li>
            <li><strong className="text-foreground">식별정보 제거 후 보존:</strong> 결제·구독 원장 등 회계·환불 대조에 필요한 최소 기록과 구매 토큰 등 스토어 구독 식별값(계정 연결 제거 · 제7조), 무료체험 중복 지급 방지용 해시 값(제7조).</li>
            <li><strong className="text-foreground">기기 내 데이터:</strong> 앱 내 탈퇴 시 이 기기의 임대관리 데이터를 유지할지 삭제할지 이용자가 선택합니다. 이메일 요청의 경우 기기 데이터는 앱 삭제 또는 앱 내 데이터 초기화로 제거할 수 있습니다.</li>
          </ul>
          <p className="mt-3">
            계정을 삭제해도 Google Play 구독은 자동으로 해지되지 않으므로, 유료 구독 중이라면 Google Play에서 별도로 해지해야 합니다.
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

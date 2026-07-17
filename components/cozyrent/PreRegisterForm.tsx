"use client";

import { useRef, useState } from "react";

// 코지임대 사전신청 폼. 설계: docs/landing/COZYRENT_PRELAUNCH.md
// - 입력보다 선택 우선(칩 버튼), 오류는 인라인 표시, 제출 중 중복 클릭 방지.
// - 저장은 /api/cozyrent/preregister(service_role)만 수행 — 클라이언트 직접 insert 없음.
// - 유입 출처는 ?src= query 로 받는다(형식 불일치 시 서버가 기본값 처리).

const CONTACT_OPTIONS = [
  { value: "phone", label: "휴대전화" },
  { value: "email", label: "이메일" },
] as const;

const BUILDING_OPTIONS = [
  { value: "oneroom", label: "원룸" },
  { value: "dagagu", label: "다가구" },
  { value: "sanggajutaek", label: "상가주택" },
  { value: "etc", label: "기타" },
] as const;

const UNIT_OPTIONS = [
  { value: "1-5", label: "1~5호" },
  { value: "6-10", label: "6~10호" },
  { value: "11-20", label: "11~20호" },
  { value: "21+", label: "21호 이상" },
] as const;

const PAIN_OPTIONS = [
  { value: "rent", label: "월세·미납" },
  { value: "contract", label: "계약" },
  { value: "repair", label: "수선" },
  { value: "moveout", label: "퇴실" },
  { value: "expense", label: "지출" },
  { value: "etc", label: "기타" },
] as const;

const PHONE_RE = /^01[016789][0-9]{7,8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("82") && digits.length >= 11) digits = "0" + digits.slice(2);
  return digits;
}

type Status = "idle" | "submitting" | "success" | "duplicate" | "server_error";

function ChipGroup({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly { value: string; label: string }[];
  value: string | null;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2.5">
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(o.value)}
            className={`min-h-[52px] cursor-pointer rounded-xl border px-5 text-base font-medium transition-colors ${
              selected
                ? "border-[--accent] bg-[--accent]/15 text-foreground"
                : "border-[--border-strong] bg-[--surface-2] text-[--muted] hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-2 text-sm text-red-400">
      {message}
    </p>
  );
}

export default function PreRegisterForm() {
  const [name, setName] = useState("");
  const [contactType, setContactType] = useState<"phone" | "email">("phone");
  const [contact, setContact] = useState("");
  const [buildingType, setBuildingType] = useState<string | null>(null);
  const [unitCount, setUnitCount] = useState<string | null>(null);
  const [painPoint, setPainPoint] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  // 상태 갱신은 비동기라 같은 tick 연타를 못 막는다 — ref 로 동기 가드.
  const submittingRef = useRef(false);

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "이름 또는 닉네임을 입력해주세요.";
    else if (name.trim().length > 40) next.name = "이름은 40자 이내로 입력해주세요.";

    const trimmed = contact.trim();
    if (!trimmed) {
      next.contact =
        contactType === "email" ? "이메일 주소를 입력해주세요." : "휴대전화 번호를 입력해주세요.";
    } else if (contactType === "phone" && !PHONE_RE.test(normalizePhone(trimmed))) {
      next.contact = "휴대전화 번호 형식을 확인해주세요. (예: 010-1234-5678)";
    } else if (contactType === "email" && !EMAIL_RE.test(trimmed.toLowerCase())) {
      next.contact = "이메일 주소 형식을 확인해주세요. (예: name@example.com)";
    }

    if (!buildingType) next.buildingType = "건물 유형을 선택해주세요.";
    if (!consent) next.consent = "개인정보 수집·이용에 동의해주세요.";
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return; // 제출 연타 방지

    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    submittingRef.current = true;
    setStatus("submitting");
    // 유입 출처(?src=) — 형식 검증·기본값 처리는 서버가 담당.
    const source = new URLSearchParams(window.location.search).get("src") ?? "";
    try {
      const res = await fetch("/api/cozyrent/preregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contactType,
          contact: contact.trim(),
          buildingType,
          unitCount,
          painPoint,
          consent,
          source,
        }),
      });

      if (res.status === 201) {
        setStatus("success");
        return;
      }
      if (res.status === 409) {
        setStatus("duplicate");
        return;
      }
      if (res.status === 400) {
        const data = (await res.json().catch(() => null)) as {
          fields?: Record<string, string>;
        } | null;
        if (data?.fields) setErrors(data.fields);
        setStatus("idle");
        return;
      }
      setStatus("server_error");
    } catch {
      setStatus("server_error");
    } finally {
      submittingRef.current = false;
    }
  };

  if (status === "success") {
    return (
      <div className="card border-[--accent]/40 py-12 text-center">
        <p className="text-2xl font-semibold text-foreground">사전신청이 완료되었습니다.</p>
        <p className="mt-4 text-lg leading-relaxed text-[--muted]">
          코지임대 출시 소식과 6,900P 혜택 적용 방법을
          <br />
          안내해드리겠습니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-7 p-6 sm:p-8">
      {status === "duplicate" && (
        <div
          role="alert"
          className="rounded-xl border border-[--accent]/40 bg-[--accent]/10 px-4 py-4 text-base text-foreground"
        >
          이미 신청되어 있습니다.
          <p className="mt-1 text-sm text-[--muted]">
            같은 연락처로 접수된 사전신청이 있어 다시 접수하지 않았습니다. 출시 소식을 기다려주세요.
          </p>
        </div>
      )}
      {status === "server_error" && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-4 text-base text-foreground"
        >
          일시적인 오류로 신청이 접수되지 않았습니다.
          <p className="mt-1 text-sm text-[--muted]">잠시 후 다시 시도해주세요.</p>
        </div>
      )}

      <div>
        <label className="label text-base" htmlFor="pr-name">
          이름 또는 닉네임 <span className="text-[--accent]">*</span>
        </label>
        <Input
          id="pr-name"
          value={name}
          invalid={!!errors.name}
          onChange={(v) => setName(v)}
          placeholder="예: 홍길동"
        />
        <FieldError message={errors.name} />
      </div>

      <div>
        <span className="label text-base">
          연락 수단 <span className="text-[--accent]">*</span>
        </span>
        <ChipGroup
          ariaLabel="연락 수단 선택"
          options={CONTACT_OPTIONS}
          value={contactType}
          onChange={(v) => {
            setContactType(v as "phone" | "email");
            setErrors((prev) => ({ ...prev, contact: "" }));
          }}
        />
        <div className="mt-3">
          <label className="sr-only" htmlFor="pr-contact">
            {contactType === "phone" ? "휴대전화 번호" : "이메일 주소"}
          </label>
          <Input
            id="pr-contact"
            value={contact}
            invalid={!!errors.contact}
            onChange={(v) => setContact(v)}
            type={contactType === "phone" ? "tel" : "email"}
            inputMode={contactType === "phone" ? "tel" : "email"}
            placeholder={contactType === "phone" ? "010-1234-5678" : "name@example.com"}
          />
          <FieldError message={errors.contact} />
        </div>
      </div>

      <div>
        <span className="label text-base">
          건물 유형 <span className="text-[--accent]">*</span>
        </span>
        <ChipGroup
          ariaLabel="건물 유형 선택"
          options={BUILDING_OPTIONS}
          value={buildingType}
          onChange={setBuildingType}
        />
        <FieldError message={errors.buildingType} />
      </div>

      <div>
        <span className="label text-base">관리 호실 수 (선택)</span>
        <ChipGroup
          ariaLabel="관리 호실 수 선택"
          options={UNIT_OPTIONS}
          value={unitCount}
          onChange={(v) => setUnitCount(unitCount === v ? null : v)}
        />
      </div>

      <div>
        <span className="label text-base">가장 불편한 업무 (선택)</span>
        <ChipGroup
          ariaLabel="가장 불편한 업무 선택"
          options={PAIN_OPTIONS}
          value={painPoint}
          onChange={(v) => setPainPoint(painPoint === v ? null : v)}
        />
      </div>

      <div>
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-4 ${
            errors.consent ? "border-red-500/60" : "border-[--border-strong]"
          }`}
        >
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (e.target.checked) setErrors((prev) => ({ ...prev, consent: "" }));
            }}
            className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[--accent]"
          />
          <span className="text-base leading-relaxed text-[--muted]">
            <span className="font-medium text-foreground">
              개인정보 수집·이용에 동의합니다. <span className="text-[--accent]">*</span>
            </span>
            <span className="mt-2 block text-sm leading-relaxed text-[--muted-2]">
              수집 항목: 이름 또는 닉네임, 연락처(휴대전화 또는 이메일), 건물 유형, (선택) 관리
              호실 수·불편한 업무 · 수집 목적: 코지임대 출시 소식 안내, 사전신청 혜택(6,900P) 적용
              안내 · 보유 기간: 목적 달성 후 지체 없이 파기하며, 삭제 요청 시 즉시 파기합니다.
            </span>
          </span>
        </label>
        <FieldError message={errors.consent} />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn btn-accent min-h-[56px] w-full text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "신청 접수 중..." : "무료로 사전신청하기"}
      </button>
    </form>
  );
}

function Input({
  id,
  value,
  onChange,
  invalid,
  type = "text",
  inputMode,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  type?: string;
  inputMode?: "tel" | "email";
  placeholder?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-invalid={invalid || undefined}
      className={`input min-h-[52px] text-base ${invalid ? "border-red-500/60" : ""}`}
    />
  );
}

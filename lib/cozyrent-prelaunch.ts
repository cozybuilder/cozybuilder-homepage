import "server-only";
import { createClient as createServiceSb } from "@supabase/supabase-js";

// 코지임대 사전신청 서버 코어. 설계: docs/landing/COZYRENT_PRELAUNCH.md
// - insert 는 오직 여기(service_role)에서만. 클라이언트 직접 insert 금지(RLS 정책 없음).
// - 연락처 원문은 어떤 경로로도 로그에 출력하지 않는다.
// - 중복은 contact_normalized unique 위반(23505)으로 판정 — 덮어쓰기 금지(upsert 없음).

export const CONTACT_TYPES = ["phone", "email"] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

export const BUILDING_TYPES = ["oneroom", "dagagu", "sanggajutaek", "etc"] as const;
export const UNIT_COUNTS = ["1-5", "6-10", "11-20", "21+"] as const;
export const PAIN_POINTS = ["rent", "contract", "repair", "moveout", "expense", "etc"] as const;

const SOURCE_RE = /^[a-z0-9_-]{1,40}$/;
export const DEFAULT_SOURCE = "landing_cozyrent";

const PHONE_RE = /^01[016789][0-9]{7,8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type SignupInput = {
  name: unknown;
  contactType: unknown;
  contact: unknown;
  buildingType: unknown;
  unitCount: unknown;
  painPoint: unknown;
  consent: unknown;
  source: unknown;
};

export type SignupResult =
  | { ok: true }
  | { ok: false; error: "invalid"; fields: Record<string, string> }
  | { ok: false; error: "duplicate" }
  | { ok: false; error: "server" };

/** 휴대전화 정규화: 숫자만 추출, +82 국가번호는 0 으로 치환. */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("82") && digits.length >= 11) digits = "0" + digits.slice(2);
  return digits;
}

type Validated = {
  row: {
    name: string;
    contact_type: ContactType;
    contact: string;
    contact_normalized: string;
    building_type: string;
    unit_count: string | null;
    pain_point: string | null;
    source: string;
    consent_at: string;
  };
};

/** 서버 검증 + 정규화. 실패 시 필드별 사용자 안내 메시지. */
export function validateSignup(input: SignupInput): Validated | { fields: Record<string, string> } {
  const fields: Record<string, string> = {};

  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name) fields.name = "이름 또는 닉네임을 입력해주세요.";
  else if (name.length > 40) fields.name = "이름은 40자 이내로 입력해주세요.";

  const contactType =
    typeof input.contactType === "string" &&
    (CONTACT_TYPES as readonly string[]).includes(input.contactType)
      ? (input.contactType as ContactType)
      : null;
  if (!contactType) fields.contactType = "연락 수단을 선택해주세요.";

  const contactRaw = typeof input.contact === "string" ? input.contact.trim() : "";
  let contactNormalized = "";
  if (!contactRaw) {
    fields.contact =
      contactType === "email" ? "이메일 주소를 입력해주세요." : "휴대전화 번호를 입력해주세요.";
  } else if (contactType === "phone") {
    contactNormalized = normalizePhone(contactRaw);
    if (!PHONE_RE.test(contactNormalized)) {
      fields.contact = "휴대전화 번호 형식을 확인해주세요. (예: 010-1234-5678)";
    }
  } else if (contactType === "email") {
    contactNormalized = contactRaw.toLowerCase();
    if (contactRaw.length > 254 || !EMAIL_RE.test(contactNormalized)) {
      fields.contact = "이메일 주소 형식을 확인해주세요. (예: name@example.com)";
    }
  }

  const buildingType =
    typeof input.buildingType === "string" &&
    (BUILDING_TYPES as readonly string[]).includes(input.buildingType)
      ? input.buildingType
      : null;
  if (!buildingType) fields.buildingType = "건물 유형을 선택해주세요.";

  // 선택 항목: 값이 있으면 allowlist 검증, 아니면 null.
  const unitCount =
    typeof input.unitCount === "string" && (UNIT_COUNTS as readonly string[]).includes(input.unitCount)
      ? input.unitCount
      : null;
  const painPoint =
    typeof input.painPoint === "string" && (PAIN_POINTS as readonly string[]).includes(input.painPoint)
      ? input.painPoint
      : null;

  if (input.consent !== true) {
    fields.consent = "개인정보 수집·이용에 동의해주세요.";
  }

  const source =
    typeof input.source === "string" && SOURCE_RE.test(input.source)
      ? input.source
      : DEFAULT_SOURCE;

  if (Object.keys(fields).length > 0) return { fields };

  return {
    row: {
      name,
      contact_type: contactType!,
      contact: contactRaw,
      contact_normalized: contactNormalized,
      building_type: buildingType!,
      unit_count: unitCount,
      pain_point: painPoint,
      source,
      consent_at: new Date().toISOString(),
    },
  };
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createServiceSb(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** 사전신청 1건 저장. 중복(23505)은 duplicate 로 구분해 반환한다. */
export async function saveSignup(input: SignupInput): Promise<SignupResult> {
  const validated = validateSignup(input);
  if ("fields" in validated) return { ok: false, error: "invalid", fields: validated.fields };

  const sb = serviceClient();
  if (!sb) {
    console.error("[cozyrent-prelaunch] service client unavailable");
    return { ok: false, error: "server" };
  }

  const { error } = await sb.from("cozyrent_prelaunch_signups").insert(validated.row);
  if (error) {
    if (error.code === "23505") return { ok: false, error: "duplicate" };
    // 연락처 등 개인정보는 로그에 남기지 않는다 — 오류 코드/메시지만.
    console.error("[cozyrent-prelaunch] insert failed:", error.code, error.message);
    return { ok: false, error: "server" };
  }
  return { ok: true };
}

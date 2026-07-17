// 코지임대 사전신청 — DB 코드값 ↔ 한글 표시명 (클라이언트/서버 공용, 서버 전용 코드 금지).
// 코드값 SSOT: lib/cozyrent-prelaunch.ts · supabase/migrations/0013_cozyrent_prelaunch_v1.sql

export const CONTACT_TYPE_LABELS: Record<string, string> = {
  phone: "휴대전화",
  email: "이메일",
};

export const BUILDING_TYPE_LABELS: Record<string, string> = {
  oneroom: "원룸",
  dagagu: "다가구",
  sanggajutaek: "상가주택",
  etc: "기타",
};

export const UNIT_COUNT_LABELS: Record<string, string> = {
  "1-5": "1~5호",
  "6-10": "6~10호",
  "11-20": "11~20호",
  "21+": "21호 이상",
};

export const PAIN_POINT_LABELS: Record<string, string> = {
  rent: "월세·관리비·미납",
  contract: "계약·보증금",
  repair: "수선·시설·하자",
  moveout: "퇴실·정산",
  expense: "고정지출",
  etc: "기타",
};

export const SOURCE_LABELS: Record<string, string> = {
  landing_cozyrent: "직접 방문",
  youtube: "유튜브",
  naver_blog: "네이버 블로그",
  instagram: "인스타그램",
};

/** 등록되지 않은 source 는 원문 표시 — DB check(^[a-z0-9_-]{1,40}$)로 안전한 문자만 저장된다. */
export function sourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

export function label(map: Record<string, string>, code: string | null): string {
  if (!code) return "—";
  return map[code] ?? code;
}

/** 관리자 화면에 표시하는 신청 1건 (contact_normalized 는 조회·표시하지 않는다). */
export type SignupRow = {
  id: number;
  created_at: string;
  name: string;
  contact_type: string;
  contact: string;
  building_type: string;
  unit_count: string | null;
  pain_point: string | null;
  source: string;
  consent_at: string;
};

// 컴퓨터 웹프로그램(앱) 공통 정의. app_key 기준으로 접근/라우팅을 관리한다.
// ebook 전용 아님 — 모든 웹프로그램이 이 구조를 공유한다.

export type AppDefinition = {
  key: string;
  name: string;
  description: string;
  programSlug: string; // Programs 상세와 연결할 슬러그
  // 독립 배포된 앱의 정식 도메인. 있으면 /apps/[key] 가 launch token 발급 후 이 URL 로 redirect.
  // 없으면 아직 독립 배포 전(플레이스홀더). env `<KEY>_APP_URL` 로 오버라이드 가능(스테이징 등).
  launchUrl?: string;
};

export const APP_DEFINITIONS: Record<string, AppDefinition> = {
  ebook: {
    key: "ebook",
    name: "Ebook Publishing System",
    description:
      "원고를 업로드하고 PDF/DOCX/EPUB 전자책으로 변환하는 웹프로그램",
    // 실제 published 프로그램 slug 와 일치시켜야 상세에서 구독 버튼이 연결됨
    programSlug: "ebook-publishing-system",
    launchUrl: "https://ebook.cozybuilder.co.kr",
  },
  shortsfactory: {
    key: "shortsfactory",
    name: "ShortsFactory",
    description: "쇼츠 제작을 돕는 웹프로그램",
    programSlug: "shortsfactory",
  },
  clipminer: {
    key: "clipminer",
    name: "ClipMiner",
    description: "쇼핑쇼츠 소스 영상 관리를 돕는 웹프로그램",
    programSlug: "clipminer",
  },
};

/**
 * 앱 launch URL 해석(독립 배포 도메인). 우선순위: env `<KEY>_APP_URL` → 정의의 launchUrl.
 * 없으면 null(아직 독립 배포 전). 서버에서만 호출(env 의존). 끝 슬래시 제거.
 */
export function getAppLaunchUrl(key: string): string | null {
  const app = getApp(key);
  if (!app) return null;
  const fromEnv = process.env[`${key.toUpperCase()}_APP_URL`];
  const url = (fromEnv && fromEnv.trim()) || app.launchUrl || null;
  return url ? url.replace(/\/+$/, "") : null;
}

export function getApp(key: string): AppDefinition | null {
  return APP_DEFINITIONS[key] ?? null;
}

export function listApps(): AppDefinition[] {
  return Object.values(APP_DEFINITIONS);
}

/** Programs 슬러그로 연결된 앱 찾기 (key 또는 programSlug 일치). */
export function findAppByProgramSlug(slug: string): AppDefinition | null {
  return (
    listApps().find((a) => a.programSlug === slug || a.key === slug) ?? null
  );
}

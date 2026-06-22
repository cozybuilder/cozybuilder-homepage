// 컴퓨터 웹프로그램(앱) 공통 정의. app_key 기준으로 접근/라우팅을 관리한다.
// ebook 전용 아님 — 모든 웹프로그램이 이 구조를 공유한다.

export type AppDefinition = {
  key: string;
  name: string;
  description: string;
  programSlug: string; // Programs 상세와 연결할 슬러그
};

export const APP_DEFINITIONS: Record<string, AppDefinition> = {
  ebook: {
    key: "ebook",
    name: "Ebook Publishing System",
    description:
      "원고를 업로드하고 PDF/DOCX/EPUB 전자책으로 변환하는 웹프로그램",
    programSlug: "ebook",
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

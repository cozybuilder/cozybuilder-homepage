// Central site configuration & content data.
// Pages read from here so the whole structure stays in one place.

export const siteConfig = {
  name: "COZYBUILDER",
  tagline: "The AI Business Base",
  email: "equs0223@gmail.com",
  foundedYear: 2026,
};

export type NavItem = { label: string; href: string };

export const mainNav: NavItem[] = [
  { label: "메인홈", href: "/" },
  { label: "소개", href: "/about" },
  { label: "프로그램", href: "/programs" },
  { label: "SNS", href: "/sns" },
  { label: "전체 링크", href: "/links" },
  { label: "문의", href: "/contact" },
];

export type Program = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  features: string[];
  emoji: string;
};

export const programs: Program[] = [
  {
    slug: "gratitude",
    name: "Gratitude Diary",
    summary: "감사를 기록하고 성장 과정을 관리하는 앱",
    description:
      "매일의 감사를 기록하며 나의 성장 과정을 데이터로 관리합니다. 작은 기록이 모여 큰 변화를 만듭니다.",
    features: ["매일 감사 기록", "성장 그래프", "회고 리마인더", "데이터 백업"],
    emoji: "🙏",
  },
  {
    slug: "clipminer",
    name: "ClipMiner",
    summary: "영상에서 가치 있는 클립을 자동으로 채굴하는 도구",
    description:
      "긴 영상 속에서 의미 있는 순간을 자동으로 찾아내고 클립으로 추출합니다.",
    features: ["자동 하이라이트 추출", "자막 인식", "클립 내보내기", "배치 처리"],
    emoji: "⛏️",
  },
  {
    slug: "shortsfactory",
    name: "ShortsFactory",
    summary: "숏폼 영상을 대량으로 제작하는 자동화 공장",
    description:
      "아이디어 하나로 여러 개의 숏폼을 자동 생성하는 콘텐츠 제작 자동화 시스템입니다.",
    features: ["대본 자동 생성", "영상 합성", "자동 자막", "예약 업로드"],
    emoji: "🎬",
  },
  {
    slug: "ebook",
    name: "Ebook Publishing System",
    summary: "전자책을 기획부터 출간까지 자동화하는 시스템",
    description:
      "글감만 있으면 기획, 편집, 표지, 포맷팅까지 전자책 출간 전 과정을 돕습니다.",
    features: ["원고 정리", "표지 생성", "포맷 변환", "출간 체크리스트"],
    emoji: "📚",
  },
];

export type SnsChannel = {
  slug: string;
  name: string;
  summary: string;
  emoji: string;
  url?: string;
};

export const snsChannels: SnsChannel[] = [
  { slug: "blog", name: "Blog", summary: "기록과 생각을 글로 남깁니다", emoji: "✍️" },
  { slug: "youtube", name: "YouTube", summary: "영상으로 여정을 공유합니다", emoji: "▶️" },
  { slug: "instagram", name: "Instagram", summary: "순간을 이미지로 담습니다", emoji: "📸" },
  { slug: "threads", name: "Threads", summary: "짧은 생각을 나눕니다", emoji: "🧵" },
];

export const team = [
  { name: "Cozy", role: "CEO", emoji: "🧭" },
  { name: "Cobi", role: "PM", emoji: "🗂️" },
  { name: "Clo", role: "CTO", emoji: "⚙️" },
];

// Central site configuration & content data.
// Pages read from here so the whole structure stays in one place.

export const siteConfig = {
  name: "COZYBUILDER",
  tagline: "The AI Business Base",
  email: "equs0223@gmail.com",
  contactEmail: "cozybuilder.studio@gmail.com",
  foundedYear: 2026,
  // 사업자 정보
  companyName: "코지빌더 연구소 (CozyBuilder Lab)",
  representative: "서영준",
  businessNumber: "221-42-01950",
  commerceReportNumber: "", // 통신판매업신고 (아직 비움)
};

export type NavItem = { label: string; href: string };

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Product", href: "/product" },
  { label: "Marketing", href: "/sns" },
  { label: "Contact", href: "/contact" },
];

// Product 하위 분류 (초기 텍스트 항목)
export const websiteServices = ["홈페이지 제작", "랜딩페이지 제작", "웹서비스 제작"];
export const bookItems = ["전자책", "출판 프로젝트", "개발 기록"];

export type ProgramType = "web" | "mobile";

// 업데이트 내역 1건 (등록형)
export type ProgramUpdate = { date: string; text: string };

export type Program = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  features: string[]; // 주요 기능 (개수에 따라 자동 증감)
  emoji: string;
  image: string;
  type: ProgramType;
  appUrl?: string; // web 실행 경로 (없으면 Coming Soon)
  playStoreUrl?: string; // mobile
  appStoreUrl?: string; // mobile
  screenshots?: string[]; // 여러 장 등록 가능 (좌우 슬라이드)
  updates?: ProgramUpdate[]; // 텍스트 기록형
};

// ── Product (제작/출판 상품) — 등록형 표준 구조 ──
// 관리자 등록 시 products 배열에 항목을 추가하면 카드/상세가 자동 생성된다.
export type ProductCtaType = "buy" | "contact";

export type Product = {
  slug: string;
  name: string;
  summary: string; // 간략한 설명
  image: string; // 메인 이미지
  contents: string[]; // 주요 내용/기능 (개수에 따라 자동 증감)
  screenshots?: string[]; // 미리보기 이미지 (좌우 슬라이드)
  longDescription?: string; // 자세한 설명 (긴 텍스트)
  price?: string; // 가격 (텍스트, 예: "₩50,000" / "문의")
  cta: ProductCtaType; // 구매하기(buy) / 문의하기(contact)
};

// 등록형: 관리자 페이지에서 채워질 예정 (현재는 비어 있음)
export const products: Product[] = [];

export const programs: Program[] = [
  {
    slug: "gratitude",
    name: "Gratitude Diary",
    summary: "감사를 기록하고 성장 과정을 관리하는 앱",
    description:
      "매일의 감사를 기록하며 나의 성장 과정을 데이터로 관리합니다. 작은 기록이 모여 큰 변화를 만듭니다.",
    features: ["매일 감사 기록", "성장 그래프", "회고 리마인더", "데이터 백업"],
    emoji: "🙏",
    image: "/image/gamsa.png",
    type: "mobile",
    playStoreUrl: "",
    appStoreUrl: "",
  },
  {
    slug: "clipminer",
    name: "ClipMiner",
    summary: "영상에서 가치 있는 클립을 자동으로 채굴하는 도구",
    description:
      "긴 영상 속에서 의미 있는 순간을 자동으로 찾아내고 클립으로 추출합니다.",
    features: ["자동 하이라이트 추출", "자막 인식", "클립 내보내기", "배치 처리"],
    emoji: "⛏️",
    image: "/image/clipminer.png",
    type: "web",
    appUrl: "",
  },
  {
    slug: "shortsfactory",
    name: "ShortsFactory",
    summary: "숏폼 영상을 대량으로 제작하는 자동화 공장",
    description:
      "아이디어 하나로 여러 개의 숏폼을 자동 생성하는 콘텐츠 제작 자동화 시스템입니다.",
    features: ["대본 자동 생성", "영상 합성", "자동 자막", "예약 업로드"],
    emoji: "🎬",
    image: "/image/shots.png",
    type: "web",
    appUrl: "",
  },
  {
    slug: "ebook",
    name: "Ebook Publishing System",
    summary: "전자책을 기획부터 출간까지 자동화하는 시스템",
    description:
      "글감만 있으면 기획, 편집, 표지, 포맷팅까지 전자책 출간 전 과정을 돕습니다.",
    features: ["원고 정리", "표지 생성", "포맷 변환", "출간 체크리스트"],
    emoji: "📚",
    image: "/image/ebook.png",
    type: "web",
    appUrl: "",
  },
];

export type SnsChannel = {
  slug: string;
  name: string;
  summary: string;
  emoji: string;
  url?: string;
  image?: string; // 대표 이미지 (등록형)
  externalUrl?: string; // 외부 링크 버튼 (등록형, 상세페이지 없음)
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

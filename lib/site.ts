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
  { label: "Marketing", href: "/marketing" },
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

// ── Product (범용 상품 CMS v1) ──
// 디지털/서비스/구독/실물 등 모든 판매 상품을 등록한다. 관리자에서 products 테이블에 저장.
export type ProductType = "digital" | "service" | "subscription" | "physical";
export type ProductPriceType =
  | "fixed"
  | "sale"
  | "quote"
  | "free"
  | "monthly"
  | "yearly";
export type ProductStatus = "draft" | "published" | "hidden" | "soldout";
export type ProductButtonType = "inquiry" | "payment";

export const BUTTON_TYPE_LABELS: Record<ProductButtonType, string> = {
  inquiry: "문의하기",
  payment: "결제하기",
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  digital: "디지털 상품",
  service: "서비스 상품",
  subscription: "구독 상품",
  physical: "실물 상품",
};

export const PRICE_TYPE_LABELS: Record<ProductPriceType, string> = {
  fixed: "고정가",
  sale: "할인 판매",
  quote: "견적 문의",
  free: "무료",
  monthly: "월 구독",
  yearly: "연 구독",
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "임시저장",
  published: "공개",
  hidden: "숨김",
  soldout: "품절",
};

// 옵션: products.options jsonb 에 배열로 저장(별도 테이블 없음).
export type ProductOption = {
  name: string;
  price?: number | null;
  price_label?: string;
  description?: string;
  billing?: string; // 선택: monthly 등 결제 주기
};

export type Product = {
  slug: string;
  title: string;
  productType: ProductType;
  category?: string;
  thumbnailUrl: string;
  galleryUrls: string[];
  shortDescription: string;
  description?: string;
  price?: number | null;
  salePrice?: number | null;
  priceLabel?: string;
  priceType: ProductPriceType;
  options: ProductOption[];
  status?: ProductStatus;
  buttonType: ProductButtonType;
  featured?: boolean;
};

export function formatKRW(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}

// Product 카드 가격 표시 우선순위:
// 1) price_label  2) quote→"견적 문의"  3) sale_price  4) price  5) "가격 정보 없음"
export function productPriceDisplay(p: Product): string {
  if (p.priceLabel) return p.priceLabel;
  if (p.priceType === "quote") return "견적 문의";
  if (p.salePrice != null) return formatKRW(p.salePrice);
  if (p.price != null) return formatKRW(p.price);
  return "가격 정보 없음";
}

// 옵션 가격 표시: price_label 우선, 없으면 숫자 가격 포맷.
export function optionPriceDisplay(o: ProductOption): string {
  if (o.price_label) return o.price_label;
  if (o.price != null) return formatKRW(o.price);
  return "";
}

// 등록형: 관리자 페이지에서 채워진다. DB 비었을 때만 쓰는 검증용 샘플 1개.
export const products: Product[] = [
  {
    slug: "ai-start-record",
    title: "AI와 함께 다시 시작한 기록",
    productType: "digital",
    category: "ebook",
    thumbnailUrl: "/image/ebook.png",
    galleryUrls: [],
    shortDescription: "46세에 AI와 함께 다시 시작한 과정을 기록한 전자책입니다.",
    description:
      "이 전자책은 코지빌더가 AI와 함께 새로운 일을 시작하며 기록한 과정과 생각을 담은 샘플 상품입니다. 실제 출간 전까지는 예시 데이터로 사용합니다.",
    price: 9900,
    priceLabel: "9,900원",
    priceType: "fixed",
    options: [],
    status: "published",
    buttonType: "inquiry",
    featured: false,
  },
];

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
  { slug: "blog", name: "Blog", summary: "기록과 생각을 글로 남깁니다", emoji: "✍️", externalUrl: "" },
  { slug: "youtube", name: "YouTube", summary: "영상으로 여정을 공유합니다", emoji: "▶️", externalUrl: "" },
  { slug: "instagram", name: "Instagram", summary: "순간을 이미지로 담습니다", emoji: "📸", externalUrl: "" },
  { slug: "threads", name: "Threads", summary: "짧은 생각을 나눕니다", emoji: "🧵", externalUrl: "" },
];

export const team = [
  { name: "Cozy", role: "CEO", emoji: "🧭" },
  { name: "Cobi", role: "PM", emoji: "🗂️" },
  { name: "Clo", role: "CTO", emoji: "⚙️" },
];

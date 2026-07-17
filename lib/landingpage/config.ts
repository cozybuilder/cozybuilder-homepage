// 공용 랜딩페이지 설정 레지스트리 (SSOT: docs/landing/LANDINGPAGE_PLATFORM.md)
// 랜딩 1개 = 설정 1개. 페이지 복사 금지 — LandingRenderer 가 이 설정을 읽어 그린다.
// 클라이언트/서버 공용 모듈 — 서버 전용 코드 금지.

export type LandingFeature = { key: string; title: string; desc: string };
export type LandingFaq = { q: string; a: string };

/** 폼 종류 — 렌더러의 폼 컴포넌트 맵과 연결된다. */
export type LandingFormKind = "cozyrent-preregister";

export type LandingConfig = {
  slug: string;
  productName: string;
  adminName: string; // 관리자 화면 표시명
  formKind: LandingFormKind;
  /** 신청 데이터 조회 어댑터 — 현재는 제품별 테이블명 (DB 범용화는 별도 승인). */
  signupsTable: string;
  sourceDefault: string;
  meta: { title: string; description: string };
  images: {
    dir: string; // public 기준 경로 (예: /image/landingpage/cozyrent)
    og: string;
    /** hero + 기능 key 별 실앱 화면. 미확보 시 null → 세로형 placeholder (가짜 UI 금지). */
    appScreens: Record<string, string | null>;
    /** 실제 이미지의 CSS aspect-ratio — 잘림 방지(비율 보존). 미지정 시 "9 / 19". */
    heroRatio?: string; // 예: "923 / 1600"
    screenRatio?: string; // 예: "1080 / 2111"
    /** CLS 방지용 원본 픽셀 크기 (Next Image width/height). */
    heroDims?: { w: number; h: number };
    screenDims?: { w: number; h: number };
  };
  hero: {
    eyebrow: string;
    titleLines: string[]; // 의미 단위 명시 줄바꿈 (한글 단어 중간 분리 금지)
    description: string[];
    cta: string;
    sub: string;
    heroScreenAlt: string;
  };
  problems: { title: string[]; items: string[]; closing: string[] };
  features: { eyebrow: string; title: string; items: LandingFeature[] };
  trust: { titleLines: string[]; paragraphs: string[] };
  benefit: {
    title: string;
    amount: string;
    amountUnit: string;
    subtitle: string;
    paragraphs: string[][]; // 문단 → 줄
    notice: string[];
  };
  applySection: { eyebrow: string; title: string };
  faqs: LandingFaq[];
  finalCta: { titleLines: string[]; descLines: string[]; button: string };
};

export const LANDING_BASE_URL = "https://cozybuilder.co.kr";

export function landingUrl(slug: string): string {
  return `${LANDING_BASE_URL}/landingpage/${slug}`;
}

// ── 코지임대 (문구 원본: cozyrent/docs/MARKETING.md §8 · SUBSCRIPTION.md — 금지 표현 준수) ──
const cozyrent: LandingConfig = {
  slug: "cozyrent",
  productName: "코지임대",
  adminName: "코지임대 사전신청",
  formKind: "cozyrent-preregister",
  signupsTable: "cozyrent_prelaunch_signups",
  sourceDefault: "landing_cozyrent",
  meta: {
    title: "코지임대 사전신청 | 건물주를 위한 임대관리 앱",
    description:
      "월세, 관리비, 미납, 계약, 수선 기록까지 한곳에서. 코지임대 출시 전 사전신청하고 6,900P 혜택을 받아보세요.",
  },
  images: {
    dir: "/image/landingpage/cozyrent",
    og: "/image/landingpage/cozyrent/og.png",
    // 실앱 이미지 원본: cozyrent/public/img (온보딩이미지.png · 1~6.jpg — 번호 순서 유지, 7번 이후 미사용)
    appScreens: {
      hero: "/image/landingpage/cozyrent/hero.png", // 온보딩이미지.png
      home: "/image/landingpage/cozyrent/home.jpg", // 1.jpg — 홈 상황판
      rent: "/image/landingpage/cozyrent/rent.jpg", // 2.jpg — 받을 돈·미납
      building: "/image/landingpage/cozyrent/building.jpg", // 3.jpg — 호실·계약
      moveout: "/image/landingpage/cozyrent/moveout.jpg", // 4.jpg — 계약 만료·퇴실관리
      repair: "/image/landingpage/cozyrent/repair.jpg", // 5.jpg — 시설·하자/수선
      expense: "/image/landingpage/cozyrent/expense.jpg", // 6.jpg — 지출관리
    },
    heroRatio: "941 / 1672",
    heroDims: { w: 941, h: 1672 },
    screenRatio: "1080 / 2111",
    screenDims: { w: 1080, h: 2111 },
  },
  hero: {
    eyebrow: "출시 전 사전신청 진행 중",
    titleLines: ["임대관리의 새로운 기준,", "코지임대"],
    description: [
      "월세, 관리비, 미납, 계약, 수선 기록까지",
      "개인 건물주에게 필요한 임대관리를 한곳에서 확인하세요.",
    ],
    cta: "사전신청하고 6,900P 받기",
    sub: "출시 전 신청자 한정 · 베이직 이용기간 30일 연장 상당",
    heroScreenAlt: "코지임대 앱 홈 화면",
  },
  problems: {
    title: ["임대관리, 아직도 기억과 메모에", "의존하고 계신가요?"],
    items: [
      "이번 달 월세를 누가 냈는지 헷갈립니다.",
      "계약과 보증금 기록이 여기저기 흩어져 있습니다.",
      "미납·수선·퇴실 일정을 놓치기 쉽습니다.",
      "호실이 늘어날수록 관리가 복잡해집니다.",
    ],
    closing: ["코지임대는 문제가 없는 정보는 줄이고,", "지금 확인해야 할 일부터 보여줍니다."],
  },
  features: {
    eyebrow: "주요 기능",
    title: "건물주에게 필요한 관리만 담았습니다",
    // 카드 순서 = 실앱 이미지 번호 순서(1→6). 문구 근거: cozyrent/docs/AI_CONTEXT.md §5·§6·철학6
    items: [
      {
        key: "home",
        title: "홈 상황판",
        desc: "이번 달 받을 돈과 오늘 확인할 일을 홈에서 바로 확인합니다. 문제가 없는 정보는 줄이고 확인할 일부터 보여줍니다.",
      },
      {
        key: "rent",
        title: "월세·관리비·미납 관리",
        desc: "이번 달 받을 돈과 입금 내역을 기록하면, 미납은 자동으로 계산됩니다.",
      },
      {
        key: "building",
        title: "건물·호실·계약 관리",
        desc: "건물과 호실, 계약·보증금 정보를 층별로 정리해 한눈에 확인합니다.",
      },
      {
        key: "moveout",
        title: "퇴실 점검과 정산 기록",
        desc: "퇴실할 때 점검한 내용과 정산 내역을 기록으로 남깁니다.",
      },
      {
        key: "repair",
        title: "수선·시설·하자 기록",
        desc: "수선·하자 내역과 시설 정보를 호실·건물별로 기록하고 관리합니다.",
      },
      {
        key: "expense",
        title: "고정지출 관리",
        desc: "공용 전기, 청소비처럼 매달 나가는 고정지출을 한곳에 정리합니다.",
      },
    ],
  },
  trust: {
    titleLines: ["다가구주택을 직접 관리하는", "건물주가 만들었습니다"],
    paragraphs: [
      "코지임대는 가상의 임대관리 방식에서 출발하지 않았습니다.",
      "건물을 직접 짓고 관리하며 겪은 월세 확인, 미납 관리, 시설 수선과 퇴실 정산의 불편을 줄이기 위해 만들고 있습니다.",
      "복잡한 ERP가 아니라, 건물주가 매일 휴대폰으로 편하게 사용하는 앱을 목표로 합니다.",
    ],
  },
  benefit: {
    title: "출시 전에 신청하면 6,900P",
    amount: "6,900",
    amountUnit: "P",
    subtitle: "베이직 이용기간 30일 연장 상당",
    paragraphs: [
      ["정식 출시 후 코지임대를 구독하면", "사전신청 포인트가 이용기간 연장에 적용됩니다."],
      ["가입 후에는 카드 등록 없이", "15일 동안 무료로 체험할 수 있습니다."],
    ],
    notice: [
      "포인트는 코지임대 이용기간 연장 전용이며 현금화·양도·환불할 수 없습니다.",
      "세부 조건은 정식 출시 시 안내됩니다.",
    ],
  },
  applySection: { eyebrow: "사전신청", title: "출시 소식을 가장 먼저 받아보세요" },
  faqs: [
    {
      q: "언제 출시되나요?",
      a: "지금 Android 앱을 우선 개발하고 있습니다. 정식 출시 일정이 확정되면 사전신청하신 연락처로 가장 먼저 안내해드립니다.",
    },
    {
      q: "사전신청하면 결제되나요?",
      a: "아니요. 사전신청은 무료이며 결제 정보(카드 등록)를 받지 않습니다. 자동결제도 없습니다. 정식 출시 후 가입하면 카드 등록 없이 15일 무료체험을 이용할 수 있습니다.",
    },
    {
      q: "6,900P는 어떻게 사용하나요?",
      a: "정식 출시 후 코지임대를 구독하면 사전신청 포인트가 이용기간 연장에 적용됩니다. 베이직 요금제 기준 30일 연장에 해당합니다. 포인트는 이용기간 연장 전용이며 현금화·양도·환불할 수 없습니다. 세부 적용 조건은 정식 출시 시 안내됩니다.",
    },
    {
      q: "아이폰에서도 사용할 수 있나요?",
      a: "지금은 Android 앱을 먼저 개발하고 있습니다. iPhone(iOS) 버전은 정식 출시 이후 순차적으로 검토할 예정입니다.",
    },
    {
      q: "누구에게 필요한 앱인가요?",
      a: "원룸·다가구·상가주택을 직접 관리하는 개인 임대인을 위한 앱입니다. 월세·관리비 확인, 미납, 계약, 수선, 퇴실 기록을 휴대폰 하나로 정리하고 싶은 분께 맞습니다.",
    },
  ],
  finalCta: {
    titleLines: ["기억에 의존하던 임대관리,", "코지임대로 정리해보세요."],
    descLines: ["출시 전 사전신청하고", "6,900P 혜택을 받아보세요."],
    button: "코지임대 사전신청",
  },
};

/** 등록된 랜딩 목록 (등록 = 공개 라우트·관리자 카드 활성). */
export const LANDING_CONFIGS: LandingConfig[] = [cozyrent];

export function getLandingConfig(slug: string): LandingConfig | null {
  return LANDING_CONFIGS.find((c) => c.slug === slug) ?? null;
}

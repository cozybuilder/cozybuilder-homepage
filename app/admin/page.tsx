import Link from "next/link";

const sections = [
  { href: "/admin/programs", title: "Programs", desc: "컴퓨터 웹프로그램 / 모바일앱 등록·관리" },
  { href: "/admin/product", title: "Product", desc: "홈페이지 제작 / 전자책 상품 등록·관리" },
  { href: "/admin/marketing", title: "Marketing", desc: "SNS / Blog 링크 등록·관리" },
];

export default function AdminHome() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">관리자</h1>
      <p className="mt-2 text-sm text-[--muted]">
        콘텐츠를 등록하면 published 항목만 공개 화면에 반영됩니다.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="card card-hover">
            <h2 className="text-lg font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm text-[--muted]">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

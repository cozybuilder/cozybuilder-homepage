import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteConfig } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description:
    "프로그래머와 건설 현장을 거쳐 AI와 함께 다시 시작한 1인 빌더의 기록. Build. Create. Automate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Impact.com 사이트 소유권 인증 태그. 비표준 value 속성이라 metadata API(content 생성) 대신 직접 렌더하고, value는 meta 타입에 없어 스프레드로 우회. React 19가 <head>로 hoist. */}
      <meta
        {...({
          name: "impact-site-verification",
          value: "10d552fd-aa6f-4a9a-ac65-248fa668f7ef",
        } as React.MetaHTMLAttributes<HTMLMetaElement>)}
      />
      <body className="bg-aurora flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

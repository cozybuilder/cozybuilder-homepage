"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/site";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui";

const INQUIRY_TYPES = [
  "홈페이지 제작",
  "유지보수",
  "전자책/상품 문의",
  "프로그램 문의",
  "계정/로그인 문의",
  "협업/제안",
  "기타",
];

/**
 * Contact Form v1 — DB 저장/서버 발송 없이 mailto 링크로 메일 작성창을 연다.
 * /contact?product=<slug>&option=<optionId> 의 값이 있으면 상단 표시 + 본문 포함.
 */
export default function ContactForm({
  product = "",
  option = "",
}: {
  product?: string;
  option?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState(INQUIRY_TYPES[0]);
  const [content, setContent] = useState("");

  const hasContext = Boolean(product || option);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `[CozyBuilder 문의] ${type}`;
    const bodyLines = [
      `이름: ${name}`,
      `이메일: ${email}`,
      `문의 유형: ${type}`,
      ...(product ? [`문의 상품: ${product}`] : []),
      ...(option ? [`선택 옵션: ${option}`] : []),
      "",
      "문의 내용:",
      content,
    ];
    const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    window.location.href = mailto;
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {/* 문의 상품 / 선택 옵션 (query string 있을 때만) */}
      {hasContext && (
        <div className="rounded-xl border border-[--accent]/40 bg-[--accent]/5 px-4 py-3 text-sm">
          {product && (
            <p>
              <span className="text-[--muted-2]">문의 상품</span>{" "}
              <span className="font-medium text-foreground">{product}</span>
            </p>
          )}
          {option && (
            <p className="mt-0.5">
              <span className="text-[--muted-2]">선택 옵션</span>{" "}
              <span className="font-medium text-foreground">{option}</span>
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="이름" htmlFor="contact-name">
          <Input
            id="contact-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="성함"
          />
        </FormField>
        <FormField label="이메일" htmlFor="contact-email">
          <Input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="회신받을 이메일"
          />
        </FormField>
      </div>

      <FormField label="문의 유형" htmlFor="contact-type">
        <Select
          id="contact-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {INQUIRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="문의 내용" htmlFor="contact-content">
        <Textarea
          id="contact-content"
          required
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="문의하실 내용을 작성해주세요."
        />
      </FormField>

      <Button type="submit" className="w-full">
        메일로 문의 보내기
      </Button>
      <p className="text-center text-xs text-[--muted-2]">
        제출 시 메일 작성창이 열립니다. 내용 확인 후 전송해주세요.
      </p>
    </form>
  );
}

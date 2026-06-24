"use client";

import { useState } from "react";
import { FormField, Select } from "@/components/ui";

// SNS 하위 채널 — 저장값(영문 key) / 표시명(한국어)
const SNS_CHANNELS: { value: string; label: string }[] = [
  { value: "instagram", label: "인스타그램" },
  { value: "youtube", label: "유튜브" },
  { value: "tiktok", label: "틱톡" },
  { value: "facebook", label: "페이스북" },
  { value: "threads", label: "쓰레드" },
];

/**
 * 구분(category: SNS/블로그) + SNS일 때만 채널(channel_type) 선택.
 * blog 선택 시 채널 select 를 렌더하지 않으므로 channel_type 은 제출되지 않음 → 서버에서 null 저장.
 */
export default function MarketingCategoryFields({
  initialCategory = "sns",
  initialChannel = "instagram",
}: {
  initialCategory?: string;
  initialChannel?: string;
}) {
  const [category, setCategory] = useState(
    initialCategory === "blog" ? "blog" : "sns"
  );

  return (
    <>
      <FormField label="구분">
        <Select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="sns">SNS</option>
          <option value="blog">블로그</option>
        </Select>
      </FormField>

      {category === "sns" && (
        <FormField label="채널">
          <Select name="channel_type" defaultValue={initialChannel}>
            {SNS_CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </FormField>
      )}
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { FormField, Input, Textarea } from "@/components/ui";
import type { ProgramLandingContentV1 } from "@/lib/program-landing";

// 제품 홍보 랜딩(`programs.landing_content`) 구조화 편집기.
// 설계: docs/platform/PROGRAM_OPERATING_MODEL.md §10
//
// - JSON 원문을 사람에게 보여주지 않는다. 직렬화는 hidden input 하나로만 넘긴다.
// - 여기 직렬화 결과를 서버가 신뢰하지 않는다 — saveProgram 이 lib/program-landing 으로 재검증한다.
// - 비어 있는 항목은 서버 정규화가 버리므로 여기서는 입력 편의만 신경 쓴다.

const ROW_INPUT =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-white/40 outline-none transition-colors hover:bg-white/10 focus:border-violet-400/40";

/** 반복 입력 공통 틀 — 항목 추가/삭제만 담당하고 행 UI 는 호출부가 그린다. */
function Repeatable<T>({
  items,
  setItems,
  empty,
  addLabel,
  render,
}: {
  items: T[];
  setItems: (next: T[]) => void;
  empty: T;
  addLabel: string;
  /** `set` 은 항목 **전체**를 교체한다 — 문자열 배열에서도 안전하다(부분 병합 금지). */
  render: (item: T, set: (next: T) => void) => React.ReactNode;
}) {
  const rows = items.length ? items : [empty];
  const setAt = (i: number, next: T) =>
    setItems(rows.map((x, idx) => (idx === i ? next : x)));
  const removeAt = (i: number) =>
    setItems(rows.length === 1 ? [empty] : rows.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {rows.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="min-w-0 flex-1 space-y-2">{render(item, (next) => setAt(i, next))}</div>
          <button
            type="button"
            onClick={() => removeAt(i)}
            className="mt-0.5 shrink-0 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 text-[--muted] transition-colors hover:border-red-400/30 hover:bg-red-500/20 hover:text-red-200"
            aria-label="항목 삭제"
          >
            −
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems([...rows, empty])}
        className="text-sm text-[--muted] hover:text-foreground"
      >
        + {addLabel}
      </button>
    </div>
  );
}

/** 접이식 소제목 블록 — 폼이 길어지므로 기본은 접어 둔다. */
function Block({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <details className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
      <summary className="cursor-pointer text-sm font-medium text-foreground">{title}</summary>
      {desc && <p className="mt-1 text-xs text-[--muted-2]">{desc}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </details>
  );
}

type TitleBody = { title: string; description: string };
type Stat = { value: string; label: string };
type Testimonial = { quote: string; displayName: string; meta: string };
type Faq = { question: string; answer: string };

export default function ProgramLandingFields({
  name,
  initial,
}: {
  name: string;
  initial?: ProgramLandingContentV1 | null;
}) {
  const [headline, setHeadline] = useState(initial?.hero?.headline ?? "");
  const [subheadline, setSubheadline] = useState(initial?.hero?.subheadline ?? "");
  const [heroNote, setHeroNote] = useState(initial?.hero?.note ?? "");

  const [problems, setProblems] = useState<TitleBody[]>(
    (initial?.problems ?? []).map((p) => ({ title: p.title, description: p.description }))
  );
  const [benefits, setBenefits] = useState<TitleBody[]>(
    (initial?.benefits ?? []).map((b) => ({ title: b.title, description: b.description }))
  );
  const [audiences, setAudiences] = useState<string[]>(initial?.audiences ?? []);
  const [stats, setStats] = useState<Stat[]>(
    (initial?.proofStats ?? []).map((s) => ({ value: s.value, label: s.label }))
  );

  const [makerTitle, setMakerTitle] = useState(initial?.makerStory?.title ?? "");
  const [makerBody, setMakerBody] = useState(initial?.makerStory?.body ?? "");

  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    (initial?.testimonials ?? []).map((t) => ({
      quote: t.quote,
      displayName: t.displayName,
      meta: t.meta ?? "",
    }))
  );

  const [offerTitle, setOfferTitle] = useState(initial?.offer?.title ?? "");
  const [offerHeadline, setOfferHeadline] = useState(initial?.offer?.headline ?? "");
  const [offerBody, setOfferBody] = useState(initial?.offer?.body ?? "");
  const [offerLines, setOfferLines] = useState<string[]>(initial?.offer?.lines ?? []);

  const [faqs, setFaqs] = useState<Faq[]>(
    (initial?.faqs ?? []).map((f) => ({ question: f.question, answer: f.answer }))
  );

  const [finalTitle, setFinalTitle] = useState(initial?.finalCta?.title ?? "");
  const [finalBody, setFinalBody] = useState(initial?.finalCta?.body ?? "");

  // 서버가 어차피 재검증·정규화하므로 여기서는 입력값을 구조 그대로 직렬화한다.
  const serialized = useMemo(
    () =>
      JSON.stringify({
        version: 1,
        hero: { headline, subheadline, note: heroNote },
        problems,
        benefits,
        audiences,
        proofStats: stats,
        makerStory: { title: makerTitle, body: makerBody },
        testimonials,
        offer: { title: offerTitle, headline: offerHeadline, body: offerBody, lines: offerLines },
        faqs,
        finalCta: { title: finalTitle, body: finalBody },
      }),
    [
      headline, subheadline, heroNote, problems, benefits, audiences, stats,
      makerTitle, makerBody, testimonials, offerTitle, offerHeadline, offerBody,
      offerLines, faqs, finalTitle, finalBody,
    ]
  );

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={serialized} />

      <Block title="히어로" desc="비우면 기존 요약·설명이 그대로 쓰입니다.">
        <FormField label="핵심 headline">
          <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="한 줄로 제품이 해결하는 것" />
        </FormField>
        <FormField label="짧은 subheadline">
          <Input value={subheadline} onChange={(e) => setSubheadline(e.target.value)} placeholder="누구를 위한 무엇인지" />
        </FormField>
        <FormField label="CTA 아래 보조 문구 (선택)">
          <Input value={heroNote} onChange={(e) => setHeroNote(e.target.value)} placeholder="예: 설치 후 바로 사용할 수 있습니다" />
        </FormField>
      </Block>

      <Block title="고객의 문제" desc="기능 설명 전에 '내 문제다'라고 느끼게 하는 영역입니다.">
        <Repeatable<TitleBody>
          items={problems}
          setItems={setProblems}
          empty={{ title: "", description: "" }}
          addLabel="문제 추가"
          render={(item, set) => (
            <>
              <input className={ROW_INPUT} value={item.title} onChange={(e) => set({ ...item, title: e.target.value })} placeholder="문제 제목" />
              <input className={ROW_INPUT} value={item.description} onChange={(e) => set({ ...item, description: e.target.value })} placeholder="짧은 설명" />
            </>
          )}
        />
      </Block>

      <Block title="핵심 가치" desc="비우면 기존 '주요 기능'이 대신 표시됩니다.">
        <Repeatable<TitleBody>
          items={benefits}
          setItems={setBenefits}
          empty={{ title: "", description: "" }}
          addLabel="가치 추가"
          render={(item, set) => (
            <>
              <input className={ROW_INPUT} value={item.title} onChange={(e) => set({ ...item, title: e.target.value })} placeholder="무엇이 해결되는가" />
              <input className={ROW_INPUT} value={item.description} onChange={(e) => set({ ...item, description: e.target.value })} placeholder="짧은 설명" />
            </>
          )}
        />
      </Block>

      <Block title="추천 대상">
        <Repeatable<string>
          items={audiences}
          setItems={setAudiences}
          empty=""
          addLabel="대상 추가"
          render={(item, set) => (
            <input
              className={ROW_INPUT}
              value={item}
              onChange={(e) => set(e.target.value)}
              placeholder="예: 원룸·다가구를 직접 관리하는 임대인"
            />
          )}
        />
      </Block>

      <Block title="신뢰 지표" desc="실제 근거가 있는 값만 입력하세요. 추정치·샘플 숫자를 넣지 않습니다.">
        <Repeatable<Stat>
          items={stats}
          setItems={setStats}
          empty={{ value: "", label: "" }}
          addLabel="지표 추가"
          render={(item, set) => (
            <div className="flex gap-2">
              <input className={`${ROW_INPUT} max-w-[160px]`} value={item.value} onChange={(e) => set({ ...item, value: e.target.value })} placeholder="값" />
              <input className={ROW_INPUT} value={item.label} onChange={(e) => set({ ...item, label: e.target.value })} placeholder="설명 라벨" />
            </div>
          )}
        />
      </Block>

      <Block title="제작 배경">
        <FormField label="제목">
          <Input value={makerTitle} onChange={(e) => setMakerTitle(e.target.value)} placeholder="예: 직접 쓰려고 만들었습니다" />
        </FormField>
        <FormField label="본문">
          <Textarea rows={4} value={makerBody} onChange={(e) => setMakerBody(e.target.value)} />
        </FormField>
      </Block>

      <Block title="사용자 후기" desc="실제로 받은 후기만 입력하세요. 없는 후기를 만들지 않습니다.">
        <Repeatable<Testimonial>
          items={testimonials}
          setItems={setTestimonials}
          empty={{ quote: "", displayName: "", meta: "" }}
          addLabel="후기 추가"
          render={(item, set) => (
            <>
              <textarea rows={3} className={ROW_INPUT} value={item.quote} onChange={(e) => set({ ...item, quote: e.target.value })} placeholder="후기 내용" />
              <div className="flex gap-2">
                <input className={ROW_INPUT} value={item.displayName} onChange={(e) => set({ ...item, displayName: e.target.value })} placeholder="표시 이름" />
                <input className={ROW_INPUT} value={item.meta} onChange={(e) => set({ ...item, meta: e.target.value })} placeholder="부가 정보 (선택)" />
              </div>
            </>
          )}
        />
      </Block>

      <Block title="이용 안내" desc="공개 홍보 문구입니다. 가격·체험 기준의 원본은 제품 정책 문서가 소유합니다.">
        <FormField label="섹션 제목">
          <Input value={offerTitle} onChange={(e) => setOfferTitle(e.target.value)} placeholder="예: 이용 안내" />
        </FormField>
        <FormField label="강조 문구">
          <Input value={offerHeadline} onChange={(e) => setOfferHeadline(e.target.value)} />
        </FormField>
        <FormField label="본문">
          <Textarea rows={3} value={offerBody} onChange={(e) => setOfferBody(e.target.value)} />
        </FormField>
        <FormField label="항목 목록">
          <Repeatable<string>
            items={offerLines}
            setItems={setOfferLines}
            empty=""
            addLabel="항목 추가"
            render={(item, set) => (
              <input
                className={ROW_INPUT}
                value={item}
                onChange={(e) => set(e.target.value)}
                placeholder="예: 카드 등록 없음"
              />
            )}
          />
        </FormField>
      </Block>

      <Block title="FAQ">
        <Repeatable<Faq>
          items={faqs}
          setItems={setFaqs}
          empty={{ question: "", answer: "" }}
          addLabel="질문 추가"
          render={(item, set) => (
            <>
              <input className={ROW_INPUT} value={item.question} onChange={(e) => set({ ...item, question: e.target.value })} placeholder="질문" />
              <textarea rows={3} className={ROW_INPUT} value={item.answer} onChange={(e) => set({ ...item, answer: e.target.value })} placeholder="답변" />
            </>
          )}
        />
      </Block>

      <Block title="최종 CTA" desc="버튼은 기존 실행·다운로드 정책을 그대로 사용합니다(링크를 여기서 지정하지 않습니다).">
        <FormField label="제목">
          <Input value={finalTitle} onChange={(e) => setFinalTitle(e.target.value)} />
        </FormField>
        <FormField label="본문">
          <Textarea rows={2} value={finalBody} onChange={(e) => setFinalBody(e.target.value)} />
        </FormField>
      </Block>
    </div>
  );
}

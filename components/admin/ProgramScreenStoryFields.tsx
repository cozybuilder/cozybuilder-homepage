"use client";

import { useMemo, useRef, useState } from "react";
import { uploadImage } from "@/components/admin/uploadImage";
import {
  firstMissingTitleIndex,
  keptScreenStoryRows,
  MAX_SCREEN_STORIES,
  serializeScreenStoryRows,
  type ScreenStory,
  type ScreenStoryRow,
} from "@/lib/program-screen-story";

// 실제 화면 편집기 — 이미지 · 제목 · 설명 · 순서를 한 행으로 묶어 편집한다.
// 설계: docs/platform/PROGRAM_OPERATING_MODEL.md §11
//
// 편집은 한 행이지만 **저장 소유는 분리**한다(이미지 URL 을 JSON 에 중복 저장하지 않기 위해).
//   hidden screenshots    → 이미지 URL 만 현재 행 순서대로 newline 직렬화
//   hidden screen_stories → 같은 순서의 {title, description} JSON
// 서버(saveProgram)가 두 값을 다시 맞춰 보고, 어긋나면 조용히 저장하지 않고 오류를 돌려준다.
//
// 여기 직렬화 결과를 서버가 신뢰하지 않는다 — lib/program-screen-story.ts 가 재검증한다.

/** 서버 LIMITS(short/medium)와 맞춘다 — UI 에서 먼저 막아 저장 단계 절삭을 피한다. */
const TITLE_MAX = 120;
const DESC_MAX = 300;

const INPUT =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-white/40 outline-none transition-colors hover:bg-white/10 focus:border-violet-400/40";

function IconButton({
  onClick,
  disabled,
  label,
  children,
  danger = false,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`rounded-lg border border-white/10 bg-white/[0.08] px-2.5 py-1.5 text-xs text-[--muted] transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
        danger
          ? "hover:border-red-400/30 hover:bg-red-500/20 hover:text-red-200"
          : "hover:bg-white/15 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export default function ProgramScreenStoryFields({
  imagesName,
  storiesName,
  folder,
  initialImages = [],
  initialStories = [],
}: {
  imagesName: string;
  storiesName: string;
  folder: string;
  initialImages?: string[];
  initialStories?: ScreenStory[];
}) {
  const [rows, setRows] = useState<ScreenStoryRow[]>(() =>
    initialImages.map((image, i) => {
      const st = initialStories[i];
      return {
        image,
        title: st?.title ?? "",
        description: st?.description ?? "",
        // 저장된 story 가 있으면 그 값(없으면 노출), 없으면 undefined 로 둔다.
        // undefined 는 "아직 story metadata 가 아님" 이라 레거시 프로그램을
        // 체크박스 기본값만으로 story 사용 상태로 만들지 않는다.
        visible: st ? st.visible !== false : undefined,
      };
    })
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [manual, setManual] = useState("");

  /** 새 행 추가용 파일 선택. */
  const addRef = useRef<HTMLInputElement>(null);
  /** 특정 행의 이미지 교체용 — 어느 행을 교체하는지 기억해 둔다. */
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceAt = useRef<number | null>(null);

  const setAt = (i: number, patch: Partial<ScreenStoryRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const removeAt = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  /** 이미지·제목·설명이 **한 행 단위로 같이** 움직인다. */
  const move = (i: number, dir: -1 | 1) =>
    setRows((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const onAddFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    // 업로드를 **시작하기 전에** 막는다 — 일부만 Storage 에 올라가고 실패하는 걸 피한다.
    if (files.length > remaining) {
      setErr(
        `실제 화면은 최대 ${MAX_SCREEN_STORIES}개까지 등록할 수 있습니다. 현재 ${rows.length}개가 등록되어 있어 ${remaining}개만 더 추가할 수 있습니다.`
      );
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      // 선택 순서대로 행을 추가한다. 제목·설명은 비워 두고 사용자가 채운다.
      const added: ScreenStoryRow[] = [];
      for (const f of files) {
        added.push({ image: await uploadImage(f, folder, "thumb"), title: "", description: "" });
      }
      setRows((prev) => [...prev, ...added]);
    } catch (e) {
      console.error("[ProgramScreenStoryFields] upload error:", e);
      const msg = e instanceof Error ? e.message : String(e);
      setErr(`업로드 실패: ${msg} — 고급 옵션에서 URL을 직접 추가할 수도 있습니다.`);
    } finally {
      setBusy(false);
    }
  };

  const onReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.target.files ?? [])[0];
    e.target.value = "";
    const i = replaceAt.current;
    replaceAt.current = null;
    if (!file || i === null) return;
    setBusy(true);
    setErr(null);
    try {
      setAt(i, { image: await uploadImage(file, folder, "thumb") });
    } catch (e) {
      console.error("[ProgramScreenStoryFields] replace error:", e);
      const msg = e instanceof Error ? e.message : String(e);
      setErr(`업로드 실패: ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  const addManual = () => {
    const v = manual.trim();
    if (!v) return;
    if (atMax) {
      setErr(`실제 화면은 최대 ${MAX_SCREEN_STORIES}개까지 등록할 수 있습니다.`);
      return;
    }
    setRows((prev) => [...prev, { image: v, title: "", description: "" }]);
    setManual("");
  };

  // 직렬화·사용 판정은 lib/program-screen-story 가 소유한다(서버 검증과 같은 기준을 쓰기 위해).
  // 제목·설명이 전부 비어 있으면 story 미사용 → stories 는 빈 문자열이 되고,
  // 기존 screenshots 만 쓰던 프로그램은 제목을 채우지 않아도 그대로 저장된다.
  const serialized = useMemo(() => serializeScreenStoryRows(rows), [rows]);
  const missingTitle = useMemo(() => firstMissingTitleIndex(rows), [rows]);
  const keptCount = useMemo(() => keptScreenStoryRows(rows).length, [rows]);
  const remaining = Math.max(0, MAX_SCREEN_STORIES - rows.length);
  const atMax = remaining === 0;

  return (
    <div className="space-y-3">
      <input type="hidden" name={imagesName} value={serialized.images} />
      <input type="hidden" name={storiesName} value={serialized.stories} />
      <input
        ref={addRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onAddFiles}
        className="hidden"
      />
      <input
        ref={replaceRef}
        type="file"
        accept="image/*"
        onChange={onReplaceFile}
        className="hidden"
      />

      {rows.length === 0 ? (
        <button
          type="button"
          onClick={() => addRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-10 transition-colors hover:bg-white/10"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-foreground">
            +
          </span>
          <span className="text-sm font-medium text-foreground">
            {busy ? "업로드 중…" : "실제 화면 추가"}
          </span>
          <span className="text-xs text-[--muted-2]">여러 장을 한 번에 선택할 수 있습니다</span>
        </button>
      ) : (
        <ol className="space-y-3">
          {rows.map((row, i) => (
            <li
              key={i}
              className={`rounded-2xl border border-white/10 bg-white/[0.02] p-3 transition-opacity sm:flex sm:gap-4 ${
                row.visible === false ? "opacity-60" : ""
              }`}
            >
              {/* 왼쪽: 순번 + 노출 체크 + 세로 미리보기 (원본 비율 — 16:9 로 자르지 않는다) */}
              <div className="flex shrink-0 gap-3 sm:block">
                <div className="sm:mb-2">
                  <span className="font-mono text-xs tabular-nums text-[--muted-2]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <label className="mt-1 flex cursor-pointer items-center gap-1.5 text-xs text-[--muted]">
                    <input
                      type="checkbox"
                      checked={row.visible !== false}
                      onChange={(e) =>
                        // 체크를 되돌리면 undefined 로 돌아간다 — 이미지만 있던 레거시 행이
                        // 껐다 켰다는 이유만으로 story 사용 상태로 굳지 않게 한다.
                        setAt(i, { visible: e.target.checked ? undefined : false })
                      }
                      className="h-3.5 w-3.5 accent-violet-400"
                    />
                    노출
                  </label>
                </div>
                {row.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.image}
                    alt={`실제 화면 ${i + 1} 미리보기`}
                    className="h-40 w-auto max-w-[120px] rounded-lg border border-white/10 bg-black object-contain"
                  />
                ) : (
                  <div className="flex h-40 w-[90px] items-center justify-center rounded-lg border border-dashed border-white/15 text-xs text-[--muted-2]">
                    이미지 없음
                  </div>
                )}
              </div>

              {/* 오른쪽: 제목 · 설명 · 행 조작 */}
              <div className="mt-3 min-w-0 flex-1 space-y-2 sm:mt-0">
                <div>
                  <label className="mb-1 block text-xs text-[--muted-2]">화면 제목</label>
                  <input
                    value={row.title}
                    maxLength={TITLE_MAX}
                    onChange={(e) => setAt(i, { title: e.target.value })}
                    placeholder="홈 화면"
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[--muted-2]">설명</label>
                  <textarea
                    value={row.description}
                    maxLength={DESC_MAX}
                    rows={2}
                    onChange={(e) => setAt(i, { description: e.target.value })}
                    placeholder="건물 현황과 이번 달 받을 돈을 한 화면에서 확인합니다."
                    className={`${INPUT} resize-y`}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <IconButton onClick={() => move(i, -1)} disabled={i === 0} label="위로 이동">
                    ↑
                  </IconButton>
                  <IconButton
                    onClick={() => move(i, 1)}
                    disabled={i === rows.length - 1}
                    label="아래로 이동"
                  >
                    ↓
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      replaceAt.current = i;
                      replaceRef.current?.click();
                    }}
                    label="이미지 변경"
                  >
                    이미지 변경
                  </IconButton>
                  <IconButton onClick={() => removeAt(i)} label="이 화면 삭제" danger>
                    삭제
                  </IconButton>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      {rows.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => addRef.current?.click()}
            disabled={atMax}
            className="text-sm text-[--muted] transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[--muted]"
          >
            + {busy ? "업로드 중…" : "실제 화면 추가"}
          </button>
          <span className="font-mono text-xs tabular-nums text-[--muted-2]">
            실제 화면 {keptCount} / {MAX_SCREEN_STORIES}
          </span>
          {atMax && (
            <span className="text-xs text-[--muted-2]">
              최대 {MAX_SCREEN_STORIES}개까지 등록할 수 있습니다.
            </span>
          )}
        </div>
      )}

      {err && <p className="text-xs text-red-300">{err}</p>}
      {missingTitle >= 0 && (
        <p className="text-xs text-amber-300">
          실제 화면 {missingTitle + 1}번의 제목이 비어 있습니다. 제목이 없으면 저장되지 않습니다.
        </p>
      )}

      <details className="text-sm">
        <summary className="cursor-pointer text-[--muted-2]">고급 옵션</summary>
        <div className="mt-2">
          <label className="label">URL 직접 추가</label>
          <div className="flex gap-2">
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="/image/landingpage/cozyrent/home.jpg"
              className="input"
            />
            <button type="button" onClick={addManual} className="btn btn-ghost px-4">
              추가
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * 1차: 이름(user_metadata.name)만 수정.
 * 이메일/비밀번호 변경은 범위에서 제외(비밀번호는 /reset-password 사용).
 */
export default function SettingsForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { name: name.trim() },
    });
    setLoading(false);

    if (error) {
      setError("저장에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    setSaved(true);
    router.refresh(); // Dashboard/Profile 등 서버 컴포넌트에 반영
  };

  return (
    <form className="card space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="label" htmlFor="name">
          이름
        </label>
        <input
          id="name"
          type="text"
          className="input"
          placeholder="이름"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-300">
          저장되었습니다.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-accent w-full disabled:opacity-60"
      >
        {loading ? "저장 중…" : "저장"}
      </button>
    </form>
  );
}

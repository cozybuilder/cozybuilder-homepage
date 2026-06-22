import type { ReactNode } from "react";

/** 라벨 + 입력 묶음. 전역 .label 스타일 기준. */
export function FormField({
  label,
  htmlFor,
  children,
}: {
  label?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      {label && (
        <label className="label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

"use client";

import type { ReactNode } from "react";

type ShimmerTextProps = {
  children: ReactNode;
  fast?: boolean;
  className?: string;
  as?: "span" | "div";
};

export function ShimmerText({
  children,
  fast = false,
  className = "",
  as: Tag = "span",
}: ShimmerTextProps) {
  return (
    <Tag
      className={`${fast ? "shimmer-text-fast" : "shimmer-text"} ${className}`}
    >
      {children}
    </Tag>
  );
}

import type { CSSProperties } from "react";

/** Placeholder IEI Ventures wordmark — swap for real logo once approved. */
export function IeiMark({
  size = "md",
  label = "IEI",
  style,
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={`iei-mark size-${size}`} style={style} aria-hidden="true">
      {label}
    </span>
  );
}

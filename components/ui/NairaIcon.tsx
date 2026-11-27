import React from "react";

interface NairaIconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Lucide-compatible Nigerian Naira (₦) SVG icon component.
 */
export function NairaIcon({
  size = 18,
  color = "currentColor",
  strokeWidth = 2,
  className,
  style,
}: NairaIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M6 19V5l12 14V5" />
      <path d="M3 10h18" />
      <path d="M3 14h18" />
    </svg>
  );
}

export default NairaIcon;

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatNaira, formatNairaCompact } from "@/lib/utils";
import Link from "next/link";

interface KPICardProps {
  title: string;
  value: number | string;
  isCurrency?: boolean;
  compact?: boolean;
  change?: number;
  changePeriod?: string;
  icon: React.ElementType;
  accentColor?: string;
  id: string;
  href?: string;
}

export default function KPICard({
  title,
  value,
  isCurrency = false,
  compact = false,
  change,
  changePeriod,
  icon: Icon,
  accentColor = "var(--color-accent)",
  id,
}: KPICardProps) {
  const displayValue = isCurrency
    ? compact
      ? formatNairaCompact(value as number)
      : formatNaira(value as number)
    : value.toLocaleString();

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral  = change === undefined || change === 0;

  const cardContent = (
    <>
      {/* Top row: icon + title */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--color-text-muted)",
              marginBottom: 4,
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "10px",
            background: `${accentColor}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={18} style={{ color: accentColor }} />
        </div>
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: "28px",
          fontWeight: 800,
          color: "var(--color-text-primary)",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.1,
          marginBottom: 10,
        }}
      >
        {displayValue}
      </div>

      {/* Change indicator */}
      {change !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {isPositive && (
            <>
              <TrendingUp size={13} style={{ color: "var(--color-success)" }} />
              <span style={{ fontSize: "12px", color: "var(--color-success)", fontWeight: 600 }}>
                +{Math.abs(change)}%
              </span>
            </>
          )}
          {isNegative && (
            <>
              <TrendingDown size={13} style={{ color: "var(--color-error)" }} />
              <span style={{ fontSize: "12px", color: "var(--color-error)", fontWeight: 600 }}>
                {change}%
              </span>
            </>
          )}
          {isNeutral && (
            <>
              <Minus size={13} style={{ color: "var(--color-text-muted)" }} />
              <span style={{ fontSize: "12px", color: "var(--color-text-muted)", fontWeight: 600 }}>
                0%
              </span>
            </>
          )}
          {changePeriod && (
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              {changePeriod}
            </span>
          )}
        </div>
      )}

      {/* For non-change items (like Low Stock count) show a label */}
      {change === undefined && changePeriod && (
        <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
          {changePeriod}
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="kpi-card" id={id} style={{ textDecoration: 'none', display: 'block' }}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="kpi-card" id={id}>
      {cardContent}
    </div>
  );
}

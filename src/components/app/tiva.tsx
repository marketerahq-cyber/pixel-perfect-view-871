import { cn } from "@/lib/utils";

export type TivaGesture = "wave" | "point" | "thumbs-up" | "idle";

/**
 * Tiva — the Reach onboarding guide. A small friendly figure with four
 * gestures from the brief: wave (greeting), point (drawing attention),
 * thumbs-up (celebration) and an idle head-tilt.
 */
export function Tiva({
  gesture = "idle",
  className,
}: {
  gesture?: TivaGesture;
  className?: string;
}) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      role="img"
      aria-label={`Tiva, your guide, ${gesture.replace("-", " ")}`}
    >
      <svg viewBox="0 0 96 96" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="tiva-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--violet, var(--primary))" />
          </linearGradient>
        </defs>

        {/* soft halo */}
        <circle cx="48" cy="52" r="42" fill="var(--accent)" opacity="0.08" />

        {/* body */}
        <path
          d="M26 92c0-14 9.85-24 22-24s22 10 22 24z"
          fill="url(#tiva-body)"
          opacity="0.95"
        />

        {/* head */}
        <g
          className={cn(
            "origin-[48px_44px]",
            gesture === "idle" && "tiva-tilt",
            gesture === "thumbs-up" && "tiva-bounce",
          )}
        >
          <circle cx="48" cy="40" r="22" fill="url(#tiva-body)" />
          <circle cx="40" cy="38" r="3.2" fill="var(--primary-foreground)" />
          <circle cx="56" cy="38" r="3.2" fill="var(--primary-foreground)" />
          <path
            d="M40 48c2.6 3.2 5.4 4.8 8 4.8s5.4-1.6 8-4.8"
            stroke="var(--primary-foreground)"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="31" cy="46" r="3.4" fill="var(--accent)" opacity="0.55" />
          <circle cx="65" cy="46" r="3.4" fill="var(--accent)" opacity="0.55" />
        </g>

        {/* arm — the gesture */}
        {gesture === "wave" && (
          <g className="tiva-wave origin-[70px_70px]">
            <path
              d="M66 72 L80 58"
              stroke="url(#tiva-body)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <circle cx="82" cy="55" r="6" fill="var(--accent)" />
          </g>
        )}
        {gesture === "point" && (
          <g className="tiva-point">
            <path
              d="M66 74 L84 74"
              stroke="url(#tiva-body)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <circle cx="87" cy="74" r="6" fill="var(--accent)" />
          </g>
        )}
        {gesture === "thumbs-up" && (
          <g>
            <path
              d="M66 74 L78 62"
              stroke="url(#tiva-body)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <circle cx="81" cy="59" r="7" fill="var(--success)" />
            <path
              d="M78 59 l2.2 2.4 4-4.6"
              stroke="var(--primary-foreground)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        )}
        {gesture === "idle" && (
          <path
            d="M66 74 L76 70"
            stroke="url(#tiva-body)"
            strokeWidth="7"
            strokeLinecap="round"
          />
        )}
      </svg>
    </span>
  );
}

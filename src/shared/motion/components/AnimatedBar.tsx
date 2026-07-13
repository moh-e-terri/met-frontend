import { cn } from "@/shared/utils/cn";
import { useInView, usePrefersReducedMotion } from "../useInView";

interface AnimatedBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  durationMs?: number;
}

export const AnimatedBar = ({
  value,
  max = 100,
  className,
  barClassName,
  durationMs = 1200,
}: AnimatedBarProps) => {
  const { ref, inView } = useInView({ once: true, rootMargin: "0px 0px -5% 0px" });
  const reducedMotion = usePrefersReducedMotion();
  const width = `${Math.min(100, (value / max) * 100)}%`;

  return (
    <div
      ref={ref as never}
      className={cn("overflow-hidden rounded-full bg-[#f1f5f9]", className)}
    >
      <div
        className={cn(
          "h-full rounded-full ease-out",
          barClassName,
          !reducedMotion && "transition-[width]",
        )}
        style={{
          width: inView || reducedMotion ? width : "0%",
          transitionDuration: reducedMotion ? "0ms" : `${durationMs}ms`,
        }}
      />
    </div>
  );
};

interface AnimatedChartBarProps {
  value: number;
  maxValue: number;
  minHeight?: number;
  plotHeight?: number;
  className?: string;
  active?: boolean;
  label?: React.ReactNode;
  tooltip?: React.ReactNode;
}

export const AnimatedChartBar = ({
  value,
  maxValue,
  minHeight = 14,
  plotHeight = 176,
  className,
  active = false,
  label,
  tooltip,
}: AnimatedChartBarProps) => {
  const { ref, inView } = useInView({ once: true, rootMargin: "0px 0px -5% 0px" });
  const reducedMotion = usePrefersReducedMotion();
  const targetHeight = Math.max(
    minHeight,
    Math.round((value / maxValue) * plotHeight),
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <div
        ref={ref as never}
        className="relative flex w-full flex-col items-center justify-end"
        style={{ height: plotHeight }}
      >
        {active && tooltip && (
          <div
            className="pointer-events-none absolute z-10 transition-[bottom,opacity] duration-700 ease-out"
            style={{
              bottom: inView || reducedMotion ? targetHeight + 12 : minHeight + 12,
              opacity: inView || reducedMotion ? 1 : 0,
            }}
          >
            {tooltip}
          </div>
        )}

        <div
          data-chart-bar
          data-chart-value={value}
          className={cn(
            "w-8 origin-bottom rounded-t-[10px] sm:w-10",
            !reducedMotion && "transition-[height,box-shadow] duration-[900ms] ease-out",
            active
              ? "bg-[#f5a524] shadow-[0_8px_20px_-6px_rgba(245,165,36,0.55)]"
              : "bg-[#bfdbfe]",
            className,
          )}
          style={{ height: inView || reducedMotion ? targetHeight : 0 }}
        />
      </div>
      {label}
    </div>
  );
};

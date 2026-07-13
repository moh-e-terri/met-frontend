import { useEffect, useMemo, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { formatMetricValue, parseMetricValue } from "../parseMetric";
import { useInView, usePrefersReducedMotion } from "../useInView";

interface CountUpProps {
  value: string;
  className?: string;
  duration?: number;
  dir?: "ltr" | "rtl" | "auto";
}

export const CountUp = ({
  value,
  className,
  duration = 1.6,
  dir = "ltr",
}: CountUpProps) => {
  const parsed = useMemo(() => parseMetricValue(value), [value]);
  const { ref, inView } = useInView({ once: true, rootMargin: "0px 0px -5% 0px" });
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(() =>
    reducedMotion ? value : formatMetricValue(parsed, 0),
  );

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    if (!inView) return;

    let frame = 0;
    let start: number | null = null;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(formatMetricValue(parsed, parsed.number * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        setDisplay(value);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [duration, inView, parsed, reducedMotion, value]);

  return (
    <span ref={ref as never} className={cn("tabular-nums", className)} dir={dir}>
      {display}
    </span>
  );
};

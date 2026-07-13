import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/utils/cn";
import { useInView } from "../useInView";

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
}

export const Reveal = ({
  children,
  className,
  delay = 0,
  direction = "up",
  ...props
}: RevealProps) => {
  const { ref, inView } = useInView({ once: true, rootMargin: "0px 0px -8% 0px" });

  return (
    <div
      ref={ref as never}
      className={cn(
        "motion-reveal",
        direction !== "up" && `motion-reveal--${direction}`,
        inView && "motion-reveal--visible",
        className,
      )}
      style={{ "--motion-delay": `${delay}ms` } as CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
};

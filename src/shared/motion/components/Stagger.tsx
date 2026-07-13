import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/utils/cn";
import { useInView } from "../useInView";

interface StaggerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  staggerMs?: number;
}

export const Stagger = ({
  children,
  className,
  staggerMs = 90,
  ...props
}: StaggerProps) => {
  const { ref, inView } = useInView({ once: true, rootMargin: "0px 0px -6% 0px" });

  return (
    <div
      ref={ref as never}
      className={cn(
        "motion-stagger",
        inView && "motion-stagger--visible",
        className,
      )}
      style={{ "--motion-stagger": `${staggerMs}ms` } as CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
};

interface PageMotionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  staggerMs?: number;
}

export const PageMotion = ({
  children,
  className,
  staggerMs = 100,
  ...props
}: PageMotionProps) => {
  const { ref, inView } = useInView({
    once: true,
    rootMargin: "0px",
    threshold: 0,
  });

  return (
    <div
      ref={ref as never}
      className={cn(
        "motion-stagger",
        inView && "motion-stagger--visible",
        className,
      )}
      style={{ "--motion-stagger": `${staggerMs}ms` } as CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
};

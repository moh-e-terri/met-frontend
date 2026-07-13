import { cn } from "@/shared/utils/cn";

interface AmbientOrbProps {
  className?: string;
  delay?: boolean;
}

export const AmbientOrb = ({ className, delay }: AmbientOrbProps) => (
  <div
    aria-hidden
    className={cn(
      "motion-orb pointer-events-none absolute rounded-full blur-3xl",
      delay && "motion-orb--delay",
      className,
    )}
  />
);

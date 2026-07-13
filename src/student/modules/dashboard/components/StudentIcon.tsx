import { cn } from "@/shared/utils/cn";

interface StudentIconProps {
  src: string;
  className?: string;
  alt?: string;
}

export const StudentIcon = ({ src, className, alt = "" }: StudentIconProps) => {
  return (
    <span
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt === ""}
      className={cn(
        "inline-block shrink-0 bg-current mask-contain mask-center mask-no-repeat",
        className,
      )}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
      }}
    />
  );
};

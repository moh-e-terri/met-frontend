import { cn } from "@/shared/utils/cn";

interface TeacherIconProps {
  src: string;
  className?: string;
  alt?: string;
}

export const TeacherIcon = ({ src, className, alt = "" }: TeacherIconProps) => {
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

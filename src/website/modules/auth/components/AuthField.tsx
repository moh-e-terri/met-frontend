import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthField = ({ label, error, className, ...props }: AuthFieldProps) => {
  return (
    <div className="space-y-2 text-right">
      {label ? (
        <label className="block text-sm text-[#334155]">{label}</label>
      ) : null}
      <input
        {...props}
        className={cn(
          "h-[50px] w-full rounded-[24px] border border-[#e2e8f0] bg-white px-4 text-right text-base text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#f5a524]",
          error && "border-red-400",
          className,
        )}
      />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
};

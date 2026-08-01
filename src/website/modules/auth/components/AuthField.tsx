import { useState, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthField = ({
  label,
  error,
  className,
  type = "text",
  ...props
}: AuthFieldProps) => {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div className="space-y-2 text-right">
      {label ? (
        <label className="block text-sm text-[#334155]">{label}</label>
      ) : null}
      <div className="relative">
        <input
          {...props}
          type={inputType}
          className={cn(
            "h-[50px] w-full rounded-[24px] border border-[#e2e8f0] bg-white px-4 text-right text-base text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#f5a524]",
            isPassword && "pl-12",
            error && "border-red-400",
            className,
          )}
        />
        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((current) => !current)}
            className="absolute left-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[#94a3b8] transition-colors hover:bg-[#f8fafc] hover:text-[#f5a524]"
            aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            <span
              aria-hidden
              className="inline-block size-5 bg-current mask-contain mask-center mask-no-repeat"
              style={{
                WebkitMaskImage: `url(/images/student/icon-eye.svg)`,
                maskImage: `url(/images/student/icon-eye.svg)`,
                opacity: visible ? 1 : 0.55,
              }}
            />
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
};

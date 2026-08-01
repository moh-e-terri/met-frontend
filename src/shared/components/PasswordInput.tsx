import { useState, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export const PasswordInput = ({
  label,
  className,
  ...props
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#0f172a]">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          type={visible ? "text" : "password"}
          className={cn(
            "w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] py-3 pl-12 pr-4 text-right text-sm text-[#0f172a] outline-none transition-colors focus:border-[#f5a524]/30 focus:bg-white",
            className,
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((current) => !current)}
          className="absolute left-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[#94a3b8] transition-colors hover:bg-white hover:text-[#f5a524]"
          aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        >
          <span
            aria-hidden
            className="inline-block size-5 bg-current mask-contain mask-center mask-no-repeat"
            style={{
              WebkitMaskImage: "url(/images/student/icon-eye.svg)",
              maskImage: "url(/images/student/icon-eye.svg)",
              opacity: visible ? 1 : 0.55,
            }}
          />
        </button>
      </div>
    </div>
  );
};

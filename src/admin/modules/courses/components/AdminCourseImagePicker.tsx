import { useRef } from "react";
import { cn } from "@/shared/utils/cn";
import { COURSE_IMAGE_PRESETS } from "../data/mockAdminCourses";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

interface AdminCourseImagePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("تعذر قراءة الصورة"));
    reader.readAsDataURL(file);
  });
}

export const AdminCourseImagePicker = ({
  value,
  onChange,
  label = "صورة المقرر",
}: AdminCourseImagePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3 text-right">
      <span className="block text-sm font-semibold text-[#0f172a]">{label}</span>

      <div className="flex flex-wrap items-center gap-4">
        <img
          src={value || COURSE_IMAGE_PRESETS[0]}
          alt=""
          className="size-24 rounded-2xl border border-[#e2e8f0] object-cover"
          aria-hidden
        />
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5 text-sm font-semibold text-[#0f172a] transition-colors hover:bg-white"
          >
            <AdminIcon
              src="/images/teacher/icon-image-upload.svg"
              className="size-4 text-[#f5a524]"
            />
            رفع صورة
          </button>
          <p className="text-xs text-[#94a3b8]">JPG أو PNG أو WebP — أو اختر من الجاهزة</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          try {
            const dataUrl = await fileToDataUrl(file);
            if (dataUrl) onChange(dataUrl);
          } catch {
            /* ignore */
          } finally {
            event.target.value = "";
          }
        }}
      />

      <div className="grid grid-cols-4 gap-2">
        {COURSE_IMAGE_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={cn(
              "overflow-hidden rounded-xl border-2 transition-colors",
              value === preset ? "border-[#f5a524]" : "border-transparent hover:border-[#e2e8f0]",
            )}
          >
            <img src={preset} alt="" className="aspect-video w-full object-cover" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  );
};

import { type ReactNode } from "react";
import { cn } from "@/shared/utils/cn";
import {
  courseCategories,
  courseLevels,
  type CourseEditorForm,
  type CourseLevel,
} from "../data/mockCourseEditor";

interface CourseDetailsFormProps {
  form: CourseEditorForm;
  readOnly?: boolean;
}

const FieldLabel = ({ children }: { children: ReactNode }) => (
  <label className="mb-2 block text-right text-sm font-semibold text-[#0f172a]">
    {children}
  </label>
);

export const CourseDetailsForm = ({ form, readOnly = false }: CourseDetailsFormProps) => {
  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-black text-[#0f172a]">تفاصيل المساق</h2>
        {readOnly ? (
          <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#3b82f6]">
            للعرض فقط — التعديل من الإدارة
          </span>
        ) : (
          <div className="flex items-center gap-3" dir="ltr">
            <button
              type="button"
              className="rounded-2xl border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#f8fafc]"
            >
              حفظ
            </button>
            <button
              type="button"
              className="rounded-2xl bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.2)] transition-transform hover:scale-[1.01]"
            >
              رفع المساق
            </button>
          </div>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <FieldLabel>العنوان</FieldLabel>
          <input
            type="text"
            defaultValue={form.title}
            readOnly={readOnly}
            className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-right text-sm text-[#0f172a] outline-none transition-colors focus:border-[#f5a524]/30 focus:bg-white read-only:opacity-80"
          />
        </div>

        <div>
          <FieldLabel>الوصف</FieldLabel>
          <textarea
            rows={4}
            defaultValue={form.description}
            readOnly={readOnly}
            placeholder="أضف شرحاً بسيطاً عن المساق للطلاب"
            className="w-full resize-none rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-right text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#f5a524]/30 focus:bg-white read-only:opacity-80"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <FieldLabel>الفئة</FieldLabel>
            <select
              defaultValue={form.category}
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-right text-sm text-[#0f172a] outline-none transition-colors focus:border-[#f5a524]/30 focus:bg-white"
            >
              {courseCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>المستوى</FieldLabel>
            <LevelSelector activeLevel={form.level} />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <FieldLabel>السعر</FieldLabel>
            <input
              type="text"
              defaultValue={form.price}
              dir="ltr"
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-left text-sm text-[#0f172a] outline-none transition-colors focus:border-[#f5a524]/30 focus:bg-white"
            />
          </div>

          <div>
            <FieldLabel>الأوسمة</FieldLabel>
            <input
              type="text"
              defaultValue={form.tags}
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-right text-sm text-[#0f172a] outline-none transition-colors focus:border-[#f5a524]/30 focus:bg-white"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const LevelSelector = ({ activeLevel }: { activeLevel: CourseLevel }) => {
  return (
    <div className="flex rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-1">
      {courseLevels.map((level) => (
        <button
          key={level.id}
          type="button"
          className={cn(
            "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors",
            activeLevel === level.id
              ? "bg-[#f5a524] text-white shadow-sm"
              : "text-[#64748b] hover:text-[#0f172a]",
          )}
        >
          {level.label}
        </button>
      ))}
    </div>
  );
};

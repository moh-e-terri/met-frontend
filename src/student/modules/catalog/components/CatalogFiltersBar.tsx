import type { CourseLevel } from "@/student/api/availableCourses";
import { StudentIcon } from "../../dashboard/components/StudentIcon";

const levelOptions: { value: CourseLevel | ""; label: string }[] = [
  { value: "", label: "جميع المستويات" },
  { value: "beginner", label: "مبتدئ" },
  { value: "intermediate", label: "متوسط" },
  { value: "advanced", label: "متقدم" },
];

interface CatalogFiltersBarProps {
  search: string;
  level: CourseLevel | "";
  onSearchChange: (value: string) => void;
  onLevelChange: (value: CourseLevel | "") => void;
  total?: number;
}

export const CatalogFiltersBar = ({
  search,
  level,
  onSearchChange,
  onLevelChange,
  total,
}: CatalogFiltersBarProps) => {
  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-4 shadow-sm sm:p-5"
      dir="rtl"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-bold text-[#0f172a]">نتائج البحث</h2>
          <p className="mt-1 text-sm text-[#64748b]">
            {typeof total === "number" ? `${total} مقرر متاح` : "جاري التحميل..."}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-2xl">
          <label className="relative block flex-1">
            <StudentIcon
              src="/images/student/icon-search.svg"
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]"
            />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="ابحث عن مقرر..."
              className="h-11 w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] pr-10 pl-4 text-right text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#f5a524]/40 focus:bg-white"
            />
          </label>

          <select
            value={level}
            onChange={(event) => onLevelChange(event.target.value as CourseLevel | "")}
            className="h-11 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm text-[#0f172a] outline-none transition-colors focus:border-[#f5a524]/40 focus:bg-white"
          >
            {levelOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
};

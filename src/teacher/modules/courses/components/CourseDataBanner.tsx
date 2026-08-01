interface CourseDataBannerProps {
  title: string;
  image?: string;
  students?: string;
  lessons?: string;
  university?: string;
  description?: string;
}

export const CourseDataBanner = ({
  title,
  image,
  students,
  lessons,
  university,
  description,
}: CourseDataBannerProps) => {
  const stats = [
    university ? { label: "الجامعة", value: university } : null,
    students ? { label: "الطلاب", value: students } : null,
    lessons ? { label: "الدروس", value: lessons } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <section
      className="overflow-hidden rounded-3xl border border-[#fde8c8] bg-gradient-to-l from-[#fff7ed] via-[#fffbeb] to-[#ffedd5] shadow-sm"
      dir="rtl"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        {image ? (
          <img
            src={image}
            alt=""
            className="h-24 w-full shrink-0 rounded-2xl object-cover sm:h-28 sm:w-40"
            aria-hidden
          />
        ) : (
          <div className="flex h-24 w-full shrink-0 items-center justify-center rounded-2xl bg-[#f5a524]/15 sm:h-28 sm:w-40">
            <span className="text-sm font-semibold text-[#f5a524]">بيانات الكورس</span>
          </div>
        )}

        <div className="min-w-0 flex-1 text-right">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-lg font-black text-[#0f172a] sm:text-xl">{title}</h2>
              {university ? (
                <p className="mt-1 text-sm font-semibold text-[#f5a524]">{university}</p>
              ) : null}
            </div>
            <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#3b82f6] ring-1 ring-[#bfdbfe]">
              للعرض فقط — التعديل من الإدارة
            </span>
          </div>

          <p className="text-sm leading-6 text-[#64748b]">
            {description?.trim() ||
              "البيانات الأساسية للمقرر تُدار من لوحة الإدارة، ويمكنك هنا إدارة الدروس والواجبات والاختبارات."}
          </p>

          {stats.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white/70 px-3 py-2 ring-1 ring-[#fde8c8]"
                >
                  <p className="text-[10px] font-medium text-[#94a3b8]">{stat.label}</p>
                  <p className="text-sm font-bold text-[#0f172a]">{stat.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

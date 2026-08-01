import { Link } from "react-router-dom";
import type { CourseWorkspaceCapabilities, CourseWorkspaceMeta } from "./types";

interface CourseWorkspaceHeroProps {
  meta: CourseWorkspaceMeta;
  capabilities: CourseWorkspaceCapabilities;
  lessonsCount: number;
  studentsCount: number;
}

export const CourseWorkspaceHero = ({
  meta,
  capabilities,
  lessonsCount,
  studentsCount,
}: CourseWorkspaceHeroProps) => {
  return (
    <section
      className="overflow-hidden rounded-[28px] border border-[#e2e8f0] bg-white shadow-sm"
      dir="rtl"
    >
      <div className="grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative min-h-[180px] bg-[#0f172a]">
          {meta.image ? (
            <img
              src={meta.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-90"
              aria-hidden
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 to-transparent" />
        </div>

        <div className="flex flex-col justify-between gap-5 p-5 sm:p-6">
          <div className="text-right">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {meta.statusLabel ? (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.statusClassName ?? "bg-[#ecfdf5] text-[#14b8a6]"}`}
                >
                  {meta.statusLabel}
                </span>
              ) : null}
              {meta.level ? (
                <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold text-[#64748b]">
                  {meta.level}
                </span>
              ) : null}
              {meta.university ? (
                <span className="rounded-full bg-[#eff6ff] px-2.5 py-1 text-xs font-semibold text-[#3b82f6]">
                  {meta.university}
                </span>
              ) : null}
            </div>

            <h1 className="text-2xl font-black text-[#0f172a] sm:text-3xl">
              {meta.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#64748b]">
              {meta.description?.trim() || "لا يوجد وصف لهذا المقرر."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="rounded-2xl bg-[#f8fafc] px-4 py-2">
                <p className="text-[11px] text-[#94a3b8]">الفيديوهات</p>
                <p className="font-bold text-[#0f172a]">{lessonsCount}</p>
              </div>
              <div className="rounded-2xl bg-[#f8fafc] px-4 py-2">
                <p className="text-[11px] text-[#94a3b8]">الطلاب</p>
                <p className="font-bold text-[#0f172a]">
                  {studentsCount || meta.enrolledCount || 0}
                </p>
              </div>
              {meta.metCost != null ? (
                <div className="rounded-2xl bg-[#f8fafc] px-4 py-2">
                  <p className="text-[11px] text-[#94a3b8]">تكلفة MET</p>
                  <p className="font-bold text-[#0f172a]">{meta.metCost}</p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {capabilities.showCommunity ? (
                <Link
                  to={capabilities.communityPath}
                  className="rounded-2xl bg-[#0f172a] px-4 py-2.5 text-sm font-bold text-white"
                >
                  مجتمع المقرر
                </Link>
              ) : null}
              {capabilities.canManageContent && capabilities.managePath ? (
                <Link
                  to={capabilities.managePath}
                  className="rounded-2xl border border-[#e2e8f0] px-4 py-2.5 text-sm font-bold text-[#0f172a]"
                >
                  إدارة المحتوى
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import { getAdminBasePath } from "@/core/routing/appSurface";
import { Link } from "react-router-dom";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

export const AdminFinancialsPageHeader = () => {
  const basePath = getAdminBasePath();

  return (
    <header className="space-y-4" dir="rtl">
      <nav className="text-sm text-[#64748b]">
        <Link to={basePath || "/"} className="transition-colors hover:text-[#f5a524]">
          الإدارة
        </Link>
        <span className="mx-2">›</span>
        <span className="font-medium text-[#0f172a]">المالية</span>
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="text-right">
          <h1 className="text-2xl font-black text-[#0f172a] sm:text-3xl">
            نظرة عامة على المالية
          </h1>
          <p className="mt-2 text-sm text-[#64748b] sm:text-base">
            تتبع إيرادات المنصة، توزيعات المدربين، والمبالغ المحتجزة.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-2xl bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.25)] transition-transform hover:scale-[1.01]"
        >
          <AdminIcon src="/images/student/icon-download.svg" className="size-4 text-white" />
          <span>تصدير التقرير</span>
        </button>
      </div>
    </header>
  );
};

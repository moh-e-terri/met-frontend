import { getAdminBasePath } from "@/core/routing/appSurface";
import { Link } from "react-router-dom";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

interface AdminStudentsPageHeaderProps {
  totalCount?: number;
  searchName: string;
  searchEmail: string;
  onSearchNameChange: (value: string) => void;
  onSearchEmailChange: (value: string) => void;
  onApplyFilters: () => void;
}

export const AdminStudentsPageHeader = ({
  totalCount = 0,
  searchName,
  searchEmail,
  onSearchNameChange,
  onSearchEmailChange,
  onApplyFilters,
}: AdminStudentsPageHeaderProps) => {
  const basePath = getAdminBasePath();

  return (
    <header className="space-y-4" dir="rtl">
      <nav className="text-sm text-[#64748b]">
        <Link to={basePath || "/"} className="transition-colors hover:text-[#f5a524]">
          الإدارة
        </Link>
        <span className="mx-2">›</span>
        <span className="font-medium text-[#0f172a]">الطلاب</span>
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="text-right">
          <h1 className="text-2xl font-black text-[#0f172a] sm:text-3xl">
            دليل الطلاب
          </h1>
          <p className="mt-2 text-sm text-[#64748b] sm:text-base">
            إدارة {totalCount.toLocaleString("ar-SA")} طالب مسجّل في المنصة.
          </p>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-4 sm:grid-cols-[1fr_1fr_auto]">
        <input
          value={searchName}
          onChange={(event) => onSearchNameChange(event.target.value)}
          placeholder="بحث بالاسم"
          className="h-11 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm outline-none focus:border-[#f5a524]"
        />
        <input
          value={searchEmail}
          onChange={(event) => onSearchEmailChange(event.target.value)}
          placeholder="بحث بالبريد"
          className="h-11 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm outline-none focus:border-[#f5a524]"
          dir="ltr"
        />
        <button
          type="button"
          onClick={onApplyFilters}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-white"
        >
          <AdminIcon src="/images/student/icon-search.svg" className="size-4 text-white" />
          <span>بحث</span>
        </button>
      </div>
    </header>
  );
};

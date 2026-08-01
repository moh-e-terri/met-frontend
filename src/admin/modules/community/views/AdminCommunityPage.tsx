import { PageMotion } from "@/shared/motion";
import { CommunityFeed } from "@/shared/modules/community";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

export const AdminCommunityPage = () => {
  return (
    <PageMotion className="mx-auto w-full max-w-[900px] space-y-6">
      <section
        className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
        dir="rtl"
      >
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#fff7ed]">
            <AdminIcon
              src="/images/student/icon-community.svg"
              className="size-5 text-[#f5a524]"
            />
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold text-[#0f172a]">المجتمع العام</h1>
            <p className="mt-1 text-sm text-[#64748b]">
              متابعة منشورات المنصة، النشر للعامة، التثبيت، والحذف حسب صلاحيات
              الأدمن.
            </p>
          </div>
        </div>
      </section>

      <CommunityFeed
        canModerate
        composerPlaceholder="انشر إعلاناً أو تحديثاً للمجتمع العام..."
        emptySubtitle="لا توجد منشورات بعد. ابدأ بنشر أول محتوى للمجتمع."
      />
    </PageMotion>
  );
};

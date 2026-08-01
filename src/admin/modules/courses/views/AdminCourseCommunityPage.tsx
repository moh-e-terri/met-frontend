import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminQueryKeys, fetchAdminCourses } from "@/admin/api";
import { PageMotion } from "@/shared/motion";
import { CommunityFeed } from "@/shared/modules/community";

export const AdminCourseCommunityPage = () => {
  const { courseId = "" } = useParams<{ courseId: string }>();

  const coursesQuery = useQuery({
    queryKey: adminQueryKeys.courses({ limit: 100 }),
    queryFn: () => fetchAdminCourses({ page: 1, limit: 100 }),
  });

  const course = coursesQuery.data?.items.find((item) => item.id === courseId);
  const title = course?.title ?? "المقرر";

  return (
    <PageMotion className="mx-auto w-full max-w-[900px] space-y-6">
      <section
        className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
        dir="rtl"
      >
        <Link
          to={`/admin/courses/${courseId}`}
          className="text-sm font-semibold text-[#64748b] hover:text-[#0f172a]"
        >
          ← العودة لتفاصيل المقرر
        </Link>
        <h1 className="mt-3 text-2xl font-black text-[#0f172a]">
          مجتمع مقرر: {title}
        </h1>
        <p className="mt-2 text-sm text-[#64748b]">
          منشورات ونقاشات خاصة بهذا المقرر فقط، مع صلاحيات الإشراف الكاملة.
        </p>
      </section>

      <CommunityFeed
        canModerate
        courseId={courseId}
        courseTitle={title}
        emptyTitle="لا منشورات لهذا المقرر بعد"
        emptySubtitle="ابدأ بنشر إعلان أو سؤال خاص بهذا المقرر."
      />
    </PageMotion>
  );
};

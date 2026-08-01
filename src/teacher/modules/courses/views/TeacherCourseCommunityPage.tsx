import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageMotion } from "@/shared/motion";
import { CommunityFeed } from "@/shared/modules/community";
import {
  fetchInstructorDashboard,
  teacherQueryKeys,
} from "@/teacher/api";

export const TeacherCourseCommunityPage = () => {
  const { courseId = "" } = useParams<{ courseId: string }>();

  const dashboardQuery = useQuery({
    queryKey: teacherQueryKeys.dashboard,
    queryFn: fetchInstructorDashboard,
  });

  const course = dashboardQuery.data?.courses.find((item) => item.id === courseId);
  const title = course?.title ?? "المقرر";

  return (
    <PageMotion className="mx-auto w-full max-w-[900px] space-y-6">
      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm" dir="rtl">
        <Link
          to={`/teacher/courses/${courseId}`}
          className="text-sm font-semibold text-[#64748b] hover:text-[#0f172a]"
        >
          ← العودة لمحرر المقرر
        </Link>
        <h1 className="mt-3 text-2xl font-black text-[#0f172a]">
          مجتمع مقرر: {title}
        </h1>
        <p className="mt-2 text-sm text-[#64748b]">
          تواصل مع طلابك حول محتوى هذا المقرر في مساحة نقاش مخصصة.
        </p>
      </section>

      <CommunityFeed
        courseId={courseId}
        courseTitle={title}
        emptyTitle="لا منشورات لهذا المقرر بعد"
        emptySubtitle="ابدأ بنشر إعلان أو سؤال لطلاب المقرر."
      />
    </PageMotion>
  );
};

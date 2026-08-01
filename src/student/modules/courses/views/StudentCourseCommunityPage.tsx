import { Link, useParams } from "react-router-dom";
import { PageMotion } from "@/shared/motion";
import { CommunityFeed } from "@/shared/modules/community";
import { useQuery } from "@tanstack/react-query";
import {
  fetchStudentCourseContent,
  studentCourseQueryKeys,
} from "@/student/api/studentCourses";

export const StudentCourseCommunityPage = () => {
  const { courseId = "" } = useParams<{ courseId: string }>();

  const contentQuery = useQuery({
    queryKey: studentCourseQueryKeys.content(courseId),
    queryFn: () => fetchStudentCourseContent(courseId),
    enabled: Boolean(courseId),
  });

  const title = contentQuery.data?.title ?? "المقرر";

  return (
    <PageMotion className="mx-auto w-full max-w-[900px] space-y-6">
      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm" dir="rtl">
        <Link
          to={`/student/courses/${courseId}`}
          className="text-sm font-semibold text-[#64748b] hover:text-[#0f172a]"
        >
          ← العودة لمحتوى المقرر
        </Link>
        <h1 className="mt-3 text-2xl font-black text-[#0f172a]">
          مجتمع مقرر: {title}
        </h1>
        <p className="mt-2 text-sm text-[#64748b]">
          اطرح أسئلتك وشارك ملاحظاتك مع زملائك حول هذا المقرر فقط.
        </p>
      </section>

      <CommunityFeed
        courseId={courseId}
        courseTitle={title}
        emptyTitle="لا منشورات لهذا المقرر بعد"
        emptySubtitle="كن أول من يبدأ نقاشاً حول محتوى المقرر."
      />
    </PageMotion>
  );
};

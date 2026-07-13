import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import { PageMotion } from "@/shared/motion";
import { dropCourse } from "@/student/api/availableCourses";
import { metHistoryQueryKeys } from "@/student/api/metHistory";
import { fetchMyCourseDetail, myCoursesQueryKeys } from "@/student/api/myCourses";
import { studentQueryKeys } from "@/student/api/queryKeys";
import { MyCourseAssignmentsCard } from "../components/MyCourseAssignmentsCard";
import { MyCourseFeed } from "../components/MyCourseFeed";
import { MyCourseHeroCard } from "../components/MyCourseHeroCard";
import { MyCourseQuizzesCard } from "../components/MyCourseQuizzesCard";
import { MyCourseSidebarWidgets } from "../components/MyCourseSidebarWidgets";
import { MyCourseVideosCard } from "../components/MyCourseVideosCard";
import { MyCoursesPageHeader } from "../components/MyCoursesPageHeader";

export const StudentMyCourseDetailPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { courseId = "" } = useParams<{ courseId: string }>();
  const { session } = useAuth();
  const userId = session?.userId;
  const [dropError, setDropError] = useState<string | null>(null);

  const courseQuery = useQuery({
    queryKey: myCoursesQueryKeys.detail(courseId, userId),
    queryFn: () => fetchMyCourseDetail(courseId),
    enabled: Boolean(courseId),
  });

  const dropMutation = useMutation({
    mutationFn: () => dropCourse(courseId),
    onSuccess: async () => {
      setDropError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: studentQueryKeys.dashboard(userId) }),
        queryClient.invalidateQueries({ queryKey: myCoursesQueryKeys.catalog(userId) }),
        queryClient.invalidateQueries({ queryKey: ["student", "courses", "available"] }),
        queryClient.invalidateQueries({ queryKey: metHistoryQueryKeys.all(userId) }),
        queryClient.invalidateQueries({ queryKey: ["student", "chat", "instructors"] }),
      ]);
      navigate("/student/my-courses", { replace: true });
    },
    onError: (error) => {
      setDropError(
        error instanceof Error ? error.message : "تعذر الانسحاب من المقرر",
      );
    },
  });

  const handleDrop = () => {
    const confirmed = window.confirm(
      "هل أنت متأكد من الانسحاب من هذا المقرر؟ يمكن استرداد النقاط خلال 48 ساعة من التسجيل.",
    );
    if (!confirmed) return;
    setDropError(null);
    dropMutation.mutate();
  };

  if (!courseId) {
    return (
      <PageMotion className="mx-auto w-full max-w-[1280px]">
        <p className="text-center text-sm text-[#64748b]">معرّف الدورة غير موجود.</p>
      </PageMotion>
    );
  }

  if (courseQuery.isLoading) {
    return (
      <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
        <div className="h-36 animate-pulse rounded-3xl bg-[#e2e8f0]" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-3xl bg-[#e2e8f0]" />
          ))}
        </div>
      </PageMotion>
    );
  }

  if (courseQuery.isError || !courseQuery.data) {
    return (
      <PageMotion className="mx-auto w-full max-w-[1280px] space-y-4">
        <MyCoursesPageHeader
          title="تعذر تحميل الدورة"
          subtitle="حدث خطأ أثناء جلب بيانات هذه الدورة. تأكد أنك مسجّل في هذا المقرر."
          showBackLink
          onBack={() => navigate("/student/my-courses")}
        />
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {courseQuery.error instanceof Error
            ? courseQuery.error.message
            : "تعذر تحميل بيانات الدورة"}
        </div>
      </PageMotion>
    );
  }

  const course = courseQuery.data;

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
      <MyCoursesPageHeader
        title={course.overview.title}
        subtitle="لوحة الدورة — تابع الفيديوهات، الاختبارات، والتكليفات من مكان واحد."
        showBackLink
        onBack={() => navigate("/student/my-courses")}
      />

      <MyCourseHeroCard
        course={course.overview}
        onDrop={handleDrop}
        isDropping={dropMutation.isPending}
        dropError={dropError}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3" dir="rtl">
        <MyCourseVideosCard videos={course.videos} courseId={courseId} />
        <MyCourseQuizzesCard courseId={courseId} quizzes={course.quizzes} />
        <MyCourseAssignmentsCard
          courseId={courseId}
          assignments={course.assignments}
          pendingCount={course.pendingAssignments}
        />
      </div>

      <div
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[280px_minmax(0,1fr)]"
        dir="ltr"
      >
        <aside className="order-2 xl:order-1 xl:row-start-1">
          <MyCourseSidebarWidgets
            instructor={course.instructor}
            stats={course.stats}
            upcomingDates={course.upcomingDates}
          />
        </aside>
        <div className="order-1 min-w-0 xl:order-2 xl:row-start-1">
          <MyCourseFeed posts={course.posts} />
        </div>
      </div>
    </PageMotion>
  );
};

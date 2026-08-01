import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import { isApiError } from "@/core/api/client";
import { PageMotion } from "@/shared/motion";
import { dropCourse } from "@/student/api/availableCourses";
import {
  chatInstructorsQueryKeys,
  fetchChatInstructors,
} from "@/student/api/chatInstructors";
import { metHistoryQueryKeys } from "@/student/api/metHistory";
import { fetchMyCourseDetail, myCoursesQueryKeys } from "@/student/api/myCourses";
import { studentQueryKeys } from "@/student/api/queryKeys";
import { DropCourseModal } from "../components/DropCourseModal";
import { MyCourseFeed } from "../components/MyCourseFeed";
import { MyCourseHeroCard } from "../components/MyCourseHeroCard";
import { MyCourseSidebarWidgets } from "../components/MyCourseSidebarWidgets";
import { MyCoursesPageHeader } from "../components/MyCoursesPageHeader";

function isRefundWindowExpired(error: unknown): boolean {
  if (!isApiError(error)) return false;
  const message = error.message.toLowerCase();
  return (
    error.code === "REFUND_WINDOW_EXPIRED" ||
    message.includes("refund_window_expired") ||
    message.includes("انتهت مدة الاسترداد") ||
    message.includes("مدة الاسترداد")
  );
}

export const StudentMyCourseDetailPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { courseId = "" } = useParams<{ courseId: string }>();
  const { session } = useAuth();
  const userId = session?.userId;
  const [dropError, setDropError] = useState<string | null>(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [dropStep, setDropStep] = useState<"confirm" | "no-refund">("confirm");

  const courseQuery = useQuery({
    queryKey: myCoursesQueryKeys.detail(courseId, userId),
    queryFn: () => fetchMyCourseDetail(courseId),
    enabled: Boolean(courseId),
  });

  const instructorsQuery = useQuery({
    queryKey: chatInstructorsQueryKeys.all,
    queryFn: fetchChatInstructors,
    enabled: Boolean(courseId),
  });

  const dropMutation = useMutation({
    mutationFn: (confirmWithoutRefund?: boolean) =>
      dropCourse(courseId, confirmWithoutRefund ? { confirm: true } : undefined),
    onSuccess: async () => {
      setDropError(null);
      setDropOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: studentQueryKeys.dashboard(userId) }),
        queryClient.invalidateQueries({ queryKey: myCoursesQueryKeys.catalog(userId) }),
        queryClient.invalidateQueries({ queryKey: ["student", "courses", "available"] }),
        queryClient.invalidateQueries({ queryKey: metHistoryQueryKeys.all(userId) }),
        queryClient.invalidateQueries({ queryKey: ["student", "chat", "instructors"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
      navigate("/student/my-courses", { replace: true });
    },
    onError: (error, confirmWithoutRefund) => {
      if (!confirmWithoutRefund && isRefundWindowExpired(error)) {
        setDropStep("no-refund");
        setDropError(null);
        return;
      }
      setDropError(error instanceof Error ? error.message : "تعذر الانسحاب من المقرر");
    },
  });

  const openDropModal = () => {
    setDropError(null);
    setDropStep("confirm");
    setDropOpen(true);
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
        <div className="h-72 animate-pulse rounded-3xl bg-[#e2e8f0]" />
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
  const matchedInstructor = (instructorsQuery.data ?? []).find((item) => {
    if (course.instructor.id && item.id === course.instructor.id) return true;
    if (
      course.instructor.name &&
      item.name.trim() === course.instructor.name.trim()
    ) {
      return true;
    }
    return Boolean(
      item.courseTitle &&
        course.overview.title &&
        item.courseTitle.includes(course.overview.title),
    );
  });

  const instructor = {
    ...course.instructor,
    id: course.instructor.id || matchedInstructor?.id,
    avatar: course.instructor.avatar || matchedInstructor?.avatar || course.instructor.avatar,
  };

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
      <MyCoursesPageHeader
        title={course.overview.title}
        subtitle="لوحة الدورة — تابع تقدمك ومجتمع المقرر من هنا."
        showBackLink
        onBack={() => navigate("/student/my-courses")}
      />

      <MyCourseHeroCard
        course={course.overview}
        onDrop={openDropModal}
        isDropping={dropMutation.isPending}
        dropError={dropError && !dropOpen ? dropError : null}
      />

      <div
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[280px_minmax(0,1fr)]"
        dir="ltr"
      >
        <aside className="order-2 xl:order-1 xl:row-start-1">
          <MyCourseSidebarWidgets instructor={instructor} courseId={courseId} />
        </aside>
        <div className="order-1 min-w-0 xl:order-2 xl:row-start-1">
          <MyCourseFeed
            courseId={courseId}
            courseTitle={course.overview.title}
          />
        </div>
      </div>

      <DropCourseModal
        open={dropOpen}
        courseTitle={course.overview.title}
        isPending={dropMutation.isPending}
        step={dropStep}
        errorMessage={dropError}
        onClose={() => {
          if (dropMutation.isPending) return;
          setDropOpen(false);
        }}
        onConfirmRefundable={() => dropMutation.mutate(false)}
        onConfirmWithoutRefund={() => dropMutation.mutate(true)}
      />
    </PageMotion>
  );
};

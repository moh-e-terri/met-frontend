import { fetchStudentCourseContent } from "./studentCourses";
import type { StudentContinueCourse, StudentDashboardStats } from "./types";
import type { MyCourseData } from "@/student/modules/my-courses/data/mockMyCourse";
import { COMMUNITY_USER_AVATARS } from "@/student/constants/assets";
import { formatLessonDuration } from "@/core/api/lessons.types";
import { fetchStudentDashboard } from "./studentDashboard";

export interface MyCoursesCatalogData {
  courses: StudentContinueCourse[];
  stats: StudentDashboardStats;
}

export async function fetchMyCoursesCatalog(): Promise<MyCoursesCatalogData> {
  const dashboard = await fetchStudentDashboard();
  return {
    courses: dashboard.continueLearning,
    stats: dashboard.stats,
  };
}

function mapLessonsToVideos(content: Awaited<ReturnType<typeof fetchStudentCourseContent>>) {
  const published = content.apiLessons.filter((lesson) => lesson.isPublished);
  const completed = published.filter((lesson) => lesson.isCompleted).length;

  return {
    completed,
    total: published.length || content.totalLessons,
    items: published.slice(0, 3).map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      duration: formatLessonDuration(lesson.duration),
      status: lesson.isCompleted
        ? ("completed" as const)
        : lesson.progress && lesson.progress > 0
          ? ("in-progress" as const)
          : ("upcoming" as const),
    })),
  };
}

export async function fetchMyCourseDetail(courseId: string): Promise<MyCourseData> {
  const content = await fetchStudentCourseContent(courseId);

  return {
    overview: {
      id: courseId,
      title: content.title,
      description: content.instructor
        ? `دورة تقدّمها ${content.instructor}. تابع دروسك واختباراتك من هذه الصفحة.`
        : "تابع تقدّمك في هذه الدورة، وشاهد الدروس، وأكمل التكليفات والاختبارات.",
      image: "/images/student/course-web.svg",
      instructor: content.instructor ?? "المحاضر",
      studentsCount: `${content.totalLessons} درس`,
      progress: content.progressPercent,
      continueUrl: `/student/courses/${courseId}`,
    },
    videos: mapLessonsToVideos(content),
    quizzes: content.quizzes,
    assignments: content.assignments,
    instructor: {
      name: content.instructor ?? "المحاضر",
      role: "محاضر الدورة",
      bio: "يمكنك التواصل مع المحاضر عبر المحادثات أو المجتمع.",
      avatar: COMMUNITY_USER_AVATARS[0],
    },
    stats: [
      { label: "درساً", value: content.totalLessons },
      { label: "مكتمل", value: content.completedLessons },
      { label: "تقدّم", value: content.progressPercent },
    ],
    upcomingDates: [],
    posts: [],
    pendingAssignments: content.pendingAssignments,
  };
}

export const myCoursesQueryKeys = {
  catalog: (userId?: string) => ["student", "my-courses", "catalog", userId ?? "guest"] as const,
  detail: (courseId: string, userId?: string) =>
    ["student", "my-courses", courseId, userId ?? "guest"] as const,
};

import { fetchCourseStudents } from "./courseStudents";
import { fetchInstructorDashboard } from "./instructorDashboard";
import type { CourseStudent } from "./types";
import type {
  StudentCourseEnrollment,
  StudentProfileDetail,
} from "@/shared/modules/student-profile";

function matchesCourseStudent(student: CourseStudent, studentUserId: string) {
  return (
    student.id === studentUserId ||
    student.profileId === studentUserId
  );
}

/**
 * Aggregates a student profile across the instructor's courses.
 * `studentUserId` should be the auth User `_id` (same id used for chat).
 */
export async function fetchTeacherStudentProfile(
  studentUserId: string,
): Promise<StudentProfileDetail | null> {
  if (!studentUserId) return null;

  const dashboard = await fetchInstructorDashboard();
  const enrollments: StudentCourseEnrollment[] = [];
  let matched: CourseStudent | null = null;

  await Promise.all(
    dashboard.courses.map(async (course) => {
      try {
        const students = await fetchCourseStudents(course.id);
        const hit = students.find((student) =>
          matchesCourseStudent(student, studentUserId),
        );
        if (!hit) return;
        if (!matched) matched = hit;
        enrollments.push({
          courseId: course.id,
          title: course.title,
          progress: hit.progress,
          enrolledAt: hit.enrolledAt,
          thumbnail: course.image,
        });
      } catch {
        /* skip inaccessible course */
      }
    }),
  );

  if (!matched && enrollments.length === 0) return null;

  const base = matched as CourseStudent | null;

  return {
    userId: base?.id || studentUserId,
    profileId: base?.profileId,
    name: base?.name || "طالب",
    firstName: base?.firstName,
    secondName: base?.secondName,
    familyName: base?.familyName,
    email: base?.email || "",
    avatar: base?.avatar || "/images/student/avatar-student-default.svg",
    universityName: base?.university,
    isActive: true,
    coursesCount: enrollments.length,
    enrollments: enrollments.sort((a, b) => a.title.localeCompare(b.title, "ar")),
    metTransactions: [],
    isRecognized: base?.isRecognized,
  };
}

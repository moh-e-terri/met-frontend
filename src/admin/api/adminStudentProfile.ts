import { fetchAdminCourses } from "./adminCourses";
import { fetchAdminStudentById } from "./adminStudents";
import { fetchAdminCourseStudents } from "@/core/api/courseEnrollees";
import type {
  StudentCourseEnrollment,
  StudentProfileDetail,
} from "@/shared/modules/student-profile";

function matchesStudent(
  enrollee: { id: string; profileId?: string },
  student: { id: string; userId: string },
) {
  return (
    enrollee.id === student.userId ||
    enrollee.id === student.id ||
    enrollee.profileId === student.id ||
    enrollee.profileId === student.userId
  );
}

/**
 * Loads a full admin-facing student profile: account fields + enrollments
 * (resolved from course student lists when the students list omits progress).
 */
export async function fetchAdminStudentProfileDetail(
  studentId: string,
): Promise<StudentProfileDetail | null> {
  const student = await fetchAdminStudentById(studentId);
  if (!student) return null;

  const coursesRes = await fetchAdminCourses({ page: 1, limit: 100 });
  const courseById = new Map(coursesRes.items.map((course) => [course.id, course]));

  const enrolledIds = student.enrolledCourses
    .map((course) => course.id)
    .filter((id): id is string => Boolean(id));

  const coursesToScan =
    enrolledIds.length > 0
      ? coursesRes.items.filter((course) => enrolledIds.includes(course.id))
      : coursesRes.items;

  const found = new Map<string, StudentCourseEnrollment>();

  await Promise.all(
    coursesToScan.map(async (course) => {
      try {
        const students = await fetchAdminCourseStudents(course.id);
        const match = students.find((enrollee) => matchesStudent(enrollee, student));
        if (!match) return;
        found.set(course.id, {
          courseId: course.id,
          title: course.title,
          progress: match.progress,
          enrolledAt: match.enrolledAt,
          thumbnail: course.image,
          instructorName: course.lecturer,
          status: match.status,
          metCost: course.metCost,
        });
      } catch {
        /* course may be inaccessible — skip */
      }
    }),
  );

  for (const enrolled of student.enrolledCourses) {
    const id = enrolled.id;
    if (!id || found.has(id)) continue;
    const catalog = courseById.get(id);
    const looksLikeId =
      !enrolled.name ||
      enrolled.name === id ||
      /^[a-f0-9]{24}$/i.test(enrolled.name) ||
      /^مقرر\s+\d+$/.test(enrolled.name);

    found.set(id, {
      courseId: id,
      title: catalog?.title || (looksLikeId ? catalog?.title || "دورة" : enrolled.name),
      progress: enrolled.progress,
      thumbnail: catalog?.image,
      instructorName: catalog?.lecturer,
      metCost: catalog?.metCost,
    });
  }

  const enrollments = Array.from(found.values()).sort((a, b) =>
    a.title.localeCompare(b.title, "ar"),
  );

  return {
    userId: student.userId || student.id,
    profileId: student.id,
    name: student.name,
    firstName: student.firstName,
    secondName: student.secondName,
    familyName: student.familyName,
    email: student.email === "—" ? "" : student.email,
    avatar: student.avatar,
    universityName: student.universityName || student.degree,
    isActive: student.isActive,
    createdAt: student.createdAt,
    metPoints: student.metPoints,
    coursesCount: Math.max(student.coursesCount, enrollments.length),
    enrollments,
    metTransactions: student.metTransactions ?? [],
  };
}

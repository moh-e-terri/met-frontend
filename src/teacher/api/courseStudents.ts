import {
  fetchInstructorCourseStudents,
  type CourseEnrollee,
} from "@/core/api/courseEnrollees";
import type { CourseStudent } from "./types";

function toCourseStudent(enrollee: CourseEnrollee): CourseStudent {
  return {
    id: enrollee.id,
    profileId: enrollee.profileId,
    name: enrollee.name,
    firstName: enrollee.firstName,
    secondName: enrollee.secondName,
    familyName: enrollee.familyName,
    avatar: enrollee.avatar,
    email: enrollee.email,
    progress: enrollee.progress,
    isRecognized: false,
    university: enrollee.university,
    enrolledAt: enrollee.enrolledAt,
  };
}

export async function fetchCourseStudents(courseId: string): Promise<CourseStudent[]> {
  const enrollees = await fetchInstructorCourseStudents(courseId);
  return enrollees.map(toCourseStudent);
}

export const courseStudentsQueryKeys = {
  list: (courseId: string) => ["instructor", "courses", courseId, "students"] as const,
};

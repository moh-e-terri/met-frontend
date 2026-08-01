import { mapCommunityPosts as mapCommunityPostsCore } from "@/core/api/community";
import {
  mapNotifications as mapNotificationsCore,
  pickUnreadCount as pickUnreadCountCore,
} from "@/core/api/notifications";
import { resolveCourseUniversityFields } from "@/core/api/courseUniversity";
import type { StudentNotification } from "@/student/data/notifications";
import { asArray, asRecord, pickId, pickNumber, pickString } from "@/core/api/utils";
import type {
  CommunityPostItem,
  StudentContinueCourse,
  StudentDashboardData,
  StudentDashboardProfile,
  StudentDashboardStats,
} from "./types";

const BAR_COLORS = ["bg-[#6366f1]", "bg-[#14b8a6]", "bg-[#f5a524]", "bg-[#0ea5e9]"];
const COURSE_IMAGES = [
  "/images/student/course-js.svg",
  "/images/student/course-data.svg",
  "/images/student/course-web.svg",
];

function flattenEnrollmentItem(item: Record<string, unknown>): Record<string, unknown> {
  const course = asRecord(item.course ?? item.courseId);
  if (pickId(course)) {
    return {
      ...course,
      progress: item.progress ?? course.progress,
      progressPercent: item.progressPercent ?? course.progressPercent,
      enrolledAt: item.enrolledAt ?? item.createdAt,
    };
  }
  return item;
}

function mapStats(source: Record<string, unknown>): StudentDashboardStats {
  const enrolledList = asArray<Record<string, unknown>>(
    source.enrolledCourses ?? source.enrollments ?? source.myCourses,
  ).map(flattenEnrollmentItem);
  const enrolled =
    enrolledList.length ||
    pickNumber(
      source.totalEnrolled,
      asRecord(source.stats).totalEnrolled,
      asRecord(source.statistics).totalEnrolled,
    );

  let completed = 0;
  let inProgress = 0;

  for (const course of enrolledList) {
    const progress = pickNumber(course.progress, course.progressPercent, course.completion);
    if (progress >= 100) completed += 1;
    else inProgress += 1;
  }

  if (enrolledList.length) {
    return { enrolled, completed, inProgress };
  }

  const stats = asRecord(source.stats ?? source.statistics ?? source.summary);

  return {
    enrolled,
    completed: pickNumber(
      stats.completedCourses,
      stats.completed,
      stats.finishedCourses,
      stats.coursesCompleted,
    ),
    inProgress: pickNumber(
      stats.inProgressCourses,
      stats.inProgress,
      stats.ongoingCourses,
      stats.activeCourses,
    ),
  };
}

function mapLessonsLabel(course: Record<string, unknown>, progress: number): string {
  const completed = pickNumber(
    course.completedLessons,
    course.watchedLessons,
    course.lessonsCompleted,
  );
  const total = pickNumber(course.totalLessons, course.lessonsCount, course.lessonsTotal);

  if (completed && total) return `${completed}/${total} درس`;
  if (total) return `${Math.round((progress / 100) * total)}/${total} درس`;
  return `${progress}%`;
}

function mapContinueCourse(
  course: Record<string, unknown>,
  index: number,
): StudentContinueCourse | null {
  const id = pickId(course);
  const title = pickString(course.title, course.name, course.courseTitle);
  if (!id || !title) return null;

  const progress = pickNumber(course.progress, course.progressPercent, course.completion, course.percentage);
  const { university, universityId } = resolveCourseUniversityFields(course);

  const mapped: StudentContinueCourse = {
    id,
    title,
    progress,
    lessonsLabel: mapLessonsLabel(course, progress),
    image: pickString(course.thumbnail, course.image, course.coverImage) || COURSE_IMAGES[index % COURSE_IMAGES.length],
    barColor: BAR_COLORS[index % BAR_COLORS.length],
  };
  if (university) mapped.university = university;
  if (universityId) mapped.universityId = universityId;
  return mapped;
}

function extractCourses(source: Record<string, unknown>): Record<string, unknown>[] {
  const candidates = [
    source.continueLearning,
    source.recentCourses,
    source.enrolledCourses,
    source.enrollments,
    source.myCourses,
    source.courses,
    source.inProgressCourses,
    source.activeCourses,
    source.items,
  ];

  for (const candidate of candidates) {
    const list = asArray<Record<string, unknown>>(candidate);
    if (list.length) return list.map(flattenEnrollmentItem);
  }

  return [];
}

function mapProfile(source: Record<string, unknown>): StudentDashboardProfile {
  const student = asRecord(source.student ?? source.studentProfile);
  const user = asRecord(source.user ?? source.profile ?? source);
  const profileSource = pickId(student) || pickString(student.metPoints) ? student : user;
  const university = asRecord(profileSource.university);

  return {
    universityName: pickString(
      university.name,
      profileSource.universityName,
      typeof profileSource.university === "string" ? profileSource.university : "",
    ),
    metBalance: pickNumber(
      student.metPoints,
      student.metBalance,
      user.metPoints,
      user.metBalance,
      user.met,
      user.balance,
      source.metBalance,
      source.metPoints,
    ),
    memberSince: pickString(profileSource.memberSince, profileSource.createdAt, profileSource.joinedAt),
  };
}

export function mapStudentDashboard(raw: unknown): StudentDashboardData {
  const data = asRecord(raw);
  const stats = mapStats(data);
  const continueLearning = extractCourses(data)
    .map(mapContinueCourse)
    .filter((course): course is StudentContinueCourse => course !== null)
    .slice(0, 6);

  return {
    stats,
    continueLearning,
    profile: mapProfile(data),
  };
}

export function mapProgressOverview(raw: unknown): StudentContinueCourse[] {
  const data = asRecord(raw);
  const courses = extractCourses(data);

  return courses
    .map(mapContinueCourse)
    .filter((course): course is StudentContinueCourse => course !== null);
}

export function mapCommunityPosts(raw: unknown): CommunityPostItem[] {
  return mapCommunityPostsCore(raw).map((post) => ({
    id: post.id,
    author: post.author,
    avatar: post.avatar,
    time: post.time,
    content: post.content,
    likes: post.likes,
    replies: post.comments,
    tag: post.tag,
  }));
}

export function mapNotifications(raw: unknown): StudentNotification[] {
  return mapNotificationsCore(raw);
}

export function pickUnreadCount(
  envelopeOrRaw: unknown,
  notifications: StudentNotification[],
  payload?: unknown,
): number {
  return pickUnreadCountCore(envelopeOrRaw, payload ?? envelopeOrRaw, notifications);
}

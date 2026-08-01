export interface StudentCourseEnrollment {
  courseId: string;
  title: string;
  progress: number;
  enrolledAt?: string;
  metCost?: number;
  thumbnail?: string;
  instructorName?: string;
  status?: string;
}

export interface StudentMetTransactionView {
  id: string;
  amount: string;
  date: string;
  description: string;
  tone: "success" | "warning";
}

export interface StudentProfileDetail {
  /** Auth user id — for chat */
  userId: string;
  /** Student profile document id when known */
  profileId?: string;
  name: string;
  firstName?: string;
  secondName?: string;
  familyName?: string;
  email: string;
  avatar: string;
  universityName?: string;
  isActive?: boolean;
  createdAt?: string;
  metPoints?: number;
  coursesCount: number;
  enrollments: StudentCourseEnrollment[];
  metTransactions: StudentMetTransactionView[];
  isRecognized?: boolean;
}

export type StudentProfileViewerRole = "admin" | "teacher";

export type CourseWorkspaceRole = "admin" | "teacher" | "student";

export interface CourseWorkspaceMeta {
  id: string;
  title: string;
  description?: string;
  image?: string;
  level?: string;
  statusLabel?: string;
  statusClassName?: string;
  university?: string;
  metCost?: number;
  enrolledCount?: number;
  lecturerName?: string;
  lecturerAvatar?: string;
  lecturerId?: string;
}

export interface CourseWorkspaceCapabilities {
  /** Show enrolled students list */
  showStudents: boolean;
  /** Source for students fetch */
  studentsSource: "admin" | "instructor" | "none";
  /** Show lecturer card */
  showLecturer: boolean;
  /** Show quizzes/assignments panels */
  showAssessments: boolean;
  /** Links to take quiz/assignment (student) */
  canTakeAssessments: boolean;
  /** Link to manage in teacher editor */
  canManageContent: boolean;
  /** Show community entry */
  showCommunity: boolean;
  /** Moderate community posts */
  canModerateCommunity: boolean;
  /** Mark lesson progress */
  canMarkProgress: boolean;
  /** Edit course metadata */
  canEditMeta: boolean;
  communityPath: string;
  editPath?: string;
  quizzesPath?: string;
  assignmentsPath?: string;
  managePath?: string;
}

export function capabilitiesForRole(
  role: CourseWorkspaceRole,
  courseId: string,
): CourseWorkspaceCapabilities {
  if (role === "admin") {
    return {
      showStudents: true,
      studentsSource: "admin",
      showLecturer: true,
      showAssessments: true,
      canTakeAssessments: false,
      canManageContent: false,
      showCommunity: true,
      canModerateCommunity: true,
      canMarkProgress: false,
      canEditMeta: true,
      communityPath: `/admin/courses/${courseId}/community`,
      editPath: `/admin/courses?edit=${courseId}`,
    };
  }

  if (role === "teacher") {
    return {
      showStudents: true,
      studentsSource: "instructor",
      showLecturer: true,
      showAssessments: true,
      canTakeAssessments: false,
      canManageContent: true,
      showCommunity: true,
      canModerateCommunity: false,
      canMarkProgress: false,
      canEditMeta: false,
      communityPath: `/teacher/courses/${courseId}/community`,
      managePath: `/teacher/courses/${courseId}`,
      quizzesPath: `/teacher/courses/${courseId}`,
      assignmentsPath: `/teacher/courses/${courseId}`,
    };
  }

  return {
    showStudents: false,
    studentsSource: "none",
    showLecturer: true,
    showAssessments: true,
    canTakeAssessments: true,
    canManageContent: false,
    showCommunity: true,
    canModerateCommunity: false,
    canMarkProgress: true,
    canEditMeta: false,
    communityPath: `/student/courses/${courseId}/community`,
    quizzesPath: `/student/my-courses/${courseId}/quizzes`,
    assignmentsPath: `/student/my-courses/${courseId}/assignments`,
  };
}

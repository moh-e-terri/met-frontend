export type AssignmentStatus =
  | "pending"
  | "submitted"
  | "graded"
  | "draft"
  | "overdue";

export interface AssignmentStats {
  submitted: number;
  averageGrade: string;
  pending: number;
}

export interface AssignmentItem {
  id: string;
  title: string;
  category: string;
  categoryClassName: string;
  status: AssignmentStatus;
  statusLabel: string;
  statusClassName: string;
  points: number;
  deadline: string;
  type: string;
  score?: number;
  letterGrade?: string;
  letterGradeClassName?: string;
  draftInfo?: string;
  draftProgress?: number;
  submittedAt?: string;
  overdueNote?: string;
  feedbackPreview?: string;
  actionLabel: string;
  actionClassName: string;
  actionIcon?: string;
}

export interface CourseAssignmentsPageData {
  title: string;
  subtitle: string;
  stats: AssignmentStats;
  assignments: AssignmentItem[];
  loadMoreLabel: string;
}

const jsAssignments: AssignmentItem[] = [
  {
    id: "1",
    title: "Simple Task Manager App",
    category: "مشروع عملي",
    categoryClassName: "bg-[#fff7ed] text-[#f5a524]",
    status: "pending",
    statusLabel: "قيد الانتظار",
    statusClassName: "bg-[#fff7ed] text-[#f5a524]",
    points: 100,
    deadline: "غداً 11 مساءً",
    type: "تطبيق ويب",
    feedbackPreview: "يجب رفع ملف ZIP يحتوي على الكود المصدري",
    actionLabel: "رفع الحل",
    actionClassName: "bg-[#0f172a] text-white hover:bg-[#1e293b]",
    actionIcon: "/images/student/icon-upload.svg",
  },
  {
    id: "2",
    title: "Initial UI Design",
    category: "تصميم",
    categoryClassName: "bg-[#f5f3ff] text-[#8b5cf6]",
    status: "graded",
    statusLabel: "تم التقييم",
    statusClassName: "bg-[#ecfdf5] text-[#14b8a6]",
    points: 50,
    deadline: "15 أكتوبر",
    type: "ملف PDF",
    score: 95,
    letterGrade: "A+",
    letterGradeClassName: "bg-[#ecfdf5] text-[#14b8a6] border-[#a7f3d0]",
    feedbackPreview: "تصميم ممتاز مع مراعاة تجربة المستخدم",
    actionLabel: "عرض التقييم التفصيلي",
    actionClassName:
      "border border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]",
    actionIcon: "/images/student/icon-eye.svg",
  },
  {
    id: "3",
    title: "DOM Manipulation Project",
    category: "تفاعل الويب",
    categoryClassName: "bg-[#ecfdf5] text-[#14b8a6]",
    status: "draft",
    statusLabel: "مسودة",
    statusClassName: "bg-[#eff6ff] text-[#3b82f6]",
    points: 80,
    deadline: "20 أكتوبر",
    type: "مشروع عملي",
    draftInfo: "آخر حفظ: منذ 3 ساعات",
    draftProgress: 45,
    actionLabel: "استكمال التكليف",
    actionClassName: "bg-[#14b8a6] text-white hover:bg-[#0d9488]",
    actionIcon: "/images/student/icon-play.svg",
  },
  {
    id: "4",
    title: "ES6 Refactoring Task",
    category: "برمجة متقدمة",
    categoryClassName: "bg-[#fff7ed] text-[#f5a524]",
    status: "pending",
    statusLabel: "متاح الآن",
    statusClassName: "bg-[#eff6ff] text-[#3b82f6]",
    points: 60,
    deadline: "يغلق خلال: 5 أيام",
    type: "كود مصدري",
    feedbackPreview: "أعد هيكلة الكود باستخدام ES6 Modules",
    actionLabel: "ابدأ التكليف",
    actionClassName: "bg-[#f5a524] text-white hover:bg-[#e6951f]",
    actionIcon: "/images/student/icon-play.svg",
  },
  {
    id: "5",
    title: "Array Methods Lab",
    category: "هياكل البيانات",
    categoryClassName: "bg-[#eff6ff] text-[#3b82f6]",
    status: "graded",
    statusLabel: "تم التسليم",
    statusClassName: "bg-[#ecfdf5] text-[#14b8a6]",
    points: 40,
    deadline: "10 أكتوبر",
    type: "ملف ZIP",
    score: 88,
    letterGrade: "B+",
    letterGradeClassName: "bg-[#fff7ed] text-[#f5a524] border-[#fde8c8]",
    submittedAt: "تم التسليم: 9 أكتوبر",
    actionLabel: "عرض المحتوى",
    actionClassName:
      "border border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]",
    actionIcon: "/images/student/icon-eye.svg",
  },
  {
    id: "6",
    title: "API Integration Assignment",
    category: "Backend",
    categoryClassName: "bg-[#fef2f2] text-[#ef4444]",
    status: "overdue",
    statusLabel: "متأخر",
    statusClassName: "bg-[#fef2f2] text-[#ef4444]",
    points: 70,
    deadline: "كان مستحقاً: أمس",
    type: "مشروع عملي",
    overdueNote: "تأخرت عن الموعد النهائي — يمكنك التسليم المتأخر",
    actionLabel: "تسليم متأخر",
    actionClassName: "bg-[#ef4444] text-white hover:bg-[#dc2626]",
    actionIcon: "/images/student/icon-upload.svg",
  },
];

export const courseAssignmentsCatalog: Record<string, CourseAssignmentsPageData> =
  {
    "js-masterclass": {
      title: "تكليفات JavaScript",
      subtitle: "طبّق ما تعلمته من خلال مشاريع عملية وتابع تقدمك",
      stats: {
        submitted: 8,
        averageGrade: "88%",
        pending: 2,
      },
      assignments: jsAssignments,
      loadMoreLabel: "تحميل المزيد من تكليفات JS",
    },
    "data-science": {
      title: "تكليفات Data Science",
      subtitle: "حلّ مشاريع تحليل البيانات وقدّم نتائجك",
      stats: {
        submitted: 3,
        averageGrade: "84%",
        pending: 1,
      },
      assignments: jsAssignments.slice(0, 4).map((a) => ({
        ...a,
        title: a.title.replace("JavaScript", "Python"),
      })),
      loadMoreLabel: "تحميل المزيد من التكليفات",
    },
    cybersecurity: {
      title: "تكليفات الأمن السيبراني",
      subtitle: "طبّق مفاهيم الحماية في سيناريوهات عملية",
      stats: {
        submitted: 1,
        averageGrade: "79%",
        pending: 2,
      },
      assignments: jsAssignments.slice(0, 3),
      loadMoreLabel: "تحميل المزيد من التكليفات",
    },
  };

export function getCourseAssignmentsData(
  courseId: string,
): CourseAssignmentsPageData | null {
  return courseAssignmentsCatalog[courseId] ?? null;
}

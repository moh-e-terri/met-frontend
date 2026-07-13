export type QuizStatus = "available" | "completed" | "in-progress";

export interface QuizStats {
  completed: number;
  averageGrade: string;
  rank: string;
}

export interface QuizItem {
  id: string;
  title: string;
  category: string;
  categoryClassName: string;
  status: QuizStatus;
  statusLabel: string;
  statusClassName: string;
  questions: number;
  duration: string;
  difficulty: string;
  score?: number;
  letterGrade?: string;
  letterGradeClassName?: string;
  lastAttempt?: string;
  currentQuestion?: string;
  progressPercent?: number;
  skillChallenge?: {
    label: string;
    closesIn: string;
    progress: number;
  };
  requiredGrade?: number;
  actionLabel: string;
  actionClassName: string;
}

export interface CourseQuizzesPageData {
  title: string;
  subtitle: string;
  stats: QuizStats;
  quizzes: QuizItem[];
  loadMoreLabel: string;
}

const jsQuizzes: QuizItem[] = [
  {
    id: "1",
    title: "أساسيات JavaScript",
    category: "أساسيات",
    categoryClassName: "bg-[#fff7ed] text-[#f5a524]",
    status: "completed",
    statusLabel: "مكتمل",
    statusClassName: "bg-[#ecfdf5] text-[#14b8a6]",
    questions: 20,
    duration: "15 دقيقة",
    difficulty: "مبتدئ",
    score: 92,
    letterGrade: "A+",
    letterGradeClassName: "bg-[#ecfdf5] text-[#14b8a6] border-[#a7f3d0]",
    actionLabel: "عرض النتيجة التفصيلية",
    actionClassName:
      "border border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]",
  },
  {
    id: "2",
    title: "Async/Await",
    category: "برمجة متقدمة",
    categoryClassName: "bg-[#fff7ed] text-[#f5a524]",
    status: "in-progress",
    statusLabel: "قيد المحاولة",
    statusClassName: "bg-[#fff7ed] text-[#f5a524]",
    questions: 10,
    duration: "10 دقيقة",
    difficulty: "متقدم",
    lastAttempt: "آخر محاولة كانت بالأمس",
    currentQuestion: "وصلت للسؤال 4 من 10",
    actionLabel: "استكمال الاختبار",
    actionClassName: "bg-[#14b8a6] text-white hover:bg-[#0d9488]",
  },
  {
    id: "3",
    title: "التعامل مع DOM",
    category: "تفاعل الويب",
    categoryClassName: "bg-[#ecfdf5] text-[#14b8a6]",
    status: "available",
    statusLabel: "متاح الآن",
    statusClassName: "bg-[#eff6ff] text-[#3b82f6]",
    questions: 15,
    duration: "20 دقيقة",
    difficulty: "متوسط",
    skillChallenge: {
      label: "تحدي المهارة",
      closesIn: "يغلق خلال: 3 أيام",
      progress: 40,
    },
    actionLabel: "ابدأ الاختبار الآن",
    actionClassName: "bg-[#f5a524] text-white hover:bg-[#e6951f]",
  },
  {
    id: "4",
    title: "ES6 Modules & Classes",
    category: "هياكل البيانات",
    categoryClassName: "bg-[#eff6ff] text-[#3b82f6]",
    status: "available",
    statusLabel: "متاح الآن",
    statusClassName: "bg-[#eff6ff] text-[#3b82f6]",
    questions: 12,
    duration: "15 دقيقة",
    difficulty: "متوسط",
    requiredGrade: 75,
    actionLabel: "ابدأ الاختبار الآن",
    actionClassName: "bg-[#f5a524] text-white hover:bg-[#e6951f]",
  },
  {
    id: "5",
    title: "طرق المصفوفات",
    category: "هياكل البيانات",
    categoryClassName: "bg-[#eff6ff] text-[#3b82f6]",
    status: "completed",
    statusLabel: "مكتمل",
    statusClassName: "bg-[#ecfdf5] text-[#14b8a6]",
    questions: 15,
    duration: "12 دقيقة",
    difficulty: "متوسط",
    score: 78,
    letterGrade: "B",
    letterGradeClassName: "bg-[#fff7ed] text-[#f5a524] border-[#fde8c8]",
    actionLabel: "عرض النتيجة التفصيلية",
    actionClassName:
      "border border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]",
  },
  {
    id: "6",
    title: "Modern JS Syntax",
    category: "ES6+",
    categoryClassName: "bg-[#f5f3ff] text-[#8b5cf6]",
    status: "in-progress",
    statusLabel: "قيد المحاولة",
    statusClassName: "bg-[#fff7ed] text-[#f5a524]",
    questions: 18,
    duration: "20 دقيقة",
    difficulty: "متقدم",
    progressPercent: 60,
    actionLabel: "استكمال الاختبار",
    actionClassName: "bg-[#14b8a6] text-white hover:bg-[#0d9488]",
  },
];

export const courseQuizzesCatalog: Record<string, CourseQuizzesPageData> = {
  "js-masterclass": {
    title: "اختبارات JavaScript",
    subtitle: "أتقن لغة الويب الأكثر شهرة وتابع تقدمك",
    stats: {
      completed: 12,
      averageGrade: "85%",
      rank: "#15",
    },
    quizzes: jsQuizzes,
    loadMoreLabel: "تحميل المزيد من اختبارات JS",
  },
  "data-science": {
    title: "اختبارات Data Science",
    subtitle: "اختبر معرفتك في تحليل البيانات والتعلم الآلي",
    stats: {
      completed: 4,
      averageGrade: "82%",
      rank: "#28",
    },
    quizzes: jsQuizzes.slice(0, 4).map((q) => ({
      ...q,
      title: q.title.replace("JavaScript", "Python"),
    })),
    loadMoreLabel: "تحميل المزيد من الاختبارات",
  },
  cybersecurity: {
    title: "اختبارات الأمن السيبراني",
    subtitle: "قيّم مستواك في مفاهيم الحماية والأمان",
    stats: {
      completed: 2,
      averageGrade: "76%",
      rank: "#42",
    },
    quizzes: jsQuizzes.slice(0, 3),
    loadMoreLabel: "تحميل المزيد من الاختبارات",
  },
};

export function getCourseQuizzesData(
  courseId: string,
): CourseQuizzesPageData | null {
  return courseQuizzesCatalog[courseId] ?? null;
}

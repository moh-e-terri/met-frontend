export type LessonStatus = "completed" | "active" | "upcoming" | "locked";

export interface CourseLesson {
  id: string;
  title: string;
  status: LessonStatus;
  order?: number;
  progress?: number;
}

export interface CourseFile {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}

export interface CourseComment {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
}

export const courseDetails = {
  id: "js-masterclass",
  title: "ماستر كلاس JavaScript الحديث",
  badges: [
    { label: "دورة مميزة", className: "bg-[#f5a524] text-white" },
    { label: "المستوى المتقدم", className: "bg-[#334155] text-white" },
  ],
  instructor: "م. محمد حسن",
  progressPercent: 65,
  completedLessons: 12,
  totalLessons: 18,
  activeLesson: {
    id: "13",
    title: "الدرس 13: الدوال والبرمجة الوظيفية (Async/Await)",
    duration: "35 دقيقة",
    views: "1,240 مشاهدة",
    description:
      "في هذا الدرس سنتعمق في مفاهيم البرمجة غير المتزامنة (Asynchronous Programming) في JavaScript. سنتعلم كيفية استخدام Promises و Async/Await للتعامل مع العمليات التي تستغرق وقتاً طويلاً مثل جلب البيانات من الخوادم، مع أمثلة عملية وتطبيقات حقيقية.",
    videoCurrent: "12:45",
    videoTotal: "35:20",
    videoProgress: 36,
  },
  lessons: [
    {
      id: "1",
      title: "الدرس 01: مقدمة في الجافاسكريبت الحديثة",
      status: "completed" as const,
    },
    {
      id: "13",
      title: "الدرس 13 - جاري المشاهدة: الدوال والبرمجة الوظيفية (Async/Await)",
      status: "active" as const,
      progress: 36,
    },
    {
      id: "14",
      title: "الدرس القادم: التعامل مع APIs و Fetch",
      status: "upcoming" as const,
      order: 14,
    },
    {
      id: "15",
      title: "الدرس 15: المشاريع التطبيقية - تطبيق الطقس",
      status: "locked" as const,
    },
  ] satisfies CourseLesson[],
  files: [
    {
      id: "pdf",
      title: "ملخص الدرس (PDF)",
      subtitle: "2.4 MB",
      icon: "/images/student/icon-pdf.svg",
      iconColor: "text-[#ef4444]",
      iconBg: "bg-[#fef2f2]",
    },
    {
      id: "zip",
      title: "الكود المصدري (ZIP)",
      subtitle: "1.8 MB",
      icon: "/images/student/icon-zip.svg",
      iconColor: "text-[#3b82f6]",
      iconBg: "bg-[#eff6ff]",
    },
  ] satisfies CourseFile[],
  comments: [
    {
      id: "1",
      author: "سارة مروان",
      avatar: "/images/student/avatar-user-2.svg",
      time: "منذ ساعتين",
      content:
        "شرح ممتاز للدرس! لكن هل يمكن توضيح الفرق بين Promise.all و Promise.race بمثال عملي؟",
    },
  ] satisfies CourseComment[],
  discussionsCount: 24,
};

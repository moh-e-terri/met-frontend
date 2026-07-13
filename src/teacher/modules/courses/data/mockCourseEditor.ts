export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type LessonStatus = "active" | "waiting";

export interface CourseEditorForm {
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  price: string;
  tags: string;
}

export interface PromotionalVideo {
  name: string;
  size: string;
  duration: string;
  progress: number;
  statusLabel: string;
}

export interface CurriculumLesson {
  id: string;
  title: string;
  subtitle: string;
  status: LessonStatus;
}

export interface RecentUpload {
  id: string;
  title: string;
  image: string;
  status: "published" | "draft";
  students?: string;
  rating?: string;
  editedAt?: string;
}

export const courseCategories = [
  "التصميم و الفن",
  "البرمجة وتطوير الويب",
  "علم البيانات",
  "الأمن السيبراني",
];

export const courseLevels: { id: CourseLevel; label: string }[] = [
  { id: "beginner", label: "مبتدئ" },
  { id: "intermediate", label: "متوسط" },
  { id: "advanced", label: "متقدم" },
];

export const defaultCourseEditorForm: CourseEditorForm = {
  title: "دورة الذكاء الاصطناعي",
  description: "",
  category: "التصميم و الفن",
  level: "beginner",
  price: "SAR 49.99",
  tags: "تصميم، شعارات، 2026",
};

export const promotionalVideo: PromotionalVideo = {
  name: "Intro_v3_final.mp4",
  size: "142.5 MB",
  duration: "2m 45s",
  progress: 85,
  statusLabel: "قيد التجميع...",
};

export const curriculumLessons: CurriculumLesson[] = [
  {
    id: "1",
    title: "الدرس الأول: مقدمة في النظرية الحديثة",
    subtitle: "محتوى الفيديو 12:40 دقيقة",
    status: "active",
  },
  {
    id: "2",
    title: "الدرس الثاني: إعداد لوحة الرسم",
    subtitle: "في انتظار التحميل...",
    status: "waiting",
  },
  {
    id: "3",
    title: "الدرس الثالث: تطبيق الخامات الأساسية",
    subtitle: "في انتظار التحميل...",
    status: "waiting",
  },
];

export const professionalTips = [
  "حافظ على فيديوهات المقدمة أقل من دقيقتين لزيادة معدل التسجيل.",
  "استخدم صوراً مصغرة عالية التباين مع خطوط كبيرة.",
  "قسّم المقرر إلى مقاطع 10-15 دقيقة لتحسين التعلم.",
];

export const recentUploads: RecentUpload[] = [
  {
    id: "1",
    title: "أساسيات واجهة المستخدم",
    image: "/images/student/course-web.svg",
    status: "published",
    students: "2.4k",
    rating: "4.9",
  },
  {
    id: "2",
    title: "الفضاء والشكل",
    image: "/images/student/course-data.svg",
    status: "draft",
    editedAt: "آخر تعديل: منذ ساعتين",
  },
  {
    id: "3",
    title: "استوديو الإبداع 101",
    image: "/images/student/course-js.svg",
    status: "published",
    students: "1.1k",
    rating: "4.7",
  },
];

export const courseEditorCatalog: Record<
  string,
  { title: string; form: CourseEditorForm }
> = {
  "js-pro": {
    title: "من الصفر إلى الاحتراف: JavaScript",
    form: {
      ...defaultCourseEditorForm,
      title: "من الصفر إلى الاحتراف: JavaScript",
      category: "البرمجة وتطوير الويب",
      tags: "JavaScript, ES6, Web",
    },
  },
  "react-18": {
    title: "مقدمة في مكتبة React 18",
    form: {
      ...defaultCourseEditorForm,
      title: "مقدمة في مكتبة React 18",
      category: "البرمجة وتطوير الويب",
      tags: "React, Frontend, Hooks",
    },
  },
};

export function getCourseEditorData(courseId: string) {
  return (
    courseEditorCatalog[courseId] ?? {
      title: defaultCourseEditorForm.title,
      form: defaultCourseEditorForm,
    }
  );
}

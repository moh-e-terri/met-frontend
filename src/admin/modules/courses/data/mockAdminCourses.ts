export const adminCoursesOverview = {
  activeCourses: 148,
  activeCoursesTrend: "+12%",
  averageRating: "4.92",
  ratingReference: "4.8",
  totalStudents: "8,245",
  totalCoursesCount: 148,
};

export const lecturerPartitionFramework = [
  { label: "المحاضر", percentage: 70, barClass: "bg-white/90" },
  { label: "المنصة", percentage: 30, barClass: "bg-white/50" },
  { label: "الاحتياطي", percentage: 10, barClass: "bg-white/30" },
];

export type AdminCourseStatus = "published" | "draft";

export interface AdminCatalogCourse {
  id: string;
  title: string;
  description?: string;
  category: string;
  image: string;
  lecturer: string;
  lecturerAvatar: string;
  university: string;
  revenue: string;
  students: string;
  status: AdminCourseStatus;
  level?: "beginner" | "intermediate" | "advanced";
  metCost?: number;
  instructorId?: string;
  universityIds?: string[];
  enrolledCount?: number;
  isPublished?: boolean;
}

export const COURSE_IMAGE_PRESETS = [
  "/images/programming.jpg",
  "/images/CyberSecurity.jpg",
  "/images/web.jpg",
  "/images/CS.jpg",
] as const;

export const courseLevelLabels: Record<
  NonNullable<AdminCatalogCourse["level"]>,
  string
> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

export const adminCatalogCourses: AdminCatalogCourse[] = [
  {
    id: "1",
    title: "أساسيات الأمن السيبراني",
    category: "تقنية المعلومات • 12 أسبوع",
    image: "/images/CyberSecurity.jpg",
    lecturer: "نوال آل سعود",
    lecturerAvatar: "/images/student/avatar-user-1.svg",
    university: "جامعة كاوست",
    revenue: "89,200 ر.س",
    students: "1,240 طالب",
    status: "published",
  },
  {
    id: "2",
    title: "هندسة البترول المتقدمة",
    category: "الهندسة • 10 أسابيع",
    image: "/images/programming.jpg",
    lecturer: "د. أحمد سلمان",
    lecturerAvatar: "/images/student/avatar-user-2.svg",
    university: "جامعة الملك سعود",
    revenue: "72,500 ر.س",
    students: "980 طالب",
    status: "published",
  },
  {
    id: "3",
    title: "تصميم واجهات المستخدم UX",
    category: "التصميم • 8 أسابيع",
    image: "/images/web.jpg",
    lecturer: "ليلى محمود",
    lecturerAvatar: "/images/student/avatar-user-3.svg",
    university: "جامعة الملك عبدالعزيز",
    revenue: "41,300 ر.س",
    students: "620 طالب",
    status: "draft",
  },
  {
    id: "4",
    title: "هياكل البيانات",
    category: "علوم الحاسب • 14 أسبوع",
    image: "/images/CS.jpg",
    lecturer: "عمر فهد",
    lecturerAvatar: "/images/student/avatar-user-4.svg",
    university: "جامعة الملك فيصل",
    revenue: "96,800 ر.س",
    students: "1,520 طالب",
    status: "published",
  },
  {
    id: "5",
    title: "الذكاء الاصطناعي الأخلاقي",
    category: "الذكاء الاصطناعي • 9 أسابيع",
    image: "/images/programming.jpg",
    lecturer: "سارة القحطاني",
    lecturerAvatar: "/images/student/avatar-user-5.svg",
    university: "جامعة الإمام محمد",
    revenue: "58,400 ر.س",
    students: "740 طالب",
    status: "draft",
  },
];

export const courseStatusLabels: Record<
  AdminCourseStatus,
  { label: string; className: string }
> = {
  published: {
    label: "منشور",
    className: "bg-[#ecfdf5] text-[#14b8a6]",
  },
  draft: {
    label: "مسودة",
    className: "bg-[#fff7ed] text-[#f5a524]",
  },
};

export const lecturerOptions = [
  "نوال آل سعود",
  "د. أحمد سلمان",
  "ليلى محمود",
  "عمر فهد",
  "سارة القحطاني",
];

export const universityOptions = [
  "جامعة كاوست",
  "جامعة الملك سعود",
  "جامعة الملك عبدالعزيز",
  "جامعة الملك فيصل",
  "جامعة الإمام محمد",
];

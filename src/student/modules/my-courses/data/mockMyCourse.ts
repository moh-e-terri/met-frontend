import { COMMUNITY_USER_AVATARS } from "@/student/constants/assets";

export interface MyCourseOverview {
  id: string;
  title: string;
  description: string;
  image: string;
  instructor: string;
  studentsCount: string;
  progress: number;
  continueUrl: string;
}

export interface MyCourseVideos {
  completed: number;
  total: number;
  items: {
    id: string;
    title: string;
    duration: string;
    status: "completed" | "in-progress" | "upcoming";
  }[];
}

export interface MyCourseQuiz {
  id: string;
  title: string;
  score?: string;
  status: "completed" | "not-started";
  action: string;
}

export interface MyCourseAssignment {
  id: string;
  title: string;
  status: string;
  deadline: string | null;
  primaryAction: string | null;
  secondaryAction: string | null;
}

export interface MyCoursePost {
  id: string;
  author: string;
  role: string;
  avatar: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
}

export interface MyCourseData {
  overview: MyCourseOverview;
  videos: MyCourseVideos;
  quizzes: MyCourseQuiz[];
  assignments: MyCourseAssignment[];
  instructor: {
    id?: string;
    name: string;
    role: string;
    bio: string;
    avatar: string;
  };
  stats: { label: string; value: number }[];
  upcomingDates: {
    id: string;
    day: string;
    month: string;
    title: string;
  }[];
  posts: MyCoursePost[];
  pendingAssignments: number;
}

const sarahPostImage = "/images/student/post-sarah-chart.svg";

export const myCoursesCatalog: Record<string, MyCourseData> = {
  "js-masterclass": {
    overview: {
      id: "js-masterclass",
      title: "ماستر كلاس JavaScript الحديث",
      description:
        "تعلم لغة JavaScript من الصفر حتى الاحتراف. دورة شاملة تغطي الأساسيات، ES6+، والمفاهيم المتقدمة مع مشاريع عملية.",
      image: "/images/student/course-js.svg",
      instructor: "د. محمد حسن",
      studentsCount: "1,240 طالب مشترك",
      progress: 65,
      continueUrl: "/student/courses/js-masterclass",
    },
    videos: {
      completed: 12,
      total: 18,
      items: [
        {
          id: "1",
          title: "المتغيرات وأنواع البيانات",
          duration: "12:40",
          status: "completed",
        },
        {
          id: "2",
          title: "الدوال والبرمجة الوظيفية",
          duration: "18:20",
          status: "in-progress",
        },
        {
          id: "3",
          title: "Async/Await و Promises",
          duration: "22:15",
          status: "upcoming",
        },
      ],
    },
    quizzes: [
      {
        id: "1",
        title: "JS Basics Quiz",
        score: "90%",
        status: "completed",
        action: "مراجعة الإجابات",
      },
      {
        id: "2",
        title: "Loops Quiz",
        status: "not-started",
        action: "ابدأ الاختبار",
      },
    ],
    assignments: [
      {
        id: "1",
        title: "Simple Task Manager App",
        status: "قيد الانتظار",
        deadline: "Tomorrow 11 PM",
        primaryAction: "رفع الحل",
        secondaryAction: null,
      },
      {
        id: "2",
        title: "Initial UI Design",
        status: "تم التسليم",
        deadline: null,
        primaryAction: null,
        secondaryAction: "عرض المحتوى",
      },
    ],
    instructor: {
      name: "د. محمد حسن",
      role: "محاضر الدورة - خبير تطوير برمجيات",
      bio: "خبرة 10 سنوات في تطوير تطبيقات الويب والجوال. شغوف بتبسيط المفاهيم البرمجية للطلاب.",
      avatar: COMMUNITY_USER_AVATARS[0],
    },
    stats: [
      { label: "درساً", value: 18 },
      { label: "تكليفات", value: 5 },
      { label: "اختبارات", value: 3 },
    ],
    upcomingDates: [
      {
        id: "1",
        day: "15",
        month: "Oct",
        title: "تسليم مشروع JavaScript النهائي",
      },
      {
        id: "2",
        day: "22",
        month: "Oct",
        title: "اختبار ES6 المتقدم",
      },
    ],
    posts: [
      {
        id: "1",
        author: "سارة محمود",
        role: "طالبة علوم حاسب",
        avatar: COMMUNITY_USER_AVATARS[1],
        time: "منذ ساعتين",
        content:
          "هل يمكن أحد أن يوضح لي الفرق بين Promise.all و Promise.race؟ واجهت صعوبة في فهمها أثناء حل التكليف.",
        image: sarahPostImage,
        likes: 12,
        comments: 4,
      },
      {
        id: "2",
        author: "محمد حسن",
        role: "محاضر الدورة",
        avatar: COMMUNITY_USER_AVATARS[0],
        time: "منذ 5 ساعات",
        content:
          "أحسنتم في المشروع الأخير! تذكروا مراجعة درس Async/Await قبل الاختبار القادم.",
        likes: 24,
        comments: 1,
      },
    ],
    pendingAssignments: 1,
  },
  "data-science": {
    overview: {
      id: "data-science",
      title: "Data Science Essentials",
      description:
        "أساسيات علم البيانات: تحليل البيانات، التصور البياني، والتعلم الآلي التمهيدي مع مشاريع عملية على مجموعات بيانات حقيقية.",
      image: "/images/student/course-data.svg",
      instructor: "د. ليلى أحمد",
      studentsCount: "890 طالب مشترك",
      progress: 30,
      continueUrl: "/student/courses/data-science",
    },
    videos: {
      completed: 5,
      total: 20,
      items: [
        {
          id: "1",
          title: "مقدمة في علم البيانات",
          duration: "15:00",
          status: "completed",
        },
        {
          id: "2",
          title: "تنظيف البيانات و Pandas",
          duration: "22:30",
          status: "in-progress",
        },
        {
          id: "3",
          title: "التصور البياني مع Matplotlib",
          duration: "19:45",
          status: "upcoming",
        },
      ],
    },
    quizzes: [
      {
        id: "1",
        title: "Python Basics Quiz",
        score: "85%",
        status: "completed",
        action: "مراجعة الإجابات",
      },
      {
        id: "2",
        title: "Pandas Quiz",
        status: "not-started",
        action: "ابدأ الاختبار",
      },
    ],
    assignments: [
      {
        id: "1",
        title: "تحليل مجموعة بيانات المبيعات",
        status: "قيد الانتظار",
        deadline: "Friday 6 PM",
        primaryAction: "رفع الحل",
        secondaryAction: null,
      },
    ],
    instructor: {
      name: "د. ليلى أحمد",
      role: "محاضرة الدورة - خبيرة تحليل بيانات",
      bio: "باحثة في الذكاء الاصطناعي وعلم البيانات. تركز على تطبيقات عملية في الصناعة.",
      avatar: COMMUNITY_USER_AVATARS[2],
    },
    stats: [
      { label: "درساً", value: 20 },
      { label: "تكليفات", value: 4 },
      { label: "اختبارات", value: 2 },
    ],
    upcomingDates: [
      {
        id: "1",
        day: "18",
        month: "Oct",
        title: "تسليم مشروع تحليل البيانات",
      },
    ],
    posts: [
      {
        id: "1",
        author: "سارة محمود",
        role: "طالبة علوم حاسب",
        avatar: COMMUNITY_USER_AVATARS[1],
        time: "منذ يوم",
        content:
          "هل يمكن أحد مشاركة مصادر جيدة لفهم Pandas بشكل أعمق؟",
        likes: 8,
        comments: 3,
      },
    ],
    pendingAssignments: 1,
  },
  cybersecurity: {
    overview: {
      id: "cybersecurity",
      title: "Cybersecurity Basics",
      description:
        "مبادئ الأمن السيبراني: التهديدات، الحماية، التشفير، وأفضل الممارسات لحماية الأنظمة والشبكات.",
      image: "/images/student/course-web.svg",
      instructor: "م. خالد العلي",
      studentsCount: "620 طالب مشترك",
      progress: 15,
      continueUrl: "/student/courses/cybersecurity",
    },
    videos: {
      completed: 3,
      total: 16,
      items: [
        {
          id: "1",
          title: "مقدمة في الأمن السيبراني",
          duration: "14:20",
          status: "completed",
        },
        {
          id: "2",
          title: "أنواع التهديدات والهجمات",
          duration: "20:10",
          status: "in-progress",
        },
        {
          id: "3",
          title: "أساسيات التشفير",
          duration: "25:00",
          status: "upcoming",
        },
      ],
    },
    quizzes: [
      {
        id: "1",
        title: "Security Fundamentals Quiz",
        status: "not-started",
        action: "ابدأ الاختبار",
      },
    ],
    assignments: [
      {
        id: "1",
        title: "تقرير تحليل ثغرة أمنية",
        status: "لم يبدأ",
        deadline: "Next Monday",
        primaryAction: "ابدأ التكليف",
        secondaryAction: null,
      },
    ],
    instructor: {
      name: "م. خالد العلي",
      role: "محاضر الدورة - خبير أمن معلومات",
      bio: "متخصص في اختبار الاختراق والأمن السيبراني مع خبرة في قطاع المؤسسات.",
      avatar: COMMUNITY_USER_AVATARS[3],
    },
    stats: [
      { label: "درساً", value: 16 },
      { label: "تكليفات", value: 3 },
      { label: "اختبارات", value: 2 },
    ],
    upcomingDates: [
      {
        id: "1",
        day: "25",
        month: "Oct",
        title: "ورشة عمل اختبار الاختراق",
      },
    ],
    posts: [
      {
        id: "1",
        author: "سارة محمود",
        role: "طالبة علوم حاسب",
        avatar: COMMUNITY_USER_AVATARS[1],
        time: "منذ 3 أيام",
        content:
          "ما الفرق بين Firewall و IDS؟ أحتاج توضيحاً قبل الاختبار.",
        likes: 5,
        comments: 2,
      },
    ],
    pendingAssignments: 0,
  },
};

export const DEFAULT_MY_COURSE_ID = "js-masterclass";

export const sidebarCourses = [
  {
    id: "js-masterclass",
    title: "JavaScript Advanced",
    dot: "bg-[#22c55e]",
  },
  {
    id: "data-science",
    title: "Data Science Essentials",
    dot: "bg-[#f5a524]",
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Basics",
    dot: "bg-[#3b82f6]",
  },
] as const;

export function getMyCourseData(courseId?: string): MyCourseData {
  const id = courseId && myCoursesCatalog[courseId] ? courseId : DEFAULT_MY_COURSE_ID;
  return myCoursesCatalog[id];
}

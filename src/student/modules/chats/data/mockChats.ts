import { COMMUNITY_USER_AVATARS } from "@/student/constants/assets";

export interface ChatThread {
  id: string;
  name: string;
  preview: string;
  time: string;
  avatar: string;
  unread?: number;
  online?: boolean;
  role?: string;
  university?: string;
  major?: string;
  sharedCourses?: Array<{
    title: string;
    status: "active" | "completed";
  }>;
}

export interface ChatMessage {
  id: string;
  text: string;
  time: string;
  outgoing: boolean;
  showAvatar?: boolean;
}

export const chatThreads: ChatThread[] = [
  {
    id: "1",
    name: "أحمد محمد",
    preview: "شكراً جزيلاً لك، سأراجع الملف وأعود إليك.",
    time: "الآن",
    avatar: COMMUNITY_USER_AVATARS[0],
    unread: 2,
    online: true,
    role: "طالب هندسة برمجيات",
    university: "جامعة الملك سعود",
    major: "تكنولوجيا المعلومات",
    sharedCourses: [
      { title: "مبادئ JavaScript", status: "active" },
      { title: "تصميم UI/UX", status: "completed" },
    ],
  },
  {
    id: "2",
    name: "سارة خالد",
    preview: "هل انتهيت من واجب الـ React؟",
    time: "ساعة",
    avatar: COMMUNITY_USER_AVATARS[1],
  },
  {
    id: "3",
    name: "مجموعة JavaScript",
    preview: "محمد: توجد محاضرة مسجلة جديدة.",
    time: "3 س",
    avatar: COMMUNITY_USER_AVATARS[2],
  },
  {
    id: "4",
    name: "دعم المنصة",
    preview: "تم استلام تذكرتك وسيتم الرد خلال 24 ساعة.",
    time: "أمس",
    avatar: COMMUNITY_USER_AVATARS[3],
  },
  {
    id: "5",
    name: "مجتمع علوم البيانات",
    preview: "نور الدين: شاركت رابطاً مفيداً للمشروع.",
    time: "2 ي",
    avatar: COMMUNITY_USER_AVATARS[4],
  },
];

export const chatMessages: ChatMessage[] = [
  {
    id: "d1",
    text: "اليوم، ٣٠ أكتوبر",
    time: "",
    outgoing: false,
  },
  {
    id: "m1",
    text: "مرحباً أحمد! كيف حالك اليوم؟ أتمنى أن تكون بخير.",
    time: "١٠:٣٠ ص",
    outgoing: false,
    showAvatar: true,
  },
  {
    id: "m2",
    text: "أريد استفساراً حول مشروع التخرج، هل لديك وقت للمراجعة؟",
    time: "١٠:٣١ ص",
    outgoing: false,
  },
  {
    id: "m3",
    text: "أهلاً محمد! الحمد لله بخير، شكراً لسؤالك.",
    time: "١٠:٣٢ ص",
    outgoing: true,
  },
  {
    id: "m4",
    text: "تفضل بسؤالك، أنا موجود للمساعدة.",
    time: "١٠:٣٢ ص",
    outgoing: true,
  },
];

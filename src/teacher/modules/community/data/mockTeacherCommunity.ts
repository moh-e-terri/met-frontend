import { COMMUNITY_USER_AVATARS } from "@/student/constants/assets";
import { TEACHER_DEFAULT_AVATAR } from "@/teacher/constants/assets";

export interface TrainerCommunityPost {
  id: string;
  author: string;
  role: string;
  avatar: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  pinned?: boolean;
}

export interface TrainerPinnedEvent {
  day: string;
  month: string;
  weekday: string;
  title: string;
}

export const trainerActiveMembers = [
  { avatar: COMMUNITY_USER_AVATARS[0] },
  { avatar: COMMUNITY_USER_AVATARS[1] },
  { avatar: COMMUNITY_USER_AVATARS[2] },
  { avatar: COMMUNITY_USER_AVATARS[3] },
  { avatar: COMMUNITY_USER_AVATARS[4] },
  { extraCount: "+42" },
];

export const trainerPopularSections = [
  { name: "Python Programming", count: "1.2k" },
  { name: "Data Science", count: "850" },
  { name: "Artificial Intelligence", count: "850" },
];

export const trainerAnnouncements = [
  {
    id: "1",
    day: "20",
    month: "Oct",
    title: "ورشة عمل React 18 للمدربين",
  },
  {
    id: "2",
    day: "22",
    month: "Oct",
    title: "تحديث سياسات رفع المحتوى",
  },
  {
    id: "3",
    day: "25",
    month: "Oct",
    title: "اجتماع مجلس المدربين الشهري",
  },
];

export const trainerCommunityStats = [
  {
    label: "منشور اليوم",
    value: "342",
    className: "bg-[#ecfdf5] text-[#14b8a6]",
  },
  {
    label: "عضو نشط",
    value: "12.4k",
    className: "bg-[#fff7ed] text-[#f5a524]",
  },
];

export const trainerPinnedEvent: TrainerPinnedEvent = {
  day: "24",
  month: "Oct",
  weekday: "الخميس",
  title: "محاضرة مباشرة: مستقبل JavaScript",
};

export const trainerCommunityPosts: TrainerCommunityPost[] = [
  {
    id: "pinned",
    author: "د. أحمد خالد",
    role: "Admin",
    avatar: TEACHER_DEFAULT_AVATAR,
    time: "منشور مثبت",
    content:
      "تذكير: المحاضرة المباشرة القادمة حول مستقبل JavaScript ستكون يوم الخميس 24 أكتوبر. يرجى إضافتها إلى تقويمكم.",
    pinned: true,
    likes: 56,
    comments: 8,
  },
  {
    id: "1",
    author: "محمد العتيبي",
    role: "مدرب مساعد",
    avatar: COMMUNITY_USER_AVATARS[1],
    time: "منذ 3 ساعات",
    content:
      "هل يمكن لأحد المدربين مشاركة أفضل ممارسات تدريس مكتبة Pandas للمبتدئين؟ أبحث عن أمثلة عملية من تجربتكم.",
    likes: 18,
    comments: 5,
  },
  {
    id: "2",
    author: "د. أحمد خالد",
    role: "خبير JavaScript",
    avatar: TEACHER_DEFAULT_AVATAR,
    time: "منذ 6 ساعات",
    content:
      "شاركت معكم صوراً من مركز البيانات الذي زرناه أمس — مثال رائع على كيفية عرض البيانات الضخمة للطلاب.",
    image: "/images/teacher/post-trainer-community.svg",
    likes: 84,
    comments: 18,
  },
];

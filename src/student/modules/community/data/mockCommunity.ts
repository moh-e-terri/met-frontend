import { COMMUNITY_USER_AVATARS } from "@/student/constants/assets";

export interface CommunityPost {
  id: string;
  author: string;
  role: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  image?: string;
  action: "share" | "save";
}

export const communityPosts: CommunityPost[] = [
  {
    id: "1",
    author: "أحمد محمد",
    role: "هندسة البرمجيات",
    avatar: COMMUNITY_USER_AVATARS[0],
    time: "منذ ساعتين",
    content:
      "مرحباً بالجميع، أريد مناقشة موضوع الـ Time Complexity في الامتحانات القادمة. هل هناك خوارزميات معينة يجب التركيز عليها؟",
    image: "/images/student/post-chart.svg",
    likes: 12,
    comments: 4,
    action: "share",
  },
  {
    id: "2",
    author: "د. ليلى حسن",
    role: "أستاذ مساعد",
    avatar: COMMUNITY_USER_AVATARS[1],
    time: "منذ 5 ساعات",
    content:
      "يسعدني الإعلان عن ورشة عمل جديدة غداً حول أساسيات تعلم الآلة باستخدام Python. التسجيل متاح للجميع.",
    likes: 45,
    comments: 18,
    action: "save",
  },
];

export const popularGroups = [
  {
    name: "مجتمع البرمجة",
    count: "1.2k",
    icon: "/images/student/icon-code.svg",
    iconBg: "bg-[#eff6ff]",
    iconColor: "text-[#3b82f6]",
  },
  {
    name: "علوم البيانات",
    count: "850",
    icon: "/images/student/icon-database.svg",
    iconBg: "bg-[#ecfdf5]",
    iconColor: "text-[#14b8a6]",
  },
  {
    name: "الأمن السيبراني",
    count: "520",
    icon: "/images/student/icon-shield.svg",
    iconBg: "bg-[#fef2f2]",
    iconColor: "text-[#ef4444]",
  },
];

export const trendingFeaturedTag = "#أسئلة_الاختبارات";

export const trendingHashtags = [
  "#مشاريع_عملية",
  "#سوق_العمل",
  "#تخرج_2024",
  "#نصائح_تقنية",
];

export const activeMembers = [
  { name: "ياسين عمر", avatar: COMMUNITY_USER_AVATARS[2], online: true },
  { name: "نور الهدى", avatar: COMMUNITY_USER_AVATARS[3], online: true },
  { name: "خالد سعيد", avatar: COMMUNITY_USER_AVATARS[4], online: false },
];

/** بيانات مختصرة للرئيسية فقط */
export const homeCommunityPosts = communityPosts.map((post) => ({
  id: post.id,
  author: post.author,
  avatar: post.avatar,
  time: post.time,
  content: post.content,
  likes: post.likes,
  replies: post.comments,
  tag: post.role.includes("برمجيات")
    ? "React"
    : post.role.includes("أستاذة")
      ? "Data Science"
      : undefined,
}));

export const communityRequests = [
  "مطلوب مساعدة في مشروع الـPython النهائي",
  "تحديث جديد في منهج الـCybersecurity",
];

export const trendingTopics = [
  { label: "React Hooks", count: 48 },
  { label: "مشاريع التخرج", count: 36 },
  { label: "Data Science", count: 29 },
];

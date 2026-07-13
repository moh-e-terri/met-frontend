export interface StudentNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "community" | "course" | "system";
}

export const initialNotifications: StudentNotification[] = [
  {
    id: "n1",
    title: "رد جديد في المجتمع",
    message: "سارة خالد ردّت على منشورك بخصوص React Hooks.",
    time: "منذ 10 دقائق",
    read: false,
    type: "community",
  },
  {
    id: "n2",
    title: "إعجاب جديد",
    message: "حصل منشورك على 3 إعجابات جديدة في مجموعة Data Science.",
    time: "منذ ساعة",
    read: false,
    type: "community",
  },
  {
    id: "n3",
    title: "تذكير بموعد التسليم",
    message: "مشروع Python النهائي مستحق غداً الساعة 11:59 مساءً.",
    time: "منذ 3 ساعات",
    read: false,
    type: "course",
  },
  {
    id: "n4",
    title: "تحديث المنصة",
    message: "تم إضافة قسم جديد في مسار Cybersecurity Basics.",
    time: "أمس",
    read: true,
    type: "system",
  },
];

export type PaymentMethodId = "paypal" | "card" | "apple";

export const paymentMethodOptions = [
  {
    id: "paypal" as const,
    title: "PayPal",
    subtitle: "دفع آمن وعالمي",
    icon: "/images/student/icon-paypal.svg",
    isImage: true,
  },
  {
    id: "card" as const,
    title: "بطاقة بنكية",
    subtitle: "Visa / MasterCard",
    icon: "/images/student/icon-payment.svg",
    isImage: false,
  },
  {
    id: "apple" as const,
    title: "Apple Pay",
    subtitle: "دفع سريع بلمسة واحدة",
    icon: "/images/student/icon-apple-pay.svg",
    isImage: true,
  },
];

export const orderSummary = {
  courseTitle: "كورس JavaScript Advanced",
  courseImage: "/images/student/course-js.svg",
  accessLabel: "مدة الوصول: مدى الحياة",
  coursePrice: 499,
  vat: 0,
  currency: "SAR",
};

export const paymentTransactions = [
  {
    id: "#TRX-9821",
    course: "Python for Data Science",
    date: "12 أكتوبر 2023",
    amount: "350 SAR",
    status: "completed" as const,
  },
  {
    id: "#TRX-7742",
    course: "UI/UX Design Masterclass",
    date: "05 سبتمبر 2023",
    amount: "599 SAR",
    status: "completed" as const,
  },
];

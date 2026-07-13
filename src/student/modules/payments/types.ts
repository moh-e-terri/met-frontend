export interface PaymentOrderSummary {
  courseId: string;
  courseTitle: string;
  courseImage: string;
  accessLabel: string;
  metCost: number;
  vat: number;
  currency: string;
}

export function buildPaymentOrderSummary(input: {
  courseId: string;
  courseTitle: string;
  courseImage: string;
  metCost: number;
}): PaymentOrderSummary {
  return {
    courseId: input.courseId,
    courseTitle: input.courseTitle,
    courseImage: input.courseImage,
    accessLabel: "مدة الوصول: مدى الحياة",
    metCost: input.metCost,
    vat: 0,
    currency: "MET",
  };
}

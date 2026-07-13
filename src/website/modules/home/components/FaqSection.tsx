import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal, Stagger } from "@/shared/motion";

export const FaqSection = () => {
  const faqs = [
    {
      question: "هل الدروس مسجلة أم مباشرة؟",
      answer: "نقدم مزيجاً من المقررات المسجلة بجودة عالية لسهولة الوصول في أي وقت، إضافةً لورش عمل تفاعلية مباشرة دورياً.",
    },
    {
      question: "كيف يمكنني التواصل مع المدربين؟",
      answer: "يمكنك التواصل مع المدربين مباشرةً عبر مجتمع الطلاب لكل مقرر، أو خلال جلسات الدعم المباشر الأسبوعية.",
    },
    {
      question: "هل الشهادات معترف بها؟",
      answer: "نعم، تحصل على شهادة إتمام معتمدة من MET E-Academy بعد إكمال جميع متطلبات المقرر واجتياز الاختبار النهائي.",
    },
    {
      question: "هل يوجد تطبيق للجوال؟",
      answer: "نعم، يتوفر تطبيق MET E-Academy على متجري App Store وGoogle Play لمتابعة دروسك في أي وقت ومكان.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-6 md:px-10 lg:px-16 bg-white" id="faq">
      <div className="max-w-[800px] mx-auto space-y-10" dir="rtl">
        <Reveal className="text-center">
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a]">الأسئلة الشائعة</h2>
        </Reveal>

        <Stagger className="space-y-3" staggerMs={70}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-[#f8f7f5] rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-md"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-right"
              >
                <span className="text-[17px] font-semibold text-[#0f172a]">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#64748b] shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${openIndex === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-5 text-[16px] text-[#475569] leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
};

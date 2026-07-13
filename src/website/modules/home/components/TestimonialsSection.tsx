import { Star } from "lucide-react";
import { Reveal, Stagger } from "@/shared/motion";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "أحمد العتيبي",
      university: "جامعة الملك سعود",
      text: "المنصة ساعدتني جداً في فهم مادة قواعد البيانات. الشروحات مبسطة والتمارين العملية كانت مفتاح النجاح في الاختبار.",
      rating: 5,
    },
    {
      name: "سارة القحطاني",
      university: "جامعة الأميرة نورة",
      text: "أفضل منصة تعليمية تقنية جربتها. بنك الأسئلة يحاكي الواقع تماماً والمحتوى محدث ومميز.",
      rating: 5,
    },
    {
      name: "خالد الشمري",
      university: "جامعة الإمام",
      text: "ورش العمل الافتراضية نقلة نوعية في التعليم. طبقت مشاريع حقيقية وحصلت على دعم مباشر من المدربين.",
      rating: 5,
    },
  ];

  return (
    <section className="py-24 px-6 md:px-12 bg-[#f8fafc]" id="testimonials">
      <div className="max-w-[1280px] mx-auto space-y-16">
        <Reveal className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f172a]">
            ماذا يقول طلابنا؟
          </h2>
          <p className="text-[#64748b] text-lg font-medium max-w-2xl mx-auto">
            قصص نجاح ملهمة من طلابنا المتميزين في مختلف الجامعات السعودية.
          </p>
        </Reveal>

        <Stagger
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          dir="rtl"
          staggerMs={120}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-[#f8f7f5] p-10 rounded-[2.5rem] border border-gray-100 flex flex-col space-y-6 transition-[transform,box-shadow] duration-[350ms] ease-out hover:shadow-2xl hover:shadow-navy/5 hover:-translate-y-1"
            >
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, j) => (
                  <Star
                    key={j}
                    className="w-5 h-5 fill-[#f5a524] text-[#f5a524]"
                  />
                ))}
              </div>
              <p className="text-[#475569] text-lg italic leading-relaxed flex-1">
                "{t.text}"
              </p>
              <div className="pt-4 border-t border-gray-200 flex items-center gap-4">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0f172a]">{t.name}</h4>
                  <p className="text-sm text-[#64748b] font-medium">
                    {t.university}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
};

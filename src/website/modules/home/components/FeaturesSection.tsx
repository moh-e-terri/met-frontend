import {
  Lightbulb,
  Video,
  FileText,
  HelpCircle,
  Monitor,
  MessageSquare,
} from "lucide-react";
import { Reveal, Stagger } from "@/shared/motion";

export const FeaturesSection = () => {
  const features = [
    {
      title: "شروحات مبسطة",
      description:
        "تبسيط أعقد المفاهيم البرمجية والرياضية بأسلوب تفاعلي وممتع.",
      icon: Lightbulb,
      iconColor: "text-[#f5a524]",
      bgColor: "bg-[#FFF8EC]",
    },
    {
      title: "فيديوهات منظمة",
      description:
        "محتوى مرئي عالي الجودة مقسم حسب المواضيع لسهولة الوصول والمذاكرة.",
      icon: Video,
      iconColor: "text-[#00BFA5]",
      bgColor: "bg-[#E8FAF7]",
    },
    {
      title: "ملخصات ومراجعات",
      description:
        "مذكرات شاملة ومركزة للمذاكرة السريعة والمراجعة قبل الاختبارات.",
      icon: FileText,
      iconColor: "text-[#00BFA5]",
      bgColor: "bg-[#E8FAF7]",
    },
    {
      title: "بنك أسئلة",
      description:
        "تدريبات مكثفة ونماذج تحاكي نمط الاختبارات الجامعية الفعلية.",
      icon: HelpCircle,
      iconColor: "text-[#f5a524]",
      bgColor: "bg-[#FFF8EC]",
    },
    {
      title: "ورش افتراضية",
      description: "جلسات تطبيقية مباشرة على مشاريع برمجية وتقنية حقيقية.",
      icon: Monitor,
      iconColor: "text-[#00BFA5]",
      bgColor: "bg-[#E8FAF7]",
    },
    {
      title: "دعم مباشر",
      description:
        "تواصل مستمر مع مدربين متخصصين للإجابة على استفساراتك البرمجية.",
      icon: MessageSquare,
      iconColor: "text-[#00BFA5]",
      bgColor: "bg-[#E8FAF7]",
    },
  ];

  return (
    <section
      className="relative overflow-hidden py-20 px-6 md:px-10 lg:px-16 bg-[#f8fafc]"
      id="features"
    >
      <div className="max-w-[1280px] mx-auto space-y-14" dir="rtl">
        <Reveal className="text-center space-y-3">
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a]">
            مميزات تمنحك الأفضلية
          </h2>
          <p className="text-[#64748b] text-lg max-w-3xl mx-auto">
            كل ما تحتاجه للتميز في دراستك الجامعية وبدء مسيرتك المهنية.
          </p>
        </Reveal>

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerMs={80}>
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-[20px] p-8 flex flex-col items-center text-center gap-4 border border-gray-100 transition-[transform,box-shadow] duration-[350ms] ease-out hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className={`${feature.bgColor} p-4 rounded-2xl motion-float`} style={{ animationDelay: `${i * 0.4}s` }}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#0f172a]">
                  {feature.title}
                </h3>
                <p className="text-[#64748b] text-[15px] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
};

import { Link } from "react-router-dom";
import { Reveal, Stagger } from "@/shared/motion";

export const CoursesSection = () => {
  const courses = [
    {
      title: "أساسيات البرمجة بلغة Python",
      tag: "البرمجة",
      desc: "تعلم أساسيات اللغة من الصفر وبناء أول مشاريعك البرمجية.",
      img: "/images/programming.jpg",
      tagBg: "bg-[#FFF8EC]",
      tagColor: "text-[#f5a524]",
    },
    {
      title: "مقدمة في الأمن السيبراني",
      tag: "الأمن السيبراني",
      desc: "فهم مخاطر الشبكات وكيفية حماية الأنظمة والبيانات الرقمية.",
      img: "/images/CyberSecurity.jpg",
      tagBg: "bg-[#FEF0EF]",
      tagColor: "text-[#e74c3c]",
    },
    {
      title: "هيكلة البيانات",
      tag: "علوم الحاسب",
      desc: "شرح شامل لأنواع هياكل البيانات واستخداماتها في الخوارزميات.",
      img: "/images/CS.jpg",
      tagBg: "bg-[#F5EEFF]",
      tagColor: "text-[#9b59b6]",
    },
    {
      title: "تطوير واجهات المستخدم",
      tag: "تطوير الويب",
      desc: "بناء واجهات تفاعلية باستخدام أفضل ممارسات الواجهات الأمامية.",
      img: "/images/web.jpg",
      tagBg: "bg-[#E8FAF7]",
      tagColor: "text-[#00BFA5]",
    },
  ];

  return (
    <section className="py-16 px-6 md:px-10 lg:px-16 bg-white" id="courses">
      <div className="max-w-[1280px] mx-auto" dir="rtl">
        <Reveal className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-[#0f172a]">
            أحدث المقررات المتاحة
          </h2>
          <p className="text-[#64748b] mt-2">
            ابدأ رحلتك التعليمية الآن مع نخبة من المقررات المصممة بعناية.
          </p>
        </Reveal>

        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerMs={100}>
          {courses.map((c, i) => (
            <div
              key={i}
              className="bg-white rounded-[12px] overflow-hidden border border-[#eef2f6] shadow-sm h-full flex flex-col transition-[transform,box-shadow] duration-[350ms] ease-out hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative overflow-hidden">
                <img
                  src={c.img}
                  alt={c.title}
                  className="block w-full h-40 object-cover transition-transform duration-500 hover:scale-105"
                />
                <div
                  className={`absolute -bottom-3 ${c.tagBg} ${c.tagColor} rounded-full px-3 py-1 text-xs font-semibold right-4 shadow-sm`}
                >
                  {c.tag}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-[#0f172a] leading-tight mb-2">
                  {c.title}
                </h3>
                <p className="text-[14px] text-[#64748b] mb-6 flex-1">
                  {c.desc}
                </p>
                <div className="flex items-center justify-center">
                  <Link
                    to="#"
                    className="rounded-[50px] bg-[#f5a524] px-6 py-2 text-sm font-semibold text-white hover:bg-[#e59415] transition-colors"
                  >
                    استعرض المقرر
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
};

export default CoursesSection;

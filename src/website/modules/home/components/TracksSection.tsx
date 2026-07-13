import {
  Code,
  Network,
  Database,
  Shield,
  Cpu,
  ChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal, Stagger } from "@/shared/motion";

export const TracksSection = () => {
  const tracks = [
    {
      title: "البرمجة",
      icon: Code,
      color: "text-[#00BFA5]",
      bg: "bg-[#E8FAF7]",
    },
    {
      title: "الشبكات",
      icon: Network,
      color: "text-[#f5a524]",
      bg: "bg-[#FFF8EC]",
    },
    {
      title: "قواعد البيانات",
      icon: Database,
      color: "text-[#9b59b6]",
      bg: "bg-[#F5EEFF]",
    },
    {
      title: "الأمن السيبراني",
      icon: Shield,
      color: "text-[#e74c3c]",
      bg: "bg-[#FEF0EF]",
    },
    {
      title: "الذكاء الاصطناعي",
      icon: Cpu,
      color: "text-[#00BFA5]",
      bg: "bg-[#E8FAF7]",
    },
  ];

  return (
    <section className="relative py-20 px-6 md:px-10 lg:px-16 bg-[#f8f7f5]">
      <div className="max-w-[1280px] mx-auto space-y-12" dir="rtl">
        <Reveal className="flex items-center justify-between">
          <div className="space-y-2 text-right">
            <h2 className="text-4xl md:text-5xl font-black text-[#0f172a]">
              تخصصاتنا الأكاديمية
            </h2>
            <p className="text-[#64748b] text-lg">
              نغطي أهم المجالات التقنية المطلوبة حالياً.
            </p>
          </div>
          <Link
            to="/tracks"
            className="text-[#f5a524] font-bold text-[16px] flex items-center gap-1 whitespace-nowrap hover:underline transition-all hover:gap-2"
          >
            عرض جميع المسارات
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Reveal>

        <Stagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5" staggerMs={70}>
          {tracks.map((track, i) => (
            <div
              key={i}
              className="bg-white rounded-[20px] border border-gray-100 p-8 flex flex-col items-center justify-center text-center gap-5 cursor-pointer transition-[transform,box-shadow] duration-[350ms] ease-out hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`${track.bg} p-4 rounded-2xl motion-float`} style={{ animationDelay: `${i * 0.35}s` }}>
                <track.icon className={`w-8 h-8 ${track.color}`} />
              </div>
              <h3 className="text-[17px] font-bold text-[#0f172a]">
                {track.title}
              </h3>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
};

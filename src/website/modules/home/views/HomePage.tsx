import { Navbar } from "../components/Navbar";
import { Stagger } from "@/shared/motion";
import { HeroSection } from "../components/HeroSection";
import { WhyMetSection } from "../components/WhyMetSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { TracksSection } from "../components/TracksSection";
import { CoursesSection } from "../components/CoursesSection";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { JourneySection } from "../components/JourneySection";
import { FaqSection } from "../components/FaqSection";
import { FinalCtaSection } from "../components/FinalCtaSection";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export const HomePage = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f8f7f5]">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <WhyMetSection />
        <FeaturesSection />
        <JourneySection />
        <TracksSection />
        <CoursesSection />
        <TestimonialsSection />

        <FaqSection />
        <FinalCtaSection />

        {/* Deep Blue Footer */}
        <footer
          className="bg-[#0f172a] text-white pt-24 pb-12 px-6 md:px-12"
          dir="rtl"
        >
          <Stagger className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-white/10 pb-16" staggerMs={80}>
            {/* Platform Identity */}
            <div className="space-y-6">
              <div className="text-3xl font-black flex items-center gap-2">
                <img
                  src="/images/logo.svg"
                  alt="MET"
                  className="h-10 w-auto brightness-0 invert"
                />
                <span>MET</span>
              </div>
              <p className="text-white/60 text-lg font-medium leading-relaxed">
                منصة سعودية رائدة لتمكين الطلاب في التخصصات التقنية وسد الفجوة
                بين التعليم الأكاديمي والمهارات العملية.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-xl font-bold">روابط سريعة</h4>
              <ul className="space-y-4 text-white/60 font-medium text-lg">
                <li>
                  <Link to="/" className="hover:text-primary transition-colors">
                    عن الأكاديمية
                  </Link>
                </li>
                <li>
                  <Link
                    to="/courses"
                    className="hover:text-primary transition-colors"
                  >
                    مكتبة المقررات
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-primary transition-colors">
                    خطط الأسعار
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-primary transition-colors">
                    سياسة الخصوصية
                  </Link>
                </li>
              </ul>
            </div>

            {/* Fields of Study */}
            <div className="space-y-6">
              <h4 className="text-xl font-bold">التخصصات</h4>
              <ul className="space-y-3 text-white/60 text-[15px]">
                <li>
                  <Link
                    to="#"
                    className="hover:text-[#f5a524] transition-colors"
                  >
                    علوم الحاسب
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="hover:text-[#f5a524] transition-colors"
                  >
                    هندسة البرمجيات
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="hover:text-[#f5a524] transition-colors"
                  >
                    نظم المعلومات
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="hover:text-[#f5a524] transition-colors"
                  >
                    الأمن السيبراني
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Details */}
            <div className="space-y-5">
              <h4 className="text-[16px] font-bold text-white">تواصل معنا</h4>
              <ul className="space-y-3 text-white/60 text-[15px]">
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#f5a524]" />
                  <span>info@met-academy.sa</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#f5a524]" />
                  <span>+966 500 000 000</span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#f5a524]" />
                  <span>الرياض، المملكة العربية السعودية</span>
                </li>
              </ul>
              {/* Social Icons — YouTube, Instagram, Twitter SVGs */}
              <div className="flex gap-3 pt-2">
                {/* YouTube */}
                <a
                  href="#"
                  className="size-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#f5a524] hover:border-[#f5a524] transition-all"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="#"
                  className="size-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#f5a524] hover:border-[#f5a524] transition-all"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                </a>
                {/* Twitter/X */}
                <a
                  href="#"
                  className="size-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#f5a524] hover:border-[#f5a524] transition-all"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </Stagger>

          <div className="max-w-[1280px] mx-auto pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-[14px]">
            <p dir="ltr">© 2026 MET E-Academy. جميع الحقوق محفوظة.</p>
            <div className="flex gap-6">
              <Link to="#" className="hover:text-white transition-colors">
                الشروط والأحكام
              </Link>
              <Link to="#" className="hover:text-white transition-colors">
                سياسة الكوكيز
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

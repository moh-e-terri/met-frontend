const footerLinks = [
  "عن الأكاديمية",
  "الشروط والأحكام",
  "اتصل بنا",
  "الأسئلة الشائعة",
];

export const CoursePageFooter = () => {
  return (
    <footer
      className="mt-10 rounded-3xl border border-[#e2e8f0] bg-white px-6 py-10 text-center shadow-sm"
      dir="rtl"
    >
      <img
        src="/images/logo.svg"
        alt="MET"
        className="mx-auto h-10 w-[72px] object-contain"
      />
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#64748b]">
        أفضل منصة تعليمية لتعلم البرمجة باللغة العربية بأسلوب أكاديمي وعملي.
      </p>
      <nav className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-[#475569]">
        {footerLinks.map((link) => (
          <a
            key={link}
            href="#"
            className="transition-colors hover:text-[#f5a524]"
          >
            {link}
          </a>
        ))}
      </nav>
      <p className="mt-6 text-xs text-[#94a3b8]" dir="ltr">
        © 2024 MET E-Academy. جميع الحقوق محفوظة
      </p>
    </footer>
  );
};

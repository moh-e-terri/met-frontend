import { Link } from "react-router-dom";

const navLinks = [
  { label: "الرئيسية", to: "/" },
  { label: "المقررات", to: "/courses" },
  { label: "المميزات", to: "#features" },
  { label: "كيف تعمل", to: "#how-it-works" },
  { label: "احدث المقررات", to: "#latest" },
  { label: "الأسئلة الشائعة", to: "#faq" },
  { label: "تواصل", to: "#contact" },
];

export const Navbar = () => {
  return (
    <header
      dir="rtl"
      className="sticky top-0 z-50 w-full border-b border-[rgba(245,165,36,0.1)] bg-white/80 backdrop-blur-[5px]"
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 md:pl-20 md:pr-10">
        {/* Logo — right in RTL (first child) */}
        <Link to="/" className="flex shrink-0 items-center">
          <img
            src="/images/logo.svg"
            alt="MET"
            className="h-[52px] w-[95px] object-contain"
          />
        </Link>

        {/* Nav links — center */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-[14px] font-normal text-[#0f172a] transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Login — left in RTL (last child) */}
        <Link
          to="/signin"
          className="shrink-0 rounded-[24px] bg-[#f5a524] px-6 py-[10px] text-[14px] font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.2),0px_4px_6px_-4px_rgba(245,165,36,0.2)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          تسجيل الدخول
        </Link>
      </div>
    </header>
  );
};

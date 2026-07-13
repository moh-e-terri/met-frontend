import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 420);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="العودة إلى أعلى الصفحة"
      className={`fixed bottom-6 left-6 z-[80] flex size-12 items-center justify-center rounded-full bg-[#f5a524] text-white shadow-[0px_14px_30px_-10px_rgba(245,165,36,0.65)] transition-[opacity,transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0px_18px_36px_-10px_rgba(245,165,36,0.75)] focus:outline-none focus:ring-4 focus:ring-[#f5a524]/25 md:bottom-8 md:left-8 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp className="size-5" strokeWidth={2.5} />
    </button>
  );
};

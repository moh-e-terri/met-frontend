import { useAuth } from "@/core/auth/AuthContext";

export const AdminWelcomeSection = () => {
  const { session } = useAuth();
  const firstName = session?.name?.split(" ")[0] ?? "سارة";

  return (
    <section className="text-right" dir="rtl">
      <h1 className="text-2xl font-black text-[#0f172a] sm:text-3xl">
        نظرة عامة على لوحة الإدارة
      </h1>
      <p className="mt-2 text-sm text-[#64748b] sm:text-base">
        أهلاً بك مجدداً، {firstName}. إليك آخر المستجدات اليوم.
      </p>
    </section>
  );
};

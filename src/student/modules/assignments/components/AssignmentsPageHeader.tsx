import { StudentIcon } from "../../dashboard/components/StudentIcon";
import type { AssignmentStats } from "@/core/api/assignments";

interface AssignmentsPageHeaderProps {
  title: string;
  subtitle: string;
  stats: AssignmentStats;
}

const statCards = [
  {
    key: "submitted" as const,
    label: "التكليفات المسلّمة",
    icon: "/images/student/icon-check.svg",
    iconBg: "bg-[#ecfdf5]",
    iconColor: "text-[#14b8a6]",
  },
  {
    key: "averageGrade" as const,
    label: "متوسط الدرجات",
    icon: "/images/student/icon-star.svg",
    iconBg: "bg-[#fff7ed]",
    iconColor: "text-[#f5a524]",
  },
  {
    key: "pending" as const,
    label: "التكليفات المعلقة",
    icon: "/images/student/icon-clipboard.svg",
    iconBg: "bg-[#fff7ed]",
    iconColor: "text-[#f5a524]",
  },
];

export const AssignmentsPageHeader = ({
  title,
  subtitle,
  stats,
}: AssignmentsPageHeaderProps) => {
  return (
    <section className="space-y-6" dir="rtl">
      <div className="text-right">
        <h1 className="text-2xl font-black text-[#0f172a] sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-[#64748b] sm:text-base">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="flex items-center justify-between gap-4 rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
          >
            <div className="text-right">
              <p className="text-xs font-medium text-[#64748b]">{card.label}</p>
              <p className="mt-1 text-2xl font-black text-[#0f172a]" dir="ltr">
                {stats[card.key]}
              </p>
            </div>
            <span
              className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${card.iconBg}`}
            >
              <StudentIcon
                src={card.icon}
                className={`size-5 ${card.iconColor}`}
              />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

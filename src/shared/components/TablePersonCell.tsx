import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface TablePersonCellProps {
  name: string;
  avatar: string;
  subtitle?: ReactNode;
  className?: string;
  avatarClassName?: string;
}

/**
 * RTL-friendly person cell: avatar on the right, name to its left.
 * Use inside tables/sections that already have `dir="rtl"`.
 */
export function TablePersonCell({
  name,
  avatar,
  subtitle,
  className,
  avatarClassName,
}: TablePersonCellProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src={avatar}
        alt=""
        className={cn("size-9 shrink-0 rounded-full object-cover", avatarClassName)}
        aria-hidden
      />
      <div className="min-w-0 text-right">
        <p className="truncate font-bold text-[#0f172a]">{name}</p>
        {subtitle ? <div className="mt-0.5">{subtitle}</div> : null}
      </div>
    </div>
  );
}

/** Shared cell classes for consistent RTL table alignment. */
export const tableCellClass = {
  th: "px-3 py-3 text-right font-medium",
  td: "px-3 py-4 text-right align-middle",
  tdMuted: "px-3 py-4 text-right align-middle text-[#64748b]",
  tdStrong: "px-3 py-4 text-right align-middle font-semibold text-[#0f172a]",
  /** LTR values (email, amounts) still right-aligned in RTL tables */
  tdLtr: "px-3 py-4 text-right align-middle",
} as const;

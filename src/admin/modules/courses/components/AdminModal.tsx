import type { ReactNode } from "react";
import { AppModal } from "@/shared/components/AppModal";

interface AdminModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
}

/** Thin wrapper kept for existing admin imports — prefer AppModal for new code. */
export const AdminModal = ({
  open,
  title,
  onClose,
  children,
  footer,
  size = "md",
}: AdminModalProps) => {
  return (
    <AppModal
      open={open}
      title={title}
      onClose={onClose}
      footer={footer}
      size={size}
    >
      {children}
    </AppModal>
  );
};

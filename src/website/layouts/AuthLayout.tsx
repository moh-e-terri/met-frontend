import type { ReactNode } from "react";

interface AuthLayoutProps {
  form: ReactNode;
  branding: ReactNode;
}

export const AuthLayout = ({ form, branding }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Form — physical left (Figma) */}
      <div className="flex items-center justify-center bg-[#f8f7f5] px-6 py-10 md:px-12 lg:px-20">
        {form}
      </div>

      {/* Branding — physical right */}
      <div className="relative hidden overflow-hidden lg:block">
        {branding}
      </div>
    </div>
  );
};

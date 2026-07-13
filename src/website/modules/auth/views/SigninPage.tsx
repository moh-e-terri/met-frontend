import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Headphones, LogIn, Shield } from "lucide-react";
import { useAuth } from "@/core/auth/AuthContext";
import { PageMotion } from "@/shared/motion";
import {
  getAdminHomePath,
  getTeacherHomePath,
  isAdminSurface,
  isTeacherSurface,
} from "@/core/routing/appSurface";
import { AuthLayout } from "@/website/layouts/AuthLayout";
import { AuthField } from "../components/AuthField";
import { SigninBrandingPanel } from "../components/SigninBrandingPanel";

const signinSchema = z.object({
  identifier: z.string().min(1, "أدخل البريد الإلكتروني"),
  password: z.string().min(1, "أدخل كلمة المرور"),
  remember: z.boolean().optional(),
});

type SigninForm = z.infer<typeof signinSchema>;

export const SigninPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const from =
    (location.state as { from?: string } | null)?.from ??
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninForm>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      identifier: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (values: SigninForm) => {
    try {
      setSubmitError(null);
      const session = await signIn(values.identifier, values.password);

      if (session.role === "admin") {
        const adminHome = getAdminHomePath();
        navigate(
          from &&
            (from.startsWith("/admin") ||
              (isAdminSurface() && from !== "/signin"))
            ? from
            : adminHome,
          { replace: true },
        );
        return;
      }

      if (session.role === "teacher") {
        const teacherHome = getTeacherHomePath();
        navigate(
          from &&
            (from === teacherHome ||
              from.startsWith(`${teacherHome}/`) ||
              (isTeacherSurface() && from !== "/signin"))
            ? from
            : teacherHome,
          { replace: true },
        );
        return;
      }

      navigate(from && !from.startsWith("/admin") ? from : "/student", {
        replace: true,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "تعذر تسجيل الدخول",
      );
    }
  };

  return (
    <AuthLayout
      branding={<SigninBrandingPanel />}
      form={
        <div dir="rtl" className="w-full max-w-[448px]">
          <PageMotion>
          <div className="mb-10 flex justify-center">
            <Link to="/" className="transition-opacity hover:opacity-80">
              <img src="/images/logo.svg" alt="MET" className="h-28 w-auto" />
            </Link>
          </div>

          <div className="mb-8 space-y-3 text-center">
            <h1 className="text-[30px] font-bold text-[#0f172a]">تسجيل الدخول</h1>
            <p className="text-base font-medium text-[#64748b]">
              مرحباً بك في منصة MET التعليمية
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <AuthField
              label="البريد الإلكتروني"
              placeholder="admin أو met@example.com"
              error={errors.identifier?.message}
              {...register("identifier")}
            />

            <AuthField
              label="كلمة المرور"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />

            <div className="flex items-center justify-between">
              <Link to="#" className="text-sm font-bold text-[#0ea5e9]">
                هل نسيت كلمة المرور؟
              </Link>
              <label className="flex items-center gap-2 text-sm font-medium text-[#475569]">
                <span>تذكرني</span>
                <input
                  type="checkbox"
                  className="size-5 rounded-lg border border-[#cbd5e1]"
                  {...register("remember")}
                />
              </label>
            </div>

            {submitError ? (
              <p className="text-right text-sm text-red-500">{submitError}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#f5a524] px-6 py-4 text-lg font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.2),0px_4px_6px_-4px_rgba(245,165,36,0.2)] transition-transform hover:scale-[1.01] disabled:opacity-70"
            >
              <LogIn className="size-[18px]" />
              تسجيل الدخول
            </button>
          </form>

          <p className="mt-8 text-center text-base text-[#64748b]">
            ليس لديك حساب؟{" "}
            <Link to="/signup" className="font-bold text-[#f5a524]">
              إنشاء حساب جديد
            </Link>
          </p>

          <div className="mt-10 flex items-center justify-center gap-6 border-t border-[#f1f5f9] pt-8 text-xs text-[#64748b]">
            <span className="flex items-center gap-2">
              <Shield className="size-3.5" />
              دخول آمن
            </span>
            <span className="flex items-center gap-2">
              <Headphones className="size-3.5" />
              دعم فني 24/7
            </span>
          </div>
          </PageMotion>
        </div>
      }
    />
  );
};

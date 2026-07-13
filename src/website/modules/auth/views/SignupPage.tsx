import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, ChevronDown } from "lucide-react";
import { useAuth } from "@/core/auth/AuthContext";
import { getUniversities, type University } from "@/core/api/universities";
import { PageMotion } from "@/shared/motion";
import { AuthLayout } from "@/website/layouts/AuthLayout";
import { AuthField } from "../components/AuthField";
import { SignupBrandingPanel } from "../components/SignupBrandingPanel";

const signupSchema = z
  .object({
    firstName: z.string().min(2, "الاسم مطلوب"),
    middleName: z.string().optional(),
    lastName: z.string().min(2, "اسم العائلة مطلوب"),
    email: z.string().email("أدخل بريداً إلكترونياً صحيحاً"),
    phone: z.string().min(8, "رقم الهاتف مطلوب"),
    university: z.string().min(1, "اختر الجامعة"),
    password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
    confirmPassword: z.string().min(6, "أكد كلمة المرور"),
    terms: z.boolean().refine((value) => value, {
      message: "يجب الموافقة على الشروط",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoadingUniversities, setIsLoadingUniversities] = useState(true);
  const [universitiesError, setUniversitiesError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getUniversities()
      .then((nextUniversities) => {
        if (isMounted) {
          setUniversities(nextUniversities.filter((university) => university.id));
          setUniversitiesError(null);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setUniversitiesError(
            error instanceof Error ? error.message : "تعذر تحميل الجامعات",
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingUniversities(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      terms: false,
    },
  });

  const onSubmit = async (values: SignupForm) => {
    try {
      setSubmitError(null);
      await signUp({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        middleName: values.middleName,
        lastName: values.lastName,
        phone: values.phone,
        universityId: values.university,
        confirmPassword: values.confirmPassword,
      });
      navigate("/student");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "تعذر إنشاء الحساب",
      );
    }
  };

  return (
    <AuthLayout
      branding={<SignupBrandingPanel />}
      form={
        <div dir="rtl" className="w-full max-w-[448px]">
          <PageMotion>
          <div className="mb-8 flex justify-center">
            <Link to="/" className="transition-opacity hover:opacity-80">
              <img src="/images/logo.svg" alt="MET" className="h-28 w-auto" />
            </Link>
          </div>

          <div className="mb-8 space-y-2 text-center">
            <h1 className="text-[30px] font-black text-[#0f172a]">إنشاء حساب</h1>
            <p className="text-base font-medium text-[#64748b]">
              انضم إلى مجتمع MET التعليمي اليوم
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2 text-right">
              <label className="block text-sm text-[#0f172a]">
                أدخل اسمك الثلاثي
              </label>
              <div className="grid grid-cols-3 gap-3">
                <AuthField
                  label=""
                  placeholder="الاسم"
                  error={errors.firstName?.message}
                  {...register("firstName")}
                />
                <AuthField
                  label=""
                  placeholder="الاسم الأوسط"
                  {...register("middleName")}
                />
                <AuthField
                  label=""
                  placeholder="اسم العائلة"
                  error={errors.lastName?.message}
                  {...register("lastName")}
                />
              </div>
            </div>

            <AuthField
              label="البريد الإلكتروني"
              type="email"
              placeholder="met@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <AuthField
              label="رقم الهاتف"
              type="tel"
              placeholder="5X XXX XXXX"
              error={errors.phone?.message}
              {...register("phone")}
            />

            <div className="space-y-2 text-right">
              <label className="block text-sm text-[#334155]">اختر الجامعة</label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#64748b]" />
                <ChevronDown className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#64748b]" />
                <select
                  {...register("university")}
                  disabled={isLoadingUniversities}
                  className="h-[50px] w-full appearance-none rounded-[24px] border border-[#e2e8f0] bg-white px-10 text-right text-base text-[#0f172a] outline-none focus:border-[#f5a524]"
                >
                  <option value="">
                    {isLoadingUniversities ? "جاري تحميل الجامعات..." : "اختر جامعتك"}
                  </option>
                  {universities.map((university) => (
                    <option key={university.id} value={university.id}>
                      {university.name}
                    </option>
                  ))}
                </select>
              </div>
              {universitiesError ? (
                <p className="text-sm text-red-500">{universitiesError}</p>
              ) : null}
              {errors.university ? (
                <p className="text-sm text-red-500">{errors.university.message}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <AuthField
                label="كلمة المرور"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
              <AuthField
                label="تأكيد كلمة المرور"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
            </div>

            <label className="flex items-center justify-end gap-3 text-sm text-[#475569]">
              <span>
                أوافق على{" "}
                <span className="font-bold text-[#f5a524]">الشروط والأحكام</span>{" "}
                وسياسة الخصوصية
              </span>
              <input
                type="checkbox"
                className="size-5 rounded-lg border border-[#cbd5e1]"
                {...register("terms")}
              />
            </label>
            {errors.terms ? (
              <p className="text-right text-sm text-red-500">
                {errors.terms.message}
              </p>
            ) : null}

            {submitError ? (
              <p className="text-right text-sm text-red-500">{submitError}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || isLoadingUniversities}
              className="w-full rounded-[24px] bg-[#f5a524] px-6 py-4 text-lg font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.2),0px_4px_6px_-4px_rgba(245,165,36,0.2)] transition-transform hover:scale-[1.01] disabled:opacity-70"
            >
              إنشاء الحساب
            </button>
          </form>

          <p className="mt-8 text-center text-base text-[#475569]">
            لديك حساب بالفعل؟{" "}
            <Link to="/signin" className="font-bold text-[#f5a524]">
              تسجيل الدخول
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-[#94a3b8]">
            © 2024 MET Tutorials جميع الحقوق محفوظة
          </p>
          </PageMotion>
        </div>
      }
    />
  );
};

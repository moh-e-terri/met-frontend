import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import { PageMotion } from "@/shared/motion";
import {
  clearPendingEnrollment,
  enrollInCourse,
  loadPendingEnrollment,
  type AvailableCourse,
} from "@/student/api/availableCourses";
import { fetchMetHistory, metHistoryQueryKeys } from "@/student/api/metHistory";
import { myCoursesQueryKeys } from "@/student/api/myCourses";
import { studentQueryKeys } from "@/student/api/queryKeys";
import { OrderSummarySidebar } from "../components/OrderSummarySidebar";
import { PaymentHistorySection } from "../components/PaymentHistorySection";
import { WalletBalanceCard } from "../components/WalletBalanceCard";
import { buildPaymentOrderSummary } from "../types";

export const StudentPaymentsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId") ?? "";
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const courseFromState = (location.state as { course?: AvailableCourse } | null)?.course;
  const courseFromStorage = courseId ? loadPendingEnrollment(courseId) : null;
  const pendingCourse = courseFromState ?? courseFromStorage;

  const metHistoryQuery = useQuery({
    queryKey: metHistoryQueryKeys.all(session?.userId),
    queryFn: fetchMetHistory,
    enabled: Boolean(session?.userId),
  });

  const order = pendingCourse
    ? buildPaymentOrderSummary({
        courseId: pendingCourse.id,
        courseTitle: pendingCourse.title,
        courseImage: pendingCourse.image,
        metCost: pendingCourse.metCost,
      })
    : null;

  const enrollMutation = useMutation({
    mutationFn: () => enrollInCourse(courseId),
    onSuccess: async () => {
      clearPendingEnrollment();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: studentQueryKeys.dashboard(session?.userId) }),
        queryClient.invalidateQueries({
          queryKey: studentQueryKeys.progressOverview(session?.userId),
        }),
        queryClient.invalidateQueries({ queryKey: myCoursesQueryKeys.catalog(session?.userId) }),
        queryClient.invalidateQueries({
          queryKey: myCoursesQueryKeys.detail(courseId, session?.userId),
        }),
        queryClient.invalidateQueries({ queryKey: ["student", "courses", "available"] }),
        queryClient.invalidateQueries({ queryKey: metHistoryQueryKeys.all(session?.userId) }),
        queryClient.invalidateQueries({ queryKey: ["student", "courses", courseId] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
      navigate(`/student/my-courses/${courseId}`, {
        replace: true,
        state: { enrolled: true },
      });
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error ? error.message : "تعذر إتمام الاشتراك في المقرر",
      );
    },
  });

  const handleCompletePayment = () => {
    if (!courseId || !order) return;
    setErrorMessage(null);
    enrollMutation.mutate();
  };

  const currentMet = metHistoryQuery.data?.currentMet ?? 0;
  const shortfall =
    order && currentMet < order.metCost ? order.metCost - currentMet : 0;

  return (
    <PageMotion className="mx-auto w-full max-w-[900px] space-y-6 sm:space-y-8">
      <header className="text-right" dir="rtl">
        <h1 className="text-2xl font-black text-[#0f172a] sm:text-3xl">محفظتي</h1>
        <p className="mt-2 text-sm text-[#64748b]">
          تابع رصيد نقاط MET وسجل عمليات الشحن والخصم والاسترداد.
        </p>
      </header>

      {metHistoryQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {metHistoryQuery.error instanceof Error
            ? metHistoryQuery.error.message
            : "تعذر تحميل سجل MET"}
        </div>
      ) : null}

      <WalletBalanceCard
        currentMet={metHistoryQuery.data?.currentMet}
        currentUsd={metHistoryQuery.data?.currentUsd}
        isLoading={metHistoryQuery.isLoading}
      />

      {courseId ? (
        <section className="space-y-4" dir="rtl">
          <h2 className="text-lg font-bold text-[#0f172a]">إتمام الاشتراك</h2>
          {order ? (
            <>
              {shortfall > 0 ? (
                <div className="rounded-2xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]">
                  <p>
                    رصيدك:{" "}
                    <span className="font-bold" dir="ltr">
                      {currentMet} MET
                    </span>
                  </p>
                  <p className="mt-1">
                    سعر الكورس:{" "}
                    <span className="font-bold" dir="ltr">
                      {order.metCost} MET
                    </span>
                  </p>
                  <p className="mt-1">
                    ينقصك:{" "}
                    <span className="font-bold" dir="ltr">
                      {shortfall} MET
                    </span>
                  </p>
                </div>
              ) : null}
              <OrderSummarySidebar
                order={order}
                isProcessing={enrollMutation.isPending}
                errorMessage={errorMessage}
                onCompletePayment={handleCompletePayment}
                disabled={shortfall > 0}
                disabledLabel="رصيدك غير كافٍ"
              />
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#e2e8f0] bg-white px-6 py-10 text-center">
              <p className="text-sm text-[#64748b]">
                لم نجد تفاصيل المقرر المطلوب. ارجع لصفحة المقررات واختر الاشتراك من جديد.
              </p>
              <Link
                to="/student/catalog"
                className="mt-4 inline-block rounded-2xl bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-white"
              >
                استكشاف المقررات
              </Link>
            </div>
          )}
        </section>
      ) : null}

      <PaymentHistorySection
        transactions={metHistoryQuery.data?.transactions ?? []}
        isLoading={metHistoryQuery.isLoading}
      />
    </PageMotion>
  );
};

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
import type { PaymentMethodId } from "../data/mockPayments";
import { OrderSummarySidebar } from "../components/OrderSummarySidebar";
import { PaymentCardForm } from "../components/PaymentCardForm";
import { PaymentHistorySection } from "../components/PaymentHistorySection";
import { PaymentMethodSelector } from "../components/PaymentMethodSelector";
import { PaymentPageHeader } from "../components/PaymentPageHeader";
import { buildPaymentOrderSummary } from "../types";

export const StudentPaymentsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId") ?? "";
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>("paypal");
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

  if (courseId && !order) {
    return (
      <PageMotion className="mx-auto w-full max-w-[1120px] space-y-6">
        <PaymentPageHeader />
        <div
          className="rounded-3xl border border-dashed border-[#e2e8f0] bg-white px-6 py-12 text-center"
          dir="rtl"
        >
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
        <PaymentHistorySection
          transactions={metHistoryQuery.data?.transactions ?? []}
          currentMet={metHistoryQuery.data?.currentMet}
          isLoading={metHistoryQuery.isLoading}
        />
      </PageMotion>
    );
  }

  return (
    <PageMotion className="mx-auto w-full max-w-[1120px] space-y-6 sm:space-y-8">
      <PaymentPageHeader courseTitle={order?.courseTitle} />

      {metHistoryQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {metHistoryQuery.error instanceof Error
            ? metHistoryQuery.error.message
            : "تعذر تحميل سجل MET"}
        </div>
      ) : null}

      <PaymentMethodSelector selected={selectedMethod} onSelect={setSelectedMethod} />

      <div
        className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]"
        dir="ltr"
      >
        <div className="order-2 lg:order-1 lg:row-start-1">
          {order ? (
            <OrderSummarySidebar
              order={order}
              isProcessing={enrollMutation.isPending}
              errorMessage={errorMessage}
              onCompletePayment={handleCompletePayment}
            />
          ) : (
            <aside className="rounded-3xl border border-[#e2e8f0] bg-white p-5 text-right text-sm text-[#64748b] shadow-sm">
              لا يوجد مقرر محدد للدفع حالياً. يمكنك شحن رصيد MET من هنا.
            </aside>
          )}
        </div>
        <div className="order-1 min-w-0 lg:order-2 lg:row-start-1">
          <PaymentCardForm
            isProcessing={enrollMutation.isPending}
            onSubmit={handleCompletePayment}
          />
        </div>
      </div>

      <PaymentHistorySection
        transactions={metHistoryQuery.data?.transactions ?? []}
        currentMet={metHistoryQuery.data?.currentMet}
        isLoading={metHistoryQuery.isLoading}
      />
    </PageMotion>
  );
};

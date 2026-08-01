import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { PageMotion } from "@/shared/motion";
import {
  adminQueryKeys,
  deleteAdminCourse,
  fetchAdminCourses,
  fetchAdminStatsRaw,
  updateAdminCourse,
  type UpdateAdminCoursePayload,
} from "@/admin/api";
import { asArray, asRecord, pickNumber } from "@/core/api/utils";
import type { AdminCatalogCourse } from "../data/mockAdminCourses";
import { AdminCourseCatalogTable } from "../components/AdminCourseCatalogTable";
import { AdminCourseEditModal } from "../components/AdminCourseEditModal";
import { AdminCoursesPageHeader } from "../components/AdminCoursesPageHeader";
import { AdminCoursesStatsCards } from "../components/AdminCoursesStatsCards";
import { AdminCreateCourseForm } from "../components/AdminCreateCourseForm";

export const AdminCoursesPage = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editCourse, setEditCourse] = useState<AdminCatalogCourse | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const coursesQuery = useQuery({
    queryKey: adminQueryKeys.courses({ limit: 100 }),
    queryFn: () => fetchAdminCourses({ page: 1, limit: 100 }),
  });

  const statsQuery = useQuery({
    queryKey: [...adminQueryKeys.stats, "raw"],
    queryFn: fetchAdminStatsRaw,
  });

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || !coursesQuery.data?.items.length) return;
    const found = coursesQuery.data.items.find((course) => course.id === editId);
    if (found) {
      setEditCourse(found);
      setEditError(null);
    }
  }, [searchParams, coursesQuery.data]);

  const invalidateCourses = async () => {
    await queryClient.invalidateQueries({
      queryKey: adminQueryKeys.courses({ limit: 100 }),
    });
  };

  const deleteMutation = useMutation({
    mutationFn: (course: AdminCatalogCourse) => deleteAdminCourse(course.id),
    onSuccess: async () => {
      setActionError(null);
      await invalidateCourses();
    },
    onError: (error) => {
      setActionError(
        error instanceof Error ? error.message : "تعذر حذف المقرر",
      );
    },
  });

  const editMutation = useMutation({
    mutationFn: ({
      course,
      payload,
    }: {
      course: AdminCatalogCourse;
      payload: UpdateAdminCoursePayload;
    }) =>
      updateAdminCourse(course.id, payload, {
        enrolledCount: course.enrolledCount,
      }),
    onSuccess: async () => {
      setEditError(null);
      setEditCourse(null);
      searchParams.delete("edit");
      setSearchParams(searchParams, { replace: true });
      await invalidateCourses();
    },
    onError: (error) => {
      setEditError(
        error instanceof Error ? error.message : "تعذر تعديل المقرر",
      );
    },
  });

  const courses = coursesQuery.data?.items ?? [];
  const topCourses = asArray<Record<string, unknown>>(
    asRecord(statsQuery.data).topCourses,
  );
  const totalEnrollments = topCourses.reduce(
    (sum, course) => sum + pickNumber(course.enrolledCount),
    0,
  );

  const avgInstructor =
    topCourses.length > 0
      ? Math.round(
          topCourses.reduce(
            (sum, course) => sum + pickNumber(course.instructorPercentage),
            0,
          ) / topCourses.length,
        )
      : 0;
  const avgReserved =
    topCourses.length > 0
      ? Math.round(
          topCourses.reduce(
            (sum, course) => sum + pickNumber(course.reservedPercentage),
            0,
          ) / topCourses.length,
        )
      : 0;

  const partition = [
    {
      label: "حصة المحاضر",
      percentage: avgInstructor,
      barClass: "bg-white",
    },
    {
      label: "حصة المنصة",
      percentage: Math.max(0, 100 - avgInstructor - avgReserved),
      barClass: "bg-white/80",
    },
    {
      label: "الاحتياطي",
      percentage: avgReserved,
      barClass: "bg-white/60",
    },
  ].filter((item) => item.percentage > 0);

  if (topCourses.length > 0 && partition.length === 0) {
    partition.push({
      label: "حصة المنصة",
      percentage: 100,
      barClass: "bg-white/80",
    });
  }

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
      <AdminCoursesPageHeader />

      {coursesQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {coursesQuery.error instanceof Error
            ? coursesQuery.error.message
            : "تعذر تحميل قائمة الكورسات"}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {actionError}
        </div>
      ) : null}

      <AdminCoursesStatsCards
        activeCourses={coursesQuery.data?.pagination.total ?? courses.length}
        totalEnrollments={totalEnrollments}
        partition={partition}
      />
      <AdminCourseCatalogTable
        courses={courses}
        isLoading={coursesQuery.isLoading}
        deletingId={deleteMutation.isPending ? deleteMutation.variables?.id : null}
        onEdit={(course) => {
          setActionError(null);
          setEditError(null);
          setEditCourse(course);
        }}
        onDelete={(course) => {
          const confirmed = window.confirm(
            `هل أنت متأكد من حذف المقرر "${course.title}"؟ لا يمكن التراجع عن هذا الإجراء.`,
          );
          if (!confirmed) return;
          setActionError(null);
          deleteMutation.mutate(course);
        }}
      />
      <AdminCreateCourseForm />

      <AdminCourseEditModal
        course={editCourse}
        open={Boolean(editCourse)}
        onClose={() => {
          if (editMutation.isPending) return;
          setEditCourse(null);
          setEditError(null);
          if (searchParams.has("edit")) {
            searchParams.delete("edit");
            setSearchParams(searchParams, { replace: true });
          }
        }}
        isSubmitting={editMutation.isPending}
        error={editError}
        onSubmit={async (payload) => {
          if (!editCourse) return;
          await editMutation.mutateAsync({ course: editCourse, payload });
        }}
      />
    </PageMotion>
  );
};

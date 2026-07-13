import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageMotion } from "@/shared/motion";
import {
  addStudentMetPoints,
  adminQueryKeys,
  fetchAdminStudents,
} from "@/admin/api";
import { AdminPaymentHistoryLog } from "../components/AdminPaymentHistoryLog";
import { AdminStudentProfilePanel } from "../components/AdminStudentProfilePanel";
import { AdminStudentsPageHeader } from "../components/AdminStudentsPageHeader";
import { AdminStudentsTable } from "../components/AdminStudentsTable";

export const AdminStudentsPage = () => {
  const queryClient = useQueryClient();
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ name: "", email: "" });

  const studentsQuery = useQuery({
    queryKey: adminQueryKeys.students({ ...appliedFilters, limit: 100 }),
    queryFn: () =>
      fetchAdminStudents({
        name: appliedFilters.name || undefined,
        email: appliedFilters.email || undefined,
        page: 1,
        limit: 100,
      }),
  });

  const students = studentsQuery.data?.items ?? [];
  const activeStudents = useMemo(
    () => students.filter((student) => student.listStatus === "active"),
    [students],
  );
  const [selectedStudent, setSelectedStudent] = useState(activeStudents[0]);

  useEffect(() => {
    if (
      activeStudents.length > 0 &&
      (!selectedStudent || !activeStudents.some((s) => s.id === selectedStudent.id))
    ) {
      setSelectedStudent(activeStudents[0]);
    }
  }, [activeStudents, selectedStudent]);

  const metMutation = useMutation({
    mutationFn: ({ studentId, amount, description }: {
      studentId: string;
      amount: number;
      description?: string;
    }) => addStudentMetPoints(studentId, { amount, description }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.students({ ...appliedFilters, limit: 100 }),
      });
    },
  });

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
      <AdminStudentsPageHeader
        totalCount={studentsQuery.data?.pagination.total ?? students.length}
        searchName={searchName}
        searchEmail={searchEmail}
        onSearchNameChange={setSearchName}
        onSearchEmailChange={setSearchEmail}
        onApplyFilters={() =>
          setAppliedFilters({
            name: searchName.trim(),
            email: searchEmail.trim(),
          })
        }
      />

      {studentsQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {studentsQuery.error instanceof Error
            ? studentsQuery.error.message
            : "تعذر تحميل قائمة الطلاب"}
        </div>
      ) : null}

      <section
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]"
        dir="ltr"
      >
        <aside className="order-2 xl:order-1 xl:row-start-1">
          {selectedStudent ? (
            <AdminStudentProfilePanel
              student={selectedStudent}
              onAddMet={async (amount, description) => {
                await metMutation.mutateAsync({
                  studentId: selectedStudent.id,
                  amount,
                  description,
                });
              }}
              isAddingMet={metMutation.isPending}
              metError={
                metMutation.isError && metMutation.error instanceof Error
                  ? metMutation.error.message
                  : undefined
              }
              metSuccess={metMutation.isSuccess ? "تمت إضافة نقاط MET بنجاح." : undefined}
            />
          ) : null}
        </aside>

        <div className="order-1 space-y-6 xl:order-2 xl:row-start-1">
          <AdminStudentsTable
            students={students}
            selectedId={selectedStudent?.id ?? ""}
            onSelect={setSelectedStudent}
            isLoading={studentsQuery.isLoading}
          />
          <AdminPaymentHistoryLog student={selectedStudent} />
        </div>
      </section>
    </PageMotion>
  );
};

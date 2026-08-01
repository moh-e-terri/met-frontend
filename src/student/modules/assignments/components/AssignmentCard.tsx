import { useRef, useState } from "react";
import { AnimatedBar } from "@/shared/motion";
import { AppModal } from "@/shared/components/AppModal";
import { cn } from "@/shared/utils/cn";
import {
  assignmentFileAccept,
  readAssignmentFileAsDataUrl,
  type CourseAssignment,
  type SubmitAssignmentPayload,
} from "@/core/api/assignments";
import { StudentIcon } from "../../dashboard/components/StudentIcon";

interface AssignmentCardProps {
  assignment: CourseAssignment;
  onSubmit?: (
    assignmentId: string,
    payload: SubmitAssignmentPayload,
    meta?: { fileName?: string },
  ) => void | Promise<void>;
  isSubmitting?: boolean;
}

const MetaItem = ({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) => (
  <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b]">
    <StudentIcon src={icon} className="size-3.5 text-[#94a3b8]" />
    <span>{label}</span>
  </span>
);

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const AssignmentCard = ({
  assignment,
  onSubmit,
  isSubmitting = false,
}: AssignmentCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [answer, setAnswer] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [mode, setMode] = useState<"text" | "file">(
    assignment.submissionType === "text" ? "text" : "file",
  );

  const canSubmit =
    onSubmit &&
    (assignment.status === "pending" ||
      assignment.status === "overdue" ||
      assignment.status === "draft");
  const canReview =
    assignment.status === "submitted" || assignment.status === "graded";

  const requiresText = assignment.submissionType === "text";
  const requiresFile =
    assignment.submissionType === "pdf" || assignment.submissionType === "image";
  const allowsAny = assignment.submissionType === "any";
  const showTextInput = requiresText || (allowsAny && mode === "text");
  const showFileInput = requiresFile || (allowsAny && mode === "file");

  const resetForm = () => {
    setAnswer("");
    setSelectedFile(null);
    setFormError(null);
    setMode(assignment.submissionType === "text" ? "text" : "file");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeForm = () => {
    if (isSubmitting) return;
    setShowForm(false);
    resetForm();
  };

  const openForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleFileChange = (fileList: FileList | null) => {
    setFormError(null);
    const file = fileList?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const canConfirm = showTextInput
    ? Boolean(answer.trim())
    : Boolean(selectedFile);

  const handleSubmit = async () => {
    if (!onSubmit) return;
    setFormError(null);

    try {
      let payload: SubmitAssignmentPayload;

      if (showTextInput) {
        const textAnswer = answer.trim();
        if (!textAnswer) {
          setFormError("اكتب إجابتك قبل التسليم.");
          return;
        }
        payload = { submissionType: "text", textAnswer };
      } else {
        if (!selectedFile) {
          setFormError("اختر ملفاً للتسليم.");
          return;
        }
        const filePayload = await readAssignmentFileAsDataUrl(
          selectedFile,
          assignment.submissionType,
        );
        payload = {
          submissionType: filePayload.submissionType,
          fileUrl: filePayload.fileUrl,
        };
      }

      await onSubmit(assignment.id, payload, {
        fileName: selectedFile?.name,
      });
      setShowForm(false);
      resetForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "تعذر تجهيز الملف");
    }
  };

  const uploadHint =
    assignment.submissionType === "pdf"
      ? "ارفع ملف PDF (حتى 5 ميجابايت)"
      : assignment.submissionType === "image"
        ? "ارفع صورة PNG أو JPG أو WEBP (حتى 2 ميجابايت)"
        : "ارفع ملف PDF أو صورة حسب المطلوب";

  return (
    <article
      className="flex h-full flex-col rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
      dir="rtl"
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
            assignment.statusClassName,
          )}
        >
          {assignment.statusLabel}
        </span>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
            assignment.categoryClassName,
          )}
        >
          {assignment.category}
        </span>
      </div>

      <h3 className="mb-3 text-right text-base font-bold text-[#0f172a]">
        {assignment.title}
      </h3>

      <div className="mb-4 flex flex-wrap items-center justify-start gap-x-4 gap-y-2">
        <MetaItem
          icon="/images/student/icon-briefcase.svg"
          label={`${assignment.points} نقطة`}
        />
        <MetaItem
          icon="/images/student/icon-deadline.svg"
          label={assignment.deadline}
        />
        <MetaItem
          icon="/images/student/icon-file.svg"
          label={assignment.type}
        />
      </div>

      <div className="mb-5 flex-1">
        {assignment.status === "graded" && assignment.score !== undefined && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#f8fafc] px-4 py-3">
            <div className="text-right">
              <p className="text-xs text-[#64748b]">درجتك المحققة</p>
              <p className="text-2xl font-black text-[#0f172a]" dir="ltr">
                {assignment.score}/{assignment.points}
              </p>
              {assignment.feedback ? (
                <p className="mt-1 text-xs text-[#64748b]">{assignment.feedback}</p>
              ) : null}
              {assignment.submittedAt && (
                <p className="mt-1 text-[10px] text-[#94a3b8]">
                  {assignment.submittedAt}
                </p>
              )}
            </div>
          </div>
        )}

        {assignment.status === "draft" && assignment.draftProgress !== undefined && (
          <div className="space-y-2">
            {assignment.draftInfo && (
              <p className="text-right text-xs text-[#64748b]">
                {assignment.draftInfo}
              </p>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#14b8a6]" dir="ltr">
                {assignment.draftProgress}%
              </span>
              <span className="text-[#64748b]">التقدم الحالي</span>
            </div>
            <AnimatedBar
              value={assignment.draftProgress}
              className="h-2 bg-[#e2e8f0]"
              barClassName="rounded-full bg-[#14b8a6]"
            />
          </div>
        )}

        {assignment.status === "pending" && assignment.feedbackPreview && (
          <div className="rounded-2xl bg-[#f8fafc] px-4 py-3 text-right">
            <p className="text-xs leading-6 text-[#64748b]">
              {assignment.feedbackPreview}
            </p>
          </div>
        )}

        {assignment.status === "overdue" && assignment.overdueNote && (
          <div className="rounded-2xl border border-dashed border-[#fecaca] bg-[#fef2f2]/50 px-4 py-3 text-right">
            <p className="text-xs font-medium text-[#ef4444]">
              {assignment.overdueNote}
            </p>
          </div>
        )}

        {assignment.status === "submitted" && assignment.submittedAt && (
          <div className="rounded-2xl border border-dashed border-[#a7f3d0] bg-[#ecfdf5]/50 px-4 py-3 text-right">
            <p className="text-xs font-medium text-[#14b8a6]">
              {assignment.submittedAt}
            </p>
            <p className="mt-1 text-sm text-[#475569]">
              في انتظار التقييم من المحاضر
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={isSubmitting}
        onClick={() => {
          if (canSubmit) openForm();
          else if (canReview) setShowReview(true);
        }}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60",
          assignment.actionClassName,
        )}
      >
        {assignment.actionIcon && (
          <StudentIcon
            src={assignment.actionIcon}
            className={cn(
              "size-4",
              assignment.status === "graded" ||
                assignment.status === "submitted" ||
                assignment.actionClassName.includes("border")
                ? "text-[#64748b]"
                : "text-current",
            )}
          />
        )}
        <span>{assignment.actionLabel}</span>
      </button>

      <AppModal
        open={showReview && canReview}
        onClose={() => setShowReview(false)}
        title="مراجعة التسليم"
        description={assignment.title}
        size="sm"
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowReview(false)}
              className="rounded-2xl border border-[#e2e8f0] px-4 py-2.5 text-sm font-bold text-[#64748b]"
            >
              إغلاق
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-right" dir="rtl">
          <div className="rounded-2xl bg-[#f8fafc] px-4 py-3 text-sm text-[#475569]">
            <p>{assignment.submittedAt || "تم التسليم"}</p>
            {assignment.submittedFileName ? (
              <p className="mt-2 font-semibold text-[#0f172a]">
                الملف: {assignment.submittedFileName}
              </p>
            ) : null}
            {assignment.submittedText ? (
              <p className="mt-2 whitespace-pre-wrap">{assignment.submittedText}</p>
            ) : null}
            {!assignment.submittedFileName && !assignment.submittedText ? (
              <p className="mt-2 text-xs text-[#94a3b8]">
                تفاصيل الملف محفوظة على الخادم. يمكنك متابعة حالة التقييم من هذه البطاقة.
              </p>
            ) : null}
          </div>

          {assignment.status === "graded" && assignment.score !== undefined ? (
            <div className="rounded-2xl border border-[#a7f3d0] bg-[#ecfdf5] px-4 py-3">
              <p className="text-sm font-bold text-[#0f766e]">
                الدرجة: {assignment.score}/{assignment.points}
              </p>
              {assignment.feedback ? (
                <p className="mt-1 text-xs text-[#047857]">{assignment.feedback}</p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-[#64748b]">في انتظار تقييم المحاضر.</p>
          )}

          {assignment.isDeadlineOpen ? (
            <div className="rounded-2xl border border-[#fde8c8] bg-[#fff7ed] px-4 py-3 text-xs leading-6 text-[#92400e]">
              الموعد النهائي ما زال متاحاً، لكن الخادم حالياً يقبل تسليماً واحداً فقط
              (لا يدعم تعديل الملف أو 3 محاولات بعد). عند إضافة endpoint لإعادة التسليم سنفعّل التعديل
              هنا مباشرة.
            </div>
          ) : (
            <p className="text-xs text-[#94a3b8]">انتهى الموعد النهائي — لا يمكن التعديل.</p>
          )}
        </div>
      </AppModal>

      <AppModal
        open={showForm && Boolean(canSubmit)}
        onClose={closeForm}
        title="تسليم الواجب"
        description={`${assignment.title} · المطلوب: ${assignment.type}`}
        size="sm"
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={closeForm}
              disabled={isSubmitting}
              className="rounded-2xl border border-[#e2e8f0] px-4 py-2.5 text-sm font-bold text-[#64748b]"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting || !canConfirm}
              className="rounded-2xl bg-[#f5a524] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {isSubmitting ? "جاري التسليم..." : "تأكيد التسليم"}
            </button>
          </div>
        }
      >
        <div className="space-y-4" dir="rtl">
          {allowsAny ? (
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#f8fafc] p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("file");
                  setAnswer("");
                  setFormError(null);
                }}
                className={cn(
                  "rounded-xl py-2 text-sm font-semibold transition",
                  mode === "file"
                    ? "bg-white text-[#0f172a] shadow-sm"
                    : "text-[#64748b]",
                )}
              >
                رفع ملف
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("text");
                  setSelectedFile(null);
                  setFormError(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className={cn(
                  "rounded-xl py-2 text-sm font-semibold transition",
                  mode === "text"
                    ? "bg-white text-[#0f172a] shadow-sm"
                    : "text-[#64748b]",
                )}
              >
                إجابة نصية
              </button>
            </div>
          ) : null}

          {showTextInput ? (
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={5}
              placeholder="اكتب إجابتك هنا..."
              className="w-full resize-none rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f5a524] focus:bg-white"
            />
          ) : null}

          {showFileInput ? (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept={assignmentFileAccept(assignment.submissionType)}
                className="hidden"
                onChange={(event) => handleFileChange(event.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-8 text-center transition hover:border-[#f5a524] hover:bg-[#fff7ed]"
              >
                <StudentIcon
                  src="/images/student/icon-upload.svg"
                  className="size-6 text-[#f5a524]"
                />
                <span className="text-sm font-bold text-[#0f172a]">
                  {selectedFile ? "تغيير الملف" : "اختر ملفاً للرفع"}
                </span>
                <span className="text-xs text-[#64748b]">{uploadHint}</span>
              </button>

              {selectedFile ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e2e8f0] bg-white px-4 py-3">
                  <div className="min-w-0 text-right">
                    <p className="truncate text-sm font-semibold text-[#0f172a]">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-[#94a3b8]" dir="ltr">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="shrink-0 text-xs font-semibold text-[#ef4444]"
                  >
                    إزالة
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {formError ? (
            <p className="text-sm text-red-500">{formError}</p>
          ) : null}
        </div>
      </AppModal>
    </article>
  );
};

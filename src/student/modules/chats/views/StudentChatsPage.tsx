import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  chatInstructorsQueryKeys,
  fetchChatInstructors,
  mapInstructorToChatThread,
} from "@/student/api/chatInstructors";
import { ChatsWorkspace } from "@/shared/modules/chats";

export const StudentChatsPage = () => {
  const instructorsQuery = useQuery({
    queryKey: chatInstructorsQueryKeys.all,
    queryFn: fetchChatInstructors,
  });

  const pendingThreads = useMemo(
    () => (instructorsQuery.data ?? []).map(mapInstructorToChatThread),
    [instructorsQuery.data],
  );

  return (
    <ChatsWorkspace
      pendingThreads={pendingThreads}
      isExtraLoading={instructorsQuery.isLoading}
      isExtraError={instructorsQuery.isError}
      extraErrorMessage={
        instructorsQuery.error instanceof Error
          ? instructorsQuery.error.message
          : undefined
      }
      emptyTitle="لا توجد محادثات بعد"
      emptySubtitle="سجّل في مقرر ليتواصل معك مدرّسو دوراتك هنا، أو ابدأ محادثة من صفحة المقرر."
    />
  );
};

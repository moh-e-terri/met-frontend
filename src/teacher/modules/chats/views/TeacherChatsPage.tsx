import { ChatsWorkspace } from "@/shared/modules/chats";

export const TeacherChatsPage = () => {
  return (
    <ChatsWorkspace
      emptyTitle="لا توجد محادثات بعد"
      emptySubtitle="اضغط أيقونة الشات بجانب أي طالب في مقررك لبدء محادثة."
    />
  );
};

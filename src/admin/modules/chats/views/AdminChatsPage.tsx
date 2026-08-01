import { ChatsWorkspace } from "@/shared/modules/chats";

export const AdminChatsPage = () => {
  return (
    <ChatsWorkspace
      emptyTitle="لا توجد محادثات بعد"
      emptySubtitle="اضغط أيقونة الشات بجانب أي طالب أو مدرّس لبدء محادثة مباشرة."
    />
  );
};

import { TeacherNav } from "@/components/teacher-nav";
import { requireTeacherSession } from "@/lib/auth";
import { logoutTeacher } from "@/server/actions/auth";

export default async function TeacherLayout({
  children,
}: LayoutProps<"/teacher">) {
  const session = await requireTeacherSession();

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50">
      <TeacherNav username={session.username} logoutAction={logoutTeacher} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

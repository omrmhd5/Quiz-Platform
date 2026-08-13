import { TeacherNav } from "@/components/teacher-nav";
import { requireTeacherSession } from "@/lib/auth";
import { logoutTeacher } from "@/server/actions/auth";

export default async function TeacherLayout({
  children,
}: LayoutProps<"/teacher">) {
  const session = await requireTeacherSession();

  return (
    <div className="min-h-full bg-zinc-50">
      <TeacherNav username={session.username} logoutAction={logoutTeacher} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NewProjectForm } from "@/components/new-project-form";

export const metadata = { title: "مشروع جديد" };

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const memberships = await prisma.membership.findMany({ where: { userId: session.user.id }, include: { organization: { select: { id: true, name: true, slug: true } } } });
  if (memberships.length === 0) redirect("/dashboard");
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">مشروع جديد</h1>
        <p className="mt-2 text-muted-foreground">ابدأ بإدخال الاسم. ستتمكن من تعبئة Brand Brief الكامل في الخطوة التالية.</p>
      </div>
      <NewProjectForm organizations={memberships.map((m) => m.organization)} />
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function completeOnboardingAction(
  data: { name: string; role: string; goals: string },
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: data.name },
  });

  await prisma.notification.create({
    data: {
      userId: session.user.id,
      title: "مرحبًا بك في سِمَة!",
      message: `سعداء بانضمامك. ابدأ بإنشاء أول مشروع هوية مؤسسية الآن.`,
      type: "success",
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

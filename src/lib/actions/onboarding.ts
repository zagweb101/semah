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
      title: "Welcome to Next Boilerplate!",
      message: `Thanks for joining! We see you're a ${data.role} looking to build ${data.goals}. Let's get started!`,
      type: "success",
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

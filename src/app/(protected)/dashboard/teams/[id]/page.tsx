import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InviteMemberForm } from "@/components/invite-member-form";
import { MemberList } from "@/components/member-list";

export const metadata = { title: "Team" };

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const membership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: session?.user?.id ?? "",
        organizationId: id,
      },
    },
    include: {
      organization: {
        include: {
          memberships: { include: { user: true } },
        },
      },
    },
  });

  if (!membership) notFound();

  const canManage = membership.role === "OWNER" || membership.role === "ADMIN";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">
        {membership.organization.name}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Manage team members and settings
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            {membership.organization.memberships.length} member(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MemberList
            orgId={id}
            members={membership.organization.memberships.map((m) => ({
              id: m.id,
              userId: m.userId,
              name: m.user.name ?? m.user.email,
              role: m.role,
            }))}
            canManage={canManage}
            currentUserId={session?.user?.id ?? ""}
          />
        </CardContent>
      </Card>

      {canManage && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Invite member</CardTitle>
            <CardDescription>
              Add a team member by their email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteMemberForm orgId={id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

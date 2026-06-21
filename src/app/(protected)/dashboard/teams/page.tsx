import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateOrgForm } from "@/components/create-org-form";

export const metadata = { title: "Teams" };

export default async function TeamsPage() {
  const session = await auth();

  const memberships = await prisma.membership.findMany({
    where: { userId: session?.user?.id },
    include: { organization: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
      <p className="mt-2 text-muted-foreground">
        Manage your organizations and team members
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create new team</CardTitle>
            <CardDescription>Start a new organization</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateOrgForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your teams</CardTitle>
            <CardDescription>Organizations you belong to</CardDescription>
          </CardHeader>
          <CardContent>
            {memberships.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You don&apos;t belong to any teams yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {memberships.map((m) => (
                  <li key={m.id}>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      nativeButton={false}
                      render={
                        <Link href={`/dashboard/teams/${m.organizationId}`} />
                      }
                    >
                      <span className="font-medium">{m.organization.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {m.role.toLowerCase()}
                      </span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

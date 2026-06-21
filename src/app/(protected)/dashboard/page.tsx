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
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { ChatWidget } from "@/components/chat-widget";
import { OnboardingForm } from "@/components/onboarding-form";
import { completeOnboardingAction } from "@/lib/actions/onboarding";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [subscription, orgs, notifications, totalUsers, activeSubs, totalPosts] =
    await Promise.all([
      prisma.subscription.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.membership.count({
        where: { userId: session.user.id },
      }),
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.blogPost.count({ where: { published: true } }),
    ]);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const needsOnboarding = !session.user.name;

  const userGrowth = [
    { month: "Jan", users: 10 },
    { month: "Feb", users: 25 },
    { month: "Mar", users: 45 },
    { month: "Apr", users: 70 },
    { month: "May", users: 110 },
    { month: "Jun", users: totalUsers },
  ];

  const revenue = [
    { month: "Jan", revenue: 90 },
    { month: "Feb", revenue: 225 },
    { month: "Mar", revenue: 405 },
    { month: "Apr", revenue: 630 },
    { month: "May", revenue: 990 },
    { month: "Jun", revenue: activeSubs * 29 },
  ];

  if (needsOnboarding) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <OnboardingForm onComplete={completeOnboardingAction} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {session.user.name}!
          </p>
        </div>
        <NotificationsDropdown notifications={notifications.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          read: n.read,
          createdAt: n.createdAt.toISOString(),
        }))} />
      </div>

      <div className="mt-8">
        <AnalyticsDashboard
          stats={{
            totalUsers,
            activeSubscriptions: activeSubs,
            totalPosts,
            unreadNotifications,
            userGrowth,
            revenue,
          }}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/dashboard/settings" />}
              className="w-full justify-start"
            >
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/billing" />}
              className="w-full justify-start"
            >
              Billing
            </Button>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/dashboard/teams" />}
              className="w-full justify-start"
            >
              Teams ({orgs})
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>Chat with AI to get help</CardDescription>
          </CardHeader>
          <CardContent>
            <ChatWidget />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

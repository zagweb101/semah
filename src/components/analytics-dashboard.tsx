"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, CreditCard, FileText, Bell } from "lucide-react";

type Stats = {
  totalUsers: number;
  activeSubscriptions: number;
  totalPosts: number;
  unreadNotifications: number;
  userGrowth: { month: string; users: number }[];
  revenue: { month: string; revenue: number }[];
};

export function AnalyticsDashboard({ stats }: { stats: Stats }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
        />
        <StatCard
          icon={CreditCard}
          label="Active Subscriptions"
          value={stats.activeSubscriptions}
        />
        <StatCard
          icon={FileText}
          label="Blog Posts"
          value={stats.totalPosts}
        />
        <StatCard
          icon={Bell}
          label="Unread Notifications"
          value={stats.unreadNotifications}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New users per month</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart data={stats.userGrowth} width={400} height={200}>
              <XAxis dataKey="month" />
              <YAxis />
              <Area
                type="monotone"
                dataKey="users"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Monthly revenue ($)</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={stats.revenue} width={400} height={200}>
              <XAxis dataKey="month" />
              <YAxis />
              <Bar
                dataKey="revenue"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

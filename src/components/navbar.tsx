"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LayoutDashboard, Settings, CreditCard, LogOut, Sparkles } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-9 rounded-lg bg-gradient-to-br from-violet to-violet-dark flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-bold">س</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-semibold text-base">سِمَة</span>
              <span className="text-[10px] text-muted-foreground tracking-wider">SEMAH</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">المزايا</Link>
            <Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">كيف يعمل</Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">الأسعار</Link>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">المدونة</Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {status === "authenticated" && session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full outline-none">
                <Avatar size="sm">
                  {session.user.image ? <AvatarImage src={session.user.image} alt={session.user.name ?? ""} /> : null}
                  <AvatarFallback>{session.user.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{session.user.name ?? "مستخدم"}</span>
                    <span className="text-xs text-muted-foreground">{session.user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/dashboard" />}><LayoutDashboard className="size-4" />لوحة التحكم</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/dashboard/settings" />}><Settings className="size-4" />الإعدادات</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/billing" />}><CreditCard className="size-4" />الاشتراك والفوترة</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}><LogOut className="size-4" />تسجيل الخروج</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>دخول</Button>
              <Button size="sm" nativeButton={false} render={<Link href="/register" />}><Sparkles className="size-3.5" />ابدأ مجانًا</Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

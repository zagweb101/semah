import { auth } from "@/auth";
import { SettingsForms } from "@/components/settings-forms";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="mt-2 text-muted-foreground">Manage your account</p>
      <div className="mt-8">
        <SettingsForms
          userName={session?.user?.name ?? ""}
          userEmail={session?.user?.email ?? ""}
        />
      </div>
    </div>
  );
}

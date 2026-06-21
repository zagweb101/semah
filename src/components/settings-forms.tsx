"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  updateProfileAction,
  changePasswordAction,
  deleteAccountAction,
} from "@/lib/actions/settings";

export function SettingsForms({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  return (
    <div className="space-y-6">
      <ProfileForm name={userName} />
      <PasswordForm />
      <DangerZone email={userEmail} />
    </div>
  );
}

function ProfileForm({ name }: { name: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your display name</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateProfileAction} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={name} required />
          </div>
          <Button type="submit" size="sm">Save changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordForm() {
  const [state, formAction, isPending] = useActionState<
    { error?: string } | null,
    FormData
  >(changePasswordAction, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Change your password</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" name="newPassword" type="password" required />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Updating..." : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DangerZone({ email }: { email: string }) {
  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>Permanently delete your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={deleteAccountAction} className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This will permanently delete your account for{" "}
            <span className="font-medium">{email}</span> and all associated data.
            This action cannot be undone.
          </p>
          <Button type="submit" variant="destructive" size="sm">
            Delete account
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

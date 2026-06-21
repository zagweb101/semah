"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { inviteMemberAction } from "@/lib/actions/organizations";

export function InviteMemberForm({ orgId }: { orgId: string }) {
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [_state, formAction, isPending] = useActionState(
    async (_prev: null, formData: FormData) => {
      const email = formData.get("email") as string;
      await inviteMemberAction(orgId, email, role);
      return null;
    },
    null,
  );

  return (
    <form action={formAction} className="flex items-end gap-3">
      <div className="flex-1 space-y-2">
        <Label htmlFor="invite-email">Email</Label>
        <Input
          id="invite-email"
          name="email"
          type="email"
          placeholder="teammate@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select value={role} onValueChange={(v) => setRole(v as "ADMIN" | "MEMBER")}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MEMBER">Member</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Inviting..." : "Invite"}
      </Button>
    </form>
  );
}

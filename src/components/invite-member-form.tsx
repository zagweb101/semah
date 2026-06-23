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
import { inviteMemberAction, type InviteState } from "@/lib/actions/organizations";

export function InviteMemberForm({ orgId }: { orgId: string }) {
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [state, formAction, isPending] = useActionState<InviteState, FormData>(
    async (_prev, formData) => {
      const email = formData.get("email") as string;
      return inviteMemberAction(orgId, email, role);
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex items-end gap-3">
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
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.message && <p className="text-sm text-success">{state.message}</p>}
    </form>
  );
}

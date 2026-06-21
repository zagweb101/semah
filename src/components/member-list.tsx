"use client";

import { Button } from "@/components/ui/button";
import { removeMemberAction } from "@/lib/actions/organizations";

type Member = {
  id: string;
  userId: string;
  name: string;
  role: string;
};

export function MemberList({
  orgId,
  members,
  canManage,
  currentUserId,
}: {
  orgId: string;
  members: Member[];
  canManage: boolean;
  currentUserId: string;
}) {
  return (
    <ul className="divide-y divide-border">
      {members.map((m) => (
        <li key={m.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium">{m.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {m.role.toLowerCase()}
            </p>
          </div>
          {canManage && m.userId !== currentUserId && (
            <form
              action={async () => {
                await removeMemberAction(orgId, m.userId);
              }}
            >
              <Button type="submit" variant="destructive" size="sm">
                Remove
              </Button>
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}

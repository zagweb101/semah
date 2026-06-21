"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrganizationAction } from "@/lib/actions/organizations";

export function CreateOrgForm() {
  const [_state, formAction, isPending] = useActionState(
    async (_prev: null, formData: FormData) => {
      await createOrganizationAction(formData);
      return null;
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="org-name">Team name</Label>
        <Input id="org-name" name="name" placeholder="Acme Inc." required />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating..." : "Create team"}
      </Button>
    </form>
  );
}

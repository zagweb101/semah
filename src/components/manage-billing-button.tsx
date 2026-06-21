"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createPortalAction } from "@/lib/actions/stripe";

export function ManageBillingButton() {
  const [_state, formAction, isPending] = useActionState(
    async () => {
      await createPortalAction();
      return null;
    },
    null,
  );

  return (
    <form action={formAction}>
      <Button type="submit" variant="outline" disabled={isPending}>
        {isPending ? "Loading..." : "Manage billing"}
      </Button>
    </form>
  );
}

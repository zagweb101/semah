"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createProjectAction } from "@/lib/actions/projects";

interface Org { id: string; name: string; slug: string; }

export function NewProjectForm({ organizations }: { organizations: Org[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [orgId, setOrgId] = useState(organizations[0]?.id ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameAr.trim()) { toast.error("الرجاء إدخال الاسم العربي"); return; }
    if (!orgId) { toast.error("الرجاء اختيار مساحة العمل"); return; }
    startTransition(async () => {
      const result = await createProjectAction({ organizationId: orgId, nameAr: nameAr.trim(), nameEn: nameEn.trim() || undefined });
      if (result && "error" in result) { toast.error(result.error); return; }
      toast.success("تم إنشاء المشروع");
      router.push(`/dashboard/projects/${result!.projectId}/brief`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {organizations.length > 1 && (
        <div className="space-y-2">
          <Label htmlFor="org">مساحة العمل</Label>
          <select id="org" value={orgId} onChange={(e) => setOrgId(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
            {organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="nameAr">الاسم العربي <span className="text-danger">*</span></Label>
        <Input id="nameAr" value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="مثال: سِمَة" required maxLength={100} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nameEn">الاسم الإنجليزي (اختياري)</Label>
        <Input id="nameEn" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="e.g., SEMAH" dir="ltr" maxLength={100} />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" nativeButton={false} onClick={() => router.back()}>إلغاء</Button>
        <Button type="submit" disabled={isPending}>{isPending ? "جارٍ الإنشاء..." : "إنشاء المشروع"}</Button>
      </div>
    </form>
  );
}

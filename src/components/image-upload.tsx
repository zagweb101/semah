"use client";

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { toast } from "sonner";

export function ImageUpload({
  onUploadComplete,
  endpoint = "imageUploader",
}: {
  onUploadComplete: (url: string) => void;
  endpoint?: keyof OurFileRouter;
}) {
  return (
    <div>
      <UploadButton<OurFileRouter, typeof endpoint>
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          if (res?.[0]?.url) {
            onUploadComplete(res[0].url);
            toast.success("Upload complete!");
          }
        }}
        onUploadError={(error) => {
          toast.error(`Upload failed: ${error.message}`);
        }}
        className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:rounded-lg ut-button:px-4 ut-button:py-2 ut-button:text-sm ut-label:text-muted-foreground"
      />
    </div>
  );
}

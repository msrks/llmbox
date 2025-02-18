"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as UILabel } from "@/components/ui/label";
import { Loader2, UploadIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Label } from "@/lib/db/schema";
import { useParams } from "next/navigation";
import { PageTitle } from "@/components/page-title";

export default function UploadPage() {
  console.log("UploadPage");
  const params = useParams();
  const projectId = params.projectId as string;
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedFiles.length === 0) return;

    setUploading(true);
    toast.info("Uploading images...");

    try {
      const formData = new FormData(event.currentTarget);
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("projectId", projectId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload files");
      }

      await response.json();
      toast.success("Upload completed successfully");
      setSelectedFiles([]);
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload files"
      );
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto space-y-8">
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <PageTitle>Upload Images</PageTitle>
          <Button
            type="submit"
            disabled={uploading || selectedFiles.length === 0}
            size="sm"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="mr-2 h-4 w-4" />
                Submit
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <UILabel htmlFor="label">Label</UILabel>
          <Select name="label" required>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a label" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Label.PASS}>Pass</SelectItem>
              <SelectItem value={Label.FAIL}>Fail</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div
          {...getRootProps()}
          className="flex w-full items-center justify-center"
        >
          <label
            htmlFor="files"
            className="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed py-20"
          >
            <div className="max-w-md text-center">
              {uploading ? (
                <>
                  <p className="font-semibold">Uploading Images</p>
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  <p className="text-xs text-muted-foreground">
                    Please wait while your images are being uploaded
                  </p>
                </>
              ) : selectedFiles.length > 0 ? (
                <p className="mt-2 text-sm font-semibold">
                  {selectedFiles.length}{" "}
                  {selectedFiles.length === 1 ? "file" : "files"} selected
                </p>
              ) : (
                <>
                  <div className="mx-auto max-w-min rounded-md border p-2">
                    <UploadIcon className="mx-auto h-10 w-10" />
                  </div>
                  <p className="mt-2 text-sm font-semibold">
                    Drag and drop your images here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click to browse (PNG, JPG)
                  </p>
                </>
              )}
            </div>
          </label>

          <Input
            {...getInputProps()}
            id="files"
            className="hidden"
            disabled={uploading}
          />
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      console.log("Upload successful:", data);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Upload File</h1>
        <div className="space-x-4">
          <Link href="/">
            <Button variant="outline">View Files</Button>
          </Link>
          <Link href="/chat">
            <Button variant="outline">Open Chat</Button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="file"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Choose a file
          </label>
          <Input
            id="file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="cursor-pointer"
          />
        </div>

        {error && (
          <div className="text-sm font-medium text-destructive">{error}</div>
        )}

        <Button type="submit" disabled={!file || uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </form>
    </div>
  );
}

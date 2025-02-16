"use client";

import { useState, useEffect, useCallback } from "react";
import { getFilesList, getFileDownloadUrl, getFilePreviewUrl } from "./actions";
import { useChat } from "ai/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FileInfo {
  id: number;
  name: string;
  originalName: string;
  size: number;
  mimeType: string | null;
  lastModified: Date;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
  } = useChat({
    api: "/api/chat",
  });

  const isImageFile = useCallback((mimeType: string | null) => {
    return mimeType?.startsWith("image/") || false;
  }, []);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchPreviewUrls = useCallback(async () => {
    const newPreviewUrls: Record<number, string> = {};
    for (const file of files) {
      if (isImageFile(file.mimeType)) {
        const result = await getFilePreviewUrl(file.id);
        if (!("error" in result)) {
          newPreviewUrls[file.id] = result.url;
        }
      }
    }
    setPreviewUrls(newPreviewUrls);
  }, [files, isImageFile]);

  useEffect(() => {
    fetchPreviewUrls();
  }, [fetchPreviewUrls]);

  const fetchFiles = async () => {
    try {
      setLoadingFiles(true);
      const result = await getFilesList();
      if ("error" in result) {
        setError(result.error || "Unknown error occurred");
      } else {
        setFiles(result.files);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch files");
    } finally {
      setLoadingFiles(false);
    }
  };

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

      await fetchFiles();
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId: number, originalName: string) => {
    try {
      const result = await getFileDownloadUrl(fileId);
      if ("error" in result) {
        setError(result.error || "Failed to generate download URL");
        return;
      }

      const link = document.createElement("a");
      link.href = result.url;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
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

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Files in Bucket
        </h2>
        {loadingFiles ? (
          <div className="text-muted-foreground">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="text-muted-foreground">No files found</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Original Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      {isImageFile(file.mimeType) ? (
                        <div className="relative w-16 h-16">
                          {previewUrls[file.id] ? (
                            <Image
                              src={previewUrls[file.id]}
                              alt={file.originalName}
                              fill
                              className="object-contain rounded-md"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
                              <span className="text-sm text-muted-foreground">
                                Loading...
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-md">
                          <svg
                            className="w-8 h-8 text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {file.originalName}
                    </TableCell>
                    <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
                    <TableCell>
                      {new Date(file.lastModified).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          handleDownload(file.id, file.originalName)
                        }
                      >
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto border rounded-lg p-4 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Chat</h2>

        <div className="h-[400px] overflow-y-auto space-y-4 mb-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "assistant"
                    ? "bg-muted"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleChatSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getFilesList,
  getFileDownloadUrl,
  getFilePreviewUrl,
  deleteFile,
} from "./actions";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  uploadType: string;
  lastModified: Date;
}

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});

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

  const handleDelete = async (fileId: number) => {
    if (!confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      const result = await deleteFile(fileId);
      if ("error" in result) {
        setError(result.error || "Failed to delete file");
        return;
      }
      // Refresh the file list after successful deletion
      fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Local Stack</h1>
        <div className="space-x-4">
          <Link href="/upload">
            <Button variant="outline">Upload File</Button>
          </Link>
          <Link href="/chat">
            <Button variant="outline">Open Chat</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="text-sm font-medium text-destructive">{error}</div>
      )}

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
                  <TableHead>Upload Type</TableHead>
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
                      <span className="capitalize">{file.uploadType}</span>
                    </TableCell>
                    <TableCell>
                      {new Date(file.lastModified).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="space-x-2">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            handleDownload(file.id, file.originalName)
                          }
                        >
                          Download
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(file.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

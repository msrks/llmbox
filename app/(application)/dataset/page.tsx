"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getFilesList,
  getFileDownloadUrl,
  getFilePreviewUrl,
  deleteFile,
  getCriterias,
  createCriteriaExample,
  getCriteriaExamples,
} from "./actions";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { TableView } from "./_components/table-view";
import { TileView } from "./_components/tile-view";
import { FileInfo } from "@/lib/types";
import { Criteria } from "@/lib/db/schema";
import { toast } from "sonner";

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [criterias, setCriterias] = useState<Criteria[]>([]);
  const [criteriaExamples, setCriteriaExamples] = useState<
    Record<
      number,
      Array<{
        id: number;
        criteriaId: number;
        isPositive: boolean;
        reason: string | null;
        criteriaName: string;
      }>
    >
  >({});
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const isImageFile = useCallback((mimeType: string | null) => {
    return mimeType?.startsWith("image/") || false;
  }, []);

  useEffect(() => {
    fetchFiles();
    fetchCriterias();
  }, []);

  const fetchCriterias = async () => {
    const result = await getCriterias();
    if ("error" in result) {
      toast.error(result.error);
    } else {
      setCriterias(result.criterias);
    }
  };

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

  const fetchCriteriaExamples = useCallback(async (fileId: number) => {
    const result = await getCriteriaExamples(fileId);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      setCriteriaExamples((prev) => ({
        ...prev,
        [fileId]: result.examples,
      }));
    }
  }, []);

  useEffect(() => {
    const fetchAllExamples = async () => {
      await Promise.all(files.map((file) => fetchCriteriaExamples(file.id)));
    };
    fetchAllExamples();
  }, [files, fetchCriteriaExamples]);

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

  const handleAddExample = async (data: {
    fileId: number;
    criteriaId: number;
    isPositive: boolean;
    reason: string | null;
  }) => {
    const result = await createCriteriaExample(data);
    if ("error" in result) {
      throw new Error(result.error);
    }
    // Refresh criteria examples for this file
    await fetchCriteriaExamples(data.fileId);
  };

  return (
    <div className="container mx-auto space-y-8">
      {error && (
        <div className="text-sm font-medium text-destructive">{error}</div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold tracking-tight">Dataset</h2>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loadingFiles ? (
          <div className="text-muted-foreground">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="text-muted-foreground">No files found</div>
        ) : viewMode === "list" ? (
          <TableView
            files={files}
            previewUrls={previewUrls}
            isImageFile={isImageFile}
            onDownload={handleDownload}
            onDelete={handleDelete}
            criterias={criterias}
            onAddExample={handleAddExample}
            criteriaExamples={criteriaExamples}
          />
        ) : (
          <TileView
            files={files}
            previewUrls={previewUrls}
            isImageFile={isImageFile}
            onDownload={handleDownload}
            onDelete={handleDelete}
            criterias={criterias}
            onAddExample={handleAddExample}
            criteriaExamples={criteriaExamples}
          />
        )}
      </div>
    </div>
  );
}

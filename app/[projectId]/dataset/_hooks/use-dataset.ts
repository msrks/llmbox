"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  getFilesList,
  getFileDownloadUrl,
  getFilePreviewUrl,
  deleteFile,
  getCriterias,
  createCriteriaExample,
  getCriteriaExamples,
} from "../actions";
import { FileInfo } from "@/lib/types";
import { Criteria } from "@/lib/db/schema";

type CriteriaExample = {
  id: number;
  criteriaId: number;
  isFail: boolean;
  reason: string | null;
  criteriaName: string;
};

export function useDataset(projectId: string) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [criterias, setCriterias] = useState<Criteria[]>([]);
  const [criteriaExamples, setCriteriaExamples] = useState<
    Record<number, CriteriaExample[]>
  >({});
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});

  const isImageFile = useCallback((mimeType: string | null) => {
    return mimeType?.startsWith("image/") || false;
  }, []);

  const fetchCriterias = useCallback(async () => {
    const result = await getCriterias(projectId);
    if (result.error) {
      toast.error(result.error);
    } else if (result.criterias) {
      setCriterias(result.criterias);
    }
  }, [projectId]);

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

  const fetchFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const result = await getFilesList(projectId);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.files) {
        setFiles(result.files);
        const examplesPromises = result.files.map((file) =>
          getCriteriaExamples(file.id)
        );
        const examplesResults = await Promise.all(examplesPromises);
        const examples: Record<number, CriteriaExample[]> = {};

        result.files.forEach((file, index) => {
          const exampleResult = examplesResults[index];
          if (exampleResult.examples) {
            examples[file.id] = exampleResult.examples;
          }
        });

        setCriteriaExamples(examples);
      }
    } catch {
      toast.error("Failed to fetch files");
    } finally {
      setLoadingFiles(false);
    }
  }, [projectId]);

  const handleDownload = async (fileId: number, originalName: string) => {
    try {
      const result = await getFileDownloadUrl(fileId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      const link = document.createElement("a");
      link.href = result.url;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast.error("Download failed");
    }
  };

  const handleDelete = async (fileId: number) => {
    try {
      const result = await deleteFile(fileId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("File deleted successfully");
      fetchFiles();
    } catch {
      toast.error("Failed to delete file");
    }
  };

  const handleAddExample = async (data: {
    fileId: number;
    criteriaId: number;
    isFail: boolean;
    reason: string | null;
  }) => {
    try {
      const result = await createCriteriaExample(data);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      // Refresh examples for this file
      const examplesResult = await getCriteriaExamples(data.fileId);
      if (examplesResult.examples) {
        setCriteriaExamples((prev) => ({
          ...prev,
          [data.fileId]: examplesResult.examples,
        }));
      }
      toast.success("Example added successfully");
    } catch {
      toast.error("Failed to add example");
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchCriterias();
  }, [fetchFiles, fetchCriterias]);

  useEffect(() => {
    fetchPreviewUrls();
  }, [fetchPreviewUrls]);

  return {
    files,
    criterias,
    criteriaExamples,
    loadingFiles,
    previewUrls,
    isImageFile,
    handleDownload,
    handleDelete,
    handleAddExample,
  };
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  getFileDownloadUrl,
  getFilePreviewUrl,
  deleteFile,
  getCriterias,
  createCriteriaExample,
  getFilesToCriterias,
  getFilesList,
} from "../actions";
import { FileInfo } from "@/lib/types";
import type { Criteria } from "@/lib/db/schema";

type CriteriaExampleWithMeta = {
  fileId: number;
  criteriaId: number;
  isFail: boolean;
  reason: string | null;
  criteria: {
    name: string;
    description: string | null;
  };
};

export function useDataset(projectId: string) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [criterias, setCriterias] = useState<Criteria[]>([]);
  const [filesToCriterias, setFilesToCriterias] = useState<
    Record<number, CriteriaExampleWithMeta[]>
  >({});
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingCriterias, setLoadingCriterias] = useState(true);
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});

  const isImageFile = useCallback((mimeType: string | null) => {
    return mimeType?.startsWith("image/") || false;
  }, []);

  const fetchFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const result = await getFilesList(projectId);
      if (result.files) {
        setFiles(result.files);

        // Fetch criteria examples for each file
        const examplesPromises = result.files.map((file: FileInfo) =>
          getFilesToCriterias(file.id)
        );
        const examplesResults = await Promise.all(examplesPromises);
        const examples: Record<number, CriteriaExampleWithMeta[]> = {};

        result.files.forEach((file: FileInfo, index: number) => {
          examples[file.id] = examplesResults[index].map((result) => ({
            fileId: result.fileId,
            criteriaId: result.criteriaId,
            isFail: result.isFail,
            reason: result.reason,
            criteria: {
              name: result.criteria.name,
              description: result.criteria.description,
            },
          }));
        });

        setFilesToCriterias(examples);
      }
      if (result.error) {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to fetch files");
    } finally {
      setLoadingFiles(false);
    }
  }, [projectId]);

  const fetchCriterias = useCallback(async () => {
    setLoadingCriterias(true);
    try {
      const result = await getCriterias(projectId);
      if (result.criterias) {
        setCriterias(result.criterias);
      }
      if (result.error) {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to fetch criterias");
    } finally {
      setLoadingCriterias(false);
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

  const addCriteriaExample = useCallback(
    async (data: {
      fileId: number;
      criteriaId: number;
      isFail: boolean;
      reason?: string;
    }) => {
      try {
        await createCriteriaExample(data);
        const results = await getFilesToCriterias(data.fileId);
        const mappedResults = results.map((result) => ({
          fileId: result.fileId,
          criteriaId: result.criteriaId,
          isFail: result.isFail,
          reason: result.reason,
          criteria: {
            name: result.criteria.name,
            description: result.criteria.description,
          },
        }));

        setFilesToCriterias((prev) => ({
          ...prev,
          [data.fileId]: mappedResults,
        }));

        toast.success("Added criteria example");
      } catch {
        toast.error("Failed to add criteria example");
      }
    },
    []
  );

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
    filesToCriterias,
    loadingFiles,
    loadingCriterias,
    previewUrls,
    isImageFile,
    handleDownload,
    handleDelete,
    handleAddExample: addCriteriaExample,
    fetchFiles,
  };
}

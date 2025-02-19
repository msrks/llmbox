"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  deleteFile,
  getCriterias,
  upsertFileToCriteria,
  getFilesWithCriterias,
  FilesWithCriterias,
} from "./actions";
import type { Criteria, NewFileToCriteria } from "@/lib/db/schema";

export function useDataset(projectId: string) {
  const [criterias, setCriterias] = useState<Criteria[]>([]);
  const [filesWithCriterias, setFilesWithCriterias] =
    useState<FilesWithCriterias>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingCriterias, setLoadingCriterias] = useState(true);

  const isImageFile = useCallback((mimeType: string | null) => {
    return mimeType?.startsWith("image/") || false;
  }, []);

  const fetchFiles = useCallback(async () => {
    setLoadingFiles(true);
    setFilesWithCriterias(await getFilesWithCriterias(projectId));
    setLoadingFiles(false);
  }, [projectId]);

  const fetchCriterias = useCallback(async () => {
    setLoadingCriterias(true);
    setCriterias(await getCriterias(projectId));
    setLoadingCriterias(false);
  }, [projectId]);

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

  const upsertFile2Criteria = useCallback(
    async (data: NewFileToCriteria) => {
      try {
        await upsertFileToCriteria(data);
        fetchFiles();
        toast.success("Added criteria example");
      } catch {
        toast.error("Failed to add criteria example");
      }
    },
    [fetchFiles]
  );

  useEffect(() => {
    fetchFiles();
    fetchCriterias();
  }, [fetchFiles, fetchCriterias]);

  return {
    criterias,
    filesWithCriterias,
    loadingFiles,
    loadingCriterias,
    isImageFile,
    handleDelete,
    upsertFile2Criteria,
    fetchFiles,
  };
}

export type Dataset = Awaited<ReturnType<typeof useDataset>>;

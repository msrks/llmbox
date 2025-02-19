"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getPresignedUrl } from "../actions";

interface FilePreviewProps {
  fileId: number;
  fileName: string;
  mimeType: string | null;
  className?: string;
}

export function FilePreview({
  fileId,
  fileName,
  mimeType,
  className = "",
}: FilePreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isImage = mimeType?.startsWith("image/") || false;

  useEffect(() => {
    if (!isImage) return;

    let mounted = true;
    const loadUrl = async () => {
      try {
        const presignedUrl = await getPresignedUrl(fileId);
        if (mounted) {
          setUrl(presignedUrl);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load presigned URL:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUrl();
    return () => {
      mounted = false;
    };
  }, [fileId, isImage]);

  if (!isImage) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-md ${className}`}
      >
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
    );
  }

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-md ${className}`}
      >
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!url) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-md ${className}`}
      >
        <span className="text-sm text-muted-foreground">Failed to load</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={url}
        alt={fileName}
        fill
        className="object-contain rounded-md"
      />
    </div>
  );
}
